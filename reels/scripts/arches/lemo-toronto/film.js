// Toronto, night, rain — the drive past the « Follow the Arches » boards (2018).
// The billboard faces are the real campaign photos supplied by the user (face-*.png); everything else is drawn here.
// Clip map (seconds):  aerial 0–3.2 · POV 3.2–8.2 · mirror 8.2–9.8 · ground 9.8–11.2 · arch road (aerial) 11.2–14.2 · arrival 14.2–17.2
// POV world time w = clip − 3.2 ; the arrival continues the same drive from w = 4.6 (the frozen frame used in the edit).
export const W = 1080, H = 1920, DUR = 17.2;
export const FREEZE_CLIP = 7.2;
let IMG = {};
export const setImages = i => { IMG = i; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// ---------- shared pieces ----------
function rainAir(g, t, n = 260, ang = .12, a = .5) {
  g.strokeStyle = `rgba(190,210,240,${a})`; g.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const sp = 1900 + hash(i, 3) * 900, x = (hash(i, 1) * 1300 - 100 + t * sp * ang) % 1300 - 100, y = (hash(i, 2) * H + t * sp) % (H + 200) - 100, l = 40 + hash(i, 4) * 60;
    g.globalAlpha = .25 + hash(i, 5) * .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x - l * ang, y - l); g.stroke();
  }
  g.globalAlpha = 1;
}
function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function skyline(g, hy, scroll = 0) {
  const s = g.createLinearGradient(0, 0, 0, hy); s.addColorStop(0, '#0A1022'); s.addColorStop(1, '#3A2E3C'); g.fillStyle = s; g.fillRect(0, 0, W, hy + 2);
  glow(g, 540, hy, 700, 'rgba(255,150,90,A)', .25);
  for (let i = 0; i < 26; i++) {   // towers
    const x = ((i * 61 + scroll) % 1300) - 110, w = 40 + hash(i, 1) * 70, h = 60 + hash(i, 2) * 260;
    g.fillStyle = '#121628'; g.fillRect(x, hy - h, w, h);
    g.fillStyle = 'rgba(255,214,150,.55)'; for (let r = 0; r < h / 18; r++) for (let c = 0; c < w / 14; c++) if (hash(i * 31 + r, c) > .72) g.fillRect(x + 4 + c * 14, hy - h + 6 + r * 18, 6, 8);
  }
  // the tower everybody knows in Toronto, far left
  const tx = 230 - scroll * .2; g.fillStyle = '#10142A'; g.beginPath(); g.moveTo(tx - 14, hy); g.lineTo(tx - 5, hy - 520); g.lineTo(tx + 5, hy - 520); g.lineTo(tx + 14, hy); g.fill();
  g.beginPath(); g.ellipse(tx, hy - 400, 34, 16, 0, 0, 7); g.fill(); g.fillRect(tx - 2, hy - 640, 4, 130);
  g.fillStyle = '#FF3B3B'; g.beginPath(); g.arc(tx, hy - 640, 4, 0, 7); g.fill();
}
const P = { f: 900, cy: 860, ch: 1.25 };   // pinhole: focal, horizon y, camera height
const proj = (X, Y, Z, cx = 540) => [cx + X * P.f / Z, P.cy + (P.ch - Y) * P.f / Z, P.f / Z];

