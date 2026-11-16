// Builds src/timeline.json (word timings + scene cuts) from the voice-over file.
// Word timings come from the real audio: pauses are detected with FFmpeg and
// the script's punctuation is anchored on them; words in between are spread
// over the voiced time in proportion to their length.
//
//   node scripts/align.mjs configs/feeha.json voice.mp3   -> real timings
//   node scripts/align.mjs configs/feeha.json --draft     -> estimated timings (layout tests only)
//   node scripts/align.mjs configs/feeha.json voice.mp3 words.json
//        -> exact word timings from scripts/forced-align.py are used as-is
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const FPS = 30;
const cfgPath = process.argv[2];
const arg = process.argv[3];
const exactWords = process.argv[4] ? JSON.parse(readFileSync(process.argv[4])) : null;
if (!cfgPath || !arg) throw new Error('usage: align.mjs <config.json> <voice file | --draft>');
const cfg = JSON.parse(readFileSync(cfgPath));
// With "tailSeconds" the reel ends that long after the last word
// (never longer than totalFrames); otherwise it is exactly totalFrames.
let TOTAL_FRAMES = cfg.totalFrames;

const tokens = cfg.script
  .split(/\s+/)
  .reduce((acc, t) => {
    if (/^[?!:;.,]+$/.test(t) && acc.length) acc[acc.length - 1] += ' ' + t;
    else acc.push(t);
    return acc;
  }, []);

// Spoken length of a token: digits are read out as whole words.
// A web address such as feeha.ca is read out as "feeha dot C A".
// Spoken length of a token, in syllables of what is actually said
// ("spokenAs" in the config: digits, addresses, initials...).
const syllables = (text) =>
  text
    .toLowerCase()
    .split(/[^\p{L}']+/u)
    .filter(Boolean)
    .reduce((n, w) => {
      const groups = (w.match(/[aeiouyàâäéèêëîïôöûùü]+/g) || []).length;
      // mute final e / es / ent (French) in words of 2+ vowel groups
      const mute = groups > 1 && /[^aeiouy](e|es|ent)$/.test(w) && !/ment$/.test(w) ? 1 : 0;
      return n + Math.max(1, groups - mute);
    }, 0);
const spokenFor = (t) => {
  const core = t.replace(/[\s\u00A0]*[?!.,:;]+$/u, '');
  if (cfg.spokenAs?.[core]) return cfg.spokenAs[core];
  if (/^(\p{L}\.)+$/u.test(core + '.')) return core.split('.').filter(Boolean).join(' '); // initials
  if (/\p{L}\.\p{L}/u.test(core)) return core.replace(/\./g, ' dot '); // web address
  return core.replace(/\d/g, ' un ');
};
const weight = (t) => syllables(spokenFor(t)) + 0.6;
// "M.A."-style initials end in a dot but do not end a clause.
const endsClause = (t) => /[?!.,;:]$/.test(t) && !/^(\p{L}\.)+$/u.test(t);

let duration;
let silences = [];
if (arg === '--draft') {
  duration = cfg.draftVoiceDuration;
  // fake pauses after each punctuation mark, for layout tests
} else {
  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arg,
  ]).toString();
  duration = parseFloat(probe);
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', arg, '-af', 'silencedetect=noise=-34dB:d=0.12', '-f', 'null', '-'],
    {encoding: 'utf8'},
  );
  const starts = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  silences = starts.map((s, i) => ({start: s, end: ends[i] ?? duration}));
}

const speechStart = silences[0] && silences[0].start < 0.05 ? silences[0].end : 0;
const last = silences[silences.length - 1];
const speechEnd = last && last.end > duration - 0.05 ? last.start : duration;
const inner = silences.filter((s) => s.start > speechStart + 0.05 && s.end < speechEnd - 0.05);

// voiced-time <-> real-time mapping (skips pauses)
const voicedTotal = speechEnd - speechStart - inner.reduce((a, s) => a + s.end - s.start, 0);
const toReal = (v) => {
  let t = speechStart + v;
  for (const s of inner) {
    if (t >= s.start) t += s.end - s.start;
    else break;
  }
  return t;
};

const weights = tokens.map(weight);
const totalW = weights.reduce((a, b) => a + b, 0);

// 1) first guess: spread over voiced time
let cum = 0;
const guess = tokens.map((t, i) => {
  const a = toReal((cum / totalW) * voicedTotal);
  cum += weights[i];
  return {a, b: toReal((cum / totalW) * voicedTotal - 1e-4)};
});

// 2) anchor clause ends on real pauses. All clause ends and all pauses are
// matched at once (dynamic programming, in order): a match costs the squared
// distance between the estimated end of the clause and the pause; leaving a
// clause unmatched or a pause unused (a breath inside a sentence) has a fixed
// cost, higher for long pauses.
const clauses = tokens.map((t, i) => i).filter((i) => endsClause(tokens[i]) && i < tokens.length - 1);
const P = inner;

