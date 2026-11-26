// Timeline of the restaurant marketing short (Spanish edition) — 2280 frames (76.0 s) timed to voice words.
// Shots:
//  Shot 1 (0-144): Hook — Los dos maniquíes en la ventana de Roma
//  Shot 2 (144-736): Setting — Fachada exterior y calle adoquinada llena de transeúntes
//  Shot 3 (736-1091): Regla 1 — Las mesas de la ventana son tu mejor cartel publicitario
//  Shot 4 (1091-1512): Regla 2 — El postre sorpresa y la reciprocidad humana
//  Shot 5 (1512-1888): Regla 3 — Diseña un plato viral para frenar el scroll en redes
//  Shot 6 (1888-2120): Analogía — La cuerda de terciopelo roja y la fila de espera
//  Shot 7 (2120-2280): Conclusión — Los restaurantes llenos siempre se llenan más (Grand Finale)

export const FPS = 30;
export const TOTAL = 2280; // 76.0 s × 30 fps
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

export const D0 = 0.0;
export const walkPhase = (tau: number) => ((tau % 1) + 1) % 1;
export const walkFront = (tau: number) => 20 - 1.4 * tau;

export type Light = "day" | "golden" | "warm";
export type Crowd = "street" | "window" | "dining" | "kitchen" | "dish" | "empty" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean };

export const SHOTS: ShotDef[] = [
  { id: 1, a: 0,    b: 144,  light: "day",    crowd: "window",  tau: (t) => t },
  { id: 2, a: 144,  b: 736,  light: "day",    crowd: "street",  tau: (t) => t, towns: true },
  { id: 3, a: 736,  b: 1091, light: "warm",   crowd: "dining",  tau: (t) => t },
  { id: 4, a: 1091, b: 1512, light: "warm",   crowd: "dining",  tau: (t) => t },
  { id: 5, a: 1512, b: 1888, light: "warm",   crowd: "dish",    tau: (t) => t },
  { id: 6, a: 1888, b: 2120, light: "day",    crowd: "street",  tau: (t) => t, towns: true },
  { id: 7, a: 2120, b: TOTAL, light: "golden", crowd: "dining",  tau: (t) => t },
];

export const XFADE: Record<number, number> = { 2: 10, 3: 8, 4: 8, 5: 8, 6: 8, 7: 12 };
export const FLASH_AT = 144;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export type RestaurantState = { busyLevel: number; dishVisible: boolean; flashLevel: number };
export const restaurantState = (id: number, t: number): RestaurantState => {
  const busyLevel = lin([[0, 0.2], [4.8, 0.5], [24.5, 0.85]], t);
  const dishVisible = id === 5;
  const flashLevel = id === 5 ? smooth((t - 50) / 2) : 0;
  return { busyLevel, dishVisible, flashLevel };
};

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

// Shot 1: Los maniquíes en la ventana
const S1a = (f: number) => dolly([-2.6, 2.2, 6.6], [-2.7, 1.6, -0.2], pushK(f, 0, 0.0018), { fov: 42 });
const S1b = (f: number) => dolly([-2.65, 2.05, 5.2], [-2.7, 1.6, -0.6], pushK(f, 60, 0.0022), { fov: 38, roll: -0.02 });

// Shot 2: Vista general calle y fachada
const S2a = (f: number) => zoom([0, 3.2, 9.8], [0, 1.6, 1.8], 44, pushK(f, 144, 0.0014));
const S2b = (f: number) => dolly([3.0, 2.5, 7.8], [0, 1.5, 1.8], pushK(f, 400, 0.0018), { fov: 42, roll: 0.02 });

// Shot 3: Mesa de la ventana / clientes
const S3a = (f: number) => dolly([-2.5, 2.2, 5.6], [-2.5, 1.5, 2.6], pushK(f, 736, 0.0020), { fov: 40 });
const S3b = (f: number) => dolly([-2.4, 2.1, 4.8], [-2.5, 1.5, 2.6], pushK(f, 920, 0.0022), { fov: 38, roll: -0.02 });

