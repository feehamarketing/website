// Film 1 — mounting on a drywall wall
import { THREE, M, grainTexture, clamp, lerp, ease, easeOut, seg, segL, back, makePanel, setLit, PW, PH, PD, makeBracket, SCREW_SPOTS, makeSmallScrew, makeWallScrew, makeAnchor, makeDrill, makeLevel, setBubble, makePencil, disc, dust, setDust } from './models.js';
import { makeStage, cameraAt, applyCam, glowTexture, lerpV } from './stage.js';

export function build(canvas, T, lang) {
  const { renderer, scene, camera } = makeStage(canvas);
  scene.background = new THREE.Color(0x8c7c66);
  // room
  const wallM = new THREE.MeshStandardMaterial({ color: 0xcdb99c, roughness: 0.92, map: grainTexture() });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallM); wall.position.set(0, 2.5, 0); wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshStandardMaterial({ color: 0x9b7b58, roughness: 0.7 })); floor.rotation.x = -Math.PI / 2; floor.position.z = 3; floor.receiveShadow = true; scene.add(floor);
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.015), new THREE.MeshStandardMaterial({ color: 0xf5f2ec, roughness: 0.6 })); base.position.set(0, 0.05, 0.0075); scene.add(base);
  // a counter + plant for context in wide shots
  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.74, 0.5), new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.5 })); counter.position.set(0.1, 0.37, 0.25); counter.castShadow = counter.receiveShadow = true; scene.add(counter);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.04, 0.56), new THREE.MeshStandardMaterial({ color: 0xc9a77c, roughness: 0.55 })); top.position.set(0.1, 0.76, 0.26); top.receiveShadow = top.castShadow = true; scene.add(top);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.26, 24), new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.8 })); pot.position.set(-0.95, 0.13, 0.35); pot.castShadow = true; scene.add(pot);
  const leafM = new THREE.MeshStandardMaterial({ color: 0x3f7d4a, roughness: 0.7 });
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), leafM); l.scale.set(0.5, 1.6, 0.25); l.position.set(-0.95 + Math.sin(i * 2.4) * 0.12, 0.42 + (i % 3) * 0.1, 0.35 + Math.cos(i * 2.4) * 0.12); l.rotation.z = Math.sin(i * 2.4) * 0.5; l.castShadow = true; scene.add(l); }

  // brackets screwed straight on the top bar (not diagonal). 'up' = keyhole above the frame (test fit), 'dn' = flipped behind the frame (final, invisible)
  const BX = PW / 2 - 0.05;
  const KEY = (s, mode) => new THREE.Vector3(s * BX, mode === 'up' ? PH / 2 + 0.022 : PH / 2 - 0.048, -PD / 2 - 0.002);
  const P1 = new THREE.Vector3(-BX, 1.75, 0), P2 = new THREE.Vector3(BX, 1.75, 0);
  const panel = makePanel(lang); scene.add(panel);
  const brackets = [-1, 1].map(s => { const b = makeBracket(s); panel.add(b); return b; });
  const bScrews = [-1, 1].map(s => SCREW_SPOTS.map(() => { const sc = makeSmallScrew(); panel.add(sc); return sc; }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); glow.position.set(0, 1.38, 0.003); scene.add(glow);
  const hw = [P1, P2].map(P => {
    const mark = new THREE.Group(); for (const r of [0.7, -0.7]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.0022), M.mark); m.rotation.z = r; mark.add(m); } mark.position.copy(P).setZ(0.0015); scene.add(mark);
    const hole = disc(0.0042, M.hole); hole.position.copy(P).setZ(0.002); scene.add(hole);
    const anchor = makeAnchor(); scene.add(anchor); const screw = makeWallScrew(); scene.add(screw);
    return { P, mark, hole, anchor, screw };
  });
  const drill = makeDrill(); scene.add(drill); const level = makeLevel(0.6); scene.add(level); const pencil = makePencil(); scene.add(pencil);
  const spareAnchors = [0, 1].map(() => { const a = makeAnchor(); scene.add(a); return a; });
  const spareScrews = [0, 1].map(() => { const a = makeWallScrew(); scene.add(a); return a; });
  const dst = dust(50); scene.add(dst);

  // ---- shots ----
  const ids = Object.keys(T.lines);
  const S = ids.map((id, i) => i === 0 ? 0 : T.lines[id] - 0.3);
  const lenOf = i => (i < ids.length - 1 ? S[i + 1] : T.dur) - S[i];
  const W = (P, dx = 0.1, dy = 0.04, dz = 0.42) => ({ p: [P.x + dx, P.y + dy, P.z + dz], l: [P.x, P.y, P.z] });
  const BACK1 = new THREE.Vector3(0, 1.25, 0.484), BACK2 = new THREE.Vector3(0, 1.348, 0.524); // back-view poses (bracket shot / flip shot)
  const corner = (pos, s, ky) => new THREE.Vector3(-s * BX, pos.y + ky, pos.z + 0.02);
  const pan2 = (u, a, b, t0, t1, t2) => { // close on corner a, move to b, pull back
    const w = ease(clamp((u - t0) / 0.08)), z = ease(clamp((u - t2) / (1 - t2))), f = lerpV([a.x, a.y, a.z], [b.x, b.y, b.z], w);
    const c = { p: [f[0] + 0.05, f[1] + 0.03, f[2] + 0.34], l: f }; const wide = { p: [0.05, 1.55, 2.0], l: [0, 1.4, 0.4] };
    const inn = ease(clamp(u / t1)); const far = { p: lerpV(wide.p, c.p, inn), l: lerpV(wide.l, c.l, inn) };
    return { p: lerpV(far.p, wide.p, z), l: lerpV(far.l, wide.l, z) };
  };
  const camSpecs = [
    (u) => ({ p: lerpV([0.3, 1.66, 2.5], [0.1, 1.6, 3.0], ease(u)), l: [0, 1.6, 0] }),                         // w01 hook
    (u) => ({ p: lerpV([0.04, 1.48, 1.75], [0, 1.46, 1.6], u), l: [0, 1.44, 0.2] }),                            // w02 tools
    (u) => pan2(u, corner(BACK1, 1, 0.43), corner(BACK1, -1, 0.43), 0.46, 0.08, 0.86),                           // w03 brackets on the top bar
    (u) => { const c = W(P1, 0.16, 0.03, 0.46); c.p[0] -= u * 0.05; return c; },                                // w04 1st point: mark, drill, anchor, screw
    (u) => ({ p: lerpV([-0.05, 1.5, 2.1], [0.05, 1.47, 2.25], u), l: [0, 1.42, 0] }),                          // w05 hang on screw 1
    (u) => u < 0.6 ? { p: lerpV([0.05, 1.47, 2.25], [0.02, 1.64, 1.7], ease(u / 0.6)), l: lerpV([0, 1.42, 0], [0, 1.62, 0], ease(u / 0.6)) }
      : { p: lerpV([0.02, 1.64, 1.7], [P2.x + 0.1, P2.y + 0.05, 0.42], ease((u - 0.6) / 0.2)), l: lerpV([0, 1.62, 0], [P2.x, P2.y, 0], ease((u - 0.6) / 0.2)) }, // w06 level + mark 2
    (u) => { const c = W(P2, -0.18, 0.03, 0.46); c.p[0] += u * 0.05; return c; },                               // w07 2nd hole
    (u) => ({ p: lerpV([0.0, 1.55, 2.0], [0.04, 1.58, 1.8], u), l: [0, 1.5, 0] }),                              // w08 test fit
    (u) => pan2(u, corner(BACK2, 1, 0.42), corner(BACK2, -1, 0.42), 0.6, 0.3, 0.88),                            // w09 flip the brackets
    (u) => ({ p: lerpV([0.05, 1.55, 2.0], [0.3, 1.35, 3.3], ease(clamp((u - 0.4) / 0.6))), l: [0, 1.42, 0] }),  // w10 final hang + light
    (u) => ({ p: lerpV([0.3, 1.35, 3.3], [0.15, 1.4, 2.9], u), l: [0, 1.42, 0] }),                              // w11 CTA
  ];
  const shots = ids.map((id, i) => ({ start: S[i], len: lenOf(i), cam: (tau, len) => camSpecs[i](clamp(tau / len)) }));

  // bracket pose: mode up/dn, f = flip progress (0 up → 1 dn), inst = fly-in progress, lift = pulled off the frame
  const bracketPose = (j, s, f, inst = 1, lift = 0) => {
    const b = brackets[j], a = KEY(s, 'up'), d = KEY(s, 'dn'), k = a.clone().lerp(d, ease(f));
    b.visible = inst > 0; b.position.set(k.x, k.y, k.z - (1 - easeOut(inst)) * 0.25 - lift * 0.03);
    b.rotation.set(0, 0, s * Math.PI / 4 + Math.PI * ease(f) + (1 - easeOut(inst)) * s * 1.2);
  };
  const screwPose = (j, s, mode, v) => { // v 0..1 screwed in (both screws, one after the other)
    const rz = s * Math.PI / 4 + (mode === 'dn' ? Math.PI : 0), k = KEY(s, mode), c = Math.cos(rz), sn = Math.sin(rz);
    SCREW_SPOTS.forEach(([x, y], q) => {
      const sc = bScrews[j][q], w = clamp(v * 2 - q), lx = s * x, ly = y;
      sc.visible = w > 0; sc.position.set(k.x + lx * c - ly * sn, k.y + lx * sn + ly * c, k.z - 0.0022 - (1 - easeOut(w)) * 0.03); sc.rotation.set(0, Math.PI, w * 14);
    });
  };
  const allBrackets = mode => { [-1, 1].forEach((s, j) => { bracketPose(j, s, mode === 'dn' ? 1 : 0); screwPose(j, s, mode, 1); }); };
  const zero = () => {
    panel.visible = true; panel.rotation.set(0, 0, 0); setLit(panel, 0); glow.material.opacity = 0;
    for (const h of hw) { h.mark.visible = false; h.hole.visible = false; h.anchor.visible = false; h.screw.visible = false; }
    drill.visible = level.visible = pencil.visible = false; spareAnchors.forEach(a => a.visible = false); spareScrews.forEach(a => a.visible = false);
    setDust(dst, P1, 0);
    [drill, level, pencil, ...spareAnchors, ...spareScrews].forEach(o => o.scale.setScalar(1));
    allBrackets('up');
  };
  // place panel so its key (side s, mode) sits at world point W with tilt rot
  const hangBy = (s, Wp, rot, mode = 'up', zOff = 0.006) => {
    panel.rotation.set(0, 0, rot);
    const k = KEY(s, mode).applyEuler(new THREE.Euler(0, 0, rot));
    panel.position.set(Wp.x - k.x, Wp.y - k.y, Wp.z + zOff - k.z);
  };
  const drillAt = (P, u, phaseIn, phaseDrill, phaseOut) => {
    const a = segL(u, phaseIn[0], phaseIn[1]), d = segL(u, phaseDrill[0], phaseDrill[1]), o = segL(u, phaseOut[0], phaseOut[1]);
    drill.visible = a > 0 && o < 1;
    const depth = ease(d) * 0.03, away = (1 - easeOut(a)) * 0.6 + ease(o) * 0.6;
    drill.position.set(P.x + away * 0.4, P.y - away * 0.25, P.z + 0.001 - depth + away + (d > 0 ? 0 : 0.01));
    drill.rotation.set(0, (1 - easeOut(a)) * -0.4 + ease(o) * 0.4, 0);
    drill.userData.bit.rotation.z = d > 0 && d < 1 ? u * 900 : 0;
    drill.position.x += d > 0 && d < 1 ? Math.sin(u * 400) * 0.0006 : 0;
    setDust(dst, new THREE.Vector3(P.x, P.y, 0.004), d > 0.05 && d < 1 ? d : 0);
    return d;
  };
  const anchorIn = (h, u) => {
    h.anchor.visible = u > 0; const f = easeOut(clamp(u * 1.6)), push = ease(clamp(u * 1.6 - 0.6));
    h.anchor.position.set(h.P.x + (1 - f) * 0.15, h.P.y + (1 - f) * 0.1, lerp(0.05 + (1 - f) * 0.3, 0.0008, push)); h.anchor.rotation.set(0, 0, 0);
  };
  const screwIn = (h, u, head = 0.006) => {
    h.screw.visible = u > 0; const f = easeOut(clamp(u * 2)), d = ease(clamp(u * 2 - 1));
    h.screw.position.set(h.P.x + (1 - f) * 0.12, h.P.y + (1 - f) * 0.08, lerp(0.06 + (1 - f) * 0.25, head, d)); h.screw.rotation.set(0, 0, d * 18);
  };
  const pencilMark = (h, u) => {
    const a = segL(u, 0, 0.35), m = segL(u, 0.35, 0.7), o = segL(u, 0.7, 1);
    pencil.visible = a > 0 && o < 1;
    pencil.position.set(h.P.x + (1 - easeOut(a)) * 0.2 + ease(o) * 0.2 + Math.sin(m * Math.PI * 2) * 0.006, h.P.y + (1 - easeOut(a)) * 0.15 + ease(o) * 0.15 + Math.cos(m * Math.PI * 2) * 0.006, 0.002 + (1 - easeOut(a)) * 0.1 + ease(o) * 0.12);
    pencil.rotation.set(-0.35, 0.45, 0);
    h.mark.visible = m > 0; h.mark.scale.setScalar(Math.max(0.01, easeOut(m)));
  };
  const LEVEL_Y = PH / 2 + 0.016;
  const levelOnPanel = (rot, appear = 1) => {
    level.visible = appear > 0; const k = new THREE.Vector3(0, LEVEL_Y + (1 - easeOut(appear)) * 0.2, PD / 2 - 0.004 + (1 - easeOut(appear)) * 0.2).applyEuler(new THREE.Euler(0, 0, rot));
    level.position.copy(panel.position).add(k); level.rotation.set(0, 0, rot); setBubble(level, rot);
  };
  const OFF = new THREE.Vector3(0, 0.05, 0.5); // lifted off the wall
  return {
    render(t) {
      zero();
      let i = 0; while (i < shots.length - 1 && t >= shots[i + 1].start) i++;
      const tau = t - shots[i].start, len = shots[i].len, u = clamp(tau / len);
      const install = (n) => { for (let k = 0; k < n; k++) { const h = hw[k]; h.hole.visible = true; h.anchor.visible = true; h.anchor.position.set(h.P.x, h.P.y, 0.0008); h.screw.visible = true; h.screw.position.set(h.P.x, h.P.y, 0.006); h.screw.rotation.set(0, 0, 0); } };
      if (i === 0) { // finished result (brackets hidden behind), lights on; switches off at the end
        install(2); allBrackets('dn'); hangBy(-1, P1, 0, 'dn'); const lit = 1 - segL(tau, len - 0.35, len); setLit(panel, lit); glow.material.opacity = lit * 0.75;
      } else if (i === 1) { // panel leaves, tools pop in
        install(0); allBrackets('dn'); const off = seg(tau, 0, 0.7); hangBy(-1, P1, 0, 'dn'); panel.position.x += off * 1.8; panel.position.z += off * 0.4; panel.visible = off < 1;
        const items = [drill, level, pencil, spareAnchors[0], spareAnchors[1], spareScrews[0], spareScrews[1]];
        const times = [0.18, 0.36, 0.52, 0.68, 0.72, 0.84, 0.88].map(f => T.lines[ids[1]] - shots[1].start + f * T.lineDur[ids[1]] - 0.15);
        const spots = [[-0.06, 1.7, 0.2], [0, 1.47, 0.2], [0.13, 1.3, 0.22], [-0.15, 1.25, 0.2], [-0.08, 1.25, 0.2], [-0.13, 1.16, 0.2], [-0.05, 1.16, 0.2]];
        items.forEach((o, k) => {
          const p = clamp((tau - times[k]) / 0.45), out = seg(tau, len - 0.35, len);
          o.visible = p > 0 && out < 1; o.position.set(...spots[k]); o.position.y += out * 0.5;
          o.scale.setScalar(Math.max(0.001, back(p) * (k >= 3 ? 2.2 : 1)));
          o.rotation.set(k === 2 ? -0.5 : k >= 3 ? 1.2 : 0.15, (k === 0 ? 1.1 : k === 1 ? 0.2 : 0.4) + Math.sin(tau * 1.3 + k) * 0.15, k === 2 ? 0.7 : k === 1 ? -0.35 : 0.05);
        });
        if (level.visible) setBubble(level, 0.01);
      } else if (i === 2) { // brackets straight on the top bar, one each side (world-left = local +1 first)
        const intro = seg(tau, 0, 0.6); panel.rotation.set(0, Math.PI, 0); panel.position.copy(BACK1); panel.position.y -= (1 - intro) * 0.6;
        bracketPose(1, 1, 0, segL(u, 0.08, 0.24)); screwPose(1, 1, 'up', segL(u, 0.22, 0.42));
        bracketPose(0, -1, 0, segL(u, 0.55, 0.68)); screwPose(0, -1, 'up', segL(u, 0.64, 0.84));
      } else if (i === 3) { // 1st point: mark, drill, anchor, screw
        const away = seg(tau, 0, 0.6); panel.rotation.set(0, Math.PI * (1 - away), 0); panel.position.set(BACK1.x + away * 1.6, BACK1.y, BACK1.z + away * 0.6); panel.visible = away < 1;
        pencilMark(hw[0], segL(u, 0.08, 0.26)); if (u >= 0.26) hw[0].mark.visible = true;
        const d = drillAt(P1, u, [0.24, 0.32], [0.32, 0.46], [0.46, 0.53]); hw[0].hole.visible = d > 0.6;
        anchorIn(hw[0], segL(u, 0.5, 0.68)); if (u > 0.68) hw[0].mark.visible = false;
        screwIn(hw[0], segL(u, 0.68, 0.97));
      } else if (i === 4) { // hang on the first screw — tilted
        install(1);
        const a = seg(tau, 0, Math.min(1.2, len * 0.6)), drop = seg(tau, Math.min(1.2, len * 0.6), Math.min(1.6, len * 0.85));
        const rot = -0.14 * ease(drop) + Math.sin(clamp(tau - 1.4) * 9) * 0.02 * (1 - clamp(tau - 1.4));
        hangBy(-1, new THREE.Vector3(P1.x + (1 - a) * 0.5, P1.y + 0.03 * (1 - drop) + (1 - a) * 0.25, P1.z + (1 - a) * 0.5), rot);
      } else if (i === 5) { // level it, mark point 2 through the other bracket
        install(1);
        const fix = seg(u, 0.18, 0.5), rot = lerp(-0.14, 0, fix); hangBy(-1, P1, rot);
        levelOnPanel(rot, segL(u, 0, 0.14)); if (u > 0.62) { const o = seg(u, 0.6, 0.66); level.position.y += o * 0.4; level.visible = o < 1; }
        pencilMark(hw[1], segL(u, 0.7, 0.98)); if (u > 0.98) hw[1].mark.visible = true;
      } else if (i === 6) { // take it down, 2nd hole
        install(1); hw[1].mark.visible = true;
        const off = seg(tau, 0, 0.5); hangBy(-1, P1, 0); panel.position.y += off * 0.12; panel.position.z += off * 0.8; panel.position.x -= off * 0.9; panel.visible = off < 1;
        const d = drillAt(P2, u, [0.08, 0.2], [0.2, 0.4], [0.4, 0.5]);
        hw[1].hole.visible = d > 0.6; anchorIn(hw[1], segL(u, 0.48, 0.7)); if (u > 0.7) hw[1].mark.visible = false;
        screwIn(hw[1], segL(u, 0.7, 0.98));
      } else if (i === 7) { // test fit on both screws
        install(2); const a = seg(tau, 0, Math.min(1.1, len * 0.35));
        hangBy(-1, P1, 0); panel.position.x -= (1 - a) * 0.6; panel.position.z += (1 - a) * 0.6;
        const lv = segL(u, 0.4, 0.55); if (lv > 0) levelOnPanel(0, lv);
      } else if (i === 8) { // take it down, flip the brackets so they hide behind the frame
        install(2);
        const off = seg(u, 0, 0.12), turn = seg(u, 0.12, 0.28), back2 = seg(u, 0.9, 1);
        hangBy(-1, P1, 0); const hung = panel.position.clone();
        const p0 = hung.clone().add(OFF.clone().multiplyScalar(off));
        panel.position.copy(p0.lerp(BACK2, turn)); panel.rotation.set(0, Math.PI * (turn - back2), 0);
        // world-left (local +1, index 1) first, then the other
        for (const [j, s, a0] of [[1, 1, 0.3], [0, -1, 0.62]]) {
          const out = segL(u, a0, a0 + 0.08), flip = segL(u, a0 + 0.08, a0 + 0.16), inn = segL(u, a0 + 0.16, a0 + 0.26);
          const mode = flip >= 1 ? 'dn' : 'up';
          bracketPose(j, s, flip, 1, Math.sin(Math.PI * flip)); screwPose(j, s, mode, flip > 0 && flip < 1 ? 0 : (mode === 'up' ? 1 - out : inn));
        }
      } else { // final hang (brackets hidden), light up, CTA
        install(2); allBrackets('dn');
        const a = i === 9 ? seg(tau, 0, Math.min(1.1, len * 0.3)) : 1;
        hangBy(-1, P1, 0, 'dn'); panel.position.z += (1 - a) * 0.5; panel.position.y += (1 - a) * -0.02;
        if (i === 9) { const lv = segL(tau, len * 0.28, len * 0.38), lo = segL(tau, len * 0.52, len * 0.58); if (lv > 0 && lo < 1) { levelOnPanel(0, lv); level.position.y += ease(lo) * 0.4; } }
        const lit = i === 9 ? easeOut(segL(tau, len * 0.6, len * 0.75)) : 1; setLit(panel, lit); glow.material.opacity = lit * 0.75;
      }
      applyCam(camera, cameraAt(shots, t));
      renderer.render(scene, camera);
    },
    shots,
  };
}
