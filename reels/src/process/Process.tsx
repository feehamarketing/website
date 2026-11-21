import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COND, SANS} from '../anim/Art';

// 8 s process animation on the client's own scene image (940x1672, scaled to 1080x1920).
// Camera fixed. Highlights, steam and a bowl moving along the counter. No voice.
const S = 1080 / 940;
const p = (x: number, y: number) => ({left: x * S, top: y * S});
const RED = '#D71920';

const Label = ({text, from, top}: {text: string; from: number; top: number}) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const a = interpolate(f, [from, from + 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity: a}}>
      <span style={{display: 'inline-block', fontFamily: COND, fontSize: 80, lineHeight: 1, color: '#fff', background: RED, padding: '12px 26px 4px', borderRadius: 14}}>{text}</span>
    </div>
  );
};

const Ring = ({x, y, w, h, from, to}: {x: number; y: number; w: number; h: number; from: number; to: number}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const pulse = 1 + 0.06 * Math.sin((f - from) / 3);
  const o = interpolate(f, [to - 8, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pos = p(x, y);
  return (
    <div style={{position: 'absolute', left: pos.left, top: pos.top, width: w * S, height: h * S, border: '8px solid #FFD54A', borderRadius: 22, boxShadow: '0 0 30px rgba(255,213,74,.8)', transform: `scale(${pulse})`, opacity: o}} />
  );
};

// steam: little circles rising from the grill
const Steam = ({from, to}: {from: number; to: number}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const t = ((f - from) * 1.6 + k * 17) % 60;
        const x = 340 + k * 14 + Math.sin((f + k * 9) / 6) * 8;
        const pos = p(x, 730 - t * 1.1);
        return <div key={k} style={{position: 'absolute', left: pos.left, top: pos.top, width: 18 * S, height: 18 * S, borderRadius: 9, background: 'rgba(255,255,255,.85)', opacity: 1 - t / 60}} />;
      })}
    </>
  );
};

// the bowl: slides along the garnish counter toward the edge
const Bowl = ({from, to}: {from: number; to: number}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const t = interpolate(f, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = interpolate(t, [0, 1], [700, 860]);
  const y = interpolate(t, [0, 1], [800, 880]);
  const pos = p(x, y);
  return (
    <div style={{position: 'absolute', left: pos.left, top: pos.top, width: 90 * S, height: 56 * S}}>
      <div style={{width: '100%', height: '100%', borderRadius: '0 0 45px 45px', background: '#2B2B2F', border: '6px solid #F6EFE4'}} />
      <div style={{position: 'absolute', left: 10, top: -18, width: 70 * S, height: 30 * S, borderRadius: 35, background: '#7CB342'}} />
    </div>
  );
};

// the first customer steps aside, the queue moves up
const Queue = ({from}: {from: number}) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const a = interpolate(f, [from, from + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arrowY = 1280 - a * 60;
  const pos = p(230, arrowY);
  return (
    <>
      <div style={{position: 'absolute', left: pos.left, top: pos.top, fontFamily: COND, fontSize: 90 * S, color: '#FFD54A', textShadow: '0 4px 12px rgba(0,0,0,.6)'}}>⬆</div>
    </>
  );
};

export const FeehaProcess = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#D71920'}}>
      <Img src={staticFile('process/base.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, objectFit: 'cover'}} />

      {/* 0-2 s : caisse, the customer points, the cashier taps */}
      <Ring x={100} y={820} w={130} h={120} from={0} to={62} />
      <Label text="1 · CAISSE" from={0} top={150} />
      {f >= 14 && f < 24 ? (
        <div style={{position: 'absolute', ...p(128, 848), width: 40 * S, height: 40 * S, borderRadius: 20, border: '6px solid #fff', transform: `scale(${1 + (f - 14) / 8})`, opacity: 1 - (f - 14) / 10}} />
      ) : null}

      {/* 2-4 s : grill, steam and sizzle */}
      <Ring x={255} y={600} w={330} h={285} from={60} to={122} />
      <Steam from={62} to={122} />
      <Label text="2 · GRILL" from={62} top={150} />

      {/* 4-6 s : garnitures, bowl slides to the counter edge */}
      <Ring x={600} y={650} w={320} h={240} from={122} to={182} />
      <Bowl from={130} to={178} />
      <Label text="3 · GARNITURES" from={122} top={150} />

      {/* 6-8 s : the queue moves forward */}
      <Queue from={185} />
      <Ring x={225} y={1010} w={150} h={560} from={185} to={240} />
      <Label text="4 · LA FILE AVANCE" from={185} top={150} />
    </AbsoluteFill>
  );
};
