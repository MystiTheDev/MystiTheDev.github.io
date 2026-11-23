// Hero showcase: a real-time 3D MacBook-style laptop (three.js), built in code so the lid can hinge.
// Space Black MacBook Pro styling, with a plain lid (no Apple logo).
// setProgress(t) sets where scroll wants the scene (0 = closed at a 3/4 angle below the fold,
// 1 = open and zoomed so the screen fills the view). The scene follows it with damping, so a fast
// flick of the wheel glides instead of jumping; onFrame(eased t) lets the page sync its own layers.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// MacBook Pro 14-ish proportions (units are arbitrary).
const W = 3.2, D = 2.24, BASE_H = 0.06, LID_T = 0.026;
// The lid is as deep as the base, so when closed it covers the keyboard and trackpad completely.
const LID_H = D - 0.02, SCREEN_W = W - 0.07, SCREEN_H = SCREEN_W * 10 / 16; // 16:10, edge to edge with a thin bezel

export function createLaptop(canvas, screenSrc, onFrame = () => {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 6, 5);
  const rim = new THREE.DirectionalLight(0x9fe8ff, 0.8);
  rim.position.set(-4, 2, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xbfe9ff, 0.35));

  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 100);
  const load = (src) => new THREE.TextureLoader().load(src, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; render(); });
  // Space Black anodised aluminium: dark, satin, soft highlights.
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x1c1d20, metalness: 0.9, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 1.6 });
  const black = new THREE.MeshStandardMaterial({ color: 0x060607, metalness: 0.1, roughness: 0.7 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x020203, metalness: 0, roughness: 0.06, clearcoat: 1 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.8 });

  // Speaker grille: a canvas texture of fine perforations.
  const dots = document.createElement("canvas");
  dots.width = 64; dots.height = 512;
  const g = dots.getContext("2d");
  g.fillStyle = "#1c1d20"; g.fillRect(0, 0, 64, 512);
  g.fillStyle = "#0a0a0b";
  for (let y = 4; y < 512; y += 8) for (let x = 4 + ((y / 8) % 2) * 4; x < 64; x += 8) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  const dotTex = new THREE.CanvasTexture(dots);

  // ---- Base: thin slab, black keyboard well, function row + 5 rows, spacebar, grilles, trackpad.
  const laptop = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, BASE_H, D, 6, 0.028), alu);
  base.position.y = BASE_H / 2;
  laptop.add(base);
  const KW = W * 0.72, KD = D * 0.44, KZ = -D * 0.19; // keyboard well size and centre
  const well = new THREE.Mesh(new RoundedBoxGeometry(KW, 0.004, KD, 2, 0.002), black);
  well.position.set(0, BASE_H - 0.0015, KZ);
  laptop.add(well);
  const pitch = (KW - 0.05) / 14, top = KZ - KD / 2 + 0.025;
  const keys = [];
  // [z offset in rows, height factor, list of key widths in units]
  const rowsSpec = [
    [0, 0.55, Array(14).fill(1)],
    [1, 1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    [2, 1, [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5]],
    [3, 1, [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2]],
    [4, 1, [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.7]],
    [5, 1, [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1]],
  ];
  const rowD = (KD - 0.05 - pitch * 0.55) / 5;
  for (const [r, hf, widths] of rowsSpec) {
    const total = widths.reduce((a, b) => a + b, 0), unit = (KW - 0.05) / total;
    const z = r === 0 ? top + (pitch * 0.55) / 2 : top + pitch * 0.55 + rowD * (r - 0.5);
    const depth = (r === 0 ? pitch * 0.55 : rowD) * 0.84;
    let x = -KW / 2 + 0.025;
    for (const w of widths) { keys.push([x + (w * unit) / 2, z, w * unit - unit * 0.14, depth]); x += w * unit; }
  }
  for (const [x, z, w, d] of keys) {
    const k = new THREE.Mesh(new RoundedBoxGeometry(w, 0.01, d, 2, 0.004), keyMat);
    k.position.set(x, BASE_H + 0.003, z);
    laptop.add(k);
  }
  for (const s of [-1, 1]) {
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.07, KD), new THREE.MeshStandardMaterial({ map: dotTex, metalness: 0.3, roughness: 0.9 }));
    grille.rotation.x = -Math.PI / 2;
    grille.position.set(s * (KW / 2 + W * 0.06), BASE_H + 0.0008, KZ);
    laptop.add(grille);
  }
  const pad = new THREE.Mesh(new RoundedBoxGeometry(W * 0.44, 0.002, D * 0.33, 3, 0.001), new THREE.MeshPhysicalMaterial({ color: 0x2a2c2f, metalness: 0.5, roughness: 0.22, clearcoat: 0.9 }));
  pad.position.set(0, BASE_H, D * 0.255);
  // A slightly lighter rim so the trackpad edge catches the light.
  const rimPad = new THREE.Mesh(new RoundedBoxGeometry(W * 0.44 + 0.012, 0.0015, D * 0.33 + 0.012, 3, 0.001), new THREE.MeshStandardMaterial({ color: 0x4a4d52, metalness: 0.8, roughness: 0.3 }));
  rimPad.position.set(0, BASE_H - 0.0004, D * 0.255);
  laptop.add(pad, rimPad);

  // ---- Lid: hinged at the back edge. rotation.x = 0 open, ~PI/2 closed onto the base.
  const hinge = new THREE.Group();
  // Raised so the closed lid rests on top of the keys instead of cutting into them.
  hinge.position.set(0, BASE_H + LID_T / 2 + 0.012, -D / 2 + LID_T / 2 + 0.02);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, LID_H, LID_T, 6, 0.012), alu);
  lid.position.y = LID_H / 2;
  // Edge-to-edge glass with thin black bezel and a camera notch.
  const front = new THREE.Mesh(new RoundedBoxGeometry(W - 0.01, LID_H - 0.01, 0.002, 4, 0.001), glass);
  front.position.set(0, LID_H / 2, LID_T / 2);
  const screenMat = new THREE.MeshBasicMaterial({ map: load(screenSrc), color: 0x000000, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMat);
  const screenY = LID_H / 2 - 0.01;
  screen.position.set(0, screenY, LID_T / 2 + 0.0015);
  const notch = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.07, 0.002, 2, 0.001), black);
  notch.position.set(0, screenY + SCREEN_H / 2 - 0.035, LID_T / 2 + 0.002);
  hinge.add(lid, front, screen, notch);
  laptop.add(hinge);
  scene.add(laptop);

  // Smooth in-out curve for each phase, so motion starts and lands softly.
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (6 * x - 15) + 10); };
  const lerp = (a, b, k) => a + (b - a) * k;
  let target = 0, cur = 0, last = 0, raf = 0;

  function render() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio())) renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = cur;

    // Phases: rise into view 0-0.12, turn 0.08-0.36, open 0.16-0.42, zoom 0.42-0.62, then hold.
    const rise = smooth(t / 0.12), turn = smooth((t - 0.08) / 0.28), open = smooth((t - 0.16) / 0.26), zoom = smooth((t - 0.42) / 0.2);
    hinge.rotation.x = lerp(Math.PI / 2, 0, open);
    laptop.rotation.y = lerp(-0.75, 0, turn);
    screenMat.color.setScalar(smooth((open - 0.3) / 0.7));

    // Camera: high 3/4 view of the closed laptop, settling to face the open screen, then moving
    // in until the screen fills the viewport.
    const target3 = new THREE.Vector3(0, lerp(0.1, BASE_H + screenY, turn), lerp(0.3, -D / 2, turn));
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    // The zoomed screen fits inside the view at 84% (matches .hold-shot in style.css).
    const fit = Math.max((SCREEN_H / 2) / Math.tan(vfov / 2), (SCREEN_W / 2) / (Math.tan(vfov / 2) * camera.aspect)) / 0.84;
    const dist = lerp(lerp(9.5, 8, turn), fit, zoom), elev = lerp(0.55, 0, turn);
    camera.position.set(target3.x, target3.y + Math.sin(elev) * dist, target3.z + Math.cos(elev) * dist);
    laptop.position.x = lerp(2.5, 0, turn) * Math.min(1, camera.aspect / 1.4);
    laptop.position.y = lerp(-6.5, 0, rise);
    camera.lookAt(target3);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    onFrame(t);
  }

  // Damped follow: closes ~90% of the gap every 0.4s, independent of frame rate.
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    cur += (target - cur) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render();
    raf = cur === target ? 0 : requestAnimationFrame(tick);
  }

  return {
    setProgress(v, instant = false) {
      target = v;
      if (instant) { cur = v; render(); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    },
    resize: render,
    // Swap the screen image, e.g. when the system switches between light and dark.
    setScreen(src) { screenMat.map = load(src); screenMat.needsUpdate = true; },
  };
}
