import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, Bubble, COND, LOOKS, Person, SANS, clampI, lerpColor} from '../anim/Art';
import timeline from './timeline.json';

// Video 1 : "Le resto devant lequel tu passes sans jamais entrer". Drawn illustration, no photos.
const POP = {damping: 9, stiffness: 240, mass: 0.6};
const sp = (f: number, d: number, cfg = {damping: 12, stiffness: 170}) => spring({frame: f - d, fps: 30, config: cfg});
const GROUND = 1500;
const WIN = {x: 110, y: 700, w: 620, h: 640};
const BRICK = '#7A5A4A';

export const Sandwich = ({p}: {p: number}) => {
  const drop = (i: number) => (1 - clampI(p, i * 0.1, i * 0.1 + 0.35, 0, 1)) * -160;
  return (
    <svg width={480} height={360} viewBox="0 0 400 300" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${drop(0)})`}>
        <rect x="6" y="150" width="26" height="130" fill="#F2C94C" transform="rotate(-14 19 215)" />
        <rect x="368" y="150" width="26" height="130" fill="#F2C94C" transform="rotate(14 381 215)" />
      </g>
      <g transform={`translate(0 ${drop(1)})`}>
        <rect x="50" y="232" width="300" height="46" rx="23" fill="#E0A95E" />
      </g>
      <g transform={`translate(0 ${drop(2)})`}>
        <path d="M50 232 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 q14 -26 28 0 Z" fill="#7CB342" />
      </g>
      <g transform={`translate(0 ${drop(3)})`}>
        <path d="M54 226 L54 196 L74 182 L94 196 L114 182 L134 196 L154 182 L174 196 L194 182 L214 196 L234 182 L254 196 L274 182 L294 196 L314 182 L334 196 L346 190 L346 226 Z" fill="#B5622B" />
        {[84, 150, 220, 290].map((x) => (
          <circle key={x} cx={x} cy={208} r="4" fill="#8A4520" />
        ))}
      </g>
      <g transform={`translate(0 ${drop(4)})`}>
        <path d="M70 184 q8 14 16 0 q8 18 16 0 q8 14 16 0 q8 18 16 0 q8 14 16 0 q8 18 16 0 q8 14 16 0 q8 18 16 0 q8 14 16 0 q8 18 16 0 q8 14 16 0 q8 18 16 0 q8 14 16 0 Z" fill="#FFF3D1" />
      </g>
      <g transform={`translate(0 ${drop(5)})`}>
        <path d="M44 170 Q44 74 200 74 Q356 74 356 170 Z" fill="#E0A95E" />
        {[[120, 118], [160, 102], [205, 100], [250, 108], [290, 124], [190, 130]].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="5" ry="3" fill="#FFFFFF" />
        ))}
      </g>
    </svg>
  );
};

const Storefront = ({lit, plate, labelOn}: {lit: number; plate: number; labelOn: number}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#2A2F4A 0%,#4B4560 55%,#7A6266 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, height: GROUND - 330, background: BRICK, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 40px)'}} />
    <div style={{position: 'absolute', left: 120, width: 840, top: 380, height: 120, background: '#1F1F24', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: COND, fontSize: 96, letterSpacing: 6, color: lit > 0.5 ? '#F3D9A4' : '#8E8E95'}}>
      RESTAURANT
    </div>
    <div style={{position: 'absolute', left: 90, width: 900, top: 520, height: 70, background: `repeating-linear-gradient(90deg, ${A.red} 0 60px, ${A.cream} 60px 120px)`, clipPath: 'polygon(0 0,100% 0,96% 100%,4% 100%)'}} />
    <div style={{position: 'absolute', left: WIN.x - 18, top: WIN.y - 18, width: WIN.w + 36, height: WIN.h + 36, background: '#161418', borderRadius: 6}} />
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', background: lerpColor('#3A3340', '#F7C878', lit)}}>
      {[120, 310, 500].map((lx) => (
        <div key={lx} style={{position: 'absolute', left: lx - 110, top: 0, width: 220, height: 380, background: `radial-gradient(ellipse at 50% 0%, rgba(255,214,150,${0.25 + 0.4 * lit}), transparent 70%)`}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: lerpColor('#4A3428', '#8A5E3C', lit)}} />
      <div style={{position: 'absolute', left: 150, top: 150, width: 320, height: 200, background: '#E8E2D6', opacity: 1 - plate, borderRadius: 6}} />
      <div style={{position: 'absolute', left: 70, top: 110, opacity: clampI(plate, 0, 0.3, 0, 1)}}>
        <Sandwich p={plate} />
      </div>
      <div style={{position: 'absolute', left: 30, width: 560, top: 30, textAlign: 'center', opacity: labelOn}}>
        <span style={{display: 'inline-block', fontFamily: COND, fontSize: 52, lineHeight: 1, color: A.white, background: A.red, padding: '10px 22px 4px', borderRadius: 12, transform: `scale(${interpolate(labelOn, [0, 1], [1.4, 1])})`}}>
          SANDWICH AU POULET CROUSTILLANT
        </span>
      </div>
    </div>
    <div style={{position: 'absolute', left: 800, top: 760, width: 220, height: GROUND - 760, background: '#1F1F23', border: '8px solid #4A443F'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, background: '#8E8A8F'}} />
  </AbsoluteFill>
);

const Passer = ({f}: {f: number}) => {
  const x = f < 50 ? interpolate(f, [0, 50], [-150, 330], {easing: (v) => 1 - (1 - v) ** 2}) : 330;
  const moving = f < 50 ? 1 : 0;
  const turn = clampI(f, 55, 70, 0, 1);
  const b = f >= 60 ? sp(f, 60, POP) : 0;
  return (
    <>
      <Person x={x} y={GROUND + 80} look={LOOKS[1]} walk={f * 0.34} moving={moving} turn={turn} scale={1.6} dir={1} />
      {f >= 60 ? <Bubble x={x} y={GROUND + 80 - 300 * 1.6} p={b} text="?" /> : null}
    </>
  );
};

const Cap = ({text, d = 0, size = 96, top = 130}: {text: string; d?: number; size?: number; top?: number}) => {
  const f = useCurrentFrame();
  if (f < d) return null;
  const p = sp(f, d, POP);
  return (
    <div style={{position: 'absolute', top, left: 50, right: 50, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: COND, fontSize: size, lineHeight: 1, color: A.white, background: 'rgba(20,19,23,.9)', padding: '16px 34px 8px', borderRadius: 20, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`}}>
        {text}
      </div>
    </div>
  );
};

