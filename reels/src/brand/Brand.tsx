import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {A, Bubble, COND, LOOKS, Person, SANS, clampI, lerpColor} from '../anim/Art';
import timeline from './timeline.json';

// Feeha "pack branding" ad. Real KOMÉ photos (a Feeha branding) + drawn scenes.
// Text stays between y≈110 and y≈1500 (Instagram covers the bottom of a Reel).

// set to true once public/brand/vitrine.jpg and merch.jpg (client photos) are in place
const HAVE_PHOTOS = false;
const K = {green: '#0F5137', greenHi: '#1B7A52', pink: '#F08FA3', cream: '#F5EDE0'};
const HEAVY = '"Archivo Variable", sans-serif';

const sp = (f: number, d: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {damping: 12, stiffness: 170}) =>
  spring({frame: f - d, fps: 30, config: cfg});
const POP = {damping: 9, stiffness: 240, mass: 0.6};

// one line of title text that rises into place at frame d
const Line = ({children, d = 0, size = 110, color = A.white, font = COND, style}: {children: React.ReactNode; d?: number; size?: number; color?: string; font?: string; style?: React.CSSProperties}) => {
  const f = useCurrentFrame();
  const p = sp(f, d);
  return (
    <div style={{fontFamily: font, fontSize: size, lineHeight: 0.95, color, transform: `translateY(${(1 - p) * 50}px)`, opacity: clampI(f, d, d + 4, 0, 1), ...style}}>
      {children}
    </div>
  );
};

const Pill = ({text, d = 0, bg = A.red, color = A.white, size = 90, rot = -2}: {text: string; d?: number; bg?: string; color?: string; size?: number; rot?: number}) => {
  const f = useCurrentFrame();
  const p = sp(f, d, POP);
  if (f < d) return null;
  return (
    <div style={{display: 'inline-block', fontFamily: COND, fontSize: size, lineHeight: 1, color, background: bg, padding: '14px 36px 6px', borderRadius: 16, boxShadow: '0 12px 0 rgba(0,0,0,.22)', transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`}}>
      {text}
    </div>
  );
};

const Source = ({color = 'rgba(255,255,255,.55)'}: {color?: string}) => (
  <div style={{position: 'absolute', top: 1470, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 25, color}}>
    Source : H.G. Parsa et al., Ohio State University — étude sur la survie des restaurants
  </div>
);

// ---- tiny storefront used in the statistics -----------------------------------------
const MiniShop = ({w, closed = 0, hue = A.redHi, label = 'RESTO'}: {w: number; closed?: number; hue?: string; label?: string}) => {
  const win = lerpColor('#FFD48A', '#22242B', Math.min(1, closed * 1.4));
  return (
    <div style={{position: 'relative', width: w, height: w}}>
      <svg width={w} height={w} viewBox="0 0 200 200" style={{filter: `grayscale(${closed}) brightness(${1 - 0.45 * closed})`}}>
        <rect x="10" y="26" width="180" height="170" rx="4" fill="#EADFCB" />
        <rect x="10" y="26" width="180" height="36" fill="#34343B" />
        <text x="100" y="53" textAnchor="middle" fontFamily="Bebas Neue" fontSize="26" fill="#FFE2B0">{label}</text>
        {Array.from({length: 6}).map((_, i) => (
          <path key={i} d={`M${10 + i * 30} 62 h30 v16 q-15 12 -30 0z`} fill={i % 2 ? '#FFFFFF' : hue} />
        ))}
        <rect x="24" y="96" width="98" height="78" rx="3" fill={win} />
        <rect x="24" y="96" width="98" height="78" rx="3" fill="none" stroke="#5B3B2B" strokeWidth="5" />
        <rect x="134" y="96" width="44" height="100" fill="#5B3B2B" />
        <circle cx="170" cy="148" r="3" fill="#E8C36A" />
        <rect x="0" y="192" width="200" height="8" fill="#2A2C33" />
      </svg>
      {closed > 0.01 ? (
        <div style={{position: 'absolute', left: w * 0.08, top: w * 0.5, width: w * 0.66, textAlign: 'center', fontFamily: COND, fontSize: w * 0.2, lineHeight: 1, color: A.white, background: A.red, border: `${Math.max(2, w * 0.015)}px solid #fff`, borderRadius: w * 0.03, padding: `${w * 0.03}px 0 ${w * 0.01}px`, transform: `rotate(-10deg) scale(${interpolate(closed, [0, 1], [2.2, 1])})`, opacity: Math.min(1, closed * 2), boxShadow: '0 6px 14px rgba(0,0,0,.4)'}}>
          FERMÉ
        </div>
      ) : null}
    </div>
  );
};

