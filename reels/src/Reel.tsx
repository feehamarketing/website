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
import {Background, Grain} from './Background';
import {Captions} from './Captions';
import {BEAT, BODY, C, DISPLAY} from './theme';
import timeline from './timeline.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useIn = (delay = 0, cfg = {damping: 12, stiffness: 190, mass: 0.7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: cfg});
};

/** Big display line that slams in from one side. */
const Slam = ({
  children,
  delay,
  from,
  size,
  color = C.white,
  bg,
  rotate = 0,
}: {
  children: React.ReactNode;
  delay: number;
  from: -1 | 1;
  size: number;
  color?: string;
  bg?: string;
  rotate?: number;
}) => {
  const p = useIn(delay);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.92,
        color,
        background: bg,
        padding: bg ? '14px 34px 0' : 0,
        borderRadius: 18,
        letterSpacing: 2,
        transform: `translateX(${interpolate(p, [0, 1], [from * 1100, 0])}px) rotate(${rotate}deg) skewX(${interpolate(p, [0, 1], [from * -18, 0])}deg)`,
        opacity: Math.min(1, p * 3),
        textShadow: bg ? 'none' : '0 10px 40px rgba(0,0,0,.6)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

const Hook = () => {
  const frame = useCurrentFrame();
  const tag = useIn(2);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 8,
          color: C.yellow,
          textTransform: 'uppercase',
          opacity: tag,
          transform: `translateY(${interpolate(tag, [0, 1], [-40, 0])}px)`,
        }}
      >
        ● Plateau-Mont-Royal
      </div>
      <div
        style={{
          position: 'absolute',
          top: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26,
          transform: `scale(${1 + frame * 0.0012})`,
        }}
      >
        <Slam delay={0} from={-1} size={300}>
          FAST FOOD
        </Slam>
        <Slam delay={7} from={1} size={330} color={C.black} bg={C.yellow} rotate={-4}>
          ÉLITE.
        </Slam>
        <Slam delay={18} from={-1} size={170}>
          À MONTRÉAL ?
        </Slam>
      </div>
    </AbsoluteFill>
  );
};

const Brand = () => {
  const p = useIn(0, {damping: 11, stiffness: 220, mass: 0.6});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Img
        src={staticFile('logo.png')}
        style={{
          position: 'absolute',
          top: 330,
          width: 820,
          borderRadius: 60,
          transform: `scale(${interpolate(p, [0, 1], [2.6, 1])}) rotate(${interpolate(p, [0, 1], [-14, -3])}deg)`,
          boxShadow: `0 0 140px ${C.red}, 0 40px 80px rgba(0,0,0,.7)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Food = ({
  src,
  top,
  bottom,
  n,
  tilt,
  dir,
  position = 'center',
}: {
  src: string;
  top: string;
  bottom: string;
  n: string;
  tilt: number;
  dir: -1 | 1;
  position?: string;
}) => {
  const frame = useCurrentFrame();
  const p = useIn(0, {damping: 13, stiffness: 210, mass: 0.7});
  const t = useIn(3);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 250, left: 80, right: 80}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 210,
            lineHeight: 0.9,
            color: C.white,
            transform: `translateX(${interpolate(t, [0, 1], [dir * -700, 0])}px)`,
            opacity: Math.min(1, t * 3),
          }}
        >
          {top}
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 210,
            lineHeight: 0.9,
            color: C.yellow,
            textAlign: 'right',
            transform: `translateX(${interpolate(t, [0, 1], [dir * 700, 0])}px)`,
            opacity: Math.min(1, t * 3),
          }}
        >
          {bottom}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 640,
          width: 860,
          height: 610,
          borderRadius: 56,
          overflow: 'hidden',
          border: `10px solid ${C.white}`,
          boxShadow: `0 50px 110px rgba(0,0,0,.75), 26px 26px 0 ${C.red}`,
          transform: `translateX(${interpolate(p, [0, 1], [dir * 1200, 0])}px) rotate(${interpolate(p, [0, 1], [dir * 22, tilt])}deg) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: position,
            transform: `scale(${1.08 + frame * 0.004})`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 600,
          right: 70,
          fontFamily: DISPLAY,
          fontSize: 62,
          color: C.black,
          background: C.yellow,
          padding: '10px 26px 2px',
          borderRadius: 999,
          transform: `scale(${t}) rotate(8deg)`,
          boxShadow: '0 8px 0 #000',
        }}
      >
        {n}
      </div>
    </AbsoluteFill>
  );
};

