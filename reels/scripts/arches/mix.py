# « Follow the Arches » soundtrack: pulse & silence, rain/engine/wipers, freeze, rewind, cuts, tension → absolute silence on « C'est toi », soft resolve on Feeha.
import os, sys, json
import numpy as np, soundfile as sf
sys.path.insert(0, '/root/lemo-opuscar')
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, brown, lp, hp, bp, t_, env_exp, norm, click, clack, whoosh, thump, compress
REELS = '/home/claude/website/reels'
TL = json.load(open(f'{REELS}/src/arches/timeline.json')); L = TL['lines']; D = TL['lineDur']; DUR = TL['dur']; N = int(DUR * SR)
T = dict(black=L['a04'], city=L['a05'] - .25, pov=L['a05'] + 2.2, mirror=L['a06'], ground=L['a06'] + 1.35, boards=L['a07'], pov2=L['a08'],
         freeze=L['a08'] + D['a08'] - .05, rewind=L['b01'] + .15, agency=L['b02'] - .2, question=L['b03'], logo=L['b04'], cut=L['b05'], remove=L['b06'],
         match=L['b07'] + .3, resume=L['b07'] + 2.0, award=L['b08'], tension=L['c01'], toi=L['c02'], back=L['c02'] + 1.05, codes=L['c04'], kome=L['d01'],
         noname=L['d02'], feeha=L['d04'])
S.seed(11); np.random.seed(11)
def load(p):
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
vo = np.zeros((N, 2), np.float32)
def voice(x, at): add(vo, compress(hp(x, 70) / (np.abs(x).max() + 1e-9) * .9, thr=.3, ratio=2.5), at, .8, 0)
VO = os.environ.get('VO')
if VO: voice(load(VO), float(os.environ.get('VO_AT', '0')))
else:
    for k, at in L.items(): voice(load(f'/home/claude/arches/vo/{k}.wav'), at)
vm = (np.abs(vo).sum(1) > 1e-3).astype(float); kk = int(.3 * SR); duck = 1 - .45 * np.clip(np.convolve(vm, np.ones(kk) / kk, mode='same'), 0, 1)
tt = lambda a, b: (np.arange(N) / SR >= a) & (np.arange(N) / SR < b)
def env_between(a, b, fade=.3):
    x = np.arange(N) / SR; return np.clip(np.minimum((x - a) / fade, (b - x) / fade), 0, 1)

mus = np.zeros((N, 2), np.float32); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan, 1.0))
def kick(f0=48): d = .5; t2 = t_(d); f = f0 + 70 * np.exp(-t2 / .05); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .2)
def tone(f, d, dc): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, dc)
def drone(d, f=41.2, a=.5): t2 = t_(d); return (np.sin(2 * np.pi * f * t2) * .6 + np.sin(2 * np.pi * f * 1.5 * t2) * .25 + lp(noise(d), 160) * .5) * a
def impact(): return norm(kick(38)[:int(.5 * SR)] * 1.0 + np.pad(lp(noise(1.6), 300) * env_exp(1.6, .5), (0, 0))[:int(.5 * SR)] * .6)
def riser(d): t2 = t_(d); return (hp(noise(d), 900) * (t2 / d) ** 2 * .7 + np.sin(2 * np.pi * np.cumsum(200 + 900 * (t2 / d) ** 2) / SR) * (t2 / d) ** 2 * .3)
# ACT 1: pulse & silence on the image, then the city
for t in np.arange(.5, T['black'] - .3, 1.15): add(mus, kick(), t, .55, 0)
add(mus, drone(T['black'] + .2) * env_exp(T['black'] + .2, 99), 0, .12, 0)
for t in np.arange(T['city'], T['freeze'], 1.15): add(mus, kick(), t, .5, 0); add(mus, kick(), t + .22, .22, 0)
dd = T['freeze'] - T['city']; add(mus, drone(dd, 36.7) * np.minimum(1, t_(dd) / 1.5), T['city'], .16, 0)
for t in np.arange(T['city'], T['freeze'] - .5, 4.6):
    for p in ['E2', 'B2', 'G3']: n(t, 'piano', p, 4.2, .12)
