// renderer, lights, camera blending shared by both films
import { THREE, ease, lerp, clamp } from './models.js';
import { RoomEnvironment } from '/node_modules/three/examples/jsm/environments/RoomEnvironment.js';

export function makeStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(36, 1080 / 1920, 0.01, 60);
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x6b5a4a, 0.35); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dd, 1.9); key.position.set(1.4, 3.2, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -1.5; key.shadow.camera.right = 1.5; key.shadow.camera.top = 3; key.shadow.camera.bottom = -0.5; key.shadow.camera.near = 0.5; key.shadow.camera.far = 8; key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key); scene.add(key.target);
  return { renderer, scene, camera, hemi, key };
}

// shots: [{start, len, cam:(tau,len)=>({p:[x,y,z], l:[x,y,z]})}]
export function cameraAt(shots, t, blend = 0.9) {
  let i = 0; while (i < shots.length - 1 && t >= shots[i + 1].start) i++;
  const s = shots[i], tau = t - s.start, own = s.cam(tau, s.len);
  if (i === 0 || tau >= blend) return own;
  const pv = shots[i - 1], prev = pv.cam(pv.len, pv.len), u = ease(tau / blend);
  return { p: prev.p.map((v, k) => lerp(v, own.p[k], u)), l: prev.l.map((v, k) => lerp(v, own.l[k], u)) };
}
export function applyCam(camera, c, roll = 0) { camera.position.set(...c.p); camera.lookAt(...c.l); if (roll) camera.rotateZ(roll); }
export function shotIndex(shots, t) { let i = 0; while (i < shots.length - 1 && t >= shots[i + 1].start) i++; return i; }
export function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,240,225,1)'); r.addColorStop(0.35, 'rgba(255,190,170,.55)'); r.addColorStop(1, 'rgba(255,120,100,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
export { clamp };
