import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions} from '../feeha/Captions';
import timeline from './timeline.json';

// ---- M.A. Auto Distribution brand -------------------------------------------
const M = {
  black: '#050608',
  ink: '#0B0E14',
  blue: '#1F7BFF',
  deep: '#0A3FA8',
  ice: '#BFE0FF',
  white: '#FFFFFF',
  grey: '#9AA3AD',
};
const FONT = '"Archivo Variable", sans-serif';
const heavy = {fontFamily: FONT, fontStretch: '125%', fontWeight: 900, fontStyle: 'italic'} as const;
const wideLabel = {fontFamily: FONT, fontStretch: '125%', fontWeight: 700, letterSpacing: 14} as const;
// brushed-chrome text, like the logo
const chrome: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #E6EAEE 38%, #8D96A0 52%, #F4F6F8 70%, #B7BEC6 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.5)) drop-shadow(0 18px 30px rgba(0,0,0,.6))',
};
const BEAT = 15;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSpring = (delay = 0, config = {damping: 12, stiffness: 200, mass: 0.7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

// ---- graphics -----------------------------------------------------------------
/** A winter tyre on a dark alloy rim, drawn in SVG. */
const Tire = ({size, spin = 0, style}: {size: number; spin?: number; style?: React.CSSProperties}) => {
  const blocks = 44;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={style}>
      <defs>
        <radialGradient id="rubber" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="#1a1c20" />
          <stop offset="0.8" stopColor="#101114" />
          <stop offset="1" stopColor="#060708" />
        </radialGradient>
        <linearGradient id="rim" x1="-1" y1="-1" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4048" />
          <stop offset="0.45" stopColor="#15181d" />
          <stop offset="1" stopColor="#2a2f36" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${spin})`}>
        <circle r="99" fill="url(#rubber)" />
        {Array.from({length: blocks}).map((_, i) => (
          <g key={i} transform={`rotate(${(i * 360) / blocks})`}>
            <path d={`M-5 -98 L5 -98 L6 ${i % 2 ? -84 : -86} L-4 ${i % 2 ? -86 : -84}Z`} fill="#24272c" />
            <path d="M-1 -97 L0 -88" stroke="#0a0b0d" strokeWidth="1.2" />
          </g>
        ))}
        <circle r="80" fill="none" stroke="#0c0d10" strokeWidth="2" />
        <circle r="68" fill="#0d0f12" />
        <circle r="64" fill="url(#rim)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`rotate(${i * 72})`}>
            <path d="M-7 -14 L-12 -60 Q0 -64 12 -60 L7 -14Z" fill="#0b0d10" />
            <path d="M-4 -16 L-8 -58 L-2 -59 L-1 -16Z" fill="#4a525c" opacity=".7" />
          </g>
        ))}
        <circle r="16" fill="#1b1f25" stroke="#4a525c" strokeWidth="1.5" />
        <circle r="7" fill={M.blue} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={Math.cos((i * 72 + 36) * (Math.PI / 180)) * 11} cy={Math.sin((i * 72 + 36) * (Math.PI / 180)) * 11} r="2.2" fill="#8d96a0" />
        ))}
      </g>
      {/* fixed light: highlight on the rubber */}
      <path d="M-70 -70 A99 99 0 0 1 40 -91" stroke="rgba(255,255,255,.12)" strokeWidth="5" fill="none" />
    </svg>
  );
};

const Snow = ({density = 1}: {density?: number}) => {
  const frame = useCurrentFrame();
  const flakes = Math.round(70 * density);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: flakes}).map((_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = seed / 233280;
        const size = 4 + ((i * 7) % 10);
        const speed = 2 + (i % 5) * 0.9;
        const x = (r * 1180 + Math.sin((frame + i * 13) / 25) * 30) % 1180 - 50;
        const y = ((i * 211 + frame * speed) % 2050) - 80;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.25 + (i % 4) * 0.15,
              filter: size > 10 ? 'blur(2px)' : 'none',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Background = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % BEAT, [0, 3, BEAT], [1, 0.6, 0.45]);
  return (
    <AbsoluteFill style={{background: M.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 50% at 50% 45%, #10213f 0%, ${M.black} 70%)`}} />
      {/* tread pattern drifting */}
      <AbsoluteFill
        style={{
          opacity: 0.035,
          backgroundImage:
            'repeating-linear-gradient(60deg, #fff 0 10px, transparent 10px 46px), repeating-linear-gradient(-60deg, #fff 0 10px, transparent 10px 46px)',
          backgroundPosition: `0 ${frame * 4}px`,
        }}
      />
      {/* brand corner stripes */}
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            bottom: -140,
            [side < 0 ? 'left' : 'right']: -260,
            width: 620,
            height: 560,
            transform: `skewX(${side * -38}deg)`,
            background: `linear-gradient(${side < 0 ? 90 : 270}deg, ${M.blue} 0 26%, transparent 26% 38%, ${M.deep} 38% 58%, transparent 58%)`,
            opacity: 0.55 + pulse * 0.25,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 420,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(31,123,255,.35) 0%, transparent 62%)`,
          opacity: 0.6 + pulse * 0.3,
          filter: 'blur(20px)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.08, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="mg">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mg)" />
      </svg>
    </AbsoluteFill>
  );
};

const Logo = ({width, shine = 0}: {width: number; shine?: number}) => (
  <div style={{position: 'relative', width, aspectRatio: '960 / 470'}}>
    <Img src={staticFile('ma/logo.png')} style={{width: '100%', display: 'block'}} />
    {/* chrome glint sweeping across the logo only */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        WebkitMaskImage: `url(${staticFile('ma/logo.png')})`,
        WebkitMaskSize: '100% 100%',
        background: `linear-gradient(105deg, transparent ${shine * 140 - 40}%, rgba(255,255,255,.85) ${shine * 140 - 25}%, transparent ${shine * 140 - 10}%)`,
      }}
    />
  </div>
);

const Label = ({children, delay = 0, color = M.blue}: {children: React.ReactNode; delay?: number; color?: string}) => {
  const p = useSpring(delay);
  return (
    <div style={{...wideLabel, fontSize: 30, color, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-20, 0])}px)`}}>
      {children}
    </div>
  );
};

