import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions} from './Captions';
import {BEAT, F, MONO, wide} from './theme';
import timeline from './timeline.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type SceneId = 'hook' | 'price' | 'spin' | 'check' | 'flyers' | 'grow' | 'light' | 'outro';

// ---- footage: the screen of the phone in the supplied video ----------------
const SRC = staticFile('feeha/source.mp4');
const SCREEN = {x: 178, y: 418, w: 722, h: 1402}; // source pixels
const K = 0.82; // display scale
const SW = SCREEN.w * K;
const SH = SCREEN.h * K;
const BEZEL = 15;
const PHONE_TOP = 420;

// Seconds of the source video used for each scene.
const SEGMENTS: Partial<Record<SceneId, [number, number]>> = {
  price: [24.3, 25.95], // Half letter -> Postcard: total drops from $65.99 to $52.99
  spin: [19.85, 24.0], // 3D flyer and tri-fold leaflet turning
  check: [24.15, 24.7], // "Free file check" on the order page
  flyers: [10.05, 13.9], // flyers page, "From $21.99"
  grow: [14.05, 16.9],
  light: [17.05, 19.9],
};

const TITLES: Partial<Record<SceneId, {label: string; a: string; b: string; accent?: string}>> = {
  price: {label: '01 / LIVE PRICING', a: 'Pick it.', b: 'Priced instantly.'},
  spin: {label: '02 / 3D PREVIEW', a: 'Spin it', b: 'before you print.'},
  check: {label: '03 / FILE CHECK', a: 'Every file.', b: 'Checked. Free.'},
  flyers: {label: '04 / FLYERS', a: 'Flyers from', b: '$21.99'},
  grow: {label: '05 / BEYOND PRINT', a: 'Websites.', b: 'Ads.', accent: F.blue},
  light: {label: '06 / ILLUMINATED', a: 'Even', b: 'neon signs.', accent: F.amber},
};

const CHIPS: Partial<Record<SceneId, {t: string; bg: string; fg: string}[]>> = {
  price: [
    {t: 'Choose size', bg: F.white, fg: F.ink},
    {t: 'Choose paper', bg: F.coral, fg: F.white},
    {t: 'Total updates live', bg: F.red, fg: F.white},
  ],
  spin: [
    {t: 'Drag to rotate', bg: F.white, fg: F.ink},
    {t: 'Unfold the leaflet', bg: F.coral, fg: F.white},
  ],
  check: [
    {t: '✓ Free file check', bg: F.coral, fg: F.white},
    {t: '✓ CMYK colour', bg: F.white, fg: F.ink},
  ],
  flyers: [
    {t: 'Double-sided', bg: F.white, fg: F.ink},
    {t: 'Tri-fold', bg: F.coral, fg: F.white},
  ],
  grow: [
    {t: 'Websites', bg: F.blue, fg: F.white},
    {t: 'SEO', bg: F.white, fg: F.ink},
    {t: 'Google Ads', bg: F.blue, fg: F.white},
  ],
  light: [
    {t: 'Custom neon', bg: F.amber, fg: F.ink},
    {t: 'LED panels', bg: F.white, fg: F.ink},
  ],
};

// ---- small pieces -----------------------------------------------------------
const Sparkle = ({size, color = F.coral, style}: {size: number; color?: string; style?: React.CSSProperties}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={style}>
    <path d="M0 -50 C6 -10 10 -6 50 0 C10 6 6 10 0 50 C-6 10 -10 6 -50 0 C-10 -6 -6 -10 0 -50Z" fill={color} />
  </svg>
);

