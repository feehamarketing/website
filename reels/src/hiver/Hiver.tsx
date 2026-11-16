import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../feeha/Captions';
import timeline from './timeline.json';

// Winter in Quebec: taped paper posters go dark by 5 pm; a Feeha light panel
// keeps the offer visible. Problem in cold blue night, solution in Feeha red.
const H = {
  red: '#A42325',
  deep: '#6B1517',
  ink: '#0E1014',
  night: '#0B1220',
  ice: '#BFD6F2',
  white: '#FFFFFF',
  paper: '#F4F2EE',
  warm: '#FFE9C2',
  grey: '#8B8F96',
};
const COND = '"Bebas Neue", sans-serif';
const SANS = '"Inter", sans-serif';
const BEAT = 15;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSpr = (delay = 0, config = {damping: 13, stiffness: 220, mass: 0.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

const Big = ({children, size, delay = 0, color = H.white, style}: {children: React.ReactNode; size: number; delay?: number; color?: string; style?: React.CSSProperties}) => {
  const p = useSpr(delay, {damping: 14, stiffness: 300, mass: 0.5});
  return (
    <div
      style={{
        fontFamily: COND,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: 1,
        color,
        textAlign: 'center',
        transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px)`,
        opacity: Math.min(1, p * 2.5),
        textShadow: '0 8px 30px rgba(0,0,0,.55)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Tag = ({children, delay = 0, bg = H.red, color = H.white, rotate = -3, size = 72}: {children: React.ReactNode; delay?: number; bg?: string; color?: string; rotate?: number; size?: number}) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <div
      style={{
        fontFamily: COND,
        fontSize: size,
        lineHeight: 1,
        color,
        background: bg,
        padding: '16px 36px 8px',
        borderRadius: 999,
        boxShadow: '0 14px 30px rgba(0,0,0,.4)',
        transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(${rotate}deg)`,
        opacity: frame < delay ? 0 : Math.min(1, p * 2),
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

const Snow = ({n = 60}: {n?: number}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const r = ((i * 9301 + 49297) % 233280) / 233280;
        const size = 4 + ((i * 7) % 9);
        const x = (r * 1160 + Math.sin((frame + i * 13) / 25) * 26) % 1160 - 40;
        const y = ((i * 211 + frame * (2 + (i % 4))) % 2000) - 60;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: '#fff', opacity: 0.3 + (i % 4) * 0.15}} />;
      })}
    </AbsoluteFill>
  );
};

/** Full-bleed photo with a slow push-in. */
const Photo = ({src, from = 1, to = 1.12, dim = 0, tint, style}: {src: string; from?: number; to?: number; dim?: number; tint?: string; style?: React.CSSProperties}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: H.ink}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [0, durationInFrames], [from, to])})`, filter: `brightness(${1 - dim})`, ...style}}
      />
      {tint ? <AbsoluteFill style={{background: tint}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 30%, transparent 62%, rgba(0,0,0,.75) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---- the product: a snap frame with a back-lit poster -----------------------------
/** A sample poster designed in code (no third-party artwork). */
const SamplePoster = ({variant = 0}: {variant?: number}) =>
  variant === 0 ? (
    <div style={{width: '100%', height: '100%', background: `linear-gradient(160deg, ${H.red}, #D8432E)`, color: H.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: COND, textAlign: 'center'}}>
      <div style={{fontSize: 70, lineHeight: 1}}>TON OFFRE</div>
      <div style={{fontSize: 200, lineHeight: 0.9}}>-20%</div>
      <div style={{fontSize: 50, background: H.white, color: H.red, padding: '6px 22px 0', marginTop: 16}}>CETTE SEMAINE</div>
    </div>
  ) : (
    <div style={{width: '100%', height: '100%', background: '#F6E7C8', color: '#2B1B0E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: COND, textAlign: 'center'}}>
      <div style={{fontSize: 56, letterSpacing: 6, color: H.red}}>NOUVEAU</div>
      <div style={{fontSize: 150, lineHeight: 0.9}}>MENU</div>
      <div style={{fontSize: 150, lineHeight: 0.9}}>D'HIVER</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, marginTop: 18}}>soupe · chocolat chaud · combo</div>
    </div>
  );

/**
 * Light box: aluminium frame on a dark wall. `slide` 0..1 brings the poster in
 * from the top, `light` 0..1 switches the back-light on, `swap` 0..1 replaces
 * the poster with the second one.
 */
const LightBox = ({slide = 1, light = 1, swap = 0, scale = 1}: {slide?: number; light?: number; swap?: number; scale?: number}) => {
  const W = 560;
  const Hh = 800;
  return (
    <div style={{position: 'absolute', left: 540 - W / 2, top: 470, width: W, height: Hh, transform: `scale(${scale})`}}>
      {/* glow on the wall */}
      <div style={{position: 'absolute', inset: -160, borderRadius: 80, background: `radial-gradient(ellipse, rgba(255,233,194,${0.55 * light}) 0%, transparent 65%)`, filter: 'blur(10px)'}} />
      {/* frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #e9ecef, #9aa1a8 50%, #d8dce0)',
          boxShadow: `0 40px 80px rgba(0,0,0,.6), 0 0 ${80 * light}px rgba(255,233,194,${0.6 * light})`,
          padding: 22,
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#1b1d20'}}>
          {/* poster A slides in from the top, then out to the side when swapped */}
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(slide - 1) * 110}%) translateX(${swap * -110}%)`}}>
            <SamplePoster variant={0} />
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - swap) * 110}%)`}}>
            <SamplePoster variant={1} />
          </div>
          {/* back-light: brightens the print */}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.35), transparent 70%)', opacity: light, mixBlendMode: 'screen'}} />
          <div style={{position: 'absolute', inset: 0, background: '#000', opacity: (1 - light) * 0.45}} />
        </div>
      </div>
    </div>
  );
};

