// Shared 3D models for the Feeha install tutorials (three.js, real-world metres)
import * as THREE from '/node_modules/three/build/three.module.js';
export { THREE };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const easeOut = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); };
export const seg = (t, a, b) => ease((t - a) / (b - a));
export const segL = (t, a, b) => clamp((t - a) / (b - a));
export const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

// ---------- materials ----------
export const M = {
  alu: new THREE.MeshStandardMaterial({ color: 0x1b1d21, metalness: 0.75, roughness: 0.38 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.22 }),
  steelDark: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 1, roughness: 0.3 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc9a54a, metalness: 1, roughness: 0.3 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.6 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.5 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xe1452a, roughness: 0.45 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x222326, roughness: 0.85 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.45 }),
  green: new THREE.MeshStandardMaterial({ color: 0x2fbf5b, roughness: 0.4 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xe5c28d, roughness: 0.7 }),
  graphite: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }),
  mark: new THREE.MeshBasicMaterial({ color: 0x3a3a40 }),
  hole: new THREE.MeshBasicMaterial({ color: 0x18181a }),
  red: new THREE.MeshBasicMaterial({ color: 0xe11d2e }),
};

// ---------- poster ----------
export function posterTexture(lang) {
  const c = document.createElement('canvas'); c.width = 600; c.height = 840; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 840); bg.addColorStop(0, '#ff3b30'); bg.addColorStop(1, '#c4121f');
  g.fillStyle = bg; g.fillRect(0, 0, 600, 840);
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(300, 470, 60 + i * 34, 0, 7); g.lineWidth = 12; g.strokeStyle = 'rgba(255,255,255,.05)'; g.stroke(); }
  g.textAlign = 'center'; g.fillStyle = '#fff';
  g.font = '96px Anton'; g.fillText(lang === 'fr' ? 'COMBO' : 'DAILY', 300, 140);
  g.fillText(lang === 'fr' ? 'DU JOUR' : 'COMBO', 300, 240);
  // burger
  const bx = 300, by = 470;
  g.fillStyle = '#f2a93b'; g.beginPath(); g.ellipse(bx, by - 40, 170, 95, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#fff5d6'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(bx - 110 + i * 28, by - 85 + (i % 2) * 18, 6, 3, 0.4, 0, 7); g.fill(); }
  g.fillStyle = '#5fbf3a'; g.beginPath(); for (let i = 0; i <= 12; i++) g.lineTo(bx - 180 + i * 30, by - 36 + (i % 2 ? 22 : 0)); g.lineTo(bx + 180, by - 20); g.lineTo(bx - 180, by - 20); g.fill();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(bx - 175, by - 18); g.lineTo(bx + 175, by - 18); g.lineTo(bx + 120, by + 20); g.lineTo(bx - 120, by + 20); g.fill();
  g.fillStyle = '#6b3518'; g.beginPath(); g.roundRect(bx - 175, by + 6, 350, 52, 26); g.fill();
  g.fillStyle = '#f2a93b'; g.beginPath(); g.roundRect(bx - 168, by + 60, 336, 50, [8, 8, 40, 40]); g.fill();
  // price
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(110, 615, 380, 130, 65); g.fill();
  g.fillStyle = '#c4121f'; g.font = '104px Anton'; g.fillText(lang === 'fr' ? '12,99 $' : '$12.99', 300, 718);
  // feeha sticker
  g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(470, 770, 120, 62);
  g.fillStyle = '#111'; g.font = 'italic 900 28px Montserrat'; g.fillText('FEEHA', 530, 805); g.font = '700 12px Montserrat'; g.fillText('PANELS', 530, 822);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function grainTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); const im = g.createImageData(512, 512);
  let r = 1; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 512 * 512; i++) { const v = 235 + rnd() * 20; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// ---------- panel ----------
export const PW = 0.62, PH = 0.86, PD = 0.032, PF = 0.026;
export function makePanel(lang) {
  const g = new THREE.Group();
  const bar = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, PD), M.alu); m.position.set(x, y, 0); m.castShadow = true; g.add(m); return m; };
  bar(PW, PF, 0, PH / 2 - PF / 2); bar(PW, PF, 0, -PH / 2 + PF / 2); bar(PF, PH, -PW / 2 + PF / 2, 0); bar(PF, PH, PW / 2 - PF / 2, 0);
  // groove lines on the frame (snap profile look)
  const lineM = new THREE.MeshStandardMaterial({ color: 0x2d3036, metalness: 0.6, roughness: 0.3 });
  for (const s of [-1, 1]) for (const k of [0.3, 0.7]) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(PW - PF * 2 * k, 0.002, 0.002), lineM); a.position.set(0, s * (PH / 2 - PF * k), PD / 2 + 0.001); g.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.002, PH - PF * 2 * k, 0.002), lineM); b.position.set(s * (PW / 2 - PF * k), 0, PD / 2 + 0.001); g.add(b);
  }
  const tex = posterTexture(lang);
  const faceM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, roughness: 0.35 });
  const blankM = new THREE.MeshStandardMaterial({ color: 0xf1efec, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.4 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(PW - PF * 2, PH - PF * 2), faceM); face.position.z = PD / 2 - 0.004; g.add(face);
  const back = new THREE.Mesh(new THREE.BoxGeometry(PW - PF * 2, PH - PF * 2, 0.012), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.5, roughness: 0.5 })); back.position.z = -PD / 2 + 0.008; g.add(back);
  // power cord at bottom-left
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.25, 6), M.rubber); cord.position.set(-PW / 2 + 0.05, -PH / 2 - 0.12, -0.005); g.add(cord);
  g.userData = { face, faceM, blankM, tex };
  return g;
}
export function setLit(panel, v) { const f = panel.userData.faceM; f.emissiveIntensity = v * 0.95; f.color.setScalar(lerp(0.42, 0.9, v)); }
// bracket keyhole (clover) centre in panel-local coords, s = -1 left / +1 right
export const keyLocal = s => new THREE.Vector3(s * (PW / 2 + 0.012), PH / 2 + 0.012, -PD / 2 - 0.002);

