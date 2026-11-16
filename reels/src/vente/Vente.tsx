import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../feeha/Captions';
import {BEAT, Big, COND, H, LightBox, Photo, SANS, Shot, Snow, Tag, clamp, useSpr} from '../hiver/Hiver';
import timeline from './timeline.json';

// Feeha light panels, direct-response cut: "which one stopped you?" hook, the
// supper rush happening in the dark, the product, the bundle, price per month,
// urgency before the holiday rush.

/** Shows part of a portrait photo (941x1672) inside a box, centred on a point. */
const Focus = ({src, box, focus, zoom = 1.3, style}: {src: string; box: {w: number; h: number}; focus: [number, number]; zoom?: number; style?: React.CSSProperties}) => {
  const k = (box.h * zoom) / 1672;
  return (
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', width: 941 * k, height: 1672 * k, left: box.w / 2 - focus[0] * k, top: box.h / 2 - focus[1] * k, maxWidth: 'none', ...style}}
    />
  );
};

// poster centres measured on the photos (pixels of the 941x1672 originals)
const TAPE_SOIR: [number, number] = [540, 860];
const NUIT: [number, number] = [420, 760];

const Hook = ({pickAt}: {pickAt: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const picked = frame >= pickAt;
  const p = spring({frame: frame - pickAt, fps, config: {damping: 12, stiffness: 200, mass: 0.6}});
  const half = {w: 540, h: 1920};
  const zoom = interpolate(frame, [0, pickAt], [1.25, 1.35], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* A: taped paper */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, overflow: 'hidden', filter: picked ? `grayscale(${p}) brightness(${1 - 0.45 * p})` : 'none'}}>
        <Focus src="dino/tape-soir.png" box={half} focus={TAPE_SOIR} zoom={zoom} />
      </div>
      {/* B: Feeha light panel */}
      <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, overflow: 'hidden', transform: `scale(${1 + 0.04 * p})`, transformOrigin: '50% 50%'}}>
        <Focus src="dino/nuit-panneau.png" box={half} focus={NUIT} zoom={zoom} />
        <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${12 * p}px ${H.red}`}} />
      </div>
      <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: 1920, background: H.white}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.85) 17%, transparent 30%, transparent 70%, rgba(0,0,0,.7) 100%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', fontFamily: COND, lineHeight: 0.95, color: H.white, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>
        <div style={{fontSize: 110}}>LEQUEL T'A FAIT</div>
        <div style={{fontSize: 150, color: H.white}}>
          ARRÊTER<span style={{color: H.red}}> ?</span>
        </div>
      </div>
      {/* A / B markers */}
      {[0, 1].map((i) => {
        const win = i === 1;
        const s = picked ? (win ? 1 + 0.25 * p : 1 - 0.15 * p) : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 1380,
              left: i ? 540 + 270 - 75 : 270 - 75,
              width: 150,
              height: 150,
              borderRadius: 75,
              background: picked ? (win ? H.red : 'rgba(40,40,40,.85)') : 'rgba(255,255,255,.92)',
              color: picked ? H.white : H.ink,
              fontFamily: COND,
              fontSize: picked ? 110 : 100,
              lineHeight: '160px',
              textAlign: 'center',
              transform: `scale(${s})`,
              boxShadow: '0 12px 30px rgba(0,0,0,.5)',
            }}
          >
            {picked ? (win ? '✓' : '✗') : i ? 'B' : 'A'}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Dark = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames * 0.7], [15 * 60, 16 * 60 + 30], clamp);
  const hh = Math.floor(t / 60);
  const mm = Math.floor(t % 60);
  const dim = interpolate(frame, [0, durationInFrames], [0, 0.4], clamp);
  return (
    <AbsoluteFill>
      <Photo src="dino/tape-soir.png" dim={dim} from={1.05} to={1.2} tint="rgba(8,16,40,.25)" style={{transformOrigin: '57% 50%'}} />
      <Snow n={50} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,6,10,.95) 0%, rgba(5,6,10,.85) 20%, transparent 34%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: H.ice}}>QUÉBEC · HIVER</div>
        <div style={{fontFamily: COND, fontSize: 220, lineHeight: 1, color: H.white, marginTop: 6, textShadow: '0 0 40px rgba(120,170,255,.5)'}}>
          {hh} H {String(mm).padStart(2, '0')}
        </div>
        <Big size={86} delay={6}>
          ET IL FAIT DÉJÀ NOIR.
        </Big>
      </div>
    </AbsoluteFill>
  );
};

/** Opening hours: the supper rush happens after dark. */
const Rush = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const H0 = 11;
  const H1 = 21;
  const dusk = 16.5;
  const x = (h: number) => 70 + ((h - H0) / (H1 - H0)) * 940;
  const now = interpolate(frame, [4, durationInFrames - 8], [H0, H1], clamp);
  const dark = now > dusk;
  const rushOn = useSpr(18);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #161a22 0%, ${H.ink} 70%)`}}>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <Big size={104}>TON AFFICHE DISPARAÎT</Big>
        <Big size={130} delay={4} color={H.red} style={{textShadow: 'none'}}>
          PENDANT TON RUSH
        </Big>
      </div>
      {/* the day */}
      <div style={{position: 'absolute', top: 720, left: x(H0), width: x(dusk) - x(H0), height: 120, background: 'linear-gradient(90deg, #f5d27a, #f0b85a)', borderRadius: '20px 0 0 20px'}} />
      <div style={{position: 'absolute', top: 720, left: x(dusk), width: x(H1) - x(dusk), height: 120, background: 'linear-gradient(90deg, #1d2a4a, #0b1220)', borderRadius: '0 20px 20px 0', border: '2px solid #2b3a5e'}} />
      {/* the supper rush, in the dark */}
      <div
        style={{
          position: 'absolute',
          top: 700,
          left: x(17),
          width: x(20) - x(17),
          height: 160,
          border: `6px solid ${H.red}`,
          borderRadius: 14,
          background: 'rgba(164,35,37,.25)',
          opacity: rushOn,
          transform: `scale(${0.9 + 0.1 * rushOn})`,
        }}
      />
      <div style={{position: 'absolute', top: 600, left: x(17) - 40, width: x(20) - x(17) + 80, textAlign: 'center', fontFamily: COND, fontSize: 60, color: H.red, opacity: rushOn}}>RUSH DU SOUPER</div>
      {[11, 14, 16.5, 21].map((h) => (
        <div key={h} style={{position: 'absolute', top: 870, left: x(h) - 70, width: 140, textAlign: 'center', fontFamily: COND, fontSize: 46, color: h === dusk ? H.warm : H.grey}}>
          {h === 16.5 ? '16 H 30' : `${h} H`}
        </div>
      ))}
      <div style={{position: 'absolute', top: 690, left: x(now) - 4, width: 8, height: 180, background: H.white, borderRadius: 4, boxShadow: '0 0 20px #fff'}} />
      {/* the taped poster fading out */}
      <div style={{position: 'absolute', top: 990, left: 540 - 160, width: 320, height: 480, transform: 'rotate(-3deg)', opacity: dark ? 0.1 : 1, boxShadow: '0 20px 40px rgba(0,0,0,.5)'}}>
        <Img src={staticFile('dino/poster.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: -24, top: -10, width: 110, height: 34, background: 'rgba(235,220,170,.85)', transform: 'rotate(-28deg)'}} />
        <div style={{position: 'absolute', right: -24, top: -10, width: 110, height: 34, background: 'rgba(235,220,170,.85)', transform: 'rotate(28deg)'}} />
      </div>
    </AbsoluteFill>
  );
};