// ---- 1. hook -----------------------------------------------------------------------------
const Hook = ({closeAt}: {closeAt: number}) => {
  const f = useCurrentFrame();
  const slam = spring({frame: f, fps: 30, config: {damping: 11, stiffness: 210}});
  const close = sp(f, closeAt, {damping: 10, stiffness: 190});
  const shake = f >= closeAt && f < closeAt + 9 ? Math.sin(f * 2.6) * 10 * (1 - (f - closeAt) / 9) : 0;
  const hues = [A.redHi, '#2E7D5B', '#E0A030', '#3C5BA9'];
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2A2730 0%, ${A.ink} 70%)`}}>
      <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', transform: `scale(${interpolate(slam, [0, 1], [1.06, 1])}) translateX(${shake}px)`}}>
        <div style={{fontFamily: COND, fontSize: 150, lineHeight: 0.95, color: A.white}}>
          <span style={{color: A.redHi}}>1</span> RESTAURANT SUR <span style={{color: A.redHi}}>4</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={closeAt - 2} size={104} color={A.warm}>FERME DÈS SA 1<sup style={{fontSize: 60}}>RE</sup> ANNÉE</Line>
      </div>
      {[0, 1, 2, 3].map((i) => {
        const x = i % 2 ? 580 : 100;
        const y = i < 2 ? 560 : 1000;
        const pin = sp(f, i * 2 - 14, POP);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${pin}) translateX(${i === 3 ? shake : 0}px)`}}>
            <MiniShop w={400} hue={hues[i]} closed={i === 3 ? close : 0} />
          </div>
        );
      })}
      <Source />
    </AbsoluteFill>
  );
};

// ---- 2. 6 out of 10 ------------------------------------------------------------------
const Stat = ({sixAt, avantAt}: {sixAt: number; avantAt: number}) => {
  const f = useCurrentFrame();
  const shut = [0, 2, 3, 5, 7, 9];
  const hues = [A.redHi, '#2E7D5B', '#E0A030', '#3C5BA9', '#8E44AD', '#D35400', '#16A085', '#C0392B', '#2C3E50', '#B7950B'];
  const six = sp(f, sixAt - 3, POP);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2A2730 0%, ${A.ink} 70%)`}}>
      <div style={{position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: COND, fontSize: 290, lineHeight: 0.9, color: A.redHi, transform: `scale(${interpolate(six, [0, 1], [0.4, 1])})`, opacity: f < sixAt - 3 ? 0 : 1}}>6 SUR 10</div>
        <Line d={avantAt - 2} size={110}>FERMENT AVANT 3 ANS</Line>
      </div>
      {Array.from({length: 10}).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const k = shut.indexOf(i);
        const c = k >= 0 ? sp(f, sixAt + 4 + k * 4, {damping: 11, stiffness: 200}) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: 50 + col * 200, top: 720 + row * 270, transform: `scale(${sp(f, i - 8, POP)})`}}>
            <MiniShop w={180} hue={hues[i]} closed={c} />
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 46, color: A.white, opacity: clampI(f, avantAt + 6, avantAt + 12, 0, 1)}}>
        Pourquoi ?
      </div>
      <Source />
    </AbsoluteFill>
  );
};

// ---- 3. the food is good -----------------------------------------------------------------
const Food = ({excAt}: {excAt: number}) => {
  const f = useCurrentFrame();
  const plate = sp(f, 0, {damping: 14, stiffness: 120});
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={104} color={A.ink}>POURTANT, LA CUISINE</Line>
        <Line d={excAt - 2} size={150} color={A.red}>EST BONNE</Line>
      </div>
      <div style={{position: 'absolute', left: 540 - 380, top: 520, width: 760, height: 760, borderRadius: '50%', background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,.18)', transform: `scale(${plate}) rotate(${(1 - plate) * -40 + f * 0.15}deg)`}}>
        <Img src={staticFile('brand/kome-plate.jpg')} style={{position: 'absolute', inset: 50, width: 660, height: 660, borderRadius: '50%', objectFit: 'cover'}} />
      </div>
      <svg width={1080} height={400} style={{position: 'absolute', top: 260, left: 0}}>
        {[400, 540, 680].map((x, i) => (
          <path key={i} d={`M${x} 360 q-30 -60 0 -120 q30 -60 0 -120`} fill="none" stroke="rgba(120,100,80,.35)" strokeWidth="10" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 - ((f * 6 + i * 90) % 400)} opacity={clampI(f, 6, 14, 0, 1)} />
        ))}
      </svg>
      <div style={{position: 'absolute', top: 1320, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = sp(f, excAt + i * 3, POP);
          return (
            <div key={i} style={{fontSize: 110, lineHeight: 1, color: '#F2B705', transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`, textShadow: '0 6px 0 rgba(0,0,0,.15)'}}>★</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- storefront: bland or KOMÉ -------------------------------------------------------
