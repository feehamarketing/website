// « Le test des 3 secondes » — seen through the passenger window, at night, in the rain.
// Four invented restaurants (A–D) slide past in 3.5 s; then the camera rewinds and stops in front of each one.
// The camera is a position along the street s(t) (metres) and a scale k(t) (pixels per metre at the shop fronts).
import { V, PASS, CARD } from './times.js';
export const W = 1080, H = 1920, DUR = CARD;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const SHOP = { A: 4.5, B: 15, C: 25.5, D: 36 };   // centres (m), each 9 m wide
const S0 = -6, S1 = 41.5;
// ---------- the camera ----------
export function camS(t) {
  if (t < PASS[0]) return S0 + .6 * t;   // creeping, waiting
  if (t < PASS[1]) return S0 + .6 * PASS[0] + (S1 - S0 - .6 * PASS[0]) * seg(t, PASS[0], PASS[1]);
  const rw0 = V.v04 + 1.2, rw1 = rw0 + .9;
  if (t < rw0) return S1;                                   // frozen (the edit freezes the picture too)
  if (t < rw1) return S1 + (S0 - S1) * eio(seg(t, rw0, rw1));   // rewind
  const stops = [[rw1, SHOP.A], [V.v06 - .2, SHOP.B], [V.v07 - .2, SHOP.C], [V.v08 - .2, SHOP.D], [V.v09 + .1, SHOP.A]];
  let s = S0;
  for (let i = 0; i < stops.length; i++) { const [at, x] = stops[i], prev = i ? stops[i - 1][1] : S0, d = i === 0 ? .9 : i === 4 ? .6 : .6; if (t >= at) s = prev + (x - prev) * eio(seg(t, at, at + d)); }
  return s;
}
const camK = t => 150 + 25 * eio(seg(t, V.v08 + .4, V.v08 + 2.6)) * (t < V.v09 ? 1 : 0);
const camY = t => -40 * eio(seg(t, V.v08 + .4, V.v08 + 2.6)) * (t < V.v09 ? 1 : 0);
export const speed = t => Math.abs(camS(t + 1 / 60) - camS(t - 1 / 60)) * 30;   // m/s
// ---------- drawing helpers ----------
const RED = '#E11D2E';
function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function text(g, s, x, y, size, col, weight = 800, font = 'Montserrat, Arial, sans-serif', align = 'center') { g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function taco(g, x, y, w) {   // a simple taco: shell, lettuce, tomato
  g.save(); g.translate(x, y); g.scale(w / 200, w / 200);
  g.fillStyle = '#58B947'; g.beginPath(); for (let i = 0; i <= 10; i++) g.lineTo(-90 + i * 18, -38 + (i % 2) * 12); g.lineTo(90, 0); g.lineTo(-90, 0); g.fill();
  g.fillStyle = '#E2382C'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-50 + i * 34, -34, 11, 0, 7); g.fill(); }
  g.fillStyle = '#F2B636'; g.beginPath(); g.ellipse(0, 0, 100, 70, 0, 0, Math.PI); g.fill();
  g.strokeStyle = '#D18E1E'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 100, 70, 0, 0, Math.PI); g.stroke();
  g.restore();
}
// one storefront, drawn in local metres (0..9 wide, ground at y = 0, up is negative)
function shop(g, id, reveal, dim, t) {
  const brick = { A: '#5B3430', B: '#4C3D35', C: '#3A3442', D: '#5A3329' }[id];
  g.fillStyle = brick; g.fillRect(0, -8.2, 9, 8.2);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .03; for (let y = -8.2; y < 0; y += .24) { g.beginPath(); g.moveTo(0, y); g.lineTo(9, y); g.stroke(); }
  for (let c = 0; c < 3; c++) { const lit = hash(id.charCodeAt(0), c) > .45; g.fillStyle = lit ? '#E9C27E' : '#232A40'; g.fillRect(.8 + c * 2.8, -7.4, 1.8, 1.9); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(.7 + c * 2.8, -5.45, 2, .12); }
  // sign band
  g.fillStyle = '#121117'; g.fillRect(.3, -4.15, 8.4, .95);
  // window + door
  const win = { x: .5, y: -3.05, w: 6.2, h: 2.6 };
  const interior = { A: '#151A2C', B: '#6A4E30', C: '#7A5434', D: '#6A4430' }[id];
  g.fillStyle = interior; g.fillRect(win.x, win.y, win.w, win.h);
  if (id !== 'A') { const ig = g.createLinearGradient(0, win.y, 0, win.y + win.h); ig.addColorStop(0, 'rgba(255,220,160,.35)'); ig.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = ig; g.fillRect(win.x, win.y, win.w, win.h);
    for (const x of [1.4, 3.6, 5.6]) { g.fillStyle = 'rgba(40,22,14,.7)'; g.fillRect(x - .5, -1.05, 1, .08); g.fillRect(x - .04, -.97, .08, .5); } }
  g.fillStyle = id === 'A' ? '#0D1020' : '#3A2418'; g.fillRect(7.1, -3.05, 1.5, 3.05);
  g.strokeStyle = '#0C0B10'; g.lineWidth = .12; g.strokeRect(win.x, win.y, win.w, win.h); g.strokeRect(7.1, -3.05, 1.5, 3.05);
  g.fillStyle = 'rgba(240,244,250,.85)'; g.fillRect(win.x - .1, -.42, win.w + .2, .07);
  if (id === 'A') {   // CASA LUPE — dull sign, dark window, a small taped poster (it sells tacos too…)
    text(g, 'CASA LUPE', 4.5, -3.68, .62, '#4E454C', 800);
    g.save(); g.translate(4.6, -1.9); g.rotate(-.04);
    g.fillStyle = '#C9BFA9'; g.fillRect(-.45, -.62, .9, 1.24);
    g.fillStyle = '#B44A3A'; g.fillRect(-.45, -.62, .9, .28); text(g, 'TACOS', 0, -.48, .17, '#F4E8D2', 900);
    taco(g, 0, -.02, .62); text(g, '3 pour 12 $', 0, .38, .12, '#5A4A40', 700);
    g.fillStyle = 'rgba(230,226,205,.8)'; g.fillRect(-.55, -.7, .3, .1); g.fillRect(.25, -.7, .3, .1);
    g.fillStyle = `rgba(10,14,30,${.72 * (1 - reveal)})`; g.fillRect(-.5, -.68, 1, 1.36);   // the dark window swallows it
    g.restore();
    if (reveal > 0) glow(g, 4.6, -1.9, 1.4, 'rgba(255,240,200,A)', .35 * reveal);
  }
  if (id === 'B') {   // SAVEURS DU MONDE — every inch of glass covered with small print
    text(g, 'SAVEURS DU MONDE', 4.5, -3.68, .44, '#E8D8B8', 800);
    for (let i = 0; i < 12; i++) { const x = .7 + (i % 6) * 1.0, y = -2.9 + Math.floor(i / 6) * 1.25, w = .8 + hash(i, 2) * .12, h = 1.0;
      g.fillStyle = ['#F2E9D8', '#F6D35B', '#E8F0F8', '#F7C9C0'][i % 4]; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(30,30,30,.7)'; for (let r = 0; r < 7; r++) g.fillRect(x + .06, y + .12 + r * .12, w * (.5 + hash(i, r) * .4), .04); }
  }
  if (id === 'C') {   // LE GRAND COMPTOIR — beautiful neon name, nothing about what is sold
    g.save(); g.shadowColor = 'rgba(255,120,200,.9)'; g.shadowBlur = 30; text(g, 'Le Grand Comptoir', 4.5, -3.66, .55, '#FFD6F0', 700, 'Georgia, serif'); g.restore();
  }
  if (id === 'D') {   // CHEZ NICO — plain sign, but a lit panel with ONE offer
    text(g, 'CHEZ NICO', 4.5, -3.68, .5, '#D8D2C8', 800);
    const px = 2.35, py = -2.95, pw = 2.3, ph = 2.45;
    glow(g, px + pw / 2, py + ph / 2, 4, 'rgba(255,200,150,A)', .55);
    g.fillStyle = '#C9CED6'; g.fillRect(px - .08, py - .08, pw + .16, ph + .16);
    g.save(); g.shadowColor = 'rgba(255,235,200,1)'; g.shadowBlur = 60; g.fillStyle = RED; g.fillRect(px, py, pw, ph); g.restore();
    text(g, 'TACOS', px + pw / 2, py + .42, .5, '#FFFFFF', 900);
    taco(g, px + pw / 2, py + 1.3, 1.25);
    g.fillStyle = '#FFF6EC'; g.beginPath(); g.roundRect(px + .25, py + 1.78, pw - .5, .45, .22); g.fill();
    text(g, '3 POUR 12 $', px + pw / 2, py + 2.0, .27, RED, 900);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(px, py, pw, ph);
    g.fillStyle = 'rgba(255,190,130,.18)'; g.fillRect(px - .5, -.35, pw + 1, .35);
  }
  // the letter tag, so viewers can answer
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(4.5, -4.72, .36, 0, 7); g.fill(); text(g, id, 4.5, -4.7, .46, '#111', 900);
  if (dim > 0) { g.fillStyle = `rgba(4,6,14,${.62 * dim})`; g.fillRect(0, -8.2, 9, 8.2); }
}
// ---------- the street ----------
function world(g, t, s = camS(t), k = camK(t), gy = 1330 + camY(t)) {
  const X = x => 540 + (x - s) * k;
  // sky + far skyline (slow parallax)
  const sk = g.createLinearGradient(0, 0, 0, gy); sk.addColorStop(0, '#0B1024'); sk.addColorStop(1, '#2E2A40'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  for (let i = -10; i < 40; i++) { const x = 540 + (i * 7 - s * .25) * k * .5, w = (3 + hash(i, 1) * 4) * k * .5, h = (12 + hash(i, 2) * 20) * k * .5;
    g.fillStyle = '#151A2E'; g.fillRect(x, gy - 8.2 * k - h * .4, w, h); }
  // the four shops and the gaps between them
  g.save(); g.translate(0, gy);
  for (let x = -20; x < 60; x += 10.5) { g.fillStyle = '#2A2730'; g.fillRect(X(x - 1.5), -8.2 * k, 1.5 * k, 8.2 * k); }
  const dimOthers = seg(t, V.v10 + .2, V.v10 + .9);
  for (const id of ['A', 'B', 'C', 'D']) {
    const cx = SHOP[id];
    if (X(cx + 5) < -50 || X(cx - 5) > W + 50) continue;
    g.save(); g.translate(X(cx - 4.5), 0); g.scale(k, k);
    shop(g, id, id === 'A' ? seg(t, V.v09 + 1.1, V.v09 + 1.7) * (t < V.v10 + .3 ? 1 : .6) : 0, id !== 'D' ? dimOthers : 0, t);
    g.restore();
  }
  // sidewalk, kerb, road
  g.fillStyle = '#3E404C'; g.fillRect(0, 0, W, 1.6 * k); g.fillStyle = '#E9EDF3'; g.fillRect(0, 0, W, .08 * k);
  g.fillStyle = '#1B1C23'; g.fillRect(0, 1.6 * k, W, H);
  g.restore();
  // near layer: lamp posts and parking meters, faster parallax
  for (let i = -6; i < 30; i++) { const x = 540 + (i * 10.5 + 9.75 - s * 1.0) * k * 1.6; if (x < -100 || x > W + 100) continue;
    g.fillStyle = '#0A0A10'; g.fillRect(x - .1 * k, gy - 6.5 * k * 1.1, .2 * k, 6.5 * k * 1.1 + 1.6 * k);
    glow(g, x, gy - 6.5 * k * 1.1, 1.8 * k, 'rgba(255,200,120,A)', .55); }
  // rain in the air
  g.strokeStyle = 'rgba(190,210,240,.4)'; g.lineWidth = 2;
  for (let i = 0; i < 200; i++) { const x = (hash(i, 1) * 1400 - s * k * .3 + 40000) % 1300 - 100, y = (hash(i, 2) * H + t * (1900 + hash(i, 3) * 600)) % (H + 100) - 50; g.globalAlpha = .3 + hash(i, 4) * .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y - 50); g.stroke(); }
  g.globalAlpha = 1;
}
// the car: passenger window frame, drops on the glass, door panel
function car(g, t) {
  for (let i = 0; i < 90; i++) { const x = hash(i, 11) * W, y = 200 + hash(i, 12) * 1250, r = 4 + hash(i, 13) * 10, sl = (speed(t) > 2 ? ((t * 2 + hash(i, 14) * 5) % 1) * 30 : 0);
    g.fillStyle = 'rgba(200,215,240,.14)'; g.beginPath(); g.ellipse(x - sl, y, r * (1 + sl / 20), r, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - sl - r * .3, y - r * .35, r * .25, 0, 7); g.fill(); }
  g.fillStyle = '#07070B';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 150); g.quadraticCurveTo(540, 100, 0, 170); g.fill();
  g.beginPath(); g.moveTo(0, 1530); g.quadraticCurveTo(540, 1490, W, 1520); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = '#121219'; g.fillRect(0, 1600, W, 40); g.fillStyle = 'rgba(160,170,190,.25)'; g.fillRect(680, 1700, 260, 18);
  const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .45, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// motion blur along x when the car moves fast
const off = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : null;
// final comparison: A (top) against D (bottom), same street, same night
function split(g, t) {
  const e = eio(seg(t, V.v10 - .2, V.v10 + .5));
  world(g, t, SHOP.A, 150 - 30 * e, 1330 - 640 * e);                 // A slides into the top half
  if (e <= 0) return;
  g.save(); g.beginPath(); g.rect(0, H - 960 * e, W, 960 * e); g.clip();
  g.translate(0, H - 960 * e); world(g, t, SHOP.D, 120, 690); g.restore();   // D rises from below
  g.fillStyle = '#000'; g.fillRect(0, H - 960 * e - 5, W, 10);
}
export function render(g, t) {
  if (t >= V.v10 - .2) { split(g, t); if (t < V.v10 + .1) car(g, t); return; }
  const v = speed(t) * camK(t) / 30;   // px per frame
  if (off && v > 6) {
    const o = off.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); world(o, t);
    const n = 6, len = Math.min(140, v * .6);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) { g.globalAlpha = 1 / (i + 1); g.drawImage(off, (i / (n - 1) - .5) * len, 0); }
    g.globalAlpha = 1;
  } else world(g, t);
  car(g, t);
}
export function texts() { return []; }
export function events() { return [{ t: PASS[0], type: 'pass' }, { t: PASS[1], type: 'freeze' }, { t: V.v04 + 1.2, type: 'rewind' }]; }
