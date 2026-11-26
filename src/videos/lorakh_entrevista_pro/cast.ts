// Lorakh Cast: Guy Cheap (Pedro), Guy Lorakh (Mateo), Girl VIP (Sofia), DJ Mike, and Club Dancers.
// Fully animated 2D cartoon characters on 3D billboards with club dance bobs, blinks, and aroma aura effects.
import * as THREE from 'three';
import {
  Pen,
  bodyFront,
  bodySide,
  townsfolk,
  fxStars,
  fxPuff,
  fxContact,
  fxShadow,
  Outfit,
  Expr,
  FrontOpts,
  SideOpts,
} from './toon';
import { FPS, D0, SHOTS, clamp01 } from './story';
import { NOINK } from './ink';
import { cardShade, blobMaterial, CARD_K } from './cardshade';

type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };

const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
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
    for (const r of this.reqs) {
      const l = want.get(r.key);
      if (l) l.push(r);
      else want.set(r.key, [r]);
    }
    for (const [key, e] of this.live) {
      if (!want.has(key)) {
        this.live.delete(key);
        this.free.push(e);
      }
    }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0];
        const i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext('2d')!;
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, e.w, e.h);
        g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

const blank = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 2;
  return new THREE.CanvasTexture(c);
})();

export const SU = 0.00216;
const BODY = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU);
  g.translate(0, (975 - 500) * SU, 0);
  return g;
})();
const CARD = new THREE.PlaneGeometry(1, 1);
const ROOTS = new Set<THREE.Object3D>();

export class Actor {
  mesh: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  dmat: THREE.MeshDepthMaterial;
  r: Req | null = null;

  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(
      new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide })
    );
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: blank,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => {
      const rt = r.getRenderTarget();
      CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920;
    };
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    this.mesh.visible = false;
    this.mesh.rotation.order = 'YXZ';
    this.mesh.renderOrder = 1;
    this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }

  bind() {
    const t = this.r?.tex;
    if (t) {
      this.mat.map = t;
      this.dmat.map = t;
    }
  }
}

export class Fx {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  soft: THREE.MeshBasicMaterial;
  blob: THREE.MeshBasicMaterial;
  r: Req | null = null;

  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({
      map: blank,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false;
    this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }

  use(soft: boolean) {
    this.mesh.material = soft ? this.soft : this.mat;
  }

  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes('|blob|')) {
      if (t.generateMipmaps) {
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
        t.needsUpdate = true;
      }
      this.blob.map = t;
      this.mesh.material = this.blob;
      this.mesh.renderOrder = 0.5;
    } else {
      this.mat.map = t;
      this.soft.map = t;
      this.mesh.renderOrder = 0;
    }
  }
}

export type Place = {
  key: string;
  draw: (p: Pen) => void;
  x: number;
  y: number;
  z: number;
  scale?: number;
  mirror?: boolean;
  yaw?: number;
  geo?: 'body' | 'swing';
  roll?: number;
  size?: [number, number, number];
};

export type FxPlace = {
  key: string;
  cw: number;
  ch: number;
  draw: (p: Pen) => void;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  flat?: boolean;
  rot?: number;
  soft?: boolean;
};

export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const q = (v: number, n = 120) => Math.round(v * n) / n;

// Outfits Corporativos Estilo Cartoon Bean-Head
export const CANDIDATE_CHEAP: Outfit = {
  jacket: '#1e3a5f',
  pants: '#475569',
  boots: '#f1f5f9',
  buttons: '#cbd5e1',
  hairStyle: 'curly',
  hairColor: '#452615',
  hoodie: false,
};

export const CANDIDATE_LORAKH: Outfit = {
  jacket: '#0f172a',
  pants: '#1e293b',
  boots: '#020617',
  lapel: '#fbbf24',
  buttons: '#fbbf24',
  hairStyle: 'swoop',
  hairColor: '#0f172a',
};

export const RECEPTIONIST: Outfit = {
  jacket: '#831843',
  dress: '#9d174d',
  pants: '#500724',
  boots: '#fce7f3',
  buttons: '#fbcfe8',
  hairStyle: 'ponytail',
  hairColor: '#d97706',
};

export const BOSS_DIRECTOR: Outfit = {
  jacket: '#18181b',
  pants: '#27272a',
  boots: '#09090b',
  lapel: '#ef4444',
  buttons: '#ef4444',
  hairStyle: 'swoop',
  hairColor: '#52525b',
};

