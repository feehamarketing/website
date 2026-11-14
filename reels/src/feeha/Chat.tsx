import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// A phone messaging screen in the familiar iOS style (light mode), drawn in
// CSS: no Apple artwork is used. Message timing comes from the config, as a
// share of the hook's length, so the sound effects can use the same times.

export type ChatMessage =
  | {type: 'time'; day: string; text: string; at: number}
  | {type: 'sent' | 'received'; text: string; at: number}
  | {type: 'typing'; at: number; until: number};

const UI = {
  bg: '#FFFFFF',
  bar: '#F6F6F6',
  hair: '#D8D8DC',
  blue: '#1A8CFF',
  grey: '#E9E9EB',
  label: '#8E8E93',
  text: '#000000',
};
const FONT = '"Inter", -apple-system, sans-serif';
const S = 2.77; // iOS points -> pixels at 1080 px wide

const StatusBar = () => (
  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 140, fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 120, top: 52, fontSize: 46, fontWeight: 600, letterSpacing: -0.5}}>9:41</div>
    <svg style={{position: 'absolute', right: 120, top: 58}} width="220" height="40" viewBox="0 0 220 40">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 16} y={28 - i * 8} width="11" height={10 + i * 8} rx="3" fill="#000" />
      ))}
      <path d="M92 14 a30 30 0 0 1 42 0 l-5 5 a23 23 0 0 0 -32 0z M100 22 a18 18 0 0 1 26 0 l-5 5 a11 11 0 0 0 -16 0z M108 30 l5 -5 l5 5 l-5 5z" fill="#000" />
      <rect x="150" y="6" width="56" height="28" rx="8" fill="none" stroke="#000" strokeOpacity=".4" strokeWidth="3" />
      <rect x="155" y="11" width="40" height="18" rx="4" fill="#000" />
      <rect x="209" y="15" width="4" height="10" rx="2" fill="#000" fillOpacity=".4" />
    </svg>
  </div>
);

const NavBar = ({contact}: {contact: string}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 440,
      background: UI.bar,
      borderBottom: `2px solid ${UI.hair}`,
      fontFamily: FONT,
    }}
  >
    <StatusBar />
    <svg style={{position: 'absolute', left: 44, top: 200}} width="40" height="64" viewBox="0 0 40 64">
      <path d="M34 4 L8 32 L34 60" stroke={UI.blue} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        position: 'absolute',
        left: 94,
        top: 206,
        minWidth: 60,
        height: 56,
        borderRadius: 28,
        background: UI.blue,
        color: '#fff',
        fontSize: 36,
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: '56px',
        padding: '0 14px',
      }}
    >
      3
    </div>
    <div
      style={{
        position: 'absolute',
        left: 540 - 72,
        top: 160,
        width: 144,
        height: 144,
        borderRadius: 72,
        background: 'linear-gradient(180deg, #A5A9B3, #868A94)',
        color: '#fff',
        fontSize: 72,
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: '144px',
      }}
    >
      {contact[0]}
    </div>
    <div style={{position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', fontSize: 40, color: UI.text}}>
      {contact} <span style={{color: UI.label, fontSize: 34}}>›</span>
    </div>
    <svg style={{position: 'absolute', right: 50, top: 205}} width="100" height="60" viewBox="0 0 100 60">
      <rect x="4" y="8" width="64" height="44" rx="10" stroke={UI.blue} strokeWidth="6" fill="none" />
      <path d="M72 24 L94 10 V50 L72 36Z" stroke={UI.blue} strokeWidth="6" fill="none" strokeLinejoin="round" />
    </svg>
  </div>
);

const InputBar = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250, background: UI.bg, fontFamily: FONT}}>
    <div
      style={{
        position: 'absolute',
        left: 40,
        top: 40,
        width: 96,
        height: 96,
        borderRadius: 48,
        background: '#EDEDEF',
        color: '#7B7B80',
        fontSize: 64,
        textAlign: 'center',
        lineHeight: '92px',
        fontWeight: 300,
      }}
    >
      +
    </div>
    <div
      style={{
        position: 'absolute',
        left: 160,
        right: 40,
        top: 40,
        height: 96,
        borderRadius: 48,
        border: `3px solid ${UI.hair}`,
        color: '#C4C4C7',
        fontSize: 44,
        lineHeight: '90px',
        paddingLeft: 36,
      }}
    >
      Message
    </div>
    <div style={{position: 'absolute', left: 540 - 190, bottom: 24, width: 380, height: 14, borderRadius: 7, background: '#111'}} />
  </div>
);

