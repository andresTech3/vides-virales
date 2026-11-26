// Restaurant world: A beautifully detailed Italian bistro "La Trattoria Romana".
// Real architectural structure:
//  - Cobblestone street & paved sidewalk with curbs and lanterns
//  - Hollow restaurant interior (floors, back wallpaper wall, warm lighting)
//  - Facade with real window openings, warm transparent glass, framed pictures inside
//  - Bistro terrace with tables, red-checkered cloths, wine glasses and plates
//  - Velvet rope with golden brass posts in front of the entrance
//  - Striped awning, illuminated signage, flower planters and trees
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, V, lam, boxGeo, Kit, kitClone } from "./build";
import { ctex, stoneHD, cobbleHD, grassHD, cloudHD } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, LFB, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, restaurantStage } from "./cast";
import { FPS, D0, SHOTS, camAt, restaurantState, V3, smooth, FOREGROUND, ShotDef } from "./story";

const KENNEY_RESTAURANT = ["tree_oak", "tree_default", "plant_bushLarge", "plant_bushDetailed",
  "flower_redA", "flower_yellowA", "flower_purpleA", "lantern", "stall-bench", "hedge"];
let kitP: Promise<Kit> | null = null;
export const loadRestaurantKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY_RESTAURANT.map((n) =>
      loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`))
        .then((g) => [n, g.scene] as const)
        .catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

function quadUp(x0: number, x1: number, z0: number, z1: number, uRep: number, vRep: number, dy = 0) {
  const y = D0 + dy, g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, uRep, 0, uRep, vRep, 0, 0, uRep, vRep, 0, vRep], 2));
  return g;
}

// ---- procedural painted textures ----
const brickTex = () => ctex("brick_facade_v2", 512, 512, (g) => {
  g.fillStyle = "#b85d3b"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#8e4125"; g.lineWidth = 4;
  for (let row = 0; row < 16; row++) {
    const y = row * 32, off = (row % 2) * 36;
    g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke();
    for (let col = 0; col < 10; col++) {
      const x = col * 72 + off;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke();
    }
  }
});

const wallpaperTex = () => ctex("wallpaper_int", 256, 256, (g) => {
  g.fillStyle = "#d4b88a"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#c09e6c";
  for (let y = 16; y < 256; y += 32) {
    for (let x = 16; x < 256; x += 32) {
      g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
    }
  }
});

const checkeredClothTex = () => ctex("tablecloth", 256, 256, (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#c82a2a";
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      if ((x / 32 + y / 32) % 2 === 0) g.fillRect(x, y, 32, 32);
    }
  }
});

const woodFloorTex = () => ctex("wood_floor", 256, 256, (g) => {
  g.fillStyle = "#7a4e28"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#5a3416"; g.lineWidth = 3;
  for (let y = 0; y < 256; y += 32) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
  }
});

const awningTex = () => ctex("awning_v2", 512, 128, (g) => {
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 ? "#b82424" : "#fdf6e6";
    g.fillRect(i * 42.6, 0, 43, 128);
  }
  g.fillStyle = "#781414"; g.fillRect(0, 116, 512, 12);
});

const glassTex = () => ctex("glass_warm_v2", 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, "rgba(255, 230, 160, 0.45)");
  gr.addColorStop(0.5, "rgba(255, 245, 200, 0.65)");
  gr.addColorStop(1, "rgba(255, 230, 160, 0.45)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(20, 20, 14, 180);
});

const discTex = () => ctex("sunDisc_es", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo_es", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});

const smokeTex = () => ctex("smoke_es", 256, 256, (g) => {
  const p = new Pen(g);
  for (const [x, y, r, c] of [[90, 150, 60, "#8f8d96"], [150, 120, 70, "#a3a1aa"], [170, 165, 55, "#8f8d96"]] as const) p.ell(x, y, r, r * 0.85, c, 0);
});

const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 1: { az: 110, el: 25 }, 2: { az: 100, el: 28 }, 7: { az: 90, el: 22 }, 8: { az: -50, el: 12 } };

export class RestaurantWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#f2e3ce", 20, 380);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private fgs: { o: THREE.Object3D; a: number; b: number }[] = [];
  private smoke: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; top: V3; k: number }[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.root;

    // ---- sky dome ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);

    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }

    this.hemi = new THREE.HemisphereLight("#fbe8d0", "#6c5c5c", 1.15);
    this.sun = new THREE.DirectionalLight("#fff5e4", 2.8);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    this.fill = new THREE.DirectionalLight("#b0c8ff", 0.4);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);

    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4, d = 550 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 120 + (i % 4) * 25;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 32, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- geometry batch ----
    const b = new Batch();

    const M: Record<string, THREE.Material> = {};
    M.cobble    = lam("cobbleHD",   () => ({ map: cobbleHD() }));
    M.sidewalk  = lam("sidewalkHD", () => ({ map: stoneHD("sidewalk", ["#ded6cb","#d4ccc1","#ded7cc","#cdc5ba"], "#a8a098") }));
    M.grass     = lam("grassHD",    () => ({ map: grassHD() }));
    M.brick     = lam("brick_v2",   () => ({ map: brickTex() }));
    M.wallpaper = lam("wallpaper",  () => ({ map: wallpaperTex() }));
    M.woodFloor = lam("wood_floor", () => ({ map: woodFloorTex() }));
    M.awning    = lam("awning_v2",  () => ({ map: awningTex() }));
    M.tablecloth= lam("cloth",      () => ({ map: checkeredClothTex() }));
    M.stone     = lam("stone_corn", () => ({ map: stoneHD("stone_corn") }));
    M.woodDark  = lam("wood_dark2", () => ({ color: "#4a2a14" }));
    M.goldBrass = twoTone(new THREE.MeshPhongMaterial({ color: "#e6b800", specular: "#ffd700", shininess: 80 }), 0.2);
    M.velvetRed = twoTone(new THREE.MeshLambertMaterial({ color: "#9b111e" }), 0.25);
    M.glass     = new THREE.MeshBasicMaterial({ map: glassTex(), transparent: true, opacity: 0.65, depthWrite: false, side: THREE.DoubleSide });

    // 1. Street and Sidewalk
    b.add(quadUp(-40, 40, 5.0, 30, 20, 25), M.cobble);          // roadway (z = 5.0 to 30)
    b.add(quadUp(-40, 40, 0.0, 5.0, 16, 2, 0.08), M.sidewalk);   // sidewalk in front (z = 0 to 5.0, elevated 8cm)
    b.add(boxGeo(V(-40, 0, 4.95), V(40, 0.08, 5.05)), M.stone); // curb border stone

    // Sidewalk grass accents on sides
    b.add(quadUp(14, 50, -10, 30, 18, 20), M.grass);
    b.add(quadUp(-50, -14, -10, 30, 18, 20), M.grass);

    // 2. Hollow Restaurant Interior (from z = -6.0 to 0.0, x = -6.0 to 6.0)
    b.add(quadUp(-6, 6, -6, 0, 4, 4, 0.08), M.woodFloor);        // interior dining room floor
    b.add(boxGeo(V(-6, 0.08, -6.05), V(6, 4.8, -5.95), 2), M.wallpaper); // interior back wall
    b.add(boxGeo(V(-6.05, 0.08, -6), V(-5.95, 4.8, 0), 2), M.wallpaper); // interior left wall
    b.add(boxGeo(V(5.95, 0.08, -6), V(6.05, 4.8, 0), 2), M.wallpaper);  // interior right wall
    b.add(boxGeo(V(-6, 4.8, -6), V(6, 4.9, 0.2)), M.stone);              // ceiling / roof slab

    // 3. Facade Wall (z = 0) with REAL window cutouts
    // Left outer pier: x = -6 to -4.2
    b.add(boxGeo(V(-6, 0.08, -0.1), V(-4.2, 4.8, 0.1), 1), M.brick);
    // Center entrance pier (between door and left window): x = -1.2 to -0.9
    b.add(boxGeo(V(-1.2, 0.08, -0.1), V(-0.9, 4.8, 0.1)), M.brick);
    // Center entrance pier right: x = 0.9 to 1.2
    b.add(boxGeo(V(0.9, 0.08, -0.1), V(1.2, 4.8, 0.1)), M.brick);
    // Right outer pier: x = 4.2 to 6.0
    b.add(boxGeo(V(4.2, 0.08, -0.1), V(6, 4.8, 0.1), 1), M.brick);

    // Header wall above entrance door (x = -0.9 to 0.9, y = 2.6 to 4.8)
    b.add(boxGeo(V(-0.9, 2.6, -0.1), V(0.9, 4.8, 0.1)), M.brick);

    // Spandrel wall above both windows (y = 3.2 to 4.8)
    b.add(boxGeo(V(-4.2, 3.2, -0.1), V(-1.2, 4.8, 0.1)), M.brick);
    b.add(boxGeo(V(1.2, 3.2, -0.1), V(4.2, 4.8, 0.1)), M.brick);

    // Low sill wall below both windows (y = 0.08 to 0.85)
    b.add(boxGeo(V(-4.2, 0.08, -0.1), V(-1.2, 0.85, 0.1)), M.brick);
    b.add(boxGeo(V(1.2, 0.08, -0.1), V(4.2, 0.85, 0.1)), M.brick);

    // Stone ledge under windows
    b.add(boxGeo(V(-4.3, 0.85, -0.15), V(-1.1, 0.92, 0.2)), M.stone);
    b.add(boxGeo(V(1.1, 0.85, -0.15), V(4.3, 0.92, 0.2)), M.stone);

    // Cornice at top of facade
    b.add(boxGeo(V(-6.2, 4.8, -0.2), V(6.2, 5.15, 0.35)), M.stone);

    // Transparent window glass planes (real openings from y=0.92 to 3.2)
    b.add(boxGeo(V(-4.15, 0.92, 0), V(-1.25, 3.18, 0.01)), M.glass);
    b.add(boxGeo(V(1.25, 0.92, 0), V(4.15, 3.18, 0.01)), M.glass);

    // Window mullions (dark wood frame)
    for (const [x0, x1] of [[-4.2, -1.2], [1.2, 4.2]]) {
      b.add(boxGeo(V(x0, 0.9, -0.05), V(x0 + 0.08, 3.2, 0.05)), M.woodDark);
      b.add(boxGeo(V(x1 - 0.08, 0.9, -0.05), V(x1, 3.2, 0.05)), M.woodDark);
      b.add(boxGeo(V(x0, 3.14, -0.05), V(x1, 3.22, 0.05)), M.woodDark);
      // center cross mullions
      const mx = (x0 + x1) / 2;
      b.add(boxGeo(V(mx - 0.04, 0.9, -0.04), V(mx + 0.04, 3.2, 0.04)), M.woodDark);
      b.add(boxGeo(V(x0, 2.05, -0.04), V(x1, 2.13, 0.04)), M.woodDark);
    }

    // Entrance door frame and doors (partially ajar to invite customers!)
    b.add(boxGeo(V(-0.9, 0.08, -0.08), V(-0.8, 2.6, 0.08)), M.woodDark);
    b.add(boxGeo(V(0.8, 0.08, -0.08), V(0.9, 2.6, 0.08)), M.woodDark);
    b.add(boxGeo(V(-0.9, 2.52, -0.08), V(0.9, 2.6, 0.08)), M.woodDark);
    // Dark mahogany double door
    b.add(boxGeo(V(-0.8, 0.08, -0.04), V(-0.02, 2.52, 0.02)), M.woodDark);
    b.add(boxGeo(V(0.02, 0.08, -0.04), V(0.8, 2.52, 0.02)), M.woodDark);

    // Awning: sloped canvas protruding over facade (y=3.3 to 2.85, z=0 to 1.1)
    b.add(boxGeo(V(-4.5, 3.1, 0.05), V(4.5, 3.35, 1.1), 1), M.awning);

    // 4. Bistro Terrace: Tables, Tablecloths, Chairs, Dishes
    // Interior window table left: x = -2.7, z = -1.2
    this.addBistroTable(b, -2.7, -1.2, M.woodDark, M.tablecloth);
    // Interior window table right: x = 2.7, z = -1.2
    this.addBistroTable(b, 2.7, -1.2, M.woodDark, M.tablecloth);

    // Outdoor terrace table left: x = -2.5, z = 2.6
    this.addBistroTable(b, -2.5, 2.6, M.woodDark, M.tablecloth);
    // Outdoor terrace table right: x = 2.5, z = 2.6
    this.addBistroTable(b, 2.5, 2.6, M.woodDark, M.tablecloth);

    // 5. Velvet Rope Barrier (in front of entrance at z = 1.6)
    // Golden brass stanchions with ball tops
    b.add(boxGeo(V(-1.3, 0.08, 1.55), V(-1.2, 1.1, 1.65)), M.goldBrass); // left post
    b.add(boxGeo(V(-1.35, 1.1, 1.5), V(-1.15, 1.25, 1.7)), M.goldBrass); // left ball top
    b.add(boxGeo(V(1.2, 0.08, 1.55), V(1.3, 1.1, 1.65)), M.goldBrass);   // right post
    b.add(boxGeo(V(1.15, 1.1, 1.5), V(1.35, 1.25, 1.7)), M.goldBrass);   // right ball top
    // Crimson velvet rope swag hanging between posts
    b.add(boxGeo(V(-1.2, 0.85, 1.58), V(1.2, 0.95, 1.62)), M.velvetRed);

    // 6. Neighboring buildings for street realism
    b.add(boxGeo(V(-18, 0, -8), V(-6, 5.5, 0.0), 2), M.stone);
    b.add(boxGeo(V(6, 0, -8), V(18, 5.5, 0.0), 2), M.stone);

    b.build(R);

    // ---- Signboard with Gold Lettering ----
    const signMat = new THREE.MeshBasicMaterial({
      map: ctex("sign_es_v2", 600, 140, (g) => {
        g.fillStyle = "#24140c"; g.fillRect(0, 0, 600, 140);
        g.strokeStyle = "#cfa856"; g.lineWidth = 6;
        g.strokeRect(8, 8, 584, 124);
        g.fillStyle = "#f5d47a"; g.font = "bold 58px serif";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("LA TRATTORIA", 300, 52);
        g.fillStyle = "#dfba58"; g.font = "italic 26px serif";
        g.fillText("CUCINA ROMANA", 300, 102);
      }),
    });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.84), signMat);
    signBoard.layers.set(NOINK);
    signBoard.position.set(0, 3.8, 0.15);
    R.add(signBoard);

    // Chimney smoke
    const smokeT = smokeTex();
    for (let k = 0; k < 6; k++) {
      const mat = new THREE.MeshLambertMaterial({ map: smokeT, transparent: true, depthWrite: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      m.layers.set(NOINK);
      this.smoke.push({ m, mat, top: [2.5, 5.6, -4.5] as V3, k: k / 6 });
      R.add(m);
    }

    // Kenney Props (trees, lanterns, planters)
    for (const [name, px, pz, scale, yaw] of [
      ["tree_oak", -8, 4.0, 1.25, 0],
      ["tree_oak", 8, 4.0, 1.2, 0.5],
      ["tree_default", -13, 2.5, 1.0, 0],
      ["tree_default", 13, 2.5, 1.0, 0.8],
      ["lantern", -4.4, 4.6, 0.85, 0],
      ["lantern", 4.4, 4.6, 0.85, 0],
      ["flower_redA", -2.7, 0.95, 0.25, 0.5, 0],
      ["flower_yellowA", 2.7, 0.95, 0.25, 0.5, 0],
      ["plant_bushDetailed", -5.5, 4.5, 0.9, 0],
      ["plant_bushDetailed", 5.5, 4.5, 0.9, 0.3],
    ] as const) {
      const o = kitClone(kit, name, scale);
      if (o) { o.position.set(px, D0 + 0.08, pz); o.rotation.y = yaw; R.add(o); }
    }

    // Foreground Props
    for (const fg of FOREGROUND) {
      const o = kitClone(kit, fg.kit, fg.s ?? 1);
      if (!o) continue;
      o.position.set(...fg.pos); o.rotation.y = fg.yaw ?? 0; o.visible = false;
      this.fgs.push({ o, a: fg.a, b: fg.b }); R.add(o);
    }
  }

  private addBistroTable(b: Batch, tx: number, tz: number, woodMat: THREE.Material, clothMat: THREE.Material) {
    const yBase = 0.08;
    // Table pedestal and legs
    b.add(boxGeo(V(tx - 0.06, yBase, tz - 0.06), V(tx + 0.06, yBase + 0.72, tz + 0.06)), woodMat);
    b.add(boxGeo(V(tx - 0.35, yBase, tz - 0.35), V(tx + 0.35, yBase + 0.04, tz + 0.35)), woodMat);
    // Table top with red-checkered tablecloth
    b.add(boxGeo(V(tx - 0.65, yBase + 0.72, tz - 0.65), V(tx + 0.65, yBase + 0.76, tz + 0.65), 1), clothMat);
    // Tablecloth overhang
    b.add(boxGeo(V(tx - 0.66, yBase + 0.62, tz - 0.66), V(tx + 0.66, yBase + 0.72, tz + 0.66), 1), clothMat);
    // Wine bottle & plates
    b.add(boxGeo(V(tx - 0.05, yBase + 0.76, tz - 0.05), V(tx + 0.05, yBase + 1.05, tz + 0.05)), woodMat);
    b.add(boxGeo(V(tx - 0.38, yBase + 0.76, tz - 0.15), V(tx - 0.15, yBase + 0.78, tz + 0.15)), woodMat);
    b.add(boxGeo(V(tx + 0.15, yBase + 0.76, tz - 0.15), V(tx + 0.38, yBase + 0.78, tz + 0.15)), woodMat);
    // Two bistro chairs
    b.add(boxGeo(V(tx - 0.85, yBase, tz - 0.22), V(tx - 0.55, yBase + 0.48, tz + 0.22)), woodMat); // chair seat left
    b.add(boxGeo(V(tx - 0.85, yBase + 0.48, tz - 0.22), V(tx - 0.80, yBase + 0.92, tz + 0.22)), woodMat); // backrest
    b.add(boxGeo(V(tx + 0.55, yBase, tz - 0.22), V(tx + 0.85, yBase + 0.48, tz + 0.22)), woodMat); // chair seat right
    b.add(boxGeo(V(tx + 0.80, yBase + 0.48, tz - 0.22), V(tx + 0.85, yBase + 0.92, tz + 0.22)), woodMat);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const ss = s as ShotDef & { sunAz?: number; sunEl?: number };
    const az = THREE.MathUtils.degToRad(ss.sunAz ?? SUN_SHOT[id]?.az ?? L.az);
    const el = THREE.MathUtils.degToRad(ss.sunEl ?? SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light === "warm" ? "day" : s.light as "day" | "golden"];
    // Camera
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);

    // Light
    const K = LOOK[s.light === "warm" ? "day" : s.light as "day" | "golden"];
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = s.light === "warm" ? 2.2 : L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0.3; this.fill.position.copy(cam.position);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);

    // Sky & Fog
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg: number) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;

    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position);
      this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light === "golden" ? "golden" : "day"][i % 4];
    }

    // Smoke
    for (const sm of this.smoke) {
      const u = (t * 0.08 + sm.k) % 1, sz = 2 + u * 6;
      sm.m.position.set(sm.top[0] - u * 2.5, sm.top[1] + u * 9 + u * u * 2, sm.top[2] + u * 1.2);
      sm.m.scale.set(sz, sz, 1); sm.m.quaternion.copy(cam.quaternion);
      sm.mat.opacity = 0.6 * (1 - u) ** 1.3;
    }

    // Foreground props
    for (const g of this.fgs) g.o.visible = f >= g.a && f < g.b && g.a < s.b && g.b > s.a;

    // Cast and Stage
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const rst = restaurantState(id, t);
    const st = restaurantStage(id, t, rst, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";

    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;

    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const ev = this.fx(fi++);
      ev.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      ev.use(!!p.soft);
      ev.mesh.visible = true;
      ev.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) ev.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { ev.mesh.quaternion.copy(cam.quaternion); ev.mesh.rotateZ(p.rot ?? 0); }
      ev.mesh.scale.set(p.w, p.h, 1);
      fused.push(ev);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;

    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}
