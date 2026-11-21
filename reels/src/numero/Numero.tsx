import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, Bubble, COND, LOOKS, Person, SANS, clampI} from '../anim/Art';
import {Sandwich} from '../vitrine/Vitrine';
import timeline from './timeline.json';

// "Le Numéro 7" : same dish, same menu; only the description line changes.
// Drawn illustration. A cut every few seconds, nothing held longer than ~4 s.
const POP = {damping: 9, stiffness: 240, mass: 0.6};
const sp = (f: number, d: number, cfg = {damping: 12, stiffness: 170}) => spring({frame: f - d, fps: 30, config: cfg});
const DESC = 'Poulet croustillant, salade, sauce maison';
const CREAM = '#F6EFE4';
const GOLD = '#C9A46A';
const GREEN = '#1F3B2D';

type W = {text: string; start: number; end: number};
const words = (timeline as {words: W[]}).words;
const wf = (w: string, after = 0, fps = 30) => {
  const hit = words.find((x) => x.text.toLowerCase().startsWith(w.toLowerCase()) && x.start * fps >= after);
  return hit ? Math.round(hit.start * fps) : after;
};

const Board = ({x, y, w, desc, hl = 0, title = 'LE NUMÉRO 7'}: {x: number; y: number; w: number; desc: string | null; hl?: number; title?: string}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.15, background: GREEN, borderRadius: 26, padding: '48px 40px', boxSizing: 'border-box', border: `12px solid ${GOLD}`, boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
    <div style={{fontFamily: COND, fontSize: Math.round(w * 0.135), lineHeight: 1, color: CREAM, textAlign: 'center'}}>{title}</div>
    <div style={{height: 5, background: GOLD, margin: '24px 0 30px'}} />
    {desc === null ? (
      <div style={{border: `4px dashed rgba(246,239,228,.55)`, borderRadius: 16, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 56, color: 'rgba(246,239,228,.6)'}}>?</div>
    ) : (
      <div style={{position: 'relative', borderRadius: 16, padding: '16px 14px', outline: hl > 0 ? `${Math.round(10 * hl)}px solid #F2C94C` : 'none', outlineOffset: 10}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: Math.round(w * 0.05), lineHeight: 1.35, color: CREAM, textAlign: 'center'}}>{desc}</div>
      </div>
    )}
    <div style={{marginTop: 40, fontFamily: COND, fontSize: Math.round(w * 0.075), color: GOLD, textAlign: 'center', opacity: 0.8}}>LE CLASSIQUE</div>
    <div style={{marginTop: 10, fontFamily: COND, fontSize: Math.round(w * 0.075), color: GOLD, textAlign: 'center', opacity: 0.8}}>LE PETIT NOUVEAU</div>
  </div>
);

// ---- 1. hook: counter, client asks -------------------------------------------------
const Hook = () => {
  const f = useCurrentFrame();
  const push = 1 + f * 0.004;
  const bub = sp(f, 4, POP);
  const pill = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: '#E9D7BE'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 40%'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1340, background: 'linear-gradient(180deg,#D9B98E,#E9D7BE)'}} />
        <Board x={150} y={250} w={780} desc={null} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1340, height: 60, background: '#8A6446'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1400, bottom: 0, background: '#6B4A34'}} />
        <Person x={300} y={1600} look={LOOKS[0]} walk={0} moving={0} turn={1} scale={1.7} />
        <Person x={860} y={1640} look={LOOKS[2]} walk={0} moving={0} turn={-1} scale={1.6} dir={-1} />
        <div style={{position: 'absolute', left: 90, top: 840, transform: `scale(${interpolate(bub, [0, 1], [0.5, 1])})`, opacity: bub, transformOrigin: '0% 100%'}}>
          <div style={{background: A.white, borderRadius: 28, padding: '18px 26px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: A.ink, maxWidth: 640}}>Euh… c'est quoi, le numéro 7 ?</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', transform: `scale(${interpolate(pill, [0, 1], [1.5, 1])})`}}>
        <span style={{display: 'inline-block', fontFamily: COND, fontSize: 100, color: A.white, background: A.red, padding: '12px 30px 4px', borderRadius: 16}}>LE NUMÉRO 7 ?</span>
      </div>
    </AbsoluteFill>
  );
};

