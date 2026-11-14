// Synthesises the music bed and the transition sound effects, in code.
// Nothing is downloaded and nothing is licensed: the track is original and
// free to use. Output: out/tmp/<id>-music.wav and out/tmp/<id>-sfx.wav
// (44.1 kHz stereo).   node scripts/make-audio.mjs configs/feeha.json
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const cfg = JSON.parse(readFileSync(process.argv[2]));
const tl = JSON.parse(readFileSync(cfg.timeline));
const TR = cfg.music?.transpose ?? 0;
const SR = 44100;
const DUR = tl.totalFrames / tl.fps;
const N = SR * DUR;
const BPM = 120;
const BEAT = 60 / BPM;

const buf = () => [new Float32Array(N), new Float32Array(N)];
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const midi = (n) => 440 * 2 ** ((n + TR - 69) / 12);

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

// ---------- music (120 BPM: one beat = 15 frames) ----------
// Full groove starts on the beat nearest the first cut; final hit 1 s before the end.
const music = buf();
const DROP = Math.max(2, Math.round(tl.scenes[1].from / (tl.fps * BEAT)));
const LAST = Math.floor(DUR / BEAT) - 2;
const STYLE = cfg.music?.style ?? 'pluck';

// Electric-piano voice: a few sine partials, bright attack, soft tremolo.
const keys = (out, t, len, notes, g = 0.08) => {
  notes.forEach((note, k) => {
    const f = midi(note);
    add(out, t, len, (x) => {
      const env = Math.min(1, x * 300) * Math.exp(-x * 2.2) * Math.min(1, (len - x) * 30);
      const bell = Math.sin(2 * Math.PI * f * 2 * x + Math.sin(2 * Math.PI * f * x) * 1.6 * Math.exp(-x * 9));
      const v = Math.sin(2 * Math.PI * f * x) + 0.35 * bell * Math.exp(-x * 6) + 0.12 * Math.sin(2 * Math.PI * f * 3 * x) * Math.exp(-x * 4);
      return v * env * g * (1 + 0.15 * Math.sin(2 * Math.PI * 5 * x));
    }, (k - 1.5) * 0.35);
  });
};
const openHat = (out, t, g = 0.13) => {
  let prev = 0;
  add(out, t, 0.22, (x) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-x * 16) * g;
  }, 0.15);
};
const sub = (out, t, len, note, g = 0.5) => {
  const f = midi(note);
  add(out, t, len, (x) => {
    const env = Math.min(1, x * 150) * Math.min(1, (len - x) * 40);
    return (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(4 * Math.PI * f * x)) * env * g;
  });
};

if (STYLE === 'house') {
  // Bright deep-house groove: Fmaj7 - Em7 - Dm7 - Cmaj7.
  const prog = [
    {root: 29, notes: [57, 60, 64, 65]},
    {root: 28, notes: [55, 59, 62, 64]},
    {root: 26, notes: [53, 57, 60, 62]},
    {root: 24, notes: [52, 55, 59, 60]},
  ];
  for (let b = 0; b < LAST; b++) {
    const t = b * BEAT;
    const ch = prog[Math.floor(b / 4) % 4];
    const full = b >= DROP;
    // piano stabs: on the beat at the start of each bar, then syncopated
    if (b % 4 === 0) keys(music, t, BEAT * 1.4, ch.notes, 0.085);
    if (b % 4 === 1) keys(music, t + BEAT * 0.5, BEAT * 0.9, ch.notes, 0.07);
    if (b % 4 === 2) keys(music, t + BEAT * 0.75, BEAT * 1.1, ch.notes, 0.075);
    kick(music, t, full ? 1 : 0.8);
    openHat(music, t + BEAT / 2, full ? 0.14 : 0.08);
    if (full) {
      hat(music, t + BEAT * 0.25, 0.05, -0.3);
      hat(music, t + BEAT * 0.75, 0.06, 0.3);
      if (b % 2 === 1) clap(music, t, 0.45);
      sub(music, t + BEAT / 2, BEAT * 0.4, ch.root + 12);
      if (b % 4 === 3) sub(music, t + BEAT * 0.75, BEAT * 0.2, ch.root + 24, 0.3);
    }
  }
  noiseSweep(music, (DROP - 2) * BEAT, 2 * BEAT, 0.45);
  impact(music, DROP * BEAT, 0.6);
  impact(music, LAST * BEAT, 0.8);
  keys(music, LAST * BEAT, 1.0, [53, 57, 60, 64, 69], 0.11);

  // Before the drop the track sounds muffled, as if behind a wall; the filter
  // opens on the drop (one-pole low-pass with a moving cut-off).
  const dropS = DROP * BEAT * SR;
  for (const ch of music) {
    let y = 0;
    for (let i = 0; i < N; i++) {
      const open = Math.min(1, Math.max(0, (i - (dropS - SR * 0.5)) / (SR * 0.5)));
      const fc = 380 * Math.pow(18000 / 380, open);
      const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
      y += a * (ch[i] - y);
      ch[i] = i < dropS ? y * 0.75 : ch[i];
    }
  }
  // headroom: keep the bed clean (it is levelled again in the final mix)
  for (const ch of music) for (let i = 0; i < N; i++) ch[i] *= 0.5;
} else {
const chords = [
  {root: 33, notes: [57, 60, 64]}, // Am
  {root: 29, notes: [57, 60, 65]}, // F
  {root: 36, notes: [55, 60, 64]}, // C
  {root: 31, notes: [55, 59, 62]}, // G
];
// Full groove starts on the beat nearest the first cut; final hit 1 s before the end.
const DROP = Math.max(2, Math.round(tl.scenes[1].from / (tl.fps * BEAT)));
const LAST = Math.floor(DUR / BEAT) - 2;
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
}