// Shot 4: Mesero con postre sorpresa
const S4a = (f: number) => dolly([-1.9, 2.1, 5.4], [-2.1, 1.5, 2.5], pushK(f, 1091, 0.0022), { fov: 40 });
const S4b = (f: number) => dolly([-1.95, 1.95, 4.6], [-2.1, 1.5, 2.5], pushK(f, 1300, 0.0022), { fov: 36, roll: 0.02 });

// Shot 5: Plato viral e Instagram
const S5a = (f: number) => dolly([-2.5, 2.2, 4.8], [-2.5, 1.4, 2.6], pushK(f, 1512, 0.0025), { fov: 36 });
const S5b = (f: number) => dolly([-2.45, 2.05, 4.2], [-2.5, 1.4, 2.6], pushK(f, 1700, 0.0020), { fov: 34, roll: -0.02 });

// Shot 6: Cuerda de terciopelo roja y fila
const S6a = (f: number) => dolly([2.0, 2.0, 4.8], [-0.8, 1.35, 1.6], pushK(f, 1888, 0.0020), { fov: 42 });
const S6b = (f: number) => dolly([1.6, 1.9, 4.2], [-0.8, 1.35, 1.6], pushK(f, 2000, 0.0018), { fov: 40, roll: 0.02 });

// Shot 7: Plano final triunfal — terraza llena y cartel dorado
const S7a = (f: number) => dolly([0, 2.6, 7.2], [0, 1.8, 1.2], pushK(f, 2120, 0.0018), { fov: 42 });
const S7b = (f: number) => {
  const a = full(dolly([0, 2.6, 7.2], [0, 1.8, 1.2], 1, { fov: 42 }));
  const s = glide((f - 2190) / 90);
  return {
    pos: a.pos.map((v, i) => v + ([0, 4.2, 11.5][i] - v) * s) as V3,
    look: a.look.map((v, i) => v + ([0, 2.0, 0.8][i] - v) * s) as V3,
    fov: (a.fov ?? 42) + (48 - (a.fov ?? 42)) * s,
    roll: 0,
  };
};

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0,  s: S1a },
    { f: 60, dur: 28, s: S1b },
  ],
  2: [
    { f: 144, s: S2a },
    { f: 400, dur: 32, s: S2b },
  ],
  3: [
    { f: 736, s: S3a },
    { f: 920, dur: 28, s: S3b },
  ],
  4: [
    { f: 1091, s: S4a },
    { f: 1300, dur: 28, s: S4b },
  ],
  5: [
    { f: 1512, s: S5a },
    { f: 1700, dur: 26, s: S5b },
  ],
  6: [
    { f: 1888, s: S6a },
    { f: 2000, dur: 24, s: S6b },
  ],
  7: [
    { f: 2120, s: S7a },
    { f: 2190, cut: true, s: S7b },
  ],
};

const KICKS: [number, number][] = [[4.8, 0.6], [36.4, 0.8], [63.0, 0.5]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0,    cInf: 10, focus: () => [-2.7, 1.5, -0.8] },
  { f: 144,  cInf: 0 },
  { f: 736,  cInf: 12, focus: () => [-2.5, 1.35, 2.6] },
  { f: 1091, cInf: 14, focus: () => [-2.0, 1.4, 2.5] },
  { f: 1512, cInf: 16, focus: () => [-2.5, 1.3, 2.6] },
  { f: 1888, cInf: 10, focus: () => [-0.8, 1.35, 1.6] },
  { f: 2120, cInf: 6 },
  { f: 2190, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [
  { a: 0,    b: 736,  kit: "flower_redA",  pos: [1.8, D0 + 0.08, 3.8], s: 0.9, yaw: 0.3 },
  { a: 1888, b: 2120, kit: "lantern",      pos: [-2.2, D0 + 0.08, 5.2], s: 1.0, yaw: 0 },
  { a: 2120, b: TOTAL, kit: "plant_bushDetailed", pos: [2.8, D0 + 0.08, 4.2], s: 1.1, yaw: 0.5 },
];