const DarkWall = ({warm = 0, children}: {warm?: number; children?: React.ReactNode}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${warm > 0 ? '#2a2420' : '#161a22'} 0%, ${H.ink} 70%)`}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.02) 0 2px, transparent 2px 140px)'}} />
    {children}
  </AbsoluteFill>
);

// ---- scenes ---------------------------------------------------------------------
const Dark = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames * 0.8], [15 * 60, 16 * 60 + 45], clamp);
  const hh = Math.floor(t / 60);
  const mm = Math.floor(t % 60);
  const night = interpolate(frame, [0, durationInFrames], [0.1, 0.45], clamp);
  return (
    <AbsoluteFill>
      <Photo src="hiver/rue.jpg" tint={`rgba(8,16,40,${night})`} />
      <Snow />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: H.ice}}>QUÉBEC · DÉCEMBRE</div>
        <div style={{fontFamily: COND, fontSize: 230, lineHeight: 1, color: H.white, marginTop: 10, textShadow: '0 0 40px rgba(120,170,255,.5)'}}>
          {hh} H {String(mm).padStart(2, '0')}
        </div>
        <Big size={88} delay={8}>
          ET IL FAIT DÉJÀ NOIR.
        </Big>
      </div>
    </AbsoluteFill>
  );
};

/** The taped poster (landscape photo): whole picture on a blurred fill. */
const Tape = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], [1, 1.12]);
  return (
  <AbsoluteFill style={{background: H.ink}}>
    <Img src={staticFile('hiver/tape.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) brightness(.55)', transform: 'scale(1.2)'}} />
    <div style={{position: 'absolute', left: 0, top: 560, width: 1080, height: 608, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.6)'}}>
      <Img src={staticFile('hiver/tape.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '50% 45%'}} />
    </div>
    <div style={{position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
      <Big size={150}>DU TAPE ?</Big>
      <Tag delay={8} size={80}>
        PAS TRÈS PRO.
      </Tag>
    </div>
  </AbsoluteFill>
  );
};

const Invisible = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const dim = interpolate(frame, [0, durationInFrames], [0.1, 0.75], clamp);
  return (
    <AbsoluteFill>
      <Photo src="hiver/vitrine.jpg" dim={dim} tint="rgba(8,16,40,.25)" />
      <Snow n={40} />
      <div style={{position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <svg width="200" height="128" viewBox="0 0 110 70" style={{opacity: interpolate(frame, [0, 8], [0, 1], clamp)}}>
          <path d="M5 35 Q55 -10 105 35 Q55 80 5 35Z" fill="none" stroke={H.white} strokeWidth="6" />
          <circle cx="55" cy="35" r="13" fill={H.white} />
          <line x1="15" y1="62" x2="95" y2="8" stroke={H.red} strokeWidth="9" strokeLinecap="round" />
        </svg>
        <Big size={130} delay={3}>
          APRÈS 17 H,
        </Big>
        <Tag delay={9} size={88}>
          PERSONNE LA VOIT.
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/** A day timeline: the paper poster only works while it is light out. */
const Half = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const HOURS = [8, 22]; // shop opening hours shown
  const dusk = 16.5;
  const x = (h: number) => 80 + ((h - HOURS[0]) / (HOURS[1] - HOURS[0])) * 920;
  const now = interpolate(frame, [4, durationInFrames - 6], [HOURS[0], HOURS[1]], clamp);
  const dark = now > dusk;
  return (
    <DarkWall>
      <div style={{position: 'absolute', top: 180, left: 0, right: 0}}>
        <Big size={110}>TA PUB TRAVAILLE</Big>
        <Big size={150} delay={4} color={H.red} style={{textShadow: 'none'}}>
          À MOITIÉ.
        </Big>
      </div>
      {/* timeline */}
      <div style={{position: 'absolute', top: 760, left: x(HOURS[0]), width: x(dusk) - x(HOURS[0]), height: 120, background: 'linear-gradient(90deg, #f5d27a, #f0b85a)', borderRadius: '20px 0 0 20px'}} />
      <div style={{position: 'absolute', top: 760, left: x(dusk), width: x(HOURS[1]) - x(dusk), height: 120, background: 'linear-gradient(90deg, #1d2a4a, #0b1220)', borderRadius: '0 20px 20px 0', border: '2px solid #2b3a5e'}} />
      {[8, 12, 16.5, 22].map((h) => (
        <div key={h} style={{position: 'absolute', top: 900, left: x(h) - 60, width: 120, textAlign: 'center', fontFamily: COND, fontSize: 48, color: h === dusk ? H.warm : H.grey}}>
          {h === 16.5 ? '16 H 30' : `${h} H`}
        </div>
      ))}
      <div style={{position: 'absolute', top: 640, left: x(HOURS[0]), width: x(dusk) - x(HOURS[0]), textAlign: 'center', fontFamily: COND, fontSize: 64, color: '#f5d27a'}}>☀ VISIBLE</div>
      <div style={{position: 'absolute', top: 640, left: x(dusk), width: x(HOURS[1]) - x(dusk), textAlign: 'center', fontFamily: COND, fontSize: 64, color: '#7f93c4'}}>INVISIBLE</div>
      {/* moving marker */}
      <div style={{position: 'absolute', top: 735, left: x(now) - 4, width: 8, height: 170, background: H.white, borderRadius: 4, boxShadow: '0 0 20px #fff'}} />
      {/* the poster itself, fading with the light */}
      <div style={{position: 'absolute', top: 1040, left: 540 - 150, width: 300, height: 400, transform: 'rotate(-3deg)', opacity: dark ? 0.12 : 1, transition: 'none', boxShadow: '0 20px 40px rgba(0,0,0,.5)'}}>
        <SamplePoster />
        <div style={{position: 'absolute', left: -24, top: -10, width: 110, height: 34, background: 'rgba(235,220,170,.85)', transform: 'rotate(-28deg)'}} />
        <div style={{position: 'absolute', right: -24, top: -10, width: 110, height: 34, background: 'rgba(235,220,170,.85)', transform: 'rotate(28deg)'}} />
      </div>
    </DarkWall>
  );
};

const Solution = ({nightAt}: {nightAt: number}) => {
  const frame = useCurrentFrame();
  const night = frame >= nightAt;
  const pill = (txt: string, on: boolean) => (
    <div style={{fontFamily: COND, fontSize: 64, padding: '12px 34px 6px', borderRadius: 999, background: on ? H.red : 'transparent', color: on ? H.white : '#aaa'}}>{txt}</div>
  );
  return (
    <AbsoluteFill>
      {night ? (
        <Photo src="panels/vitrine-nuit-2x.jpg" from={1.2} to={1.35} style={{objectPosition: '78% 35%', transformOrigin: '70% 0%'}} />
      ) : (
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #EEF2F6 0%, #DCE3EA 100%)'}}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.9), transparent 60%)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1380, bottom: 0, background: '#c9cfd6'}} />
          <LightBox light={0.6} scale={0.95} />
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: night ? H.warm : H.red}}>PANNEAU LUMINEUX FEEHA</div>
        <div style={{display: 'flex', background: 'rgba(0,0,0,.45)', borderRadius: 999, padding: 8}}>
          {pill('JOUR ✓', !night)}
          {pill('SOIR ✓✓', night)}
        </div>
        <Big size={night ? 120 : 110} delay={night ? nightAt : 4} color={night ? H.white : H.ink} style={night ? undefined : {textShadow: 'none'}}>
          {night ? 'ENCORE PLUS VISIBLE' : 'VISIBLE LE JOUR'}
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const Insert = ({lightAt}: {lightAt: number}) => {
  const frame = useCurrentFrame();
  const slide = useSpr(4, {damping: 18, stiffness: 120, mass: 1});
  const flick = [0, 0, 1, 0.2, 1, 0.5, 1];
  const light = frame < lightAt ? 0 : frame - lightAt < 14 ? flick[Math.floor((frame - lightAt) / 2)] ?? 1 : 1;
  return (
    <DarkWall warm={light}>
      <LightBox slide={slide} light={light} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <Big size={110}>{light > 0.5 ? 'ET IL S’ILLUMINE.' : 'GLISSE TON POSTER'}</Big>
      </div>
      {/* arrow showing the poster going in */}
      <svg width="90" height="140" viewBox="0 0 90 140" style={{position: 'absolute', left: 940, top: 480, opacity: 1 - slide}}>
        <path d="M45 0 V115 M10 80 L45 125 L80 80" stroke={H.white} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </DarkWall>
  );
};

const PosterSwap = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const swap = spring({frame: frame - 22, fps, config: {damping: 16, stiffness: 140}});
  return (
    <DarkWall warm={1}>
      <LightBox swap={swap} scale={0.85} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <svg width="120" height="90" viewBox="0 0 120 90">
            <rect x="6" y="6" width="108" height="66" rx="6" fill="none" stroke={H.grey} strokeWidth="6" />
            <rect x="48" y="72" width="24" height="12" fill={H.grey} />
            <line x1="10" y1="84" x2="110" y2="4" stroke={H.red} strokeWidth="9" strokeLinecap="round" />
          </svg>
          <Big size={100}>PAS UN ÉCRAN</Big>
        </div>
        <Tag delay={6} size={76} rotate={-2}>
          UN VRAI POSTER
        </Tag>
      </div>
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0}}>
        <Big size={70} delay={22} color={H.warm}>
          QUI SE CHANGE EN UN CLIN D'ŒIL
        </Big>
      </div>
    </DarkWall>
  );
};

const Life = () => {
  const a = useSpr(0, {damping: 11, stiffness: 260, mass: 0.6});
  const b = useSpr(7, {damping: 11, stiffness: 260, mass: 0.6});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 360, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: H.white}}>DURÉE DE VIE</div>
      <div style={{position: 'absolute', top: 440, display: 'flex', fontFamily: COND, fontSize: 420, lineHeight: 1, color: H.white}}>
        <span style={{display: 'inline-block', transform: `scale(${a})`}}>7</span>
        <span style={{display: 'inline-block', opacity: b, transform: `translateX(${(1 - b) * 120}px)`}}>–10</span>
      </div>
      <div style={{position: 'absolute', top: 860, fontFamily: COND, fontSize: 200, lineHeight: 1, color: H.ink, opacity: b}}>ANS</div>
    </AbsoluteFill>
  );
};

const ITEMS = ['2 PANNEAUX LUMINEUX', 'POSTERS INCLUS', "MATÉRIEL D'INSTALLATION", 'TUTORIEL PAS À PAS'];

const Bundle = ({itemAt}: {itemAt: number[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: H.paper}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: H.red}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: H.warm}}>EN CE MOMENT</div>
        <Big size={150}>OFFRE GROUPÉE</Big>
      </div>
      <div style={{position: 'absolute', top: 540, left: 80, right: 60, display: 'flex', flexDirection: 'column', gap: 48}}>
        {ITEMS.map((it, i) => {
          const p = spring({frame: frame - itemAt[i], fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
          return (
            <div key={it} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: frame < itemAt[i] ? 0.15 : 1, transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`}}>
              <div style={{width: 96, height: 96, borderRadius: 48, background: H.red, color: H.white, fontFamily: SANS, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${frame < itemAt[i] ? 0.6 : p})`}}>✓</div>
              <div style={{fontFamily: COND, fontSize: 92, color: H.ink, lineHeight: 1}}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1250, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Tag delay={itemAt[3] + 6} size={110} rotate={-3}>
          DÈS 599 $
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

const Install = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 24], [0, 0.95], clamp);
  return (
    <AbsoluteFill style={{background: H.paper, alignItems: 'center'}}>
      <svg width="560" height="560" viewBox="-110 -110 220 220" style={{position: 'absolute', top: 300}}>
        <circle r="96" fill="none" stroke="#e0dcd6" strokeWidth="16" />
        <circle r="96" fill="none" stroke={H.red} strokeWidth="16" strokeDasharray={`${sweep * 603} 603`} transform="rotate(-90)" strokeLinecap="round" />
        <rect x="-14" y="-118" width="28" height="16" rx="4" fill={H.ink} />
      </svg>
      <div style={{position: 'absolute', top: 440, fontFamily: COND, fontSize: 240, lineHeight: 1, color: H.ink}}>&lt;10</div>
      <div style={{position: 'absolute', top: 650, fontFamily: COND, fontSize: 90, color: H.red}}>MINUTES</div>
      <div style={{position: 'absolute', top: 920}}>
        <Big size={96} color={H.ink} style={{textShadow: 'none'}}>
          À INSTALLER
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  const logo = useSpr(0, {damping: 13, stiffness: 160, mass: 0.7});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 230, transform: `scale(${logo})`, background: H.white, padding: 10, borderRadius: 30, boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 600, display: 'block', borderRadius: 22}} />
      </div>
      <div style={{position: 'absolute', top: 660}}>
        <Big size={80} delay={4}>
          2 PANNEAUX · TOUT INCLUS
        </Big>
        <Big size={170} delay={8} color={H.ink} style={{textShadow: 'none'}}>
          DÈS 599 $
        </Big>
      </div>
      <div style={{position: 'absolute', top: 1010, transform: `scale(${beat})`}}>
        <Tag delay={12} bg={H.white} color={H.red} rotate={-2} size={110}>
          FEEHAPANELS.COM
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ----------------------------------------------------------------
export const Hiver = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.35, 0], clamp);
  const at = (id: string, w: string, nth = 0) => {
    const s = scene(id);
    const hits = words.filter((x) => x.text.toLowerCase().startsWith(w) && x.start * fps >= s.from - 4 && x.start * fps < s.to);
    const hit = hits[Math.min(nth, hits.length - 1)];
    return hit ? Math.max(0, Math.round(hit.start * fps) - s.from) : 10;
  };
  const SCENES: Record<string, React.ReactNode> = {
    dark: <Dark />,
    tape: <Tape />,
    invisible: <Invisible />,
    half: <Half />,
    solution: <Solution nightAt={at('solution', 'encore')} />,
    insert: <Insert lightAt={at('insert', 'et')} />,
    poster: <PosterSwap />,
    life: <Life />,
    bundle: <Bundle itemAt={[at('bundle', 'deux'), at('bundle', 'posters'), at('bundle', 'matériel'), at('bundle', 'tutoriel')]} />,
    install: <Install />,
    cta: <Cta />,
  };
  const light = (f: number) => f >= scene('life').from;
  return (
    <AbsoluteFill style={{background: H.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <Captions words={words} top={1560} accent={H.red} edge={H.deep} font={{fontFamily: COND, letterSpacing: 1}} hidden={(f) => light(f)} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: H.white, opacity: 0.85}} />
      {audio ? <Audio src={staticFile('hiver-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
