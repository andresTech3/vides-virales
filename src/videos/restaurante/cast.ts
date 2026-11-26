// Restaurant cast: Waiter, seated diners, street strollers, velvet rope queue,
// photographer diner, chef, and mannequins.
// Fully animated: leg walk cycles, arm gestures, blinks, expressions, and contact shadows.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, townsfolk, fxBurst, fxNote, fxStars, fxContact, fxShadow,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import { FPS, D0, SHOTS, V3, smooth, clamp01 } from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216;
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
const ROOTS = new Set<THREE.Object3D>();

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;

// Outfits
export const WAITER: Outfit = { jacket: "#1b1d24", pants: "#16171b", boots: "#0b0c0e", belt: "#ffffff", buttons: "#cfa856" };
export const MANNEQUIN_1: Outfit = { jacket: "#2a5298", pants: "#1e3c72", boots: "#111111", hat: "tophat" };
export const MANNEQUIN_2: Outfit = { jacket: "#c84b31", pants: "#2d4059", boots: "#111111", hat: "bonnet" };
export const CHEF: Outfit = { jacket: "#fafafa", pants: "#222222", boots: "#111111", buttons: "#aaaaaa" };
const FOLK = [0, 1, 2, 3, 4, 5].map((v) => townsfolk(v));

const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";