// ---------- sfx: whoosh on every cut ----------
const sfx = buf();
tl.scenes.slice(1).forEach((s, i) => {
  const t = s.from / tl.fps;
  noiseSweep(sfx, t - 0.16, 0.16, 0.55, true);
  noiseSweep(sfx, t, 0.22, 0.4, false);
  if (i === 0 || s.id === 'outro') impact(sfx, t, 0.35);
});

// ---------- sfx: messaging sounds for the opening chat (config "chat") ----------
// Original sounds in the spirit of a phone messaging app (not Apple's files).
const sendSound = (t) => {
  let lp = 0;
  add(sfx, t - 0.02, 0.16, (x) => {
    const p = x / 0.16;
    lp += (0.05 + 0.5 * p) * (rnd() - lp);
    return lp * Math.sin(Math.PI * p) * 0.5;
  }, 0.2);
  add(sfx, t + 0.04, 0.12, (x) => {
    const f = 900 + 700 * Math.min(1, x / 0.05);
    return Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 30) * 0.32;
  }, 0.2);
};
const receiveSound = (t) => {
  [[1175, 0], [1568, 0.1]].forEach(([f, d]) =>
    add(sfx, t + d, 0.5, (x) => {
      const env = Math.min(1, x * 600) * Math.exp(-x * 7);
      return (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * x) * Math.exp(-x * 20)) * env * 0.3;
    }, -0.15),
  );
};
const keyTaps = (tEnd, n) => {
  let t = tEnd - 0.08;
  for (let k = 0; k < n; k++) {
    t -= 0.055 + Math.abs(rnd()) * 0.04;
    let prev = 0;
    add(sfx, t, 0.03, (x) => {
      const v = rnd();
      const hp = v - prev;
      prev = v;
      return (hp * 0.5 + Math.sin(2 * Math.PI * 2200 * x) * 0.3) * Math.exp(-x * 260) * 0.45;
    }, 0.1 * (k % 2 ? 1 : -1));
  }
};
if (cfg.chat) {
  const hook = tl.scenes[0];
  const len = hook.to - hook.from;
  const time = (share) => (hook.from + Math.round(share * len)) / tl.fps;
  cfg.chat.messages.forEach((m, i) => {
    if (m.type === 'sent') {
      if (m.at > 0) keyTaps(time(m.at), Math.min(9, 3 + Math.round(m.text.length / 6)));
      sendSound(time(m.at));
    }
    if (m.type === 'received') receiveSound(time(m.at));
  });
}

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
mkdirSync('out/tmp', {recursive: true});
writeWav(`out/tmp/${cfg.id}-music.wav`, music, 0.9);
writeWav(`out/tmp/${cfg.id}-sfx.wav`, sfx, 0.9);
console.log(`out/tmp/${cfg.id}-music.wav + sfx written (${DUR}s)`);