// "pins" in the config fix a clause end on a given pause when the estimate is
// ambiguous: [{"word": "nez", "at": 6.23}] = the clause ending in the word
// that starts with "nez" ends at the pause nearest 6.23 s (checked by ear or
// with a pitch/rate analysis).
const pinCost = (tok, b) => {
  const pin = (cfg.pins ?? []).find((p) => tok.toLowerCase().startsWith(p.word.toLowerCase()));
  if (!pin) return 0;
  const nearest = P.reduce((m, p, k) => (Math.abs(p.start - pin.at) < Math.abs(P[m].start - pin.at) ? k : m), 0);
  return b === nearest ? -100 : 100;
};
const SKIP_CLAUSE = 1.0;
const skipPause = (p) => 0.12 + 1.5 * (p.end - p.start);
const D = Array.from({length: clauses.length + 1}, () => new Array(P.length + 1).fill(Infinity));
const B = Array.from({length: clauses.length + 1}, () => new Array(P.length + 1).fill(null));
D[0][0] = 0;
for (let a = 0; a <= clauses.length; a++) {
  for (let b = 0; b <= P.length; b++) {
    if (a === 0 && b === 0) continue;
    const opts = [];
    if (a > 0) opts.push([D[a - 1][b] + SKIP_CLAUSE, 'c']);
    if (b > 0) opts.push([D[a][b - 1] + skipPause(P[b - 1]), 'p']);
    if (a > 0 && b > 0)
      opts.push([D[a - 1][b - 1] + (guess[clauses[a - 1]].b - P[b - 1].start) ** 2 + pinCost(tokens[clauses[a - 1]], b - 1), 'm']);
    for (const [c, k] of opts) if (c < D[a][b]) [D[a][b], B[a][b]] = [c, k];
  }
}
const matched = [];
for (let a = clauses.length, b = P.length; a > 0 || b > 0; ) {
  const k = B[a][b];
  if (k === 'm') matched.unshift({idx: clauses[a - 1], end: P[b - 1].start, next: P[b - 1].end});
  if (k === 'm' || k === 'c') a--;
  if (k === 'm' || k === 'p') b--;
}
const anchors = [{idx: -1, end: speechStart, next: speechStart}, ...matched];
anchors.push({idx: tokens.length - 1, end: speechEnd, next: speechEnd});

// 3) inside each anchored span, spread words over that span's voiced time
let words = [];
for (let a = 1; a < anchors.length && !exactWords; a++) {
  const from = anchors[a - 1].idx + 1;
  const to = anchors[a].idx;
  const t0 = anchors[a - 1].next;
  const t1 = anchors[a].end;
  const gaps = inner.filter((s) => s.start >= t0 && s.end <= t1);
  const voiced = t1 - t0 - gaps.reduce((x, s) => x + s.end - s.start, 0);
  const real = (v) => {
    let t = t0 + v;
    for (const s of gaps) if (t >= s.start) t += s.end - s.start;
    return t;
  };
  const w = weights.slice(from, to + 1);
  const sum = w.reduce((x, y) => x + y, 0);
  let c = 0;
  for (let i = from; i <= to; i++) {
    const start = real((c / sum) * voiced);
    c += w[i - from];
    const end = i === to ? t1 : real((c / sum) * voiced - 1e-4);
    words.push({text: tokens[i], start: +start.toFixed(3), end: +end.toFixed(3)});
  }
}

if (exactWords) {
  if (exactWords.length !== tokens.length) throw new Error('word list does not match the script');
  words = exactWords;
}
const f = (s) => Math.round(s * FPS);
if (cfg.tailSeconds) TOTAL_FRAMES = Math.min(cfg.totalFrames, f(speechEnd + cfg.tailSeconds));

// Scene cuts: each scene starts slightly before its first word.
// Scenes are looked up in order: each one starts at the first matching word
// after the previous scene's start.
let prev = -1;
const scenes = cfg.scenes.map((sc) => {
  const i = tokens.findIndex(
    (t, k) => k > prev && k >= (sc.after ?? 0) && t.toLowerCase().startsWith(sc.startsAt.toLowerCase()),
  );
  if (i < 0) throw new Error('scene word not found: ' + sc.startsAt);
  prev = i;
  return {id: sc.id, from: Math.max(0, f(words[i].start) - 3)};
});
scenes[0].from = 0;
scenes.forEach((s, i) => (s.to = i < scenes.length - 1 ? scenes[i + 1].from : TOTAL_FRAMES));

const out = {
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  draft: arg === '--draft',
  voiceDuration: +duration.toFixed(3),
  pausesDetected: inner.length,
  anchorsUsed: anchors.length - 2,
  timing: exactWords ? 'forced-alignment' : arg === '--draft' ? 'draft' : 'pauses',
  words,
  scenes,
};
writeFileSync(cfg.timeline, JSON.stringify(out, null, 1));
console.log(`voice ${duration.toFixed(2)}s, ${words.length} words, timing: ${out.timing}`);
console.log(scenes.map((s) => `${s.id}:${s.from}-${s.to}`).join('  '));
if (duration > TOTAL_FRAMES / FPS - 0.2) console.warn('WARNING: voice-over is longer than the reel');
