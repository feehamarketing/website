# Feeha install tutorials soundtrack: voice per line, light piano/kick groove (ducked), tool SFX synced to the 3D actions.
# env: KIND=wall|cable  MIXLANG=fr|en  VODIR=<folder with <id>.wav per line>  OUT=<wav>
import os, sys, json
import numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress, ding, pop
REELS = '/home/claude/website/reels'
KIND, LANG = os.environ.get('KIND', 'wall'), os.environ.get('MIXLANG', 'fr')
TL = json.load(open(f'{REELS}/src/install/{KIND}-{LANG}.json')); L = TL['lines']; D = TL['lineDur']; DUR = TL['dur']; N = int(DUR * SR)
ids = list(L.keys()); Sx = [0 if i == 0 else L[k] - 0.3 for i, k in enumerate(ids)]; LEN = [(Sx[i + 1] if i < len(ids) - 1 else DUR) - Sx[i] for i in range(len(ids))]
at = lambda i, u: Sx[i] + u * LEN[i]
S.seed(5); np.random.seed(5)
def load(p):
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
vo = np.zeros((N, 2), np.float32)
VODIR = os.environ['VODIR']
for k in ids: x = load(f'{VODIR}/{k}.wav'); add(vo, compress(hp(x, 80) / (np.abs(x).max() + 1e-9) * .9, thr=.3, ratio=3), L[k], .8, 0)
vm = (np.abs(vo).sum(1) > 1e-3).astype(float); kk = int(.25 * SR); duck = 1 - .55 * np.clip(np.convolve(vm, np.ones(kk) / kk, mode='same'), 0, 1)

