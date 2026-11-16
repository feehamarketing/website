import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../feeha/Captions';
import {
  BEAT,
  Background,
  FONT,
  Grain,
  Label,
  Logo,
  M,
  PhoneIcon,
  Slam,
  Snow,
  Stamp,
  Van,
  chrome,
  clamp,
  heavy,
  useSpring,
} from '../ma/MA';
import timeline from './timeline.json';

const RED = '#FF3B3B';

// ---- the quarter test --------------------------------------------------------
/** A generic silver 25-cent coin with a stylised caribou head (nose at the bottom). */
const Coin = ({size, style}: {size: number; style?: React.CSSProperties}) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={style}>
    <defs>
      <radialGradient id="silver" cx="-30" cy="-40" r="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.45" stopColor="#C9CED4" />
        <stop offset="1" stopColor="#7E868F" />
      </radialGradient>
    </defs>
    <circle r="98" fill="#6E757D" />
    {Array.from({length: 90}).map((_, i) => (
      <rect key={i} x="-1" y="-99" width="2" height="6" fill="#9AA1A9" transform={`rotate(${i * 4})`} />
    ))}
    <circle r="91" fill="url(#silver)" />
    <circle r="82" fill="none" stroke="#9AA1A9" strokeWidth="1.5" />
    {/* caribou head pointing down: antlers on top, nose at the bottom */}
    <g fill="#8C939B" stroke="#6E757D" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M-12 -18 L-6 -30 L0 -24 L6 -30 L12 -18 L14 10 Q10 38 4 52 Q0 58 -4 52 Q-10 38 -14 10Z" />
      <path d="M-8 -26 L-22 -56 L-36 -62 M-22 -56 L-20 -74 M-28 -60 L-44 -48" fill="none" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 -26 L22 -56 L36 -62 M22 -56 L20 -74 M28 -60 L44 -48" fill="none" strokeWidth="4" strokeLinecap="round" />
      <path d="M-12 -14 L-26 -18 L-16 -6Z M12 -14 L26 -18 L16 -6Z" />
    </g>
    <circle cx="0" cy="53" r="4" fill="#4A5058" />
    <text x="0" y="-80" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="14" fill="#7E868F">
      25 ¢
    </text>
  </svg>
);

const Coin1 = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0, {damping: 12, stiffness: 160, mass: 0.8});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 200}}>
        <Label>LE TEST DU 25 CENNES</Label>
      </div>
      <div style={{position: 'absolute', top: 330, transform: `perspective(1400px) rotateY(${interpolate(p, [0, 1], [540, 0])}deg) scale(${interpolate(p, [0, 1], [0.3, 1])})`}}>
        <Coin size={560} style={{filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.7)) drop-shadow(0 0 80px rgba(31,123,255,.35))'}} />
      </div>
      <div style={{position: 'absolute', top: 980}}>
        <Slam delay={6} size={92} style={chrome}>
          PRENDS UN 25¢
        </Slam>
      </div>
      <div style={{position: 'absolute', top: 1110, ...heavy, fontSize: 40, color: M.ice, opacity: interpolate(frame, [14, 24], [0, 1], clamp)}}>
        3 secondes. Zéro outil.
      </div>
    </AbsoluteFill>
  );
};

/** Tyre tread seen from above, with the slot the coin goes into. */
const Tread = ({top}: {top: number}) => (
  <div style={{position: 'absolute', left: -40, right: -40, top, height: 900}}>
    <svg width="1160" height="900" viewBox="0 0 1160 900">
      <defs>
        <linearGradient id="rub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2e33" />
          <stop offset="0.12" stopColor="#1b1d21" />
          <stop offset="1" stopColor="#0b0c0e" />
        </linearGradient>
      </defs>
      <rect width="1160" height="900" fill="#08090b" />
      {Array.from({length: 6}).map((_, i) => (
        <g key={i} transform={`translate(${i * 200 - 20} 0)`}>
          <path d="M10 0 L180 0 L170 900 L20 900Z" fill="url(#rub)" />
          {[120, 300, 480, 660].map((y) => (
            <path key={y} d={`M30 ${y} L160 ${y - 30}`} stroke="#050506" strokeWidth="6" />
          ))}
        </g>
      ))}
    </svg>
  </div>
);

const TREAD_TOP = 1080; // top edge of the rubber in the insert/verdict scenes

const InsertedCoin = ({y, scale = 1}: {y: number; scale?: number}) => (
  <div style={{position: 'absolute', left: 540 - 230, top: y, transform: `scale(${scale})`, transformOrigin: '50% 80%'}}>
    <Coin size={460} />
  </div>
);

