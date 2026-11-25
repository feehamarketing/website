import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import words from './words.json';

// Pro edit of the client's own talking-head video: "4 raisons d'acheter nos panneaux Feeha".
// Sharpened/upscaled base video, word-by-word captions, numbered point badges, end card.
const RED = '#C8102E';
const INK = '#111014';
const COND = '"Bebas Neue", sans-serif';
const SANS = '"Inter", sans-serif';
const POP = {damping: 10, stiffness: 220, mass: 0.6};
export const PROMO_FRAMES = Math.round(24.6 * 30);
const END_AT = 22.7;

type W = {text: string; start: number; end: number};
const WORDS = words as W[];

// caption chunks: at most 3 words, break on punctuation
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
    <div style={{position: 'absolute', top: 1230, left: 40, right: 40, textAlign: 'center', transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`}}>
      {chunk.map((w, i) => {
        const on = t >= w.start;
        const now = on && t < w.end + 0.05;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', fontFamily: COND, fontSize: 118, lineHeight: 1, color: now ? '#FFD43B' : on ? '#fff' : 'rgba(255,255,255,.55)', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: '0 8px 18px rgba(0,0,0,.55)'}}>
            {w.text.replace(/[.,]$/, '').toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

const Badge = ({n, text, from, to, sub, subFrom}: {n?: string; text: string; from: number; to: number; sub?: string; subFrom?: number}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < from || t >= to) return null;
  const p = spring({frame: f - Math.round(from * 30), fps: 30, config: POP});
  const out = interpolate(t, [to - 0.25, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ps = subFrom !== undefined && t >= subFrom ? spring({frame: f - Math.round(subFrom * 30), fps: 30, config: POP}) : 0;
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, maxWidth: 980, boxSizing: 'border-box', background: INK, borderRadius: 22, padding: n ? '14px 30px 10px 14px' : '18px 34px 12px', boxShadow: '0 16px 40px rgba(0,0,0,.45)', transform: `translateY(${(1 - p) * -60}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`}}>
        {n ? <div style={{width: 92, height: 92, borderRadius: 18, background: RED, color: '#fff', fontFamily: COND, fontSize: 84, lineHeight: '98px', textAlign: 'center'}}>{n}</div> : null}
        <div style={{fontFamily: COND, fontSize: n ? 84 : 96, lineHeight: 1, color: '#fff', paddingTop: 6, textAlign: 'center'}}>{text}</div>
      </div>
      {sub && ps > 0 ? (
        <div style={{marginTop: 18, background: '#FFD43B', color: INK, fontFamily: COND, fontSize: 72, lineHeight: 1, padding: '12px 26px 6px', borderRadius: 16, transform: `rotate(-2deg) scale(${interpolate(ps, [0, 1], [1.6, 1])})`}}>{sub}</div>
      ) : null}
    </div>
  );
};

const EndCard = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < END_AT) return null;
  const p = spring({frame: f - Math.round(END_AT * 30), fps: 30, config: POP});
  const p2 = spring({frame: f - Math.round((END_AT + 0.35) * 30), fps: 30, config: POP});
  return (
    <AbsoluteFill style={{background: RED, alignItems: 'center', justifyContent: 'center', opacity: interpolate(t, [END_AT, END_AT + 0.15], [0, 1], {extrapolateRight: 'clamp'})}}>
      <div style={{fontFamily: COND, fontSize: 250, lineHeight: 0.9, color: '#fff', transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`}}>FEEHA</div>
      <div style={{fontFamily: COND, fontSize: 90, color: '#fff', marginTop: 10, opacity: p}}>PANNEAUX LUMINEUX</div>
      <div style={{marginTop: 60, background: '#fff', color: RED, fontFamily: COND, fontSize: 96, padding: '16px 40px 8px', borderRadius: 20, transform: `rotate(-2deg) scale(${interpolate(p2, [0, 1], [1.6, 1])})`, opacity: t >= END_AT + 0.35 ? 1 : 0}}>FEEHAPANELS.COM</div>
      <div style={{marginTop: 34, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: '#fff', opacity: p2}}>Écris-nous en DM</div>
    </AbsoluteFill>
  );
};

export const FeehaPromo = ({audio}: {audio: boolean}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / 30;
  // subtle punch-in on each new point so the shot never feels static
  const cuts = [0, 3.82, 11.04, 13.06, 19.06];
  const last = Math.max(...cuts.filter((c) => c <= t));
  const zoom = 1 + 0.06 * Math.min(1, (t - last) / 0.35) * (cuts.indexOf(last) % 2 === 1 ? 1 : 0.5);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <OffthreadVideo src={staticFile('promo/base.mp4')} muted style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,.45) 100%)'}} />
      <Badge text="4 RAISONS D'ACHETER NOS PANNEAUX FEEHA" from={0} to={3.7} />
      <Badge n="1" text="ULTRA LUMINEUX" from={3.82} to={10.9} sub="50 À 60 % + LUMINEUX" subFrom={6.12} />
      <Badge n="2" text="FACILE À INSTALLER" from={11.04} to={12.95} />
      <Badge n="3" text="POSTERS INTERCHANGEABLES" from={13.06} to={18.95} />
      <Badge n="4" text="BEAU ET MODERNE" from={19.06} to={END_AT} />
      <Captions />
      <EndCard />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(f / durationInFrames) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('promo-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
