import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import words from './words.json';

// Pro edit of the client's talking-head video: "4 raisons d'acheter nos panneaux Feeha".
// Layers: graded video -> giant type -> cut-out person (text goes BEHIND him) -> captions & stickers.
const RED = '#E11D2E';
const YEL = '#FFD43B';
const INK = '#0E0D10';
const ANTON = '"Anton", sans-serif';
const MONT = '"Montserrat", sans-serif';
const POP = {damping: 10, stiffness: 220, mass: 0.6};
const SOFT = {damping: 16, stiffness: 120};
export const PROMO_FRAMES = Math.round(24.6 * 30);
const END_AT = 22.7;

type W = {text: string; start: number; end: number};
const WORDS = words as W[];

// sections: when each point starts, the giant word behind the person, the small label
const SECTIONS = [
  {at: 0, num: '4', big: 'RAISONS', label: "D'ACHETER NOS PANNEAUX"},
  {at: 3.82, num: '01', big: 'LUMINEUX', label: 'RAISON 1 / 4'},
  {at: 11.04, num: '02', big: 'FACILE', label: 'RAISON 2 / 4'},
  {at: 13.06, num: '03', big: 'POSTERS', label: 'RAISON 3 / 4'},
  {at: 19.06, num: '04', big: 'MODERNE', label: 'RAISON 4 / 4'},
];
const sectionAt = (t: number) => [...SECTIONS].reverse().find((s) => t >= s.at)!;

// one camera move shared by the video and the cut-out, so they stay aligned
const useCamera = () => {
  const t = useCurrentFrame() / 30;
  const s = sectionAt(t);
  const k = SECTIONS.indexOf(s);
  const local = t - s.at;
  const punch = spring({frame: Math.round(local * 30), fps: 30, config: SOFT});
  const base = 1.04 + 0.04 * Math.min(1, local / 6); // slow push-in
  const scale = base + (k % 2 === 1 ? 0.05 : 0.02) * punch;
  const x = (k % 2 === 1 ? -14 : 14) * punch;
  return `scale(${scale}) translateX(${x}px)`;
};

const Graded = ({children}: {children: React.ReactNode}) => {
  const cam = useCamera();
  return <AbsoluteFill style={{transform: cam, transformOrigin: '50% 38%'}}>{children}</AbsoluteFill>;
};

// giant type, drawn BEHIND the person
const BehindText = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t >= END_AT) return null;
  const s = sectionAt(t);
  const local = t - s.at;
  const p = spring({frame: Math.round(local * 30), fps: 30, config: {damping: 14, stiffness: 140}});
  const drift = local * 6;
  const isHook = s.at === 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* outlined giant number */}
      <div style={{position: 'absolute', left: 0, right: 0, top: isHook ? 120 : 170, textAlign: 'center', fontFamily: ANTON, fontSize: isHook ? 760 : 620, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `10px ${isHook ? RED : 'rgba(255,255,255,.9)'}`, opacity: interpolate(p, [0, 1], [0, 0.95]), transform: `translateY(${(1 - p) * 120 - drift}px) scale(${interpolate(p, [0, 1], [1.25, 1])})`}}>
        {s.num}
      </div>
      {/* filled giant word */}
      <div style={{position: 'absolute', left: -40, right: -40, top: isHook ? 640 : 560, textAlign: 'center', fontFamily: ANTON, fontSize: s.big.length > 7 ? 230 : 270, lineHeight: 0.9, letterSpacing: 4, color: '#fff', textShadow: '0 12px 40px rgba(0,0,0,.35)', transform: `translateX(${(1 - p) * (SECTIONS.indexOf(s) % 2 ? 500 : -500) + (SECTIONS.indexOf(s) % 2 ? -drift : drift)}px)`, opacity: p}}>
        {s.big}
      </div>
    </AbsoluteFill>
  );
};

// small label pill at the top + hook title
const TopLabel = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t >= END_AT) return null;
  const s = sectionAt(t);
  const p = spring({frame: Math.round((t - s.at) * 30), fps: 30, config: POP});
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 3, color: '#fff', background: RED, padding: '14px 28px', borderRadius: 999, boxShadow: '0 10px 30px rgba(225,29,46,.45)', transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`, opacity: p}}>
        {s.at === 0 ? 'PANNEAUX LUMINEUX FEEHA' : s.label}
      </div>
    </div>
  );
};

// stat sticker for reason 1
const Sticker = ({text, from, to, x, y, rot}: {text: string; from: number; to: number; x: number; y: number; rot: number}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < from || t >= to) return null;
  const p = spring({frame: f - Math.round(from * 30), fps: 30, config: POP});
  const o = interpolate(t, [to - 0.2, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`}}>
      <div style={{background: YEL, color: INK, fontFamily: ANTON, fontSize: 96, lineHeight: 1, padding: '18px 28px 14px', borderRadius: 18, border: `6px solid ${INK}`, boxShadow: '10px 10px 0 rgba(0,0,0,.85)'}}>{text}</div>
    </div>
  );
};

