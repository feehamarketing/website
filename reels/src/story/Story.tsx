import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, Bubble, Burger, COND, LOOKS, Look, Panel, Person, Pizza, Poster, SANS, clampI, lerpColor} from '../anim/Art';
import timeline from './timeline.json';

// "Histoire vraie" ad: a Saint-Denis restaurant goes from 40 to 100+ orders a
// day after Feeha redoes its signage, menus, panels, polos and delivery page.
// Everything is drawn (no client photos yet). Text stays between y≈110 and 1500.

const sp = (f: number, d: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {damping: 12, stiffness: 170}) =>
  spring({frame: f - d, fps: 30, config: cfg});
const POP = {damping: 9, stiffness: 240, mass: 0.6};
const STAFF: Look = {coat: A.red, hat: '#141317', skin: '#C68A5E', pants: '#22252C'};
const STAFF2: Look = {coat: A.red, hat: '#141317', skin: '#EBC09A', pants: '#22252C', tall: 0.95};

const Line = ({children, d = 0, size = 110, color = A.white, style}: {children: React.ReactNode; d?: number; size?: number; color?: string; style?: React.CSSProperties}) => {
  const f = useCurrentFrame();
  const p = sp(f, d);
  return (
    <div style={{fontFamily: COND, fontSize: size, lineHeight: 0.95, color, transform: `translateY(${(1 - p) * 50}px)`, opacity: clampI(f, d, d + 4, 0, 1), ...style}}>
      {children}
    </div>
  );
};

const Pill = ({text, d = 0, bg = A.red, color = A.white, size = 90, rot = -2}: {text: React.ReactNode; d?: number; bg?: string; color?: string; size?: number; rot?: number}) => {
  const f = useCurrentFrame();
  const p = sp(f, d, POP);
  if (f < d) return null;
  return (
    <div style={{display: 'inline-block', fontFamily: COND, fontSize: size, lineHeight: 1, color, background: bg, padding: '14px 36px 6px', borderRadius: 16, boxShadow: '0 12px 0 rgba(0,0,0,.22)', transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`}}>
      {text}
    </div>
  );
};

const Top = ({children, top = 120}: {children: React.ReactNode; top?: number}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>{children}</div>
);

// ---- the "before": AI menu and ChatGPT posters -----------------------------------
const AiPoster = ({w, v = 0}: {w: number; v?: number}) => {
  const k = w / 260;
  const txt = v ? ['MEILLEUR BURGUER', 'DE LA VILLLE !!!', 'PRIX INCROYABE'] : ['DELICIOUS FOOD', 'GRAND OUVERTURE', 'BEST QUALITEE'];
  return (
    <div style={{width: w, height: w * 1.35, background: v ? 'linear-gradient(160deg,#00C2FF,#7B2FF7 55%,#FF3CAC)' : 'linear-gradient(160deg,#7B2FF7,#F107A3 60%,#FFB800)', padding: 14 * k, boxSizing: 'border-box', textAlign: 'center', overflow: 'hidden', position: 'relative', boxShadow: '0 6px 16px rgba(0,0,0,.35)'}}>
      <div style={{fontFamily: '"Times New Roman", serif', fontWeight: 700, fontSize: 30 * k, color: '#FFF59D', textShadow: `0 0 ${8 * k}px #FF00E5`, lineHeight: 1}}>{txt[0]}</div>
      <Img src={staticFile(v ? 'story/ia-ailes.png' : 'story/ia-salade.png')} style={{display: 'block', margin: `${6 * k}px auto`, width: 150 * k, height: 130 * k, objectFit: 'cover', borderRadius: 4 * k}} />
      <div style={{fontFamily: '"Comic Sans MS", serif', fontSize: 25 * k, color: '#fff', lineHeight: 1.05}}>{txt[1]}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontStyle: 'italic', fontSize: 20 * k, color: '#00FFB2', marginTop: 6 * k}}>{txt[2]} ★★★★★</div>
      {[0.1, 0.8, 0.5].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: `${x * 90}%`, top: `${20 + i * 25}%`, fontSize: 26 * k, color: '#FFF59D', opacity: 0.9}}>✦</div>
      ))}
    </div>
  );
};

