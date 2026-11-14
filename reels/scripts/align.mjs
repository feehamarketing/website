// Builds src/timeline.json (word timings + scene cuts) from the voice-over file.
// Word timings come from the real audio: pauses are detected with FFmpeg and
// the script's punctuation is anchored on them; words in between are spread
// over the voiced time in proportion to their length.
//
//   node scripts/align.mjs configs/feeha.json voice.mp3   -> real timings
//   node scripts/align.mjs configs/feeha.json --draft     -> estimated timings (layout tests only)
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const FPS = 30;
const cfgPath = process.argv[2];
const arg = process.argv[3];
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
const weight = (t) =>
  t.replace(/[^\p{L}\p{N}]/gu, '').replace(/\d/g, 'xxxxx').length +
  1.5 +
  (/\p{L}\.\p{L}/u.test(t) ? 6 : 0);
const endsClause = (t) => /[?!.,;:]$/.test(t);

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

// 2) anchor clause ends on the nearest real pause
const anchors = [{idx: -1, end: speechStart, next: speechStart}];
const used = new Set();
tokens.forEach((t, i) => {
  if (!endsClause(t) || i === tokens.length - 1) return;
  let best = null;
  inner.forEach((s, k) => {
    if (used.has(k) || s.end - s.start < 0.15) return;
    const d = Math.abs(s.start - guess[i].b);
    if (d < 0.6 && (!best || d < best.d)) best = {k, d};
  });
  if (best && inner[best.k].start > anchors[anchors.length - 1].next) {
    used.add(best.k);
    anchors.push({idx: i, end: inner[best.k].start, next: inner[best.k].end});
  }
});
anchors.push({idx: tokens.length - 1, end: speechEnd, next: speechEnd});

// 3) inside each anchored span, spread words over that span's voiced time
const words = [];
for (let a = 1; a < anchors.length; a++) {
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

const f = (s) => Math.round(s * FPS);
if (cfg.tailSeconds) TOTAL_FRAMES = Math.min(cfg.totalFrames, f(speechEnd + cfg.tailSeconds));

// Scene cuts: each scene starts slightly before its first word.
const scenes = cfg.scenes.map((sc) => {
  const i = tokens.findIndex((t, k) => k >= (sc.after ?? 0) && t.toLowerCase().startsWith(sc.startsAt.toLowerCase()));
  if (i < 0) throw new Error('scene word not found: ' + sc.startsAt);
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
  words,
  scenes,
};
writeFileSync(cfg.timeline, JSON.stringify(out, null, 1));
console.log(`voice ${duration.toFixed(2)}s, ${words.length} words, ${inner.length} pauses, ${anchors.length - 2} anchored`);
console.log(scenes.map((s) => `${s.id}:${s.from}-${s.to}`).join('  '));
if (duration > TOTAL_FRAMES / FPS - 0.2) console.warn('WARNING: voice-over is longer than the reel');