const Solution = () => (
  <AbsoluteFill>
    <Photo src="dino/nuit-panneau.png" from={1.02} to={1.14} style={{transformOrigin: '45% 45%'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,6,10,.9) 0%, rgba(5,6,10,.7) 18%, transparent 32%)'}} />
    <div style={{position: 'absolute', top: 130, left: 0, right: 0}}>
      <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: H.warm}}>PANNEAU LUMINEUX FEEHA</div>
      <Big size={110} delay={4}>
        TON OFFRE BRILLE
      </Big>
      <Big size={110} delay={8} color={H.warm}>
        TOUTE LA SOIRÉE
      </Big>
    </div>
  </AbsoluteFill>
);

/** The four insertion photos, aligned on the panel frame; hard cuts, no ghosting. */
const Insert = ({lightAt}: {lightAt: number}) => {
  const frame = useCurrentFrame();
  const step = frame < 7 ? 'empty' : frame < Math.max(14, lightAt - 10) ? 'slide' : frame < lightAt ? 'inOff' : 'lit';
  const cuts = [7, Math.max(14, lightAt - 10), lightAt];
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 4], [0.35, 0], clamp);
  const flick = [1, 0.3, 1, 0.6, 1];
  const litOpacity = step === 'lit' && frame - lightAt < 10 ? flick[Math.floor((frame - lightAt) / 2)] ?? 1 : 1;
  const push = interpolate(frame, [0, 70], [1, 1.05], clamp);
  return (
    <AbsoluteFill style={{background: '#bdbab4', overflow: 'hidden'}}>
      <Img src={staticFile('dino/empty.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px)', transform: 'scale(1.3)'}} />
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '540px 900px'}}>
        {step === 'lit' ? (
          <>
            <Shot k="inOff" opacity={1} />
            <Shot k="lit" opacity={litOpacity} />
          </>
        ) : (
          <Shot k={step} opacity={1} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 22%)'}} />
      <div style={{position: 'absolute', top: 140, left: 0, right: 0}}>
        <Big size={110}>{frame >= lightAt ? "C'EST TOUT." : 'GLISSE TON POSTER'}</Big>
      </div>
    </AbsoluteFill>
  );
};

