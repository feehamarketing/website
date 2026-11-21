import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, COND, LOOKS, Person, SANS, clampI} from '../anim/Art';
import timeline from './timeline.json';

// Reel "franchise" : the 3 pillars, Bird Boyz branding as the example. Cuts every ~2-3 s.
const POP = {damping: 9, stiffness: 240, mass: 0.6};
const sp = (f: number, d: number, cfg = {damping: 12, stiffness: 170}) => spring({frame: f - d, fps: 30, config: cfg});
const RED = '#D71920';
const CREAM = '#F6EFE4';
const INK = '#141317';

type W = {text: string; start: number; end: number};

// ---- photo of the Bird Boyz branding: blurred cover background + sharp 4:5 foreground
const Photo = ({src, zoom = [1, 1.1], pan = '50% 50%'}: {src: string; zoom?: [number, number]; pan?: string}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 120], zoom, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: RED}}>
      <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px) brightness(.55)', transform: 'scale(1.2)'}} />
      <div style={{position: 'absolute', left: 0, top: 285, width: 1080, height: 1350, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pan, transform: `scale(${s})`}} />
      </div>
    </AbsoluteFill>
  );
};

const Pill = ({text, d = 0, top, bg = A.white, color = RED, size = 84, rot = -2}: {text: string; d?: number; top: number; bg?: string; color?: string; size?: number; rot?: number}) => {
  const f = useCurrentFrame();
  if (f < d) return null;
  const p = sp(f, d, POP);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>
      <span style={{display: 'inline-block', fontFamily: COND, fontSize: size, lineHeight: 1, color, background: bg, padding: '14px 30px 6px', borderRadius: 16, boxShadow: '0 12px 0 rgba(0,0,0,.2)', transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [1.6, 1])})`}}>{text}</span>
    </div>
  );
};

// ---- 1. hook : counter 2012 -> 70+, then the question --------------------------------
const Hook = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, 80], [0, 70], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (v) => 1 - (1 - v) ** 3}));
  const line = clampI(f, 20, 80, 0, 1);
  return (
    <AbsoluteFill style={{background: RED}}>
      {f < 90 ? (
        <>
          <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 340, lineHeight: 0.9, color: A.white}}>{n}+</div>
          <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 110, color: CREAM}}>RESTOS</div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 1080, height: 10, background: 'rgba(255,255,255,.35)'}}>
            <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${line * 100}%`, background: A.white}} />
          </div>
          <div style={{position: 'absolute', left: 100, top: 1110, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: CREAM}}>2012 · 1 restaurant</div>
          <div style={{position: 'absolute', right: 100, top: 1110, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: CREAM}}>aujourd'hui</div>
        </>
      ) : null}
      {f >= 90 && f < 150 ? (
        <div style={{position: 'absolute', top: 640, left: 60, right: 60, textAlign: 'center', fontFamily: COND, fontSize: 200, lineHeight: 0.95, color: A.white, transform: `scale(${sp(f, 90, POP)})`}}>TU DEVINES<br />LAQUELLE ?</div>
      ) : null}
      {f >= 150 ? <Pill text="ÉCRIS-LA EN COMMENTAIRE" d={150} top={800} bg={INK} color={A.white} size={72} /> : null}
    </AbsoluteFill>
  );
};

// ---- 2. pillar 1 : counter, cashier, queue, grill, the flow --------------------------
const Pillar1 = () => {
  const f = useCurrentFrame();
  const flame = (k: number) => 0.6 + 0.4 * Math.abs(Math.sin(f / 4 + k));
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: RED}} />
      {/* sign + cashier + register */}
      <div style={{position: 'absolute', left: 90, top: 470, width: 300, height: 120, background: INK, borderRadius: 12, color: A.white, fontFamily: COND, fontSize: 84, textAlign: 'center', lineHeight: '120px'}}>CAISSE</div>
      <div style={{position: 'absolute', left: 120, top: 760, width: 240, height: 90, background: '#2B2B31', borderRadius: 10}} />
      <Person x={240} y={1040} look={LOOKS[2]} walk={0} moving={0} turn={0} scale={1.3} />
      {/* grill station + two cooks */}
      <div style={{position: 'absolute', left: 600, top: 620, width: 380, height: 360, background: '#3A3A40', borderRadius: 14}} />
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{position: 'absolute', left: 630 + k * 85, top: 560, width: 40, height: 60 * flame(k), background: `linear-gradient(0deg,#FFB43B,${RED})`, borderRadius: '50% 50% 20% 20%', opacity: 0.9}} />
      ))}
      <Person x={700} y={1040} look={LOOKS[1]} walk={0} moving={0} turn={0} scale={1.3} />
      <Person x={880} y={1040} look={LOOKS[3]} walk={0} moving={0} turn={0} scale={1.3} />
      {/* counter */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040, height: 60, background: '#8A6446'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1100, bottom: 0, background: '#6B4A34'}} />
      {/* customers in a queue */}
      {[0, 1, 2].map((k) => (
        <Person key={k} x={170 + k * 300} y={1700} look={LOOKS[k]} walk={0} moving={0} turn={k === 0 ? 1 : 0} scale={1.6} />
      ))}
      {/* the bowl order */}
      <div style={{position: 'absolute', left: 260, top: 660, transform: `scale(${sp(f, 40, POP)})`, fontFamily: COND, fontSize: 56, color: INK, background: CREAM, borderRadius: 14, padding: '8px 16px 2px', border: `4px solid ${RED}`}}>BOL : POULET ?</div>
      {/* steps */}
      <Pill text="1 · COMMANDE" d={0} top={180} size={80} rot={-3} />
      <Pill text="2 · GRILL" d={50} top={300} bg={INK} color={A.white} size={80} rot={2} />
      <Pill text="3 · SERVICE" d={100} top={420} size={80} rot={-2} />
    </AbsoluteFill>
  );
};