const AiMenu = ({w}: {w: number}) => {
  const k = w / 600;
  const rows = [
    ['Chiken burgr', '13,5$'],
    ['Poutine Speciale', '12.99$$'],
    ['Frittes (petit/GROS)', '4-6$'],
    ['Combo familial ??', 'demandez'],
    ['Wrapp poulet', '11,49'],
  ];
  return (
    <div style={{width: w, height: w * 1.25, background: 'linear-gradient(180deg,#FDF6E3,#E9E1FF)', padding: 26 * k, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontFamily: '"Times New Roman", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 62 * k, color: '#5B2BD1', textAlign: 'center', letterSpacing: -1}}>Our Menue</div>
      <Img src={staticFile('story/ia-ailes.png')} style={{position: 'absolute', right: 16 * k, top: 96 * k, width: 150 * k, height: 186 * k, objectFit: 'cover', transform: 'rotate(-6deg)', boxShadow: '0 6px 14px rgba(0,0,0,.3)'}} />
      <Img src={staticFile('story/ia-salade.png')} style={{position: 'absolute', right: 120 * k, top: 300 * k, width: 120 * k, height: 150 * k, objectFit: 'cover', transform: 'rotate(8deg)', boxShadow: '0 6px 14px rgba(0,0,0,.3)'}} />
      <div style={{marginTop: 30 * k}}>
        {rows.map(([a, b], i) => (
          <div key={a} style={{display: 'flex', gap: 10 * k, fontFamily: i % 2 ? '"Comic Sans MS", serif' : '"Courier New", monospace', fontSize: (i === 2 ? 30 : 38) * k, color: ['#222', '#C2185B', '#1565C0', '#222', '#2E7D32'][i], marginTop: 22 * k, marginLeft: (i % 3) * 14 * k}}>
            <span>{a}</span>
            <span style={{flex: 1, borderBottom: `${2 * k}px dotted #999`, margin: `0 0 ${10 * k}px`}} />
            <span style={{fontWeight: 700}}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20 * k, textAlign: 'center', fontFamily: SANS, fontSize: 22 * k, color: '#888'}}>✨ Generated with love ✨ bon appetit !!</div>
    </div>
  );
};

const Stamp = ({text, d, rot = -12}: {text: string; d: number; rot?: number}) => {
  const f = useCurrentFrame();
  const p = sp(f, d, {damping: 10, stiffness: 260});
  if (f < d) return null;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', fontFamily: COND, fontSize: 64, lineHeight: 1, color: A.white, background: A.red, border: '6px solid #fff', padding: '12px 26px 4px', borderRadius: 14, transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, boxShadow: '0 12px 30px rgba(0,0,0,.45)'}}>
      ✕ {text}
    </div>
  );
};

// ---- storefront -------------------------------------------------------------------------
const Coroplast = ({x, y, kind}: {x: number; y: number; kind: 'burger' | 'pizza'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 230, height: 390}}>
    <div style={{position: 'absolute', left: 20, top: 10, width: 190, height: 380, background: '#D9D9D9', clipPath: 'polygon(12% 0,88% 0,100% 100%,0 100%)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, padding: 7, background: '#fff', borderRadius: 6, boxShadow: '0 10px 20px rgba(0,0,0,.35)'}}>
      <Poster kind={kind} w={216} />
    </div>
  </div>
);

const Storefront = ({after, night = 0, light = 1, coro = false, children}: {after: boolean; night?: number; light?: number; coro?: boolean; children?: React.ReactNode}) => {
  const f = useCurrentFrame();
  const sky = lerpColor('#8EA7C8', '#141C3A', night);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${lerpColor(sky, '#000000', 0.25)} 0%, ${sky} 100%)`}} />
      {/* neighbours */}
      <div style={{position: 'absolute', left: -60, top: 420, width: 120, height: 1100, background: '#5B4C6E'}} />
      <div style={{position: 'absolute', right: -60, top: 380, width: 120, height: 1140, background: '#4A5A50'}} />
      {/* building */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 360, height: 1150, background: after ? '#2B2A30' : '#6E6A66'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 36px)', opacity: 0.5}} />
      </div>
      {/* sign */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 400, height: 130, background: after ? A.ink : '#F2F2F2', border: after ? `4px solid ${A.redHi}` : '6px solid #A9A9A9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: after ? COND : '"Times New Roman", serif', fontSize: after ? 100 : 84, letterSpacing: after ? 8 : 0, color: after ? A.warm : '#444', textShadow: after && night > 0.4 ? '0 0 22px rgba(255,200,120,.9)' : 'none', transform: after ? 'none' : 'rotate(-1.2deg)'}}>
        {after ? 'STREET-FOOD' : 'Restaurant Street-Food'}
      </div>
      {/* window */}
      <div style={{position: 'absolute', left: 78, top: 588, width: 684, height: 812, background: '#151518', borderRadius: 6}} />
      <div style={{position: 'absolute', left: 90, top: 600, width: 660, height: 788, overflow: 'hidden', background: after ? `linear-gradient(180deg, ${lerpColor('#5A4636', '#2C2018', night)}, ${lerpColor('#3A2C22', '#140E0A', night)})` : 'linear-gradient(180deg,#C9D3D6,#AEB8BC)'}}>
        {after ? (
          [150, 330, 510].map((lx) => <div key={lx} style={{position: 'absolute', left: lx - 90, top: 40, width: 180, height: 260, background: `radial-gradient(ellipse at 50% 0%, rgba(255,214,150,${0.35 + 0.2 * night}), transparent 70%)`}} />)
        ) : (
          Array.from({length: 4}).map((_, i) => <div key={i} style={{position: 'absolute', left: 60 + i * 150, top: 40, width: 110, height: 10, background: '#F4FBFF', boxShadow: '0 0 20px #E6F6FF'}} />)
        )}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: after ? '#1C1410' : '#8C8C8C'}} />
        {children}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,${0.08 + 0.04 * Math.sin(f / 40)}) 32%, transparent 44%)`}} />
      </div>
      {/* door */}
      <div style={{position: 'absolute', left: 790, top: 620, width: 210, height: 880, background: after ? '#141317' : '#5E5650', border: `8px solid ${after ? A.red : '#4A443F'}`}}>
        <div style={{position: 'absolute', left: 26, top: 40, width: 142, height: 420, background: after ? `rgba(255,214,150,${0.5 + 0.3 * night})` : '#B9C3C6'}} />
      </div>
      {/* sidewalk */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, bottom: 0, background: lerpColor('#8B8D93', '#2E3038', night)}} />
      {after && night > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 1380, height: 400, background: `radial-gradient(ellipse at 40% 0%, rgba(255,210,140,${0.35 * night * light}), transparent 70%)`}} /> : null}
      {coro ? (
        <>
          <Coroplast x={60} y={1230} kind="burger" />
          <Coroplast x={800} y={1230} kind="pizza" />
        </>
      ) : null}
      <AbsoluteFill style={{background: '#050816', opacity: night * 0.25, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const WindowPanels = ({light}: {light: number}) => (
  <>
    <Panel x={70} y={150} w={240} light={light} cable={150}>
      <Poster kind="burger" w={240} />
    </Panel>
    <Panel x={360} y={150} w={240} light={light} cable={150}>
      <Poster kind="pizza" w={240} />
    </Panel>
  </>
);

const TapedAi = () => (
  <>
    <div style={{position: 'absolute', left: 60, top: 120, transform: 'rotate(-4deg)'}}>
      <AiPoster w={250} />
    </div>
    <div style={{position: 'absolute', left: 360, top: 170, transform: 'rotate(5deg)'}}>
      <AiPoster w={240} v={1} />
    </div>
  </>
);

// walker that stops to look, then leaves
const Passer = ({look, x0, stopX, arrive, leave, speed = 9, dir = 1, bubble = '?', scale = 1.5, start = 0}: {look: Look; x0: number; stopX: number; arrive: number; leave: number; speed?: number; dir?: 1 | -1; bubble?: string; scale?: number; start?: number}) => {
  const f = useCurrentFrame() - start;
  const x = f < arrive ? interpolate(f, [0, arrive], [x0, stopX], {extrapolateLeft: 'clamp'}) : f < leave ? stopX : stopX + speed * dir * (f - leave);
  const moving = f < arrive || f >= leave ? 1 : 0;
  const turn = clampI(f, arrive, arrive + 5, 0, 1) * (1 - clampI(f, leave - 4, leave, 0, 1));
  const b = f >= arrive + 4 && f < leave + 6 ? sp(f, arrive + 4, POP) : 0;
  return (
    <>
      <Person x={x} y={1640} look={look} walk={f * 0.34} moving={moving} turn={turn} scale={scale} dir={dir} />
      {b > 0 ? <Bubble x={x} y={1640 - 300 * scale * (look.tall ?? 1)} p={b} text={bubble} /> : null}
    </>
  );
};

// ---- scenes ------------------------------------------------------------------------------
const Hook = ({bouffeAt, ordersAt}: {bouffeAt: number; ordersAt: number}) => {
  const f = useCurrentFrame();
  const slam = spring({frame: f, fps: 30, config: {damping: 11, stiffness: 210}});
  const tk = sp(f, ordersAt, POP);
  return (
    <AbsoluteFill>
      <Storefront after={false} night={0.15}>
        <TapedAi />
      </Storefront>
      <Passer look={LOOKS[0]} x0={-150} stopX={-150} arrive={0} leave={0} speed={10} />
      <Passer look={LOOKS[2]} x0={1250} stopX={1250} arrive={0} leave={20} speed={8} dir={-1} />
      {/* Montreal-style street sign */}
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(slam, [0, 1], [1.12, 1])}) rotate(-2deg)`}}>
        <div style={{background: '#1F4E9E', border: '8px solid #fff', outline: '4px solid #1F4E9E', borderRadius: 14, padding: '18px 44px 8px', fontFamily: COND, fontSize: 132, lineHeight: 1, color: '#fff', boxShadow: '0 18px 40px rgba(0,0,0,.4)'}}>
          RUE SAINT-DENIS
        </div>
      </div>
      <Top top={268}>
        <Line d={bouffeAt - 2} size={84} color={A.white} style={{display: 'inline-block', background: A.ink, padding: '12px 30px 4px', borderRadius: 14}}>BONNE BOUFFE. BONS PRIX.</Line>
      </Top>
      {f >= ordersAt ? (
        <div style={{position: 'absolute', left: 140, right: 140, top: 820, background: A.white, borderRadius: 24, padding: '26px 30px 18px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,.45)', transform: `scale(${tk}) rotate(-3deg)`}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#777', letterSpacing: 3}}>COMMANDES / JOUR</div>
          <div style={{fontFamily: COND, fontSize: 250, lineHeight: 0.9, color: A.red}}>40</div>
          <svg width="400" height="70" viewBox="0 0 400 70">
            <polyline points="0,20 80,30 160,25 240,45 320,40 400,60" fill="none" stroke={A.red} strokeWidth="8" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Why = ({menuAt, posterAt}: {menuAt: number; posterAt: number}) => {
  const f = useCurrentFrame();
  const m = sp(f, menuAt - 2, {damping: 13, stiffness: 150});
  const p = sp(f, posterAt - 2, {damping: 13, stiffness: 150});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2A2730 0%, ${A.ink} 70%)`}}>
      <Top top={110}>
        <div style={{fontFamily: COND, fontSize: 200, lineHeight: 0.9, color: A.white, transform: `scale(${sp(f, 0, POP)})`}}>POURQUOI ?</div>
      </Top>
      <div style={{position: 'absolute', left: 40, top: 380, transform: `translateX(${(1 - m) * -900}px) rotate(${-6 + (1 - m) * -20}deg)`, opacity: f < menuAt - 2 ? 0 : 1}}>
        <AiMenu w={560} />
        <div style={{position: 'absolute', left: 60, top: 560}}>
          <Stamp text="MENU FAIT PAR L'IA" d={menuAt + 6} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 600, top: 700, transform: `translateX(${(1 - p) * 900}px) rotate(${7 + (1 - p) * 20}deg)`, opacity: f < posterAt - 2 ? 0 : 1}}>
        <AiPoster w={400} v={1} />
        <div style={{position: 'absolute', left: -150, top: 420}}>
          <Stamp text="AFFICHE CHATGPT" d={posterAt + 6} rot={8} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Walk = ({passAt}: {passAt: number}) => (
  <AbsoluteFill>
    <Storefront after={false} night={0.25}>
      <TapedAi />
    </Storefront>
    <Passer look={LOOKS[1]} x0={-140} stopX={330} arrive={18} leave={passAt + 4} speed={12} bubble="😬" />
    <Passer look={LOOKS[3]} x0={1240} stopX={640} arrive={22} leave={passAt + 10} speed={12} dir={-1} bubble="?" />
    <Top top={120}>
      <Line d={0} size={110} color={A.white} style={{textShadow: '0 4px 20px rgba(0,0,0,.5)'}}>LES GENS REGARDENT…</Line>
      <div style={{marginTop: 14}}>
        <Pill text="…ET PASSENT LEUR CHEMIN" d={passAt} size={84} />
      </div>
    </Top>
  </AbsoluteFill>
);

