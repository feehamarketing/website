// « Le plat invisible » — Lemo illustrated street shots (no real footage exists for these moments).
// Shot A 0–2.4 s: night, the window is dark (a faded taped poster); people walk past without looking.
// Shot B 2.4–5.2 s: the same window with a lit Feeha panel; one passer-by stops and points, a queue forms at the door.
export const W = 1080, H = 1920, DUR = 5.2, B0 = 2.4;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3), eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const RED = '#E11D2E', INK = '#121017';
const WIN = { x: 120, y: 560, w: 700, h: 640 }, PAN = { x: 300, y: 610, w: 330, h: 470 }, DOOR = { x: 870, y: 560, w: 170, h: 700 };
const GROUND = 1330;

function facade(g, lit) {
  g.fillStyle = '#05060C'; g.fillRect(0, 0, W, H);
  // brick wall
  g.fillStyle = lit ? '#3A1E1C' : '#251615'; g.fillRect(0, 160, W, GROUND - 160);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
  for (let y = 160; y < GROUND; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = ((y / 34) % 2) * 45; x < W; x += 90) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
  // sign band (blank: the shop's name doesn't matter here)
  g.fillStyle = '#0D0C11'; g.fillRect(90, 330, 900, 150);
  g.fillStyle = lit ? 'rgba(255,240,225,.9)' : 'rgba(120,110,110,.35)';
  g.beginPath(); g.roundRect(300, 380, 480, 50, 25); g.fill();
  // window
  const wg = g.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h);
  wg.addColorStop(0, lit ? '#3B2418' : '#0B0D16'); wg.addColorStop(1, lit ? '#1E120C' : '#06070C');
  g.fillStyle = wg; g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  g.strokeStyle = '#0A090D'; g.lineWidth = 22; g.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h);
  // door
  g.fillStyle = lit ? '#2A1A14' : '#0C0D14'; g.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  g.strokeStyle = '#0A090D'; g.lineWidth = 16; g.strokeRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  g.fillStyle = '#8C8F96'; g.fillRect(DOOR.x + 130, DOOR.y + 360, 12, 70);
  // sidewalk + street
  g.fillStyle = lit ? '#2B2A30' : '#1C1C22'; g.fillRect(0, GROUND, W, 260);
  g.fillStyle = '#DCE2EA'; g.globalAlpha = .55; g.fillRect(0, GROUND, W, 14); g.globalAlpha = 1;
  g.fillStyle = '#0E0E13'; g.fillRect(0, GROUND + 260, W, H - GROUND - 260);
}
function poster(g, k, lit) {   // the taped poster (dark) or the lightbox (lit)
  if (!lit) {
    g.save(); g.translate(PAN.x + PAN.w / 2, PAN.y + PAN.h / 2); g.rotate(-.035);
    g.fillStyle = '#4A4440'; g.fillRect(-PAN.w / 2 + 20, -PAN.h / 2 + 30, PAN.w - 40, PAN.h - 60);
    g.fillStyle = '#5A3F3A'; g.fillRect(-PAN.w / 2 + 20, -PAN.h / 2 + 30, PAN.w - 40, 80);
    g.fillStyle = '#5E5650'; g.beginPath(); g.arc(0, 40, 80, 0, 7); g.fill();
    g.fillStyle = 'rgba(200,195,170,.45)'; g.fillRect(-PAN.w / 2 + 6, -PAN.h / 2 + 20, 70, 24); g.fillRect(PAN.w / 2 - 76, -PAN.h / 2 + 20, 70, 24);
    g.restore(); return;
  }
  // light spill first
  const cx = PAN.x + PAN.w / 2, cy = PAN.y + PAN.h / 2;
  let rg = g.createRadialGradient(cx, cy, 60, cx, cy, 620); rg.addColorStop(0, `rgba(255,190,140,${.55 * k})`); rg.addColorStop(1, 'rgba(255,190,140,0)');
  g.fillStyle = rg; g.fillRect(0, 300, W, 1400);
  rg = g.createRadialGradient(cx, GROUND + 60, 20, cx, GROUND + 60, 520); rg.addColorStop(0, `rgba(255,170,120,${.35 * k})`); rg.addColorStop(1, 'rgba(255,170,120,0)');
  g.fillStyle = rg; g.fillRect(0, GROUND, W, 300);
  // frame + poster
  g.fillStyle = '#C9CDD3'; g.fillRect(PAN.x - 14, PAN.y - 14, PAN.w + 28, PAN.h + 28);
  g.shadowColor = `rgba(255,220,180,${k})`; g.shadowBlur = 80 * k;
  g.fillStyle = RED; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h); g.shadowBlur = 0;
  g.fillStyle = '#FFF7EE'; g.fillRect(PAN.x + 40, PAN.y + 40, PAN.w - 80, 46); g.fillRect(PAN.x + 70, PAN.y + 100, PAN.w - 140, 34);
  g.fillStyle = '#F4B23C'; g.beginPath(); g.ellipse(cx, PAN.y + 270, 110, 70, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#6B3A1E'; g.fillRect(cx - 115, PAN.y + 272, 230, 30);
  g.fillStyle = '#F4B23C'; g.beginPath(); g.ellipse(cx, PAN.y + 305, 112, 28, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#FFF7EE'; g.beginPath(); g.roundRect(PAN.x + 60, PAN.y + 380, PAN.w - 120, 52, 26); g.fill();
  g.fillStyle = `rgba(255,255,255,${.18 * k})`; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
}
// a passer-by: x = feet centre, s = scale, face: +1 right / -1 left, walk phase, look (0 straight → 1 up at the panel), point (0 → 1 arm raised)
function person(g, x, s, face, ph, moving, look, point, lit, coat) {
  const y = GROUND + 120, swing = moving ? Math.sin(ph) : 0, bob = moving ? Math.abs(Math.sin(ph)) * 6 : 0;
  g.save(); g.translate(x, y - bob); g.scale(s, s);
  const body = coat || '#17151D', rim = lit ? 'rgba(255,170,110,.85)' : 'rgba(120,140,190,.25)';
  // legs
  g.fillStyle = '#0D0C11';
  [[-1, swing], [1, -swing]].forEach(([side, sw]) => { g.save(); g.translate(side * 16, -150); g.rotate(sw * .38); g.beginPath(); g.roundRect(-14, 0, 28, 152, 12); g.fill(); g.restore(); });
  // coat
  g.fillStyle = body; g.beginPath(); g.roundRect(-52, -400, 104, 270, 40); g.fill();
  // far arm (swinging) or pointing arm
  g.save(); g.translate(face * 30, -370);
  const armA = point > 0 ? -face * (2.4 * eo(point)) + (1 - point) * swing * .4 : -swing * .45;
  g.rotate(armA * (point > 0 ? 1 : face)); g.fillStyle = body; g.beginPath(); g.roundRect(-14, 0, 28, 190, 14); g.fill();
  g.fillStyle = '#C79A7E'; g.beginPath(); g.arc(0, 196, 15, 0, 7); g.fill(); g.restore();
  // head
  g.save(); g.translate(face * 6, -450); g.rotate(-face * .35 * look);
  g.fillStyle = '#C79A7E'; g.beginPath(); g.ellipse(face * 8, 0, 40, 48, 0, 0, 7); g.fill();
  g.fillStyle = '#0D0C11'; g.beginPath(); g.ellipse(-face * 6, -16, 44, 38, 0, Math.PI, 0); g.fill();   // tuque
  g.restore();
  // rim light from the window
  g.strokeStyle = rim; g.lineWidth = 6; g.beginPath(); g.moveTo(-face * -52, -380); g.lineTo(-face * -52, -150); g.stroke();
  g.restore();
}
function snow(g, t) {
  g.fillStyle = 'rgba(235,240,248,.8)';
  for (let i = 0; i < 160; i++) { const x = (hash(i, 1) * W + Math.sin(t * 1.3 + i) * 30) % W, y = (hash(i, 2) * H + t * (80 + hash(i, 3) * 120)) % H, r = 2 + hash(i, 4) * 4;
    g.globalAlpha = .35 + hash(i, 5) * .5; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
function vignette(g) { const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .45, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }

export function render(g, t) {
  const lit = t >= B0, tl = lit ? t - B0 : t;
  // slow camera drift
  g.save(); const z = 1.03 + .03 * (tl / 3); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2 + (lit ? -10 : 10) * tl, -H / 2);
  facade(g, lit); poster(g, lit ? eo(seg(tl, 0, .4)) : 0, lit);
  if (!lit) {   // everyone walks past, eyes straight ahead
    [[-120, 260, 1, 1, '#1B1A24'], [1250, -230, -1, .92, '#22202A'], [-520, 300, 1, 1.06, '#191720']].forEach(([x0, v, f, s, c], i) => {
      const x = x0 + v * t; person(g, x, s, f, t * 9 + i, true, 0, 0, false, c); });
  } else {
    // the one who stops and points
    const xA = -140 + 300 * Math.min(tl, 1.55) - 300 * Math.max(0, Math.min(tl, 1.55) - 1.2) * .5, movingA = tl < 1.5;
    person(g, Math.min(xA, 330), 1.04, 1, tl * 9, movingA, seg(tl, 1.1, 1.5), seg(tl, 1.5, 1.85), true, '#1E1C26');
    // a second one stops and looks
    const xB = 1220 - 300 * Math.min(tl, 1.9); person(g, Math.max(xB, 610), .95, -1, tl * 9 + 2, tl < 1.85, seg(tl, 1.7, 2.1), 0, true, '#262330');
    // queue at the door
    [[1.0, 845], [1.4, 935], [1.8, 1025]].forEach(([at, xq], i) => {
      const k = eo(seg(tl, at, at + .7)); if (k <= 0) return;
      person(g, xq + (1 - k) * 260, .86, -1, tl * 9 + i, k < 1, 0, 0, true, ['#2A2430', '#1D1B25', '#2C2026'][i]);
    });
  }
  snow(g, t);
  g.restore();
  vignette(g);
  if (lit && tl < .25) { g.fillStyle = `rgba(255,255,255,${.6 * (1 - tl / .25)})`; g.fillRect(0, 0, W, H); }
}
export function texts() { return []; }
export function events() { return [{ t: B0, type: 'on' }, { t: B0 + 1.5, type: 'stop' }, { t: B0 + 1.85, type: 'point' }]; }
