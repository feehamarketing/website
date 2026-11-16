import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

// Hand-built flat illustrations for the Feeha panels ad: walking people, a shop
// front at dusk, a Feeha LED panel and drawn promo posters. Everything is SVG
// or CSS, so it stays sharp at 1080x1920 and can be animated freely.

export const A = {
  red: '#A42325',
  redHi: '#D2393B',
  deep: '#6B1517',
  cream: '#F6EFE4',
  ink: '#141317',
  white: '#FFFFFF',
  warm: '#FFE2B0',
  glow: '#FFD48A',
  skyDay: '#7FA8D8',
  skyDusk: '#3A4E86',
  skyNight: '#0E1530',
  brick: '#8C3A2B',
  brickDark: '#5E261C',
  street: '#2A2C33',
  snow: '#EEF3FA',
};
export const COND = '"Bebas Neue", sans-serif';
export const SANS = '"Inter", sans-serif';

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const pb = b.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const lerpColor = mix;

// ---- people -----------------------------------------------------------------------
export type Look = {coat: string; hat: string; skin: string; pants: string; scarf?: string; bag?: boolean; tall?: number};
export const LOOKS: Look[] = [
  {coat: '#2E3A59', hat: '#C8402F', skin: '#E7B98F', pants: '#22252C', scarf: '#E9C46A'},
  {coat: '#6B4E3D', hat: '#2D2D2D', skin: '#B9835A', pants: '#2B2B33', bag: true, tall: 1.05},
  {coat: '#3F6B5C', hat: '#F2EDE4', skin: '#F0C9A4', pants: '#1F232A', scarf: '#B5374A', tall: 0.95},
  {coat: '#7A2E3A', hat: '#264653', skin: '#8D5B3E', pants: '#23262E'},
];

/**
 * A walking person seen from the side, feet at (x, y). `walk` is the walk-cycle
 * phase (radians), 0 = standing. `turn` 0..1 turns the head toward the viewer
 * (looking at the window), `scale` sets the size, `dir` 1 = walking right.
 */
export const Person = ({x, y, look, walk = 0, moving = 1, turn = 0, scale = 1, dir = 1, dim = 0, wave = 0}: {x: number; y: number; look: Look; walk?: number; moving?: number; turn?: number; scale?: number; dir?: 1 | -1; dim?: number; wave?: number}) => {
  const s = scale * (look.tall ?? 1);
  const leg = Math.sin(walk) * 26 * moving;
  const arm = -Math.sin(walk) * 22 * moving;
  const bob = Math.abs(Math.cos(walk)) * 4 * moving;
  const W = 120;
  const Hh = 300;
  return (
    <svg
      width={W * s}
      height={Hh * s}
      viewBox={`0 0 ${W} ${Hh}`}
      style={{position: 'absolute', left: x - (W * s) / 2, top: y - Hh * s, overflow: 'visible', filter: `brightness(${1 - dim * 0.55}) saturate(${1 - dim * 0.4})`}}
    >
      <ellipse cx={60} cy={296} rx={38} ry={7} fill="rgba(0,0,0,.25)" />
      <g transform={`translate(0 ${-bob}) ${dir === -1 ? 'translate(120 0) scale(-1 1)' : ''}`}>
        {/* back leg + back arm */}
        <g transform={`rotate(${-leg} 60 175)`}>
          <rect x={50} y={172} width={20} height={112} rx={10} fill={look.pants} />
          <rect x={46} y={274} width={34} height={16} rx={8} fill="#141414" />
        </g>
        <g transform={`rotate(${-arm} 60 92)`}>
          <rect x={50} y={88} width={18} height={84} rx={9} fill={mix(look.coat, '#000000', 0.25)} />
        </g>
        {/* coat */}
        <path d="M34 92 Q34 76 50 74 L72 74 Q88 76 88 92 L92 186 Q60 196 30 186 Z" fill={look.coat} />
        {look.bag ? <rect x={78} y={120} width={30} height={42} rx={6} fill="#2a2a2a" /> : null}
        {look.scarf ? <rect x={42} y={70} width={40} height={16} rx={8} fill={look.scarf} /> : null}
        {/* front leg */}
        <g transform={`rotate(${leg} 60 175)`}>
          <rect x={50} y={172} width={20} height={112} rx={10} fill={mix(look.pants, '#ffffff', 0.08)} />
          <rect x={46} y={274} width={34} height={16} rx={8} fill="#1d1d1d" />
        </g>
        {/* head */}
        <g transform={`translate(${-turn * 4} 0)`}>
          <circle cx={62} cy={48} r={24} fill={look.skin} />
          {/* face: profile eye, or two eyes when turned toward us */}
          {turn < 0.5 ? (
            <circle cx={78} cy={46} r={3} fill="#1b1b1b" />
          ) : (
            <>
              <circle cx={54} cy={47} r={3} fill="#1b1b1b" />
              <circle cx={70} cy={47} r={3} fill="#1b1b1b" />
              <ellipse cx={62} cy={60} rx={5} ry={turn > 0.8 ? 4 : 2} fill="#7a3b2c" />
            </>
          )}
          {/* tuque */}
          <path d="M37 44 Q38 18 62 17 Q86 18 87 44 Z" fill={look.hat} />
          <rect x={36} y={38} width={52} height={10} rx={5} fill={mix(look.hat, '#ffffff', 0.25)} />
          <circle cx={62} cy={14} r={7} fill={mix(look.hat, '#ffffff', 0.35)} />
        </g>
        {/* front arm (or waving) */}
        <g transform={`rotate(${wave ? -150 + Math.sin(wave) * 18 : arm} 60 92)`}>
          <rect x={52} y={88} width={18} height={84} rx={9} fill={mix(look.coat, '#ffffff', 0.06)} />
          <circle cx={61} cy={172} r={9} fill={look.skin} />
        </g>
      </g>
    </svg>
  );
};

