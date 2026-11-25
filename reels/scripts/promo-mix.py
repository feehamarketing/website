# « 4 raisons » promo: Said's own voice (voice/promo/voix-naturelle.wav, natural clean-up) + an original groove + section whooshes → public/promo-mix.wav
import sys, numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress
DUR = 34.3; N = int(DUR * SR)
SECTIONS = [0, 3.82, 11.04, 13.06, 19.06]; RESULTS, PHOTO, CARD = 22.7, 28.0, 30.8
S.seed(4); np.random.seed(4)
x, sr = sf.read('/home/claude/website/reels/voice/promo/voix-naturelle.wav'); x = x if x.ndim == 1 else x.mean(1)
if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
vo = np.zeros((N, 2), np.float32); add(vo, compress(hp(x, 80) / (np.abs(x).max() + 1e-9) * .9, thr=.35, ratio=2.5), 0, .8, 0)
vm = (np.abs(vo).sum(1) > 2e-3).astype(float); k = int(.3 * SR); duck = 1 - .6 * np.clip(np.convolve(vm, np.ones(k) / k, mode='same'), 0, 1)
mus = np.zeros((N, 2), np.float32); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan, 1.0))
def kick(): d = .35; tt = t_(d); f = 50 + 110 * np.exp(-tt / .04); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12)
def hat(): d = .06; return hp(noise(d), 7000) * env_exp(d, .012)
def clap(): d = .25; return sum(np.roll(bp(noise(d), 900, 3000) * env_exp(d, .012), int(SR * q * .011)) for q in range(3))
def pop(): d = .12; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(500 + 1400 * np.exp(-tt / .02)) / SR) * env_exp(d, .03)
B = 60 / 112
PROG = [['F2', 'C3', 'A3', 'E4'], ['C3', 'G3', 'E4', 'G4'], ['G2', 'D3', 'B3', 'D4'], ['A2', 'E3', 'C4', 'E4']]
t, i = 0.0, 0
while t < CARD:
    for j, p in enumerate(PROG[i % 4]): n(t + j * .01, 'piano', p, B * 4, .22, .1)
    for b in range(4): n(t + b * B, 'electric_bass', PROG[i % 4][0], B * .8, .45)
    t += B * 4; i += 1
t, i = 0.0, 0
while t < CARD:
    add(mus, kick() if i % 2 == 0 else clap(), t, .5 if i % 2 == 0 else .22, 0); add(mus, hat(), t + B / 2, .05, .25); t += B; i += 1
rise = hp(noise(1.2), 1200) * np.linspace(0, 1, int(1.2 * SR)) ** 2; add(mus, rise, CARD - 1.2, .08, 0)
add(mus, kick(), CARD, .9, 0); add(mus, thump(1, 45), CARD, .5, 0)
for p in ['F3', 'C4', 'A4', 'E5']: n(CARD, 'piano', p, DUR - CARD, .3)
notes = S.render(sc, dur=DUR + .5)[:N]
music = (mus + notes) * duck[:, None]
fx = np.zeros((N, 2), np.float32)
for s in SECTIONS[1:] + [RESULTS, PHOTO]: add(fx, whoosh(.4, 1), s - .12, .14, 0); add(fx, pop(), s + .05, .12, 0)
add(fx, pop(), .1, .12, 0)
for j in range(3): add(fx, pop(), CARD + .2 + j * .3, .12, (j - 1) * .3)
mix = music * .75 + fx + vo
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
mix[:, 0] = limit(mix[:, 0], .95); mix[:, 1] = limit(mix[:, 1], .95)
sf.write('/home/claude/promo-hd/mix-raw.wav', mix.astype(np.float32), SR); print('mix', DUR)
