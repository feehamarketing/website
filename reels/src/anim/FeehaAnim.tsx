import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, Bubble, COND, LOOKS, Panel, Person, Poster, PosterKind, SANS, Shop, Snow, TapeStrip, WINDOW, clampI} from './Art';
import timeline from './timeline.json';

// Feeha panels ad, fully animated in the Feeha colours. The only live footage
// is the real shot of a poster sliding into a panel (public/ref/installs.mp4).

const BEAT = 15;
const POS = {x: 380, y: 770, w: 300};
const FEET = 1660; // poster/panel rectangle inside the shop window
const useSpr = (delay = 0, config = {damping: 13, stiffness: 220, mass: 0.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

const Headline = ({lines, top = 110, accent, delay = 0, instant = false}: {lines: string[]; top?: number; accent?: string; delay?: number; instant?: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: COND, lineHeight: 0.95}}>
      {lines.map((l, i) => {
        const p = instant ? 1 : spring({frame: frame - delay - i * 4, fps, config: {damping: 14, stiffness: 300, mass: 0.5}});
        return (
          <div key={i} style={{fontSize: 118, color: A.white, textShadow: '0 8px 30px rgba(0,0,0,.6)', transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px)`, opacity: Math.min(1, p * 2.5)}}>
            {l}
          </div>
        );
      })}
      {accent ? <AccentTag text={accent} delay={instant ? 0 : delay + lines.length * 4 + 2} instant={instant} /> : null}
    </div>
  );
};

const AccentTag = ({text, delay = 0, instant = false, size = 120, bg = A.red, color = A.white}: {text: string; delay?: number; instant?: boolean; size?: number; bg?: string; color?: string}) => {
  const frame = useCurrentFrame();
  const sp = useSpr(delay, {damping: 9, stiffness: 260, mass: 0.6});
  const p = instant ? 1 : sp;
  return (
    <div style={{display: 'inline-block', marginTop: 16, fontFamily: COND, fontSize: size, lineHeight: 1, color, background: bg, padding: '14px 40px 6px', borderRadius: 16, boxShadow: '0 14px 0 rgba(0,0,0,.25)', transform: `rotate(-2deg) scale(${(instant ? 1 : interpolate(p, [0, 1], [2, 1])) * (1 + 0.03 * Math.sin(frame / 4))})`, opacity: !instant && frame < delay ? 0 : 1}}>{text}</div>
  );
};

// ---- the paper poster taped in the window ------------------------------------------------
const PaperPoster = ({dim = 0, peel = 0, fall = 0}: {dim?: number; peel?: number; fall?: number}) => (
  <div
    style={{
      position: 'absolute',
      left: POS.x,
      top: POS.y + fall * 700,
      width: POS.w,
      transform: `rotate(${-3 + peel * 6 + fall * 40}deg)`,
      transformOrigin: '20% 0%',
      opacity: 1 - fall,
    }}
  >
    <div style={{filter: `brightness(${1 - dim * 0.72}) saturate(${1 - dim * 0.6}) contrast(${1 - dim * 0.2})`, boxShadow: '0 6px 14px rgba(0,0,0,.3)'}}>
      <Poster kind="burger" w={POS.w} />
    </div>
    {/* paper look: creases, curled corner */}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,.08) 31%, transparent 33%, transparent 65%, rgba(0,0,0,.1) 66%, transparent 68%)'}} />
    <div style={{position: 'absolute', right: 0, top: 0, width: 50 + peel * 40, height: 50 + peel * 40, background: 'linear-gradient(225deg, #2a2420 50%, #d9d0c2 51%)', opacity: 0.95}} />
    <TapeStrip x={10} y={6} rot={-35} />
    <TapeStrip x={POS.w - 14} y={POS.w * 1.5 - 4} rot={-35} />
    <TapeStrip x={8} y={POS.w * 1.5 - 6} rot={35} />
  </div>
);

/** Pedestrian that walks from `x0` toward `x1`, stops there at `stopAt` frames, then turns to look. */
const Walker = ({look, x0, x1, start = 0, stopAt, lookAt, bubbleAt, dir = 1, dim = 0, scale = 1.75}: {look: number; x0: number; x1: number; start?: number; stopAt?: number; lookAt?: number; bubbleAt?: number; dir?: 1 | -1; dim?: number; scale?: number}) => {
  const frame = useCurrentFrame() - start;
  const end = stopAt ?? 9999;
  const t = Math.min(frame, end);
  const speed = 10 * dir;
  const x = stopAt !== undefined ? interpolate(t, [0, end], [x0, x1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (v) => 1 - (1 - v) ** 1.6}) : x0 + speed * Math.max(0, frame);
  const moving = stopAt !== undefined && frame >= end ? 0 : 1;
  const turn = lookAt !== undefined ? clampI(frame, lookAt, lookAt + 6, 0, 1) : 0;
  const bubble = bubbleAt !== undefined ? spring({frame: frame - bubbleAt, fps: 30, config: {damping: 9, stiffness: 260, mass: 0.6}}) : 0;
  return (
    <>
      <Person x={x} y={FEET} look={LOOKS[look]} walk={frame * 0.34} moving={moving} turn={turn} scale={scale} dir={dir} dim={dim} />
      {bubbleAt !== undefined && frame >= bubbleAt ? <Bubble x={x} y={FEET - 300 * scale * (LOOKS[look].tall ?? 1)} p={bubble} /> : null}
    </>
  );
};

// ---- scenes -----------------------------------------------------------------------------
const Hook = () => {
  const frame = useCurrentFrame();
  const night = clampI(frame, 0, 90, 0.55, 0.8);
  return (
    <AbsoluteFill>
      <Shop night={night} insideLit={0.4}>
        <div style={{position: 'absolute', left: POS.x - WINDOW.x, top: POS.y - WINDOW.y}}>
          <div style={{position: 'relative', left: -POS.x, top: -POS.y}}>
            <PaperPoster dim={night} />
          </div>
        </div>
      </Shop>
      <Walker look={0} x0={-120} x1={0} start={-30} />
      <Walker look={1} x0={-420} x1={0} start={-10} dim={0.2} />
      <Walker look={2} x0={1220} x1={0} start={-5} dir={-1} />
      <Snow />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,22,.75) 0%, transparent 22%)'}} />
      <Headline lines={['PERSONNE NE REGARDE']} accent="TA VITRINE ?" instant />
    </AbsoluteFill>
  );
};

const Clock = ({h, m}: {h: number; m: number}) => (
  <div style={{position: 'absolute', left: 60, top: 470, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(5,8,22,.75)', padding: '14px 26px', borderRadius: 999}}>
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r="23" fill="none" stroke={A.white} strokeWidth="4" />
      <line x1="27" y1="27" x2={27 + 15 * Math.sin(((h % 12) / 12) * 2 * Math.PI + (m / 60) * (Math.PI / 6))} y2={27 - 15 * Math.cos(((h % 12) / 12) * 2 * Math.PI + (m / 60) * (Math.PI / 6))} stroke={A.white} strokeWidth="4" strokeLinecap="round" />
      <line x1="27" y1="27" x2={27 + 19 * Math.sin((m / 60) * 2 * Math.PI)} y2={27 - 19 * Math.cos((m / 60) * 2 * Math.PI)} stroke={A.redHi} strokeWidth="3" strokeLinecap="round" />
    </svg>
    <div style={{fontFamily: COND, fontSize: 70, color: A.white, lineHeight: 1}}>
      {h} H {String(m).padStart(2, '0')}
    </div>
  </div>
);

const Problem = () => {
  const frame = useCurrentFrame();
  const night = clampI(frame, 0, 60, 0.8, 1);
  const zoom = clampI(frame, 0, 90, 1, 1.5);
  const minutes = Math.round(clampI(frame, 0, 70, 16 * 60 + 5, 16 * 60 + 45));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${POS.x + POS.w / 2}px ${POS.y + POS.w * 0.75}px`}}>
        <Shop night={night} insideLit={0.25}>
          <div style={{position: 'absolute', left: -WINDOW.x, top: -WINDOW.y}}>
            <PaperPoster dim={clampI(frame, 0, 60, 0.8, 1)} peel={clampI(frame, 30, 70, 0, 1)} />
          </div>
        </Shop>
        <Walker look={3} x0={-150} x1={0} start={0} dim={0.4} />
      </AbsoluteFill>
      <Snow n={50} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,22,.85) 0%, rgba(5,8,22,.6) 20%, transparent 32%)'}} />
      <Clock h={Math.floor(minutes / 60)} m={minutes % 60} />
      <Headline lines={['APRÈS 16 H 30,']} accent="TON AFFICHE DISPARAÎT" />
    </AbsoluteFill>
  );
};

const Solution = () => {
  const frame = useCurrentFrame();
  const fall = clampI(frame, 0, 18, 0, 1);
  const drop = spring({frame: frame - 14, fps: 30, config: {damping: 14, stiffness: 120, mass: 0.9}});
  const flick = [0, 1, 0.2, 1, 0.5, 1];
  const light = frame < 42 ? 0 : frame - 42 < 12 ? flick[Math.floor((frame - 42) / 2)] ?? 1 : 1;
  const lit = frame >= 42;
  return (
    <AbsoluteFill>
      <Shop night={1} insideLit={lit ? 0.9 : 0.25}>
        <div style={{position: 'absolute', left: -WINDOW.x, top: -WINDOW.y}}>
          {fall < 1 ? <PaperPoster dim={1} peel={1} fall={fall} /> : null}
        </div>
      </Shop>
      <Panel x={POS.x - 9} y={interpolate(drop, [0, 1], [POS.y - 1400, POS.y - 9])} w={POS.w} light={light} cable={150 + interpolate(drop, [0, 1], [-200, 0])}>
        <Poster kind="burger" w={POS.w} />
      </Panel>
      {/* light spilling onto the snow */}
      <div style={{position: 'absolute', left: 230, top: 1380, width: 620, height: 200, background: `radial-gradient(ellipse, rgba(255,210,140,${0.5 * light}), transparent 70%)`}} />
      <Walker look={0} x0={-180} x1={200} start={40} stopAt={34} lookAt={36} bubbleAt={40} />
      <Walker look={2} x0={1280} x1={880} start={46} stopAt={30} lookAt={32} bubbleAt={36} dir={-1} />
      <Snow n={45} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,22,.85) 0%, rgba(5,8,22,.55) 20%, transparent 32%)'}} />
      {lit ? <Headline lines={['AVEC FEEHA,']} accent="ILS S'ARRÊTENT." delay={44} /> : <Headline lines={['ET SI TON AFFICHE']} accent="BRILLAIT ?" />}
    </AbsoluteFill>
  );
};