/** "!" speech bubble that pops above a head. */
export const Bubble = ({x, y, p, text = '!'}: {x: number; y: number; p: number; text?: string}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 60,
      top: y - 120,
      width: 120,
      height: 110,
      transform: `scale(${p})`,
      transformOrigin: '50% 100%',
      opacity: Math.min(1, p * 2),
    }}
  >
    <svg width="120" height="110" viewBox="0 0 120 110">
      <path d="M20 8 H100 Q112 8 112 20 V64 Q112 76 100 76 H70 L58 100 L52 76 H20 Q8 76 8 64 V20 Q8 8 20 8Z" fill={A.white} stroke={A.ink} strokeWidth="4" />
    </svg>
    <div style={{position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 64, color: A.red}}>{text}</div>
  </div>
);

// ---- posters ------------------------------------------------------------------------
const Burger = ({size}: {size: number}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 200 160">
    <ellipse cx="100" cy="150" rx="86" ry="8" fill="rgba(0,0,0,.18)" />
    <path d="M18 70 Q20 14 100 12 Q180 14 182 70 Z" fill="#E59A3C" />
    {[40, 70, 100, 130, 160, 85, 115].map((x, i) => (
      <ellipse key={i} cx={x} cy={i > 4 ? 30 : 45} rx="4" ry="2.4" fill="#FFF3D6" />
    ))}
    <path d="M14 76 Q40 96 60 80 Q82 98 104 80 Q128 98 150 80 Q170 96 186 76 L186 84 Q100 102 14 84Z" fill="#7BB85A" />
    <path d="M18 84 L182 84 L170 104 L30 104 Z" fill="#F4C430" />
    <rect x="16" y="96" width="168" height="26" rx="12" fill="#5B3420" />
    <path d="M20 124 Q100 152 180 124 L176 140 Q100 158 24 140 Z" fill="#E08A2E" />
  </svg>
);
const Pizza = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="92" fill="#E0A04E" />
    <circle cx="100" cy="100" r="80" fill="#E5562D" />
    <circle cx="100" cy="100" r="74" fill="#F7D774" />
    {[
      [70, 70],
      [130, 64],
      [100, 110],
      [60, 128],
      [140, 132],
      [104, 158],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="13" fill="#B93A2C" />
    ))}
    {[0, 60, 120].map((r) => (
      <line key={r} x1="100" y1="100" x2={100 + 92 * Math.cos((r * Math.PI) / 180)} y2={100 + 92 * Math.sin((r * Math.PI) / 180)} stroke="#C98A3E" strokeWidth="3" />
    ))}
  </svg>
);
const Coffee = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <path d="M60 30 Q50 10 66 0 M100 30 Q90 10 106 0 M140 30 Q130 10 146 0" stroke="#fff" strokeWidth="6" fill="none" opacity=".7" strokeLinecap="round" />
    <path d="M40 50 H160 L148 180 Q146 192 132 192 H68 Q54 192 52 180 Z" fill="#F6EFE4" />
    <rect x="44" y="96" width="112" height="44" fill="#A42325" />
    <path d="M160 70 Q196 70 192 104 Q188 132 152 128" stroke="#F6EFE4" strokeWidth="14" fill="none" />
    <ellipse cx="100" cy="52" rx="60" ry="10" fill="#6B3F25" />
  </svg>
);

