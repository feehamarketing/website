import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import tl from './timeline.json';

// « Le test des 3 secondes » — interactive Reel (≈ 37 s). Picture: Lemo clip public/t3s/street.mp4 (source scripts/t3s/lemo-street),
// the passenger-window drive past four invented restaurants A–D. Remotion: timer, freeze, quiz, verdicts, transitions, captions, card.
// Every change of subject is carried by a motivated move (freeze → rewind → dolly stops → whip back → split → push into the panel).
const FPS = 30;
const V = tl.lines as Record<string, number>;
const D = tl.lineDur as Record<string, number>;
const [P0, P1] = tl.pass as number[];
const CARD = tl.card as number;
export const T3S_FRAMES = Math.round(tl.dur * FPS);
const RED = '#E11D2E', INK = '#0B0A0D';
const ANTON = '"Anton", sans-serif';
const MONT = '"Montserrat", sans-serif';
const RW = V.v04 + 1.2; // rewind starts (picture unfreezes)
const fr = (s: number) => Math.round(s * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const useT = () => useCurrentFrame() / FPS;
const pop = (f: number, at: number) => spring({frame: f - fr(at), fps: FPS, config: {damping: 11, stiffness: 200, mass: 0.6}});

const Pill = ({text, at, top = 190, bg = RED, color = '#fff', out = 99}: {text: string; at: number; top?: number; bg?: string; color?: string; out?: number}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at || t >= out) return null;
  const p = pop(f, at);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 3, color, background: bg, padding: '14px 30px', borderRadius: 999, transform: `scale(${lin(p, 0, 1, 0.6, 1)})`, opacity: clamp(p * 2), boxShadow: '0 12px 30px rgba(0,0,0,.4)'}}>{text}</div>
    </div>
  );
};
const Big = ({text, at, out, top, size = 180, color = '#fff', bg, hi}: {text: string; at: number; out: number; top: number; size?: number; color?: string; bg?: string; hi?: string}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at || t >= out) return null;
  const p = pop(f, at), o = clamp((out - t) / 0.2);
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, textAlign: 'center', opacity: clamp(p * 2) * o}}>
      <span style={{display: 'inline-block', fontFamily: ANTON, fontSize: size, lineHeight: 1.02, color, background: bg, padding: bg ? '8px 36px 0' : 0, borderRadius: 18, textShadow: bg ? 'none' : '0 10px 40px rgba(0,0,0,.7)', transform: `scale(${lin(p, 0, 1, 1.5, 1)})`}}>
        {hi ? text.split(hi).map((part, i, arr) => <React.Fragment key={i}>{part}{i < arr.length - 1 ? <span style={{color: RED}}>{hi}</span> : null}</React.Fragment>) : text}
      </span>
    </div>
  );
};
// the countdown ring
const Timer = ({from, to, top = 300, size = 260}: {from: number; to: number; top?: number; size?: number}) => {
  const t = useT();
  if (t < from - 0.2 || t >= to + 0.35) return null;
  const k = clamp((t - from) / (to - from));
  const n = Math.max(0, Math.ceil(3 - k * 3 - 1e-6));
  const r = size / 2 - 14, c = 2 * Math.PI * r;
  const o = clamp((t - from + 0.2) / 0.2) * clamp((to + 0.35 - t) / 0.25);
  return (
    <div style={{position: 'absolute', top, left: 540 - size / 2, width: size, height: size, opacity: o}}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(0,0,0,.55)" stroke="rgba(255,255,255,.2)" strokeWidth={14} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={n <= 1 ? RED : '#fff'} strokeWidth={14} strokeDasharray={c} strokeDashoffset={c * k} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: size * 0.55, color: '#fff'}}>{n}</div>
    </div>
  );
};
// the street (Lemo), frozen between the end of the pass and the rewind; pushes are done here, never big blurry zooms
const Street = () => {
  const t = useT();
  const frozen = t >= P1 && t < RW;
  // punch into A's poster for the twist, then push into D's panel to reach the card
  const twist = ease(clamp((t - (V.v09 + 1.0)) / 0.6)) * (1 - ease(clamp((t - (V.v10 - 0.3)) / 0.4)));
  const toCard = ease(clamp((t - (CARD - 0.7)) / 0.7));
  const scale = 1 + 0.55 * twist + 2.2 * toCard + (frozen ? 0.04 * clamp((t - P1) / 3) : 0);
  const origin = toCard > 0 ? '50% 76%' : '51% 54%';
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: origin}}>
      {frozen ? (
        <Freeze frame={fr(P1)}><OffthreadVideo src={staticFile('t3s/street.mp4')} muted style={{width: 1080, height: 1920, filter: 'saturate(.85)'}} /></Freeze>
      ) : (
        <OffthreadVideo src={staticFile('t3s/street.mp4')} muted style={{width: 1080, height: 1920}} />
      )}
    </AbsoluteFill>
  );
};
const Choices = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < V.v03 || t >= RW) return null;
  return (
    <div style={{position: 'absolute', top: 760, left: 90, right: 90, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26}}>
      {['A', 'B', 'C', 'D'].map((l, i) => {
        const p = pop(f, V.v03 + i * 0.22);
        const out = clamp((RW - t) / 0.3);
        return (
          <div key={l} style={{height: 170, borderRadius: 26, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 120, color: INK, transform: `scale(${lin(p, 0, 1, 0.5, 1)})`, opacity: clamp(p * 2) * out, boxShadow: '0 16px 40px rgba(0,0,0,.45)'}}>{l}</div>
        );
      })}
    </div>
  );
};
const Verdict = ({letter, text, ok, at, out}: {letter: string; text: string; ok: boolean; at: number; out: number}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at || t >= out) return null;
  const p = pop(f, at), o = clamp((out - t) / 0.25);
  return (
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: clamp(p * 2) * o, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{width: 120, height: 120, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ANTON, fontSize: 84, color: INK}}>{letter}</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, color: '#fff', background: ok ? '#1E9E5A' : RED, padding: '16px 30px', borderRadius: 18}}>{ok ? '✓ ' : '✗ '}{text}</div>
    </div>
  );
};
const Rewind = () => {
  const t = useT();
  const k = t - RW;
  if (k < 0 || k > 0.9) return null;
  const a = Math.sin(Math.PI * clamp(k / 0.9));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: (i * 331 + k * 4800) % 1920, height: 24 + (i % 3) * 16, background: 'rgba(255,255,255,.35)', opacity: a}} />)}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,0,60,.18), rgba(0,200,255,.18))', opacity: a, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 140, color: '#fff', opacity: a}}>◀◀</div>
    </AbsoluteFill>
  );
};
const Card = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const p = pop(f, CARD), p2 = pop(f, V.v12), p3 = pop(f, V.v12 + 0.6);
  return (
    <AbsoluteFill style={{background: RED, opacity: clamp((t - CARD + 0.15) / 0.25)}}>
      <div style={{position: 'absolute', top: 300, left: 50, right: 50, textAlign: 'center', fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: '#fff', transform: `scale(${lin(p, 0, 1, 1.3, 1)})`, opacity: p}}>
        TA VITRINE,<br />ON LA LIT<br />EN <span style={{color: INK}}>3 SECONDES</span> ?
      </div>
      <div style={{position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center', opacity: p2, transform: `translateY(${(1 - p2) * 30}px)`}}>
        <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 38, color: RED, background: '#fff', padding: '14px 28px', borderRadius: 999, whiteSpace: 'nowrap'}}>TU AVAIS TROUVÉ ? DIS-LE EN COMMENTAIRE</span>
      </div>
      <div style={{position: 'absolute', top: 1110, left: 290, right: 290, background: '#fff', borderRadius: 26, padding: '22px 20px', display: 'flex', justifyContent: 'center', opacity: p3, transform: `scale(${lin(p3, 0, 1, 0.8, 1)})`}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 420}} />
      </div>
      <div style={{position: 'absolute', top: 1390, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 70, color: '#fff', opacity: p3}}>FEEHAPANELS.COM</div>
    </AbsoluteFill>
  );
};
// captions: word by word, on the car door (black), inside the safe zone
type Wd = {text: string; start: number; end: number; line: string};
const WORDS = tl.words as Wd[];
const CHUNKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (cur.length >= 3 || /[.,?!…:]$/.test(w.text) || !nx || nx.line !== w.line) { out.push(cur); cur = []; }
  });
  return out;
})();
const Captions = () => {
  const t = useT();
  if (t >= V.v10 - 0.2 || (t >= V.v02 && t < V.v04)) return null; // the question has its own big type
  const c = CHUNKS.find((ch, i) => t >= ch[0].start - 0.05 && t < Math.min((CHUNKS[i + 1]?.[0].start ?? 999) - 0.03, ch[ch.length - 1].end + 0.5));
  if (!c) return null;
  return (
    <div style={{position: 'absolute', top: 1555, left: 60, right: 170, textAlign: 'center'}}>
      {c.map((w, i) => {
        const on = t >= w.start, now = on && t < w.end + 0.08;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 9px', padding: now ? '2px 14px 0' : '2px 0 0', borderRadius: 12, background: now ? RED : 'transparent', fontFamily: MONT, fontWeight: 900, fontSize: 60, color: on ? '#fff' : 'rgba(255,255,255,.4)'}}>{w.text.replace(/[.,…]$/, '').toUpperCase()}</span>
        );
      })}
    </div>
  );
};

