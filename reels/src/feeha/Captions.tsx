import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, wide} from './theme';

export type Word = {text: string; start: number; end: number};

// Short caption lines (max 3 words / 18 chars), broken on punctuation.
export const chunkWords = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    if (cur.length && (cur.length >= 3 || len + w.text.length > 18)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.text.length + 1;
    if (/[?!.,:]$/.test(w.text)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions = ({
  words,
  hidden,
  top,
  accent = F.coral,
  edge = F.red,
  font = wide,
}: {
  words: Word[];
  hidden: (frame: number) => boolean;
  top: number;
  accent?: string; // background of the word being spoken
  edge?: string; // its hard shadow
  font?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (hidden(frame)) return null;
  const t = frame / fps;
  const chunks = chunkWords(words);
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    const until = next ? next[0].start : c[c.length - 1].end + 0.4;
    return t >= c[0].start - 0.04 && t < until;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const since = frame - Math.round((c[0].start - 0.04) * fps);
  const pop = spring({frame: since, fps, config: {damping: 14, stiffness: 260, mass: 0.6}});

  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '6px 14px',
        transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px)`,
        opacity: Math.min(1, pop * 2),
      }}
    >
      {c.map((w, i) => {
        const active = t >= w.start && t < (c[i + 1]?.start ?? w.end + 0.4);
        const wp = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 11, stiffness: 320, mass: 0.5}});
        return (
          <span
            key={i}
            style={{
              ...font,
              fontSize: 66,
              lineHeight: 1.15,
              textTransform: 'uppercase',
              color: active ? F.white : t >= w.start ? F.white : 'rgba(255,255,255,.45)',
              background: active ? accent : 'transparent',
              padding: '2px 16px 0',
              borderRadius: 12,
              transform: `scale(${active ? interpolate(wp, [0, 1], [0.85, 1.05]) : 1})`,
              textShadow: active ? 'none' : '0 4px 18px rgba(0,0,0,.9)',
              boxShadow: active ? `0 8px 0 ${edge}` : 'none',
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