const RedBackdrop = ({children}: {children?: React.ReactNode}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${A.redHi} 0%, ${A.red} 45%, ${A.deep} 100%)`}}>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(120deg, rgba(255,255,255,.05) 0 3px, transparent 3px 60px)', backgroundPosition: `${frame * 2}px 0`}} />
      {children}
    </AbsoluteFill>
  );
};

/** The one live shot: a real poster sliding into a Feeha panel. */
const Real = () => {
  const {fps} = useVideoConfig();
  const card = useSpr(0, {damping: 15, stiffness: 160, mass: 0.8});
  const W = 640;
  const Hh = (W * 770) / 606; // keep source rows 0-770: the burned-in caption sits at ~800-870
  return (
    <RedBackdrop>
      <Headline lines={['PAS UN ÉCRAN.']} accent="UN VRAI POSTER" />
      <div style={{position: 'absolute', left: 540 - W / 2 - 12, top: 470, width: W + 24, height: Hh + 24, background: A.white, borderRadius: 34, padding: 12, boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,.45)', transform: `translateY(${interpolate(card, [0, 1], [900, 0])}px) rotate(${interpolate(card, [0, 1], [8, -2])}deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', background: '#000'}}>
          <OffthreadVideo src={staticFile('ref/installs.mp4')} muted trimBefore={Math.round(3.15 * fps)} playbackRate={0.42} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 1360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <AccentTag text="GLISSE-LE. C'EST TOUT." delay={30} bg={A.white} color={A.red} size={90} />
      </div>
    </RedBackdrop>
  );
};