const Slam = ({children, delay, size, from = -1, style}: {children: React.ReactNode; delay: number; size: number; from?: -1 | 1; style?: React.CSSProperties}) => {
  const p = useSpring(delay, {damping: 13, stiffness: 380, mass: 0.5});
  return (
    <div
      style={{
        ...heavy,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: -2,
        whiteSpace: 'nowrap',
        transform: `translateX(${interpolate(p, [0, 1], [from * 700, 0])}px) skewX(${interpolate(p, [0, 1], [from * -20, -6])}deg)`,
        opacity: Math.min(1, p * 3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A stamped badge (GRATUITE, GARANTIS…). */
const Stamp = ({children, delay, color = M.blue, rotate = -6, size = 92}: {children: React.ReactNode; delay: number; color?: string; rotate?: number; size?: number}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, {damping: 9, stiffness: 260, mass: 0.7});
  return (
    <div
      style={{
        ...heavy,
        fontSize: size,
        lineHeight: 1,
        color: M.white,
        background: color,
        padding: '22px 44px 16px',
        borderRadius: 18,
        boxShadow: `0 12px 0 ${M.deep}, 0 0 80px rgba(31,123,255,.6)`,
        transform: `scale(${interpolate(p, [0, 1], [2.6, 1])}) rotate(${rotate}deg)`,
        opacity: frame < delay ? 0 : Math.min(1, p * 2),
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

// ---- scenes ---------------------------------------------------------------------
const Hook = () => {
  const frame = useCurrentFrame();
  const cal = useSpring(0, {damping: 10, stiffness: 180, mass: 0.8});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Snow density={1.4} />
      <div style={{position: 'absolute', top: 210}}>
        <Label>QUÉBEC · SAISON D'HIVER</Label>
      </div>
      {/* calendar page */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          width: 520,
          borderRadius: 40,
          overflow: 'hidden',
          background: M.white,
          boxShadow: '0 50px 100px rgba(0,0,0,.7), 0 0 120px rgba(31,123,255,.45)',
          transform: `perspective(1600px) rotateX(${interpolate(cal, [0, 1], [-80, 0])}deg) scale(${interpolate(cal, [0, 1], [0.6, 1])}) rotate(-4deg)`,
          transformOrigin: 'top center',
        }}
      >
        <div style={{background: M.blue, color: M.white, textAlign: 'center', ...heavy, fontSize: 92, padding: '18px 0 8px'}}>DÉC.</div>
        <div style={{textAlign: 'center', ...heavy, fontStyle: 'normal', fontSize: 330, lineHeight: 1.05, color: M.black, letterSpacing: -10}}>
          1<span style={{fontSize: 120, verticalAlign: 'top', lineHeight: 2}}>er</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1010, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
        <Slam delay={14} size={94} style={chrome}>
          PNEUS D'HIVER
        </Slam>
        <Stamp delay={30} rotate={-4} size={84}>
          OBLIGATOIRES
        </Stamp>
      </div>
      {/* frost creeping in from the edges */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(191,224,255,.28) 100%)',
          opacity: interpolate(frame, [0, 60], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

const Ready = () => {
  const frame = useCurrentFrame();
  const roll = useSpring(0, {damping: 16, stiffness: 120, mass: 0.9});
  const x = interpolate(roll, [0, 1], [-900, 0]);
  const shake = frame < 10 ? Math.sin(frame * 3) * (10 - frame) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Snow density={0.8} />
      <Tire size={760} spin={x * 0.4} style={{position: 'absolute', top: 360, left: 160 + x}} />
      {/* skid streaks */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 1090 + i * 22,
            left: 0,
            width: Math.max(0, 300 + x * -0.4),
            height: 6,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25))',
            opacity: 1 - roll,
          }}
        />
      ))}
      <div style={{position: 'absolute', top: 1180}}>
        <Slam delay={0} size={124} from={1} style={chrome}>
          T'ES PRÊT ?
        </Slam>
      </div>
    </AbsoluteFill>
  );
};

const Brand = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0, {damping: 13, stiffness: 160, mass: 0.8});
  const shine = interpolate(frame, [8, 36], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 560,
          width: 1200,
          height: 600,
          left: -60,
          background: 'radial-gradient(ellipse, rgba(31,123,255,.55) 0%, transparent 60%)',
          opacity: p,
        }}
      />
      <div style={{position: 'absolute', top: 520, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, filter: `blur(${(1 - p) * 16}px)`, opacity: p}}>
        <Logo width={980} shine={shine} />
      </div>
      <div style={{position: 'absolute', top: 1110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <Label delay={12} color={M.white}>TON FOURNISSEUR</Label>
        <Stamp delay={18} rotate={-3} size={84}>
          FIABLE
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Quality = () => {
  const frame = useCurrentFrame();
  const t = useSpring(0);
  return (
    <AbsoluteFill>
      {/* real tyre stack from the brand photo */}
      <Img
        src={staticFile('ma/tires.jpg')}
        style={{
          position: 'absolute',
          right: -40,
          top: 0,
          height: 1920,
          width: 547,
          objectFit: 'cover',
          opacity: 0.55 * t,
          transform: `scale(${1.05 + frame * 0.001})`,
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 40%)',
        }}
      />
      <Tire size={700} spin={frame * 2.4} style={{position: 'absolute', left: -150, top: 470, transform: `scale(${interpolate(t, [0, 1], [0.5, 1])})`, opacity: t}} />
      <div style={{position: 'absolute', left: 80, top: 230}}>
        <Label>PNEUS · JANTES</Label>
      </div>
      <div style={{position: 'absolute', right: 60, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10}}>
        <Slam delay={2} size={128} from={1} style={chrome}>
          PNEUS DE
        </Slam>
        <Slam delay={6} size={128} from={1} style={chrome}>
          QUALITÉ
        </Slam>
      </div>
      <div style={{position: 'absolute', right: 70, top: 900}}>
        <Stamp delay={14} rotate={-5} size={104}>
          ✓ GARANTIS
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Install = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useSpring(0);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 220}}>
        <Label>À L'ACHAT DE PNEUS + JANTES</Label>
      </div>
      <div style={{position: 'absolute', top: 330, transform: `scale(${interpolate(t, [0, 1], [0.6, 1])})`, opacity: t}}>
        <Tire size={560} spin={Math.min(frame, 40) * 3} />
        {/* lug nuts tightened one by one */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = ((i * 72 + 36) * Math.PI) / 180;
          const p = spring({frame: frame - 8 - i * 4, fps, config: {damping: 10, stiffness: 300}});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 280 + Math.cos(a) * 31 * 2.8 - 16,
                top: 280 + Math.sin(a) * 31 * 2.8 - 16,
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #e8ecf0, #7d8690)',
                transform: `scale(${p}) rotate(${p * 90}deg)`,
                boxShadow: `0 0 18px ${M.blue}`,
              }}
            />
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Slam delay={4} size={104} style={chrome}>
          INSTALLATION
        </Slam>
        <Stamp delay={16} rotate={-4} size={118}>
          GRATUITE
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Van = ({x}: {x: number}) => (
  <svg width="640" height="330" viewBox="0 0 640 330" style={{position: 'absolute', top: 470, left: x}}>
    <path d="M30 70 Q30 40 60 40 L400 40 L400 250 L30 250Z" fill="#E9EDF1" />
    <path d="M400 90 L520 90 Q560 92 585 140 L610 190 L610 250 L400 250Z" fill="#DCE2E8" />
    <path d="M420 108 L512 108 Q540 110 556 150 L566 172 L420 172Z" fill="#0B0E14" />
    <rect x="30" y="196" width="580" height="22" fill={M.blue} />
    <rect x="30" y="218" width="580" height="10" fill={M.deep} />
    <text x="215" y="150" textAnchor="middle" fontFamily={FONT} fontStyle="italic" fontWeight="900" fontSize="64" fill="#0B0E14">
      M.A. AUTO
    </text>
    <g transform="translate(150 255)">
      <circle r="52" fill="#0b0c0e" />
      <circle r="28" fill="#4a525c" />
    </g>
    <g transform="translate(500 255)">
      <circle r="52" fill="#0b0c0e" />
      <circle r="28" fill="#4a525c" />
    </g>
  </svg>
);