const Tail = ({me, color}: {me: boolean; color: string}) => (
  <svg
    width="40"
    height="44"
    viewBox="0 0 40 44"
    style={{position: 'absolute', bottom: 0, [me ? 'right' : 'left']: -14, transform: me ? 'none' : 'scaleX(-1)'}}
  >
    <path d="M0 0 C2 22 14 36 38 42 C22 44 6 40 0 34Z" fill={color} />
  </svg>
);

export const Chat = ({messages, contact}: {messages: ChatMessage[]; contact: string}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const end = durationInFrames;
  const fAt = (share: number) => Math.round(share * end);

  // which messages are on screen now
  const shown = messages.filter((m) => frame >= fAt(m.at) && !(m.type === 'typing' && frame >= fAt(m.until)));
  const lastSent = [...messages].reverse().find((m) => m.type === 'sent' && frame >= fAt(m.at));

  // closing move: the screen shrinks away to reveal what comes next
  const out = interpolate(frame, [end - 9, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 - out * 0.22})`,
        borderRadius: out * 90,
        overflow: 'hidden',
        filter: `blur(${out * 10}px)`,
        opacity: 1 - out * 0.6,
      }}
    >
      <AbsoluteFill style={{background: UI.bg, fontFamily: FONT}}>
        <div style={{position: 'absolute', top: 470, left: 40, right: 40, display: 'flex', flexDirection: 'column', gap: 10}}>
          {shown.map((m, i) => {
            const from = fAt(m.at);
            const p = from === 0 ? 1 : spring({frame: frame - from, fps, config: {damping: 15, stiffness: 320, mass: 0.6}});
            if (m.type === 'time') {
              return (
                <div key={i} style={{textAlign: 'center', fontSize: 31, color: UI.label, margin: '22px 0 14px', opacity: p}}>
                  <b style={{fontWeight: 600}}>{m.day}</b> {m.text}
                </div>
              );
            }
            const me = m.type === 'sent';
            const next = shown[i + 1];
            const tail = !next || next.type !== m.type;
            const color = me ? UI.blue : UI.grey;
            const status = me && m === lastSent && !next ? 'Delivered' : null;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: 'relative',
                    alignSelf: me ? 'flex-end' : 'flex-start',
                    maxWidth: 290 * S,
                    background: color,
                    color: me ? '#fff' : UI.text,
                    fontSize: 19 * S,
                    lineHeight: 1.28,
                    padding: m.type === 'typing' ? '30px 40px' : `${7 * S}px ${12 * S}px`,
                    borderRadius: 18 * S,
                    transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                    transformOrigin: me ? 'bottom right' : 'bottom left',
                    opacity: Math.min(1, p * 2),
                  }}
                >
                  {m.type === 'typing' ? (
                    <div style={{display: 'flex', gap: 14}}>
                      {[0, 1, 2].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            background: '#8E8E93',
                            opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - d * 5) / 4)),
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    m.text
                  )}
                  {tail ? <Tail me={me} color={color} /> : null}
                </div>
                {status ? (
                  <div style={{alignSelf: 'flex-end', fontSize: 30, color: UI.label, fontWeight: 500, marginRight: 10}}>{status}</div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
        <NavBar contact={contact} />
        <InputBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