// Outfits de Discoteca Estilo Cartoon Bean-Head
export const GUY_CHEAP: Outfit = {
  jacket: '#1e3a5f',
  pants: '#2d3748',
  boots: '#f7fafc',
  buttons: '#e2e8f0',
  hairStyle: 'curly',
  hairColor: '#452615',
  hoodie: true,
};

export const GUY_LORAKH: Outfit = {
  jacket: '#0b0c12',
  pants: '#161922',
  boots: '#050608',
  lapel: '#eab308',
  buttons: '#eab308',
  hairStyle: 'swoop',
  hairColor: '#121118',
};

export const GIRL_VIP: Outfit = {
  jacket: '#e11d48',
  dress: '#be123c',
  pants: '#881337',
  boots: '#4c0519',
  buttons: '#fecdd3',
  hairStyle: 'ponytail',
  hairColor: '#fde047',
};

export const DJ_MIKE: Outfit = {
  jacket: '#1e1b4b',
  pants: '#0f172a',
  boots: '#020617',
  buttons: '#38bdf8',
  hairStyle: 'headphones',
  hairColor: '#38bdf8',
};

const DANCERS: Outfit[] = [
  { jacket: '#0d9488', pants: '#115e59', boots: '#f8fafc', buttons: '#99f6e4', hairStyle: 'curly', hairColor: '#92400e' },
  { jacket: '#d97706', pants: '#78350f', boots: '#f8fafc', buttons: '#fef3c7', hairStyle: 'swoop', hairColor: '#1c1917' },
  { jacket: '#7c3aed', pants: '#4c1d95', boots: '#f8fafc', buttons: '#ddd6fe', hairStyle: 'ponytail', hairColor: '#78350f' },
  { jacket: '#db2777', pants: '#831843', boots: '#f8fafc', buttons: '#fbcfe8', hairStyle: 'swoop', hairColor: '#3b0764' },
];

const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

const SUN = new THREE.Vector3(0.3, 0.85, -0.3).normalize();
const tmp = new THREE.Vector3();

const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1);
  const sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
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
const person = (
  cam: CamInfo,
  who: Who,
  x: number,
  y: number,
  z: number,
  view: { side: boolean; mirror: boolean },
  fo: FrontOpts,
  so: SideOpts,
  scale = 1
): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror;
  const light = light2D(cam, mirror);
  const seed = ((who.i * 5 + 3) % 7) + 1;
  const f2: FrontOpts = { ...fo, light, seed };
  const s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key,
    x,
    y,
    z,
    scale,
    mirror,
    tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

const blob = (out: Stage, x: number, y: number, z: number, sc = 1) => {
  const cc = '#0a0914';
  out.fx.push({
    key: `blob|contact|${cc}`,
    cw: 128,
    ch: 128,
    draw: (p) => fxContact(p, cc),
    x,
    y: y + 0.02,
    z,
    w: 0.55 * sc,
    h: 0.42 * sc,
    flat: true,
  });
};

export type LorakhState = {
  cheapCloudLevel: number;
  lorakhAuraLevel: number;
  whisperLevel: number;
};

export type Stage = { places: Place[]; fx: FxPlace[] };