// the night road, seen from the driver's seat; yaw shifts the scene sideways (turning)
function road(g, w, yaw = 0, opts = {}) {
  const cx = 540 - yaw * 900;
  skyline(g, P.cy, yaw * 600 + w * 4);
  // asphalt
  g.fillStyle = '#15161D'; g.beginPath(); g.moveTo(cx - 6, P.cy); g.lineTo(cx + 6, P.cy); g.lineTo(cx + 2600, H); g.lineTo(cx - 2600, H); g.fill();
  const v = 16;   // m/s
  // wet reflections of the street lights   (k = pixels per metre at that depth)
  for (let q = 0; q < 9; q++) { const Z = 6 + ((q * 9 - w * v) % 81 + 81) % 81;
    for (const X of [-5.5, 5.5]) { const [x, , k] = proj(X, 6, Z, cx); g.fillStyle = `rgba(255,170,90,${.10 * clamp(k / 60)})`; g.fillRect(x - .35 * k, P.cy + 4, .7 * k, (H - P.cy) * .9); } }
  // lane dashes
  g.fillStyle = 'rgba(235,235,225,.85)';
  for (let q = 0; q < 14; q++) { const Z = 3 + ((q * 6 - w * v) % 84 + 84) % 84, Z2 = Z + 2.6, [x1, y1, k1] = proj(-.08, 0, Z, cx), [x2, y2, k2] = proj(-.08, 0, Z2, cx);
    g.beginPath(); g.moveTo(x1 - .08 * k1, y1); g.lineTo(x1 + .08 * k1, y1); g.lineTo(x2 + .08 * k2, y2); g.lineTo(x2 - .08 * k2, y2); g.fill(); }
  // tail lights ahead
  [[-1.8, 38, 0], [1.9, 62, 1], [-1.6, 95, 2]].forEach(([X, Z, i]) => { const [x, y, k] = proj(X, .8, Z - Math.sin(w * .7 + i) * 2, cx);
    g.fillStyle = '#0B0B10'; g.fillRect(x - .9 * k, y - .7 * k, 1.8 * k, .9 * k);
    glow(g, x - .7 * k, y, .6 * k + 6, 'rgba(255,40,40,A)', .8); glow(g, x + .7 * k, y, .6 * k + 6, 'rgba(255,40,40,A)', .8); });
  // street lights
  for (let q = 0; q < 9; q++) { const Z = 6 + ((q * 9 - w * v) % 81 + 81) % 81;
    for (const X of [-5.5, 5.5]) { const [x, y, k] = proj(X, 6, Z, cx), [, yb] = proj(X, 0, Z, cx);
      g.strokeStyle = '#0B0C12'; g.lineWidth = Math.max(1, .18 * k); g.beginPath(); g.moveTo(x, yb); g.lineTo(x, y); g.stroke();
      glow(g, x, y, 2.2 * k + 8, 'rgba(255,190,110,A)', .5); g.fillStyle = '#FFE3B0'; g.beginPath(); g.arc(x, y, Math.max(1.5, .22 * k), 0, 7); g.fill(); } }
  // the billboard (real campaign photo), right side
  if (opts.board !== false) {
    const Zb = 60 - w * v * .62, X = 7.5, Yb = 4.2, bw = 7.2, bh = 3.4;
    if (Zb > 2.5) {
      const [x0, y0, k] = proj(X - bw / 2, Yb + bh, Zb, cx), [x1, y1] = proj(X + bw / 2, Yb, Zb, cx), [, yp] = proj(X, 0, Zb, cx);
      g.fillStyle = '#08090E'; g.fillRect((x0 + x1) / 2 - .25 * k, y1, .5 * k, yp - y1); g.fillRect(x0 - .2 * k, y1, x1 - x0 + .4 * k, .25 * k);
      g.fillStyle = '#0A0B10'; g.fillRect(x0 - .12 * k, y0 - .12 * k, x1 - x0 + .24 * k, y1 - y0 + .24 * k);
      if (IMG.missed) { g.save(); g.filter = 'brightness(.8) saturate(1.1)'; g.drawImage(IMG.missed, x0, y0, x1 - x0, y1 - y0); g.restore(); }
      const lg = g.createLinearGradient(0, y0, 0, y1); lg.addColorStop(0, 'rgba(255,240,210,.16)'); lg.addColorStop(1, 'rgba(0,0,10,.22)'); g.fillStyle = lg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      glow(g, (x0 + x1) / 2, y1, (x1 - x0) * .6, 'rgba(255,60,40,A)', .18);
      g.fillStyle = 'rgba(220,40,30,.12)'; g.fillRect(x0, Math.max(P.cy + 10, yp), x1 - x0, (H - P.cy) * .6);
    }
  }
  if (opts.place) opts.place(g, cx);
}
// windshield: drops, wipers, dashboard, pillars
function cabin(g, w, frozen = false) {
  const period = 1.3, ph = (w % period) / period, wa = Math.sin(Math.PI * ph);   // 0 → 1 → 0
  // drops: each drop is cleared when a wiper passes it, then comes back
  for (let i = 0; i < 140; i++) {
    const x = hash(i, 11) * W, y = 280 + hash(i, 12) * 1250, r = 4 + hash(i, 13) * 11;
    const ang = Math.atan2(y - 1560, x - 540), sweep = -Math.PI + wa * Math.PI * .95, age = ((w * 1.7 + hash(i, 14) * 3) % 3) / 3;
    if (Math.abs(ang - sweep) < .25) continue;
    const slide = frozen ? 0 : age * 26;
    g.fillStyle = 'rgba(200,215,240,.16)'; g.beginPath(); g.ellipse(x, y + slide, r, r * 1.15, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - r * .35, y + slide - r * .4, r * .28, 0, 7); g.fill();
  }
  // wipers pivot at the bottom
  [[300, 0], [700, .08]].forEach(([px, off]) => { const a = -Math.PI + .05 + (Math.sin(Math.PI * ((w + off) % period) / period)) * Math.PI * .9;
    g.save(); g.translate(px, 1560); g.rotate(a); g.fillStyle = '#05050A'; g.fillRect(0, -6, 760, 12); g.fillRect(560, -10, 200, 20); g.restore(); });
  // dashboard and pillars
  g.fillStyle = '#06060A'; g.beginPath(); g.moveTo(0, 1500); g.quadraticCurveTo(540, 1420, W, 1500); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  glow(g, 300, 1640, 140, 'rgba(90,160,255,A)', .22); g.fillStyle = 'rgba(120,180,255,.5)'; g.font = '600 34px sans-serif'; g.fillText('62', 280, 1650);
  g.fillStyle = '#07070B'; g.beginPath(); g.moveTo(0, 0); g.lineTo(150, 0); g.lineTo(0, 1100); g.fill(); g.beginPath(); g.moveTo(W, 0); g.lineTo(W - 150, 0); g.lineTo(W, 1100); g.fill();
  g.fillRect(0, 0, W, 120);
  // interior mirror at the top
  g.fillStyle = '#0B0B10'; g.beginPath(); g.roundRect(380, 140, 320, 90, 30); g.fill();
}
function vignette(g, a = .55) { const v = g.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .45, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }

