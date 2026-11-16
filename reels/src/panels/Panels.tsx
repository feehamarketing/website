import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../feeha/Captions';
import timeline from './timeline.json';

// ---- feehapanels.com look: Feeha red, white, condensed caps ---------------------
const P = {
  red: '#A42325',
  deep: '#6B1517',
  ink: '#111111',
  paper: '#F4F4F4',
  white: '#FFFFFF',
  grey: '#8A8A8A',
  glow: '#FFE7A8',
};
const COND = '"Bebas Neue", sans-serif';
const SANS = '"Inter", sans-serif';
const BEAT = 15;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSpr = (delay = 0, config = {damping: 12, stiffness: 220, mass: 0.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

const Big = ({children, size, delay = 0, color = P.white, style}: {children: React.ReactNode; size: number; delay?: number; color?: string; style?: React.CSSProperties}) => {
  const p = useSpr(delay, {damping: 13, stiffness: 320, mass: 0.5});
  return (
    <div
      style={{
        fontFamily: COND,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: 1,
        color,
        textAlign: 'center',
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [1.2, 1])})`,
        opacity: Math.min(1, p * 2.5),
        textShadow: '0 10px 30px rgba(0,0,0,.35)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Tag = ({children, delay = 0, bg = P.red, color = P.white, rotate = -3, size = 64}: {children: React.ReactNode; delay?: number; bg?: string; color?: string; rotate?: number; size?: number}) => {
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
        padding: '16px 34px 10px',
        borderRadius: 999,
        boxShadow: '0 14px 30px rgba(0,0,0,.35)',
        transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(${rotate}deg)`,
        opacity: frame < delay ? 0 : Math.min(1, p * 2),
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

const Logo = ({width}: {width: number}) => (
  <div style={{background: P.white, borderRadius: 34, padding: 6, boxShadow: '0 30px 70px rgba(0,0,0,.4)'}}>
    <Img src={staticFile('feeha/logo.png')} style={{width, display: 'block', borderRadius: 28}} />
  </div>
);

// ---- the real storefront (client photo, shot from a car at night) -------------
// Photo upscaled 2x to 1082x1490; lit panels measured on the original.
const PHOTO = {w: 1082, h: 1490, top: 215};
const PANELS = [
  {x: 22, y: 195, w: 85, h: 156},
  {x: 348, y: 150, w: 142, h: 198}, // "TENDERS"
].map((b) => ({x: b.x * 2, y: b.y * 2, w: b.w * 2, h: b.h * 2}));
// their reflections on the wet car hood (they go dark with the panels)
const REFLECTIONS = [
  {x: 27, y: 457, w: 87, h: 47},
  {x: 338, y: 467, w: 129, h: 79},
].map((b) => ({x: b.x * 2, y: b.y * 2, w: b.w * 2, h: b.h * 2}));

/**
 * The storefront. `on` 0..1 lights the panels (0 = switched off, like a paper
 * poster in the dark); `night` 0..1 darkens the whole street.
 */
const Storefront = ({on, night, pan = 0, zoom = 1, focus}: {on: number; night: number; pan?: number; zoom?: number; focus?: {x: number; y: number}}) => {
  const frame = useCurrentFrame();
  const fx = focus?.x ?? 541;
  const fy = focus?.y ?? 745;
  return (
    <AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: -1 + pan,
          top: PHOTO.top,
          width: PHOTO.w,
          height: PHOTO.h,
          transform: `scale(${zoom})`,
          transformOrigin: `${fx}px ${fy}px`,
        }}
      >
        <Img
          src={staticFile('panels/vitrine-nuit-2x.jpg')}
          style={{width: '100%', height: '100%', display: 'block', filter: `brightness(${1 - night * 0.7}) saturate(${1 - night * 0.5}) blur(${night * 2}px)`}}
        />
        {REFLECTIONS.map((b, i) => (
          <div
            key={'r' + i}
            style={{position: 'absolute', left: b.x - 10, top: b.y - 10, width: b.w + 20, height: b.h + 20, background: '#141210', borderRadius: 30, filter: 'blur(12px)', opacity: (1 - on) * 0.9}}
          />
        ))}
        {PANELS.map((b, i) => (
          <React.Fragment key={i}>
            {/* switched-off panel: a dull grey sheet */}
            <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, background: '#2a2724', opacity: 1 - on, boxShadow: 'inset 0 0 30px rgba(0,0,0,.6)'}} />
            {/* glow when on */}
            <div
              style={{
                position: 'absolute',
                left: b.x - 20,
                top: b.y - 20,
                width: b.w + 40,
                height: b.h + 40,
                borderRadius: 20,
                boxShadow: `0 0 ${70 + 25 * Math.sin(frame / 7)}px rgba(255,170,60,${0.55 * on})`,
                pointerEvents: 'none',
              }}
            />
          </React.Fragment>
        ))}
      </div>
      {/* soft fade into the black bands above and below the photo */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, #050505 0, transparent ${PHOTO.top + 120}px, transparent ${PHOTO.top + PHOTO.h - 160}px, #050505 ${PHOTO.top + PHOTO.h}px)`}} />
    </AbsoluteFill>
  );
};

