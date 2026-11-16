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

// ---- the street ---------------------------------------------------------------
const SHOPS = [
  {w: 520, wall: '#C9B8A6', awning: '#2F5D50', name: 'BOULANGERIE'},
  {w: 560, wall: '#B9B2AC', awning: '#7A6A5A', name: 'TON COMMERCE', you: true},
  {w: 500, wall: '#A7B4BE', awning: '#3B4F6B', name: 'NETTOYEUR'},
  {w: 520, wall: '#D2C2B0', awning: '#8A3B2E', name: 'CAFÉ'},
  {w: 540, wall: '#BEB6C4', awning: '#4D3F5E', name: 'PHARMACIE'},
];
const STREET_W = SHOPS.reduce((s, x) => s + x.w, 0);
const YOU_X = SHOPS[0].w + SHOPS[1].w / 2; // centre of "your" shop on the street

/** A row of storefronts; `poster` is what hangs in your window. */
const Street = ({x, lit = 0, dim = 0, highlight = 0}: {x: number; lit?: number; dim?: number; highlight?: number}) => {
  const frame = useCurrentFrame();
  let left = 0;
  return (
    <div style={{position: 'absolute', top: 420, left: 0, width: 1080, height: 1000, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, #2a3240 0%, #3a4352 60%, #20242b 100%)`}} />
      <div style={{position: 'absolute', left: 540 - x, top: 0, width: STREET_W, height: 1000}}>
        {SHOPS.map((s, i) => {
          const x0 = left;
          left += s.w;
          return (
            <div key={i} style={{position: 'absolute', left: x0, top: 60, width: s.w - 14, height: 780, background: s.wall, filter: `saturate(${1 - dim * 0.8}) brightness(${1 - dim * 0.45})`}}>
              {/* sign band */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 40, height: 90, background: '#2b2b2b', color: '#d9d9d9', fontFamily: COND, fontSize: 58, textAlign: 'center', lineHeight: '96px', letterSpacing: 4}}>
                {s.name}
              </div>
              {/* awning */}
              <div
                style={{
                  position: 'absolute',
                  left: -10,
                  right: -10,
                  top: 150,
                  height: 80,
                  background: `repeating-linear-gradient(90deg, ${s.awning} 0 50px, #e9e2d6 50px 100px)`,
                  clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)',
                }}
              />
              {/* window */}
              <div style={{position: 'absolute', left: 30, top: 260, width: s.w - 200, height: 420, background: 'linear-gradient(160deg, #1d2633, #0e131a)', border: '10px solid #3a3a3a'}}>
                {s.you ? (
                  <div style={{position: 'absolute', left: 70, top: 40, width: 200, height: 290}}>
                    {/* plain paper poster */}
                    <div style={{position: 'absolute', inset: 0, background: '#cfcac0', opacity: 1 - lit, padding: 16, fontFamily: COND, fontSize: 40, color: '#8d867a', textAlign: 'center'}}>
                      SPÉCIAL
                      <br />
                      DU MOIS
                    </div>
                    {/* the lit Feeha panel */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: -26,
                        opacity: lit,
                        boxShadow: `0 0 ${60 + 40 * Math.sin(frame / 6)}px ${P.glow}, 0 0 140px rgba(255,231,168,.6)`,
                        border: '8px solid #0c0c0c',
                        background: '#fff',
                      }}
                    >
                      <Img src={staticFile('panels/icecream.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                    {/* "did you see it?" circle */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: -44,
                        borderRadius: '50%',
                        border: `10px solid ${P.red}`,
                        transform: `scale(${highlight})`,
                        opacity: highlight,
                      }}
                    />
                  </div>
                ) : null}
              </div>
              {/* door */}
              <div style={{position: 'absolute', right: 30, top: 300, width: 130, height: 480, background: '#2f2f2f', border: '8px solid #444'}} />
            </div>
          );
        })}
      </div>
      {/* sidewalk */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 840, height: 160, background: 'linear-gradient(180deg, #6d6d6d, #3c3c3c)'}} />
    </div>
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
  const x = interpolate(frame, [0, durationInFrames], [STREET_W - 300, YOU_X], {...clamp, easing: (t) => 1 - (1 - t) ** 2});
  const count = beats.filter((b) => frame >= b).length;
  const since = count ? frame - beats[count - 1] : 0;
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Street x={x} />
      {/* motion streaks while driving */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, transparent 2px 60px)', opacity: interpolate(frame, [0, durationInFrames], [1, 0], clamp)}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <Big size={96}>PASSE DEVANT TON COMMERCE</Big>
      </div>
      {count > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: 1450,
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
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Street x={YOU_X} dim={interpolate(frame, [0, 12], [0, 0.6], clamp)} highlight={useSpr(6)} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <Big size={120}>T'AS REMARQUÉ</Big>
        <Big size={150} delay={3} color={P.red} style={{textShadow: '0 0 30px rgba(0,0,0,.6)'}}>
          TON AFFICHE ?
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const Miss = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Street x={YOU_X} dim={0.85} />
      <AbsoluteFill style={{background: 'rgba(17,17,17,.55)'}} />
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <svg width="220" height="140" viewBox="0 0 110 70" style={{opacity: interpolate(frame, [0, 8], [0, 1], clamp)}}>
          <path d="M5 35 Q55 -10 105 35 Q55 80 5 35Z" fill="none" stroke={P.white} strokeWidth="6" />
          <circle cx="55" cy="35" r="13" fill={P.white} />
          <line x1="15" y1="62" x2="95" y2="8" stroke={P.red} strokeWidth="9" strokeLinecap="round" />
        </svg>
        <Big size={150} delay={4}>
          TES CLIENTS
        </Big>
        <Tag delay={10} size={110}>
          AUSSI.
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

const Reveal = () => {
  const frame = useCurrentFrame();
  // the panel flickers on, like a real light box
  const flick = [0, 0, 1, 0.2, 1, 0.5, 1];
  const lit = frame < 14 ? flick[Math.floor(frame / 2)] ?? 1 : 1;
  const logo = useSpr(18, {damping: 13, stiffness: 180, mass: 0.7});
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Street x={YOU_X} lit={lit} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0}}>
        <Big size={110}>PANNEAUX LUMINEUX</Big>
      </div>
      <div style={{position: 'absolute', top: 1270, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${logo})`}}>
        <Logo width={420} />
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
        hidden={(f) => f < scene('question').from || onLight(f) || f >= scene('cta').from}
      />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: P.white, opacity: 0.85}} />
      {audio ? <Audio src={staticFile('panels-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