const Background = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % BEAT, [0, 3, BEAT], [1, 0.6, 0.45]);
  const sparkles = [
    [90, 420, 46, 0], [960, 300, 34, 9], [70, 1500, 30, 17], [985, 1250, 52, 5],
    [880, 1720, 26, 12], [160, 950, 22, 3], [1000, 760, 20, 21],
  ];
  return (
    <AbsoluteFill style={{background: F.ink, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% ${48 + Math.sin(frame / 50) * 6}%, ${F.wine} 0%, ${F.ink} 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 520,
          width: 800,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${F.red} 0%, transparent 65%)`,
          opacity: 0.32 + pulse * 0.16,
          filter: 'blur(30px)',
        }}
      />
      {/* vertical light bands, as in the site's studio */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,.028) 0 2px, transparent 2px 120px)',
          backgroundPosition: `${frame * 0.8}px 0`,
        }}
      />
      {sparkles.map(([x, y, s, o], i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((frame + o * 7) / 22));
        return (
          <Sparkle
            key={i}
            size={s}
            color={i % 3 === 0 ? F.white : F.coral}
            style={{
              position: 'absolute',
              left: x - s / 2,
              top: y - s / 2 + Math.sin((frame + o * 10) / 30) * 14,
              opacity: tw * 0.75,
              transform: `rotate(${frame * 0.6 + o * 20}deg) scale(${0.7 + tw * 0.4})`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.7) 100%)'}} />
    </AbsoluteFill>
  );
};

const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="fg">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fg)" />
      </svg>
    </AbsoluteFill>
  );
};

/** A line of text revealed from behind a mask. */
const Reveal = ({children, delay, style}: {children: React.ReactNode; delay: number; style?: React.CSSProperties}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 15, stiffness: 200, mass: 0.7}});
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6}}>
      <div style={{transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%)`, ...style}}>{children}</div>
    </div>
  );
};

const Title = ({id}: {id: SceneId}) => {
  const t = TITLES[id]!;
  const size = Math.min(96, 980 / (Math.max(t.a.length, t.b.length) * 0.62));
  const frame = useCurrentFrame();
  const label = interpolate(frame, [0, 8], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 108, left: 0, right: 0, textAlign: 'center'}}>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 7,
          color: t.accent ?? F.coral,
          opacity: label,
          marginBottom: 12,
        }}
      >
        — {t.label} —
      </div>
      <Reveal delay={1} style={{...wide, fontSize: size, lineHeight: 1.02, color: F.white, letterSpacing: -2}}>
        {t.a}
      </Reveal>
      <Reveal delay={5} style={{...wide, fontSize: size, lineHeight: 1.02, color: t.accent ?? F.coral, letterSpacing: -2}}>
        {t.b}
      </Reveal>
    </div>
  );
};

const Chips = ({id}: {id: SceneId}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chips = CHIPS[id];
  if (!chips) return null;
  const spots = [
    {left: 40, top: 760, rot: -6},
    {right: 36, top: 1040, rot: 5},
    {left: 56, top: 1330, rot: -3},
  ];
  return (
    <>
      {chips.map((c, i) => {
        const p = spring({frame: frame - 6 - i * 6, fps, config: {damping: 10, stiffness: 260, mass: 0.6}});
        const s = spots[i];
        const float = Math.sin((frame + i * 20) / 18) * 8;
        return (
          <div
            key={c.t}
            style={{
              position: 'absolute',
              left: s.left,
              right: s.right,
              top: s.top + float,
              ...wide,
              fontWeight: 750,
              fontSize: 40,
              color: c.fg,
              background: c.bg,
              padding: '14px 28px 12px',
              borderRadius: 999,
              boxShadow: '0 18px 40px rgba(0,0,0,.55)',
              transform: `scale(${p}) rotate(${s.rot}deg)`,
              whiteSpace: 'nowrap',
            }}
          >
            {c.t}
          </div>
        );
      })}
    </>
  );
};

