import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import tl from './timeline.json';

// « Follow the Arches » — psychological-thriller Reel for Feeha (≈ 80 s, 1080×1920, 30 fps).
// Real campaign photos (supplied by Said) in public/arches/photo2x-*, face-*, fragment.png — never redrawn.
// Lemo clip public/arches/toronto.mp4 (source scripts/arches/lemo-toronto):
//   aerial 0–3.2 · POV 3.2–8.2 · mirror 8.2–9.8 · ground 9.8–11.2 · arch road 11.2–14.2 · arrival 14.2–17.2 ; frozen POV frame at 7.2.
// Kome = real Feeha branding project; its supports are rebuilt here from the brand codes so the name can be removed cleanly.
const FPS = 30;
const L = tl.lines as Record<string, number>;
const D = tl.lineDur as Record<string, number>;
export const ARCHES_FRAMES = Math.round(tl.dur * FPS);
const RED = '#E11D2E';
const ANTON = '"Anton", sans-serif';
const MONT = '"Montserrat", sans-serif';
const KG = '#12523A', KP = '#F89C9F', KC = '#F7EFE4';
const FREEZE_CLIP = 7.2;
const fr = (s: number) => Math.round(s * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const useT = () => useCurrentFrame() / FPS;

// ---------- key moments (all derived from the narration) ----------
const T = {
  frag: L.h02 - 0.15,
  city: L.a05 - 0.25,
  pov: L.a05 + 2.2,
  mirror: L.a06,
  ground: L.a06 + 1.35,
  boards: L.a07,
  pov2: L.a08,
  freeze: L.a08 + D.a08 - 0.05,
  rewind: L.b01 + 0.15,
  agency: L.b02 - 0.2,
  question: L.b03,
  logo: L.b04,
  cut: L.b05,
  remove: L.b06,
  match: L.b07 + 0.3,
  resume: L.b07 + 2.0,
  award: L.b08,
  tension: L.c01,
  toi: L.c02,
  back: L.c02 + 1.05,
  codes: L.c04,
  kome: L.d01,
  noname: L.d02,
  feeha: L.d04,
  end: tl.dur,
};

// ---------- small pieces ----------
const Grain = ({o = 0.07}: {o?: number}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: o, backgroundImage: `repeating-linear-gradient(${(f * 47) % 180}deg, rgba(255,255,255,.7) 0 1px, transparent 1px 3px)`, mixBlendMode: 'overlay', pointerEvents: 'none'}} />;
};
const Vignette = ({a = 0.6}: {a?: number}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${a}) 100%)`, pointerEvents: 'none'}} />;
const Label = ({text, at, top = 170, color = '#fff', bg = 'rgba(0,0,0,.55)'}: {text: string; at: number; top?: number; color?: string; bg?: string}) => {
  const t = useT();
  const p = clamp((t - at) / 0.35);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
      <span style={{fontFamily: MONT, fontWeight: 800, fontSize: 32, letterSpacing: 8, color, background: bg, padding: '12px 26px', borderRadius: 6}}>{text}</span>
    </div>
  );
};
// the Lemo clip, a window of it starting at clip second `from`, placed at film second `at`
const Clip = ({src = 'arches/toronto.mp4', at, from, dur, zoom = [1, 1.06], filter}: {src?: string; at: number; from: number; dur: number; zoom?: number[]; filter?: string}) => {
  const t = useT();
  if (t < at || t >= at + dur) return null;
  const z = lin(t, at, at + dur, zoom[0], zoom[1]);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, filter}}>
      <Sequence from={fr(at)} layout="none"><OffthreadVideo src={staticFile(src)} startFrom={fr(from)} muted style={{width: 1080, height: 1920}} /></Sequence>
    </AbsoluteFill>
  );
};
const FrozenPOV = ({filter}: {filter?: string}) => (
  <Freeze frame={fr(FREEZE_CLIP)}><AbsoluteFill style={{filter}}><OffthreadVideo src={staticFile('arches/toronto.mp4')} muted style={{width: 1080, height: 1920}} /></AbsoluteFill></Freeze>
);
// the hook: the four real boards slam in, then the prize
const Hook = () => {
  const t = useT();
  const ph = ['photo2x-left', 'photo2x-missed', 'photo2x-right', 'photo2x-exit'];
  const prize = clamp((t - 2.3) / 0.35);
  return (
    <AbsoluteFill style={{background: '#08080B'}}>
      <div style={{position: 'absolute', left: 20, top: 300, width: 1040, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, transform: `scale(${1 + 0.05 * (t / 4)})`}}>
        {ph.map((p, i) => {
          const k = clamp((t - 0.15 - i * 0.28) / 0.18);
          return <div key={p} style={{opacity: k, transform: `scale(${1.25 - 0.25 * k})`}}><Img src={staticFile(`arches/${p}.png`)} style={{width: '100%', display: 'block'}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 920, left: 0, right: 0, textAlign: 'center', opacity: prize, transform: `scale(${1.3 - 0.3 * prize})`}}>
        <div style={{fontFamily: ANTON, fontSize: 120, color: '#F4D27A', letterSpacing: 4, lineHeight: 1}}>GRAND PRIX</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 42, color: '#fff', letterSpacing: 8, marginTop: 14}}>CANNES LIONS · 2018</div>
      </div>
      <Vignette a={0.6} />
    </AbsoluteFill>
  );
};
// the first image: a fragment of a real board, floating in the dark
const Fragment = ({at, annotate = -1}: {at: number; annotate?: number}) => {
  const t = useT();
  const k = clamp((t - at) / 2.4);
  const tilt = Math.sin(t * 0.4) * 3;
  const ann = annotate > 0 ? clamp((t - annotate) / 0.4) : 0;
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', perspective: 1400}}>
      <div style={{position: 'relative', width: 860, height: 696, transform: `rotateY(${tilt}deg) rotateX(${-tilt * 0.4}deg) scale(${0.94 + 0.06 * ease(k)})`, opacity: ease(k), boxShadow: '0 40px 120px rgba(225,29,46,.25)'}}>
        <Img src={staticFile('arches/fragment.png')} style={{width: 860, height: 696, objectFit: 'cover', filter: 'contrast(1.06) saturate(1.05)'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${100 + t * 12}deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.12) 50%, rgba(255,255,255,0) 60%)`}} />
        {ann > 0 ? (
          <>
            <div style={{position: 'absolute', left: 520, top: 220, width: 260, height: 260, borderRadius: 999, border: '5px solid #fff', opacity: ann}} />
            <div style={{position: 'absolute', left: 560, top: 500, fontFamily: MONT, fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: 6, opacity: ann, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>ROUGE</div>
            <div style={{position: 'absolute', left: 20, top: 40, width: 330, height: 620, borderRadius: 999, border: '5px solid #fff', opacity: clamp((t - annotate - 0.6) / 0.4)}} />
            <div style={{position: 'absolute', left: 30, top: 720, fontFamily: MONT, fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: 6, opacity: clamp((t - annotate - 0.6) / 0.4)}}>JAUNE · UNE COURBE</div>
          </>
        ) : null}
      </div>
      <Vignette a={0.8} />
    </AbsoluteFill>
  );
};
// a real campaign photo, full width, in the rain
const Board = ({src, at, dur}: {src: string; at: number; dur: number}) => {
  const t = useT();
  if (t < at || t >= at + dur) return null;
  const k = (t - at) / dur;
  return (
    <AbsoluteFill style={{background: '#05060A', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={staticFile(src)} style={{width: 1080 * 1.35, transform: `scale(${1.05 + 0.08 * k}) translateX(${(0.5 - k) * 40}px)`, filter: 'brightness(.72) contrast(1.1) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #05060A 0%, rgba(5,6,10,0) 30%, rgba(5,6,10,0) 70%, #05060A 100%)'}} />
      <Rain />
    </AbsoluteFill>
  );
};
const Rain = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 70}).map((_, i) => {
        const x = (i * 157) % 1080, y = ((i * 263 + t * 2200) % 2100) - 100;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 2, height: 60 + (i % 4) * 20, background: 'rgba(200,215,240,.35)', transform: 'rotate(6deg)'}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- the agency ----------
const Desk = ({children}: {children?: React.ReactNode}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3A2A20 0%, #120C09 75%)'}}>
    <AbsoluteFill style={{opacity: 0.25, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,.4) 0 2px, transparent 2px 120px)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 25%, rgba(255,214,160,.28), rgba(0,0,0,0) 45%)'}} />
    {children}
  </AbsoluteFill>
);
const Paper = ({at, x, y, w, h, rot, children, bg = '#F3EEE4'}: {at: number; x: number; y: number; w: number; h: number; rot: number; children?: React.ReactNode; bg?: string}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - fr(at), fps: FPS, config: {damping: 16, stiffness: 110}});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: bg, borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,.55)', transform: `translateY(${(1 - p) * 900}px) rotate(${rot + (1 - p) * 12}deg)`, padding: 34, boxSizing: 'border-box', overflow: 'hidden'}}>
      {children}
    </div>
  );
};
const Lines = ({n, color = 'rgba(30,30,30,.25)'}: {n: number; color?: string}) => <>{Array.from({length: n}).map((_, i) => <div key={i} style={{height: 12, width: `${55 + ((i * 37) % 40)}%`, background: color, borderRadius: 6, marginBottom: 18}} />)}</>;
const Agency = () => {
  const t = useT();
  const q = 'Jusqu’où peut-on effacer une marque avant que les gens cessent de la reconnaître ?';
  const typed = q.slice(0, Math.floor(clamp((t - T.question - 0.1) / (D.b03 * 0.9)) * q.length));
  return (
    <Desk>
      <Paper at={T.agency} x={110} y={330} w={560} h={720} rot={-6}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 46, letterSpacing: 6, marginBottom: 30, color: '#1A1A1A'}}>BRIEF</div>
        <Lines n={10} />
      </Paper>
      <Paper at={T.agency + 0.35} x={520} y={520} w={420} h={520} rot={5}>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 30, color: '#1A1A1A', marginBottom: 24}}>SIGNALISATION ROUTIÈRE</div>
        <svg width="350" height="300"><path d="M20 280 C 60 40, 290 40, 330 280" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeDasharray="10 12" /><path d="M175 280 L175 120 M140 150 L175 110 L210 150" stroke={RED} strokeWidth="7" fill="none" /></svg>
      </Paper>
      <Paper at={T.agency + 0.7} x={180} y={1060} w={300} h={300} rot={-3} bg="#FFE98A">
        <div style={{fontFamily: '"Comic Sans MS", cursive', fontSize: 40, color: '#333', lineHeight: 1.2}}>moins de logo ?<br />+ de reconnaissance ?</div>
      </Paper>
      {t >= T.question ? (
        <Paper at={T.question} x={70} y={1180} w={940} h={420} rot={1} bg="#FBF8F2">
          <div style={{fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: '#111'}}>{typed}<span style={{opacity: Math.floor(t * 3) % 2}}>▍</span></div>
          <div style={{position: 'absolute', right: 30, bottom: 22, fontFamily: MONT, fontWeight: 700, fontSize: 24, color: '#888', letterSpacing: 3}}>INTERPRÉTATION DU CONCEPT</div>
        </Paper>
      ) : null}
      <Vignette a={0.5} />
    </Desk>
  );
};
// the real board, printed, then cut into strips: only the one with the arch stays
const Cut = () => {
  const t = useT();
  const strips = 5;
  const cutK = clamp((t - T.cut) / 0.6), rem = ease(clamp((t - T.remove) / 0.8)), zoom = ease(clamp((t - T.match + 0.6) / 0.6));
  return (
    <Desk>
      <div style={{position: 'absolute', left: 60, top: 640, width: 960, height: 454, transform: `scale(${1 + zoom * 1.2})`, transformOrigin: '78% 60%'}}>
        {Array.from({length: strips}).map((_, i) => {
          const keep = i === 3 || i === 4;
          const dx = (i - 2) * 26 * cutK;
          const gone = keep ? 0 : rem;
          return (
            <div key={i} style={{position: 'absolute', left: (960 / strips) * i, top: 0, width: 960 / strips, height: 454, overflow: 'hidden', transform: `translate(${dx + gone * (i < 2 ? -900 : 900) * (i % 2 ? 1 : -1)}px, ${gone * (i % 2 ? -700 : 700)}px) rotate(${gone * (i - 2) * 20}deg)`, opacity: 1 - gone * 0.6, boxShadow: '0 20px 40px rgba(0,0,0,.5)'}}>
              <Img src={staticFile('arches/face-missed.png')} style={{position: 'absolute', left: -(960 / strips) * i, top: 0, width: 960, height: 454}} />
            </div>
          );
        })}
        {cutK > 0 && cutK < 1 ? Array.from({length: strips - 1}).map((_, i) => <div key={i} style={{position: 'absolute', left: (960 / strips) * (i + 1) - 2, top: 0, width: 4, height: 454 * cutK, background: '#fff'}} />) : null}
      </div>
      <Vignette a={0.5} />
    </Desk>
  );
};
// match cut: the curve of the arch becomes the road
const Match = () => {
  const t = useT();
  const k = ease(clamp((t - T.match) / 0.7));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Clip at={T.match} from={11.2} dur={T.resume - T.match} zoom={[1.15, 1]} />
      <AbsoluteFill style={{opacity: 1 - k}}>
        <Img src={staticFile('arches/face-missed.png')} style={{position: 'absolute', left: -980, top: 520, width: 2300, transform: `scale(${1 + k * 0.3})`}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Award = () => {
  const t = useT();
  const push = 1 + 0.12 * ease(clamp((t - T.tension) / (T.toi - T.tension)));
  const ph = ['photo2x-left', 'photo2x-missed', 'photo2x-right', 'photo2x-exit'];
  return (
    <AbsoluteFill style={{background: '#0A0A0D'}}>
      <div style={{position: 'absolute', left: 30, top: 420, width: 1020, transform: `scale(${push})`, transformOrigin: '50% 40%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        {ph.map((p, i) => (
          <div key={p} style={{opacity: clamp((t - T.award - i * 0.18) / 0.3), transform: `translateY(${(1 - clamp((t - T.award - i * 0.18) / 0.3)) * 30}px)`}}>
            <Img src={staticFile(`arches/${p}.png`)} style={{width: '100%', display: 'block'}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1000, left: 0, right: 0, textAlign: 'center', opacity: clamp((t - T.award - 1.0) / 0.4)}}>
        <div style={{fontFamily: ANTON, fontSize: 92, color: '#F4D27A', letterSpacing: 4, lineHeight: 1.05}}>GRAND PRIX OUTDOOR</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: 8, marginTop: 10}}>CANNES LIONS · 2018</div>
        <div style={{fontFamily: MONT, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,.6)', letterSpacing: 4, marginTop: 18}}>« FOLLOW THE ARCHES » · COSSETTE, TORONTO</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: lin(t, T.toi - 0.4, T.toi, 0, 1)}} />
      <Vignette a={0.6} />
    </AbsoluteFill>
  );
};
// repetition: the same fragment, again and again
const Codes = () => {
  const t = useT();
  const n = Math.floor(lin(t, T.codes, T.codes + 3.2, 1, 48));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 40, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, alignContent: 'center'}}>
        {Array.from({length: 48}).map((_, i) => (
          <div key={i} style={{aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8, opacity: i < n ? 1 : 0, transform: `scale(${i < n ? 1 : 0.6})`}}>
            <Img src={staticFile('arches/fragment.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: i % 7 === 3 ? 'saturate(0)' : 'none'}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 110, color: '#fff', opacity: clamp((t - T.codes - 1.2) / 0.4), textShadow: '0 10px 40px #000'}}>
        × {Math.max(1, Math.floor(lin(t, T.codes + 1.2, T.codes + 4.5, 1, 10000))).toLocaleString('fr-CA')}
      </div>
      <Vignette a={0.7} />
    </AbsoluteFill>
  );
};
// ---------- Komé (real Feeha project) ----------
const KomeReal = () => {
  const t = useT();
  const list = ['kome1', 'kome3', 'kome2', 'kome5', 'kome4'];
  const per = (T.noname - T.kome) / list.length;
  const i = Math.min(list.length - 1, Math.floor((t - T.kome) / per));
  const k = ((t - T.kome) % per) / per;
  return (
    <AbsoluteFill style={{background: KC}}>
      <Img src={staticFile(`brand/${list[i]}.jpg`)} style={{position: 'absolute', top: 285, left: 0, width: 1080, height: 1350, objectFit: 'cover', transform: `scale(${1.02 + 0.05 * k})`}} />
      <Label text="PROJET FEEHA · KOMÉ" at={T.kome} top={150} color={KC} bg={KG} />
    </AbsoluteFill>
  );
};
const Arcs = ({w, h, color, n = 6}: {w: number; h: number; color: string; n?: number}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, bottom: 0}}>
    {Array.from({length: n}).map((_, i) => <path key={i} d={`M ${i * (w / n) + 6} ${h} a ${w / n / 2 - 6} ${w / n / 2 - 6} 0 0 1 ${w / n - 12} 0`} stroke={color} strokeWidth={14} fill="none" />)}
  </svg>
);
const Name = ({w, color, fade}: {w: number; color: string; fade: number}) => (
  <div style={{width: w, height: w * 0.4667, background: color, WebkitMaskImage: `url(${staticFile('arches/kome-logo-white.png')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', opacity: 1 - fade, filter: `blur(${fade * 12}px)`, transform: `scale(${1 + fade * 0.15})`}} />
);
const KomeCodes = () => {
  const t = useT();
  const fadeAt = (d: number) => ease(clamp((t - (L.d02 + d)) / 0.6));
  const sign = fadeAt(0.9), menu = fadeAt(1.9), pack = fadeAt(2.9);
  const remains = clamp((t - L.d03) / 0.4);
  return (
    <AbsoluteFill style={{background: KC}}>
      {/* sign */}
      <div style={{position: 'absolute', left: 90, top: 300, width: 900, height: 300, background: KG, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,82,58,.35)'}}>
        <Arcs w={900} h={70} color={KP} n={9} />
        <Name w={520} color={KC} fade={sign} />
      </div>
      {/* menu */}
      <div style={{position: 'absolute', left: 90, top: 680, width: 420, height: 640, background: '#FFFBF5', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,.15)'}}>
        <div style={{height: 150, background: KG, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Name w={300} color={KC} fade={menu} /></div>
        <div style={{padding: 34}}>{Array.from({length: 7}).map((_, i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 26}}><div style={{height: 14, width: `${50 + ((i * 23) % 30)}%`, background: 'rgba(18,82,58,.55)', borderRadius: 7}} /><div style={{height: 14, width: 50, background: KP, borderRadius: 7}} /></div>)}</div>
        <Arcs w={420} h={80} color={KP} n={4} />
      </div>
      {/* box */}
      <div style={{position: 'absolute', left: 560, top: 680, width: 430, height: 300, background: KG, borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 50px rgba(18,82,58,.3)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: KP}} />
        <Name w={260} color={KC} fade={pack} />
      </div>
      {/* bag */}
      <div style={{position: 'absolute', left: 620, top: 1020, width: 310, height: 300, background: KG, borderRadius: '10px 10px 18px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 24px 50px rgba(18,82,58,.3)'}}>
        <div style={{position: 'absolute', top: -60, left: 90, width: 130, height: 120, border: `12px solid ${KP}`, borderRadius: 999}} />
        <Arcs w={310} h={60} color={KP} n={4} />
        <Name w={200} color={KC} fade={pack} />
      </div>
      {remains > 0 ? (
        <div style={{position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, opacity: remains}}>
          {[KG, KP, KC].map((c) => <div key={c} style={{width: 90, height: 90, borderRadius: 999, background: c, border: '4px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,.2)'}} />)}
          <svg width="120" height="90"><path d="M 14 86 a 46 46 0 0 1 92 0" stroke={KG} strokeWidth="16" fill="none" /></svg>
        </div>
      ) : null}
      <Label text="SANS LE NOM" at={L.d02 + 0.9} top={150} color={KC} bg={KG} />
    </AbsoluteFill>
  );
};
const FeehaEnd = () => {
  const t = useT();
  const p = clamp((t - T.feeha) / 0.6), s = clamp((t - L.d05) / 0.6), u = clamp((t - L.d05 - 1.4) / 0.5);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2A0A0E 0%, #050406 70%)', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 560, background: '#fff', borderRadius: 28, padding: '26px 30px', opacity: p, transform: `scale(${0.92 + 0.08 * ease(p)})`}}>
        <Img src={staticFile('feeha/logo-clean.png')} style={{width: 520, display: 'block'}} />
      </div>
      <div style={{position: 'absolute', top: 980, left: 0, right: 0, textAlign: 'center', opacity: s, transform: `translateY(${(1 - s) * 20}px)`}}>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 58, color: '#fff', lineHeight: 1.2}}>Une identité<br />qu’on reconnaît.</div>
      </div>
      <div style={{position: 'absolute', top: 1220, left: 0, right: 0, textAlign: 'center', opacity: u, fontFamily: MONT, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: RED}}>FEEHA.CA</div>
    </AbsoluteFill>
  );
};

// ---------- captions: cinematic, word by word ----------
type Wd = {text: string; start: number; end: number; line: string};
const WORDS = tl.words as Wd[];
const CHUNKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    if (cur.length >= 4 || /[.,?!…]$/.test(w.text) || !next || next.line !== w.line) { out.push(cur); cur = []; }
  });
  return out;
})();
const NO_CAPS = (t: number) => (t >= T.question && t < T.logo) || t >= T.feeha + 0.2 || (t >= T.toi && t < T.back);
const Captions = () => {
  const t = useT();
  if (NO_CAPS(t)) return null;
  const c = CHUNKS.find((ch, i) => t >= ch[0].start - 0.05 && t < Math.min((CHUNKS[i + 1]?.[0].start ?? 999) - 0.03, ch[ch.length - 1].end + 0.6));
  if (!c) return null;
  const light = t >= T.kome && t < T.feeha;
  return (
    <div style={{position: 'absolute', top: 1520, left: 70, right: 170, textAlign: 'center'}}>
      {c.map((w, i) => {
        const on = t >= w.start, now = on && t < w.end + 0.08;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 9px', fontFamily: MONT, fontWeight: 800, fontSize: 54, lineHeight: 1.3, color: light ? (on ? KG : 'rgba(18,82,58,.35)') : on ? '#fff' : 'rgba(255,255,255,.35)', textShadow: light ? 'none' : '0 4px 18px rgba(0,0,0,.9)', borderBottom: now ? `5px solid ${light ? KP : RED}` : '5px solid transparent', transform: `translateY(${on ? 0 : 6}px)`}}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------- the film ----------
export const FeehaArches = ({audio}: {audio: boolean}) => {
  const t = useT();
  let scene: React.ReactNode = null;
  if (t < T.frag) scene = <Hook />;
  else if (t < T.city) scene = <Fragment at={T.frag} />;
  else if (t < T.pov) scene = <><Clip at={T.city} from={0} dur={T.pov - T.city} zoom={[1.08, 1]} /><Label text="TORONTO · 2018" at={T.city + 0.3} /></>;
  else if (t < T.mirror) scene = <Clip at={T.pov} from={3.2} dur={T.mirror - T.pov} zoom={[1, 1.05]} />;
  else if (t < T.ground) scene = <Clip at={T.mirror} from={8.2} dur={T.ground - T.mirror} zoom={[1.04, 1.1]} />;
  else if (t < T.boards) scene = <Clip at={T.ground} from={9.8} dur={T.boards - T.ground} zoom={[1, 1.04]} />;
  else if (t < T.pov2) {
    const per = (T.pov2 - T.boards) / 4;
    scene = <>{['photo2x-left', 'photo2x-right', 'photo2x-missed', 'photo2x-exit'].map((p, i) => <Board key={p} src={`arches/${p}.png`} at={T.boards + i * per} dur={per} />)}</>;
  } else if (t < T.freeze) scene = <Clip at={T.pov2} from={FREEZE_CLIP - (T.freeze - T.pov2)} dur={T.freeze - T.pov2} zoom={[1, 1.03]} />;
  else if (t < T.rewind) scene = <FrozenPOV filter={`saturate(${lin(t, T.freeze, T.freeze + 0.3, 1, 0.75)}) contrast(1.08)`} />;
  else if (t < T.agency) scene = <><Clip src="arches/pov-rewind.mp4" at={T.rewind} from={0} dur={T.agency - T.rewind} zoom={[1, 1.1]} filter="saturate(.6) contrast(1.1)" /><Label text="RETOUR EN ARRIÈRE" at={T.rewind + 0.2} /></>;
  else if (t < T.logo) scene = <Agency />;
  else if (t < T.match) scene = <Cut />;
  else if (t < T.resume) scene = <Match />;
  else if (t < T.award) scene = t < T.resume + 0.5 ? <FrozenPOV /> : <Clip at={T.resume + 0.5} from={14.2} dur={T.award - T.resume - 0.5} zoom={[1, 1.04]} />;
  else if (t < T.toi) scene = <Award />;
  else if (t < T.back) scene = (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: ANTON, fontSize: 200, color: '#fff', opacity: clamp((t - T.toi - 0.15) / 0.2), letterSpacing: 6}}>C’EST TOI.</div>
    </AbsoluteFill>
  );
  else if (t < T.codes) scene = <Fragment at={T.back - 0.3} annotate={L.c03 + 1.4} />;
  else if (t < T.kome) scene = <Codes />;
  else if (t < T.noname) scene = <KomeReal />;
  else if (t < T.feeha) scene = <KomeCodes />;
  else scene = <FeehaEnd />;

  // the rewind: tape lines and colour split
  const rw = t >= T.rewind && t < T.rewind + 0.5 ? Math.sin(Math.PI * (t - T.rewind) / 0.5) : 0;
  const dark = t < T.kome || t >= T.feeha;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scene}
      {dark ? <Grain o={0.06} /> : null}
      {rw > 0 ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: (i * 397 + t * 5200) % 1920, height: 30, background: 'rgba(255,255,255,.4)', opacity: rw}} />)}
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,0,60,.2), rgba(0,200,255,.2))', opacity: rw, mixBlendMode: 'screen'}} />
        </AbsoluteFill>
      ) : null}
      <Captions />
      {audio ? <Audio src={staticFile('arches-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
