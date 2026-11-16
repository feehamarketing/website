import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEAT, Big, COND, H, SANS, Tag, clamp, useSpr} from '../hiver/Hiver';
import timeline from './timeline.json';

// Feeha panels ad built from real installation footage (public/ref/installs.mp4,
// 606x1080, 30 fps). The footage has "Illuminate your store!" burned in around
// y = 798-870 of 1080; a Feeha-red band covers it and carries our message.

const SRC = staticFile('ref/installs.mp4');
const BAND = {top: 1380, h: 210};

/** A shot of the source footage: start second, playback rate, slow push-in. */
const Clip = ({at, rate = 1, zoom = [1, 1.06], origin = '50% 77%', freezeAfter, style}: {at: number; rate?: number; zoom?: [number, number]; origin?: string; freezeAfter?: number; style?: React.CSSProperties}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom);
  const video = (
    <OffthreadVideo src={SRC} muted trimBefore={Math.round(at * fps)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000', ...style}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: origin}}>
        {freezeAfter !== undefined && frame >= freezeAfter ? <Freeze frame={freezeAfter}>{video}</Freeze> : video}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Feeha-red band over the burned-in caption, with this scene's message. */
const Band = ({children, delay = 0, size = 92, instant = false}: {children: React.ReactNode; delay?: number; size?: number; instant?: boolean}) => {
  const sp = useSpr(delay, {damping: 16, stiffness: 260, mass: 0.5});
  const p = instant ? 1 : sp;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: BAND.top, height: BAND.h, background: H.red, boxShadow: '0 -10px 40px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{fontFamily: COND, fontSize: size, lineHeight: 0.95, color: H.white, textAlign: 'center', padding: '0 40px', transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px)`, opacity: p}}>{children}</div>
    </div>
  );
};

const TopLabel = ({children, delay = 0}: {children: React.ReactNode; delay?: number}) => {
  const p = useSpr(delay);
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: H.white, background: 'rgba(0,0,0,.55)', padding: '14px 30px', borderRadius: 999}}>{children}</div>
    </div>
  );
};

const Shade = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.65) 0%, transparent 22%, transparent 62%, rgba(0,0,0,.45) 72%)'}} />;

// ---- scenes ---------------------------------------------------------------------
const HOOK_SHOTS = [21.7, 14.7, 2.0, 6.2, 8.7, 19.7];

const Hook = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {HOOK_SHOTS.map((at, i) => (
        <Sequence key={i} from={i * BEAT} durationInFrames={BEAT} layout="none">
          <Clip at={at} zoom={[1.08, 1.0]} />
        </Sequence>
      ))}
      <Shade />
      {/* the headline is on screen from the very first frame (thumbnail) */}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: COND, lineHeight: 0.95}}>
        <div style={{fontSize: 118, color: H.white, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>CES COMMERCES</div>
        <div style={{fontSize: 118, color: H.white, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>ONT TOUS</div>
        <div style={{display: 'inline-block', marginTop: 14, fontSize: 150, color: H.white, background: H.red, padding: '10px 36px 0', borderRadius: 14, transform: `rotate(-2deg) scale(${1 + 0.04 * Math.sin(frame / 3)})`}}>LE MÊME SECRET</div>
      </div>
      <Band size={80} instant>
        REGARDE BIEN LEURS VITRINES
      </Band>
    </AbsoluteFill>
  );
};

const Reveal = () => (
  <AbsoluteFill>
    <Clip at={5.95} rate={0.68} zoom={[1.0, 1.35]} />
    <Shade />
    <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: H.white, padding: 8, borderRadius: 22, boxShadow: '0 20px 50px rgba(0,0,0,.5)', transform: `scale(${useSpr(4)})`}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 380, display: 'block', borderRadius: 16}} />
      </div>
    </div>
    <Band>DES PANNEAUX LUMINEUX</Band>
  </AbsoluteFill>
);

const DayNight = () => {
  const frame = useCurrentFrame();
  const night = frame >= 40;
  const half = (at: number, rate: number, label: string, on: boolean, left: number) => (
    <div style={{position: 'absolute', left, top: 0, width: 540, height: 1920, overflow: 'hidden'}}>
      <AbsoluteFill style={{left: -270, width: 1080}}>
        <Clip at={at} rate={rate} zoom={[1.15, 1.22]} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center'}}>
        <span style={{fontFamily: COND, fontSize: 78, color: H.white, background: on ? H.red : 'rgba(0,0,0,.6)', padding: '8px 30px 0', borderRadius: 999}}>{label}</span>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {half(16.6, 0.7, 'LE JOUR ✓', !night, 0)}
      {half(14.5, 0.45, 'LE SOIR ✓✓', night, 540)}
      <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: 1920, background: H.white}} />
      <Shade />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <Big size={120}>VISIBLE</Big>
        <Big size={120} delay={4} color={H.warm}>
          À TOUTE HEURE
        </Big>
      </div>
      <Band size={84}>{night ? 'ET ENCORE PLUS LE SOIR' : 'DE JOUR...'}</Band>
    </AbsoluteFill>
  );
};