export const lorakhStage = (
  shotId: number,
  t: number,
  lst: LorakhState,
  cam: CamInfo
): Stage => {
  const out: Stage = { places: [], fx: [] };
  const yFloor = 0.04;

  // Baile y ritmo de club (120 BPM: 2 golpes por segundo)
  const beat = (t * 2.0) % 1.0;
  const danceBob = Math.sin(beat * Math.PI * 2) * 0.04;
  const danceRoll = Math.sin(t * Math.PI) * 0.03;

  // Personajes principales
  const whoCheap: Who = { i: 101, o: GUY_CHEAP, okey: 'guy_cheap' };
  const whoLorakh: Who = { i: 102, o: GUY_LORAKH, okey: 'guy_lorakh' };
  const whoGirl: Who = { i: 103, o: GIRL_VIP, okey: 'girl_vip' };
  const whoDj: Who = { i: 104, o: DJ_MIKE, okey: 'dj_mike' };

  // 1. DJ Mike siempre activo en su cabina al fondo
  const djBob = Math.sin(beat * Math.PI * 2) * 0.05;
  out.places.push(
    person(
      cam,
      whoDj,
      0.0,
      0.75 + djBob,
      -5.0,
      { side: false, mirror: false },
      { mode: 'stand', expr: 'grin', blink: lidAt(t, 104), look: 0 },
      {}
    )
  );

  // 2. Bailarines de fondo en la pista (siempre animando el club)
  const crowdPositions = [
    { x: -1.8, z: -3.0, idx: 0, o: DANCERS[0] },
    { x: -0.8, z: -3.6, idx: 1, o: DANCERS[1] },
    { x: 0.8, z: -3.6, idx: 2, o: DANCERS[2] },
    { x: 1.8, z: -3.0, idx: 3, o: DANCERS[3] },
  ];

  crowdPositions.forEach((cp) => {
    const phase = cp.idx * 0.25;
    const cBob = Math.sin((beat + phase) * Math.PI * 2) * 0.04;
    const who: Who = { i: 300 + cp.idx, o: cp.o, okey: `crowd_${cp.idx}` };
    out.places.push(
      person(
        cam,
        who,
        cp.x,
        yFloor + cBob,
        cp.z,
        { side: false, mirror: cp.idx % 2 === 1 },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 300 + cp.idx), look: cp.idx % 2 === 0 ? 1 : -1 },
        {}
      )
    );
    blob(out, cp.x, yFloor, cp.z, 0.75);
  });

  // 3. Staging según el Shot actual:
  if (shotId === 1) {
    // Shot 1: Preparación ante los dos frascos en la mesa
    // Plano abierto con espacio alrededor
    out.places.push(
      person(
        cam,
        whoCheap,
        -5.4,
        yFloor,
        -1.0,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'nervous', blink: lidAt(t, 101), look: 1 },
        {}
      )
    );
    blob(out, -5.4, yFloor, -1.0, 0.9);

    out.places.push(
      person(
        cam,
        whoLorakh,
        -3.6,
        yFloor,
        -1.0,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: -1, prop: 'perfume' },
        {}
      )
    );
    blob(out, -3.6, yFloor, -1.0, 0.9);
  } else if (shotId === 2) {
    // Shot 2: Vista amplia de la pista de baile del club
    out.places.push(
      person(
        cam,
        whoCheap,
        -2.2,
        yFloor + danceBob,
        -0.8,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 101), look: 1 },
        {}
      )
    );
    blob(out, -2.2, yFloor, -0.8, 0.9);

    out.places.push(
      person(
        cam,
        whoLorakh,
        2.2,
        yFloor + danceBob * 0.8,
        -0.8,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: -1 },
        {}
      )
    );
    blob(out, 2.2, yFloor, -0.8, 0.9);
  } else if (shotId === 3) {
    // Shot 3: Chico Perfume Barato en la pista
    const cheapExpr: Expr = lst.cheapCloudLevel > 0.5 ? 'shock' : 'nervous';
    out.places.push(
      person(
        cam,
        whoCheap,
        -1.0,
        yFloor + danceBob * 1.2,
        -0.5,
        { side: false, mirror: false },
        { mode: 'stand', expr: cheapExpr, blink: lidAt(t, 101), look: 0, prop: 'shrug' },
        {}
      )
    );
    blob(out, -1.0, yFloor, -0.5, 0.95);

    // Nube de vapor barato que se desvanece
    if (lst.cheapCloudLevel > 0.05) {
      const cloudAlpha = lst.cheapCloudLevel;
      out.fx.push({
        key: `fx|cheap_cloud|${q(cloudAlpha, 10)}`,
        cw: 300,
        ch: 300,
        draw: (p) => fxPuff(p, 1.0 - cloudAlpha),
        x: -1.0,
        y: yFloor + 1.3,
        z: -0.4,
        w: 1.1 * (1.5 - cloudAlpha * 0.5),
        h: 1.1 * (1.5 - cloudAlpha * 0.5),
        soft: true,
      });
    }
  } else if (shotId === 4) {
    // Shot 4: Chico Lorakh en la pista con aroma activo
    out.places.push(
      person(
        cam,
        whoLorakh,
        0.8,
        yFloor + danceBob * 0.8,
        -0.5,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: 1, prop: 'pocket' },
        {}
      )
    );
    blob(out, 0.8, yFloor, -0.5, 0.95);

    // Aura aromática dorada y estrellas de calidad
    if (lst.lorakhAuraLevel > 0.1) {
      const aScale = 1.0 + Math.sin(t * 3.0) * 0.15;
      out.fx.push({
        key: `fx|lorakh_stars|${q(lst.lorakhAuraLevel, 10)}`,
        cw: 256,
        ch: 256,
        draw: (p) => fxStars(p, (t * 2) % 1),
        x: 0.8,
        y: yFloor + 1.8,
        z: -0.3,
        w: 1.4 * aScale,
        h: 1.4 * aScale,
        soft: true,
      });

      // Ondas ambarinas suaves alrededor
      out.fx.push({
        key: `fx|amber_wave|${q(lst.lorakhAuraLevel, 10)}|${q(aScale, 5)}`,
        cw: 256,
        ch: 256,
        draw: (p) => {
          p.ell(128, 128, 65, 65, 'rgba(217, 130, 43, 0.4)', 4);
          p.ell(128, 128, 95, 95, 'rgba(212, 175, 55, 0.25)', 3);
        },
        x: 0.8,
        y: yFloor + 1.1,
        z: -0.35,
        w: 1.6 * aScale,
        h: 1.6 * aScale,
        soft: true,
      });
    }
  } else if (shotId === 5) {
    // Shot 5: En la Barra - Chica VIP acercándose al oído
    out.places.push(
      person(
        cam,
        whoLorakh,
        4.8,
        yFloor,
        0.6,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: 1, prop: 'glass' },
        {}
      )
    );
    blob(out, 4.8, yFloor, 0.6, 0.9);

    // Chica acercándose a su oído
    const girlApproachX = 5.8 - lst.whisperLevel * 0.4;
    out.places.push(
      person(
        cam,
        whoGirl,
        girlApproachX,
        yFloor,
        0.65,
        { side: false, mirror: true },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 103), look: -1 },
        {}
      )
    );
    blob(out, girlApproachX, yFloor, 0.65, 0.85);

    // Estrellas de atracción y cumplido
    out.fx.push({
      key: `fx|whisper_stars|${q(lst.whisperLevel, 10)}`,
      cw: 256,
      ch: 256,
      draw: (p) => fxStars(p, (t * 2) % 1),
      x: 5.2,
      y: yFloor + 2.0,
      z: 0.7,
      w: 1.1,
      h: 1.1,
      soft: true,
    });
  } else if (shotId === 6) {
    // Shot 6: Mesa comparativa de frascos y ciencia de fragancia
    out.places.push(
      person(
        cam,
        whoCheap,
        -5.4,
        yFloor,
        -1.0,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'nervous', blink: lidAt(t, 101), look: 1 },
        {}
      )
    );
    blob(out, -5.4, yFloor, -1.0, 0.9);

    out.places.push(
      person(
        cam,
        whoLorakh,
        -3.6,
        yFloor,
        -1.0,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: -1 },
        {}
      )
    );
    blob(out, -3.6, yFloor, -1.0, 0.9);

    // Brillo en el frasco Lorakh
    out.fx.push({
      key: 'fx|lorakh_bottle_shine',
      cw: 256,
      ch: 256,
      draw: (p) => fxStars(p, (t * 2) % 1),
      x: -4.0,
      y: 1.45,
      z: -0.9,
      w: 0.9,
      h: 0.9,
      soft: true,
    });
  } else if (shotId === 7) {
    // Shot 7: Gran Cierre - Gran Pull-out del Club con Lorakh y la Chica sonriendo
    out.places.push(
      person(
        cam,
        whoLorakh,
        -0.45,
        yFloor + danceBob * 0.5,
        0.0,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 102), look: 1 },
        {}
      )
    );
    blob(out, -0.45, yFloor, 0.0, 0.95);

    out.places.push(
      person(
        cam,
        whoGirl,
        0.45,
        yFloor + danceBob * 0.5,
        0.05,
        { side: false, mirror: false },
        { mode: 'stand', expr: 'grin', blink: lidAt(t, 103), look: -1 },
        {}
      )
    );
    blob(out, 0.45, yFloor, 0.05, 0.9);

    // Lluvia sutil de estrellas doradas de calidad Lorakh
    out.fx.push({
      key: `fx|grand_finale_stars|${q(beat, 5)}`,
      cw: 256,
      ch: 256,
      draw: (p) => fxStars(p, (t * 2) % 1),
      x: 0.0,
      y: yFloor + 2.2,
      z: 0.1,
      w: 2.2,
      h: 2.2,
      soft: true,
    });
  }

  return out;
};