const Passion = () => {
  const frame = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(5);
  const t = useIn(2);
  const card = (p: number, x: number, y: number, rot: number, src: string, dir: number) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 600,
        height: 490,
        borderRadius: 48,
        overflow: 'hidden',
        border: `10px solid ${C.white}`,
        boxShadow: '0 40px 90px rgba(0,0,0,.75)',
        transform: `translateY(${interpolate(p, [0, 1], [dir * 900, 0])}px) rotate(${interpolate(p, [0, 1], [dir * 20, rot])}deg)`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + frame * 0.003})`}}
      />
    </div>
  );
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 260,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 150,
          lineHeight: 0.92,
          color: C.white,
          transform: `scale(${interpolate(t, [0, 1], [1.6, 1])})`,
          opacity: Math.min(1, t * 3),
        }}
      >
        CUISINÉ AVEC
        <br />
        <span style={{color: C.red, fontSize: 250}}>PASSION</span>
      </div>
      {card(a, 50, 640, -7, 'classic-burger.jpg', 1)}
      {card(b, 440, 720, 6, 'poutine.jpg', -1)}
    </AbsoluteFill>
  );
};

const Proof = ({ratingAt}: {ratingAt: number}) => {
  const frame = useCurrentFrame();
  const stamp = useIn(0, {damping: 9, stiffness: 260, mass: 0.7});
  const r = useIn(ratingAt);
  const value = interpolate(frame, [ratingAt, ratingAt + 14], [0, 4.7], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 290,
          border: `12px solid ${C.yellow}`,
          borderRadius: 40,
          padding: '26px 60px 6px',
          fontFamily: DISPLAY,
          fontSize: 170,
          lineHeight: 0.95,
          color: C.yellow,
          textAlign: 'center',
          transform: `scale(${interpolate(stamp, [0, 1], [3, 1])}) rotate(-6deg)`,
          opacity: Math.min(1, stamp * 2),
          background: 'rgba(8,8,8,.6)',
        }}
      >
        HALAL
        <div style={{fontSize: 96, color: C.white, letterSpacing: 10}}>✓ CERTIFIÉ</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 740,
          width: 880,
          background: C.light,
          borderRadius: 56,
          padding: '34px 0 30px',
          textAlign: 'center',
          boxShadow: `0 40px 90px rgba(0,0,0,.7), 22px 22px 0 ${C.red}`,
          transform: `translateY(${interpolate(r, [0, 1], [900, 0])}px) rotate(${interpolate(r, [0, 1], [10, 2])}deg)`,
          opacity: frame < ratingAt ? 0 : 1,
        }}
      >
        <div style={{fontFamily: DISPLAY, fontSize: 300, lineHeight: 0.9, color: C.black}}>
          {value.toFixed(1).replace('.', ',')}
        </div>
        <div style={{fontSize: 96, letterSpacing: 10, lineHeight: 1.1}}>
          {[0, 1, 2, 3, 4].map((i) => {
            const s = spring({frame: frame - ratingAt - 6 - i * 3, fps: 30, config: {damping: 9, stiffness: 300}});
            return (
              <span key={i} style={{display: 'inline-block', color: '#F5A800', transform: `scale(${s})`}}>
                ★
              </span>
            );
          })}
        </div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.black, marginTop: 6}}>
          Google · 2K+ avis
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro = ({ctaAt}: {ctaAt: number}) => {
  const frame = useCurrentFrame();
  const logo = useIn(0, {damping: 12, stiffness: 200, mass: 0.7});
  const loc = useIn(8);
  const cta = useIn(ctaAt, {damping: 9, stiffness: 240, mass: 0.7});
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.06, 1.02, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Img
        src={staticFile('logo.png')}
        style={{
          position: 'absolute',
          top: 230,
          width: 520,
          borderRadius: 44,
          transform: `scale(${logo}) rotate(-3deg)`,
          boxShadow: `0 0 120px ${C.red}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 800,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 104,
          lineHeight: 0.95,
          color: C.white,
          opacity: loc,
          transform: `translateY(${interpolate(loc, [0, 1], [60, 0])}px)`,
        }}
      >
        <span style={{color: C.yellow}}>📍</span> PLATEAU-MONT-ROYAL
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 40, letterSpacing: 6, marginTop: 14, opacity: 0.85}}>
          MONTRÉAL · @SNATCHRESTAURANT
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1050,
          fontFamily: DISPLAY,
          fontSize: 120,
          lineHeight: 1,
          color: C.white,
          background: C.red,
          padding: '30px 60px 18px',
          borderRadius: 999,
          boxShadow: '0 14px 0 #000, 0 0 90px rgba(232,0,29,.8)',
          transform: `scale(${cta * beat}) rotate(-2deg)`,
          opacity: frame < ctaAt ? 0 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        COMMANDE →
      </div>
    </AbsoluteFill>
  );
};