const Scene1 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Storefront lit={0.2} plate={0} labelOn={0} />
      <Passer f={f} />
      <Cap text="POURQUOI T'ES JAMAIS ENTRÉ ?" d={0} />
    </AbsoluteFill>
  );
};

const Scene2 = () => (
  <AbsoluteFill>
    <Storefront lit={0.2} plate={0} labelOn={0} />
    <Passer f={200} />
    <Cap text="ON Y MANGE QUOI ?" d={0} />
  </AbsoluteFill>
);

const Scene3 = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0, {damping: 11, stiffness: 150});
  const lab = sp(f, 25, POP);
  return (
    <AbsoluteFill>
      <Storefront lit={0.8} plate={p} labelOn={lab} />
      <Passer f={200} />
      <Cap text="UN SEUL PLAT" d={0} />
    </AbsoluteFill>
  );
};

const Frame = ({left, label, on}: {left: number; label: string; on: boolean}) => (
  <>
    <div style={{position: 'absolute', left, top: 380, fontFamily: COND, fontSize: 60, color: on ? A.red : '#888', lineHeight: 1}}>{label}</div>
    <div style={{position: 'absolute', left, top: 460, width: 454, height: 806, overflow: 'hidden', borderRadius: 18, border: '6px solid #fff', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: 'scale(0.42)', transformOrigin: '0 0'}}>
        <Storefront lit={on ? 0.8 : 0.2} plate={on ? 1 : 0} labelOn={on ? 1 : 0} />
      </div>
    </div>
  </>
);

const Scene4 = () => (
  <AbsoluteFill>
    <Frame left={40} label="AVANT" on={false} />
    <Frame left={586} label="APRÈS" on={true} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', fontSize: 120}}>📱</div>
    <Cap text="ON MANGE QUOI ICI ?" d={0} />
  </AbsoluteFill>
);

const Scene5 = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0, POP);
  return (
    <AbsoluteFill>
      <Storefront lit={1} plate={1} labelOn={1} />
      <div style={{position: 'absolute', top: 1400, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: COND, fontSize: 200, lineHeight: 0.9, color: A.white, background: A.red, padding: '20px 60px 10px', borderRadius: 24, transform: `rotate(-2deg) scale(${interpolate(p, [0, 1], [1.6, 1])})`}}>FEEHA</div>
      </div>
      <Cap text="D'AUTRES TESTS COMME ÇA" d={30} top={1620} size={80} />
    </AbsoluteFill>
  );
};

export const FeehaVitrine = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes} = timeline as {scenes: {id: string; from: number; to: number}[]};
  const SCENES: Record<string, React.ReactNode> = {
    s1: <Scene1 />,
    s2: <Scene2 />,
    s3: <Scene3 />,
    s4: <Scene4 />,
    s5: <Scene5 />,
  };
  return (
    <AbsoluteFill style={{background: A.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <div style={{position: 'absolute', top: 40, right: 40, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: 'rgba(255,255,255,.7)', background: 'rgba(0,0,0,.45)', padding: '6px 14px', borderRadius: 8}}>ILLUSTRATION</div>
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: A.red}} />
      {audio ? <Audio src={staticFile('vitrine-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
