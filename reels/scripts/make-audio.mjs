// Synthesises the music bed and the transition sound effects, in code.
// Nothing is downloaded and nothing is licensed: the track is original and
// free to use. Output: out/tmp/music.wav and out/tmp/sfx.wav (44.1 kHz stereo).
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const SR = 44100;
const DUR = 15;
const N = SR * DUR;
const BPM = 120;
const BEAT = 60 / BPM;
const tl = JSON.parse(readFileSync(new URL('../src/timeline.json', import.meta.url)));

const buf = () => [new Float32Array(N), new Float32Array(N)];
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function add(out, t, len, fn, pan = 0) {
  const s0 = Math.floor(t * SR);
  const n = Math.floor(len * SR);
  const l = Math.cos(((pan + 1) * Math.PI) / 4);
  const r = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const v = fn(i / SR, i);
    out[0][s0 + i] += v * l * 1.414;
    out[1][s0 + i] += v * r * 1.414;
  }
}

const kick = (out, t, g = 1) => {
  let ph = 0;
  add(out, t, 0.32, (x) => {
    const f = 46 + 130 * Math.exp(-x * 38);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-x * 9) * g + rnd() * 0.25 * Math.exp(-x * 300) * g;
  });
};
const clap = (out, t, g = 0.5) => {
  let lp = 0;
  add(out, t, 0.22, (x) => {
    const n = rnd();
    lp += 0.35 * (n - lp);
    const env = Math.exp(-x * 22) * (1 + 0.8 * Math.sin(x * 420) ** 2 * (x < 0.03 ? 1 : 0));
    return (n - lp) * env * g;
  });
};
const hat = (out, t, g = 0.16, pan = 0.25) => {
  let prev = 0;
  add(out, t, 0.06, (x) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-x * 90) * g;
  }, pan);
};
const bass = (out, t, len, note, g = 0.42) => {
  const f = midi(note);
  let lp = 0;
  add(out, t, len, (x) => {
    const ph = (x * f) % 1;
    const saw = 2 * ph - 1;
    const sub = Math.sin(2 * Math.PI * f * x);
    const cut = 0.04 + 0.22 * Math.exp(-x * 14);
    lp += cut * (saw - lp);
    const env = Math.min(1, x * 200) * Math.min(1, (len - x) * 60);
    return (lp * 0.6 + sub * 0.7) * env * g;
  });
};
const pluck = (out, t, notes, g = 0.11) => {
  notes.forEach((note, k) => {
    const f = midi(note);
    let lp = 0;
    add(out, t, 0.5, (x) => {
      const a = ((x * f * 1.004) % 1) * 2 - 1;
      const b = ((x * f * 0.996) % 1) * 2 - 1;
      const cut = 0.05 + 0.5 * Math.exp(-x * 16);
      lp += cut * ((a + b) * 0.5 - lp);
      return lp * Math.exp(-x * 7) * Math.min(1, x * 400) * g;
    }, (k - 1) * 0.5);
  });
};
const noiseSweep = (out, t, len, g, up = true) => {
  let lp = 0;
  add(out, t, len, (x) => {
    const p = up ? x / len : 1 - x / len;
    const cut = 0.01 + 0.6 * p ** 3;
    lp += cut * (rnd() - lp);
    return lp * p ** 2 * g;
  });
};
const impact = (out, t, g = 0.9) => {
  let ph = 0;
  add(out, t, 1.2, (x) => {
    ph += (2 * Math.PI * (34 + 60 * Math.exp(-x * 14))) / SR;
    return (Math.sin(ph) * Math.exp(-x * 3.2) + rnd() * 0.3 * Math.exp(-x * 30)) * g;
  });
};

// ---------- music: A minor, 120 BPM (one beat = 15 frames) ----------
const music = buf();
const chords = [
  {root: 33, notes: [57, 60, 64]}, // Am
  {root: 29, notes: [57, 60, 65]}, // F
  {root: 36, notes: [55, 60, 64]}, // C
  {root: 31, notes: [55, 59, 62]}, // G
];
const DROP = 4; // beats of intro before the full groove
const LAST = 28; // final hit on beat 28 (14.0 s)
for (let b = 0; b < LAST; b++) {
  const t = b * BEAT;
  const ch = chords[Math.floor(b / 4) % 4];
  const full = b >= DROP;
  // plucks: syncopated pattern every bar
  for (const o of [0, 0.75]) if ((b % 2 === 0 || o === 0.75)) pluck(music, t + o * BEAT, ch.notes, full ? 0.11 : 0.07);
  hat(music, t + BEAT / 2, full ? 0.2 : 0.1);
  if (full) {
    kick(music, t, 0.95);
    hat(music, t, 0.08, -0.2);
    hat(music, t + BEAT * 0.75, 0.07, 0.4);
    if (b % 2 === 1) clap(music, t, 0.5);
    bass(music, t + BEAT / 2, BEAT * 0.42, ch.root);
    if (b % 4 === 3) bass(music, t + BEAT * 0.75, BEAT * 0.22, ch.root + 12, 0.3);
  }
}
noiseSweep(music, (DROP - 2) * BEAT, 2 * BEAT, 0.5); // riser into the drop
noiseSweep(music, (LAST - 2) * BEAT, 2 * BEAT, 0.4); // riser into the last hit
impact(music, DROP * BEAT, 0.7);
impact(music, LAST * BEAT, 0.9);
pluck(music, LAST * BEAT, [57, 60, 64, 69], 0.2);

// ---------- sfx: whoosh on every cut ----------
const sfx = buf();
tl.scenes.slice(1).forEach((s, i) => {
  const t = s.from / tl.fps;
  noiseSweep(sfx, t - 0.16, 0.16, 0.55, true);
  noiseSweep(sfx, t, 0.22, 0.4, false);
  if (i === 0 || s.id === 'outro') impact(sfx, t, 0.35);
});

function writeWav(path, ch, gain) {
  const data = Buffer.alloc(44 + N * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    const fade = Math.min(1, (N - i) / (SR * 0.25));
    for (let c = 0; c < 2; c++) {
      const v = Math.tanh(ch[c][i] * gain) * fade;
      data.writeInt16LE(Math.round(v * 32000), 44 + i * 4 + c * 2);
    }
  }
  writeFileSync(path, data);
}
mkdirSync(new URL('../out/tmp/', import.meta.url), {recursive: true});
writeWav(new URL('../out/tmp/music.wav', import.meta.url), music, 0.9);
writeWav(new URL('../out/tmp/sfx.wav', import.meta.url), sfx, 0.9);
console.log('music.wav + sfx.wav written');