// ---- scenes -----------------------------------------------------------------
const Test = () => {
  const frame = useCurrentFrame();
  const hand = (frame * 6) % 360;
  return (
    <AbsoluteFill style={{alignItems: 'center', background: P.red}}>
      <div style={{position: 'absolute', top: 260}}>
        <svg width="360" height="400" viewBox="0 0 100 112">
          <rect x="42" y="0" width="16" height="10" rx="3" fill={P.white} />
          <circle cx="50" cy="62" r="44" fill="none" stroke={P.white} strokeWidth="8" />
          <line x1="50" y1="62" x2={50 + 32 * Math.sin((hand * Math.PI) / 180)} y2={62 - 32 * Math.cos((hand * Math.PI) / 180)} stroke={P.white} strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="62" r="5" fill={P.white} />
        </svg>
      </div>
      <div style={{position: 'absolute', top: 740}}>
        <Big size={150}>LE TEST DES</Big>
        <Big size={260} delay={4} color={P.ink} style={{textShadow: 'none'}}>
          3 SECONDES
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const Drive = ({beats}: {beats: number[]}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pan = interpolate(frame, [0, durationInFrames], [90, -40], clamp);
  const count = beats.filter((b) => frame >= b).length;
  const since = count ? frame - beats[count - 1] : 0;
  return (
    <AbsoluteFill>
      <Storefront on={0} night={1} pan={pan} zoom={1.12} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0}}>
        <Big size={104}>CE SOIR, PASSE DEVANT</Big>
        <Big size={104} delay={3} color={P.red} style={{textShadow: '0 0 30px rgba(0,0,0,.7)'}}>
          TON COMMERCE
        </Big>
      </div>
      {count > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: 1420,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: COND,
            fontSize: 300,
            lineHeight: 1,
            color: P.white,
            transform: `scale(${interpolate(since, [0, 6], [1.6, 1], clamp)})`,
            textShadow: `0 0 40px ${P.red}`,
          }}
        >
          {count}…
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Question = () => {
  const ring = useSpr(4);
  const b = PANELS[1];
  return (
    <AbsoluteFill>
      <Storefront on={0} night={1} pan={-40} zoom={1.12} />
      {/* circle the switched-off "TENDERS" panel */}
      <div
        style={{
          position: 'absolute',
          left: b.x - 40 - 40 + 541 - 541 * 1.12 + b.x * 0.12,
          top: PHOTO.top + b.y - 50 + (745 - 745 * 1.12) + b.y * 0.12,
          width: b.w * 1.12 + 80,
          height: b.h * 1.12 + 100,
          borderRadius: '50%',
          border: `10px solid ${P.red}`,
          transform: `scale(${ring})`,
          opacity: ring,
        }}
      />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0}}>
        <Big size={130}>TON AFFICHE</Big>
        <Big size={150} delay={3} color={P.red} style={{textShadow: '0 0 30px rgba(0,0,0,.7)'}}>
          PAPIER ?
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const Miss = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Storefront on={0} night={1} pan={-40} zoom={1.12} />
      <AbsoluteFill style={{background: 'rgba(5,5,5,.35)'}} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <svg width="200" height="128" viewBox="0 0 110 70" style={{opacity: interpolate(frame, [0, 8], [0, 1], clamp)}}>
          <path d="M5 35 Q55 -10 105 35 Q55 80 5 35Z" fill="none" stroke={P.white} strokeWidth="6" />
          <circle cx="55" cy="35" r="13" fill={P.white} />
          <line x1="15" y1="62" x2="95" y2="8" stroke={P.red} strokeWidth="9" strokeLinecap="round" />
        </svg>
        <Big size={120} delay={3}>
          DANS LE NOIR,
        </Big>
        <Tag delay={9} size={96}>
          PERSONNE LA VOIT.
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

const Reveal = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // the panels flicker on like a real light box, then the street lights up
  const flick = [0, 0, 1, 0.15, 1, 0.4, 1];
  const on = frame < 14 ? flick[Math.floor(frame / 2)] ?? 1 : 1;
  const night = interpolate(frame, [10, 26], [1, 0], clamp);
  const b = PANELS[1];
  const zoom = interpolate(frame, [30, durationInFrames], [1.05, 1.45], {...clamp, easing: (t) => t * (2 - t)});
  const logo = useSpr(20, {damping: 13, stiffness: 180, mass: 0.7});
  return (
    <AbsoluteFill>
      <Storefront on={on} night={night} zoom={zoom} focus={{x: b.x + b.w / 2, y: b.y + b.h / 2}} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0}}>
        <Big size={110} delay={8}>
          PANNEAUX LUMINEUX
        </Big>
        <Big size={130} delay={12} color={P.red} style={{textShadow: '0 0 30px rgba(0,0,0,.7)'}}>
          JOUR ET NUIT
        </Big>
      </div>
      <div style={{position: 'absolute', top: 1500, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${logo})`}}>
        <Logo width={380} />
      </div>
    </AbsoluteFill>
  );
};

const BUNDLES = [
  {size: '2 PANNEAUX LED 50×70 CM', extra: '15 % DE RÉDUCTION', price: '599 $'},
  {size: '2 PANNEAUX A1', extra: '', price: '699,99 $'},
  {size: '2 PANNEAUX A0', extra: '', price: '850,99 $'},
];

const Bundles = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: P.paper, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 330, background: P.red}} />
      <div style={{position: 'absolute', top: 120}}>
        <Big size={150}>OFFRES GROUPÉES</Big>
      </div>
      <div style={{position: 'absolute', top: 280, display: 'flex', gap: 24}}>
        {['dentist', 'icecream'].map((f, i) => {
          const p = spring({frame: frame - i * 4, fps, config: {damping: 13, stiffness: 160}});
          return (
            <Img
              key={f}
              src={staticFile(`panels/${f}.png`)}
              style={{height: 470, borderRadius: 8, boxShadow: '0 30px 50px rgba(0,0,0,.35)', transform: `translateY(${interpolate(p, [0, 1], [500, 0])}px) rotate(${i ? 4 : -4}deg)`}}
            />
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 800, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 18}}>
        {BUNDLES.map((b, i) => {
          const p = spring({frame: frame - 10 - i * 7, fps, config: {damping: 14, stiffness: 220}});
          return (
            <div
              key={b.size}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: i === 0 ? P.red : P.white,
                color: i === 0 ? P.white : P.ink,
                borderRadius: 22,
                padding: '20px 32px 14px',
                boxShadow: '0 12px 30px rgba(0,0,0,.15)',
                transform: `translateX(${interpolate(p, [0, 1], [1100, 0])}px)`,
              }}
            >
              <div>
                <div style={{fontFamily: COND, fontSize: 56, lineHeight: 1}}>{b.size}</div>
                <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, opacity: 0.85, marginTop: 6}}>
                  {b.extra ? `${b.extra} · ` : ''}+ SUSPENSION + 2 RALLONGES
                </div>
              </div>
              <div style={{fontFamily: COND, fontSize: 76, lineHeight: 1, whiteSpace: 'nowrap', marginLeft: 20}}>{b.price}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  return (
    <AbsoluteFill style={{background: P.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 260, transform: `scale(${useSpr(0, {damping: 13, stiffness: 160, mass: 0.7})})`}}>
        <Logo width={640} />
      </div>
      <div style={{position: 'absolute', top: 720}}>
        <Big size={110} delay={4}>
          COMMANDE SUR
        </Big>
      </div>
      <div style={{position: 'absolute', top: 850, transform: `scale(${beat})`}}>
        <Tag delay={8} bg={P.white} color={P.red} rotate={-2} size={120}>
          FEEHAPANELS.COM
        </Tag>
      </div>
      <div style={{position: 'absolute', top: 1060, fontFamily: COND, fontSize: 56, color: P.white, letterSpacing: 3, opacity: interpolate(frame, [14, 24], [0, 1], clamp)}}>
        OFFRES GROUPÉES DÈS 599 $
      </div>
    </AbsoluteFill>
  );
};

// ---- composition --------------------------------------------------------------
export const Panels = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.4, 0], clamp);
  const drive = scene('drive');
  const beats = ['un', 'deux', 'trois'].map((w) => {
    const hit = words.find((x) => x.text.toLowerCase().startsWith(w) && x.start * fps >= drive.from);
    return hit ? Math.round(hit.start * fps) - drive.from : 0;
  });
  const SCENES: Record<string, React.ReactNode> = {
    test: <Test />,
    drive: <Drive beats={beats} />,
    question: <Question />,
    miss: <Miss />,
    reveal: <Reveal />,
    bundles: <Bundles />,
    cta: <Cta />,
  };
  const onLight = (f: number) => f >= scene('bundles').from && f < scene('cta').from;
  return (
    <AbsoluteFill style={{background: P.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      {/* captions above Instagram's bottom overlay; hidden where the screen already says it */}
      <Captions
        words={words}
        top={1560}
        accent={P.red}
        edge={P.deep}
        font={{fontFamily: COND, letterSpacing: 1}}
        hidden={(f) => f < scene('question').from || (f >= scene('reveal').from && f < scene('reveal').to) || onLight(f) || f >= scene('cta').from}
      />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: P.white, opacity: 0.85}} />
      {audio ? <Audio src={staticFile('panels-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
