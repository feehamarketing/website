import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, DISPLAY} from './theme';

type Word = {text: string; start: number; end: number};

// Groups words into short caption lines, breaking on punctuation.
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    const l = w.text.length;
    if (cur.length && (cur.length >= 3 || len + l > 17)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += l + 1;
    if (/[?!.,]$/.test(w.text)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions = ({words}: {words: Word[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = chunk(words);
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    const until = next ? next[0].start : c[c.length - 1].end + 0.5;
    return t >= c[0].start - 0.04 && t < until;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const since = frame - Math.round((c[0].start - 0.04) * fps);
  const pop = spring({frame: since, fps, config: {damping: 13, stiffness: 240, mass: 0.6}});

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 1290,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0 22px',
        transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])}) rotate(-2deg)`,
        opacity: Math.min(1, pop * 2),
      }}
    >
      {c.map((w, i) => {
        const active = t >= w.start && t < (c[i + 1]?.start ?? w.end + 0.5);
        const done = t >= w.start;
        const wp = spring({
          frame: frame - Math.round(w.start * fps),
          fps,
          config: {damping: 10, stiffness: 300, mass: 0.5},
        });
        return (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: 118,
              lineHeight: 1.02,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: active ? C.black : C.white,
              background: active ? C.yellow : 'transparent',
              padding: '4px 18px 0',
              borderRadius: 14,
              opacity: done ? 1 : 0.55,
              transform: `scale(${active ? interpolate(wp, [0, 1], [0.86, 1.06]) : 1}) rotate(${active ? 2 : 0}deg)`,
              textShadow: active ? 'none' : '0 6px 0 #000, 0 0 28px rgba(0,0,0,.9)',
              WebkitTextStroke: active ? '0' : '3px #000',
              paintOrder: 'stroke fill',
              boxShadow: active ? '0 10px 0 #000' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