const Facade = ({branded}: {branded: boolean}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: branded ? 'linear-gradient(180deg,#F7D7B5 0%,#F3C7A4 60%)' : 'linear-gradient(180deg,#AEB6BF 0%,#C4C8CC 60%)'}} />
    {/* wall */}
    <div style={{position: 'absolute', left: 50, top: 470, width: 980, height: 1060, background: branded ? K.green : '#CEC8BC', borderRadius: '8px 8px 0 0'}} />
    {branded ? (
      <svg width={980} height={1060} style={{position: 'absolute', left: 50, top: 470}}>
        {[[120, 1000, K.pink], [860, 960, K.cream], [500, 1040, K.pink]].map(([x, y, c], i) => (
          <path key={i} d={`M${(x as number) - 90} ${y} a90 90 0 0 1 180 0`} fill="none" stroke={c as string} strokeWidth="34" strokeLinecap="round" opacity=".9" />
        ))}
      </svg>
    ) : null}
    {/* sign */}
    {branded ? (
      <div style={{position: 'absolute', left: 140, top: 515, width: 800, height: 230, background: K.cream, borderRadius: 18, boxShadow: '0 0 60px rgba(255,230,180,.8), 0 14px 0 rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
        <Img src={staticFile('brand/kome-logo.png')} style={{height: 200}} />
      </div>
    ) : (
      <div style={{position: 'absolute', left: 150, top: 530, width: 780, height: 190, background: '#F4F4F2', border: '6px solid #9A9A9A', transform: 'rotate(-1.6deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Times New Roman", serif', fontSize: 110, color: '#3B3B3B', letterSpacing: 2}}>
        RESTAURANT
      </div>
    )}
    {/* awning */}
    <svg width={980} height={90} style={{position: 'absolute', left: 50, top: 770}}>
      {Array.from({length: 14}).map((_, i) => (
        <path key={i} d={`M${i * 70} 0 h70 v50 q-35 30 -70 0z`} fill={branded ? (i % 2 ? K.cream : K.pink) : i % 2 ? '#E7E7E7' : '#9DA3A8'} />
      ))}
    </svg>
    {/* window */}
    <div style={{position: 'absolute', left: 110, top: 880, width: 540, height: 560, background: branded ? '#FFD9A0' : '#DCE4E6', border: `14px solid ${branded ? '#0A3B28' : '#8E8E8E'}`, overflow: 'hidden'}}>
      {branded ? (
        <>
          <Img src={staticFile('brand/kome4.jpg')} style={{position: 'absolute', left: -40, top: -220, width: 620, opacity: 0.92}} />
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(255,220,160,.35), rgba(0,0,0,.15))'}} />
        </>
      ) : (
        <>
          {Array.from({length: 11}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * 52, height: 26, background: 'rgba(150,150,150,.35)'}} />
          ))}
          <div style={{position: 'absolute', left: 150, top: 150, width: 220, padding: '16px 0', background: '#fff', transform: 'rotate(4deg)', fontFamily: '"Comic Sans MS", "Times New Roman", serif', fontSize: 44, textAlign: 'center', color: '#C00'}}>OUVERT</div>
        </>
      )}
    </div>
    {/* door */}
    <div style={{position: 'absolute', left: 710, top: 900, width: 250, height: 630, background: branded ? '#0A3B28' : '#7A6A5A', border: `10px solid ${branded ? K.pink : '#6A5A4A'}`}}>
      <div style={{position: 'absolute', left: 30, top: 40, width: 170, height: 300, background: branded ? '#FFD9A0' : '#C9D1D4', opacity: 0.85}} />
      <div style={{position: 'absolute', right: 26, top: 330, width: 16, height: 70, borderRadius: 8, background: '#E8C36A'}} />
    </div>
    {/* sidewalk */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1530, bottom: 0, background: branded ? '#B49A88' : '#8D8F94'}} />
  </AbsoluteFill>
);

const Walker = ({look, x0, speed, start = 0, stopAt, lookAt, bubbleAt, dir = 1, scale = 1.55}: {look: number; x0: number; speed: number; start?: number; stopAt?: number; lookAt?: number; bubbleAt?: number; dir?: 1 | -1; scale?: number}) => {
  const f = useCurrentFrame() - start;
  const t = stopAt !== undefined ? Math.min(f, stopAt) : f;
  const x = x0 + speed * dir * Math.max(0, t);
  const moving = stopAt !== undefined && f >= stopAt ? 0 : 1;
  const turn = lookAt !== undefined ? clampI(f, lookAt, lookAt + 6, 0, 1) : 0;
  const b = bubbleAt !== undefined ? sp(f, bubbleAt, POP) : 0;
  return (
    <>
      <Person x={x} y={1640} look={LOOKS[look]} walk={f * 0.34} moving={moving} turn={turn} scale={scale} dir={dir} />
      {bubbleAt !== undefined && f >= bubbleAt ? <Bubble x={x} y={1640 - 300 * scale * (LOOKS[look].tall ?? 1)} p={b} text="😍" /> : null}
    </>
  );
};

