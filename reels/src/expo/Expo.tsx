import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../feeha/Captions';
import timeline from './timeline.json';

// "L'Expo Feeha": light panels hung like artworks in a white gallery, after the
// 3D studio gallery of feeha.ca. Colours: gallery white, Feeha red.
const X = {
  wall: '#F3F0EB',
  wall2: '#E7E2DA',
  floor: '#D6D1CA',
  red: '#A42325',
  deep: '#6B1517',
  ink: '#1A1A1A',
  grey: '#7A7570',
  white: '#FFFFFF',
};
const COND = '"Bebas Neue", sans-serif';
const SANS = '"Inter", sans-serif';
const BEAT = 15;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSpr = (delay = 0, config = {damping: 14, stiffness: 160, mass: 0.8}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

// ---- gallery pieces -------------------------------------------------------------
/** White gallery room: wall, red stripe, floor, ceiling track. `night` dims it. */
const Room = ({night = 0, children}: {night?: number; children?: React.ReactNode}) => (
  <AbsoluteFill style={{background: X.wall, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, #FBFAF7 0%, ${X.wall} 45%, ${X.wall2} 100%)`}} />
    {/* ceiling track */}
    <div style={{position: 'absolute', top: 40, left: 0, right: 0, height: 10, background: '#2b2b2b', opacity: 0.85}} />
    {/* Feeha red stripe along the wall, like the studio */}
    <div style={{position: 'absolute', top: 1410, left: 0, right: 0, height: 14, background: X.red}} />
    {/* floor */}
    <div style={{position: 'absolute', top: 1470, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg, ${X.floor}, #BEB8B0)`}} />
    <div style={{position: 'absolute', top: 1462, left: 0, right: 0, height: 10, background: '#cfc9c1'}} />
    {children}
    {/* lights off: the room goes dark, light boxes keep shining (they sit above this layer) */}
    <AbsoluteFill style={{background: '#07080a', opacity: night * 0.9, pointerEvents: 'none'}} />
  </AbsoluteFill>
);

/** Spot of light from the ceiling track onto the wall. */
const Spot = ({x, y, w, on = 1}: {x: number; y: number; w: number; on?: number}) => (
  <>
    <div style={{position: 'absolute', left: x - 16, top: 40, width: 32, height: 46, borderRadius: '0 0 12px 12px', background: '#222'}} />
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        height: w * 1.5,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,246,225,.95) 0%, rgba(255,246,225,0) 65%)',
        opacity: on,
        mixBlendMode: 'screen',
      }}
    />
  </>
);

/** A Feeha light box: black aluminium frame, back-lit print, soft glow. */
const LightBox = ({src, w, h, glow = 0.5, style}: {src: string; w: number; h: number; glow?: number; style?: React.CSSProperties}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        border: `${Math.max(8, w * 0.025)}px solid #111`,
        borderRadius: 6,
        background: '#fff',
        boxShadow: `0 ${h * 0.04}px ${h * 0.08}px rgba(0,0,0,.28), 0 0 ${40 + 120 * glow}px rgba(255,248,230,${0.35 + 0.5 * glow})`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1 + glow * 0.12}) saturate(${1 + glow * 0.1})`}} />
      {/* glass sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(115deg, transparent ${30 + Math.sin(frame / 40) * 6}%, rgba(255,255,255,.18) ${42 + Math.sin(frame / 40) * 6}%, transparent ${54 + Math.sin(frame / 40) * 6}%)`,
        }}
      />
    </div>
  );
};

/** Museum label next to a piece. */
const Cartel = ({title, lines, delay = 0, style, dark = false}: {title: string; lines: string[]; delay?: number; style?: React.CSSProperties; dark?: boolean}) => {
  const p = useSpr(delay, {damping: 16, stiffness: 200, mass: 0.6});
  return (
    <div
      style={{
        position: 'absolute',
        background: dark ? 'rgba(20,20,20,.85)' : X.white,
        color: dark ? X.white : X.ink,
        padding: '18px 24px',
        borderRadius: 4,
        boxShadow: '0 6px 18px rgba(0,0,0,.12)',
        fontFamily: SANS,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        ...style,
      }}
    >
      <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 0.5}}>{title}</div>
      {lines.map((l) => (
        <div key={l} style={{fontWeight: 500, fontSize: 24, opacity: 0.75, marginTop: 4}}>
          {l}
        </div>
      ))}
    </div>
  );
};