/** The phone: our own bezel around the screen of the supplied footage. */
const Phone = ({scenes, cuts}: {scenes: {id: string; from: number; to: number}[]; cuts: number[]}) => {
  const frame = useCurrentFrame(); // relative to the first phone scene
  const {fps} = useVideoConfig();
  const first = scenes[0].from;
  const abs = frame + first;
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 120, mass: 0.9}});
  const since = Math.min(...cuts.filter((c) => c <= abs).map((c) => abs - c), 99);
  const punch = interpolate(since, [0, 8], [1.045, 1], clamp);
  const idx = scenes.findIndex((s) => abs >= s.from && abs < s.to);
  const sway = Math.sin(frame / 38) * 2.2;
  const push = 1 + interpolate(abs - (scenes[idx]?.from ?? 0), [0, 120], [0, 0.03], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - SW) / 2 - BEZEL,
        top: PHONE_TOP,
        width: SW + BEZEL * 2,
        height: SH + BEZEL * 2,
        borderRadius: 74,
        background: 'linear-gradient(145deg, #2a2626, #0b0909 45%, #1d1a1a)',
        boxShadow: `0 0 0 2px #3a3434, 0 60px 120px rgba(0,0,0,.75), 0 0 160px rgba(165,15,20,.45)`,
        transform: `perspective(2200px) translateY(${interpolate(enter, [0, 1], [900, 0])}px) rotateX(${interpolate(enter, [0, 1], [24, 0])}deg) rotateY(${sway}deg) rotateZ(${interpolate(enter, [0, 1], [-8, 0]) + sway * 0.4}deg) scale(${punch * push})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: BEZEL,
          top: BEZEL,
          width: SW,
          height: SH,
          borderRadius: 60,
          overflow: 'hidden',
          background: F.paper,
        }}
      >
        {scenes.map((s) => {
          const seg = SEGMENTS[s.id as SceneId]!;
          const len = s.to - s.from;
          const segFrames = (seg[1] - seg[0]) * fps;
          // Fit the clip to the scene: speed up (max 2x) or slow down (min 0.35x);
          // if it is still too short, hold its last frame instead of running
          // into the next part of the source.
          const rate = Math.min(2, Math.max(0.35, segFrames / len));
          const playFrames = Math.min(len, Math.floor(segFrames / rate) - 1);
          const video = (
            <OffthreadVideo
              src={SRC}
              muted
              trimBefore={Math.round(seg[0] * fps)}
              playbackRate={rate}
              style={{
                position: 'absolute',
                width: 1080 * K,
                height: 1920 * K,
                left: -SCREEN.x * K,
                top: -SCREEN.y * K,
                maxWidth: 'none',
              }}
            />
          );
          return (
            <React.Fragment key={s.id}>
              <Sequence from={s.from - first} durationInFrames={playFrames} layout="none">
                {video}
              </Sequence>
              {playFrames < len ? (
                <Sequence from={s.from - first + playFrames} durationInFrames={len - playFrames} layout="none">
                  <Freeze frame={playFrames - 1}>{video}</Freeze>
                </Sequence>
              ) : null}
            </React.Fragment>
          );
        })}
        {/* glass sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${115 + sway * 4}deg, rgba(255,255,255,.16) 0%, transparent 28%, transparent 70%, rgba(255,255,255,.06) 100%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

// ---- hook & outro -----------------------------------------------------------
/** The problem, told as a chat that goes nowhere. */
const Hook = ({wordAt}: {wordAt: (w: string) => number}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const end = durationInFrames; // length of the hook
  const at = (share: number) => Math.round(end * share);
  const bubble = (text: string, from: number, me: boolean, extra?: React.CSSProperties) => {
    const p = spring({frame: frame - from, fps, config: {damping: 13, stiffness: 240, mass: 0.6}});
    return (
      <div
        style={{
          alignSelf: me ? 'flex-end' : 'flex-start',
          maxWidth: 700,
          ...wide,
          fontWeight: 650,
          fontStretch: '100%',
          fontSize: 50,
          lineHeight: 1.2,
          color: me ? F.white : F.ink,
          background: me ? F.coral : F.paper,
          padding: '26px 36px',
          borderRadius: 40,
          borderBottomRightRadius: me ? 10 : 40,
          borderBottomLeftRadius: me ? 40 : 10,
          boxShadow: '0 20px 50px rgba(0,0,0,.45)',
          transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
          transformOrigin: me ? 'bottom right' : 'bottom left',
          opacity: frame < from ? 0 : Math.min(1, p * 2),
          ...extra,
        }}
      >
        {text}
      </div>
    );
  };
  const typingFrom = at(0.2);
  const replyAt = at(0.38);
  const laterAt = at(0.56);
  const nudgeAt = at(0.7);
  const dots = frame >= typingFrom && frame < replyAt;
  const later = spring({frame: frame - laterAt, fps, config: {damping: 14, stiffness: 200}});
  // the thread drifts up and blurs out as the answer arrives
  const out = interpolate(frame, [end - 10, end], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 150,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 8,
          color: F.coral,
          opacity: interpolate(frame, [0, 8], [0, 1], clamp),
        }}
      >
        — SOUND FAMILIAR? —
      </div>
      <div
        style={{
          position: 'absolute',
          top: 330,
          left: 70,
          right: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
          transform: `translateY(${-out * 140}px) scale(${1 - out * 0.08})`,
          filter: `blur(${out * 14}px)`,
          opacity: 1 - out * 0.8,
        }}
      >
        {bubble('Hi! How much for 500 flyers?', 2, true)}
        {dots ? (
          <div style={{alignSelf: 'flex-start', background: F.paper, borderRadius: 40, padding: '30px 38px', display: 'flex', gap: 12}}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: '#8a8080',
                  transform: `translateY(${Math.sin((frame - i * 4) / 3) * 6}px)`,
                }}
              />
            ))}
          </div>
        ) : null}
        {bubble("We'll send you a quote.", replyAt, false)}
        <div
          style={{
            alignSelf: 'center',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 6,
            color: F.white,
            background: 'rgba(255,255,255,.08)',
            border: '2px solid rgba(255,255,255,.25)',
            borderRadius: 999,
            padding: '12px 30px',
            margin: '10px 0',
            opacity: frame < laterAt ? 0 : later,
            transform: `scale(${interpolate(later, [0, 1], [1.6, 1])})`,
          }}
        >
          3 DAYS LATER
        </div>
        {bubble('Hello??', nudgeAt, true)}
        {bubble('Still waiting on that price…', nudgeAt + 8, true, {background: F.red})}
      </div>
    </AbsoluteFill>
  );
};

const Outro = ({wordAt}: {wordAt: (w: string, nth?: number) => number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame, fps, config: {damping: 13, stiffness: 150, mass: 0.8}});
  const url = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 200, mass: 0.6}});
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.05, 1.02, 1]);
  const tags: [string, number, string][] = [
    ['Print it.', 12, F.white],
    ['Grow it.', 18, F.white],
    ['Light it up.', 24, F.coral],
  ];
  const soonAt = wordAt('launching');
  const soon = spring({frame: frame - soonAt, fps, config: {damping: 9, stiffness: 240, mass: 0.7}});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          background: F.white,
          borderRadius: 44,
          padding: 6,
          boxShadow: `0 40px 100px rgba(0,0,0,.6), 0 0 120px rgba(248,88,72,.35)`,
          transform: `perspective(1600px) rotateX(${interpolate(logo, [0, 1], [60, 0])}deg) scale(${interpolate(logo, [0, 1], [0.5, 1])})`,
          opacity: Math.min(1, logo * 2),
        }}
      >
        <Img src={staticFile('feeha/logo.png')} style={{width: 640, display: 'block', borderRadius: 38}} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 740,
          ...wide,
          fontWeight: 900,
          fontSize: 172,
          letterSpacing: -6,
          color: F.white,
          transform: `translateY(${interpolate(url, [0, 1], [80, 0])}px) scale(${interpolate(url, [0, 1], [0.8, 1])})`,
          opacity: url,
        }}
      >
        feeha<span style={{color: F.coral}}>.ca</span>
      </div>
      <div style={{position: 'absolute', top: 990, display: 'flex', gap: 22}}>
        {tags.map(([t, at, c]) => {
          const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
          const on = frame >= at;
          return (
            <div
              key={t}
              style={{
                ...wide,
                fontWeight: 800,
                fontSize: 50,
                color: on ? c : 'rgba(255,255,255,.25)',
                transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px) scale(${on ? interpolate(p, [0, 1], [1.25, 1]) : 1})`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1130, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, width: 900}}>
        {['PRINTING', 'BUSINESS SERVICES', 'ILLUMINATED PRODUCTS'].map((t, i) => {
          const p = spring({frame: frame - 14 - i * 5, fps, config: {damping: 14, stiffness: 200}});
          return (
            <div
              key={t}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: 4,
                color: F.white,
                border: '2px solid rgba(255,255,255,.35)',
                borderRadius: 999,
                padding: '12px 26px',
                opacity: p,
                transform: `scale(${p})`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1380,
          ...wide,
          fontWeight: 900,
          fontSize: 60,
          letterSpacing: -1,
          color: F.white,
          background: F.coral,
          padding: '26px 64px 22px',
          borderRadius: 999,
          boxShadow: `0 14px 0 ${F.red}, 0 0 90px rgba(248,88,72,.7)`,
          transform: `scale(${soon * beat}) rotate(-2deg)`,
          opacity: frame < soonAt ? 0 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        LAUNCHING SOON
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1640,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 7,
          color: F.coral,
          opacity: interpolate(frame, [20, 34], [0, 1], clamp),
        }}
      >
        MARKETING STUDIO · MONTRÉAL
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ------------------------------------------------------------
export const Feeha = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const scene = (id: SceneId) => scenes.find((s) => s.id === id)!;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.4, 0], clamp);

  // Frame (relative to a scene) at which the nth word starting with `prefix` is spoken.
  const wordAtIn = (id: SceneId) => (prefix: string, nth = 0) => {
    const s = scene(id);
    const hits = words.filter((w) => w.text.toLowerCase().startsWith(prefix) && w.start * fps >= s.from - 4);
    const w = hits[Math.min(nth, hits.length - 1)];
    if (!w) return 8;
    return Math.max(0, Math.round(w.start * fps) - s.from - 2);
  };

  const phoneScenes = scenes.filter((s) => SEGMENTS[s.id as SceneId]);
  const hook = scene('hook');
  const outro = scene('outro');
  const phoneFrom = phoneScenes[0].from;
  const phoneTo = phoneScenes[phoneScenes.length - 1].to;

  return (
    <AbsoluteFill style={{background: F.ink}}>
      <Background />
      <Sequence from={hook.from} durationInFrames={hook.to - hook.from}>
        <Hook wordAt={wordAtIn('hook')} />
      </Sequence>
      <Sequence from={phoneFrom} durationInFrames={phoneTo - phoneFrom}>
        <Phone scenes={phoneScenes} cuts={cuts} />
      </Sequence>
      {phoneScenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          <Title id={s.id as SceneId} />
          <Chips id={s.id as SceneId} />
        </Sequence>
      ))}
      <Sequence from={outro.from} durationInFrames={outro.to - outro.from}>
        <Outro wordAt={(w, n) => wordAtIn('outro')(w, n ?? 0)} />
      </Sequence>
      <Captions words={words} top={1690} hidden={(f) => f >= outro.from} />
      <AbsoluteFill style={{background: '#fff3ef', opacity: flash, pointerEvents: 'none'}} />
      <Grain />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 8,
          width: `${(frame / durationInFrames) * 100}%`,
          background: F.coral,
        }}
      />
      {audio ? <Audio src={staticFile('feeha-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