const Swap = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const swap = spring({frame: frame - 12, fps, config: {damping: 16, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #2a2420 0%, ${H.ink} 70%)`}}>
      <LightBox swap={swap} scale={0.85} />
      <div style={{position: 'absolute', top: 140, left: 0, right: 0}}>
        <Big size={104}>CHANGE TA PROMO</Big>
        <Big size={104} delay={4} color={H.warm}>
          EN QUELQUES SECONDES
        </Big>
      </div>
    </AbsoluteFill>
  );
};

const ITEMS = ['2 PANNEAUX LUMINEUX', 'POSTERS IMPRIMÉS', 'KIT DE SUSPENSION', 'TUTORIEL PAS À PAS'];

const Bundle = ({itemAt}: {itemAt: number[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: H.paper}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 900, overflow: 'hidden'}}>
        <Img src={staticFile('dino/bundle.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', transform: `scale(${interpolate(frame, [0, 140], [1.05, 1.15], clamp)})`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,15,18,.92) 0%, rgba(120,15,18,.55) 28%, transparent 50%, transparent 80%, rgba(244,242,238,1) 100%)'}} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0}}>
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: H.warm}}>EN CE MOMENT</div>
        <Big size={150}>OFFRE GROUPÉE</Big>
      </div>
      <div style={{position: 'absolute', top: 930, left: 80, right: 60, display: 'flex', flexDirection: 'column', gap: 26}}>
        {ITEMS.map((it, i) => {
          const p = spring({frame: frame - itemAt[i], fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
          return (
            <div key={it} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: frame < itemAt[i] ? 0.15 : 1, transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`}}>
              <div style={{width: 96, height: 96, borderRadius: 48, background: H.red, color: H.white, fontFamily: SANS, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${frame < itemAt[i] ? 0.6 : p})`}}>✓</div>
              <div style={{fontFamily: COND, fontSize: 80, color: H.ink, lineHeight: 1}}>{it}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Install = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 24], [0, 0.95], clamp);
  const badge = useSpr(0, {damping: 12, stiffness: 220, mass: 0.6});
  return (
    <AbsoluteFill>
      <Photo src="dino/install.png" from={1.02} to={1.12} style={{transformOrigin: '50% 40%'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(5,6,10,.85) 75%)'}} />
      <div style={{position: 'absolute', top: 1270, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${badge * 0.76})`, transformOrigin: '50% 0%'}}>
        <div style={{position: 'relative', width: 420, height: 420, borderRadius: 210, background: 'rgba(255,255,255,.94)', boxShadow: '0 30px 60px rgba(0,0,0,.45)'}}>
          <svg width="420" height="420" viewBox="-110 -110 220 220" style={{position: 'absolute', inset: 0}}>
            <circle r="96" fill="none" stroke="#e0dcd6" strokeWidth="12" />
            <circle r="96" fill="none" stroke={H.red} strokeWidth="12" strokeDasharray={`${sweep * 603} 603`} transform="rotate(-90)" strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 180, lineHeight: 1, color: H.ink}}>&lt;10</div>
          <div style={{position: 'absolute', top: 245, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 64, color: H.red}}>MINUTES</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1600, left: 0, right: 0}}>
        <Big size={84}>À INSTALLER</Big>
      </div>
    </AbsoluteFill>
  );
};

const Price = () => {
  const p = useSpr(0, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 520, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: H.warm}}>2 PANNEAUX · TOUT INCLUS</div>
      <div style={{position: 'absolute', top: 600, fontFamily: COND, fontSize: 380, lineHeight: 1, color: H.white, transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`, opacity: Math.min(1, p * 2)}}>599 $</div>
    </AbsoluteFill>
  );
};

/** 599 $ over 7 years = 7,13 $ a month. */
const Month = ({at}: {at: number}) => {
  const frame = useCurrentFrame();
  const show = frame >= at;
  const p = useSpr(at, {damping: 10, stiffness: 240, mass: 0.6});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 360, fontFamily: COND, fontSize: 120, color: H.white, opacity: 0.85}}>599 $ ÷ 7 ANS</div>
      <div style={{position: 'absolute', top: 520, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: H.warm}}>ÇA REVIENT À</div>
      <div style={{position: 'absolute', top: 590, display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: COND, color: H.white, opacity: show ? 1 : 0, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`}}>
        <span style={{fontSize: 140}}>MOINS DE</span>
        <span style={{fontSize: 320, lineHeight: 1}}>8 $</span>
      </div>
      <div style={{position: 'absolute', top: 930, fontFamily: COND, fontSize: 120, color: H.ink, opacity: show ? 1 : 0}}>PAR MOIS</div>
    </AbsoluteFill>
  );
};

const Trio = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 13, stiffness: 200}});
  const b = spring({frame: frame - 6, fps, config: {damping: 13, stiffness: 200}});
  return (
    <AbsoluteFill style={{background: H.paper, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 120}}>
        <Big size={120} color={H.ink} style={{textShadow: 'none'}}>
          MOINS CHER
        </Big>
        <Big size={120} delay={3} color={H.red} style={{textShadow: 'none'}}>
          QU'UN TRIO BURGER
        </Big>
      </div>
      <div style={{position: 'absolute', top: 480, left: 60, width: 440, textAlign: 'center', transform: `translateY(${(1 - a) * 300}px)`, opacity: a}}>
        <div style={{width: 360, height: 540, margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,.25)', overflow: 'hidden', borderRadius: 8}}>
          <Img src={staticFile('dino/poster.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div style={{fontFamily: COND, fontSize: 64, color: H.grey, marginTop: 24}}>1 TRIO BURGER</div>
        <div style={{fontFamily: COND, fontSize: 110, color: H.ink, lineHeight: 1}}>12,99 $</div>
      </div>
      <div style={{position: 'absolute', top: 480, left: 580, width: 440, textAlign: 'center', transform: `translateY(${(1 - b) * 300}px)`, opacity: b}}>
        <div style={{position: 'relative', width: 360, height: 540, margin: '0 auto'}}>
          <div style={{position: 'absolute', inset: 0, background: '#0d0d0d', padding: 12, boxShadow: '0 20px 40px rgba(0,0,0,.25), 0 0 80px rgba(255,233,194,.9)', borderRadius: 6}}>
            <Img src={staticFile('dino/poster.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
        <div style={{fontFamily: COND, fontSize: 64, color: H.red, marginTop: 24}}>TON PANNEAU FEEHA</div>
        <div style={{fontFamily: COND, fontSize: 110, color: H.red, lineHeight: 1}}>&lt; 8 $ / MOIS</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const beat = interpolate(frame % BEAT, [0, 3, BEAT], [1.04, 1.015, 1]);
  const logo = useSpr(0, {damping: 13, stiffness: 160, mass: 0.7});
  return (
    <AbsoluteFill style={{background: H.red, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 200, transform: `scale(${logo})`, background: H.white, padding: 10, borderRadius: 30, boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 560, display: 'block', borderRadius: 22}} />
      </div>
      <div style={{position: 'absolute', top: 600}}>
        <Big size={96} delay={4}>
          INSTALLE-LES AVANT
        </Big>
        <Big size={130} delay={8} color={H.ink} style={{textShadow: 'none'}}>
          LE RUSH DES FÊTES
        </Big>
      </div>
      <div style={{position: 'absolute', top: 960, transform: `scale(${beat})`}}>
        <Tag delay={12} bg={H.white} color={H.red} rotate={-2} size={110}>
          FEEHAPANELS.COM
        </Tag>
      </div>
      <div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: H.white, opacity: interpolate(frame, [16, 26], [0, 1], clamp)}}>
        OFFRES GROUPÉES DÈS 599 $
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ----------------------------------------------------------------
export const Vente = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {scenes, words} = timeline;
  const scene = (id: string) => scenes.find((s) => s.id === id)!;
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 5], [0.3, 0], clamp);
  const at = (id: string, w: string, nth = 0) => {
    const s = scene(id);
    const hits = words.filter((x) => x.text.toLowerCase().startsWith(w) && x.start * fps >= s.from - 4 && x.start * fps < s.to);
    const hit = hits[Math.min(nth, hits.length - 1)];
    return hit ? Math.max(0, Math.round(hit.start * fps) - s.from) : 10;
  };
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook pickAt={at('hook', 'exactement')} />,
    dark: <Dark />,
    rush: <Rush />,
    solution: <Solution />,
    insert: <Insert lightAt={at('insert', "c'est")} />,
    swap: <Swap />,
    bundle: <Bundle itemAt={[at('bundle', 'deux'), at('bundle', 'posters'), at('bundle', 'kit'), at('bundle', 'tutoriel')]} />,
    install: <Install />,
    price: <Price />,
    month: <Month at={at('month', 'moins')} />,
    trio: <Trio />,
    cta: <Cta />,
  };
  const noCaptions = (f: number) => f < scene('dark').from || (f >= scene('install').from && f < scene('install').to) || f >= scene('price').from;
  return (
    <AbsoluteFill style={{background: H.ink}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          {SCENES[s.id]}
        </Sequence>
      ))}
      <Captions words={words} top={1560} accent={H.red} edge={H.deep} font={{fontFamily: COND, letterSpacing: 1}} hidden={noCaptions} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: H.white, opacity: 0.85}} />
      {audio ? <Audio src={staticFile('vente-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
