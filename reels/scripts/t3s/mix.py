# « Le test des 3 secondes » soundtrack: car in the rain, ticking timer, freeze hit, quiz pops, rewind, verdict buzz/ding, light pizzicato groove.
import os, sys, json
import numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, brown, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress
REELS = '/home/claude/website/reels'
LANG = os.environ.get('MIXLANG', 'fr')
TL = json.load(open(f'{REELS}/src/t3s/timeline' + ('' if LANG == 'fr' else '-en') + '.json')); V = TL['lines']; D = TL['lineDur']; DUR = TL['dur']; N = int(DUR * SR)
P0, P1 = TL['pass']; CARD = TL['card']; RW = TL['rw']; SHOP = TL['shop']
S.seed(7); np.random.seed(7)
def load(p):
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
vo = np.zeros((N, 2), np.float32)
def voice(x, at): add(vo, compress(hp(x, 80) / (np.abs(x).max() + 1e-9) * .9, thr=.3, ratio=3), at, .78, 0)
VO = os.environ.get('VO')
if VO: voice(load(VO), float(os.environ.get('VO_AT', '0')))
else:
    for k, at in V.items(): voice(load(f'/home/claude/t3s/{LANG}/vo/{k}.wav'), at)
vm = (np.abs(vo).sum(1) > 1e-3).astype(float); kk = int(.25 * SR); duck = 1 - .5 * np.clip(np.convolve(vm, np.ones(kk) / kk, mode='same'), 0, 1)
def tone(f, d, dc): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, dc)
def kick(f0=50): d = .4; t2 = t_(d); f = f0 + 90 * np.exp(-t2 / .04); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .14)
def hat(): d = .05; return hp(noise(d), 7000) * env_exp(d, .01)

def pop(): d = .12; t2 = t_(d); return np.sin(2 * np.pi * np.cumsum(500 + 1400 * np.exp(-t2 / .02)) / SR) * env_exp(d, .03)
def buzz(): d = .35; t2 = t_(d); return np.sign(np.sin(2 * np.pi * 110 * t2)) * env_exp(d, .25) * .6
def ding(): return tone(1318, .8, .3) + tone(1976, .8, .25) * .6
def impact(): a = kick(38); b = lp(noise(len(a) / SR), 300)[:len(a)] * env_exp(len(a) / SR, .2)[:len(a)]; return norm(a + b * .6)
def rewind_snd(d=.9): t2 = t_(d); return (bp(noise(d), 700, 6000) * (np.sin(2 * np.pi * np.cumsum(25 + 35 * t2 / d) / SR) > 0) * .7 + np.sin(2 * np.pi * np.cumsum(1800 - 1400 * t2 / d) / SR) * .3) * np.sin(np.pi * t2 / d)
mus = np.zeros((N, 2), np.float32); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan, 1.0))
B = 60 / 108
# hook + pass: a heartbeat that speeds up, ticking clock
for t in np.arange(.2, P0, B): add(mus, kick(), t, .45, 0)
for t in np.arange(P0, P1, B / 2): add(mus, kick(), t, .5, 0); add(mus, hat(), t + B / 4, .05, .2)
for i in range(6): add(mus, tone(1760, .06, .015), P0 + i * (P1 - P0) / 5, .12, 0)   # 5 … 0
rise = hp(noise(P1 - P0), 1200) * np.linspace(0, 1, int((P1 - P0) * SR)) ** 2; add(mus, rise, P0, .06, 0)
# freeze: hit, then the quiz with a held note and the 3-2-1
add(mus, impact(), P1, .8, 0); add(mus, tone(2637, 1.4, .5), P1 + .02, .03, 0)
for p in ['D3', 'A3', 'F4']: n(P1 + .3, 'violas', p, RW - P1 - .3, .12)
cd0 = V['v03'] + D['v03'] + .1
for i in range(3): add(mus, tone(1046 if i < 2 else 1568, .12, .04), cd0 + i * (2.5 / 3), .12, 0)
for i in range(4): add(mus, pop(), V['v03'] + i * .22, .12, (i - 1.5) * .3)
# replay: light, curious pizzicato groove
prog = [['D3', 'F3', 'A3'], ['A2', 'E3', 'C4'], ['B♭2' if False else 'A#2', 'D3', 'F3'], ['C3', 'E3', 'G3']]
t, i = RW + .9, 0
while t < CARD - .3:
    for j, p in enumerate(prog[i % 4]):
        for r in range(2): n(t + j * B / 3 + r * B * 2, 'violins_pizz', p, .3, .3, (j - 1) * .3)
    n(t, 'contrabass_pizz', prog[i % 4][0].replace('3', '2'), .6, .5); n(t + B * 2, 'contrabass_pizz', prog[i % 4][0].replace('3', '2'), .6, .45)
    t += B * 4; i += 1