// ---- 4. the real problem --------------------------------------------------------------
const Problem = ({tags}: {tags: number[]}) => {
  const f = useCurrentFrame();
  const labels = ['IMAGE BANALE', 'ZÉRO PERSONNALITÉ', 'PAS SÉRIEUX'];
  return (
    <AbsoluteFill>
      <Facade branded={false} />
      <Walker look={0} x0={-120} speed={9} />
      <Walker look={2} x0={1200} speed={7} dir={-1} start={40} />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={140} color={A.ink}>LE VRAI PROBLÈME ?</Line>
      </div>
      <div style={{position: 'absolute', left: 90, top: 900, display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'flex-start'}}>
        {labels.map((l, i) => {
          const p = sp(f, tags[i], POP);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, background: A.white, borderRadius: 18, padding: '14px 34px 8px 18px', boxShadow: '0 14px 30px rgba(0,0,0,.3)', transform: `scale(${p}) rotate(${i % 2 ? 2 : -2}deg)`, opacity: f < tags[i] ? 0 : 1}}>
              <div style={{width: 76, height: 76, borderRadius: 38, background: A.red, color: A.white, fontFamily: SANS, fontWeight: 800, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6}}>✕</div>
              <div style={{fontFamily: COND, fontSize: 92, lineHeight: 1, color: A.ink}}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- 5. big chains invest millions ------------------------------------------------------
const Pylon = ({x, h, d, children, color}: {x: number; h: number; d: number; children: React.ReactNode; color: string}) => {
  const f = useCurrentFrame();
  const p = sp(f, d, {damping: 13, stiffness: 120});
  const on = clampI(f, d + 10, d + 14, 0.2, 1);
  return (
    <div style={{position: 'absolute', left: x - 130, top: 1540 - h + (1 - p) * h, width: 260, height: h}}>
      <div style={{position: 'absolute', left: 115, top: 240, width: 30, bottom: 0, background: '#3A3D48'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 260, height: 260, borderRadius: 30, background: color, boxShadow: `0 0 ${90 * on}px ${color}`, opacity: on, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

const Chains = ({millionsAt, imageAt}: {millionsAt: number; imageAt: number}) => {
  const f = useCurrentFrame();
  const rolling = f < millionsAt;
  const digits = String(1000000 + ((f * 7919 * 13) % 8999999)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const stamp = sp(f, millionsAt, POP);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0E1530 0%,#1D2550 60%,#2A2C33 100%)'}}>
      {Array.from({length: 40}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i * 263) % 1080, top: (i * 137) % 700 + 40, width: 4, height: 4, borderRadius: 2, background: '#fff', opacity: 0.3 + 0.3 * Math.sin(f / 6 + i)}} />
      ))}
      <Pylon x={210} h={760} d={4} color="#E0A030">
        <svg width="150" height="150" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#fff" /><path d="M30 55 q20 25 40 0" stroke="#E0A030" strokeWidth="9" fill="none" strokeLinecap="round" /><circle cx="37" cy="40" r="6" fill="#E0A030" /><circle cx="63" cy="40" r="6" fill="#E0A030" /></svg>
      </Pylon>
      <Pylon x={540} h={900} d={0} color={A.redHi}>
        <div style={{fontFamily: COND, fontSize: 210, color: '#fff', lineHeight: 1, marginTop: 20}}>★</div>
      </Pylon>
      <Pylon x={870} h={700} d={8} color="#2E7D5B">
        <svg width="150" height="150" viewBox="0 0 100 100"><path d="M50 12 C80 30 82 70 50 88 C18 70 20 30 50 12Z" fill="#fff" /><path d="M50 25 V80" stroke="#2E7D5B" strokeWidth="6" /></svg>
      </Pylon>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1540, bottom: 0, background: '#1A1B20'}} />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={120}>LES GRANDES CHAÎNES</Line>
        <Line d={6} size={84} color="rgba(255,255,255,.8)">INVESTISSENT</Line>
        <div style={{height: 180, position: 'relative'}}>
          {rolling ? (
            <div style={{fontFamily: COND, fontSize: 170, lineHeight: 1.05, color: A.warm, opacity: clampI(f, 8, 12, 0, 1)}}>{digits} $</div>
          ) : (
            <div style={{fontFamily: COND, fontSize: 190, lineHeight: 0.95, color: A.warm, transform: `scale(${interpolate(stamp, [0, 1], [1.8, 1])}) rotate(-2deg)`}}>DES MILLIONS $</div>
          )}
        </div>
        <Line d={imageAt - 2} size={96}>DANS LEUR IMAGE</Line>
      </div>
    </AbsoluteFill>
  );
};

// ---- 6. invest in yours: bland -> KOMÉ ----------------------------------------------
const Flip = ({investAt}: {investAt: number}) => {
  const f = useCurrentFrame();
  const w = clampI(f, investAt, investAt + 14, 0, 1);
  const ease = 1 - (1 - w) ** 3;
  return (
    <AbsoluteFill>
      <Facade branded={false} />
      <AbsoluteFill style={{clipPath: `polygon(0 0, ${ease * 140}% 0, ${ease * 140 - 40}% 100%, 0 100%)`}}>
        <Facade branded />
      </AbsoluteFill>
      {w > 0 && w < 1 ? (
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${ease * 120 - 20}%`, width: 30, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff, rgba(255,255,255,0))', transform: 'skewX(-12deg)', boxShadow: '0 0 60px #fff'}} />
      ) : null}
      <Walker look={1} x0={-140} speed={11} stopAt={investAt + 26} lookAt={investAt + 20} bubbleAt={investAt + 24} />
      <Walker look={3} x0={1220} speed={10} dir={-1} stopAt={investAt + 34} lookAt={investAt + 26} bubbleAt={investAt + 31} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={120} color={w > 0.5 ? K.green : A.ink}>POUR BIEN DÉMARRER,</Line>
        <div style={{marginTop: 18}}>
          <Pill text="INVESTISSEZ DANS LA VÔTRE" d={investAt} size={92} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- 7. KOMÉ reveal --------------------------------------------------------------------
const Arcs = ({f}: {f: number}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {[
      [90, 300, K.pink],
      [1000, 520, K.green],
      [60, 1500, K.green],
      [980, 1650, K.pink],
    ].map(([x, y, c], i) => (
      <path key={i} d={`M${(x as number) - 120} ${y} a120 120 0 0 1 240 0`} fill="none" stroke={c as string} strokeWidth="44" strokeLinecap="round" transform={`rotate(${Math.sin(f / 20 + i) * 8 + i * 40} ${x} ${y})`} opacity=".9" />
    ))}
  </svg>
);

const Kome = ({signAt}: {signAt: number}) => {
  const f = useCurrentFrame();
  const p = sp(f, 0, {damping: 14, stiffness: 140});
  return (
    <AbsoluteFill style={{background: K.cream}}>
      <Arcs f={f} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={80} color={K.green}>EXEMPLE : UN BRANDING FEEHA</Line>
      </div>
      <div style={{position: 'absolute', left: 90, top: 230, width: 900, height: 1125, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.25)', transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) rotate(${(1 - p) * 6}deg)`}}>
        <Img src={staticFile('brand/kome1.jpg')} style={{width: 900, height: 1125, objectFit: 'cover', transform: `scale(${1 + f * 0.0012})`}} />
      </div>
      <div style={{position: 'absolute', top: 1380, left: 0, right: 0, textAlign: 'center'}}>
        <Pill text="IDENTITÉ SIGNÉE FEEHA" d={signAt} bg={K.green} size={86} />
      </div>
    </AbsoluteFill>
  );
};

// ---- 8. everything speaks the same language ----------------------------------------
const Items = ({hits, toutAt}: {hits: number[]; toutAt: number}) => {
  const f = useCurrentFrame();
  const photos = ['kome2', 'kome3', 'kome4', 'kome5'];
  const chips = ['LOGO', 'EMBALLAGES', 'MENUS', 'ENSEIGNE'];
  const grid = sp(f, toutAt - 4, {damping: 15, stiffness: 130});
  return (
    <AbsoluteFill style={{background: K.cream}}>
      <Arcs f={f + 60} />
      {photos.map((ph, i) => {
        const p = sp(f, hits[i], {damping: 14, stiffness: 160});
        // deck position
        const dx = interpolate(p, [0, 1], [1100, 0]) + (i - 1.5) * 10;
        const rot = interpolate(p, [0, 1], [18, (i - 1.5) * 3]);
        // grid position
        const gx = i % 2 ? 550 : 50;
        const gy = i < 2 ? 250 : 870;
        const x = interpolate(grid, [0, 1], [110 + dx, gx]);
        const y = interpolate(grid, [0, 1], [240, gy]);
        const w = interpolate(grid, [0, 1], [860, 480]);
        return (
          <div key={ph} style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.25, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.25)', transform: `rotate(${rot * (1 - grid)}deg)`, opacity: f < hits[i] ? 0 : 1, border: '8px solid #fff'}}>
            <Img src={staticFile(`brand/${ph}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1360, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', padding: '0 30px', opacity: 1 - grid}}>
        {chips.map((c, i) => {
          const p = sp(f, hits[i], POP);
          return (
            <div key={c} style={{fontFamily: COND, fontSize: 64, lineHeight: 1, color: K.cream, background: K.green, padding: '12px 22px 4px', borderRadius: 14, transform: `scale(${p})`, opacity: f < hits[i] ? 0 : 1}}>
              ✓ {c}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', opacity: 1 - grid}}>
        <Line d={0} size={84} color={K.green}>UNE IDENTITÉ COMPLÈTE</Line>
      </div>
      {f >= toutAt - 4 ? (
        <div style={{position: 'absolute', top: 1500 - 30, left: 0, right: 0, textAlign: 'center'}} />
      ) : null}
      <div style={{position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', opacity: 0}} />
      <div style={{position: 'absolute', top: 800, left: 0, right: 0, textAlign: 'center'}}>
        <Pill text="TOUT PARLE LA MÊME LANGUE" d={toutAt} bg={K.pink} color={K.green} size={84} />
      </div>
    </AbsoluteFill>
  );
};

// ---- 9. prices ---------------------------------------------------------------------------
const SignArt = ({f}: {f: number}) => {
  const on = f < 8 ? (f % 4 < 2 ? 0.3 : 1) : 1;
  return (
    <div style={{position: 'relative', width: 900, height: 560}}>
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,#8C3A2B 0 38px,#7A3125 38px 42px)', borderRadius: 20}} />
      <div style={{position: 'absolute', left: 70, top: 110, width: 760, height: 250, background: K.cream, borderRadius: 20, boxShadow: `0 0 ${90 * on}px rgba(255,230,170,${on}), 0 14px 0 rgba(0,0,0,.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 + 0.6 * on}}>
        <Img src={staticFile('brand/kome-logo.png')} style={{height: 220}} />
      </div>
      <div style={{position: 'absolute', left: 340, top: 400, width: 220, height: 130, borderRadius: 65, background: K.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: COND, fontSize: 70, color: K.cream, boxShadow: '0 10px 0 rgba(0,0,0,.3)'}}>OUVERT</div>
    </div>
  );
};

const MenuArt = ({f}: {f: number}) => {
  const pics = ['brand/kome-box.jpg', 'brand/kome-roll.jpg', 'brand/kome-chop.jpg'];
  const k = Math.floor(f / 30) % 3;
  const dishes = ['CLASSIC ROLL', 'SAUMON TERIYAKI', 'POKÉ BOWL', 'GYOZAS ×6', 'MISO'];
  return (
    <div style={{position: 'relative', width: 900, height: 560, background: '#111', borderRadius: 26, padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
      <div style={{position: 'absolute', inset: 22, background: K.green, borderRadius: 10, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 36, top: 26, fontFamily: COND, fontSize: 64, color: K.pink}}>MENU</div>
        {dishes.map((d, i) => (
          <div key={d} style={{position: 'absolute', left: 36, top: 110 + i * 72, width: 400, display: 'flex', justifyContent: 'space-between', fontFamily: COND, fontSize: 46, color: K.cream, opacity: clampI(f, 4 + i * 3, 8 + i * 3, 0, 1)}}>
            <span>{d}</span>
            <span style={{color: K.pink}}>{[14, 17, 16, 9, 4][i]}$</span>
          </div>
        ))}
        <Img src={staticFile(pics[k])} style={{position: 'absolute', right: 0, top: 0, width: 400, height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', left: 410, bottom: -70, width: 80, height: 70, background: '#2A2A2A'}} />
    </div>
  );
};

const PanelsArt = ({f}: {f: number}) => {
  const glow = 0.75 + 0.25 * Math.sin(f / 5);
  const frame = (x: number, pic: string, sway: number) => (
    <div style={{position: 'absolute', left: x, top: 0, width: 360, height: 560, transform: `rotate(${sway}deg)`, transformOrigin: '50% 0'}}>
      <div style={{position: 'absolute', left: 40, top: 0, width: 3, height: 70, background: '#888'}} />
      <div style={{position: 'absolute', right: 40, top: 0, width: 3, height: 70, background: '#888'}} />
      <div style={{position: 'absolute', left: 0, top: 70, width: 360, height: 490, background: '#1A1A1A', borderRadius: 12, padding: 14, boxShadow: `0 0 ${70 * glow}px rgba(255,236,190,${0.9 * glow})`}}>
        <Img src={staticFile(pic)} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, filter: `brightness(${1 + 0.15 * glow})`}} />
      </div>
    </div>
  );
  return (
    <div style={{position: 'relative', width: 900, height: 560}}>
      {frame(60, 'brand/kome1.jpg', Math.sin(f / 14) * 1.5)}
      {frame(480, 'brand/kome-box.jpg', Math.sin(f / 14 + 1) * 1.5)}
    </div>
  );
};

const Shirt = ({color, ink, x, rot}: {color: string; ink: string; x: number; rot: number}) => (
  <div style={{position: 'absolute', left: x, top: 20, width: 420, height: 500, transform: `rotate(${rot}deg)`}}>
    <svg width={420} height={500} viewBox="0 0 420 500">
      <path d="M140 20 Q210 70 280 20 L400 80 L360 190 L320 170 L320 480 L100 480 L100 170 L60 190 L20 80 Z" fill={color} stroke="rgba(0,0,0,.15)" strokeWidth="4" />
      <path d="M140 20 Q210 70 280 20" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="8" />
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: HEAVY, fontWeight: 850, fontSize: 64, color: ink, letterSpacing: 1}}>KOMÉ</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
      <svg width="120" height="60" viewBox="0 0 120 60"><path d="M10 55 a50 50 0 0 1 100 0" fill="none" stroke={K.pink} strokeWidth="14" strokeLinecap="round" /></svg>
    </div>
  </div>
);
const UniformArt = ({f}: {f: number}) => (
  <div style={{position: 'relative', width: 900, height: 560}}>
    <Shirt color={K.green} ink={K.cream} x={60 + Math.sin(f / 10) * 4} rot={-5} />
    <Shirt color={K.cream} ink={K.green} x={420 - Math.sin(f / 10) * 4} rot={5} />
  </div>
);

const PhotoArt = (src: string, pos: string) => {
  const C = ({f}: {f: number}) => (
    <div style={{width: 900, height: 560, borderRadius: 26, overflow: 'hidden', border: '8px solid #fff', boxShadow: '0 30px 60px rgba(0,0,0,.25)'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.04 + f * 0.001})`}} />
    </div>
  );
  return C;
};

const ITEMS = [
  {name: 'ENSEIGNE & VITRINE', price: '899,99 $ À 3 400 $', short: '899,99 – 3 400 $', Art: HAVE_PHOTOS ? PhotoArt('brand/vitrine.jpg', '50% 38%') : SignArt},
  {name: 'MENUS SUR ÉCRAN', price: '150 $ À 300 $ / ÉCRAN', short: '150 – 300 $ / écran', Art: MenuArt},
  {name: '2 PANNEAUX LUMINEUX FEEHA', price: '700 $', short: '700 $', Art: PanelsArt},
  {name: 'UNIFORMES', price: 'DÈS 29,99 $ / UNITÉ', short: 'dès 29,99 $ / unité', Art: HAVE_PHOTOS ? PhotoArt('brand/merch.jpg', '50% 30%') : UniformArt},
];

const Prices = ({hits}: {hits: number[]}) => {
  const f = useCurrentFrame();
  const cur = hits.reduce((acc, h, i) => (f >= h - 3 ? i : acc), 0);
  const h0 = hits[cur] - 3;
  const p = sp(f, h0, {damping: 13, stiffness: 160});
  const price = sp(f, h0 + 10, POP);
  const {Art} = ITEMS[cur];
  return (
    <AbsoluteFill style={{background: A.cream}}>
      <div style={{position: 'absolute', top: 100, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={104} color={A.red}>LE PACK BRANDING FEEHA</Line>
      </div>
      <div style={{position: 'absolute', top: 225, left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontSize: 74, color: A.ink, transform: `translateY(${(1 - p) * 30}px)`, opacity: p}}>{ITEMS[cur].name}</div>
      <div style={{position: 'absolute', left: 90, top: 320, transform: `scale(${interpolate(p, [0, 1], [0.5, 1])}) translateX(${(1 - p) * 300}px)`, opacity: p}}>
        <Art f={f - h0} />
      </div>
      <div style={{position: 'absolute', top: 905, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: COND, fontSize: 120, lineHeight: 1, color: A.white, background: A.red, padding: '16px 44px 6px', borderRadius: 18, transform: `rotate(-2deg) scale(${interpolate(price, [0, 1], [1.8, 1])})`, opacity: f < h0 + 10 ? 0 : 1, boxShadow: '0 12px 0 rgba(0,0,0,.2)'}}>
          {ITEMS[cur].price}
        </div>
      </div>
      {/* running list */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 1110, display: 'flex', flexDirection: 'column', gap: 10}}>
        {ITEMS.map((it, i) => {
          const q = sp(f, hits[i] + 14, {damping: 14, stiffness: 180});
          const active = i === cur;
          return (
            <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 26px 6px', borderRadius: 14, background: active ? A.ink : 'rgba(20,19,23,.07)', color: active ? A.white : A.ink, fontFamily: COND, fontSize: 52, lineHeight: 1, opacity: f < hits[i] + 14 ? 0 : 1, transform: `translateX(${(1 - q) * -200}px)`}}>
              <span>✓ {it.name}</span>
              <span style={{color: active ? A.warm : A.red}}>{it.short}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- 10. total ---------------------------------------------------------------------------
const Total = ({countAt}: {countAt: number}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [2, countAt + 22], [0, 2999], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (v) => 1 - (1 - v) ** 3}));
  const done = f >= countAt + 22;
  const thump = done ? 1 + 0.08 * Math.max(0, 1 - (f - countAt - 22) / 8) : 1;
  const incl = ['LOGO', 'IDENTITÉ VISUELLE', 'ENSEIGNE', 'MENUS'];
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${A.redHi} 0%, ${A.red} 45%, ${A.deep} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.12}}>
        {Array.from({length: 18}).map((_, i) => {
          const a = (i / 18) * Math.PI * 2 + f / 60;
          return <path key={i} d={`M540 760 L${540 + Math.cos(a) * 1600} ${760 + Math.sin(a) * 1600} L${540 + Math.cos(a + 0.12) * 1600} ${760 + Math.sin(a + 0.12) * 1600}Z`} fill="#fff" />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={120}>VOTRE BRANDING COMPLET</Line>
        <Line d={8} size={96} color={A.warm}>À PARTIR DE</Line>
        <div style={{fontFamily: COND, fontSize: 380, lineHeight: 0.9, color: A.white, marginTop: 10, transform: `scale(${thump})`, textShadow: '0 16px 0 rgba(0,0,0,.25)', opacity: clampI(f, 0, 3, 0, 1)}}>
          {n.toLocaleString('fr-CA').replace(/\s/g, ' ')} $
        </div>
      </div>
      <div style={{position: 'absolute', top: 880, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16}}>
        {incl.map((c, i) => {
          const p = sp(f, countAt + 28 + i * 4, POP);
          return (
            <div key={c} style={{fontFamily: COND, fontSize: 70, lineHeight: 1, color: A.red, background: A.cream, padding: '14px 28px 6px', borderRadius: 14, transform: `scale(${p})`, opacity: f < countAt + 28 + i * 4 ? 0 : 1}}>
              ✓ {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- 11. Montreal's biggest franchises -------------------------------------------------
const Skyline = ({f}: {f: number}) => {
  const b = [
    [0, 180, 300], [110, 120, 420], [235, 150, 520], [390, 110, 380], [505, 140, 640], [650, 120, 460], [775, 160, 560], [940, 140, 360],
  ];
  return (
    <svg width={1080} height={800} style={{position: 'absolute', left: 0, top: 860}}>
      {/* the mountain */}
      <path d="M0 520 Q300 300 620 470 Q820 380 1080 500 V800 H0Z" fill="#1E2340" />
      {/* inclined tower (stade) */}
      <path d="M820 640 L900 300 L930 310 L880 640Z" fill="#141831" />
      {b.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={800 - h} width={w - 8} height={h} fill="#12152A" />
          {Array.from({length: Math.floor(h / 50)}).map((_, r) =>
            Array.from({length: Math.floor((w - 8) / 34)}).map((__, c) => {
              const lit = (i * 7 + r * 3 + c * 5 + Math.floor(f / 8)) % 5 !== 0;
              return <rect key={`${r}-${c}`} x={x + 10 + c * 34} y={800 - h + 18 + r * 50} width={16} height={22} fill={lit ? '#FFD48A' : '#2A2E4A'} opacity={lit ? 0.85 : 1} />;
            }),
          )}
        </g>
      ))}
    </svg>
  );
};

const Pro = ({franchAt}: {franchAt: number}) => {
  const f = useCurrentFrame();
  const logo = sp(f, 0, POP);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0E1530 0%,#2A1E3A 55%,#4A1620 100%)'}}>
      <Skyline f={f} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: A.white, padding: 10, borderRadius: 22, transform: `scale(${logo})`, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
          <Img src={staticFile('feeha/logo-clean.png')} style={{width: 420, display: 'block'}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={4} size={92}>PARTENAIRE DES PLUS</Line>
        <Line d={franchAt - 6} size={150} color={A.warm}>GRANDES FRANCHISES</Line>
        <Line d={franchAt + 6} size={110}>DE MONTRÉAL</Line>
      </div>
    </AbsoluteFill>
  );
};

// ---- 12. call to action -------------------------------------------------------------
const Cta = ({contactAt}: {contactAt: number}) => {
  const f = useCurrentFrame();
  const beat = 1 + 0.03 * Math.sin(f / 4);
  return (
    <AbsoluteFill style={{background: A.ink}}>
      <Img src={staticFile('brand/kome5.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1350, objectFit: 'cover', transform: `scale(${1 + f * 0.0006})`, transformOrigin: '50% 100%'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,19,23,0) 30%, rgba(20,19,23,.85) 55%, #141317 70%)'}} />
      <div style={{position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center'}}>
        <Line d={0} size={96}>LANCEZ VOTRE FRANCHISE</Line>
        <Line d={12} size={90} color={A.warm}>AVEC L'IMAGE DES PLUS GRANDS</Line>
      </div>
      <div style={{position: 'absolute', top: 1150, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 42, color: 'rgba(255,255,255,.85)', opacity: clampI(f, contactAt - 4, contactAt + 4, 0, 1)}}>
        Contactez-nous :
      </div>
      <div style={{position: 'absolute', top: 1215, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, transform: `scale(${beat})`}}>
        <Pill text="FEEHA.CA" d={contactAt} size={120} />
        <Pill text="FEEHAPANELS.COM" d={contactAt + 8} size={78} bg={A.white} color={A.red} rot={1.5} />
      </div>
    </AbsoluteFill>
  );
};

// ---- composition ---------------------------------------------------------------------
export const FeehaBrand = ({audio}: {audio: boolean}) => {
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
  const flash = interpolate(since, [0, 4], [0.28, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const SCENES: Record<string, React.ReactNode> = {
    hook: <Hook closeAt={at('hook', 'ferme', 38)} />,
    food: <Food excAt={at('food', 'bonne', 30)} />,
    problem: <Problem tags={[at('problem', 'banale', 30), at('problem', 'sans', 45), at('problem', 'sérieux', 55)]} />,
    chains: <Chains millionsAt={at('chains', 'millions', 50)} imageAt={at('chains', 'image', 70)} />,
    kome: <Kome signAt={at('kome', 'signé', 30)} />,
    prices: <Prices hits={[2, at('prices', 'menus', 90), at('prices', 'deux', 180), at('prices', 'uniformes', 250)]} />,
    total: <Total countAt={at('total', 'deux', 30)} />,
    pro: <Pro franchAt={at('pro', 'franchises', 40)} />,
    cta: <Cta contactAt={at('cta', 'feeha', 40)} />,
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
      {audio ? <Audio src={staticFile('brand-mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