/** White flash + zoom punch on every cut. */
const useCut = (cuts: number[]) => {
  const frame = useCurrentFrame();
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  return {
    flash: interpolate(since, [0, 5], [0.55, 0], clamp),
    zoom: interpolate(since, [0, 7], [1.07, 1], clamp),
  };
};

export const Reel = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const cuts = scenes.slice(1).map((s) => s.from);
  const {flash, zoom} = useCut(cuts);
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const wordFrame = (prefix: string, sceneId: string) => {
    const s = scene(sceneId);
    const w = words.find((x) => x.text.toLowerCase().startsWith(prefix) && x.start * fps >= s.from - 4);
    return w ? Math.max(0, Math.round(w.start * fps) - s.from - 2) : 10;
  };
  const tickers: Record<string, string> = {
    hook: 'SNATCH',
    brand: 'SNATCH',
    tacos: 'TACOS',
    burger: 'SMASH',
    riz: 'CROUSTY',
    passion: 'PASSION',
    proof: 'HALAL',
    outro: 'SNATCH',
  };
  const current = scenes.find((s) => frame >= s.from && frame < s.to) ?? scenes[0];

  const content: Record<string, React.ReactNode> = {
    hook: <Hook />,
    brand: <Brand />,
    tacos: <Food src="tacos.jpg" top="TACOS" bottom="FRANÇAIS" n="01" tilt={-4} dir={1} />,
    burger: <Food src="smash-burger.jpg" top="SMASH" bottom="BURGERS" n="02" tilt={4} dir={-1} />,
    riz: <Food src="riz-crousty.jpg" top="RIZ" bottom="CROUSTY" n="03" tilt={-3} dir={1} />,
    passion: <Passion />,
    proof: <Proof ratingAt={wordFrame('noté', 'proof')} />,
    outro: <Outro ctaAt={wordFrame('commande', 'outro')} />,
  };

  return (
    <AbsoluteFill style={{background: C.black}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Background ticker={tickers[current.id]} />
        {scenes.map((s) => (
          <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
            {content[s.id]}
          </Sequence>
        ))}
      </AbsoluteFill>
      <Captions words={words} />
      <AbsoluteFill style={{background: C.white, opacity: flash}} />
      <Grain />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 10,
          width: `${(frame / durationInFrames) * 100}%`,
          background: C.yellow,
        }}
      />
      {audio ? <Audio src={staticFile('snatch-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