for t in np.arange(RW + .9, CARD - .3, B): add(mus, kick(60), t, .25, 0)
# end: push into the panel and the card
rise2 = hp(noise(.8), 1200) * np.linspace(0, 1, int(.8 * SR)) ** 2; add(mus, rise2, CARD - .8, .1, 0)
add(mus, impact(), CARD, .7, 0)
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: n(CARD, 'piano', p, DUR - CARD, .3)
# the fix: light comes on, a warm groove under the shop button
ON = SHOP + 1.6
for t in np.arange(ON, DUR - .8, B): add(mus, kick(55), t, .35, 0); add(mus, hat(), t + B / 2, .05, .2)
for i, t in enumerate(np.arange(ON, DUR - 1, B * 4)):
    for j, p in enumerate([['D3', 'F#3', 'A3'], ['B2', 'D3', 'F#3'], ['G2', 'B2', 'D3'], ['A2', 'C#3', 'E3']][i % 4]): n(t + j * .02, 'piano', p, B * 4, .22)
notes = S.render(sc, dur=DUR + .5)[:N]
music = (mus + notes) * duck[:, None]
fx = np.zeros((N, 2), np.float32)
bed = lambda d: np.stack([hp(noise(d), 1800)[:int(d * SR)] * .5 + lp(noise(d), 300)[:int(d * SR)] * .7] * 2, 1)
r = bed(CARD); fx[:len(r)] += (r * .05).astype(np.float32)[:N]   # rain on the window
eng = lp(brown(CARD), 110)[:int(CARD * SR)]; add(fx, eng / (np.abs(eng).max() + 1e-9), 0, .07, 0)   # engine
for j in range(4): add(fx, whoosh(1.0, 1), P0 + .3 + j * 1.2, .12, .4)
add(fx, rewind_snd(), RW, .25, 0)
for at in [V['v06'] - .2, V['v07'] - .2, V['v08'] - .2]: add(fx, whoosh(.5, 1), at, .12, 0)
add(fx, whoosh(.4, 1), V['v09'] + .05, .16, -.4)
for at in [V['v05'] + .2, V['v06'] + .2, V['v07'] + .2]: add(fx, buzz(), at, .07, 0)
add(fx, ding(), V['v08'] + .3, .1, 0)
add(fx, tone(784, .25, .08), V['v09'] + 1.0, .08, 0); add(fx, tone(1046, .35, .1), V['v09'] + 1.15, .08, 0)   # « surprise »
add(fx, whoosh(.6, 1), V['v10'] - .2, .14, 0)
for at in [V['v10'] + .4, V['v10'] + 1.0, V['v12'], V['v12'] + .6]: add(fx, pop(), at, .1, 0)
add(fx, whoosh(.8, 1), CARD - .7, .2, 0)
add(fx, whoosh(.7, 1), SHOP - .05, .2, 0)
add(fx, bp(noise(.8), 600, 4500) * np.sin(np.pi * t_(.8) / .8) ** 2, SHOP + .7, .14, 0); add(fx, clack(1.2, 1), SHOP + 1.45, .3, 0)
add(fx, click(1.0, 1), SHOP + 1.6, .4, 0); hum = np.sin(2 * np.pi * 120 * t_(1.4)) * env_exp(1.4, .6); add(fx, hum, SHOP + 1.6, .05, 0); add(fx, ding(), SHOP + 1.65, .08, 0)
add(fx, pop(), SHOP + .2, .12, 0); add(fx, pop(), SHOP + 1.7, .12, 0); add(fx, pop(), V['v14'], .14, 0); add(fx, click(1.5, 1), V['v14'] + .9, .3, 0)
mix = music * .8 + fx + vo
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
mix[:, 0] = limit(mix[:, 0], .95); mix[:, 1] = limit(mix[:, 1], .95)
sf.write(f'/home/claude/t3s/mix-raw-{LANG}.wav', mix.astype(np.float32), SR); print('mix', DUR)