const Demo = () => (
  <AbsoluteFill>
    <Clip at={3.15} rate={0.6} zoom={[1.05, 1.15]} freezeAfter={68} />
    <Shade />
    <TopLabel>PAS UN ÉCRAN · UN VRAI POSTER</TopLabel>
    <Band>GLISSE TON POSTER. C'EST TOUT.</Band>
  </AbsoluteFill>
);

const Change = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={38} layout="none">
      <Clip at={9.5} zoom={[1.1, 1.18]} />
    </Sequence>
    <Sequence from={38} layout="none">
      <Clip at={12.95} rate={0.75} zoom={[1.1, 1.2]} />
    </Sequence>
    <Shade />
    <TopLabel>TON MENU · TES PROMOS · TES NOUVEAUTÉS</TopLabel>
    <Band size={82}>CHANGE TA PROMO EN QUELQUES SECONDES</Band>
  </AbsoluteFill>
);

const ITEMS = ['2 PANNEAUX LUMINEUX', 'POSTERS IMPRIMÉS INCLUS', 'KIT DE SUSPENSION', "TUTORIEL D'INSTALLATION"];

const Offer = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: H.paper}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 760, overflow: 'hidden'}}>
        <Clip at={11.6} rate={0.3} zoom={[1.15, 1.25]} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,15,18,.9) 0%, rgba(120,15,18,.4) 35%, transparent 60%, rgba(244,242,238,1) 100%)'}} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0}}>
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: H.warm}}>EN CE MOMENT</div>
        <Big size={150}>OFFRE GROUPÉE</Big>
      </div>
      <div style={{position: 'absolute', top: 790, left: 80, right: 60, display: 'flex', flexDirection: 'column', gap: 26}}>
        {ITEMS.map((it, i) => {
          const at = 8 + i * 12;
          const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
          return (
            <div key={it} style={{display: 'flex', alignItems: 'center', gap: 28, opacity: frame < at ? 0 : 1, transform: `translateX(${interpolate(p, [0, 1], [-60, 0])}px)`}}>
              <div style={{width: 90, height: 90, borderRadius: 45, background: H.red, color: H.white, fontFamily: SANS, fontWeight: 900, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>✓</div>
              <div style={{fontFamily: COND, fontSize: 76, color: H.ink, lineHeight: 1}}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1290, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center'}}>
        <div style={{fontFamily: COND, fontSize: 56, color: H.grey, opacity: frame >= 60 ? 1 : 0}}>&lt; 10 MIN À INSTALLER</div>
      </div>
      <div style={{position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Tag delay={70} size={130} rotate={-3}>
          DÈS 599 $
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/** 599 $ over 7 years = 7,13 $ a month for both panels. */
const Month = () => {
  const frame = useCurrentFrame();
  const p = useSpr(14, {damping: 10, stiffness: 240, mass: 0.6});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 380, fontFamily: COND, fontSize: 110, color: H.white, opacity: 0.85}}>599 $ ÷ 7 ANS DE DURÉE DE VIE</div>
      <div style={{position: 'absolute', top: 540, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: H.warm}}>ÇA REVIENT À</div>
      <div style={{position: 'absolute', top: 610, display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: COND, color: H.white, opacity: frame >= 14 ? 1 : 0, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`}}>
        <span style={{fontSize: 130}}>MOINS DE</span>
        <span style={{fontSize: 320, lineHeight: 1}}>8 $</span>
      </div>
      <div style={{position: 'absolute', top: 950, fontFamily: COND, fontSize: 110, color: H.ink, opacity: frame >= 14 ? 1 : 0}}>PAR MOIS</div>
      <div style={{position: 'absolute', top: 1090, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: H.white, opacity: frame >= 20 ? 0.9 : 0}}>pour tes 2 panneaux</div>
    </AbsoluteFill>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  return (
    <AbsoluteFill>
      <Clip at={21.4} rate={0.4} zoom={[1.0, 1.12]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,6,6,.85) 0%, rgba(10,6,6,.55) 45%, rgba(10,6,6,.2) 70%)'}} />
      <div style={{position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: H.white, padding: 8, borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,.5)', transform: `scale(${useSpr(0)})`}}>
          <Img src={staticFile('feeha/logo-clean.png')} style={{width: 520, display: 'block', borderRadius: 18}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0}}>
        <Big size={96} delay={4}>
          ILLUMINE TON COMMERCE
        </Big>
        <Big size={96} delay={8} color={H.warm}>
          AVANT LE RUSH DES FÊTES
        </Big>
      </div>
      <div style={{position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${beat})`}}>
        <Tag delay={12} bg={H.white} color={H.red} rotate={-2} size={110}>
          FEEHAPANELS.COM
        </Tag>
      </div>
      <Band size={70} delay={18}>
        OFFRES GROUPÉES DÈS 599 $ · POSTERS INCLUS
      </Band>
    </AbsoluteFill>
  );
};

// ---- composition ----------------------------------------------------------------
export const FeehaPanel = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {scenes} = timeline;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 4], [0.35, 0], clamp);
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook />,
    reveal: <Reveal />,
    daynight: <DayNight />,
    demo: <Demo />,
    change: <Change />,
    offer: <Offer />,
    month: <Month />,
    cta: <Cta />,
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: H.red}} />
      {audio ? <Audio src={staticFile('feehapanel-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