const KINDS: PosterKind[] = ['burger', 'pizza', 'coffee'];
const TABS = ['MIDI', 'SOIR', 'NOUVEAUTÉ'];
const Swap = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 500;
  // transition k (0 -> 1): poster k leaves through the top slot, then poster k+1 slides down in
  const t = [0, 1].map((k) => spring({frame: frame - 12 - k * 26, fps, config: {damping: 16, stiffness: 150}}));
  const yOf = (k: number) => {
    const outT = k < 2 ? Math.min(1, t[k] * 2) : 0; // leaving
    const inT = k === 0 ? 1 : Math.max(0, t[k - 1] * 2 - 1); // arriving
    return k === 0 ? -1.15 * outT : -1.15 * (1 - inT) - 1.15 * outT;
  };
  const current = t[1] > 0.5 ? 2 : t[0] > 0.5 ? 1 : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, #3a2a24 0%, ${A.ink} 70%)`}}>
      <Panel x={540 - W / 2 - 15} y={500} w={W} cable={500}>
        {KINDS.map((k, i) => (
          <div key={k} style={{position: 'absolute', inset: 0, transform: `translateY(${yOf(i) * 100}%)`}}>
            <Poster kind={k} w={W} />
          </div>
        ))}
      </Panel>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: COND, fontSize: 118, color: A.white, lineHeight: 0.95}}>CHANGE TA PROMO</div>
        <AccentTag text="EN 2 SECONDES" delay={4} />
      </div>
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18}}>
        {TABS.map((tab, i) => (
          <div key={tab} style={{fontFamily: COND, fontSize: 54, color: i === current ? A.white : 'rgba(255,255,255,.35)', background: i === current ? A.red : 'transparent', border: '3px solid rgba(255,255,255,.35)', padding: '8px 28px 2px', borderRadius: 999}}>
            {tab}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ITEMS = ['2 PANNEAUX LUMINEUX', 'POSTERS IMPRIMÉS INCLUS', 'KIT DE SUSPENSION', 'TUTORIEL PAS À PAS'];
const Bundle = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p1 = spring({frame: frame - 2, fps, config: {damping: 12, stiffness: 160}});
  const p2 = spring({frame: frame - 7, fps, config: {damping: 12, stiffness: 160}});
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 380, background: A.red}} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: A.warm}}>EN CE MOMENT</div>
        <div style={{fontFamily: COND, fontSize: 150, color: A.white, lineHeight: 1}}>OFFRE GROUPÉE</div>
      </div>
      <div style={{position: 'absolute', top: 430, left: 0, right: 0, height: 480}}>
        <div style={{position: 'absolute', left: 190, top: 0, transform: `translateY(${(1 - p1) * 600}px) rotate(${-6 + (1 - p1) * -20}deg)`}}>
          <Panel x={0} y={0} w={250} cable={0}>
            <Poster kind="burger" w={250} />
          </Panel>
        </div>
        <div style={{position: 'absolute', left: 600, top: 20, transform: `translateY(${(1 - p2) * 600}px) rotate(${6 + (1 - p2) * 20}deg)`}}>
          <Panel x={0} y={0} w={250} cable={0}>
            <Poster kind="pizza" w={250} />
          </Panel>
        </div>
      </div>
      <div style={{position: 'absolute', top: 960, left: 90, right: 60, display: 'flex', flexDirection: 'column', gap: 22}}>
        {ITEMS.map((it, i) => {
          const at = 16 + i * 10;
          const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
          return (
            <div key={it} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: frame < at ? 0 : 1, transform: `translateX(${interpolate(p, [0, 1], [-60, 0])}px)`}}>
              <div style={{width: 84, height: 84, borderRadius: 42, background: A.red, color: A.white, fontFamily: SANS, fontWeight: 900, fontSize: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>✓</div>
              <div style={{fontFamily: COND, fontSize: 72, color: A.ink, lineHeight: 1}}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1410, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 64, color: A.red, opacity: frame >= 62 ? 1 : 0}}>INSTALLÉ EN MOINS DE 10 MINUTES</div>
    </AbsoluteFill>
  );
};