// ---- 3. pillars 2 and 3 : photos -------------------------------------------------------
const Card = ({text, top = 110, d = 0}: {text: string; top?: number; d?: number}) => {
  const f = useCurrentFrame();
  if (f < d) return null;
  const p = sp(f, d, POP);
  return (
    <div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: 'rgba(20,19,23,.9)', color: A.white, fontFamily: COND, fontSize: 80, lineHeight: 1.02, padding: '18px 30px 10px', borderRadius: 18, transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`}}>{text}</div>
    </div>
  );
};

const Tag = () => (
  <div style={{position: 'absolute', top: 40, right: 40, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: A.white, background: 'rgba(0,0,0,.45)', padding: '6px 14px', borderRadius: 8}}>CONCEPT DE BRANDING FEEHA</div>
);

const Image = () => (
  <AbsoluteFill>
    <Photo src="birdboyz/1.jpg" zoom={[1, 1.12]} />
    <Card text="IDENTITÉ FORTE" top={1480} />
    <Tag />
  </AbsoluteFill>
);

const Recipe = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < 32 ? <Photo src="birdboyz/5.jpg" zoom={[1, 1.08]} /> : <Photo src="birdboyz/3.jpg" zoom={[1, 1.08]} />}
      <Card text="BONNES ET FRAÎCHES" />
    </AbsoluteFill>
  );
};

// ---- 4. Bird Boyz : the 3 pillars as cards -----------------------------------------
const BirdBoyz = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < 60 ? <Photo src="birdboyz/4.jpg" zoom={[1, 1.1]} /> : <Photo src="birdboyz/6.jpg" zoom={[1.05, 1.15]} />}
      {f < 60 ? (
        <>
          <Pill text="MENU SIMPLE" d={0} top={150} size={96} rot={-3} />
          <Pill text="PRODUCTION RAPIDE" d={14} top={265} size={96} bg={INK} color={A.white} rot={2} />
          <Pill text="IDENTITÉ DE GRANDE FRANCHISE" d={28} top={380} size={84} rot={-1} />
        </>
      ) : (
        <Card text="FEEHA PEUT VOUS AIDER À FAIRE UN BRANDING DIGNE DES PLUS GRANDS" top={150} d={60} />
      )}
      <Tag />
    </AbsoluteFill>
  );
};

// ---- 5. call to action ---------------------------------------------------------------
const Cta = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: RED}}>
      {f < 85 ? (
        <>
          <Photo src="birdboyz/6.jpg" zoom={[1.05, 1.18]} pan="50% 40%" />
          <Pill text="FRANCHISE ?" d={0} top={150} size={130} bg={INK} color={A.white} rot={-2} />
        </>
      ) : (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: COND, fontSize: 300, lineHeight: 0.9, color: A.white, transform: `scale(${interpolate(sp(f, 85, POP), [0, 1], [1.5, 1])})`}}>FEEHA</div>
          <div style={{marginTop: 40, fontFamily: COND, fontSize: 110, color: CREAM}}>ÉCRIS « FRANCHISE » EN DM</div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', top: 1600, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 34, color: A.white, opacity: p}}>Pour bâtir ta chaîne · feeha.ca</div>
    </AbsoluteFill>
  );
};

// ---- subtitles : sentence by sentence -------------------------------------------------
const Subs = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = (timeline as unknown as {words: W[]}).words;
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
    <div style={{position: 'absolute', top: 1260, left: 50, right: 50, textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: 'rgba(20,19,23,.88)', borderRadius: 22, padding: '16px 28px 10px', fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.25}}>
        {g.map((w, i) => (
          <React.Fragment key={i}>
            <span style={{color: f >= w.start * fps ? A.white : 'rgba(255,255,255,.4)'}}>{w.text}</span>{' '}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const FeehaBirdBoyz = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes} = timeline as unknown as {scenes: {id: string; from: number; to: number}[]};
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook />,
    p1: <Pillar1 />,
    image: <Image />,
    recipe: <Recipe />,
    bb: <BirdBoyz />,
    cta: <Cta />,
  };
  return (
    <AbsoluteFill style={{background: INK}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      {/* subtitles removed */}
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: A.white}} />
      {audio ? <Audio src={staticFile('birdboyz-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