const Judge = ({avantAt}: {avantAt: number}) => {
  const f = useCurrentFrame();
  const blink = f % 40 > 36 ? 0.1 : 1;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${A.redHi} 0%, ${A.red} 50%, ${A.deep} 100%)`}}>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${sp(f, 0, POP)})`}}>
        <svg width="360" height="220" viewBox="0 0 360 220">
          <path d="M10 110 Q180 -40 350 110 Q180 260 10 110Z" fill={A.white} />
          <ellipse cx="180" cy="110" rx="70" ry={70 * blink} fill={A.ink} />
          <circle cx="205" cy="85" r="18" fill={A.white} opacity={blink} />
        </svg>
      </div>
      <Top top={620}>
        <Line d={0} size={190}>ICI, ON JUGE</Line>
        <Line d={avantAt - 2} size={150} color={A.warm}>AVANT DE GOÛTER.</Line>
      </Top>
    </AbsoluteFill>
  );
};

const FeehaIn = () => {
  const f = useCurrentFrame();
  const logo = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.1}}>
        {Array.from({length: 16}).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + f / 50;
          return <path key={i} d={`M540 800 L${540 + Math.cos(a) * 1500} ${800 + Math.sin(a) * 1500} L${540 + Math.cos(a + 0.13) * 1500} ${800 + Math.sin(a + 0.13) * 1500}Z`} fill={A.red} />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${logo})`}}>
        <div style={{background: A.white, padding: 14, borderRadius: 28, boxShadow: '0 30px 60px rgba(0,0,0,.2)'}}>
          <Img src={staticFile('feeha/logo-clean.png')} style={{width: 640, display: 'block'}} />
        </div>
      </div>
      <Top top={1000}>
        <Pill text="A TOUT REPRIS" d={8} size={130} />
      </Top>
    </AbsoluteFill>
  );
};

const Panels = ({offreAt}: {offreAt: number}) => {
  const f = useCurrentFrame();
  const cut = 30;
  const zoom = 1.04 + Math.max(0, f - cut) * 0.002;
  return (
    <AbsoluteFill style={{background: '#0B0B0E'}}>
      {f < cut ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <OffthreadVideo src={staticFile('story/panneau-devanture.mp4')} muted style={{width: 1080, height: 1976, objectFit: 'cover'}} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <Img src={staticFile('story/panneaux-vitrine.jpg')} style={{position: 'absolute', left: -180, top: 0, width: 1440, height: 1920, objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: '60% 45%'}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,8,12,.88) 0%, rgba(8,8,12,.55) 22%, rgba(8,8,12,0) 36%)'}} />
      <Top top={110}>
        <Line d={0} size={104}>2 PANNEAUX LUMINEUX FEEHA</Line>
        <div style={{marginTop: 16}}>
          <Pill text="✓ OFFRE CLAIRE" d={offreAt} size={92} bg={A.warm} color={A.ink} />
        </div>
      </Top>
      <div style={{position: 'absolute', left: 40, top: 1440, fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,.75)', background: 'rgba(0,0,0,.45)', padding: '8px 16px', borderRadius: 10}}>Panneaux Feeha installés · photo réelle</div>
    </AbsoluteFill>
  );
};

const Flyer = ({kind, rot, x}: {kind: 'burger' | 'pizza' | 'coffee'; rot: number; x: number}) => (
  <div style={{position: 'absolute', left: x, top: 0, transform: `rotate(${rot}deg)`, transformOrigin: '50% 100%', boxShadow: '0 10px 24px rgba(0,0,0,.3)', border: '6px solid #fff'}}>
    <Poster kind={kind} w={190} />
  </div>
);

const Print = ({hits}: {hits: number[]}) => {
  const f = useCurrentFrame();
  const a = sp(f, hits[0], POP);
  const b = sp(f, hits[1], {damping: 12, stiffness: 160});
  const c = sp(f, hits[2], {damping: 13, stiffness: 160});
  const shine = interpolate(f, [hits[2] + 8, hits[2] + 26], [-60, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const label = (t: string, d: number) => (
    <div style={{fontFamily: COND, fontSize: 56, lineHeight: 1, color: A.white, background: A.ink, padding: '10px 20px 4px', borderRadius: 12, display: 'inline-block', opacity: f < d ? 0 : 1, transform: `scale(${sp(f, d + 4, POP)})`}}>{t}</div>
  );
  return (
    <AbsoluteFill style={{background: A.cream}}>
      {/* coroplast pair */}
      <div style={{position: 'absolute', left: 40, top: 150, width: 500, transform: `scale(${a})`, transformOrigin: '50% 100%'}}>
        <div style={{position: 'relative', height: 440}}>
          <Coroplast x={0} y={20} kind="burger" />
          <Coroplast x={250} y={20} kind="pizza" />
        </div>
        <div style={{textAlign: 'center', marginTop: 20}}>{label('2 AFFICHES COROPLAST', hits[0])}</div>
      </div>
      {/* flyers */}
      <div style={{position: 'absolute', left: 580, top: 210, width: 460, height: 420, opacity: f < hits[1] ? 0 : 1}}>
        <div style={{position: 'relative', width: 460, height: 400, borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,.18)', transform: `translateY(${(1 - b) * 600}px)`}}>
          <OffthreadVideo src={staticFile('story/flyer.mp4')} muted style={{width: 460, height: 452, objectFit: 'cover', marginTop: -26}} />
        </div>
        <div style={{textAlign: 'center', marginTop: 20}}>{label('FLYERS', hits[1])}</div>
      </div>
      {/* laminated menu */}
      <div style={{position: 'absolute', left: 150, top: 780, width: 780, height: 560, borderRadius: 26, background: A.ink, overflow: 'hidden', transform: `scale(${c}) rotate(${(1 - c) * 8 - 2}deg)`, opacity: f < hits[2] ? 0 : 1, boxShadow: '0 30px 60px rgba(0,0,0,.35)', border: '10px solid #fff'}}>
        <div style={{position: 'absolute', left: 40, top: 30, fontFamily: COND, fontSize: 80, color: A.warm}}>MENU</div>
        {['TRIO BURGER', 'POUTINE', 'WRAP POULET', 'FRITES', 'BOISSON'].map((t, i) => (
          <div key={t} style={{position: 'absolute', left: 40, top: 140 + i * 74, width: 400, display: 'flex', justifyContent: 'space-between', fontFamily: COND, fontSize: 50, color: A.white}}>
            <span>{t}</span>
            <span style={{color: A.redHi}}>{['12,99', '10,99', '11,49', '4,49', '2,49'][i]} $</span>
          </div>
        ))}
        <div style={{position: 'absolute', right: 30, top: 120}}>
          <Burger size={260} />
        </div>
        <div style={{position: 'absolute', top: -100, bottom: -100, left: `${shine}%`, width: 120, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0))', transform: 'skewX(-20deg)'}} />
      </div>
      <div style={{position: 'absolute', top: 1370, left: 0, right: 0, textAlign: 'center'}}>{label('MENU PLASTIFIÉ', hits[2])}</div>
    </AbsoluteFill>
  );
};

const Screen = ({i, f}: {i: number; f: number}) => {
  const items = ['TRIO BURGER', 'POUTINE', 'WRAP POULET', 'FRITES', 'COMBO FAMILLE'];
  const hi = Math.floor(f / 12) % items.length;
  return (
    <div style={{width: 320, height: 540, background: '#0B0B0D', borderRadius: 16, padding: 12, boxShadow: '0 0 40px rgba(255,200,140,.25), 0 20px 40px rgba(0,0,0,.5)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', background: i === 1 ? A.ink : `linear-gradient(170deg, ${A.redHi}, ${A.deep})`}}>
        {i === 1 ? (
          <>
            <div style={{fontFamily: COND, fontSize: 56, color: A.warm, textAlign: 'center', marginTop: 16}}>MENU</div>
            {items.map((t, k) => (
              <div key={t} style={{margin: '10px 14px', padding: '8px 12px 2px', borderRadius: 8, background: k === hi ? A.red : 'transparent', fontFamily: COND, fontSize: 38, color: A.white, display: 'flex', justifyContent: 'space-between', transform: `scale(${k === hi ? 1.05 : 1})`}}>
                <span>{t}</span>
                <span>{['12,99', '10,99', '11,49', '4,49', '24,99'][k]}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            <div style={{fontFamily: COND, fontSize: 64, color: A.white, lineHeight: 0.9, textAlign: 'center', whiteSpace: 'pre-line'}}>{i === 0 ? 'TRIO\nBURGER' : '2 POUR\n19 $'}</div>
            <div style={{transform: `scale(${1 + 0.06 * Math.sin(f / 6 + i)}) rotate(${Math.sin(f / 10 + i) * 6}deg)`}}>
              {i === 0 ? <Burger size={220} /> : <Pizza size={220} />}
            </div>
            <div style={{fontFamily: COND, fontSize: 60, color: A.ink, background: A.warm, padding: '6px 22px 0', borderRadius: 999}}>{i === 0 ? '12,99 $' : 'CE SOIR'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const Screens = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#2A1E18 0%,#1A120E 100%)'}}>
      {[0, 1, 2].map((i) => {
        const p = sp(f, i * 3, {damping: 12, stiffness: 160});
        return (
          <div key={i} style={{position: 'absolute', left: 20 + i * 350, top: 420, transform: `translateY(${(1 - p) * -700}px)`}}>
            <div style={{position: 'absolute', left: 150, top: -420, width: 20, height: 420, background: '#111'}} />
            <Screen i={i} f={f} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, height: 440, background: 'linear-gradient(180deg,#5A3A26,#3A2418)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1070, height: 26, background: '#7A5236'}} />
      <Top top={140}>
        <Line d={0} size={110}>MENU ANIMÉ</Line>
        <Line d={4} size={84} color={A.warm}>SUR 3 ÉCRANS</Line>
      </Top>
    </AbsoluteFill>
  );
};

const Polos = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <div style={{position: 'absolute', left: 190, top: 330, width: 700, height: 700, transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`}}>
        <svg width={700} height={700} viewBox="0 0 420 420">
          <path d="M140 30 L175 22 Q210 60 245 22 L280 30 L400 90 L360 190 L320 172 L320 400 L100 400 L100 172 L60 190 L20 90 Z" fill={A.red} />
          <path d="M175 22 L210 95 L245 22" fill={A.deep} />
          <path d="M210 95 V160" stroke={A.deep} strokeWidth="6" />
          <circle cx="210" cy="118" r="5" fill={A.cream} />
          <circle cx="210" cy="142" r="5" fill={A.cream} />
          <rect x="250" y="130" width="60" height="26" rx="4" fill="none" stroke={A.warm} strokeWidth="3" />
          <text x="280" y="150" textAnchor="middle" fontFamily="Bebas Neue" fontSize="20" fill={A.warm}>STREET</text>
        </svg>
      </div>
      <Person x={150} y={1500} look={STAFF} walk={0} moving={0} turn={1} scale={1.35} wave={Math.max(0, Math.sin(f / 4))} />
      <Person x={930} y={1500} look={STAFF2} walk={0} moving={0} turn={1} scale={1.35} />
      <Top top={140}>
        <Line d={0} size={120} color={A.ink}>DES POLOS PRO</Line>
        <Line d={4} size={90} color={A.red}>POUR L'ÉQUIPE</Line>
      </Top>
    </AbsoluteFill>
  );
};