# freeze: everything stops, a single high tone
add(mus, tone(2637, 1.2, .5), T['freeze'] + .05, .03, 0)
# ACT 2: rewind, then a curious, lighter pulse in the agency
dd = T['resume'] - T['agency']
for t in np.arange(T['agency'] + .3, T['resume'], .55): add(mus, kick(60), t, .25, 0)
for i, t in enumerate(np.arange(T['agency'] + .3, T['resume'], 2.2)):
    for j, p in enumerate([['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['E3', 'G3', 'B3']][i % 4]): n(t + j * .3, 'glockenspiel', p, 1.2, .18, (j - 1) * .3)
add(mus, drone(dd, 55, .35), T['agency'], .1, 0)
# resume and the award: a proper swell
add(mus, impact(), T['resume'] + .5, .7, 0)
dd = T['tension'] - T['award']
for p in ['A2', 'E3', 'A3', 'C4', 'E4']: n(T['award'], 'violas', p, dd + 1, .2)
# ACT 3: tension rises… then nothing
dd = T['toi'] - T['tension']; add(mus, riser(dd), T['tension'], .14, 0)
for t in np.arange(T['tension'], T['toi'] - .1, .5 - .2 * 0): add(mus, kick(), t, .45 * (1 + (t - T['tension']) / dd), 0)
add(mus, drone(dd, 41.2, .6) * (t_(dd) / dd), T['tension'], .18, 0)
# after « C'est toi »: a low hit, then a slow, warm bed through the codes and Komé
add(mus, impact(), T['back'] - .05, .6, 0)
for i, t in enumerate(np.arange(T['back'], T['feeha'], 2.4)):
    for j, p in enumerate([['C3', 'G3', 'E4'], ['A2', 'E3', 'C4'], ['F2', 'C3', 'A3'], ['G2', 'D3', 'B3']][i % 4]): n(t + j * .02, 'piano', p, 2.3, .2 if t < T['kome'] else .26)
for t in np.arange(T['kome'], T['feeha'], .6): n(t, 'glockenspiel', 'E5' if int(t / .6) % 2 else 'G5', .3, .08)
for p in ['C3', 'G3', 'C4', 'E4', 'G4']: n(T['feeha'], 'cellos' if False else 'violas', p, DUR - T['feeha'], .2)
n(T['feeha'], 'piano', 'C5', 3.0, .25)
notes = S.render(sc, dur=DUR + .5)[:N]
music = (mus + notes)
# absolute silence: freeze (short) and « C'est toi »
gate = np.ones(N); gate[tt(T['freeze'] + .02, T['rewind'] - .1)] = .08; gate[tt(T['toi'] - .02, T['back'] - .08)] = 0
music *= (gate * duck)[:, None]

fx = np.zeros((N, 2), np.float32)
def rain_bed(d): return np.stack([hp(noise(d), 1800), hp(noise(d), 1800)], 1)[:int(d * SR)] * .5 + np.stack([lp(noise(d), 500)] * 2, 1)[:int(d * SR)] * .5
# rain + engine during the drive, a light rain under the rest of act 1/2 city shots
for a, b, v in [(T['city'], T['freeze'], .05), (T['rewind'], T['agency'], .03), (T['resume'], T['award'], .05), (T['match'], T['resume'], .03)]:
    d = b - a; r = rain_bed(d); m = len(r); e = np.minimum(1, np.minimum(np.arange(m) / SR / .3, (d - np.arange(m) / SR) / .3)); r = r * np.clip(e, 0, 1)[:, None] * v
    i0 = int(a * SR); m = min(m, N - i0); fx[i0:i0 + m] += r[:m].astype(np.float32)
for a, b in [(T['pov'], T['mirror'] + 1.3), (T['pov2'], T['freeze']), (T['resume'] + .5, T['award'])]:
    d = b - a; eng = lp(brown(d), 120); eng = eng[:min(len(eng), len(t_(d)))] * np.minimum(1, t_(d)[:min(len(eng), len(t_(d)))] / .3); add(fx, eng / (np.abs(eng).max() + 1e-9), a, .06, 0)
    for t in np.arange(a + .2, b, 1.3): add(fx, lp(noise(.25), 1500) * env_exp(.25, .08), t, .08, -.3); add(fx, click(.6, 1), t + .62, .06, -.3)   # wipers
add(fx, whoosh(1.2, 1), T['mirror'] + .2, .12, .5)
splash = bp(noise(1.0), 600, 6000) * env_exp(1.0, .25); add(fx, splash, T['ground'] + .3, .25, -.3)
for i in range(4): add(fx, whoosh(.3, 1), T['boards'] + i * (T['pov2'] - T['boards']) / 4 - .08, .14, (i - 1.5) * .3)
# freeze, rewind
add(fx, impact(), T['freeze'], .5, 0)
def rewind_snd(d=1.1): t2 = t_(d); return (bp(noise(d), 700, 6000) * (np.sin(2 * np.pi * np.cumsum(25 + 35 * t2 / d) / SR) > 0) * .7 + np.sin(2 * np.pi * np.cumsum(1800 - 1400 * t2 / d) / SR) * .3) * np.sin(np.pi * t2 / d)
add(fx, rewind_snd(), T['rewind'] - .1, .25, 0)
# agency: paper, typewriter, scissors
for i in range(3): add(fx, bp(noise(.4), 1500, 7000) * env_exp(.4, .12), T['agency'] + i * .35, .12, (i - 1) * .3)
q_n = int(D['b03'] * .9 / .07)
for i in range(q_n): add(fx, click(2.2 + (i % 3) * .2, 1), T['question'] + .1 + i * .07, .07, ((i % 5) - 2) * .1)
add(fx, bp(noise(.35), 1500, 7000) * env_exp(.35, .1), T['logo'], .14, 0)
def snip():
    a = bp(noise(.09), 2500, 9000) * env_exp(.09, .02); b = tone(3400, .05, .01) * .3; a[:len(b)] += b[:len(a)]; return a
for i in range(4): add(fx, snip(), T['cut'] + i * .15, .3, (i - 1.5) * .3)
for i in range(3): add(fx, whoosh(.4, 1), T['remove'] + i * .12, .12, (-1) ** i * .5)
add(fx, whoosh(.8, 1), T['match'] - .1, .2, 0)
add(fx, impact(), T['award'] + 1.0, .3, 0)
add(fx, tone(80, 2.5, 1.5), T['tension'] + .5, .06, 0)
add(fx, kick(30)[:int(.5 * SR)], T['toi'] - .02, .0, 0)
for i in range(6): add(fx, click(1.8, 1), T['codes'] + 1.2 + i * .5, .05, 0)
for i in range(3): add(fx, whoosh(.5, 1) * .5, T['noname'] + .9 + i, .1, 0)
mix = music * .8 + fx * np.ones((1, 2)) * 1.0 + vo
gate_fx = np.ones(N); gate_fx[tt(T['toi'] + .05, T['back'] - .1)] = 0; mix[:, :] *= np.maximum(gate_fx, (np.abs(vo).sum(1) > 0))[:, None] if False else 1
mix = np.stack([hp(mix[:, 0], 30), hp(mix[:, 1], 30)], 1)
mix[:, 0] = limit(mix[:, 0], .95); mix[:, 1] = limit(mix[:, 1], .95)
sf.write('/home/claude/arches/mix-raw.wav', mix.astype(np.float32), SR); print('mix', DUR)