// ---------- corner bracket (flat plate with clover keyhole) ----------
function hull(pts) {
  pts = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// geometry with keyhole centre at origin; tabs run along -x and -y (into the frame corner) — mirror for the left side
export function bracketGeometry() {
  const pts = [], add = (cx, cy, r) => { for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } };
  add(0, 0, 0.022); add(-0.042, -0.02, 0.008); add(-0.02, -0.042, 0.008);
  const sh = new THREE.Shape(hull(pts));
  const clover = new THREE.Path(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = 0.0082 + 0.0036 * Math.cos(4 * (a + Math.PI / 4)); const p = [Math.cos(a) * r, Math.sin(a) * r]; i ? clover.lineTo(...p) : clover.moveTo(...p); }
  sh.holes.push(clover);
  for (const [x, y] of [[-0.042, -0.02], [-0.02, -0.042]]) { const h = new THREE.Path(); h.absarc(x, y, 0.0024, 0, Math.PI * 2, true); sh.holes.push(h); }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.0016, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004, bevelSegments: 1, curveSegments: 12 });
  geo.translate(0, 0, -0.0008); return geo;
}
export const SCREW_SPOTS = [[-0.0336, -0.016], [-0.016, -0.0336]];
export function makeBracket(s) {
  const g = new THREE.Group(); const m = new THREE.Mesh(bracketGeometry(), M.steel); m.castShadow = true; m.scale.set(s * 0.8, 0.8, 1); g.add(m); return g;
}
export function makeSmallScrew(scale = 1) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.0022, 20), M.brass); head.rotation.x = Math.PI / 2; g.add(head);
  for (const r of [0, Math.PI / 2]) { const x = new THREE.Mesh(new THREE.BoxGeometry(0.0055, 0.0009, 0.0012), M.dark); x.position.z = 0.0008; x.rotation.z = r; g.add(x); }
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0017, 0.0008, 0.016, 10), M.brass); shaft.rotation.x = Math.PI / 2; shaft.position.z = -0.009; g.add(shaft);
  g.scale.setScalar(scale); return g;
}
// wall screw: head at origin pointing +z, shaft into -z
export function makeWallScrew() {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.0048, 0.0048, 0.0025, 20), M.steel); head.rotation.x = Math.PI / 2; g.add(head);
  for (const r of [0, Math.PI / 2]) { const x = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.001, 0.0012), M.dark); x.position.z = 0.0009; x.rotation.z = r; g.add(x); }
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0019, 0.001, 0.04, 10), M.steel); shaft.rotation.x = Math.PI / 2; shaft.position.z = -0.021; g.add(shaft);
  for (let i = 0; i < 8; i++) { const th = new THREE.Mesh(new THREE.TorusGeometry(0.0021, 0.0004, 4, 10), M.steelDark); th.position.z = -0.006 - i * 0.004; g.add(th); }
  return g;
}
// wall anchor (cheville): flange at origin, body into -z
export function makeAnchor() {
  const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xf0f0ea, roughness: 0.55 });
  const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.0015, 20), mat); fl.rotation.x = Math.PI / 2; g.add(fl);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0028, 0.032, 16), mat); body.rotation.x = Math.PI / 2; body.position.z = -0.017; g.add(body);
  for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.0043 - i * 0.0003, 0.0007, 4, 16), mat); r.position.z = -0.006 - i * 0.005; g.add(r); }
  return g;
}

