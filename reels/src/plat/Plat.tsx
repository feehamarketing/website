import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import tl from './timeline.json';

// « Le plat invisible » — Feeha Reel, 1080×1920, 30 fps.
// Layers per shot: graded picture -> giant type -> cut-out subject (type goes BEHIND) -> captions / stickers.
// Lemo clip public/plat/street.mp4: illustrated street (dark walk-past 0–2.4 s, lit panel + pointing + queue 2.4–5.2 s).
const RED = '#E11D2E';
const INK = '#0B0A0D';
const ANTON = '"Anton", sans-serif';
const MONT = '"Montserrat", sans-serif';
const POP = {damping: 10, stiffness: 220, mass: 0.6};
const SOFT = {damping: 16, stiffness: 120};
const FPS = 30;
const L = tl.lines as Record<string, number>;
export const PLAT_FRAMES = Math.round(tl.dur * FPS);
const CLICK = L.l07 + 0.45; // the panel switches on
type Wd = {text: string; start: number; end: number};
const WORDS = tl.words as Wd[];
const GRADE = 'brightness(1.14) contrast(1.06) saturate(1.12)';

// ---------- shots ----------
type Shot = {at: number; id: string};
const SHOTS: Shot[] = [
  {at: 0, id: 'hookA'}, {at: L.l02, id: 'hookB'}, {at: L.l03, id: 'dark'}, {at: L.l04, id: 'walk'}, {at: L.l05, id: 'plat'},
  {at: L.l06 - 0.6, id: 'back'}, {at: L.l06, id: 'bundle'}, {at: L.l06 + 0.7, id: 'install'}, {at: L.l06 + 1.45, id: 'slide'},
  {at: L.l06 + 2.2, id: 'inoff'}, {at: L.l07, id: 'switch'}, {at: L.l09, id: 'stop'}, {at: L.l09 + 2.0, id: 'queue'},
  {at: L.l10, id: 'real'}, {at: L.l11, id: 'card'},
];
const shotAt = (t: number) => {
  let i = 0;
  SHOTS.forEach((s, k) => { if (t >= s.at) i = k; });
  return {s: SHOTS[i], i, local: t - SHOTS[i].at, len: (SHOTS[i + 1]?.at ?? tl.dur) - SHOTS[i].at};
};
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// one camera per shot: punch-in on the cut, then a gentle push (never a big blurry zoom)
const useCam = (origin = '50% 45%') => {
  const t = useCurrentFrame() / FPS;
  const {local, len, i} = shotAt(t);
  const punch = spring({frame: Math.round(local * FPS), fps: FPS, config: SOFT});
  const scale = (1.07 - 0.07 * punch) * (1 + 0.035 * clamp(local / Math.max(1, len)));
  const x = (i % 2 ? -10 : 10) * (1 - punch);
  return {transform: `translateX(${x}px) scale(${scale})`, transformOrigin: origin};
};
const Pic = ({src, origin, extra = 1, filter = GRADE, pos}: {src: string; origin?: string; extra?: number; filter?: string; pos?: React.CSSProperties}) => {
  const cam = useCam(origin);
  return (
    <AbsoluteFill style={cam}>
      <AbsoluteFill style={{transform: `scale(${extra})`, transformOrigin: origin}}>
        <Img src={staticFile(src)} style={{width: 1080, height: 1920, objectFit: 'cover', filter, ...pos}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Clip = ({src, from, at, origin, extra = 1, filter = GRADE}: {src: string; from: number; at: number; origin?: string; extra?: number; filter?: string}) => {
  const cam = useCam(origin);
  return (
    <AbsoluteFill style={cam}>
      <AbsoluteFill style={{transform: `scale(${extra})`, transformOrigin: origin}}>
        <Sequence from={Math.round(at * FPS)} layout="none"><OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * FPS)} muted style={{width: 1080, height: 1920, objectFit: 'cover', filter}} /></Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// giant type behind a cut-out subject: picture -> words -> subject, all under the same camera
const Behind = ({bg, cut, words, red, top, size, origin, from}: {bg: string; cut: string; words: string; red: number[]; top: number; size: number; origin: string; from: number}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = useCam(origin);
  const p = spring({frame: f - Math.round(from * FPS), fps: FPS, config: {damping: 13, stiffness: 150}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={cam}><Img src={staticFile(bg)} style={{width: 1080, height: 1920, filter: GRADE}} /></AbsoluteFill>
      <AbsoluteFill style={cam}>
        <div style={{position: 'absolute', left: -30, right: -30, top, textAlign: 'center', fontFamily: ANTON, fontSize: size, lineHeight: 0.88, letterSpacing: 2, color: '#fff', textShadow: '0 14px 40px rgba(0,0,0,.45)', transform: `translateY(${(1 - p) * 120}px) scale(${lin(p, 0, 1, 1.25, 1)})`, opacity: p}}>
          {words.split('|').map((line, j) => <div key={j}>{line.split(' ').map((w, k) => (
            <span key={k} style={{color: red.includes(j * 10 + k) ? RED : '#fff', margin: '0 12px'}}>{w}</span>
          ))}</div>)}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={cam}><Img src={staticFile(cut)} style={{width: 1080, height: 1920, filter: GRADE}} /></AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(255,255,255,${0 * t})`}} />
    </AbsoluteFill>
  );
};

const Pill = ({text, from, top = 150}: {text: string; from: number; top?: number}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - Math.round(from * FPS), fps: FPS, config: POP});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 38, letterSpacing: 4, color: '#fff', background: RED, padding: '14px 28px', borderRadius: 999, boxShadow: '0 10px 30px rgba(225,29,46,.45)', transform: `scale(${lin(p, 0, 1, 0.6, 1)})`, opacity: p}}>{text}</div>
    </div>
  );
};
const Big = ({text, from, top, size = 200, color = '#fff', bg}: {text: string; from: number; top: number; size?: number; color?: string; bg?: string}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - Math.round(from * FPS), fps: FPS, config: POP});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity: clamp(p * 2)}}>
      <span style={{fontFamily: ANTON, fontSize: size, lineHeight: 1, color, background: bg, padding: bg ? '6px 34px 0' : 0, borderRadius: 18, textShadow: bg ? 'none' : '0 12px 36px rgba(0,0,0,.55)', display: 'inline-block', transform: `scale(${lin(p, 0, 1, 1.6, 1)})`}}>{text}</span>
    </div>
  );
};
const Sticker = ({text, from, x, y, rot}: {text: string; from: number; x: number; y: number; rot: number}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - Math.round(from * FPS), fps: FPS, config: POP});
  if (f < from * FPS) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${lin(p, 0, 1, 1.9, 1)})`, opacity: clamp(p * 3)}}>
      <div style={{background: '#fff', color: RED, fontFamily: ANTON, fontSize: 120, lineHeight: 1, padding: '20px 32px 12px', borderRadius: 20, border: `7px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`}}>{text}</div>
    </div>
  );
};
// steam rising off the plate
const Steam = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = ((t * 0.45 + i * 0.21) % 1);
        return <div key={i} style={{position: 'absolute', left: 300 + i * 110 + Math.sin(t * 2 + i) * 30, top: 780 - k * 420, width: 90, height: 220, borderRadius: 60, background: 'radial-gradient(ellipse, rgba(255,255,255,.32), rgba(255,255,255,0) 70%)', filter: 'blur(14px)', opacity: Math.sin(Math.PI * k)}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- captions: max 3 words, karaoke, inside the Instagram safe zone ----------
const CHUNKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  WORDS.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[.,?!…]$/.test(w.text)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
})();
const Captions = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t >= L.l11 - 0.05) return null;
  const chunk = CHUNKS.find((c, i) => {
    const next = CHUNKS[i + 1];
    return t >= c[0].start - 0.05 && t < (next ? Math.min(next[0].start - 0.05, c[c.length - 1].end + 0.5) : c[c.length - 1].end + 0.5);
  });
  if (!chunk) return null;
  const p = spring({frame: f - Math.round(chunk[0].start * FPS), fps: FPS, config: POP});
  return (
    <div style={{position: 'absolute', top: 1270, left: 60, right: 170, textAlign: 'center', transform: `translateY(${(1 - p) * 30}px) scale(${lin(p, 0, 1, 0.9, 1)})`}}>
      {chunk.map((w, i) => {
        const on = t >= w.start;
        const now = on && t < w.end + 0.08;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', padding: now ? '4px 14px 0' : '4px 0 0', borderRadius: 14, background: now ? RED : 'transparent', fontFamily: MONT, fontWeight: 900, fontSize: 78, lineHeight: 1.15, color: on ? '#fff' : 'rgba(255,255,255,.6)', WebkitTextStroke: now ? '0' : '5px #000', paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,.6)', transform: `scale(${now ? 1.08 : 1})`}}>
            {w.text.replace(/[.,…]$/, '').toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- end card ----------
const Card = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const at = (d: number) => spring({frame: f - Math.round((L.l11 + d) * FPS), fps: FPS, config: POP});
  const p = at(0), p2 = at(0.25), p3 = at(0.5), p4 = at(0.75);
  const glow = 0.6 + 0.4 * Math.sin((t - L.l11) * 3);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #3A0A12 0%, ${INK} 65%)`, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 300, left: 150, right: 150, background: '#fff', borderRadius: 34, padding: '40px 30px', boxShadow: `0 0 ${110 * glow}px rgba(225,29,46,.7)`, transform: `scale(${lin(p, 0, 1, 0.8, 1)})`, opacity: p, display: 'flex', justifyContent: 'center'}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 640}} />
      </div>
      <div style={{position: 'absolute', top: 820, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{background: RED, color: '#fff', fontFamily: ANTON, fontSize: 96, padding: '14px 46px 8px', borderRadius: 20, transform: `scale(${lin(p2, 0, 1, 1.5, 1)})`, opacity: p2}}>FEEHAPANELS.COM</div>
        <div style={{border: '5px solid #fff', color: '#fff', fontFamily: ANTON, fontSize: 80, padding: '8px 42px 2px', borderRadius: 20, transform: `scale(${lin(p3, 0, 1, 1.5, 1)})`, opacity: p3}}>FEEHA.CA</div>
      </div>
      <div style={{position: 'absolute', top: 1220, left: 60, right: 60, textAlign: 'center', opacity: p4, transform: `translateY(${(1 - p4) * 30}px)`}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 62, color: '#fff', lineHeight: 1.25}}>
          ÉCRIS <span style={{background: '#fff', color: RED, padding: '2px 18px', borderRadius: 12}}>PANNEAU</span><br />EN DM
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- the edit ----------
const ShotView = () => {
  const t = useCurrentFrame() / FPS;
  const {s} = shotAt(t);
  switch (s.id) {
    case 'hookA':
      return <Behind bg="plat/hook.jpg" cut="plat/hook-cut.png" words="LE MEILLEUR|PLAT" red={[10]} top={590} size={200} origin="30% 55%" from={0.1} />;
    case 'hookB':
      return <Behind bg="plat/hook.jpg" cut="plat/hook-cut.png" words="INVISIBLE." red={[0]} top={640} size={210} origin="20% 62%" from={L.l02} />;
    case 'dark':
      return <><Pic src="plat/hook.jpg" origin="48% 42%" extra={1.55} filter="brightness(1.05) contrast(1.05) saturate(.7)" /><Pill text="21 H · VITRINE ÉTEINTE" from={L.l03} /></>;
    case 'walk':
      return <Clip src="plat/street.mp4" from={0} at={s.at} origin="50% 55%" extra={1.12} />;
    case 'plat':
      return (
        <AbsoluteFill style={{background: '#1A0C0C'}}>
          <Pic src="plat/plat-bg.jpg" origin="50% 50%" />
          <Steam />
          <Pill text="LA RECETTE ✓" from={L.l05 + 0.3} />
        </AbsoluteFill>
      );
    case 'back':
      return <Pic src="plat/hook.jpg" origin="48% 42%" extra={1.35} filter="brightness(.95) contrast(1.05) saturate(.6)" />;
    case 'bundle':
      return <><Pic src="plat/bundle.jpg" /><Pill text="INSTALLATION ×10" from={L.l06} /></>;
    case 'install':
      return <><Pic src="plat/install.jpg" /><Pill text="INSTALLATION ×10" from={-1} /></>;
    case 'slide':
      return <><Pic src="plat/slide.jpg" origin="50% 30%" /><Pill text="INSTALLATION ×10" from={-1} /></>;
    case 'inoff':
      return <><Pic src="plat/in-off.jpg" /><Pill text="INSTALLATION ×10" from={-1} /></>;
    case 'switch': {
      const on = t >= CLICK;
      const k = clamp((t - CLICK) / 0.35);
      return (
        <AbsoluteFill>
          <Pic src="plat/stop.jpg" origin="44% 46%" extra={1.5} filter={on ? `brightness(${1.05 + 0.15 * k}) contrast(1.06) saturate(1.15)` : 'brightness(.55) contrast(1.05) saturate(.55)'} />
          {on ? <Big text="CLIC." from={CLICK} top={240} size={230} color={INK} bg="#fff" /> : null}
        </AbsoluteFill>
      );
    }
    case 'stop':
      return <><Behind bg="plat/stop.jpg" cut="plat/stop-cut.png" words="ILS S'ARRÊTENT." red={[1]} top={1060} size={150} origin="70% 45%" from={L.l09} /><Sticker text="+60 %" from={L.l09 + 0.8} x={70} y={420} rot={-7} /></>;
    case 'queue':
      return <><Clip src="plat/street.mp4" from={3.2} at={s.at} origin="50% 52%" extra={1.12} /><Pill text="ILS POINTENT · ILS FONT LA FILE" from={L.l09 + 2.0} /></>;
    case 'real':
      return <><Clip src="promo/install1.mp4" from={0} at={s.at} origin="50% 40%" /><Pill text="VRAIE INSTALLATION FEEHA" from={L.l10} /></>;
    case 'card':
      return <Card />;
    default:
      return null;
  }
};

export const FeehaPlat = ({audio}: {audio: boolean}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {s, local} = shotAt(t);
  const cutFlash = s.at > 0 ? lin(local, 0, 0.1, 0.35, 0) : 0;
  const clickFlash = lin(t - CLICK, 0, 0.3, 1, 0) * (t >= CLICK ? 1 : 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ShotView />
      {/* light top/bottom shade so type reads, no dark grade */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,.32) 100%)', pointerEvents: 'none', opacity: t >= L.l11 ? 0 : 1}} />
      <Captions />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(cutFlash, clickFlash), pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / PLAT_FRAMES) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('plat-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
