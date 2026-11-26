import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import wallFr from './wall-fr.json';
import wallEn from './wall-en.json';
import cableFr from './cable-fr.json';
import cableEn from './cable-en.json';

// Feeha install tutorials (2 Reels × FR/EN). Picture: Lemo three.js clips public/install/<kind>-<lang>.mp4
// (source scripts/install/src3d). Remotion: hook title, tools list, step chip + progress, end card. No transcript on screen.
const FPS = 30;
type Kind = 'wall' | 'cable';
type Lang = 'fr' | 'en';
type TL = {dur: number; lines: Record<string, number>; lineDur: Record<string, number>};
const TLS: Record<string, TL> = {'wall-fr': wallFr, 'wall-en': wallEn, 'cable-fr': cableFr, 'cable-en': cableEn};
export const installFrames = (k: Kind, l: Lang) => Math.round(TLS[`${k}-${l}`].dur * FPS);

type Step = {line: string; n: number; text: string; sub?: string};
const COPY = {
  wall: {
    fr: {hook: ['L\'ASTUCE', 'À NIVEAU'], hookSub: 'SANS RIEN MESURER · MÊME DÉBUTANT', tools: ['PERCEUSE', 'NIVEAU', 'CRAYON', '2 CHEVILLES', '2 VIS'],
      steps: [{line: 'w03', n: 1, text: 'LES ATTACHES', sub: 'en haut, bien droites'}, {line: 'w04', n: 2, text: '1er TROU', sub: 'point · cheville · vis'}, {line: 'w05', n: 3, text: 'ACCROCHE', sub: 'sur la 1re vis'},
        {line: 'w06', n: 4, text: 'À NIVEAU', sub: 'trace le 2e point'}, {line: 'w07', n: 5, text: '2e TROU', sub: 'cheville + vis'},
        {line: 'w08', n: 6, text: 'ATTACHES À L\'ENVERS', sub: 'cachées derrière le cadre'}, {line: 'w09', n: 7, text: 'RACCROCHE', sub: 'à niveau, rien ne dépasse'}],
      cta: 'COMMANDE TON PANNEAU'},
    en: {hook: ['THE TRICK', 'PERFECTLY LEVEL'], hookSub: 'NO MEASURING · BEGINNER-PROOF', tools: ['DRILL', 'LEVEL', 'PENCIL', '2 ANCHORS', '2 SCREWS'],
      steps: [{line: 'w03', n: 1, text: 'BRACKETS', sub: 'on top, nice and straight'}, {line: 'w04', n: 2, text: '1st HOLE', sub: 'mark · anchor · screw'}, {line: 'w05', n: 3, text: 'HANG IT', sub: 'on the 1st screw'},
        {line: 'w06', n: 4, text: 'LEVEL IT', sub: 'mark the 2nd point'}, {line: 'w07', n: 5, text: '2nd HOLE', sub: 'anchor + screw'},
        {line: 'w08', n: 6, text: 'FLIP THE BRACKETS', sub: 'hidden behind the frame'}, {line: 'w09', n: 7, text: 'HANG IT BACK', sub: 'level, nothing shows'}],
      cta: 'ORDER YOUR PANEL'},
  },
  cable: {
    fr: {hook: ['TA VITRINE =', 'TA MEILLEURE PUB'], hookSub: 'CÂBLES D\'ACIER · SUPER FACILE', tools: [] as string[],
      steps: [{line: 'c02', n: 1, text: 'LES ATTACHES', sub: 'coins du haut'}, {line: 'c03', n: 2, text: 'CENTRE + 2 POINTS', sub: 'sur le linteau'}, {line: 'c04', n: 3, text: 'CADRE ALUMINIUM', sub: '2 vis autoperceuses / support'},
        {line: 'c05', n: 3, text: 'GYPSE OU BOIS', sub: '2 chevilles + 2 vis / support'}, {line: 'c06', n: 4, text: 'CROCHETS → ATTACHES'}, {line: 'c07', n: 5, text: 'TIRE = ÇA MONTE'}, {line: 'c08', n: 6, text: 'MÊME HAUTEUR', sub: 'vérifie au niveau'},
        {line: 'c09', n: 7, text: 'TROP HAUT ?', sub: 'appuie sur le piston'}, {line: 'c10', n: 8, text: 'JOUR ET NUIT', sub: 'ta vitrine est vue'}],
      cta: 'COMMANDE TON PANNEAU'},
    en: {hook: ['YOUR WINDOW =', 'YOUR BEST AD'], hookSub: 'STEEL CABLES · SUPER EASY', tools: [] as string[],
      steps: [{line: 'c02', n: 1, text: 'BRACKETS', sub: 'top corners'}, {line: 'c03', n: 2, text: 'CENTER + 2 MARKS', sub: 'on the header'}, {line: 'c04', n: 3, text: 'ALUMINUM FRAME', sub: '2 self-drilling screws / mount'},
        {line: 'c05', n: 3, text: 'DRYWALL OR WOOD', sub: '2 anchors + 2 screws / mount'}, {line: 'c06', n: 4, text: 'HOOKS → BRACKETS'}, {line: 'c07', n: 5, text: 'PULL = IT RISES'}, {line: 'c08', n: 6, text: 'SAME HEIGHT', sub: 'check with the level'},
        {line: 'c09', n: 7, text: 'TOO HIGH?', sub: 'press the button'}, {line: 'c10', n: 8, text: 'DAY AND NIGHT', sub: 'your window gets seen'}],
      cta: 'ORDER YOUR PANEL'},
  },
};
const RED = '#E11D2E', INK = '#0B0A0D';
const ANTON = '"Anton", sans-serif';
const MONT = '"Montserrat", sans-serif';
const fr = (s: number) => Math.round(s * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const pop = (f: number, at: number) => spring({frame: f - fr(at), fps: FPS, config: {damping: 12, stiffness: 190, mass: 0.6}});

const Ctx = React.createContext<{kind: Kind; lang: Lang}>({kind: 'wall', lang: 'fr'});
const useD = () => {
  const {kind, lang} = React.useContext(Ctx);
  const tl = TLS[`${kind}-${lang}`];
  const ids = Object.keys(tl.lines);
  const shotStart = (id: string) => (ids.indexOf(id) === 0 ? 0 : tl.lines[id] - 0.3);
  return {kind, lang, tl, ids, c: COPY[kind][lang], L: tl.lines, D: tl.lineDur, shotStart, last: ids[ids.length - 1]};
};

const Hook = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const {c, ids, shotStart} = useD();
  const out = shotStart(ids[1]) + 0.1;
  if (t >= out) return null;
  const o = clamp((out - t) / 0.35);
  const p1 = pop(f, 0.15), p2 = pop(f, 0.45), p3 = pop(f, 0.85);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 760, background: 'linear-gradient(180deg, rgba(0,0,0,.6), rgba(0,0,0,0))'}} />
      <div style={{position: 'absolute', top: 210, left: 50, right: 50, textAlign: 'center'}}>
        <div style={{fontFamily: ANTON, fontSize: 100, lineHeight: 1.05, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.6)', transform: `translateY(${(1 - p1) * 40}px)`, opacity: clamp(p1 * 2)}}>{c.hook[0]}</div>
        <div style={{display: 'inline-block', marginTop: 14, fontFamily: ANTON, fontSize: 112, lineHeight: 1.12, color: '#fff', background: RED, padding: '6px 34px 0', borderRadius: 18, transform: `scale(${lin(p2, 0, 1, 1.4, 1)})`, opacity: clamp(p2 * 2)}}>{c.hook[1]}</div>
        <div style={{marginTop: 26, fontFamily: MONT, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: '#fff', opacity: clamp(p3 * 2), textShadow: '0 4px 18px rgba(0,0,0,.7)'}}>{c.hookSub}</div>
      </div>
    </AbsoluteFill>
  );
};