const Title = ({a, b, delay = 0, top = 120, light = false}: {a: string; b?: string; delay?: number; top?: number; light?: boolean}) => {
  const p = useSpr(delay, {damping: 15, stiffness: 220, mass: 0.6});
  const q = useSpr(delay + 4, {damping: 15, stiffness: 220, mass: 0.6});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: COND, lineHeight: 0.95}}>
      <div style={{fontSize: 96, color: light ? X.white : X.ink, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`}}>{a}</div>
      {b ? <div style={{fontSize: 120, color: X.red, opacity: q, transform: `translateY(${interpolate(q, [0, 1], [30, 0])}px)`}}>{b}</div> : null}
    </div>
  );
};

// ---- scenes ---------------------------------------------------------------------
const SRC = staticFile('feeha/source.mp4');

/** The real 3D gallery from feeha.ca, full width. */
const Intro = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const G = {x: 178, y: 538, w: 722, h: 560};
  const S = 1080 / G.w;
  const label = useSpr(4);
  return (
    <Room>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 470,
          width: 1080,
          height: G.h * S,
          overflow: 'hidden',
          transform: `scale(${interpolate(frame, [0, durationInFrames], [1, 1.12])})`,
        }}
      >
        <OffthreadVideo
          src={SRC}
          muted
          trimBefore={Math.round(4.5 * fps)}
          playbackRate={Math.min(2, (2.7 * fps) / durationInFrames)}
          style={{position: 'absolute', width: 1080 * S, height: 1920 * S, left: -G.x * S, top: -G.y * S, maxWidth: 'none'}}
        />
      </div>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: X.red, opacity: label}}>EXPO · PANNEAUX LUMINEUX</div>
        <div style={{fontFamily: COND, fontSize: 150, lineHeight: 1, color: X.ink, marginTop: 14, opacity: label, transform: `scale(${interpolate(label, [0, 1], [1.15, 1])})`}}>
          LA GALERIE <span style={{color: X.red}}>FEEHA</span>
        </div>
      </div>
    </Room>
  );
};

const HERO = {w: 520, h: 873, x: 280, y: 330};

const Art = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const spot = interpolate(frame, [2, 10], [0, 1], clamp);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05], clamp);
  return (
    <Room>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '540px 760px'}}>
        <Spot x={540} y={140} w={900} on={spot} />
        <LightBox src="panels/art-icecream.png" w={HERO.w} h={HERO.h} glow={0.3 + spot * 0.2} style={{left: HERO.x, top: HERO.y}} />
        <Cartel title="Mango Ice Cream" lines={['Panneau lumineux LED · 50 × 70 cm', 'Collection Feeha']} delay={10} style={{left: 560, top: 1250}} />
      </AbsoluteFill>
      <Title a="ICI, CHAQUE OFFRE" b="EST UNE ŒUVRE" top={70} />
    </Room>
  );
};

const Glow = ({nightAt}: {nightAt: number}) => {
  const frame = useCurrentFrame();
  const night = interpolate(frame, [nightAt, nightAt + 14], [0, 1], clamp);
  const pill = (txt: string, on: boolean) => (
    <div style={{fontFamily: COND, fontSize: 64, padding: '12px 34px 6px', borderRadius: 999, background: on ? X.red : 'transparent', color: on ? X.white : night > 0.5 ? '#999' : X.grey}}>{txt}</div>
  );
  return (
    <AbsoluteFill>
      <Room night={night}>
        <Spot x={540} y={140} w={900} on={1 - night} />
      </Room>
      {/* the light box sits above the dark layer: it keeps shining */}
      <LightBox src="panels/art-icecream.png" w={HERO.w * 1.05} h={HERO.h * 1.05} glow={0.5 + night * 0.5} style={{left: 540 - (HERO.w * 1.05) / 2, top: HERO.y + 40}} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 360,
          top: HERO.y + HERO.h + 100,
          width: 720,
          height: 160,
          background: 'radial-gradient(ellipse, rgba(255,240,210,.55), transparent 70%)',
          opacity: night,
          filter: 'blur(10px)',
        }}
      />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10}}>
        <div style={{display: 'flex', background: night > 0.5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', borderRadius: 999, padding: 8}}>
          {pill('JOUR', night < 0.5)}
          {pill('SOIR', night >= 0.5)}
        </div>
      </div>
      <Title a="ÇA ATTIRE L'ŒIL" top={215} light={night > 0.5} />
    </AbsoluteFill>
  );
};

const WALL = [
  {src: 'panels/art-dentist.png', label: 'CLINIQUE', word: 'clinique'},
  {src: 'panels/art-building.png', label: 'IMMOBILIER', word: 'immobilier'},
  {src: 'panels/art-icecream.png', label: 'RESTO', word: 'resto'},
];

const Wall = ({wordAt}: {wordAt: (w: string) => number}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pan = interpolate(frame, [0, durationInFrames], [40, -40], clamp);
  return (
    <Room>
      <AbsoluteFill style={{transform: `translateX(${pan}px)`}}>
        {WALL.map((p, i) => {
          const x = 40 + i * 345;
          const at = wordAt(p.word);
          const on = interpolate(frame, [at, at + 6], [0, 1], clamp);
          return (
            <React.Fragment key={p.src}>
              <Spot x={x + 150} y={300} w={460} on={0.35 + on * 0.65} />
              <LightBox src={p.src} w={300} h={500} glow={0.2 + on * 0.6} style={{left: x, top: 520, transform: `scale(${1 + on * 0.04})`}} />
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  width: 300,
                  top: 1080,
                  textAlign: 'center',
                  fontFamily: COND,
                  fontSize: 64,
                  color: on > 0.5 ? X.red : X.grey,
                  opacity: 0.4 + on * 0.6,
                  transform: `scale(${1 + on * 0.1})`,
                }}
              >
                {p.label}
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
      <Title a="TON MESSAGE" b="BRILLE" top={120} />
    </Room>
  );
};

const COLLECTIONS = [
  {name: 'COLLECTION LED · 50×70 CM', note: '15 % DE RÉDUCTION', price: '599 $', arts: ['panels/art-hospital.png', 'panels/art-icecream.png'], best: true},
  {name: 'COLLECTION A1', note: '', price: '699,99 $', arts: ['panels/art-building.png', 'panels/art-dentist.png']},
  {name: 'COLLECTION A0', note: '', price: '850,99 $', arts: ['panels/art-dentist.png', 'panels/art-hospital.png']},
];

const Bundles = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Room>
      <Title a="LES COLLECTIONS" b="OFFRES GROUPÉES" top={90} />
      {COLLECTIONS.map((c, i) => {
        const p = spring({frame: frame - 6 - i * 8, fps, config: {damping: 15, stiffness: 180}});
        const y = 420 + i * 330;
        return (
          <div key={c.name} style={{position: 'absolute', left: 60, right: 60, top: y, height: 290, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 300 : -300, 0])}px)`}}>
            {c.arts.map((a, k) => (
              <LightBox key={k} src={a} w={150} h={250} glow={0.4} style={{left: k * 170, top: 20}} />
            ))}
            <div
              style={{
                position: 'absolute',
                left: 370,
                right: 0,
                top: 10,
                bottom: 10,
                background: c.best ? X.red : X.white,
                color: c.best ? X.white : X.ink,
                borderRadius: 8,
                boxShadow: '0 10px 26px rgba(0,0,0,.14)',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{fontFamily: COND, fontSize: 46, lineHeight: 1}}>{c.name}</div>
                <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, opacity: 0.8, marginTop: 8}}>2 panneaux + suspension + 2 rallonges</div>
                {c.note ? <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, marginTop: 6}}>{c.note}</div> : null}
              </div>
              <div style={{fontFamily: COND, fontSize: 84, lineHeight: 1, alignSelf: 'flex-end'}}>{c.price}</div>
            </div>
          </div>
        );
      })}
    </Room>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  const box = useSpr(0);
  return (
    <Room>
      <Spot x={540} y={120} w={900} />
      {/* the Feeha logo as a lit panel on the wall */}
      <div style={{position: 'absolute', left: 540 - 330, top: 300, transform: `scale(${box})`}}>
        <div
          style={{
            width: 660,
            padding: 26,
            background: X.white,
            border: '14px solid #111',
            borderRadius: 6,
            boxShadow: '0 30px 60px rgba(0,0,0,.25), 0 0 120px rgba(255,248,230,.8)',
          }}
        >
          <Img src={staticFile('feeha/logo-clean.png')} style={{width: '100%', display: 'block'}} />
        </div>
      </div>
      <Title a="EXPOSE" b="TON COMMERCE" top={760} delay={4} />
      <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${useSpr(10) * beat})`}}>
        <div style={{fontFamily: COND, fontSize: 100, color: X.white, background: X.red, padding: '18px 50px 8px', borderRadius: 999, boxShadow: `0 12px 0 ${X.deep}`}}>FEEHAPANELS.COM</div>
      </div>
      <div style={{position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: X.ink, opacity: interpolate(frame, [16, 26], [0, 1], clamp)}}>
        OFFRES GROUPÉES DÈS 599 $
      </div>
    </Room>
  );
};

// ---- composition ----------------------------------------------------------------
export const Expo = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 6], [0.5, 0], clamp);
  const at = (id: string) => (w: string) => {
    const s = scene(id);
    const hit = words.find((x) => x.text.toLowerCase().startsWith(w) && x.start * fps >= s.from - 4);
    return hit ? Math.max(0, Math.round(hit.start * fps) - s.from) : 10;
  };
  const glow = scene('glow');
  const nightAt = at('glow')('comme');
  const isNight = frame >= glow.from + nightAt && frame < glow.to;
  const SCENES: Record<string, React.ReactNode> = {
    intro: <Intro />,
    art: <Art />,
    glow: <Glow nightAt={nightAt} />,
    wall: <Wall wordAt={at('wall')} />,
    bundles: <Bundles />,
    cta: <Cta />,
  };
  return (
    <AbsoluteFill style={{background: X.wall}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <Captions
        words={words}
        top={1560}
        accent={X.red}
        edge={X.deep}
        font={{fontFamily: COND, letterSpacing: 1}}
        ink={isNight ? X.white : X.ink}
        shadow={isNight ? '0 4px 18px rgba(0,0,0,.9)' : 'none'}
        hidden={(f) => f >= scene('bundles').from}
      />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: X.red}} />
      {audio ? <Audio src={staticFile('expo-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
