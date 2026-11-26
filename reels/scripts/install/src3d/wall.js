// Film 1 — mounting on a drywall wall
import { THREE, M, grainTexture, clamp, lerp, ease, easeOut, seg, segL, back, makePanel, setLit, keyLocal, PW, PH, PD, makeBracket, SCREW_SPOTS, makeSmallScrew, makeWallScrew, makeAnchor, makeDrill, makeLevel, setBubble, makePencil, disc, dust, setDust } from './models.js';
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

  const P1 = new THREE.Vector3(-(PW / 2 + 0.012), 1.75, 0), P2 = new THREE.Vector3(PW / 2 + 0.012, 1.75, 0);
  const panel = makePanel(lang); scene.add(panel);
  const brackets = [-1, 1].map(s => { const b = makeBracket(s); panel.add(b); return b; });
  const bScrews = [-1, 1].map(s => SCREW_SPOTS.map(() => { const sc = makeSmallScrew(); panel.add(sc); return sc; }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); glow.position.set(0, 1.32, 0.003); scene.add(glow);
  // wall hardware for both points
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
  const PK = s => new THREE.Vector3(s * 0.31, 1.68, 0.5); // panel corners in the bracket shot (world)
  const camSpecs = [
    (u) => ({ p: lerpV([0.3, 1.62, 2.5], [0.1, 1.55, 3.0], ease(u)), l: [0, 1.56, 0] }),                       // w01 hook
    (u) => ({ p: lerpV([0.04, 1.48, 1.75], [0, 1.46, 1.6], u), l: [0, 1.44, 0.2] }),                            // w02 tools
    (u) => { const a = PK(-1), b = PK(1), w = ease(clamp((u - 0.42) / 0.16)), z = ease(clamp((u - 0.82) / 0.18));
      const f = lerpV([a.x, a.y, a.z], [b.x, b.y, b.z], w); const c = { p: [f[0] + 0.06, f[1] + 0.05, f[2] + 0.36], l: f };
      return { p: lerpV(c.p, [0.1, 1.5, 2.1], z), l: lerpV(c.l, [0, 1.3, 0.5], z) }; },                            // w03 brackets (back of the frame)
    (u) => { const c = W(P1, 0.12, 0.04, 0.42); c.p[2] -= u * 0.05; return c; },                                // w04 mark
    (u) => { const c = W(P1, 0.2, 0.03, 0.46); c.p[0] -= u * 0.05; return c; },                                 // w05 drill/anchor/screw
    (u) => ({ p: lerpV([-0.05, 1.45, 2.1], [0.05, 1.42, 2.25], u), l: [0, 1.38, 0] }),                         // w06 hang
    (u) => u < 0.6 ? { p: lerpV([0.05, 1.42, 2.25], [0.02, 1.62, 1.7], ease(u / 0.6)), l: lerpV([0, 1.38, 0], [0, 1.6, 0], ease(u / 0.6)) }
      : { p: lerpV([0.02, 1.62, 1.7], [P2.x + 0.1, P2.y + 0.05, 0.42], ease((u - 0.6) / 0.2)), l: lerpV([0, 1.6, 0], [P2.x, P2.y, 0], ease((u - 0.6) / 0.2)) }, // w07 level + mark
    (u) => { const c = W(P2, -0.2, 0.03, 0.46); c.p[0] += u * 0.05; return c; },                                // w08 second hole
    (u) => ({ p: lerpV([0.05, 1.42, 2.2], [0.3, 1.25, 3.3], ease(clamp((u - 0.4) / 0.6))), l: [0, 1.3, 0] }),   // w09 rehang + light up
    (u) => ({ p: lerpV([0.3, 1.25, 3.3], [0.15, 1.3, 2.9], u), l: [0, 1.3, 0] }),                               // w10 CTA
  ];
  const shots = ids.map((id, i) => ({ start: S[i], len: lenOf(i), cam: (tau, len) => camSpecs[i](clamp(tau / len)) }));

  const zero = () => {
    panel.visible = true; panel.rotation.set(0, 0, 0); setLit(panel, 0); glow.material.opacity = 0;
    brackets.forEach(b => b.visible = true); bScrews.flat().forEach(s => s.visible = true);
    for (const h of hw) { h.mark.visible = false; h.hole.visible = false; h.anchor.visible = false; h.screw.visible = false; }
    drill.visible = level.visible = pencil.visible = false; spareAnchors.forEach(a => a.visible = false); spareScrews.forEach(a => a.visible = false);
    setDust(dst, P1, 0);
    [drill, level, pencil, ...spareAnchors, ...spareScrews].forEach(o => o.scale.setScalar(1));
    bracketsOn(1, 1); screwsIn(-1, 0, 1); screwsIn(1, 1, 1);
  };
  // place panel so its key (side s) sits at world point W with tilt rot
  const hangBy = (s, Wp, rot, zOff = 0.006) => {
    panel.rotation.set(0, 0, rot); panel.updateMatrixWorld();
    const k = keyLocal(s).applyEuler(new THREE.Euler(0, 0, rot));
    panel.position.set(Wp.x - k.x, Wp.y - k.y, Wp.z + zOff - k.z);
  };
  const HUNG = rot => hangBy(-1, P1, rot);
  const bracketsOn = (u1 = 1, u2 = 1) => {
    [-1, 1].forEach((s, j) => {
      const u = j === 0 ? u1 : u2, k = keyLocal(s), b = brackets[j];
      b.position.set(k.x, k.y, k.z - (1 - easeOut(u)) * 0.25); b.rotation.set(0, 0, (1 - easeOut(u)) * s * 1.2); b.visible = u > 0;
    });
  };
  const screwsIn = (s, j, u) => { // u 0..1 for both screws on side j
    SCREW_SPOTS.forEach(([x, y], q) => {
      const sc = bScrews[j][q], v = clamp(u * 2 - q), k = keyLocal(s);
      sc.visible = v > 0; sc.position.set(k.x + s * x, k.y + y, k.z - 0.0022 - (1 - easeOut(v)) * 0.03); sc.rotation.set(0, Math.PI, v * 14);
    });
  };
  const drillAt = (P, u, phaseIn, phaseDrill, phaseOut, out = true) => { // returns hole progress
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
  const anchorIn = (h, u) => { // fly in then push flush
    h.anchor.visible = u > 0; const f = easeOut(clamp(u * 1.6)), push = ease(clamp(u * 1.6 - 0.6));
    h.anchor.position.set(h.P.x + (1 - f) * 0.15, h.P.y + (1 - f) * 0.1, lerp(0.05 + (1 - f) * 0.3, 0.0008, push)); h.anchor.rotation.set(0, 0, 0);
  };
  const screwIn = (h, u, head = 0.006) => {
    h.screw.visible = u > 0; const f = easeOut(clamp(u * 2)), d = ease(clamp(u * 2 - 1));
    h.screw.position.set(h.P.x + (1 - f) * 0.12, h.P.y + (1 - f) * 0.08, lerp(0.06 + (1 - f) * 0.25, head, d)); h.screw.rotation.set(0, 0, d * 18);
  };
  const pencilMark = (h, u) => { // u 0..1: approach, tap, leave
    const a = segL(u, 0, 0.35), m = segL(u, 0.35, 0.7), o = segL(u, 0.7, 1);
    pencil.visible = a > 0 && o < 1;
    pencil.position.set(h.P.x + (1 - easeOut(a)) * 0.2 + ease(o) * 0.2 + Math.sin(m * Math.PI * 2) * 0.006, h.P.y + (1 - easeOut(a)) * 0.15 + ease(o) * 0.15 + Math.cos(m * Math.PI * 2) * 0.006, 0.002 + (1 - easeOut(a)) * 0.1 + ease(o) * 0.12);
    pencil.rotation.set(-0.35, 0.45, 0);
    h.mark.visible = m > 0; h.mark.scale.setScalar(Math.max(0.01, easeOut(m)));
  };
  const LEVEL_Y = PH / 2 + 0.016;
  const levelOnPanel = (rot, appear = 1) => {
    level.visible = appear > 0; const k = new THREE.Vector3(0, LEVEL_Y + (1 - easeOut(appear)) * 0.2, PD / 2 - 0.012 + (1 - easeOut(appear)) * 0.2).applyEuler(new THREE.Euler(0, 0, rot));
    level.position.copy(panel.position).add(k); level.rotation.set(0, 0, rot); setBubble(level, rot);
  };

  return {
    render(t) {
      zero();
      let i = 0; while (i < shots.length - 1 && t >= shots[i + 1].start) i++;
      const tau = t - shots[i].start, len = shots[i].len, u = clamp(tau / len);
      const install = (n) => { for (let k = 0; k < n; k++) { const h = hw[k]; h.hole.visible = true; h.anchor.visible = true; h.anchor.position.set(h.P.x, h.P.y, 0.0008); h.screw.visible = true; h.screw.position.set(h.P.x, h.P.y, 0.006); h.screw.rotation.set(0, 0, 0); } };
      if (i === 0) { // finished result, lights on; switches off at the end
        install(2); hangBy(-1, P1, 0); const lit = 1 - segL(tau, len - 0.35, len); setLit(panel, lit); glow.material.opacity = lit * 0.75;
      } else if (i === 1) { // panel leaves, tools pop in
        install(0); const off = seg(tau, 0, 0.7); hangBy(-1, P1, 0); panel.position.x += off * 1.8; panel.position.z += off * 0.4; panel.visible = off < 1;
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
      } else if (i === 2) { // brackets + screws on the back of the frame
        drill.scale.setScalar(1); level.scale.setScalar(1); pencil.scale.setScalar(1);
        const intro = seg(tau, 0, 0.6); panel.rotation.set(0, Math.PI, 0); panel.position.set(0, 1.25 - (1 - intro) * 0.6, 0.5 - 0.016);
        const a = segL(u, 0.08, 0.26), b = segL(u, 0.55, 0.7);
        bracketsOn(b, a);
        screwsIn(1, 1, segL(u, 0.22, 0.42)); // note: panel faces away, world-left is local s=+1
        screwsIn(-1, 0, segL(u, 0.64, 0.84));
        // swap: bracket index 1 is s=+1
      } else if (i === 3) { // panel away, mark point 1
        const away = seg(tau, 0, 0.6); panel.rotation.set(0, Math.PI * (1 - away), 0); panel.position.set(0 + away * 1.6, 1.25, 0.5 + away * 0.6); panel.visible = away < 1;
        pencilMark(hw[0], segL(tau, 0.5, Math.min(len, 2.4)));
        hw[0].mark.visible = tau > 0.5 + 0.35 * (Math.min(len, 2.4) - 0.5);
      } else if (i === 4) { // drill, anchor, screw at P1
        panel.visible = false; hw[0].mark.visible = true;
        const d = drillAt(P1, u, [0, 0.14], [0.14, 0.36], [0.36, 0.46]);
        hw[0].hole.visible = d > 0.6;
        anchorIn(hw[0], segL(u, 0.44, 0.66)); if (u > 0.66) hw[0].mark.visible = false;
        screwIn(hw[0], segL(u, 0.66, 0.97));
      } else if (i === 5) { // hang on the first screw — tilted
        install(1);
        const a = seg(tau, 0, Math.min(1.2, len * 0.6)), drop = seg(tau, Math.min(1.2, len * 0.6), Math.min(1.6, len * 0.85));
        const rot = -0.14 * ease(drop) + Math.sin(clamp(tau - 1.4) * 9) * 0.02 * (1 - clamp(tau - 1.4));
        hangBy(-1, new THREE.Vector3(P1.x + (1 - a) * 0.5, P1.y + 0.03 * (1 - drop) + (1 - a) * 0.25, P1.z + (1 - a) * 0.5), rot);
      } else if (i === 6) { // level it, mark point 2
        install(1);
        const fix = seg(u, 0.18, 0.5), rot = lerp(-0.14, 0, fix); hangBy(-1, P1, rot);
        levelOnPanel(rot, segL(u, 0, 0.14)); if (u > 0.62) { const o = seg(u, 0.6, 0.66); level.position.y += o * 0.4; level.visible = o < 1; }
        pencilMark(hw[1], segL(u, 0.7, 0.98)); if (u > 0.98) hw[1].mark.visible = true;
      } else if (i === 7) { // take it down, drill point 2
        install(1); hw[1].mark.visible = true;
        const off = seg(tau, 0, 0.5); hangBy(-1, P1, 0); panel.position.y += off * 0.12; panel.position.z += off * 0.8; panel.position.x -= off * 0.9; panel.visible = off < 1;
        const d = drillAt(P2, u, [0.08, 0.2], [0.2, 0.4], [0.4, 0.5]);
        hw[1].hole.visible = d > 0.6; anchorIn(hw[1], segL(u, 0.48, 0.7)); if (u > 0.7) hw[1].mark.visible = false;
        screwIn(hw[1], segL(u, 0.7, 0.98));
      } else { // rehang, light up, CTA
        install(2);
        const a = i === 8 ? seg(tau, 0, Math.min(1.1, len * 0.35)) : 1;
        hangBy(-1, new THREE.Vector3(P1.x - (1 - a) * 0.5, P1.y + (1 - a) * 0.2 + 0.01 * (1 - a), P1.z + (1 - a) * 0.6), 0);
        if (i === 8) { const lv = segL(tau, len * 0.3, len * 0.42), lo = segL(tau, len * 0.55, len * 0.62); if (lv > 0 && lo < 1) { levelOnPanel(0, lv); level.position.y += ease(lo) * 0.4; } }
        const lit = i === 8 ? easeOut(segL(tau, len * 0.6, len * 0.75)) : 1; setLit(panel, lit); glow.material.opacity = lit * 0.75;
      }
      applyCam(camera, cameraAt(shots, t));
      renderer.render(scene, camera);
    },
    shots,
  };
}
