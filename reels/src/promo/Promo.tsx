import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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
export const PROMO_FRAMES = Math.round(34.3 * 30);
const END_AT = 22.7; // end of the talking part
const RESULTS_AT = 22.7;
const PHOTO_AT = 28.0;
const CARD_AT = 30.8;

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
      {/* filled giant word */}
      <div style={{position: 'absolute', left: -40, right: -40, top: 205, textAlign: 'center', fontFamily: ANTON, fontSize: 160, lineHeight: 0.9, letterSpacing: 4, color: '#fff', textShadow: '0 12px 40px rgba(0,0,0,.35)', transform: `translateX(${(1 - p) * (SECTIONS.indexOf(s) % 2 ? 500 : -500) + (SECTIONS.indexOf(s) % 2 ? -drift : drift)}px)`, opacity: p}}>
        {isHook ? `${s.num} ${s.big}` : s.big}
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

const ResultsLabel = ({from}: {from: number}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - Math.round(from * 30), fps: 30, config: POP});
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 38, letterSpacing: 6, color: '#fff', background: RED, padding: '12px 26px', borderRadius: 999, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`, opacity: p}}>RÉSULTATS CHEZ NOS CLIENTS</div>
      <div style={{marginTop: 18, fontFamily: ANTON, fontSize: 130, lineHeight: 0.95, color: '#fff', textShadow: '0 10px 30px rgba(0,0,0,.6)', transform: `translateY(${(1 - p) * 40}px)`, opacity: p}}>INSTALLÉS ✓</div>
    </div>
  );
};

const Results = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < RESULTS_AT || t >= CARD_AT) return null;
  const photoT = t - PHOTO_AT;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={Math.round(RESULTS_AT * 30)} durationInFrames={Math.round((PHOTO_AT - RESULTS_AT) * 30)} layout="none">
        <OffthreadVideo src={staticFile('promo/install1.mp4')} muted style={{position: 'absolute', width: 1080, height: 1920, transform: `scale(${1.04 + (t - RESULTS_AT) * 0.01})`}} />
      </Sequence>
      {t >= PHOTO_AT ? (
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <Img src={staticFile('promo/install2.jpg')} style={{position: 'absolute', left: -180, top: 0, width: 1440, height: 1920, objectFit: 'cover', transform: `scale(${1.02 + photoT * 0.035}) translateX(${-photoT * 18}px)`, transformOrigin: '60% 45%'}} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 75%, rgba(0,0,0,.55) 100%)'}} />
      <ResultsLabel from={RESULTS_AT} />
      <div style={{position: 'absolute', bottom: 430, left: 0, right: 0, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,.8)', opacity: interpolate(t, [RESULTS_AT + 0.4, RESULTS_AT + 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {t < PHOTO_AT ? 'Visibles de jour comme de nuit' : 'Ta vitrine, impossible à ignorer'}
      </div>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < CARD_AT) return null;
  const at = (d: number) => spring({frame: f - Math.round((CARD_AT + d) * 30), fps: 30, config: POP});
  const p = at(0), p2 = at(0.3), p3 = at(0.55), p4 = at(0.8);
  const sweep = ((t - CARD_AT) * 0.7) % 1.4 - 0.2;
  const glow = 0.6 + 0.4 * Math.sin((t - CARD_AT) * 3);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #3A0A12 0%, ${INK} 62%)`, alignItems: 'center', justifyContent: 'center', opacity: interpolate(t, [CARD_AT, CARD_AT + 0.15], [0, 1], {extrapolateRight: 'clamp'})}}>
      {/* glowing light-panel frame */}
      <div style={{position: 'absolute', left: 140, top: 360, width: 800, height: 900, borderRadius: 28, border: '14px solid #1b1b1f', background: `linear-gradient(160deg, ${RED}, #8E0E1C)`, boxShadow: `0 0 ${120 * glow}px rgba(225,29,46,.75), inset 0 0 60px rgba(255,255,255,.15)`, transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`, opacity: p, overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 100}%`, width: 180, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.35), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />
      </div>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 10, color: 'rgba(255,255,255,.85)', opacity: p2}}>PANNEAUX LUMINEUX</div>
        <div style={{fontFamily: ANTON, fontSize: 300, lineHeight: 0.95, color: '#fff', letterSpacing: 8, textShadow: '0 0 40px rgba(255,255,255,.35), 0 14px 0 rgba(0,0,0,.25)', transform: `scale(${interpolate(p2, [0, 1], [1.4, 1])})`, opacity: p2}}>FEEHA</div>
        <div style={{width: 520, height: 6, background: '#fff', margin: '18px auto 0', borderRadius: 3, transform: `scaleX(${p3})`}} />
        <div style={{marginTop: 46, fontFamily: MONT, fontWeight: 800, fontSize: 40, color: '#fff', opacity: p3}}>Fais briller ta vitrine</div>
      </div>
      <div style={{position: 'absolute', top: 1340, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div style={{background: '#fff', color: RED, fontFamily: ANTON, fontSize: 92, padding: '14px 44px 10px', borderRadius: 20, boxShadow: '0 14px 40px rgba(0,0,0,.5)', transform: `scale(${interpolate(p3, [0, 1], [1.5, 1])})`, opacity: p3}}>FEEHAPANELS.COM</div>
        <div style={{border: '5px solid #fff', color: '#fff', fontFamily: ANTON, fontSize: 76, padding: '8px 40px 4px', borderRadius: 20, transform: `scale(${interpolate(p4, [0, 1], [1.5, 1])})`, opacity: p4}}>FEEHA.CA</div>
        <div style={{marginTop: 10, fontFamily: MONT, fontWeight: 800, fontSize: 44, color: '#fff', opacity: p4, transform: `translateY(${Math.sin((t - CARD_AT) * 6) * 4}px)`}}>Écris-nous en DM ✉</div>
      </div>
    </AbsoluteFill>
  );
};

export const FeehaPromo = ({audio}: {audio: boolean}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / 30;
  const sinceCut = Math.min(...SECTIONS.map((s) => (t >= s.at && s.at > 0 ? t - s.at : 99)), ...[RESULTS_AT, PHOTO_AT, CARD_AT].map((c) => (t >= c ? t - c : 99)));
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
        <OffthreadVideo src={staticFile('promo/person.webm')} transparent muted style={{width: 1080, height: 1920, filter: 'contrast(1.06) saturate(1.12) brightness(0.92)'}} />
      </Graded>
      <TopLabel />
      <Sticker text="+50 À 60 %" from={6.12} to={10.9} x={560} y={1060} rot={-6} />
      <Captions />
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Results />
      <EndCard />
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('promo-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