// captions: max 3 words, karaoke highlight
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[.,?!]$/.test(w.text)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
})();

const Captions = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t >= END_AT) return null;
  const chunk = CHUNKS.find((c, i) => {
    const next = CHUNKS[i + 1];
    return t >= c[0].start - 0.05 && t < (next ? Math.min(next[0].start - 0.05, c[c.length - 1].end + 0.6) : c[c.length - 1].end + 0.6);
  });
  if (!chunk) return null;
  const p = spring({frame: f - Math.round(chunk[0].start * 30), fps: 30, config: POP});
  return (
    <div style={{position: 'absolute', top: 1300, left: 40, right: 40, textAlign: 'center', transform: `translateY(${(1 - p) * 30}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`}}>
      {chunk.map((w, i) => {
        const on = t >= w.start;
        const now = on && t < w.end + 0.05;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 12px', padding: now ? '4px 14px 0' : '4px 0 0', borderRadius: 14, background: now ? RED : 'transparent', fontFamily: MONT, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: on ? '#fff' : 'rgba(255,255,255,.6)', WebkitTextStroke: now ? '0' : '5px #000', paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,.6)', transform: `scale(${now ? 1.08 : 1})`}}>
            {w.text.replace(/[.,]$/, '').toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

const EndCard = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < END_AT) return null;
  const p = spring({frame: f - Math.round(END_AT * 30), fps: 30, config: POP});
  const p2 = spring({frame: f - Math.round((END_AT + 0.35) * 30), fps: 30, config: POP});
  const p3 = spring({frame: f - Math.round((END_AT + 0.7) * 30), fps: 30, config: POP});
  const bob = Math.sin((t - END_AT) * 8) * 10;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #FF3B4A 0%, ${RED} 45%, #7A0B16 100%)`, alignItems: 'center', justifyContent: 'center', opacity: interpolate(t, [END_AT, END_AT + 0.12], [0, 1], {extrapolateRight: 'clamp'})}}>
      <div style={{fontFamily: ANTON, fontSize: 330, lineHeight: 0.85, color: '#fff', letterSpacing: 6, transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`, textShadow: '0 20px 0 rgba(0,0,0,.2)'}}>FEEHA</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, letterSpacing: 8, color: '#fff', marginTop: 14, opacity: p}}>PANNEAUX LUMINEUX</div>
      <div style={{marginTop: 70, background: '#fff', color: RED, fontFamily: ANTON, fontSize: 104, padding: '18px 44px 14px', borderRadius: 22, transform: `rotate(-2deg) scale(${interpolate(p2, [0, 1], [1.6, 1])})`, opacity: t >= END_AT + 0.35 ? 1 : 0, boxShadow: '12px 12px 0 rgba(0,0,0,.25)'}}>FEEHAPANELS.COM</div>
      <div style={{marginTop: 44, fontFamily: MONT, fontWeight: 800, fontSize: 50, color: '#fff', opacity: p3, transform: `translateY(${bob * 0.3}px)`}}>Écris-nous en DM ↓</div>
    </AbsoluteFill>
  );
};

export const FeehaPromo = ({audio}: {audio: boolean}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / 30;
  const sinceCut = Math.min(...SECTIONS.map((s) => (t >= s.at && s.at > 0 ? t - s.at : 99)), t >= END_AT ? t - END_AT : 99);
  const flash = interpolate(sinceCut, [0, 0.12], [0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Graded>
        <OffthreadVideo src={staticFile('promo/base.mp4')} muted style={{width: 1080, height: 1920, filter: 'contrast(1.06) saturate(1.12) brightness(0.92)'}} />
      </Graded>
      {/* darken the top so the giant type reads */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)'}} />
      <BehindText />
      <Graded>
        <OffthreadVideo src={staticFile('promo/person.webm')} transparent muted style={{width: 1080, height: 1920, filter: 'contrast(1.06) saturate(1.12) brightness(0.98)'}} />
      </Graded>
      <TopLabel />
      <Sticker text="+50 À 60 %" from={6.12} to={10.9} x={560} y={1060} rot={-6} />
      <Captions />
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <EndCard />
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('promo-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