const Delivery = () => {
  const frame = useCurrentFrame();
  const drive = useSpring(0, {damping: 18, stiffness: 110, mass: 1});
  const x = interpolate(drive, [0, 1], [-800, 220]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Snow density={0.6} />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 520 + i * 60,
            left: x - 260 - i * 30,
            width: 240,
            height: 8,
            borderRadius: 4,
            background: 'linear-gradient(90deg, transparent, rgba(31,123,255,.7))',
            opacity: 1 - drive * 0.7,
          }}
        />
      ))}
      <Van x={x} />
      <div style={{position: 'absolute', top: 360}}>
        <Label color={M.white}>ET EN PLUS…</Label>
      </div>
      <div style={{position: 'absolute', top: 920, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Slam delay={0} size={140} from={1} style={chrome}>
          LIVRAISON
        </Slam>
        <Stamp delay={5} rotate={4} size={118}>
          GRATUITE
        </Stamp>
      </div>
      <div style={{position: 'absolute', bottom: 0, height: 4, width: '100%', background: 'transparent', opacity: frame}} />
    </AbsoluteFill>
  );
};

const PhoneIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="none" stroke={M.blue} strokeWidth="6" />
    <path
      d="M36 26 C32 26 28 30 28 35 C30 55 45 70 65 72 C70 72 74 68 74 64 L74 58 C74 56 72 55 70 54 L62 51 C60 51 58 52 57 53 L54 57 C47 54 46 52 43 46 L47 43 C48 42 49 40 49 38 L46 30 C45 28 44 26 42 26Z"
      fill={M.white}
    />
  </svg>
);