// ---------- tools ----------
// drill pointing along -z (bit tip at origin)
export function makeDrill() {
  const g = new THREE.Group(), o = new THREE.Group(); g.add(o);
  const cyl = (r1, r2, l, mat, z, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, l, seg), mat); m.rotation.x = Math.PI / 2; m.position.z = z; m.castShadow = true; o.add(m); return m; };
  const bit = new THREE.Group(); o.add(bit);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.07, 10), M.steel); shaft.rotation.x = Math.PI / 2; shaft.position.z = 0.035; bit.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0028, 0.006, 10), M.steel); tip.rotation.x = -Math.PI / 2; tip.position.z = -0.003; bit.add(tip);
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.0062, 0.0012, 0.0016), M.steelDark); f.position.z = 0.004 + i * 0.0048; f.rotation.z = i * 0.9; bit.add(f); }
  cyl(0.012, 0.016, 0.045, M.rubber, 0.088); cyl(0.0165, 0.0165, 0.012, M.dark, 0.114);
  cyl(0.028, 0.026, 0.13, M.orange, 0.185); cyl(0.0285, 0.0285, 0.05, M.rubber, 0.2);
  const end = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.rubber); end.rotation.x = -Math.PI / 2; end.position.z = 0.25; o.add(end);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.13, 0.045), M.rubber); handle.position.set(0, -0.085, 0.215); handle.rotation.x = -0.25; handle.castShadow = true; o.add(handle);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.07, 0.03), M.orange); grip.position.set(0, -0.08, 0.235); grip.rotation.x = -0.25; o.add(grip);
  const trig = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.026, 0.012), M.dark); trig.position.set(0, -0.045, 0.18); o.add(trig);
  const bat = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.055, 0.1), M.rubber); bat.position.set(0, -0.175, 0.24); bat.castShadow = true; o.add(bat);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.071, 0.012, 0.101), M.orange); stripe.position.set(0, -0.16, 0.24); o.add(stripe);
  g.userData.bit = bit; return g;
}
// level: long axis x, vial at centre facing +z
export function makeLevel(len = 0.6) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.032, 0.022), M.yellow); body.castShadow = true; g.add(body);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.034, 0.024), M.rubber); c.position.x = s * (len / 2 - 0.014); g.add(c); }
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.024), M.dark); g.add(win);
  const vialM = new THREE.MeshStandardMaterial({ color: 0xb8f06a, emissive: 0x5c9a10, emissiveIntensity: 0.35, roughness: 0.2 });
  const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.06, 16), vialM); vial.rotation.z = Math.PI / 2; vial.position.z = 0.006; g.add(vial);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.017, 0.002), M.dark); l.position.set(s * 0.009, 0, 0.0145); g.add(l); }
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 16, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeaffd0, emissiveIntensity: 0.6, roughness: 0.1 })); bub.scale.set(1.5, 1, 0.8); bub.position.z = 0.012; g.add(bub);
  g.userData = { bub, vialM };
  return g;
}
export function setBubble(level, tilt) { // tilt in radians; 0 = level
  const b = level.userData.bub; b.position.x = clamp(tilt * 1.6, -0.022, 0.022);
  const ok = Math.abs(tilt) < 0.002; level.userData.vialM.color.set(ok ? 0x7dff6a : 0xd8f06a);
}
// pencil: tip at origin pointing -z
export function makePencil() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.15, 6), M.yellow); body.rotation.x = Math.PI / 2; body.position.z = 0.093; body.castShadow = true; g.add(body);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.0045, 0.016, 6), M.wood); cone.rotation.x = -Math.PI / 2; cone.position.z = 0.01; g.add(cone);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.0014, 0.005, 8), M.graphite); lead.rotation.x = -Math.PI / 2; lead.position.z = 0.0015; g.add(lead);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.0047, 0.0047, 0.012, 12), M.steel); fer.rotation.x = Math.PI / 2; fer.position.z = 0.174; g.add(fer);
  const er = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.01, 12), new THREE.MeshStandardMaterial({ color: 0xf28a9a, roughness: 0.8 })); er.rotation.x = Math.PI / 2; er.position.z = 0.185; g.add(er);
  return g;
}
export function makeTape() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.035), M.yellow); box.castShadow = true; g.add(box);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.037, 24), M.rubber); side.rotation.x = Math.PI / 2; g.add(side);
  const tapeM = new THREE.MeshStandardMaterial({ color: 0xffd84a, roughness: 0.5, metalness: 0.2 });
  const tape = new THREE.Mesh(new THREE.BoxGeometry(1, 0.0006, 0.02), tapeM); tape.geometry.translate(0.5, 0, 0); tape.position.set(0.035, -0.034, 0); g.add(tape);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.012, 0.022), M.steel); g.add(hook);
  g.userData = { tape, hook }; return g;
}
export function setTape(tp, len) { tp.userData.tape.scale.x = Math.max(0.001, len); tp.userData.hook.position.set(0.035 + len, -0.03, 0); }