const Uber = () => {
  const f = useCurrentFrame();
  const swipe = clampI(f, 14, 26, 0, 1);
  const e = 1 - (1 - swipe) ** 3;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #2A2730, ${A.ink})`}}>
      <Top top={110}>
        <Line d={0} size={104}>PAGE UBER</Line>
        <Line d={4} size={96} color={A.warm}>RETRAVAILLÉE</Line>
      </Top>
      <div style={{position: 'absolute', left: 270, top: 380, width: 540, height: 1060, borderRadius: 64, background: '#0A0A0C', padding: 20, boxShadow: '0 40px 80px rgba(0,0,0,.6)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden', background: '#fff'}}>
          {/* before */}
          <div style={{position: 'absolute', inset: 0, background: '#E9E9E9', filter: 'blur(1.5px) saturate(.4)'}}>
            <div style={{height: 300, background: 'linear-gradient(135deg,#555,#888)'}} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{display: 'flex', gap: 14, padding: 18}}>
                <div style={{width: 110, height: 90, background: '#999'}} />
                <div style={{flex: 1}}>
                  <div style={{height: 18, width: '70%', background: '#AAA', marginBottom: 10}} />
                  <div style={{height: 14, width: '40%', background: '#BBB'}} />
                </div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', top: 24, left: 24, fontFamily: COND, fontSize: 44, color: A.white, background: '#555', padding: '6px 16px 0', borderRadius: 10, opacity: 1 - swipe}}>AVANT</div>
          {/* after */}
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - e) * 100}%)`, background: '#fff'}}>
            <div style={{height: 320, background: `linear-gradient(160deg, ${A.redHi}, ${A.deep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
              <Burger size={210} />
              <Pizza size={150} />
            </div>
            <div style={{padding: '18px 24px 6px', fontFamily: COND, fontSize: 54, color: A.ink}}>STREET-FOOD SAINT-DENIS</div>
            <div style={{display: 'flex', gap: 10, padding: '0 24px'}}>
              {['POPULAIRES', 'TRIOS', 'POUTINES'].map((c, i) => (
                <div key={c} style={{fontFamily: COND, fontSize: 30, padding: '6px 14px 0', borderRadius: 999, background: i === 0 ? A.ink : '#EEE', color: i === 0 ? A.white : A.ink}}>{c}</div>
              ))}
            </div>
            {[['TRIO BURGER', '12,99 $', 'burger'], ['POUTINE', '10,99 $', 'pizza'], ['COMBO FAMILLE', '24,99 $', 'burger']].map(([n, pr, k], i) => (
              <div key={n} style={{display: 'flex', gap: 16, padding: '18px 24px 0', alignItems: 'center'}}>
                <div style={{width: 130, height: 104, borderRadius: 16, background: A.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  {k === 'burger' ? <Burger size={100} /> : <Pizza size={90} />}
                </div>
                <div>
                  <div style={{fontFamily: COND, fontSize: 44, color: A.ink, lineHeight: 1}}>{n}</div>
                  <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#555', marginTop: 6}}>{pr}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', top: 24, right: 24, fontFamily: COND, fontSize: 44, color: A.ink, background: A.warm, padding: '6px 16px 0', borderRadius: 10, opacity: swipe}}>APRÈS</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Result = ({centAt}: {centAt: number}) => {
  const f = useCurrentFrame();
  const g = clampI(f, centAt - 6, centAt + 18, 0, 1);
  const ge = 1 - (1 - g) ** 3;
  const n = Math.round(40 + 60 * ge);
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <Top top={110}>
        <Line d={0} size={140} color={A.red}>RÉSULTAT</Line>
        <Line d={centAt - 4} size={92} color={A.ink}>COMMANDES PAR JOUR</Line>
      </Top>
      {/* bars */}
      {[
        {x: 170, v: 40, label: 'AVANT', color: '#9A9A9A', h: 300},
        {x: 590, v: n, label: 'APRÈS', color: A.red, h: 300 + 450 * ge},
      ].map((b, i) => (
        <div key={i} style={{position: 'absolute', left: b.x, top: 1380 - b.h, width: 320, height: b.h, background: b.color, borderRadius: '20px 20px 0 0', boxShadow: '0 20px 40px rgba(0,0,0,.15)'}}>
          <div style={{position: 'absolute', top: -170, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 170, lineHeight: 1, color: b.color}}>
            {i === 1 && g >= 1 ? '100+' : b.v}
          </div>
          <div style={{position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 70, color: A.white}}>{b.label}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1380, height: 10, background: A.ink, borderRadius: 5}} />
      {/* order notifications */}
      {[0, 1, 2, 3].map((k) => {
        const d = centAt + 4 + k * 6;
        const p = sp(f, d, POP);
        return f >= d ? (
          <div key={k} style={{position: 'absolute', left: 60 + (k % 2) * 30, top: 480 + k * 90, background: A.white, borderRadius: 18, padding: '12px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: A.ink, boxShadow: '0 12px 30px rgba(0,0,0,.18)', transform: `scale(${p})`, display: 'flex', gap: 12, alignItems: 'center'}}>
            <span style={{width: 34, height: 34, borderRadius: 17, background: '#1DB954', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>✓</span>
            Nouvelle commande
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

const Price = ({moinsAt}: {moinsAt: number}) => {
  const f = useCurrentFrame();
  const items = ['2 PANNEAUX LUMINEUX FEEHA', 'MENU ANIMÉ · 3 ÉCRANS', 'MENU PLASTIFIÉ', 'FLYERS', '2 AFFICHES COROPLAST'];
  const tag = sp(f, moinsAt - 2, POP);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, ${A.redHi} 0%, ${A.red} 45%, ${A.deep} 100%)`}}>
      <Top top={140}>
        <Line d={0} size={110}>LE TOUT POUR</Line>
        <div style={{fontFamily: COND, fontSize: 120, lineHeight: 1, color: A.warm, marginTop: 6, opacity: f < moinsAt - 2 ? 0 : 1}}>MOINS DE</div>
        <div style={{fontFamily: COND, fontSize: 330, lineHeight: 0.9, color: A.white, transform: `scale(${interpolate(tag, [0, 1], [1.6, 1])})`, opacity: f < moinsAt - 2 ? 0 : 1, textShadow: '0 16px 0 rgba(0,0,0,.25)'}}>2 499 $</div>
      </Top>
      <div style={{position: 'absolute', left: 90, right: 90, top: 840, display: 'flex', flexDirection: 'column', gap: 14}}>
        {items.map((t, i) => {
          const d = 6 + i * 5;
          const p = sp(f, d, {damping: 14, stiffness: 180});
          return (
            <div key={t} style={{fontFamily: COND, fontSize: 60, lineHeight: 1, color: A.red, background: A.cream, padding: '14px 26px 6px', borderRadius: 14, transform: `translateX(${(1 - p) * -300}px)`, opacity: f < d ? 0 : 1}}>
              ✓ {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Cta = ({aimantAt, feehaAt}: {aimantAt: number; feehaAt: number}) => {
  const f = useCurrentFrame();
  const pull = (k: number) => {
    const d = aimantAt - 10 + k * 5;
    return clampI(f, d, d + 30, 0, 1);
  };
  const people = [
    {look: LOOKS[0], x0: -120, dir: 1 as const},
    {look: LOOKS[1], x0: 1200, dir: -1 as const},
    {look: LOOKS[2], x0: -260, dir: 1 as const},
    {look: LOOKS[3], x0: 1340, dir: -1 as const},
  ];
  return (
    <AbsoluteFill>
      <Storefront after night={0.9} coro>
        <WindowPanels light={1} />
      </Storefront>
      {people.map((p, k) => {
        const t = pull(k);
        const x = interpolate(t, [0, 1], [p.x0, 895 + (k - 1.5) * 18]);
        return <Person key={k} x={x} y={1640 + k * 6} look={p.look} walk={f * 0.34} moving={t < 1 ? 1 : 0} turn={t >= 1 ? 1 : 0} scale={1.4} dir={x < 895 ? 1 : -1} />;
      })}
      {/* magnet lines */}
      {f >= aimantAt - 10
        ? [0, 1, 2].map((k) => (
            <div key={k} style={{position: 'absolute', left: 895 - 120 - k * 70, top: 1080 - k * 70, width: 240 + k * 140, height: 240 + k * 140, borderRadius: '50%', border: `6px solid rgba(255,214,150,${0.5 - k * 0.14})`, transform: `scale(${1 + ((f / 20 + k / 3) % 1) * 0.3})`, opacity: 1 - ((f / 20 + k / 3) % 1)}} />
          ))
        : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,14,.92) 0%, rgba(10,10,14,.75) 26%, rgba(10,10,14,0) 40%)'}} />
      <Top top={110}>
        <Line d={0} size={96}>INVESTISSEZ DANS LA BONNE ÉQUIPE</Line>
        <Line d={aimantAt - 14} size={86} color={A.warm}>LES CLIENTS VIENDRONT</Line>
        <Line d={aimantAt - 6} size={86} color={A.warm}>COMME DES AIMANTS 🧲</Line>
        <div style={{marginTop: 22, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center'}}>
          <Pill text="FEEHA.CA" d={feehaAt} size={100} />
          <Pill text="FEEHAPANELS.COM" d={feehaAt + 6} size={64} bg={A.white} color={A.red} rot={1.5} />
        </div>
      </Top>
    </AbsoluteFill>
  );
};

// ---- composition ---------------------------------------------------------------------
export const FeehaStory = ({audio}: {audio: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const {scenes, words} = timeline as {scenes: {id: string; from: number; to: number}[]; words: {text: string; start: number}[]};
  const at = (id: string, w: string, fallback: number, nth = 0) => {
    const sc = scenes.find((x) => x.id === id)!;
    const hits = words.filter((x) => x.text.toLowerCase().startsWith(w) && x.start * fps >= sc.from - 2 && x.start * fps < sc.to);
    const hit = hits[nth];
    return hit ? Math.max(0, Math.round(hit.start * fps) - sc.from - 2) : fallback;
  };
  const cuts = scenes.slice(1).map((s) => s.from);
  const since = Math.min(...cuts.filter((c) => c <= frame).map((c) => frame - c), 99);
  const flash = interpolate(since, [0, 4], [0.25, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook bouffeAt={at('hook', 'bonne', 10)} ordersAt={at('hook', '40', 100)} />,
    why: <Why menuAt={at('why', 'menu', 22)} posterAt={at('why', 'affiches', 60)} />,
    walk: <Walk passAt={at('walk', 'passent', 34)} />,
    judge: <Judge avantAt={at('judge', 'avant', 34)} />,
    feeha: <FeehaIn />,
    panels: <Panels offreAt={at('panels', 'offre', 40)} />,
    print: <Print hits={[0, at('print', 'flyers', 28), at('print', 'menu', 50)]} />,
    screens: <Screens />,
    polos: <Polos />,
    uber: <Uber />,
    result: <Result centAt={at('result', '100', 20)} />,
    price: <Price moinsAt={at('price', 'moins', 16)} />,
    cta: <Cta aimantAt={at('cta', 'aimants', 80)} feehaAt={at('cta', 'feeha', 100)} />,
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
      {audio ? <Audio src={staticFile('story-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
