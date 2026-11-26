// Film 2 — hanging in a storefront window with steel cables
import { THREE, M, grainTexture, clamp, lerp, ease, easeOut, seg, segL, back, makePanel, setLit, keyLocal, PW, PH, PD, makeBracket, SCREW_SPOTS, makeSmallScrew, makeWallScrew, makeAnchor, makeDrill, makeLevel, setBubble, makePencil, makeTape, setTape, makeGripper, GRIP_TIP, makeHook, makeCable, cableBetween, disc, dust, setDust, arrow } from './models.js';
import { makeStage, cameraAt, applyCam, glowTexture, lerpV } from './stage.js';

function streetTexture(night) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 700);
  if (night) { sky.addColorStop(0, '#070b1c'); sky.addColorStop(1, '#1d2747'); } else { sky.addColorStop(0, '#7fb8ec'); sky.addColorStop(1, '#d6ecfb'); }
  g.fillStyle = sky; g.fillRect(0, 0, 2048, 1024);
  const rnd = i => Math.abs(Math.sin(i * 91.17) * 7919.3) % 1;
  let x = -20; let i = 0;
  while (x < 2100) {
    const w = 180 + rnd(i) * 200, h = 380 + rnd(i + 3) * 300, col = night ? ['#1c1f2b', '#23202a', '#1a2230'][i % 3] : ['#b5654a', '#d8c7a8', '#8e9aa6', '#c98a5e'][i % 4];
    g.fillStyle = col; g.fillRect(x, 820 - h, w, h);
    for (let wy = 820 - h + 30; wy < 760; wy += 70) for (let wx = x + 20; wx < x + w - 40; wx += 55) {
      const on = rnd(wx * 0.3 + wy) > (night ? 0.45 : 2);
      g.fillStyle = on ? (rnd(wx + wy) > 0.5 ? '#ffd27a' : '#ffb85c') : (night ? '#11131c' : '#5f7d96'); g.fillRect(wx, wy, 30, 42);
    }
    x += w + 8; i++;
  }
  g.fillStyle = night ? '#141418' : '#7d7b78'; g.fillRect(0, 820, 2048, 204); // road
  g.fillStyle = night ? '#2a2a30' : '#a9a49c'; g.fillRect(0, 800, 2048, 24);
  g.fillStyle = night ? '#e8e3a0' : '#f2f2f2'; for (let k = 0; k < 2048; k += 160) g.fillRect(k, 920, 80, 10);
  // cars
  for (const [cx, col] of [[300, night ? '#3a1d22' : '#c0392b'], [1300, night ? '#1d2a3a' : '#2e5d8c']]) {
    g.fillStyle = col; g.beginPath(); g.roundRect(cx, 850, 300, 70, 20); g.fill(); g.beginPath(); g.roundRect(cx + 60, 800, 170, 60, 20); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(cx + 65, 920, 26, 0, 7); g.arc(cx + 235, 920, 26, 0, 7); g.fill();
    if (night) { g.fillStyle = 'rgba(255,240,180,.9)'; g.beginPath(); g.arc(cx + 292, 875, 10, 0, 7); g.fill(); }
  }
  if (night) for (const lx of [600, 1600]) { const r = g.createRadialGradient(lx, 520, 0, lx, 520, 160); r.addColorStop(0, 'rgba(255,220,150,.8)'); r.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = r; g.fillRect(lx - 160, 360, 320, 320); g.fillStyle = '#333'; g.fillRect(lx - 4, 520, 8, 300); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function build(canvas, T, lang) {
  const { renderer, scene, camera, hemi, key } = makeStage(canvas);
  scene.background = new THREE.Color(0x101218);
  const wallC = 0xcdb99c;
  // interior room
  const inM = new THREE.MeshStandardMaterial({ color: wallC, roughness: 0.92, map: grainTexture() });
  const facadeM = new THREE.MeshStandardMaterial({ color: 0x2a2c31, roughness: 0.6, metalness: 0.2 });
  const piece = (w, h, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), [inM, inM, inM, inM, inM, facadeM]); b.position.set(x, y, -0.1); b.receiveShadow = true; scene.add(b); return b; };
  piece(6, 0.5, 0, 0.25); piece(6, 0.85, 0, 2.875); piece(1.8, 2.0, -2.1, 1.5); piece(1.8, 2.0, 2.1, 1.5);
  const room = new THREE.Mesh(new THREE.BoxGeometry(6, 3.3, 5), new THREE.MeshStandardMaterial({ color: 0xbfae94, roughness: 0.95, side: THREE.BackSide })); room.position.set(0, 1.65, 2.5); room.receiveShadow = true; scene.add(room);
  const floorIn = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), new THREE.MeshStandardMaterial({ color: 0x8d6e4f, roughness: 0.7 })); floorIn.rotation.x = -Math.PI / 2; floorIn.position.set(0, 0.002, 2.5); floorIn.receiveShadow = true; scene.add(floorIn);
  for (const x of [-1.2, 1.2]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xc9a77c })); t.position.set(x, 0.74, 2.2); scene.add(t); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8), M.dark); l.position.set(x, 0.36, 2.2); scene.add(l); }
  // window frame (aluminium), header = linteau
  const header = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.2), M.alu.clone()); header.position.set(0, 2.31, -0.02); header.castShadow = header.receiveShadow = true; scene.add(header);
  const HY = 2.25; // header underside
  const sill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.2), M.alu); sill.position.set(0, 0.53, -0.02); scene.add(sill);
  for (const x of [-1.17, 1.17]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.2), M.alu); m.position.set(x, 1.4, -0.02); scene.add(m); }
  const band = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.42, 0.08), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.4, metalness: 0.4 })); band.position.set(0, 2.78, -0.25); scene.add(band);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.015, 0.01), new THREE.MeshBasicMaterial({ color: 0xe11d2e })); strip.position.set(0, 2.59, -0.3); scene.add(strip);
  for (const x of [-1.6, 1.6]) { const pot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), new THREE.MeshStandardMaterial({ color: 0x3a3c42, roughness: 0.7 })); pot.position.set(x, 0.225, -0.5); scene.add(pot);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshStandardMaterial({ color: 0x3f7d4a, roughness: 0.8 })); bush.position.set(x, 0.62, -0.5); bush.scale.y = 1.2; scene.add(bush); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.7), new THREE.MeshPhysicalMaterial({ color: 0xbfd8e6, transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.set(0, 1.4, -0.06); scene.add(glass);
  // street
  const dayT = streetTexture(false), nightT = streetTexture(true);
  const bdDay = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: dayT })); bdDay.position.set(0, 3.4, -11); scene.add(bdDay);
  const bdNight = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: nightT, transparent: true, opacity: 0 })); bdNight.position.set(0, 3.4, -10.98); scene.add(bdNight);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), new THREE.MeshStandardMaterial({ color: 0x9d9a95, roughness: 0.9 })); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0, -6); walk.receiveShadow = true; scene.add(walk);
  const outLight = new THREE.DirectionalLight(0xffffff, 1.2); outLight.position.set(-1, 4, -5); scene.add(outLight); scene.add(outLight.target);
  key.position.set(1.2, 3.0, 3.2); key.target.position.set(0, 1.6, 0);
  const lamps = [-1, 1].map(x => { const l = new THREE.PointLight(0xffcf8a, 0, 6); l.position.set(x * 1.4, 3.0, 2); scene.add(l); return l; });

  const panel = makePanel(lang); scene.add(panel);
  const brackets = [-1, 1].map(s => { const b = makeBracket(s); panel.add(b); return b; });
  const bScrews = [-1, 1].map(() => SCREW_SPOTS.map(() => { const sc = makeSmallScrew(); panel.add(sc); return sc; }));
  const glowIn = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); glowIn.position.set(0, 1.35, 0.3); scene.add(glowIn);

  const MX = PW / 2 + 0.012, MZ = 0.05; // mount positions on the header underside
  const mounts = [-1, 1].map(sx => {
    const gr = makeGripper(); gr.position.set(sx * MX, HY, MZ); scene.add(gr);
    const screws = [0, 1].map(() => { const s = makeSmallScrew(1.15); scene.add(s); return s; });
    const cable = makeCable(), tail = makeCable(); scene.add(cable); scene.add(tail);
    const hook = makeHook(); scene.add(hook);
    const marks = new THREE.Group(); for (const r of [0.7, -0.7]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.005), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.rotation.z = r; marks.add(m); }
    marks.rotation.x = Math.PI / 2; marks.position.set(sx * MX, HY - 0.001, MZ); scene.add(marks);
    return { sx, gr, screws, cable, tail, hook, marks };
  });
  const drill = makeDrill(); scene.add(drill); const level = makeLevel(0.5); scene.add(level); const pencil = makePencil(); scene.add(pencil);
  const tape = makeTape(); scene.add(tape);
  const centerTick = new THREE.Mesh(new THREE.PlaneGeometry(0.004, 0.06), M.red); centerTick.rotation.x = Math.PI / 2; centerTick.position.set(0, HY - 0.0012, MZ); scene.add(centerTick);
  const dimL = new THREE.Mesh(new THREE.BoxGeometry(1, 0.0025, 0.0025), M.red); scene.add(dimL); const dimR = dimL.clone(); scene.add(dimR);
  const alt = { anchor: makeAnchor(), screw: makeWallScrew(), hole: disc(0.0045, M.hole), gr: makeGripper(), P: new THREE.Vector3(-0.85, HY, MZ) };
  scene.add(alt.anchor); scene.add(alt.screw); alt.hole.rotation.x = Math.PI / 2; alt.hole.position.set(alt.P.x, HY - 0.001, MZ); scene.add(alt.hole); scene.add(alt.gr);
  const arr = arrow(); scene.add(arr);
  const dst = dust(50); scene.add(dst);
  const headerAlu = new THREE.Color(0x1b1d21), headerDry = new THREE.Color(0xe4ddd2);

  const ids = Object.keys(T.lines);
  const S = ids.map((id, i) => i === 0 ? 0 : T.lines[id] - 0.3);
  const lenOf = i => (i < ids.length - 1 ? S[i + 1] : T.dur) - S[i];
  const PK = s => new THREE.Vector3(s * 0.31, 1.68, 0.62);
  const up = (x, dx = 0.0, back = 0.42, dy = -0.3) => ({ p: [x + dx, HY + dy, MZ + back], l: [x, HY, MZ] });
  const camSpecs = [
    (u) => ({ p: lerpV([0.9, 1.2, -5.2], [0.2, 1.4, -3.9], ease(u)), l: [0, 1.5, 0] }),                              // c01 storefront, outside
    (u) => { const a = PK(-1), b = PK(1), w = ease(clamp((u - 0.42) / 0.16)), z = ease(clamp((u - 0.85) / 0.15));
      const f = lerpV([a.x, a.y, a.z], [b.x, b.y, b.z], w); const c = { p: [f[0] + 0.06, f[1] + 0.05, f[2] + 0.36], l: f };
      return { p: lerpV(c.p, [0.0, 1.9, 1.3], z), l: lerpV(c.l, [0, 2.1, 0], z) }; },                                    // c02 brackets
    (u) => { const tipX = lerp(-1.12, 1.1, seg(u, 0.05, 0.4)); let cx = Math.min(0, Math.max(-0.45, tipX));
      cx = lerp(cx, -MX, seg(u, 0.52, 0.6)); cx = lerp(cx, MX, seg(u, 0.72, 0.78)); return { p: [cx + 0.03, 1.8, 0.66], l: [cx, HY, MZ] }; },                                            // c03 measure + mark
    (u) => { const w = ease(clamp((u - 0.55) / 0.12)); const a = up(-MX, 0.1), b = up(MX, -0.1); return { p: lerpV(a.p, b.p, w), l: lerpV(a.l, b.l, w) }; }, // c04 aluminium
    (u) => up(alt.P.x, 0.12, 0.4),                                                                                       // c05 drywall / wood
    (u) => ({ p: lerpV([-0.15, 1.55, 1.05], [0, 1.6, 1.9], ease(clamp((u - 0.45) / 0.55))), l: lerpV([-0.3, 1.68, 0.05], [0, 1.62, 0], ease(clamp((u - 0.45) / 0.55))) }), // c06 hooks
    (u) => { const w = ease(clamp((u - 0.48) / 0.08)), x = lerp(-0.26, 0.26, w); return { p: [x + 0.06 * (1 - 2 * w), 1.93, 1.05], l: [x, 1.93, 0.05] }; }, // c07 pull
    (u) => ({ p: lerpV([0.05, 1.78, 2.0], [0, 1.82, 1.6], u), l: [0, 1.8, 0] }),                                       // c08 level
    (u) => { const w = ease(clamp(u / 0.25)); return { p: lerpV([0, 1.82, 1.55], [-MX + 0.09, HY - 0.12, MZ + 0.22], w), l: lerpV([0, 1.78, 0], [-MX, HY - 0.06, MZ], w) }; }, // c09 press the button
    (u) => ({ p: lerpV([0.5, 1.3, -2.2], [0.25, 1.35, -4.4], ease(u)), l: [0, 1.5, 0] }),                               // c10 outside, day → night
    (u) => ({ p: lerpV([0.25, 1.35, -4.4], [0.15, 1.4, -4.0], u), l: [0, 1.5, 0] }),                                    // c11 CTA
  ];
  const shots = ids.map((id, i) => ({ start: S[i], len: lenOf(i), cam: (tau, len) => camSpecs[i](clamp(tau / len)) }));

  const qFlip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  const ZK = MZ; // key plane z (where hooks hang)
  // hang with world-left key at yl and world-right key at yr (world-left = local +1 when flipped)
  const hang = (yl, yr, dz = 0) => {
    const th = Math.atan2(yr - yl, 2 * MX), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), th).multiply(qFlip);
    panel.quaternion.copy(q); const k = keyLocal(1).applyQuaternion(q);
    panel.position.set(-MX - k.x, yl - k.y, ZK + dz - k.z); return th;
  };
  const keyWorld = s => { panel.updateMatrixWorld(); return panel.localToWorld(keyLocal(s)); };
  const bracketsOn = (u1 = 1, u2 = 1) => {
    [-1, 1].forEach((s, j) => { const u = j === 0 ? u1 : u2, k = keyLocal(s), b = brackets[j];
      b.position.set(k.x, k.y, k.z - (1 - easeOut(u)) * 0.25); b.rotation.set(0, 0, (1 - easeOut(u)) * s * 1.2); b.visible = u > 0; });
  };
  const screwsIn = (s, j, u) => { SCREW_SPOTS.forEach(([x, y], q) => { const sc = bScrews[j][q], v = clamp(u * 2 - q), k = keyLocal(s);
    sc.visible = v > 0; sc.position.set(k.x + s * x * 0.8 / 0.8, k.y + y, k.z - 0.0022 - (1 - easeOut(v)) * 0.03); sc.rotation.set(0, Math.PI, v * 14); }); };
  // mount state: inst 0..1 (fly in), screws 0..1, cable drop
  const mountState = (m, inst, scr) => {
    m.gr.visible = inst > 0; const f = easeOut(inst); m.gr.position.set(m.sx * MX + (1 - f) * 0.1 * m.sx, HY - (1 - f) * 0.25, MZ); m.gr.rotation.set(0, (1 - f) * 1.5, 0);
    m.screws.forEach((s, q) => { const v = clamp(scr * 2 - q); s.visible = v > 0; const hx = m.gr.position.x + m.gr.userData.holes[q];
      s.position.set(hx, HY - 0.0026 - (1 - easeOut(v)) * 0.04, MZ); s.rotation.set(Math.PI / 2, 0, 0); s.rotateZ(v * 14); });
  };
  const gripTip = m => new THREE.Vector3(m.gr.position.x, m.gr.position.y + GRIP_TIP, m.gr.position.z);
  // cable from gripper to point; tail hanging beside
  const cableTo = (m, end, tailLen = 0.12, sway = 0) => {
    const tip = gripTip(m); m.cable.visible = m.tail.visible = true;
    cableBetween(m.cable, tip, end);
    const te = tip.clone().add(new THREE.Vector3(0.006 * m.sx + sway * 0.3, -tailLen, 0.004));
    cableBetween(m.tail, tip.clone().add(new THREE.Vector3(0.0015 * m.sx, 0, 0.002)), te);
    m.hook.visible = true; m.hook.position.copy(end); m.hook.rotation.set(0, Math.PI / 2, 0);
  };
  const drillUp = (x, u, z = MZ) => { // drill pointing up at (x, HY)
    drill.visible = u > 0 && u < 1; const a = easeOut(clamp(u * 4)), o = ease(clamp(u * 4 - 3)), d = clamp(u * 4 - 1) / 2;
    drill.rotation.set(Math.PI / 2, 0, 0); drill.position.set(x + (1 - a) * 0.15 + o * 0.15, HY - 0.006 - (1 - a) * 0.35 - o * 0.35 + ease(clamp(d)) * 0.008, z);
    drill.userData.bit.rotation.z = d > 0 && d < 1 ? u * 600 : 0;
    setDust(dst, new THREE.Vector3(x, HY - 0.004, z), d > 0.05 && d < 1 ? d : 0, new THREE.Vector3(0, -1, 0));
  };
  const levelOn = (th, appear = 1) => {
    level.visible = appear > 0; const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), th);
    const off = new THREE.Vector3(0, PH / 2 + 0.016 + (1 - easeOut(appear)) * 0.25, 0).applyQuaternion(qz);
    level.position.copy(panel.position).add(off); level.position.z = panel.position.z - PD / 2 + 0.012 + 0.02; level.quaternion.copy(qz); setBubble(level, -th);
  };

  const zero = () => {
    panel.visible = true; setLit(panel, 0); glowIn.material.opacity = 0;
    [drill, level, pencil, tape, arr, alt.anchor, alt.screw, alt.hole, alt.gr, centerTick, dimL, dimR].forEach(o => o.visible = false);
    for (const m of mounts) { mountState(m, 1, 1); m.cable.visible = m.tail.visible = m.hook.visible = false; m.marks.visible = false; m.gr.userData.pin.position.y = -0.061; m.gr.userData.ring.material.opacity = 0; }
    bracketsOn(1, 1); screwsIn(-1, 0, 1); screwsIn(1, 1, 1);
    header.material.color.copy(headerAlu); header.material.metalness = 0.75; header.material.roughness = 0.38;
    scene.environmentIntensity = 0.55; walk.material.color.setHex(0x9d9a95); bdNight.material.opacity = 0; hemi.intensity = 0.35; key.intensity = 1.9; outLight.intensity = 1.2; lamps.forEach(l => l.intensity = 0);
    setDust(dst, new THREE.Vector3(), 0); glass.visible = true;
  };
  const night = v => { bdNight.material.opacity = v; hemi.intensity = lerp(0.35, 0.04, v); key.intensity = lerp(1.9, 0.15, v); outLight.intensity = lerp(1.2, 0.0, v); lamps.forEach(l => l.intensity = v * 0.6); scene.environmentIntensity = lerp(0.55, 0.12, v); walk.material.color.setHex(0x9d9a95).multiplyScalar(lerp(1, 0.25, v)); };

  return {
    render(t) {
      zero();
      let i = 0; while (i < shots.length - 1 && t >= shots[i + 1].start) i++;
      const tau = t - shots[i].start, len = shots[i].len, u = clamp(tau / len);
      const hookedFinal = (yl = 1.78, yr = 1.78) => { const th = hang(yl, yr); mounts.forEach((m, j) => { const kw = keyWorld(m.sx === -1 ? 1 : -1); cableTo(m, kw.clone().add(new THREE.Vector3(0, 0.042, 0)), 0.12 + (1.78 - (m.sx === -1 ? yl : yr)) * 0.0); }); return th; };
      if (i === 0) { // finished, outside view
        hookedFinal(); setLit(panel, 0.75); glowIn.material.opacity = 0.25;
        const out = segL(tau, len - 0.5, len); panel.visible = out < 0.5;
      } else if (i === 1) { // brackets on the frame back (inside)
        for (const m of mounts) m.gr.visible = false, m.screws.forEach(s => s.visible = false);
        const intro = seg(tau, 0, 0.6); panel.quaternion.copy(qFlip); panel.position.set(0, 1.25 - (1 - intro) * 0.6, 0.6 - 0.016);
        bracketsOn(segL(u, 0.55, 0.7), segL(u, 0.08, 0.26)); screwsIn(1, 1, segL(u, 0.22, 0.42)); screwsIn(-1, 0, segL(u, 0.64, 0.84));
        if (u > 0.85) { const o = seg(u, 0.85, 1); panel.position.y -= o * 1.2; }
      } else if (i === 2) { // measure & mark the header
        panel.visible = false; for (const m of mounts) m.gr.visible = false, m.screws.forEach(s => s.visible = false);
        const ext = seg(u, 0.05, 0.4); tape.visible = u < 0.95; tape.position.set(-1.12, HY - 0.04, MZ); tape.rotation.set(0, 0, 0); setTape(tape, ext * 2.22); tape.position.y -= seg(u, 0.88, 0.95) * 0.5;
        const c = seg(u, 0.38, 0.48); centerTick.visible = c > 0; centerTick.scale.set(1, Math.max(0.01, c), 1);
        const d = seg(u, 0.45, 0.62); dimL.visible = dimR.visible = d > 0; for (const [dm, s] of [[dimL, -1], [dimR, 1]]) { dm.scale.x = Math.max(0.001, d * MX); dm.position.set(s * d * MX / 2, HY - 0.012, MZ + 0.02); }
        mounts.forEach((m, j) => { const p = segL(u, 0.6 + j * 0.18, 0.72 + j * 0.18); m.marks.visible = p > 0.4; m.marks.scale.setScalar(Math.max(0.01, easeOut((p - 0.4) / 0.6))); });
        const pj = u < 0.75 ? 0 : 1, pu = segL(u, 0.58 + pj * 0.18, 0.74 + pj * 0.18); pencil.visible = u > 0.58 && u < 0.92;
        const mx = mounts[pj].sx * MX; pencil.position.set(mx + Math.sin(pu * 12) * 0.006, HY - 0.003 - (1 - Math.sin(pu * Math.PI)) * 0.06, MZ + 0.004); pencil.rotation.set(Math.PI / 2 + 0.4, 0, 0.3);
      } else if (i === 3) { // aluminium: mount + 2 self-drilling screws, left then right
        panel.visible = false; mounts.forEach(m => m.marks.visible = true);
        const [L, R] = mounts;
        mountState(L, segL(u, 0.0, 0.12), segL(u, 0.12, 0.5)); mountState(R, segL(u, 0.62, 0.72), segL(u, 0.72, 0.95));
        if (u > 0.12) L.marks.visible = false; if (u > 0.72) R.marks.visible = false;
        if (u < 0.55) { const q = segL(u, 0.12, 0.52), w = q < 0.5 ? 0 : 1; drillUp(L.gr.position.x + L.gr.userData.holes[w], clamp(q * 2 - w)); }
        else { const q = segL(u, 0.7, 0.98), w = q < 0.5 ? 0 : 1; drillUp(R.gr.position.x + R.gr.userData.holes[w], clamp(q * 2 - w)); }
        mounts.forEach(m => { if (m.gr.visible && m.screws[1].visible) cableTo(m, gripTip(m).add(new THREE.Vector3(0, -0.5, 0)), 0.1, Math.sin(t * 3) * 0.01); });
      } else if (i === 4) { // drywall / wood: hole, anchor, screw
        panel.visible = false; const dry = seg(u, 0, 0.1) * (1 - seg(u, 0.9, 1));
        header.material.color.copy(headerAlu).lerp(headerDry, dry); header.material.metalness = lerp(0.75, 0, dry); header.material.roughness = lerp(0.38, 0.9, dry);
        mounts.forEach(m => cableTo(m, gripTip(m).add(new THREE.Vector3(0, -0.5, 0)), 0.1, Math.sin(t * 3) * 0.01));
        const P = alt.P;
        drillUp(P.x, segL(u, 0.08, 0.38)); alt.hole.visible = u > 0.25 && dry > 0.05;
        const a = segL(u, 0.38, 0.58); alt.anchor.visible = a > 0 && dry > 0.05; alt.anchor.rotation.set(Math.PI / 2, 0, 0); alt.anchor.position.set(P.x, lerp(HY - 0.3, HY - 0.06, easeOut(clamp(a * 1.6))) + ease(clamp(a * 1.6 - 0.6)) * 0.06 - 0.0008, MZ);
        const g = segL(u, 0.56, 0.68); alt.gr.visible = g > 0 && dry > 0.05; alt.gr.position.set(P.x, HY - (1 - easeOut(g)) * 0.15, MZ);
        const s = segL(u, 0.66, 0.88); alt.screw.visible = s > 0 && dry > 0.05; alt.screw.rotation.set(Math.PI / 2, 0, 0); alt.screw.position.set(P.x + alt.gr.userData.holes[0] * 0 , lerp(HY - 0.2, HY - 0.0045, ease(s)), MZ); alt.screw.rotateZ(s * 16);
        if (s > 0) drillUp(P.x, 0.25 + s * 0.5);
      } else if (i === 5) { // hooks into the brackets
        const rise = seg(tau, 0, Math.min(1.3, len * 0.4)); hang(1.65 - (1 - rise) * 0.5, 1.65 - (1 - rise) * 0.5, 0);
        const clip = seg(u, 0.38, 0.62);
        mounts.forEach(m => { const kw = keyWorld(m.sx === -1 ? 1 : -1); const end = kw.clone().add(new THREE.Vector3(0, 0.042 + (1 - clip) * 0.04, (1 - clip) * 0.03)); cableTo(m, end, 0.1); });
      } else if (i === 6) { // pull the tails: left, then right (slightly off)
        const lu = seg(u, 0.12, 0.5), ru = seg(u, 0.52, 0.9);
        const yl = lerp(1.65, 1.78, lu), yr = lerp(1.65, 1.75, ru); const th = hang(yl, yr);
        mounts.forEach((m, j) => { const kw = keyWorld(m.sx === -1 ? 1 : -1); cableTo(m, kw.clone().add(new THREE.Vector3(0, 0.042, 0)), 0.1 + (j === 0 ? yl : yr) - 1.65); });
        const act = u < 0.51 ? 0 : 1, au = act ? ru : lu, m = mounts[act]; arr.visible = au > 0.02 && au < 0.98;
        const tip = gripTip(m); arr.position.set(tip.x + 0.035 * m.sx, tip.y - 0.1 - au * 0.1, MZ + 0.03); arr.scale.setScalar(0.9);
      } else if (i === 7) { // level check: right side a little low → pull to match
        const fix = seg(u, 0.45, 0.8), yr = lerp(1.75, 1.78, fix); const th = hang(1.78, yr);
        mounts.forEach((m, j) => { const kw = keyWorld(m.sx === -1 ? 1 : -1); cableTo(m, kw.clone().add(new THREE.Vector3(0, 0.042, 0)), 0.1 + (j === 0 ? 1.78 : yr) - 1.65); });
        levelOn(th, segL(u, 0, 0.2));
      } else if (i === 8) { // too high → press the piston, it slides back down
        const over = seg(u, 0, 0.15), press = segL(u, 0.4, 0.8), down = seg(u, 0.45, 0.78);
        const yl = 1.78 + over * 0.05 - down * 0.05; const th = hang(yl, 1.78);
        mounts.forEach((m, j) => { const kw = keyWorld(m.sx === -1 ? 1 : -1); cableTo(m, kw.clone().add(new THREE.Vector3(0, 0.042, 0)), 0.1 + (j === 0 ? yl : 1.78) - 1.65); });
        const L = mounts[0], pin = L.gr.userData.pin, on = press > 0 && press < 1 ? 1 : 0;
        pin.position.y = -0.061 + on * 0.0035; L.gr.userData.ring.material.opacity = on * (0.6 + 0.4 * Math.sin(t * 12));
        arr.visible = press > 0.0 && press < 1; arr.rotation.set(0, 0, Math.PI); const tip = gripTip(L); arr.position.set(tip.x, tip.y - 0.06 + Math.sin(t * 10) * 0.004, MZ + 0.01); arr.scale.setScalar(0.45);
        levelOn(th, 1 - segL(u, 0.85, 1));
      } else { // outside, day → night, lights on
        hookedFinal(); const n = i === 9 ? seg(u, 0.2, 0.7) : 1; night(n);
        const lit = i === 9 ? easeOut(segL(u, 0.35, 0.6)) : 1; setLit(panel, lit); glowIn.material.opacity = lit * (0.25 + 0.5 * n);
      }
      applyCam(camera, cameraAt(shots, t));
      renderer.render(scene, camera);
    },
    shots,
  };
}