// ---------- steel cable kit ----------
// ceiling mount: plate on the underside of the header (plate normal -y), gripper hanging down. origin = plate centre top
export function makeGripper() {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.0025, 0.018), M.steel); plate.position.y = -0.0013; plate.castShadow = true; g.add(plate);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.0025, 20), M.steel); e.position.set(s * 0.025, -0.0013, 0); g.add(e); }
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.022, 0.0025), M.steel); tab.position.set(0, -0.012, 0); g.add(tab);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0045, 0.03, 20), M.steel); body.position.y = -0.035; body.castShadow = true; g.add(body);
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.003, 0.008, 16), M.steel); nose.position.y = -0.054; g.add(nose);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.007, 12), M.steelDark); pin.position.y = -0.061; g.add(pin);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0013, 8, 32), new THREE.MeshBasicMaterial({ color: 0xe11d2e, transparent: true, opacity: 0 })); ring.rotation.x = Math.PI / 2; ring.position.y = -0.062; g.add(ring);
  g.userData = { pin, ring, holes: [-0.025, 0.025] };
  return g;
}
export const GRIP_TIP = -0.064;
export function makeHook() { // snap hook, attach eye at origin, hook below
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.0013, 8, 16), M.steel); g.add(ring);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03, 8), M.steel); sh.position.y = -0.019; g.add(sh);
  const hk = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0016, 8, 24, Math.PI * 1.25), M.steel); hk.position.set(0.008, -0.034, 0); hk.rotation.z = Math.PI * 0.95; g.add(hk);
  const gate = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.018, 6), M.steelDark); gate.position.set(0.009, -0.026, 0); gate.rotation.z = 0.15; g.add(gate);
  return g;
}
export function cableBetween(mesh, a, b) { // mesh: unit cylinder along y
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  mesh.position.copy(a).addScaledVector(d, 0.5); mesh.scale.set(1, Math.max(L, 1e-4), 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
}
export function makeCable() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, 1, 6), new THREE.MeshStandardMaterial({ color: 0xe8ebee, metalness: 0.9, roughness: 0.2 })); m.castShadow = true; return m; }

// ---------- helpers ----------
export function disc(r, mat) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), mat); return m; }
export function arrow(color = 0xe11d2e) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false });
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 12), mat); sh.position.y = 0.035; g.add(sh);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.03, 16), mat); hd.position.y = -0.012; hd.rotation.x = Math.PI; g.add(hd);
  g.renderOrder = 10; g.traverse(o => o.renderOrder = 10); g.userData.mat = mat; return g; // points -y
}
export function dust(n = 40) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.004, transparent: true, opacity: 0.9 })); p.userData.n = n; return p;
}
export function setDust(p, origin, u, normal = new THREE.Vector3(0, 0, 1)) { // u: 0..1 activity
  const a = p.geometry.attributes.position, n = p.userData.n;
  for (let i = 0; i < n; i++) {
    const r1 = Math.sin(i * 12.9898) * 43758.5453 % 1, r2 = Math.sin(i * 78.233) * 12345.678 % 1, ph = ((u * 3 + Math.abs(r1)) % 1);
    const ang = r2 * 6.283, sp = 0.03 * ph;
    const v = new THREE.Vector3(Math.cos(ang) * sp, Math.sin(ang) * sp - ph * ph * 0.05, 0).addScaledVector(normal, ph * 0.02);
    a.setXYZ(i, origin.x + v.x, origin.y + v.y, origin.z + v.z);
  }
  a.needsUpdate = true; p.material.opacity = u > 0 && u < 1 ? 0.85 : 0; p.visible = u > 0 && u < 1;
}