// the tools, one chip per word in the line
const Tools = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const {c, L, D, ids, shotStart} = useD();
  if (!c.tools.length) return null;
  const id = ids[1], a = shotStart(id), b = shotStart(ids[2]);
  if (t < a || t >= b) return null;
  const o = clamp((b - t) / 0.3);
  const times = [0.18, 0.36, 0.52, 0.7, 0.86].map((k) => L[id] + k * D[id] - 0.15);
  return (
    <div style={{position: 'absolute', top: 1180, left: 70, right: 190, display: 'flex', flexWrap: 'wrap', gap: 16, opacity: o}}>
      {c.tools.map((w, i) => {
        const p = pop(f, times[i]);
        if (t < times[i]) return null;
        return <div key={w} style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 2, color: INK, background: '#fff', padding: '12px 26px', borderRadius: 999, boxShadow: '0 10px 26px rgba(0,0,0,.3)', transform: `scale(${lin(p, 0, 1, 0.5, 1)})`, opacity: clamp(p * 2)}}><span style={{color: RED}}>✓</span> {w}</div>;
      })}
    </div>
  );
};

// step chip (number + title + sub) and the progress dots; slides from one step to the next
const Steps = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const {c, ids, shotStart, last} = useD();
  const steps = c.steps as Step[];
  const total = Math.max(...steps.map((s) => s.n));
  const end = shotStart(last);
  if (t < shotStart(steps[0].line) || t >= end + 0.2) return null;
  let k = 0; while (k < steps.length - 1 && t >= shotStart(steps[k + 1].line)) k++;
  const s = steps[k], at = shotStart(s.line), p = pop(f, at + 0.05);
  const fadeEnd = clamp((end + 0.2 - t) / 0.3);
  const subP = pop(f, at + 0.35);
  return (
    <AbsoluteFill style={{opacity: fadeEnd}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 430, background: 'linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,0))'}} />
      {/* progress */}
      <div style={{position: 'absolute', top: 150, left: 70, display: 'flex', gap: 10}}>
        {Array.from({length: total}).map((_, i) => {
          const done = i + 1 < s.n, cur = i + 1 === s.n;
          return <div key={i} style={{width: cur ? 64 : 30, height: 12, borderRadius: 99, background: done ? '#fff' : cur ? RED : 'rgba(255,255,255,.35)'}} />;
        })}
      </div>
      <div key={k} style={{position: 'absolute', top: 186, left: 70, right: 190, display: 'flex', alignItems: 'flex-start', gap: 22, transform: `translateX(${(1 - p) * -60}px)`, opacity: clamp(p * 2)}}>
        <div style={{flex: '0 0 auto', width: 118, height: 118, borderRadius: 26, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 82, color: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,.35)'}}>{s.n}</div>
        <div>
          <div style={{fontFamily: ANTON, fontSize: 76, lineHeight: 1.08, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,.55)'}}>{s.text}</div>
          {s.sub ? <div style={{marginTop: 6, display: 'inline-block', fontFamily: MONT, fontWeight: 800, fontSize: 34, color: INK, background: '#fff', padding: '6px 18px', borderRadius: 12, opacity: clamp(subP * 2), transform: `translateY(${(1 - subP) * 14}px)`}}>{s.sub}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const {c, last, shotStart, L} = useD();
  const at = shotStart(last) + 0.1;
  if (t < at) return null;
  const bg = ease(clamp((t - at) / 0.5));
  const pLogo = pop(f, at + 0.15), pUrl = pop(f, L[last] + 0.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,${0.55 * bg}) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 58%, rgba(0,0,0,${0.75 * bg}) 100%)`}} />
      <div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', opacity: clamp(pLogo * 2), transform: `scale(${lin(pLogo, 0, 1, 0.8, 1)})`}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 330, borderRadius: 18, background: '#fff', padding: '14px 24px'}} />
      </div>
      <div style={{position: 'absolute', top: 1440, left: 90, right: 90, opacity: clamp(pUrl * 2), transform: `scale(${lin(pUrl, 0, 1, 0.75, 1)})`}}>
        <div style={{background: '#fff', borderRadius: 30, padding: '22px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(225,29,46,.45)'}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 36, color: INK, letterSpacing: 2}}>{c.cta}</div>
          <div style={{fontFamily: ANTON, fontSize: 84, color: RED, lineHeight: 1.1}}>FEEHAPANELS.COM</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Install: React.FC<{kind: Kind; lang: Lang}> = ({kind, lang}) => (
  <Ctx.Provider value={{kind, lang}}>
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(`install/${kind}-${lang}.mp4`)} muted style={{width: 1080, height: 1920}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)'}} />
      <Hook />
      <Tools />
      <Steps />
      <EndCard />
      <Audio src={staticFile(`install/${kind}-${lang}-mix.wav`)} />
    </AbsoluteFill>
  </Ctx.Provider>
);
export const InstallWallFr = () => <Install kind="wall" lang="fr" />;
export const InstallWallEn = () => <Install kind="wall" lang="en" />;
export const InstallCableFr = () => <Install kind="cable" lang="fr" />;
export const InstallCableEn = () => <Install kind="cable" lang="en" />;