export type PosterKind = 'burger' | 'pizza' | 'coffee';
/** A restaurant promo poster, drawn in code (2:3). */
export const Poster = ({kind, w}: {kind: PosterKind; w: number}) => {
  const h = w * 1.5;
  const f = w / 280;
  const P = {
    burger: {bg: `linear-gradient(170deg, ${A.redHi}, ${A.red} 60%, ${A.deep})`, ink: A.white, top: 'TRIO', title: 'BURGER', price: '12,99 $', sub: 'OFFRE DU MIDI', art: <Burger size={230 * f} />},
    pizza: {bg: 'linear-gradient(170deg, #FFC93C, #F4A20C)', ink: '#2A1608', top: 'PIZZA', title: 'DU JOUR', price: '2 POUR 19 $', sub: 'CE SOIR SEULEMENT', art: <Pizza size={200 * f} />},
    coffee: {bg: 'linear-gradient(170deg, #3B2A20, #1E1611)', ink: A.cream, top: 'NOUVEAU', title: 'LATTE ÉRABLE', price: '4,75 $', sub: "SAVEUR D'HIVER", art: <Coffee size={190 * f} />},
  }[kind];
  return (
    <div style={{width: w, height: h, background: P.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: `${22 * f}px 0 ${18 * f}px`, boxSizing: 'border-box', overflow: 'hidden'}}>
      <div style={{textAlign: 'center', fontFamily: COND, color: P.ink, lineHeight: 0.9}}>
        <div style={{fontSize: 46 * f, letterSpacing: 3 * f}}>{P.top}</div>
        <div style={{fontSize: 74 * f}}>{P.title}</div>
      </div>
      {P.art}
      <div style={{textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: COND, fontSize: 52 * f, color: kind === 'burger' ? A.red : A.white, background: kind === 'burger' ? A.white : A.red, padding: `${4 * f}px ${18 * f}px 0`, borderRadius: 999}}>{P.price}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 15 * f, letterSpacing: 3 * f, color: P.ink, marginTop: 8 * f, opacity: 0.85}}>{P.sub}</div>
      </div>
    </div>
  );
};

/**
 * Feeha LED panel: slim black frame, back-lit poster, two suspension cables.
 * `light` 0..1, `glow` multiplies the halo, `poster` can be any node.
 */