// ---- 2. problem: close-up, eye finds the empty spot ---------------------------------
const Problem = () => {
  const f = useCurrentFrame();
  const move = clampI(f, 20, 60, 0, 1);
  const dotY = 420 + move * (800 - 420);
  const pulse = 1 + 0.15 * Math.sin(f / 4) * move;
  const zoom = 1 + clampI(f, 0, 160, 0, 0.12);
  return (
    <AbsoluteFill style={{background: '#E9D7BE'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 35%'}}>
      <Board x={90} y={300} w={900} desc={null} />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
        <span style={{display: 'inline-block', fontFamily: COND, fontSize: 84, color: A.white, background: 'rgba(20,19,23,.9)', padding: '14px 30px 6px', borderRadius: 16}}>LA PREMIÈRE FOIS ?</span>
      </div>
      <div style={{position: 'absolute', left: 540 - 26, top: dotY - 26, width: 52, height: 52, borderRadius: 26, background: A.red, border: '6px solid #fff', transform: `scale(${pulse})`, boxShadow: '0 6px 16px rgba(0,0,0,.4)', opacity: f < 10 ? 0 : 1}} />
      </div>
    </AbsoluteFill>
  );
};

// ---- 3. demo: description types under the name, then the real dish ---------------
const Demo = ({typeAt, cutAt}: {typeAt: number; cutAt: number}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(DESC.length, Math.floor((f - typeAt) * 1.1)));
  const showSandwich = f >= cutAt;
  const sand = sp(f, cutAt, {damping: 12, stiffness: 150});
  return (
    <AbsoluteFill style={{background: '#E9D7BE'}}>
      <Board x={90} y={300} w={900} desc={DESC.slice(0, n)} hl={f >= typeAt + 45 ? clampI(f, typeAt + 45, typeAt + 55, 0, 1) : 0} />
      {showSandwich ? (
        <AbsoluteFill style={{background: CREAM}}>
          <div style={{position: 'absolute', left: 300, top: 760, transform: `scale(${interpolate(sand, [0, 1], [1.8, 1.5])})`, opacity: clampI(f, cutAt, cutAt + 4, 0, 1)}}>
            <Sandwich p={1} />
          </div>
          <div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center'}}>
            <span style={{display: 'inline-block', fontFamily: COND, fontSize: 84, color: A.white, background: A.red, padding: '12px 28px 4px', borderRadius: 16}}>VRAI PLAT, VRAI TEXTE</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- 4. advice: two menus side by side --------------------------------------------
const Advice = () => {
  const f = useCurrentFrame();
  const a = sp(f, 0, POP);
  const b = sp(f, 25, POP);
  const zoom = 1 + clampI(f, 0, 200, 0, 0.12);
  return (
    <AbsoluteFill style={{background: '#E9D7BE'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 35%'}}>
      <div style={{position: 'absolute', left: 30, top: 420, transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`, opacity: a}}>
        <Board x={0} y={0} w={480} desc={null} title="LE NUMÉRO 7" />
      </div>
      <div style={{position: 'absolute', left: 570, top: 420, transform: `scale(${interpolate(b, [0, 1], [0.8, 1])})`, opacity: b}}>
        <Board x={0} y={0} w={480} desc={DESC} hl={clampI(f, 40, 50, 0, 1)} title="LE NUMÉRO 7" />
      </div>
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
        <span style={{display: 'inline-block', fontFamily: COND, fontSize: 84, color: A.white, background: 'rgba(20,19,23,.9)', padding: '14px 30px 6px', borderRadius: 16}}>UNE LIGNE DE PLUS</span>
      </div>
    </AbsoluteFill>
  );
};

// ---- 5. sign-off ------------------------------------------------------------------
const End = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', transform: 'scale(1.5)', transformOrigin: '50% 50%'}}>
        <Sandwich p={1} />
      </div>
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`}}>
        <span style={{display: 'inline-block', fontFamily: COND, fontSize: 180, color: A.white, background: A.red, padding: '16px 56px 6px', borderRadius: 22}}>FEEHA</span>
      </div>
    </AbsoluteFill>
  );
};

// ---- subtitles: sentence by sentence, spoken words lit -----------------------------
const Subs = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const groups: W[][] = [];
  let cur: W[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (/[.?!…]$/.test(w.text)) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  const g = groups.find((gr) => f >= gr[0].start * fps - 4 && f <= gr[gr.length - 1].end * fps + 12);
  if (!g) return null;
  return (
    <div style={{position: 'absolute', top: 1270, left: 50, right: 50, textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: 'rgba(20,19,23,.88)', borderRadius: 22, padding: '16px 28px 10px', fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.25}}>
        {g.map((w, i) => (
          <React.Fragment key={i}><span style={{color: f >= w.start * fps ? A.white : 'rgba(255,255,255,.4)'}}>{w.text}</span>{' '}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const FeehaNumero = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes} = timeline as unknown as {scenes: {id: string; from: number; to: number}[]};
  const demoType = wf('Poulet', 0);
  const demoCut = wf('croustillant', demoType);
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook />,
    problem: <Problem />,
    demo: <Demo typeAt={demoType - (scenes.find((s) => s.id === 'demo')?.from ?? 0)} cutAt={demoCut - (scenes.find((s) => s.id === 'demo')?.from ?? 0)} />,
    advice: <Advice />,
    end: <End />,
  };
  return (
    <AbsoluteFill style={{background: A.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <Subs />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: A.red}} />
      {audio ? <Audio src={staticFile('numero-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