const Price = () => {
  const frame = useCurrentFrame();
  const p = useSpr(0, {damping: 9, stiffness: 260, mass: 0.6});
  const q = useSpr(26, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <RedBackdrop>
      <div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: 8, color: A.warm}}>2 PANNEAUX · TOUT INCLUS</div>
      <div style={{position: 'absolute', top: 480, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 330, lineHeight: 1, color: A.white, transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`}}>599 $</div>
      <div style={{position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', opacity: frame >= 26 ? 1 : 0, transform: `scale(${interpolate(q, [0, 1], [1.5, 1])})`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: A.warm}}>SUR 7 ANS, ÇA REVIENT À</div>
        <div style={{display: 'inline-block', marginTop: 16, fontFamily: COND, fontSize: 150, color: A.red, background: A.white, padding: '10px 40px 0', borderRadius: 18}}>&lt; 8 $ / MOIS</div>
      </div>
    </RedBackdrop>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  const logo = useSpr(4);
  return (
    <AbsoluteFill>
      <Shop night={1} insideLit={0.9} />
      <Panel x={POS.x - 9} y={POS.y - 9} w={POS.w} cable={150}>
        <Poster kind="burger" w={POS.w} />
      </Panel>
      <div style={{position: 'absolute', left: 230, top: 1380, width: 620, height: 200, background: 'radial-gradient(ellipse, rgba(255,210,140,.5), transparent 70%)'}} />
      <Walker look={1} x0={-200} x1={0} start={0} />
      <Walker look={3} x0={890} x1={880} start={0} stopAt={1} lookAt={0} />
      <Walker look={0} x0={210} x1={200} start={0} stopAt={1} lookAt={0} />
      <Snow n={40} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,22,.92) 0%, rgba(5,8,22,.8) 30%, rgba(5,8,22,.2) 42%)'}} />
      <div style={{position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: A.white, padding: 8, borderRadius: 22, boxShadow: '0 20px 50px rgba(0,0,0,.5)', transform: `scale(${logo})`}}>
          <Img src={staticFile('feeha/logo-clean.png')} style={{width: 400, display: 'block', borderRadius: 16}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center', fontFamily: COND, lineHeight: 0.95}}>
        <div style={{fontSize: 92, color: A.white}}>ILLUMINE TA VITRINE</div>
        <div style={{fontSize: 92, color: A.warm}}>AVANT LE RUSH DES FÊTES</div>
      </div>
      <div style={{position: 'absolute', top: 550, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${beat})`}}>
        <AccentTag text="FEEHAPANELS.COM" delay={10} bg={A.red} size={96} />
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ------------------------------------------------------------------------
export const FeehaAnim = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes} = timeline;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 4], [0.3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook />,
    problem: <Problem />,
    solution: <Solution />,
    real: <Real />,
    swap: <Swap />,
    bundle: <Bundle />,
    price: <Price />,
    cta: <Cta />,
  };
  return (
    <AbsoluteFill style={{background: A.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: A.red}} />
      {audio ? <Audio src={staticFile('anim-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};

export {Freeze};
