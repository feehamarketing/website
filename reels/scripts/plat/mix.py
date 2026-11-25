# « Le plat invisible » soundtrack: tense bed until the panel clicks on, then it opens; whooshes, click, pops. → public/plat-mix-raw.wav
import os, sys, json
import numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, brown, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress
REELS = '/home/claude/website/reels'
TL = json.load(open(f'{REELS}/src/plat/timeline.json')); L = TL['lines']; DUR = TL['dur']; N = int(DUR * SR)
CLICK = L['l07'] + .45
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
    for k, at in L.items(): voice(load(f'/home/claude/plat/vo/{k}.wav'), at)
vm = (np.abs(vo).sum(1) > 1e-3).astype(float); kk = int(.25 * SR); duck = 1 - .5 * np.clip(np.convolve(vm, np.ones(kk) / kk, mode='same'), 0, 1)

mus = np.zeros((N, 2), np.float32); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan, 1.0))
def kick(): d = .35; tt = t_(d); f = 50 + 110 * np.exp(-tt / .04); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12)
def hat(o=False): d = .25 if o else .06; return hp(noise(d), 7000) * env_exp(d, .06 if o else .012)
def clap(): d = .25; return sum(np.roll(bp(noise(d), 900, 3000) * env_exp(d, .012), int(SR * q * .011)) for q in range(3))
B = 60 / 112
# tension: low drone + heartbeat + ticking hats, rising until the click
dd = CLICK; tt = t_(dd)
drone = (np.sin(2 * np.pi * 49 * tt) * .5 + np.sin(2 * np.pi * 73.4 * tt) * .25 + lp(noise(dd), 200) * .4) * np.minimum(1, tt / 1.2) * (.6 + .4 * tt / dd)
add(mus, drone, 0, .16, 0)
for t in np.arange(.15, CLICK - .3, B * 2): add(mus, kick(), t, .45, 0); add(mus, kick(), t + .2, .22, 0)
for i, t in enumerate(np.arange(L['l06'], CLICK - .2, B / 2)): add(mus, hat(), t, .05, (-1) ** i * .3)
for t in [0.15, B * 4 + .15, B * 8 + .15, B * 12 + .15]:
    for p in ['A2', 'C3', 'E3']: n(t, 'string_ensemble_1' if False else 'piano', p, B * 4, .14)
rise = hp(noise(1.5), 1200) * np.linspace(0, 1, int(1.5 * SR)) ** 2; add(mus, rise, CLICK - 1.5, .09, 0)
# the panel clicks on: impact, then it opens (major, groove)
add(mus, kick(), CLICK, 1.0, 0); add(mus, thump(1, 48), CLICK, .6, 0)
prog = [['F2', 'C3', 'A3', 'E4'], ['C3', 'G3', 'E4', 'G4'], ['G2', 'D3', 'B3', 'D4'], ['A2', 'E3', 'C4', 'E4']]
t, i, END = CLICK, 0, L['l11'] - .1
while t < END:
    for j, p in enumerate(prog[i % 4]): n(t + j * .01, 'piano', p, min(B * 4, END - t), .26, .1)
    for b in range(4):
        tb = t + b * B
        if tb < END: n(tb, 'electric_bass', prog[i % 4][0], B * .8, .5)
    t += B * 4; i += 1
t, i = CLICK + B, 0
while t < END:
    if i % 2 == 0: add(mus, kick(), t, .55, 0)
    else: add(mus, clap(), t, .25, 0)
    add(mus, hat(), t + B / 2, .06, .25); t += B; i += 1
add(mus, rise, L['l11'] - 1.5, .07, 0); add(mus, kick(), L['l11'], .9, 0); add(mus, thump(1, 45), L['l11'], .5, 0)
for p in ['F3', 'C4', 'A4', 'E5']: n(L['l11'], 'piano', p, 2.6, .35)
notes = S.render(sc, dur=DUR + .5)[:N]
music = (mus + notes) * duck[:, None]

fx = np.zeros((N, 2), np.float32)
def pop(): d = .12; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(500 + 1400 * np.exp(-tt / .02)) / SR) * env_exp(d, .03)
def tone(f, d, dc): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, dc)
def zip_(d=.35): tt = t_(d); return bp(noise(d), 1500, 6000) * (np.sin(2 * np.pi * 60 * tt) > 0) * np.sin(np.pi * tt / d)
wind = np.stack([bp(noise(DUR), 200, 1200)[:N], bp(noise(DUR), 200, 1200)[:N]], 1) * .02 * np.clip(1 - (np.arange(N) / SR - CLICK) / 1.0, .25, 1)[:, None]
fx += wind.astype(np.float32)
shots = [0, L['l02'], L['l03'], L['l04'], L['l05'], L['l06'] - .6, L['l06'], L['l06'] + .7, L['l06'] + 1.45, L['l06'] + 2.2, L['l07'], L['l09'], L['l09'] + 2.0, L['l10'], L['l11']]
for s in shots[1:]: add(fx, whoosh(.35, 1), s - .12, .14, 0)
for s in [L['l06'], L['l06'] + .7, L['l06'] + 1.45, L['l06'] + 2.2]: add(fx, zip_(), s + .1, .08, 0); add(fx, clack(1.3, 1), s + .35, .12, 0)   # fast install: ratchet + clunk
for s in [L['l03'], L['l05'] + .3, L['l06'], L['l09'] + 2.0, L['l10']]: add(fx, pop(), s, .12, 0)
add(fx, click(1.0, 1), CLICK, .55, 0); add(fx, clack(.8, 1), CLICK + .01, .3, 0); add(fx, tone(1760, .9, .3), CLICK + .02, .04, 0)    # the click
hum = np.sin(2 * np.pi * 120 * t_(1.6)) * env_exp(1.6, .7); add(fx, hum, CLICK, .05, 0)
add(fx, pop(), L['l09'] + .8, .2, -.3); add(fx, thump(1, 70), L['l09'] + .8, .25, 0)   # sticker
for j in range(3): add(fx, pop(), L['l11'] + j * .25, .12, (j - 1) * .3)
crowd = np.stack([bp(noise(4), 300, 2500)[:int(4 * SR)], bp(noise(4), 300, 2500)[:int(4 * SR)]], 1) * .5
add(fx, crowd[:, 0] * np.sin(np.pi * t_(4) / 4), L['l09'], .03, -.3); add(fx, crowd[:, 1] * np.sin(np.pi * t_(4) / 4), L['l09'] + .1, .03, .3)
mix = music * .8 + fx + vo
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
mix[:, 0] = limit(mix[:, 0], .95); mix[:, 1] = limit(mix[:, 1], .95)
sf.write(f'{REELS}/public/plat-mix-raw.wav', mix.astype(np.float32), SR); print('mix', DUR)