// ---------- shots ----------
function aerial(g, t, curve) {   // top-down over the city; curve = the exit ramp that draws an arch
  const z = 1 + .12 * t / 3, rot = curve ? 0 : -.08 + .03 * t;
  g.fillStyle = '#0B0E18'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.scale(z, z); g.translate(-W / 2, -H / 2);
  for (let bx = -200; bx < 1300; bx += 170) for (let by = -200; by < 2100; by += 190) {   // blocks + roofs
    g.fillStyle = '#141A2A'; g.fillRect(bx, by, 140, 160);
    for (let k = 0; k < 6; k++) if (hash(bx + k, by) > .55) { g.fillStyle = 'rgba(255,210,140,.5)'; g.fillRect(bx + 10 + (k % 3) * 42, by + 14 + (k / 3 | 0) * 70, 26, 18); }
  }
  // highway (straight, diagonal)
  g.save(); g.translate(540, 960); g.rotate(-.42);
  g.fillStyle = '#1A1C24'; g.fillRect(-170, -1400, 340, 2800);
  g.strokeStyle = 'rgba(240,240,230,.5)'; g.lineWidth = 4; g.setLineDash([40, 50]); for (const x of [-85, 0, 85]) { g.beginPath(); g.moveTo(x, -1400); g.lineTo(x, 1400); g.stroke(); } g.setLineDash([]);
  for (let i = 0; i < 26; i++) { const dir = i % 2 ? 1 : -1, x = dir * (40 + (i % 3) * 30), y = ((hash(i, 1) * 2800 + dir * t * 420) % 2800 + 2800) % 2800 - 1400;
    glow(g, x, y, 34, dir > 0 ? 'rgba(255,245,220,A)' : 'rgba(255,40,40,A)', .9); }
  g.restore();
  if (curve) {   // the ramp: an arch-shaped curve, one car follows it
    const k = seg(t, .2, 2.6);
    g.lineCap = 'round'; g.strokeStyle = '#1F2130'; g.lineWidth = 120; g.beginPath(); g.moveTo(300, 1500); g.bezierCurveTo(320, 600, 760, 600, 780, 1500); g.stroke();
    g.strokeStyle = 'rgba(240,240,230,.5)'; g.lineWidth = 4; g.setLineDash([30, 40]); g.beginPath(); g.moveTo(300, 1500); g.bezierCurveTo(320, 600, 760, 600, 780, 1500); g.stroke(); g.setLineDash([]);
    const bz = (u, a, b, c, d) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d;
    for (let j = 0; j < 18; j++) { const u = clamp(k - j * .012); glow(g, bz(u, 300, 320, 760, 780), bz(u, 1500, 600, 600, 1500), 46 - j * 2, 'rgba(255,240,210,A)', .9 - j * .045); }
  }
  g.restore();
  rainAir(g, t, 160, .35, .35); vignette(g, .5);
}
function mirror(g, t) {   // the rear-view mirror: the board slides away behind us
  g.fillStyle = '#07070C'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) glow(g, hash(i, 1) * W, 900 + hash(i, 2) * 700, 60 + hash(i, 3) * 90, i % 3 ? 'rgba(255,170,90,A)' : 'rgba(255,60,50,A)', .25);   // out-of-focus street through the glass
  g.save(); g.beginPath(); g.roundRect(120, 640, 840, 360, 60); g.clip();
  g.save(); g.translate(W, 0); g.scale(-1, 1);   // mirrored world
  g.translate(0, 640 - 380); g.scale(1, .55);
  road(g, 3 - t * .8, 0, { board: false });
  const Z = 9 + t * 22, [x0, y0] = proj(-7.5 - 3.6, 7.6, Z), [x1, y1] = proj(-7.5 + 3.6, 4.2, Z);   // the board behind, receding
  if (IMG.right) { g.save(); g.scale(-1, 1); g.filter = 'brightness(.8)'; g.drawImage(IMG.right, -x1, y0, x1 - x0, y1 - y0); g.restore(); }
  glow(g, 560, 960, 200, 'rgba(255,250,230,A)', .7); glow(g, 760, 960, 200, 'rgba(255,250,230,A)', .7);   // headlights behind
  g.restore();
  g.fillStyle = 'rgba(160,190,230,.08)'; g.fillRect(0, 0, W, H);
  g.restore();
  g.strokeStyle = '#1A1A22'; g.lineWidth = 26; g.beginPath(); g.roundRect(120, 640, 840, 360, 60); g.stroke();
  g.fillStyle = '#0E0E14'; g.fillRect(520, 400, 40, 240);
  rainAir(g, t, 120, .1, .2); vignette(g, .6);
}
function ground(g, t) {   // asphalt level: puddles, ripples, a wheel throws water
  g.fillStyle = '#0C0D14'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 22; i++) glow(g, hash(i, 1) * W, 600 + hash(i, 2) * 300, 50 + hash(i, 3) * 100, i % 4 ? 'rgba(255,170,90,A)' : 'rgba(255,60,50,A)', .35);   // bokeh street
  const hz = 980; g.fillStyle = '#101118'; g.fillRect(0, hz, W, H - hz);
  // the board's red and yellow reflected in the water, trembling
  for (let i = 0; i < 40; i++) { const y = hz + i * 22, wob = Math.sin(t * 6 + i * .7) * 18;
    g.fillStyle = `rgba(220,35,30,${.5 - i * .011})`; g.fillRect(260 + wob, y, 520, 12); g.fillStyle = `rgba(255,205,40,${.5 - i * .011})`; g.fillRect(600 + wob * 1.3, y, 120, 12); }
  for (let i = 0; i < 30; i++) { const k = ((t * 1.4 + hash(i, 5)) % 1), x = hash(i, 6) * W, y = hz + 40 + hash(i, 7) * 860;
    g.strokeStyle = `rgba(200,215,240,${.5 * (1 - k)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 10 + 90 * k, (10 + 90 * k) * .22, 0, 0, 7); g.stroke(); }
  // a wheel passes through the frame
  const wx = -500 + t * 1300; g.fillStyle = '#050507'; g.beginPath(); g.arc(wx, 1240, 330, 0, 7); g.fill(); g.fillStyle = '#16161C'; g.beginPath(); g.arc(wx, 1240, 150, 0, 7); g.fill();
  for (let i = 0; i < 60; i++) { const a = -Math.PI * (.55 + hash(i, 8) * .5), d = 60 + hash(i, 9) * 340 * seg(t, .1, 1.2); g.fillStyle = 'rgba(210,225,245,.6)'; g.beginPath(); g.arc(wx - 300 + Math.cos(a) * d, 1500 + Math.sin(a) * d, 3 + hash(i, 10) * 5, 0, 7); g.fill(); }
  rainAir(g, t, 220, .05, .45); vignette(g, .55);
}
function restaurant(g, cx, w) {   // a generic drive-thru on the right after the turn (no brand)
  const Z = Math.max(9, 75 - (w - 4.6) * 24), [x0, y0, k] = proj(3, 6, Z, cx), [x1, y1] = proj(16, 0, Z, cx);
  glow(g, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * .9, 'rgba(255,150,80,A)', .35);
  g.fillStyle = '#2A1416'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = 'rgba(255,214,150,.9)'; g.fillRect(x0 + (x1 - x0) * .08, y0 + (y1 - y0) * .38, (x1 - x0) * .55, (y1 - y0) * .42);
  g.fillStyle = '#B3262C'; g.fillRect(x0, y0, x1 - x0, (y1 - y0) * .16);
  g.fillStyle = '#FFF4E0'; g.font = `700 ${Math.max(8, .9 * k)}px sans-serif`; g.textAlign = 'center'; g.fillText('DRIVE', x0 + (x1 - x0) * .8, y0 + (y1 - y0) * .62); g.textAlign = 'left';
}
export function render(g, t) {
  if (t < 3.2) aerial(g, t, false);
  else if (t < 8.2) { const w = t - 3.2; road(g, w); rainAir(g, w, 200, .02, .35); cabin(g, w); vignette(g, .45); }
  else if (t < 9.8) mirror(g, t - 8.2);
  else if (t < 11.2) ground(g, t - 9.8);
  else if (t < 14.2) aerial(g, t - 11.2, true);
  else { const w = FREEZE_CLIP - 3.2 + (t - 14.2), yaw = .32 * eio(seg(t, 15.2, 16.6));
    road(g, w, yaw, { place: (gg, cx) => restaurant(gg, cx, w) }); rainAir(g, w, 200, .02, .35); cabin(g, w); vignette(g, .45); }
}
export function texts() { return []; }
export function events() { return [{ t: 3.2, type: 'pov' }, { t: 8.2, type: 'mirror' }, { t: 9.8, type: 'ground' }, { t: 11.2, type: 'arch-road' }, { t: 14.2, type: 'resume' }]; }