export const Panel = ({x, y, w, light = 1, cable = 300, children}: {x: number; y: number; w: number; light?: number; cable?: number; children: React.ReactNode}) => {
  const frame = useCurrentFrame();
  const h = w * 1.5;
  const b = Math.max(6, w * 0.03);
  const pulse = 1 + Math.sin(frame / 9) * 0.04;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w + 2 * b, height: h + 2 * b}}>
      {[w * 0.12, w * 0.88].map((cx) => (
        <div key={cx} style={{position: 'absolute', left: cx + b - 1, top: -cable, width: 2, height: cable, background: 'linear-gradient(180deg, rgba(200,205,212,0), #C8CDD4)'}} />
      ))}
      <div style={{position: 'absolute', inset: -w * 0.5, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(255,214,150,${0.55 * light * pulse}) 0%, rgba(255,214,150,0) 62%)`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', inset: 0, background: '#0c0c0d', borderRadius: b * 0.6, padding: b, boxShadow: `0 ${w * 0.06}px ${w * 0.12}px rgba(0,0,0,.45), 0 0 ${w * 0.25 * light}px rgba(255,220,160,${0.7 * light})`}}>
        <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#222'}}>
          {children}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,.28), transparent 70%)', opacity: light, mixBlendMode: 'screen'}} />
          <div style={{position: 'absolute', inset: 0, background: '#000', opacity: (1 - light) * 0.55}} />
        </div>
      </div>
    </div>
  );
};

// ---- the shop front ------------------------------------------------------------------
/**
 * Brick shop front with a big window, awning and sign, at a time of day set by
 * `night` (0 = dusk, 1 = night). Children are drawn inside the window (behind
 * the glass reflections).
 */
export const Shop = ({night, children, insideLit = 0.6}: {night: number; children?: React.ReactNode; insideLit?: number}) => {
  const frame = useCurrentFrame();
  const sky = night < 0.5 ? mix(A.skyDusk, A.skyNight, night * 2) : A.skyNight;
  const WIN = {x: 120, y: 620, w: 840, h: 760};
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {/* sky */}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${mix(sky, '#000000', 0.2)} 0%, ${sky} 40%, ${mix(sky, '#C86A4A', (1 - night) * 0.45)} 60%)`}} />
      {/* building */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, height: 1220, background: A.brick}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, ${A.brickDark} 0 3px, transparent 3px 34px), repeating-linear-gradient(90deg, ${A.brickDark} 0 3px, transparent 3px 70px)`, opacity: 0.55}} />
      </div>
      {/* sign + awning */}
      <div style={{position: 'absolute', left: 150, right: 150, top: 410, height: 120, background: '#1b1b1f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: COND, fontSize: 88, letterSpacing: 6, color: night > 0.5 ? '#F3D9A4' : '#d8cfc2', textShadow: night > 0.5 ? '0 0 18px rgba(255,200,120,.8)' : 'none'}}>CHEZ DINO</div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 545, height: 60, background: `repeating-linear-gradient(90deg, ${A.red} 0 60px, ${A.cream} 60px 120px)`, clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)'}} />
      {/* window */}
      <div style={{position: 'absolute', left: WIN.x - 16, top: WIN.y - 16, width: WIN.w + 32, height: WIN.h + 32, background: '#17171a', borderRadius: 6}} />
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', background: `linear-gradient(180deg, ${mix('#5a4a3c', '#2a2420', night)} 0%, ${mix('#3a3029', '#16120f', night)} 100%)`}}>
        {/* interior: lamps, counter, tables */}
        {[200, 420, 640].map((lx) => (
          <React.Fragment key={lx}>
            <div style={{position: 'absolute', left: lx, top: 0, width: 3, height: 70, background: '#111'}} />
            <div style={{position: 'absolute', left: lx - 34, top: 66, width: 70, height: 34, borderRadius: '40px 40px 6px 6px', background: '#1a1a1a'}} />
            <div style={{position: 'absolute', left: lx - 90, top: 96, width: 180, height: 220, background: `radial-gradient(ellipse at 50% 0%, rgba(255,214,150,${0.35 * insideLit}), transparent 70%)`}} />
          </React.Fragment>
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: mix('#4a3428', '#221812', night)}} />
        {[90, 560].map((tx) => (
          <div key={tx} style={{position: 'absolute', left: tx, bottom: 120, width: 190, height: 16, background: '#6b4a32', borderRadius: 4}} />
        ))}
        {children}
        {/* glass reflection */}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,${0.1 + 0.05 * Math.sin(frame / 40)}) 32%, transparent 44%, transparent 70%, rgba(255,255,255,.06) 80%, transparent 90%)`}} />
      </div>
      {/* door */}
      <div style={{position: 'absolute', left: 980, top: 640, width: 100, height: 740, background: '#1f1f23'}} />
      {/* sidewalk + snow */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1405, height: 30, background: A.snow, borderRadius: '30px 30px 0 0'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1430, bottom: 0, background: `linear-gradient(180deg, ${mix('#6a6e78', '#2c2f38', night)}, ${mix('#4b4f58', '#17191f', night)})`}} />
      {/* street lamp light */}
      <div style={{position: 'absolute', left: -200, top: 1250, width: 700, height: 500, background: `radial-gradient(ellipse, rgba(255,200,120,${0.25 * night}), transparent 65%)`}} />
      {/* darkness */}
      <div style={{position: 'absolute', inset: 0, background: '#050816', opacity: night * 0.42, pointerEvents: 'none'}} />
    </div>
  );
};
export const WINDOW = {x: 120, y: 620, w: 840, h: 760};

export const Snow = ({n = 70, speed = 1}: {n?: number; speed?: number}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const r = ((i * 9301 + 49297) % 233280) / 233280;
        const size = 4 + ((i * 7) % 9);
        const x = ((r * 1160 + Math.sin((frame + i * 13) / 25) * 26) % 1160) - 40;
        const y = ((i * 211 + frame * (2 + (i % 4)) * speed) % 2000) - 60;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: '#fff', opacity: 0.3 + (i % 4) * 0.15}} />;
      })}
    </div>
  );
};

/** Masking-tape strip. */
export const TapeStrip = ({x, y, rot, w = 90}: {x: number; y: number; rot: number; w?: number}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - 14, width: w, height: 28, background: 'rgba(230,214,166,.9)', transform: `rotate(${rot}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,.2)'}} />
);

export const clampI = (f: number, a: number, b: number, c: number, d: number) => interpolate(f, [a, b], [c, d], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