const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number) => {
  const f = Math.round(t * FPS);
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = ((who.i * 5 + 3) % 7) + 1;
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

export type RestaurantState = { busyLevel: number; dishVisible: boolean; flashLevel: number };
export type Stage = { places: Place[]; fx: FxPlace[] };

export const restaurantStage = (id: number, t: number, rst: RestaurantState, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light === "golden" ? "golden" : "day";
  const yFloor = 0.08;

  // 1. Mannequins in window (always seated at the left window table x = -2.7, z = -1.2)
  const m1: Who = { i: 101, o: MANNEQUIN_1, okey: "mannequin_1" };
  const m2: Who = { i: 102, o: MANNEQUIN_2, okey: "mannequin_2" };
  out.places.push(person(cam, m1, -3.1, yFloor + 0.35, -1.2, { side: false, mirror: false }, { mode: "sit", expr: "smile_closed", blink: 0, look: 1 }, {}));
  blob(out, -3.1, yFloor, -1.2, 0.85);
  out.places.push(person(cam, m2, -2.3, yFloor + 0.35, -1.2, { side: false, mirror: false }, { mode: "sit", expr: "smile", blink: 0, look: -1 }, {}));
  blob(out, -2.3, yFloor, -1.2, 0.85);

  // 2. Seated Diners at Outdoor Terrace Table (x = -2.5, z = 2.6)
  // Featured in shots 3, 4, 5
  const d1: Who = { i: 201, o: FOLK[0], okey: "diner_1" };
  const d2: Who = { i: 202, o: FOLK[1], okey: "diner_2" };
  const dExpr1: Expr = id === 4 ? "shock" : id === 5 ? "laugh" : "smile";
  const dExpr2: Expr = id === 4 ? "smile" : "grin";
  out.places.push(person(cam, d1, -3.0, yFloor + 0.38, 2.6, { side: false, mirror: false }, { mode: "sit", expr: dExpr1, blink: lidAt(t, 201), look: 1 }, {}));
  blob(out, -3.0, yFloor, 2.6, 0.85);
  out.places.push(person(cam, d2, -2.0, yFloor + 0.38, 2.6, { side: false, mirror: false }, { mode: "sit", expr: dExpr2, blink: lidAt(t, 202), look: -1 }, {}));
  blob(out, -2.0, yFloor, 2.6, 0.85);

  // Seated Diners at Right Terrace Table (x = 2.5, z = 2.6)
  const d3: Who = { i: 203, o: FOLK[2], okey: "diner_3" };
  const d4: Who = { i: 204, o: FOLK[3], okey: "diner_4" };
  out.places.push(person(cam, d3, 2.0, yFloor + 0.38, 2.6, { side: false, mirror: false }, { mode: "sit", expr: "grin", blink: lidAt(t, 203), look: 1 }, {}));
  blob(out, 2.0, yFloor, 2.6, 0.85);
  out.places.push(person(cam, d4, 3.0, yFloor + 0.38, 2.6, { side: false, mirror: false }, { mode: "sit", expr: "smile", blink: lidAt(t, 204), look: -1 }, {}));
  blob(out, 3.0, yFloor, 2.6, 0.85);

  // 3. Waiter (Serving food / surprise dessert in shots 3 and 4)
  if (id === 3 || id === 4 || id === 5) {
    const waiterWho: Who = { i: 99, o: WAITER, okey: "waiter" };
    // Waiter standing by table, holding surprise cake
    const wx = -1.55, wz = 2.3;
    const fo: FrontOpts = { mode: "stand", expr: "smile", blink: lidAt(t, 99), look: -1, prop: "icecream" };
    out.places.push(person(cam, waiterWho, wx, yFloor, wz, { side: false, mirror: false }, fo, {}));
    blob(out, wx, yFloor, wz);

    // In shot 4: Sparkle burst over the surprise dessert!
    if (id === 4) {
      const u = q((t * 1.5) % 1, 30);
      out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u), x: -1.8, y: yFloor + 1.25, z: 2.3, w: 0.85, h: 0.85 });
    }
  }

  // 4. In Shot 5 (Viral dish): Customer taking a photo with smartphone
  if (id === 5) {
    // Floating star rewards above the viral plate
    const u = q((t * 0.9) % 1, 30);
    out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (p) => fxStars(p, u), x: -2.5, y: yFloor + 1.6, z: 2.6, w: 1.1, h: 0.55 });
    // Camera flash bursts
    if (Math.sin(t * 8) > 0.85) {
      out.fx.push({ key: `flash_burst`, cw: 500, ch: 500, draw: (p) => fxBurst(p, 0.3), x: -2.7, y: yFloor + 1.3, z: 2.5, w: 0.9, h: 0.9 });
    }
  }

  // 5. In Shot 6: Velvet rope waiting line outside entrance!
  if (id === 6 || id === 7 || id === 8) {
    for (let i = 0; i < 6; i++) {
      const qx = -0.5 - i * 0.7; // line queued to the left of the entrance
      const qz = 1.6 + i * 0.45;
      const who: Who = { i: 50 + i, o: FOLK[(i + 1) % 6], okey: `q_${i}` };
      const fo: FrontOpts = { mode: "stand", expr: i === 0 ? "smile" : "neutral", blink: lidAt(t, 50 + i), look: 1 };
      out.places.push(person(cam, who, qx, yFloor, qz, { side: false, mirror: false }, fo, {}));
      blob(out, qx, yFloor, qz);
    }
  }

  // 6. Street Strollers (Active walking pedestrians on the sidewalk and street)
  // Continuous walk cycles walking left and right!
  const numWalkers = id === 2 || id === 7 ? 8 : 4;
  for (let i = 0; i < numWalkers; i++) {
    const dir = i % 2 === 0 ? 1 : -1; // 1 = right, -1 = left
    const speed = 0.8 + hh(i, 2) * 0.4;
    const startX = dir > 0 ? -9 : 9;
    const x = startX + dir * ((t * speed + i * 3.5) % 18);
    const z = 3.8 + (i % 3) * 0.6;
    const phase = q(((t * speed * 1.5 + hh(i, 3)) % 1), 120);
    const who: Who = { i: 300 + i, o: FOLK[(i + 2) % 6], okey: `w_${(i + 2) % 6}` };
    const fo: FrontOpts = { mode: "stroll", phase, expr: "smile", blink: lidAt(t, 300 + i), look: 0 };
    const view = viewOf(cam, x, z, dir, 0);
    const so: SideOpts = { mode: "march", phase, expr: "smile", stomp: 0.5, stride: 0.85 * view.fs };
    out.places.push(person(cam, who, x, yFloor, z, view, fo, so));
    blob(out, x, yFloor, z);
  }

  return out;
};

export { FPS };
