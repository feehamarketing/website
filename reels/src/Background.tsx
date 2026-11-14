import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BEAT, C, DISPLAY} from './theme';

export const Background = ({ticker}: {ticker: string}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % BEAT, [0, 3, BEAT], [1, 0.55, 0.4]);
  const drift = frame * 0.6;
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 1300,
          left: -350 + Math.sin(frame / 40) * 90,
          top: 180 + Math.cos(frame / 55) * 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.red} 0%, transparent 62%)`,
          opacity: 0.34 + pulse * 0.2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          right: -420 + Math.cos(frame / 47) * 80,
          top: 900 + Math.sin(frame / 38) * 110,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.yellow} 0%, transparent 60%)`,
          opacity: 0.16 + pulse * 0.12,
        }}
      />
      {/* diagonal speed lines */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,.035) 0 3px, transparent 3px 90px)',
          backgroundPosition: `${drift * 3}px 0`,
        }}
      />
      {/* giant outlined ticker */}
      {[0, 1].map((row) => (
        <div
          key={row}
          style={{
            position: 'absolute',
            top: row === 0 ? 150 : 1560,
            left: 0,
            whiteSpace: 'nowrap',
            fontFamily: DISPLAY,
            fontSize: 250,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,.11)',
            transform: `translateX(${row === 0 ? -drift * 5 : -1400 + drift * 5}px)`,
          }}
        >
          {`${ticker} · `.repeat(8)}
        </div>
      ))}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.72) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// Film grain on top of everything.
export const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.1, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};
