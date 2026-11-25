// « Le plat invisible » — every picture generated in code (no photo, no reference).
// One illustrated night street and one restaurant; shots are camera moves on that world, plus a food close-up and the install beats.
// Giant type is drawn BETWEEN the background and the foreground person, so it sits behind him with a clean edge.
import { L } from './times.js';
export const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3), eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const back = k => { const c = 1.8; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const RED = '#E11D2E', INK = '#0E0C12', CREAM = '#FFF6EC';
export const CLICK = L.l07 + .45;
export const SHOTS = [
  ['hookA', 0], ['hookB', L.l02], ['dark', 3.8], ['walk', 5.9], ['plat', 7.6], ['back', 9.6],
  ['kit', 10.0], ['hang', 10.8], ['slide', 11.6], ['ready', 12.4], ['switch', 13.2], ['stop', 15.4], ['queue', 17.4], ['hero', 19.7],
];
export const DUR = 21.8;
const shotAt = t => { let i = 0; SHOTS.forEach((s, k) => { if (t >= s[1]) i = k; }); return { id: SHOTS[i][0], t0: SHOTS[i][1], t1: (SHOTS[i + 1] || [0, DUR])[1], i }; };

// ---------------- the world: one street, one restaurant ----------------
const GROUND = 1330, WIN = { x: 120, y: 560, w: 700, h: 640 }, PAN = { x: 300, y: 610, w: 330, h: 470 }, DOOR = { x: 870, y: 560, w: 170, h: 700 };
function sky(g) {
  const s = g.createLinearGradient(0, -900, 0, 400); s.addColorStop(0, '#141B36'); s.addColorStop(1, '#2C3560');
  g.fillStyle = s; g.fillRect(-1400, -1400, 3900, 1900);
}
function neighbour(g, x0, w, lit, seed) {   // other storefronts: plain, a bit dim
  g.fillStyle = ['#3B3442', '#40353A', '#35363F'][seed % 3]; g.fillRect(x0, 120, w, GROUND - 120);
  g.fillStyle = '#211E27'; g.fillRect(x0 + 40, 330, w - 80, 120);
  g.fillStyle = lit ? '#5C4A3A' : '#1C2030'; g.fillRect(x0 + 60, 560, w - 120, 600);
  g.strokeStyle = '#141218'; g.lineWidth = 18; g.strokeRect(x0 + 60, 560, w - 120, 600);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { g.fillStyle = hash(seed * 7 + r, c) > .5 ? '#E8C27A' : '#262B3E'; g.fillRect(x0 + 70 + c * (w - 140) / 3, -60 - r * 200, (w - 220) / 3, 140); }
}
function facade(g, lit, signOn) {
  sky(g);
  neighbour(g, -1180, 1100, false, 1); neighbour(g, 1160, 1100, false, 2);
  // upper floors
  g.fillStyle = '#5A3530'; g.fillRect(0, -700, W, 860);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const on = hash(r, c + 9) > .55; g.fillStyle = on ? '#F0C77E' : '#283049'; g.fillRect(110 + c * 310, -620 + r * 250, 230, 170); g.fillStyle = '#3E2420'; g.fillRect(100 + c * 310, -450 + r * 250, 250, 18); }
  // brick ground floor, lifted by the lamp
  g.fillStyle = lit ? '#7A3F35' : '#6A3832'; g.fillRect(0, 160, W, GROUND - 160);
  g.strokeStyle = 'rgba(40,16,14,.35)'; g.lineWidth = 3;
  for (let y = 160; y < GROUND; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = ((y / 34) % 2) * 45; x < W; x += 90) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
  // sign
  g.fillStyle = '#16131A'; g.beginPath(); g.roundRect(90, 300, 900, 190, 18); g.fill();
  g.font = '120px Anton'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = signOn ? 'rgba(255,90,90,.9)' : 'transparent'; g.shadowBlur = signOn ? 40 : 0;
  g.fillStyle = signOn ? CREAM : '#4A3F46'; g.fillText('CHEZ LOU', W / 2, 400); g.shadowBlur = 0;
  // awning lamp
  g.fillStyle = '#1B1A20'; g.fillRect(500, 250, 80, 30);
  // window
  const wg = g.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h);
  wg.addColorStop(0, lit ? '#6B4630' : '#1A2036'); wg.addColorStop(1, lit ? '#3A2418' : '#0F1324');
  g.fillStyle = wg; g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  // interior hints: tables, pendant lamps
  g.fillStyle = lit ? 'rgba(40,22,14,.7)' : 'rgba(10,12,22,.8)';
  for (const x of [190, 690]) { g.fillRect(x - 60, 1080, 120, 16); g.fillRect(x - 6, 1096, 12, 90); }
  for (const x of [230, 720]) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, WIN.y); g.lineTo(x, 660); g.stroke();
    g.fillStyle = lit ? '#F3C27A' : '#3A3F55'; g.beginPath(); g.arc(x, 672, 22, Math.PI, 0); g.fill(); }
  g.strokeStyle = '#141218'; g.lineWidth = 22; g.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h);
  g.fillStyle = '#EDEFF4'; g.fillRect(WIN.x - 20, WIN.y + WIN.h + 4, WIN.w + 40, 18);   // snow on the sill
  // door
  g.fillStyle = lit ? '#5A3826' : '#1A1E30'; g.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  g.strokeStyle = '#141218'; g.lineWidth = 16; g.strokeRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  g.fillStyle = '#A9ADB5'; g.fillRect(DOOR.x + 128, DOOR.y + 360, 12, 70);
  // sidewalk and street
  g.fillStyle = '#4A4C58'; g.fillRect(-1400, GROUND, 3900, 270);
  g.fillStyle = '#EEF2F7'; g.fillRect(-1400, GROUND, 3900, 16);
  g.fillStyle = '#23252E'; g.fillRect(-1400, GROUND + 270, 3900, 900);
  g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = -1400; x < 2500; x += 260) g.fillRect(x, GROUND + 520, 140, 14);
  // street lamp (left) and its warm pool
  g.fillStyle = '#121117'; g.fillRect(-90, 0, 16, GROUND + 120); g.fillRect(-90, 0, 120, 14);
  const lp = g.createRadialGradient(20, GROUND + 80, 10, 20, GROUND + 80, 520); lp.addColorStop(0, 'rgba(255,200,130,.35)'); lp.addColorStop(1, 'rgba(255,200,130,0)');
  g.fillStyle = lp; g.fillRect(-500, GROUND - 300, 1100, 700);
}
// what hangs in the window: 'taped' faded poster, or the Feeha panel (k: poster slid in 0→1, glow 0→1)
function windowContent(g, mode, k = 1, glow = 0) {
  const cx = PAN.x + PAN.w / 2, cy = PAN.y + PAN.h / 2;
  if (mode === 'taped') {
    g.save(); g.translate(cx, cy); g.rotate(-.035);
    g.fillStyle = '#8D8478'; g.fillRect(-PAN.w / 2 + 20, -PAN.h / 2 + 30, PAN.w - 40, PAN.h - 60);
    g.fillStyle = '#9A6E62'; g.fillRect(-PAN.w / 2 + 20, -PAN.h / 2 + 30, PAN.w - 40, 80);
    g.fillStyle = '#A99A84'; g.beginPath(); g.ellipse(0, 40, 92, 58, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(230,226,205,.7)'; g.fillRect(-PAN.w / 2 + 6, -PAN.h / 2 + 20, 70, 24); g.fillRect(PAN.w / 2 - 76, -PAN.h / 2 + 20, 70, 24);
    g.fillStyle = 'rgba(12,16,30,.45)'; g.fillRect(-PAN.w / 2 + 20, -PAN.h / 2 + 30, PAN.w - 40, PAN.h - 60);   // nobody can read it at night
    g.restore(); return;
  }
  if (mode === 'none') return;
  // cables + spill
  g.strokeStyle = 'rgba(200,205,215,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(PAN.x + 30, WIN.y); g.lineTo(PAN.x + 30, PAN.y); g.moveTo(PAN.x + PAN.w - 30, WIN.y); g.lineTo(PAN.x + PAN.w - 30, PAN.y); g.stroke();
  if (glow > 0) {
    let rg = g.createRadialGradient(cx, cy, 60, cx, cy, 700); rg.addColorStop(0, `rgba(255,205,160,${.6 * glow})`); rg.addColorStop(1, 'rgba(255,205,160,0)');
    g.fillStyle = rg; g.fillRect(-300, 200, 1700, 1500);
    rg = g.createRadialGradient(cx, GROUND + 80, 20, cx, GROUND + 80, 560); rg.addColorStop(0, `rgba(255,180,130,${.45 * glow})`); rg.addColorStop(1, 'rgba(255,180,130,0)');
    g.fillStyle = rg; g.fillRect(-300, GROUND, 1700, 320);
  }
  panelArt(g, PAN.x, PAN.y, PAN.w, PAN.h, k, glow);
}
function panelArt(g, x, y, w, h, k, glow) {   // aluminium frame, light guide, poster sliding in from the top
  g.fillStyle = '#C9CED6'; g.fillRect(x - w * .045, y - w * .045, w * 1.09, h + w * .09);
  g.fillStyle = glow > 0 ? `rgb(${210 + 45 * glow},${212 + 40 * glow},${215 + 35 * glow})` : '#B9BDC4'; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.translate(0, (k - 1) * h * 1.05);
  g.shadowColor = `rgba(255,230,200,${glow})`; g.shadowBlur = 70 * glow;
  g.fillStyle = RED; g.fillRect(x, y, w, h); g.shadowBlur = 0;
  const u = w / 330;
  g.fillStyle = CREAM; g.font = `${62 * u}px Anton`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText('LE SMASH', x + w / 2, y + 92 * u); g.font = `${36 * u}px Anton`; g.fillStyle = '#FFD24A'; g.fillText('DE LA MAISON', x + w / 2, y + 136 * u);
  burger(g, x + w / 2, y + 270 * u, 190 * u);
  g.fillStyle = CREAM; g.beginPath(); g.roundRect(x + 70 * u, y + 385 * u, w - 140 * u, 56 * u, 28 * u); g.fill();
  g.fillStyle = RED; g.font = `${38 * u}px Anton`; g.fillText('14,99 $', x + w / 2, y + 427 * u);
  g.fillStyle = `rgba(255,255,255,${.16 * glow})`; g.fillRect(x, y, w, h);
  g.restore();
  if (glow <= 0) { g.fillStyle = 'rgba(14,18,34,.55)'; g.fillRect(x, y, w, h); }   // unlit at night: you barely see it
}
// a generated smash burger, centred at (x, y), width w
function burger(g, x, y, w) {
  const s = w / 200;
  g.save(); g.translate(x, y); g.scale(s, s);
  let gr = g.createLinearGradient(0, 30, 0, 70); gr.addColorStop(0, '#E8A247'); gr.addColorStop(1, '#B86A26');
  g.fillStyle = gr; g.beginPath(); g.roundRect(-92, 34, 184, 36, [6, 6, 26, 26]); g.fill();                     // bottom bun
  g.fillStyle = '#5DBB3F'; g.beginPath(); g.moveTo(-104, 30); for (let i = 0; i <= 26; i++) g.lineTo(-104 + i * 8, 30 + (i % 2 ? 12 : 0)); g.lineTo(104, 22); g.lineTo(-104, 22); g.fill();   // lettuce
  for (const yy of [6, -18]) { gr = g.createLinearGradient(0, yy - 10, 0, yy + 16); gr.addColorStop(0, '#6B3A22'); gr.addColorStop(1, '#3E1F12'); g.fillStyle = gr; g.beginPath(); g.roundRect(-98, yy - 8, 196, 26, 12); g.fill();
    g.fillStyle = 'rgba(30,12,6,.55)'; for (let i = 0; i < 14; i++) g.fillRect(-88 + i * 13, yy - 2 + (i % 3) * 5, 5, 3);
    g.fillStyle = '#FFC531'; g.beginPath(); g.moveTo(-96, yy - 10); g.lineTo(96, yy - 10); g.lineTo(90, yy + 2); g.lineTo(60, yy + 4); g.lineTo(52, yy + 22); g.lineTo(44, yy + 4); g.lineTo(-20, yy + 4); g.lineTo(-28, yy + 18); g.lineTo(-36, yy + 4); g.lineTo(-90, yy + 2); g.fill(); }
  g.fillStyle = '#D9342B'; g.fillRect(-80, -34, 160, 8);                                                            // tomato
  gr = g.createRadialGradient(-20, -80, 10, 0, -50, 120); gr.addColorStop(0, '#F6B65A'); gr.addColorStop(1, '#B9651F');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-96, -36); g.bezierCurveTo(-96, -110, 96, -110, 96, -36); g.closePath(); g.fill();   // top bun
  g.fillStyle = '#FFF4DA'; for (let i = 0; i < 16; i++) { const a = hash(i, 3) * 150 - 75, b = -50 - hash(i, 4) * 38; g.beginPath(); g.ellipse(a, b, 5, 2.6, hash(i, 5) * 3, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-36, -80, 28, 9, -.3, 0, 7); g.fill();
  g.restore();
}
// ---------------- people ----------------
// side view (face ±1) walking or standing; back view (face 0) for the man who stops
function person(g, x, yf, s, o) {
  const { face = 1, ph = 0, moving = true, look = 0, point = 0, coat = '#2A2D3E', scarf = RED, hat = '#1B1C24', lit = 0 } = o;
  const swing = moving ? Math.sin(ph) : 0, bob = moving ? Math.abs(Math.sin(ph)) * 7 : 0;
  g.save(); g.translate(x, yf - bob * s); g.scale(s, s);
  // shadow
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 4, 70, 12, 0, 0, 7); g.fill();
  // legs + boots
  [[-1, swing], [1, -swing]].forEach(([side, sw]) => { g.save(); g.translate(side * 17, -170); g.rotate(sw * .36); g.fillStyle = '#1E1F27'; g.beginPath(); g.roundRect(-16, 0, 32, 160, 14); g.fill(); g.fillStyle = '#121218'; g.beginPath(); g.roundRect(-18 + (face || 0) * 6, 148, 40, 24, 8); g.fill(); g.restore(); });
  // coat
  const cg = g.createLinearGradient(-60, 0, 60, 0); cg.addColorStop(0, coat); cg.addColorStop(1, shade(coat, -18));
  g.fillStyle = cg; g.beginPath(); g.moveTo(-50, -430); g.quadraticCurveTo(-70, -300, -62, -150); g.lineTo(62, -150); g.quadraticCurveTo(70, -300, 50, -430); g.quadraticCurveTo(0, -455, -50, -430); g.fill();
  if (face === 0) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -420); g.lineTo(0, -160); g.stroke(); }
  // arm (swinging, or raised to point)
  g.save(); g.translate((face || 1) * 26, -410);
  const armA = point > 0 ? -(face || 1) * 2.3 * eo(point) : -swing * .45 * (face || 1);
  g.rotate(armA); g.fillStyle = shade(coat, -10); g.beginPath(); g.roundRect(-15, 0, 30, 200, 15); g.fill();
  g.fillStyle = '#D9A887'; g.beginPath(); g.arc(0, 206, 15, 0, 7); g.fill(); g.restore();
  // scarf
  g.fillStyle = scarf; g.beginPath(); g.roundRect(-42, -462, 84, 34, 14); g.fill(); if (face !== 0) { g.fillRect(-(face) * 30 - 10, -440, 22, 70); }
  // head
  g.save(); g.translate(0, -510); g.rotate(-(face || 0) * .38 * look); if (face === 0) g.translate(0, -look * 6);
  g.fillStyle = face === 0 ? '#2B1D18' : '#D9A887'; g.beginPath(); g.ellipse((face || 0) * 6, 0, 42, 50, 0, 0, 7); g.fill();
  if (face !== 0) { g.fillStyle = '#C48F70'; g.beginPath(); g.ellipse(face * 44, 6, 9, 12, 0, 0, 7); g.fill(); g.fillStyle = '#2B1D18'; g.beginPath(); g.arc(face * 24, -6, 5, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = '#2B1D18'; g.beginPath(); g.moveTo(face * 14, -20); g.lineTo(face * 34, -22); g.stroke(); g.beginPath(); g.moveTo(face * 20, 24); g.lineTo(face * 34, 22); g.stroke(); g.fillStyle = 'rgba(220,110,100,.35)'; g.beginPath(); g.arc(face * 14, 12, 9, 0, 7); g.fill(); }
  g.fillStyle = hat; g.beginPath(); g.ellipse(0, -18, 46, 40, 0, Math.PI, 0); g.fill(); g.fillRect(-46, -22, 92, 16);
  g.fillStyle = shade(hat, 30); g.beginPath(); g.arc(0, -62, 14, 0, 7); g.fill();
  g.restore();
  // warm rim light from the panel
  if (lit > 0) { g.strokeStyle = `rgba(255,180,120,${.8 * lit})`; g.lineWidth = 7; g.beginPath(); g.moveTo(face === 0 ? -50 : -(face) * 56, -420); g.quadraticCurveTo(face === 0 ? -64 : -(face) * 68, -300, face === 0 ? -60 : -(face) * 62, -160); g.stroke(); }
  g.restore();
}
function shade(hex, d) { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => clamp(v + d, 0, 255) | 0); return `rgb(${c[0]},${c[1]},${c[2]})`; }
function snow(g, t, n = 170, a = 1) {
  g.fillStyle = 'rgba(240,244,250,.9)';
  for (let i = 0; i < n; i++) { const x = ((hash(i, 1) * W + Math.sin(t * 1.3 + i) * 30) % W + W) % W, y = (hash(i, 2) * H + t * (90 + hash(i, 3) * 130)) % H, r = 2 + hash(i, 4) * 5;
    g.globalAlpha = (.35 + hash(i, 5) * .55) * a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
// ---------------- giant type ----------------
function giant(g, lines, red, top, size, k) {
  const p = back(clamp(k)), o = clamp(k * 3);
  g.save(); g.globalAlpha = o; g.translate(W / 2, top + (1 - clamp(k)) * 120); g.scale(1.25 - .25 * p, 1.25 - .25 * p);
  g.font = `${size}px Anton`; g.textAlign = 'center'; g.textBaseline = 'top';
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
  lines.forEach((ln, j) => { g.fillStyle = red.includes(j) ? RED : '#FFFFFF'; g.fillText(ln, 0, j * size * .9); });
  g.restore();
}
// ---------------- camera ----------------
const cam = (g, cx, cy, z) => { g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); };
const push = (t, t0, t1, a = 0, b = .05) => 1 + a + (b - a) * seg(t, t0, t1);

// ---------------- shots ----------------
const walkers = (g, t, lit) => [[-160, 250, 1, 1, '#2D3346', '#E9B949'], [1260, -230, -1, .93, '#3A2F3F', '#3FA7D6'], [-560, 290, 1, 1.05, '#2B3B35', RED]].forEach(([x0, v, f, s, c, sc], i) =>
  person(g, x0 + v * t, GROUND + 130, s, { face: f, ph: t * 8.5 + i, coat: c, scarf: sc, lit }));
function queueScene(g, tl) {   // lit window: one stops and points, another looks, a queue forms at the door
  const xA = Math.min(-140 + 300 * tl, 330), xB = Math.max(1220 - 300 * tl, 610);
  person(g, xA, GROUND + 130, 1.04, { face: 1, ph: tl * 8.5, moving: tl < 1.55, look: seg(tl, 1.1, 1.5), point: seg(tl, 1.5, 1.85), coat: '#2D3346', scarf: '#E9B949', lit: 1 });
  person(g, xB, GROUND + 125, .95, { face: -1, ph: tl * 8.5 + 2, moving: tl < 1.9, look: seg(tl, 1.7, 2.1), coat: '#3A2F3F', scarf: '#3FA7D6', lit: 1 });
  [[.7, 845, '#2B3B35', RED], [1.1, 935, '#46333A', '#F2F2F2'], [1.5, 1025, '#2F3550', '#E9B949']].forEach(([at, xq, c, sc], i) => {
    const k = eo(seg(tl, at, at + .7)); if (k <= 0) return;
    person(g, xq + (1 - k) * 280, GROUND + 120, .86, { face: -1, ph: tl * 8.5 + i, moving: k < 1, coat: c, scarf: sc, lit: 1 });
  });
}
export function render(g, t) {
  const sh = shotAt(t), lt = t - sh.t0, len = sh.t1 - sh.t0;
  g.save();
  switch (sh.id) {
    case 'hookA': {
      g.save(); cam(g, 540, 820, 1.0 * push(t, 0, len, 0, .04)); facade(g, 0, false); windowContent(g, 'taped'); walkers(g, t * .6, 0); g.restore();
      giant(g, ['LE MEILLEUR', 'PLAT'], [1], 560, 210, seg(t, .15, .55));
      person(g, 900 - 120 * lt, 2440, 2.75, { face: -1, ph: t * 6, coat: '#33384E', scarf: '#E9B949' });   // close passer-by, in front of the type
      break; }
    case 'hookB': {
      g.save(); cam(g, 470, 860, 1.32 * push(lt, 0, len, 0, .04)); facade(g, 0, false); windowContent(g, 'taped'); g.restore();
      giant(g, ['INVISIBLE.'], [0], 700, 230, seg(lt, .0, .4));
      person(g, 120 + 140 * lt, 2440, 2.85, { face: 1, ph: t * 6 + 1, coat: '#2B3B35', scarf: RED });
      break; }
    case 'dark': case 'back': {
      g.save(); cam(g, 470, 830, (sh.id === 'dark' ? 1.75 : 1.55) * push(lt, 0, len)); facade(g, 0, false); windowContent(g, 'taped'); g.restore();
      break; }
    case 'walk': {
      g.save(); cam(g, 540 + 20 * lt, 900, 1.0 * push(lt, 0, len, 0, .03)); facade(g, 0, false); windowContent(g, 'taped'); walkers(g, lt + .3, 0); g.restore();
      break; }
    case 'plat': {
      const bg = g.createRadialGradient(540, 900, 80, 540, 900, 1200); bg.addColorStop(0, '#7A2A1C'); bg.addColorStop(1, '#2A0E0C'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,${180 + hash(i, 7) * 60 | 0},120,${.12 + hash(i, 8) * .15})`; g.beginPath(); g.arc(hash(i, 9) * W, 200 + hash(i, 10) * 600, 40 + hash(i, 11) * 90, 0, 7); g.fill(); }
      const z = 1 + .06 * lt;
      g.save(); g.translate(540, 1050); g.scale(z, z); g.rotate(-.02 + .01 * lt);
      g.fillStyle = '#6E4428'; g.beginPath(); g.ellipse(0, 230, 470, 120, 0, 0, 7); g.fill(); g.fillStyle = '#8A5A36'; g.beginPath(); g.ellipse(0, 214, 460, 110, 0, 0, 7); g.fill();   // board
      g.save(); g.translate(300, 70); g.rotate(.08); g.fillStyle = RED; g.beginPath(); g.moveTo(-90, -40); g.lineTo(90, -40); g.lineTo(70, 160); g.lineTo(-70, 160); g.fill();      // fries
      for (let i = 0; i < 11; i++) { g.save(); g.translate(-70 + i * 14, -40); g.rotate((hash(i, 2) - .5) * .5); g.fillStyle = i % 2 ? '#F7C948' : '#EFB52E'; g.fillRect(-7, -110 - hash(i, 1) * 50, 14, 150); g.restore(); }
      g.fillStyle = CREAM; g.fillRect(-40, 40, 80, 50); g.restore();
      burger(g, -70, 40, 600);
      g.restore();
      for (let i = 0; i < 6; i++) { const k = (lt * .5 + i * .17) % 1; g.strokeStyle = `rgba(255,255,255,${.28 * Math.sin(Math.PI * k)})`; g.lineWidth = 16; g.lineCap = 'round';
        const x = 300 + i * 80; g.beginPath(); g.moveTo(x, 700 - k * 380); g.bezierCurveTo(x + 40, 650 - k * 380, x - 40, 600 - k * 380, x + 10, 540 - k * 380); g.stroke(); }
      break; }
    case 'kit': {   // the kit on the floor, top view
      g.fillStyle = '#C79A6B'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(90,55,30,.35)'; g.lineWidth = 4; for (let y = 0; y < H; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.save(); g.translate(540, 900); g.scale(1 + .08 * lt, 1 + .08 * lt); g.rotate(-.06);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-330, -470, 680, 960); g.fillStyle = '#C9CED6'; g.fillRect(-350, -490, 680, 960); g.fillStyle = '#F4F6F9'; g.fillRect(-320, -460, 620, 900);
      g.strokeStyle = '#9AA1AC'; g.lineWidth = 6; g.beginPath(); g.moveTo(-200, 560); g.bezierCurveTo(-100, 700, 100, 520, 250, 640); g.stroke(); g.beginPath(); g.moveTo(-240, 600); g.bezierCurveTo(-160, 760, 60, 580, 200, 720); g.stroke();
      g.fillStyle = RED; g.save(); g.translate(260, 560); g.rotate(.5); g.beginPath(); g.roundRect(-60, -230, 120, 460, 50); g.fill(); g.fillStyle = CREAM; g.fillRect(-50, -40, 100, 20); g.restore();
      g.restore(); break; }
    case 'hang': case 'ready': case 'switch': {
      const z = sh.id === 'switch' ? 1.45 + .12 * eio(seg(t, CLICK, CLICK + 1.6)) : 1.45, y = sh.id === 'hang' ? 840 : 845;
      g.save(); cam(g, 465, y, z * push(lt, 0, len, 0, .03)); facade(g, sh.id === 'switch' ? seg(t, CLICK, CLICK + .3) : 0, sh.id === 'switch' && t >= CLICK);
      if (sh.id === 'hang') {   // the frame comes down on its cables, hands guiding it
        const d = eo(seg(lt, 0, .65)); g.save(); g.translate(0, (1 - d) * -420);
        g.fillStyle = '#C9CED6'; g.fillRect(PAN.x - 15, PAN.y - 15, PAN.w + 30, PAN.h + 30); g.fillStyle = '#E9ECF0'; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
        g.fillStyle = '#D9A887'; [[PAN.x - 22, PAN.y + 200], [PAN.x + PAN.w + 22, PAN.y + 230]].forEach(([hx, hy]) => { g.beginPath(); g.ellipse(hx, hy, 26, 34, 0, 0, 7); g.fill(); });
        g.restore();
        g.strokeStyle = 'rgba(200,205,215,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(PAN.x + 30, WIN.y); g.lineTo(PAN.x + 30, PAN.y - (1 - d) * 420); g.moveTo(PAN.x + PAN.w - 30, WIN.y); g.lineTo(PAN.x + PAN.w - 30, PAN.y - (1 - d) * 420); g.stroke();
      } else windowContent(g, 'panel', 1, sh.id === 'switch' ? eo(seg(t, CLICK, CLICK + .35)) : 0);
      g.restore(); break; }
    case 'slide': {   // close on the frame: the poster slides in from the top
      g.fillStyle = '#2A2F45'; g.fillRect(0, 0, W, H);
      const w = 760, h = 1080, x = 160, y = 380;
      panelArt(g, x, y, w, h, eio(seg(lt, .05, .7)), .0001);
      g.fillStyle = '#D9A887'; const hy = y - 60 + eio(seg(lt, .05, .7)) * 40; g.beginPath(); g.ellipse(x + 200, hy, 40, 52, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + w - 200, hy, 40, 52, 0, 0, 7); g.fill();
      break; }
    case 'stop': {
      g.save(); cam(g, 480, 880, 1.12 * push(lt, 0, len, 0, .04)); facade(g, 1, true); windowContent(g, 'panel', 1, 1); g.restore();
      giant(g, ["ILS S'ARRÊTENT."], [], 1010, 158, seg(lt, .1, .5));
      person(g, 600, 2600, 2.55, { face: 0, moving: false, look: seg(lt, .2, .8), coat: '#2F3550', scarf: RED, lit: 1 });
      break; }
    case 'queue': {
      g.save(); cam(g, 560, 930, 1.05 * push(lt, 0, len, 0, .04)); facade(g, 1, true); windowContent(g, 'panel', 1, 1); queueScene(g, lt + .9); g.restore();
      break; }
    case 'hero': {   // pull back: the whole street is dark, one window shines
      const z = 1.0 - .22 * eio(seg(lt, 0, len));
      g.save(); cam(g, 540, 820, z); facade(g, 1, true); windowContent(g, 'panel', 1, 1);
      [[0, 'in'], [.5, 'in']].forEach(([at], i) => { const k = seg(lt, at, at + 1.6); if (k <= 0 || k >= 1) return; person(g, -300 + 1250 * k, GROUND + 125, .9, { face: 1, ph: lt * 8.5 + i, coat: ['#46333A', '#2B3B35'][i], scarf: ['#F2F2F2', '#E9B949'][i], lit: 1 }); });
      g.restore(); break; }
  }
  g.restore();
  if (!['plat', 'kit', 'slide'].includes(sh.id)) snow(g, t, sh.id === 'hookA' || sh.id === 'hookB' || sh.id === 'stop' ? 200 : 160);
  // lift: keep the night readable, never murky
  g.fillStyle = 'rgba(70,90,150,.06)'; g.fillRect(0, 0, W, H);
}
export function texts() { return []; }
export function events() { return SHOTS.map(([id, at]) => ({ t: at, type: 'cut:' + id })).concat([{ t: CLICK, type: 'click' }]); }
