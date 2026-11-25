import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import tl from './timeline.json';

// « Le plat invisible » — Feeha Reel, 1080×1920, 30 fps.
// Every picture is generated in code (Lemo clip public/plat/world.mp4, 0–21.8 s; source in scripts/plat/lemo-world):
// the giant type is drawn inside that clip between the street and the foreground person, so it sits behind him.
// Remotion adds the cut punches, captions, labels, sticker, flashes, end card and the mix.
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

// ---------- cuts (same list as the Lemo clip) ----------
const CUTS = [0, 1.4, 2.7, 4.0, 5.3, 7.2, 10.9, 11.55, 12.2, 12.85, 13.5, 15.8, 17.2, 20.4];
const CARD = 20.4;
const FB_IN = 2.7; // flashback starts (rewind)
const cutAt = (t: number) => { let i = 0; CUTS.forEach((c, k) => { if (t >= c) i = k; }); return {i, local: t - CUTS[i]}; };
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// the generated film, with a small punch on every cut (never a big blurry zoom)
const World = () => {
  const t = useCurrentFrame() / FPS;
  const {i, local} = cutAt(t);
  const punch = spring({frame: Math.round(local * FPS), fps: FPS, config: SOFT});
  const scale = 1.045 - 0.045 * punch;
  return (
    <AbsoluteFill style={{transform: `translateX(${(i % 2 ? -8 : 8) * (1 - punch)}px) scale(${scale})`}}>
      <OffthreadVideo src={staticFile('plat/world.mp4')} muted style={{width: 1080, height: 1920, filter: t >= FB_IN && t < CLICK ? 'saturate(.32) sepia(.28) contrast(1.06) brightness(1.08)' : 'brightness(1.06) contrast(1.04) saturate(1.08)'}} />
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
  if (t >= CARD) return null;
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
  const at = (d: number) => spring({frame: f - Math.round((CARD + d) * FPS), fps: FPS, config: POP});
  const p = at(0), p2 = at(0.25), p3 = at(0.5), p4 = at(0.75);
  const glow = 0.6 + 0.4 * Math.sin((t - CARD) * 3);
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
// rewind into the flashback: tape lines, colour split, a fast reverse blur
const Rewind = () => {
  const t = useCurrentFrame() / FPS;
  const k = t - FB_IN + 0.35;
  if (k < 0 || k > 0.6) return null;
  const a = Math.sin(Math.PI * clamp(k / 0.6));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((i * 331 + k * 4200) % 1920), height: 26 + (i % 3) * 18, background: 'rgba(255,255,255,.35)', opacity: a, mixBlendMode: 'screen'}} />)}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,0,60,.18), rgba(0,200,255,.18))', opacity: a, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
// flashback frame: soft vignette + film grain while we are in the past
const PastFrame = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < FB_IN || t >= CLICK) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,20,10,.45) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.08, backgroundImage: `repeating-linear-gradient(${(f * 37) % 180}deg, rgba(255,255,255,.6) 0 1px, transparent 1px 3px)`, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};
const Labels = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <>
      {t < FB_IN ? <Pill text="MAINTENANT" from={0.1} /> : null}
      {t >= FB_IN && t < 5.3 ? <Pill text="IL Y A 3 MOIS" from={FB_IN} /> : null}
      {t >= 5.3 && t < 7.2 ? <Pill text="LA RECETTE : PARFAITE" from={5.5} /> : null}
      {t >= 7.2 && t < 9.6 ? <Pill text="ESSAI : UN BEAU POSTER" from={7.2} /> : null}
      {t >= 9.6 && t < 10.9 ? <Pill text="18 H → 21 H" from={9.6} /> : null}
      {t >= 10.9 && t < 13.5 ? <Pill text="SOLUTION : PANNEAU LUMINEUX" from={10.9} /> : null}
      {t >= CLICK && t < 15.8 ? <Big text="CLIC." from={CLICK} top={230} size={230} color={INK} bg="#fff" /> : null}
      {t >= 15.8 && t < 17.2 ? <><Pill text="AUJOURD'HUI" from={15.8} /><Sticker text="+60 %" from={16.2} x={660} y={1000} rot={6} /></> : null}
      {t >= 17.2 && t < CARD ? <Pill text="LA SEULE VITRINE QU'ON VOIT" from={17.2} /> : null}
    </>
  );
};

export const FeehaPlat = ({audio}: {audio: boolean}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {i, local} = cutAt(t);
  const cutFlash = i > 0 ? lin(local, 0, 0.1, 0.3, 0) : 0;
  const clickFlash = t >= CLICK ? lin(t - CLICK, 0, 0.3, 1, 0) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < CARD ? <World /> : <Card />}
      {t < CARD ? <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.22) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 64%, rgba(0,0,0,.28) 100%)', pointerEvents: 'none'}} /> : null}
      {t < CARD ? <PastFrame /> : null}
      {t < CARD ? <Labels /> : null}
      <Rewind />
      <Captions />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(cutFlash, clickFlash), pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / PLAT_FRAMES) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('plat-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