const Call = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0);
  const ring = frame % 30 < 12 ? Math.sin(frame * 2.2) * 10 : 0;
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.05, 1.02, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 380, transform: `rotate(${ring}deg) scale(${p})`}}>
        <PhoneIcon size={240} />
      </div>
      <div style={{position: 'absolute', top: 700}}>
        <Label color={M.white}>APPELLE MAINTENANT</Label>
      </div>
      <div style={{position: 'absolute', top: 790}}>
        <Slam delay={3} size={106} style={chrome}>
          438-368-6865
        </Slam>
      </div>
      <div style={{position: 'absolute', top: 980, width: 760, height: 8, borderRadius: 4, background: M.blue, transform: `scaleX(${interpolate(frame, [6, 20], [0, 1], clamp)})`}} />
      <div
        style={{
          position: 'absolute',
          top: 1080,
          ...heavy,
          fontSize: 50,
          color: M.white,
          background: M.blue,
          whiteSpace: 'nowrap',
          padding: '24px 50px 18px',
          borderRadius: 999,
          boxShadow: `0 12px 0 ${M.deep}, 0 0 80px rgba(31,123,255,.7)`,
          transform: `scale(${useSpring(10) * beat})`,
        }}
      >
        PNEUS · JANTES · PIÈCES
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0, {damping: 13, stiffness: 150, mass: 0.8});
  const shine = interpolate(frame, [10, 40], [0, 1], clamp);
  const row = (icon: React.ReactNode, text: React.ReactNode, delay: number) => {
    const q = useSpring(delay);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 28, opacity: q, transform: `translateX(${interpolate(q, [0, 1], [-60, 0])}px)`}}>
        {icon}
        <div style={{width: 5, height: 90, background: M.blue}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, lineHeight: 1.25, color: M.white}}>{text}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 300, transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`, opacity: p}}>
        <Logo width={900} shine={shine} />
      </div>
      <div style={{position: 'absolute', top: 900, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
        {row(<PhoneIcon size={120} />, <span style={{...heavy, fontSize: 84}}>438-368-6865</span>, 6)}
      </div>
      <div style={{position: 'absolute', top: 1140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        {['INSTALLATION GRATUITE*', 'LIVRAISON GRATUITE'].map((t, i) => {
          const q = useSpring(20 + i * 6, {damping: 10, stiffness: 240, mass: 0.6});
          return (
            <div
              key={t}
              style={{...heavy, fontSize: 46, color: M.white, background: i ? M.deep : M.blue, padding: '18px 40px 14px', borderRadius: 999, whiteSpace: 'nowrap', transform: `scale(${q}) rotate(${i ? 2 : -2}deg)`}}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1360, fontFamily: FONT, fontWeight: 500, fontSize: 30, color: M.grey, opacity: interpolate(frame, [26, 36], [0, 1], clamp)}}>
        *À l'achat de pneus et jantes
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ------------------------------------------------------------------
const SCENES: Record<string, React.FC> = {
  hook: Hook,
  ready: Ready,
  brand: Brand,
  quality: Quality,
  install: Install,
  delivery: Delivery,
  call: Call,
  outro: Outro,
};

export const MA = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.45, 0], clamp);
  const zoom = interpolate(since, [0, 8], [1.06, 1], clamp);
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  return (
    <AbsoluteFill style={{background: M.black}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Background />
        {scenes.map((s) => {
          const C = SCENES[s.id];
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
              <C />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Captions
        words={words}
        top={1640}
        accent={M.blue}
        edge={M.deep}
        font={heavy}
        hidden={(f) => f < scene('ready').from || f >= scene('call').from}
      />
      <AbsoluteFill style={{background: '#dfeeff', opacity: flash, pointerEvents: 'none'}} />
      <Grain />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: M.blue}} />
      {audio ? <Audio src={staticFile('ma-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