export const FeehaTest3s = ({audio}: {audio: boolean}) => {
  const t = useT();
  const freezeFlash = t >= P1 && t < P1 + 0.25 ? 1 - (t - P1) / 0.25 : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < CARD ? <Street /> : null}
      {/* hook + the 3 seconds */}
      <Big text="TU AS 3 SECONDES." hi="3" at={V.v01} out={P0 + 0.2} top={300} size={150} />
      <Timer from={P0} to={P1} />
      <Big text="STOP." at={P1} out={V.v02 + 0.9} top={330} size={260} color={INK} bg="#fff" />
      {/* the question */}
      <Big text="LEQUEL VENDAIT DES TACOS ?" hi="TACOS" at={V.v02 + 0.9} out={RW} top={260} size={120} />
      <Choices />
      <Timer from={V.v03 + D.v03 + 0.1} to={V.v03 + D.v03 + 2.6} top={1180} size={200} />
      <Pill text="RÉPONDS EN COMMENTAIRE" at={V.v03 + D.v03 + 0.1} top={1420} bg="#fff" color={RED} out={RW} />
      {/* replay */}
      <Pill text="ON REMBOBINE" at={RW - 0.6} top={190} out={RW + 0.9} />
      <Verdict letter="A" text="INVISIBLE" ok={false} at={V.v05 + 0.2} out={V.v06 - 0.2} />
      <Verdict letter="B" text="ILLISIBLE" ok={false} at={V.v06 + 0.2} out={V.v07 - 0.2} />
      <Verdict letter="C" text="AUCUNE OFFRE" ok={false} at={V.v07 + 0.2} out={V.v08 - 0.2} />
      <Verdict letter="D" text="LU EN 3 S" ok at={V.v08 + 0.3} out={V.v09 - 0.1} />
      {/* the twist and the comparison */}
      <Pill text="SURPRISE : A AUSSI" at={V.v09 + 1.0} top={190} out={V.v10 - 0.25} />
      <Pill text="A · TACOS · INVISIBLE" at={V.v10 + 0.4} top={120} bg="rgba(0,0,0,.7)" out={CARD - 0.5} />
      <Pill text="D · TACOS · VU" at={V.v10 + 1.0} top={1040} bg="#1E9E5A" out={CARD - 0.5} />
      <Rewind />
      {t >= CARD - 0.15 ? <Card /> : null}
      <Captions />
      <AbsoluteFill style={{background: '#fff', opacity: freezeFlash * 0.85, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(t / tl.dur) * 100}%`, background: RED}} />
      {audio ? <Audio src={staticFile('t3s-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
