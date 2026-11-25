# « Le plat invisible » (flashback cut): groove now → tape-stop rewind → tense flashback → click → groove back. → public/plat-mix-raw.wav
import os, sys, json
import numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress
REELS = '/home/claude/website/reels'
TL = json.load(open(f'{REELS}/src/plat/timeline.json')); L = TL['lines']; DUR = TL['dur']; N = int(DUR * SR)
CLICK = L['l07'] + .45; FB = 2.7; CARD = 20.4
CUTS = [1.4, 2.7, 4.0, 5.3, 7.2, 10.9, 11.55, 12.2, 12.85, 13.5, 15.8, 17.2, 20.4]
S.seed(3); np.random.seed(3)
VO = os.environ.get('VO')
def load(p):
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
vo = np.zeros((N, 2), np.float32)
def voice(x, at): add(vo, compress(hp(x, 80) / (np.abs(x).max() + 1e-9) * .9, thr=.3, ratio=3), at, .75, 0)
if VO: voice(load(VO), 0)
else:
    for k, at in L.items(): voice(load(f'/home/claude/plat/vo3/{k}.wav'), at)
vm = (np.abs(vo).sum(1) > 1e-3).astype(float); kk = int(.25 * SR); duck = 1 - .5 * np.clip(np.convolve(vm, np.ones(kk) / kk, mode='same'), 0, 1)

mus = np.zeros((N, 2), np.float32); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan, 1.0))
def kick(): d = .35; tt = t_(d); f = 50 + 110 * np.exp(-tt / .04); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12)
def hat(): d = .06; return hp(noise(d), 7000) * env_exp(d, .012)
def clap(): d = .25; return sum(np.roll(bp(noise(d), 900, 3000) * env_exp(d, .012), int(SR * q * .011)) for q in range(3))
B = 60 / 112
PROG = [['F2', 'C3', 'A3', 'E4'], ['C3', 'G3', 'E4', 'G4'], ['G2', 'D3', 'B3', 'D4'], ['A2', 'E3', 'C4', 'E4']]
def groove(t0, t1):
    t, i = t0, 0
    while t < t1 - .05:
        for j, p in enumerate(PROG[i % 4]): n(t + j * .01, 'piano', p, min(B * 4, t1 - t), .26, .1)
        for b in range(4):
            tb = t + b * B
            if tb < t1 - .05: n(tb, 'electric_bass', PROG[i % 4][0], B * .8, .5)
        t += B * 4; i += 1
    t, i = t0, 0
    while t < t1 - .05:
        add(mus, kick() if i % 2 == 0 else clap(), t, .55 if i % 2 == 0 else .25, 0); add(mus, hat(), t + B / 2, .06, .25); t += B; i += 1
# now: groove, then the tape stops into the flashback
groove(0, FB - .05)
# flashback: drone + heartbeat + ticks, rising to the click
dd = CLICK - FB; tt = t_(dd)
drone = (np.sin(2 * np.pi * 49 * tt) * .5 + np.sin(2 * np.pi * 73.4 * tt) * .25 + lp(noise(dd), 200) * .4) * np.minimum(1, tt / .8) * (.6 + .4 * tt / dd)
add(mus, drone, FB, .16, 0)
for t in np.arange(FB + .3, CLICK - .3, B * 2): add(mus, kick(), t, .45, 0); add(mus, kick(), t + .2, .22, 0)
for i, t in enumerate(np.arange(10.9, CLICK - .2, B / 2)): add(mus, hat(), t, .05, (-1) ** i * .3)
for t in np.arange(FB + .2, CLICK - .5, B * 4):
    for p in ['A2', 'C3', 'E3']: n(t, 'piano', p, B * 4, .13)
rise = hp(noise(1.5), 1200) * np.linspace(0, 1, int(1.5 * SR)) ** 2; add(mus, rise, CLICK - 1.5, .09, 0)
# click: impact, the groove comes back
add(mus, kick(), CLICK, 1.0, 0); add(mus, thump(1, 48), CLICK, .6, 0)
groove(CLICK, CARD - .1)
add(mus, rise, CARD - 1.5, .07, 0); add(mus, kick(), CARD, .9, 0); add(mus, thump(1, 45), CARD, .5, 0)
for p in ['F3', 'C4', 'A4', 'E5']: n(CARD, 'piano', p, 2.6, .35)
notes = S.render(sc, dur=DUR + .5)[:N]
music = (mus + notes)
# tape stop: the "now" music slows and drops in pitch into the rewind
i0, i1 = int((FB - .45) * SR), int(FB * SR)
seg_ = music[i0:i1].copy(); m = len(seg_); idx = np.cumsum(np.linspace(1, .05, m)); idx = np.clip(idx, 0, m - 1).astype(int)
music[i0:i1] = seg_[idx] * np.linspace(1, 0, m)[:, None]
music *= duck[:, None]

fx = np.zeros((N, 2), np.float32)
def pop(): d = .12; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(500 + 1400 * np.exp(-tt / .02)) / SR) * env_exp(d, .03)
def tone(f, d, dc): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, dc)
def zip_(d=.35): tt = t_(d); return bp(noise(d), 1500, 6000) * (np.sin(2 * np.pi * 60 * tt) > 0) * np.sin(np.pi * tt / d)
def rewind(d=.7): tt = t_(d); f = 2000 - 1600 * tt / d; return (bp(noise(d), 800, 6000) * (np.sin(2 * np.pi * np.cumsum(30 + 40 * tt / d) / SR) > 0) * .7 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .3) * np.sin(np.pi * tt / d)
wind = np.stack([bp(noise(DUR), 200, 1200)[:N], bp(noise(DUR), 200, 1200)[:N]], 1) * .02
fx += wind.astype(np.float32)
crowd = lambda d: bp(noise(d), 300, 2500) * np.sin(np.pi * t_(d) / d)
add(fx, crowd(2.7), 0, .05, -.2); add(fx, crowd(4.4), 15.8, .05, .2)
add(fx, rewind(), FB - .4, .22, 0)
for s in CUTS: add(fx, whoosh(.35, 1), s - .12, .12, 0)
for s in [10.9, 11.55, 12.2, 12.85]: add(fx, zip_(), s + .1, .08, 0); add(fx, clack(1.3, 1), s + .35, .12, 0)
for s in [.1, FB, 5.5, 7.2, 9.6, 10.9, 15.8, 17.2]: add(fx, pop(), s, .12, 0)
fall = np.sin(2 * np.pi * np.cumsum(np.linspace(220, 90, int(1.2 * SR))) / SR) * np.sin(np.pi * t_(1.2) / 1.2); add(fx, fall, 9.6, .06, 0)
add(fx, click(1.0, 1), CLICK, .55, 0); add(fx, clack(.8, 1), CLICK + .01, .3, 0); add(fx, tone(1760, .9, .3), CLICK + .02, .04, 0)
hum = np.sin(2 * np.pi * 120 * t_(1.6)) * env_exp(1.6, .7); add(fx, hum, CLICK, .05, 0)
add(fx, pop(), 16.2, .2, .3); add(fx, thump(1, 70), 16.2, .25, 0)
for j in range(3): add(fx, pop(), CARD + j * .25, .12, (j - 1) * .3)
mix = music * .8 + fx + vo
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
mix[:, 0] = limit(mix[:, 0], .95); mix[:, 1] = limit(mix[:, 1], .95)
sf.write('/home/claude/plat/audio/plat-mix-raw.wav', mix.astype(np.float32), SR); print('mix', DUR)