const Insert = () => {
  const p = useSpring(0, {damping: 16, stiffness: 110, mass: 1});
  const y = interpolate(p, [0, 1], [260, 700]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 200}}>
        <Label color={M.white}>TÊTE DU CARIBOU VERS LE BAS</Label>
      </div>
      <InsertedCoin y={y} />
      {/* the rubber in front of the coin */}
      <Tread top={TREAD_TOP} />
      <div style={{position: 'absolute', top: 300, ...heavy, fontSize: 70, ...chrome}}>DANS LA SEMELLE</div>
      <svg width="120" height="160" viewBox="0 0 120 160" style={{position: 'absolute', top: 430, opacity: 1 - p}}>
        <path d="M60 0 V130 M20 95 L60 140 L100 95" stroke={M.blue} strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const Verdict = ({wornAt}: {wornAt: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = spring({frame, fps, config: {damping: 18, stiffness: 90}});
  const ring = spring({frame: frame - 6, fps, config: {damping: 10, stiffness: 200}});
  const worn = frame >= wornAt;
  const shake = worn && frame - wornAt < 10 ? Math.sin((frame - wornAt) * 3) * (10 - (frame - wornAt)) * 1.5 : 0;
  // nose of the coin: 53/100 of the radius below its centre
  const s = interpolate(zoom, [0, 1], [1, 1.35]);
  return (
    <AbsoluteFill style={{alignItems: 'center', transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '540px 1040px'}}>
        <InsertedCoin y={700} />
        <Tread top={TREAD_TOP} />
        {/* magnifier on the nose */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 70,
            top: 700 + 230 + 0.53 * 230 * (460 / 460) - 70,
            width: 140,
            height: 140,
            borderRadius: 70,
            border: `8px solid ${worn ? RED : M.blue}`,
            boxShadow: `0 0 40px ${worn ? RED : M.blue}`,
            transform: `scale(${ring})`,
          }}
        />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 260}}>
        <Slam delay={2} size={78} style={chrome}>
          TU VOIS SON NEZ ?
        </Slam>
      </div>
      {worn ? (
        <>
          <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,59,59,.35) 100%)`}} />
          <div style={{position: 'absolute', top: 430}}>
            <Stamp delay={wornAt} color={RED} rotate={-6} size={110}>
              PNEUS USÉS
            </Stamp>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- the fix -----------------------------------------------------------------
const Brand = () => {
  const frame = useCurrentFrame();
  const p = useSpring(8, {damping: 13, stiffness: 160, mass: 0.8});
  const shine = interpolate(frame, [16, 44], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 330}}>
        <Slam delay={0} size={90} style={chrome}>
          PAS DE PANIQUE.
        </Slam>
      </div>
      <div style={{position: 'absolute', top: 470, width: 1200, left: -60, height: 600, background: 'radial-gradient(ellipse, rgba(31,123,255,.55) 0%, transparent 60%)', opacity: p}} />
      <div style={{position: 'absolute', top: 560, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, filter: `blur(${(1 - p) * 16}px)`, opacity: p}}>
        <Logo width={960} shine={shine} />
      </div>
    </AbsoluteFill>
  );
};

const Tires = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0, {damping: 15, stiffness: 140, mass: 0.8});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Snow density={0.5} />
      <div style={{position: 'absolute', top: 230}}>
        <Label>PNEUS D'HIVER</Label>
      </div>
      <div style={{position: 'absolute', top: 300}}>
        <Slam delay={0} size={104} style={chrome}>
          QUALITÉ
        </Slam>
      </div>
      <Img
        src={staticFile('ma/tires-lineup.png')}
        style={{
          position: 'absolute',
          top: 520,
          left: 540 - 520,
          width: 1040,
          transform: `translateX(${interpolate(p, [0, 1], [1100, 0])}px) scale(${1 + frame * 0.0015})`,
          filter: 'drop-shadow(0 40px 50px rgba(0,0,0,.8)) drop-shadow(0 0 60px rgba(31,123,255,.3))',
        }}
      />
      <div style={{position: 'absolute', top: 1150}}>
        <Stamp delay={10} rotate={-5} size={104}>
          ✓ GARANTIS
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Parts = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 16], [0, 100], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 260}}>
        <Slam delay={0} size={110} from={1} style={chrome}>
          + PIÈCES AUTO
        </Slam>
      </div>
      <div style={{position: 'absolute', top: 410}}>
        <Label color={M.white} delay={4}>
          POUR TON CHAR
        </Label>
      </div>
      <Img
        src={staticFile('ma/parts.png')}
        style={{
          position: 'absolute',
          top: 600,
          left: 540 - 530,
          width: 1060,
          clipPath: `inset(0 ${100 - wipe}% 0 0)`,
          transform: `scale(${1 + frame * 0.0012})`,
          filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.8))',
        }}
      />
    </AbsoluteFill>
  );
};

const Install = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number) => spring({frame: frame - d, fps, config: {damping: 10, stiffness: 240, mass: 0.6}});
  const op = (d: number, children: React.ReactNode) => (
    <div style={{...heavy, fontSize: 120, color: M.blue, transform: `scale(${pop(d)})`}}>{children}</div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 210, display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{transform: `scale(${pop(0)})`, textAlign: 'center'}}>
          <Img src={staticFile('ma/tires-lineup.png')} style={{width: 420}} />
          <div style={{...heavy, fontSize: 48, color: M.white}}>PNEUS</div>
        </div>
        {op(5, '+')}
        <div style={{transform: `scale(${pop(9)}) rotate(${(1 - pop(9)) * -180}deg)`, textAlign: 'center'}}>
          <Img src={staticFile('ma/rim.png')} style={{width: 300}} />
          <div style={{...heavy, fontSize: 48, color: M.white}}>JANTES</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 700}}>{op(14, '=')}</div>
      <div style={{position: 'absolute', top: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Slam delay={18} size={104} style={chrome}>
          INSTALLATION
        </Slam>
        <Stamp delay={24} rotate={-4} size={118}>
          GRATUITE
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Delivery = () => {
  const drive = useSpring(0, {damping: 18, stiffness: 120, mass: 1});
  const x = interpolate(drive, [0, 1], [-800, 220]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Van x={x} />
      <div style={{position: 'absolute', top: 920, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Slam delay={0} size={140} from={1} style={chrome}>
          LIVRAISON
        </Slam>
        <Stamp delay={5} rotate={4} size={118}>
          GRATUITE
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Call = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0, {damping: 13, stiffness: 150, mass: 0.8});
  const shine = interpolate(frame, [10, 40], [0, 1], clamp);
  const ring = frame % 30 < 12 ? Math.sin(frame * 2.2) * 10 : 0;
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 250, transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`, opacity: p}}>
        <Logo width={860} shine={shine} />
      </div>
      <div style={{position: 'absolute', top: 780, display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${useSpring(6) * beat})`}}>
        <div style={{transform: `rotate(${ring}deg)`}}>
          <PhoneIcon size={130} />
        </div>
        <div style={{...heavy, fontSize: 92, ...chrome}}>438-368-6865</div>
      </div>
      <div style={{position: 'absolute', top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        {['INSTALLATION GRATUITE*', 'LIVRAISON GRATUITE'].map((t, i) => {
          const q = useSpring(14 + i * 6, {damping: 10, stiffness: 240, mass: 0.6});
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
      <div style={{position: 'absolute', top: 1220, fontFamily: FONT, fontWeight: 500, fontSize: 30, color: M.grey, opacity: interpolate(frame, [22, 32], [0, 1], clamp)}}>
        *À l'achat de pneus et jantes
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ---------------------------------------------------------------
export const MA2 = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.45, 0], clamp);
  const zoom = interpolate(since, [0, 8], [1.06, 1], clamp);
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const verdict = scene('verdict');
  const worn = words.find((w) => w.text.toLowerCase().startsWith('usés'));
  const wornAt = worn ? Math.max(0, Math.round(worn.start * fps) - verdict.from - 2) : 40;
  const SCENES: Record<string, React.ReactNode> = {
    coin: <Coin1 />,
    insert: <Insert />,
    verdict: <Verdict wornAt={wornAt} />,
    brand: <Brand />,
    tires: <Tires />,
    parts: <Parts />,
    install: <Install />,
    delivery: <Delivery />,
    call: <Call />,
  };
  return (
    <AbsoluteFill style={{background: M.black}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Background />
        {scenes.map((s) => (
          <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
            {SCENES[s.id]}
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* Instagram covers the bottom ~20%: captions sit above it */}
      <Captions words={words} top={1400} accent={M.blue} edge={M.deep} font={heavy} hidden={(f) => f >= scene('call').from} />
      <AbsoluteFill style={{background: '#dfeeff', opacity: flash, pointerEvents: 'none'}} />
      <Grain />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: M.blue}} />
      {audio ? <Audio src={staticFile('ma2-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