def tone(f, d, dc): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, dc)
def kick(f0=55): d = .35; t2 = t_(d); f = f0 + 80 * np.exp(-t2 / .04); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12)
def hat(): d = .04; return hp(noise(d), 8000) * env_exp(d, .01)
def drill(d):  # cordless drill whine with spin-up/down
    t2 = t_(d); f = 180 + 520 * np.clip(t2 / .15, 0, 1) * np.clip((d - t2) / .12, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * .25 + np.sin(ph * 2) * .3 + bp(noise(d), 900, 4000) * .25
    env = np.clip(t2 / .04, 0, 1) * np.clip((d - t2) / .06, 0, 1)
    return lp(x, 5000) * env
def zip_(d):  # cable sliding / tape extending: fast ticks
    t2 = t_(d); x = bp(noise(d), 2500, 8000) * (np.sin(2 * np.pi * np.cumsum(28 + 20 * t2 / d) / SR) > .6); return x * np.sin(np.pi * t2 / d)
def scratch(d=.5): t2 = t_(d); return bp(noise(d), 1500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t2)) * np.sin(np.pi * t2 / d)
def chime(): return pad(tone(1046, 1.2, .5), tone(1568, 1.2, .45) * .6, tone(2093, 1.2, .35) * .3)
def hum(d=1.2): t2 = t_(d); return (np.sin(2 * np.pi * 120 * t2) * .4 + np.sin(2 * np.pi * 240 * t2) * .2) * np.clip(t2 / .2, 0, 1) * np.exp(-t2 / .8)
def pad(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def metal(): return pad(click(1.6, 1) * .7, tone(2900, .25, .06) * .25)

fx = np.zeros((N, 2), np.float32)
def F(x, t, g, p=0): add(fx, x, t, g, p)
# shot transitions
for i in range(1, len(ids)): F(whoosh(.45, 1), Sx[i] - .12, .1, (-1) ** i * .3)
if KIND == 'wall':
    F(click(1.2, 1), at(0, 1) - .35, .25)                                   # light off
    for k in [0.18, 0.36, 0.52, 0.7, 0.86]: F(pop(), L[ids[1]] + k * D[ids[1]] - .15, .18)
    for u0, u1 in [(0.08, 0.26), (0.55, 0.7)]: F(whoosh(.3, 1), at(2, u0), .12)
    for u0, u1 in [(0.22, 0.42), (0.64, 0.84)]: F(drill(at(2, u1) - at(2, u0)), at(2, u0), .14)
    F(scratch(.45), at(3, 0) + 0.5 + .35 * (min(LEN[3], 2.4) - .5), .2)
    F(drill(at(4, .36) - at(4, .14)), at(4, .14), .22); F(thump(1, 90), at(4, .62), .35); F(drill(at(4, .97) - at(4, .83)), at(4, .83), .16)
    F(metal(), Sx[5] + min(1.6, LEN[5] * .85), .3)
    F(ding(), at(6, .5), .22); F(scratch(.4), at(6, .8), .2)
    F(drill(at(7, .4) - at(7, .2)), at(7, .2), .22); F(thump(1, 90), at(7, .62), .35); F(drill(at(7, .98) - at(7, .84)), at(7, .84), .16)
    F(metal(), Sx[8] + min(1.1, LEN[8] * .35), .3); F(metal(), Sx[8] + min(1.1, LEN[8] * .35) + .08, .2); F(ding(), at(8, .4), .2)
    ON = at(8, .6)
else:
    F(whoosh(.8, 1), at(0, 1) - .5, .2)                                   # through the glass
    for u0 in [0.08, 0.55]: F(whoosh(.3, 1), at(1, u0), .12)
    for u0, u1 in [(0.22, 0.42), (0.64, 0.84)]: F(drill(at(1, u1) - at(1, u0)), at(1, u0), .14)
    F(zip_(at(2, .4) - at(2, .05)), at(2, .05), .12); F(pop(), at(2, .4), .15); F(scratch(.35), at(2, .66), .2); F(scratch(.35), at(2, .84), .2)
    for q in range(2):
        a0, a1 = at(3, .12 + q * .2), at(3, .12 + q * .2 + .2); F(drill((a1 - a0) * .5), a0 + (a1 - a0) * .25, .2)
        a0, a1 = at(3, .7 + q * .14), at(3, .7 + q * .14 + .14); F(drill((a1 - a0) * .5), a0 + (a1 - a0) * .25, .2)
    F(drill((at(4, .38) - at(4, .08)) * .5), at(4, .08) + (at(4, .38) - at(4, .08)) * .25, .22); F(thump(1, 90), at(4, .55), .35); F(drill(at(4, .86) - at(4, .7)), at(4, .7), .16)
    F(metal(), at(5, .6), .3); F(metal(), at(5, .63), .22)
    F(zip_(at(6, .5) - at(6, .12)), at(6, .12), .16); F(zip_(at(6, .9) - at(6, .52)), at(6, .52), .16)
    F(zip_(at(7, .8) - at(7, .45)), at(7, .45), .14); F(ding(), at(7, .82), .22)
    F(click(1.4, 1), at(8, .4), .35); F(zip_(at(8, .78) - at(8, .45)), at(8, .45), .14); F(click(1.1, 1), at(8, .8), .25)
    ON = at(9, .35)
F(hum(), ON, .12); F(chime(), ON + .05, .1)

# music: soft piano chords + kick/hat, opens up when the light comes on
mus = np.zeros((N, 2), np.float32); sc = []
B = 60 / 100
prog = [['C3', 'E3', 'G3', 'B3'], ['A2', 'C3', 'E3', 'G3'], ['F2', 'A2', 'C3', 'E3'], ['G2', 'B2', 'D3', 'F3']]
t, i = 0.1, 0
while t < DUR - .5:
    for j, p in enumerate(prog[i % 4]): sc.append((t + j * .015, 'piano', p, B * 4, .16 if t < ON else .22, (j - 1.5) * .2, 1.0))
    sc.append((t, 'contrabass_pizz', prog[i % 4][0].replace('3', '2').replace('2', '2'), B * 2, .28, 0, 1.0))
    t += B * 4; i += 1
for t in np.arange(0.1, DUR - .6, B):
    add(mus, kick(), t, .2 if t < ON else .32, 0); add(mus, hat(), t + B / 2, .035 if t < ON else .06, .25)
notes = S.render(sc, dur=DUR + .5)[:N]
fade = np.clip((DUR - t_(DUR)) / 1.2, 0, 1)[:N]
music = (mus + notes) * duck[:, None] * fade[:, None]
mix = vo + music * .55 + fx
out = limit(mix / (np.abs(mix).max() + 1e-9) * .9)
sf.write(os.environ.get('OUT', f'{REELS}/public/install/{KIND}-{LANG}-mix.wav'), out, SR)
print('ok', KIND, LANG, DUR)
