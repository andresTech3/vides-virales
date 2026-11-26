import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Rockstar ocultó el secreto más grande de GTA seis hasta el estreno.", startSec: 0.10, endSec: 3.91 },
  { text: "En todos los tráileres, Lucía y Jason parecían simples ladrones por dinero.", startSec: 4.50, endSec: 8.17 },
  { text: "Pero desde la primera escena del juego, todo cambia por completo.", startSec: 8.75, endSec: 11.57 },
  { text: "Sin un dólar,", startSec: 12.07, endSec: 12.67 },
  { text: "Lucía deja a su bebé Tomás en una cafetería…", startSec: 12.97, endSec: 15.32 },
  { text: "…justo antes de entrar desesperada a cometer un atraco.", startSec: 15.65, endSec: 18.21 },
  { text: "El golpe sale mal,", startSec: 18.80, endSec: 19.77 },
  { text: "llega la policía y termina arrestada.", startSec: 20.01, endSec: 22.05 },
  { text: "Servicios sociales se lleva al niño…", startSec: 22.49, endSec: 24.05 },
  { text: "…y ahí nace la historia real.", startSec: 24.43, endSec: 25.82 },
  { text: "No roban por lujo ni ambición:", startSec: 26.22, endSec: 27.87 },
  { text: "roban para recuperar a su hijo.", startSec: 28.04, endSec: 29.62 },
  { text: "¿Te esperabas este giro dramático dentro de GTA seis?", startSec: 29.96, endSec: 32.72 },
];

const ACCENTS: Record<string, string> = {
  "el secreto": "#FFE14D",
  "GTA seis": "#FF4DC4",
  "por dinero.": "#4CE88A",
  "todo cambia": "#FF5757",
  "por completo.": "#FF5757",
  "bebé Tomás": "#2CE6FF",
  "un atraco.": "#FF5757",
  "sale mal,": "#FF5757",
  "termina arrestada.": "#FF5757",
  "al niño…": "#2CE6FF",
  "historia real.": "#FFE14D",
  "a su": "#2CE6FF",
  "hijo.": "#2CE6FF",
  "giro dramático": "#FFE14D",
};

function buildCaptions(): ToonCaption[] {
  const out: ToonCaption[] = [];
  for (const seg of SEGMENTS) {
    const words = seg.text.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
    const weights = chunks.map((c) => Math.max(3, c.replace(/[.,…:¿?]/g, "").length));
    const totalW = weights.reduce((a, b) => a + b, 0);
    const dur = seg.endSec - seg.startSec;
    let cur = seg.startSec;
    for (let i = 0; i < chunks.length; i++) {
      const cd = (weights[i] / totalW) * dur;
      const sf = Math.round(cur * 30);
      const ef = Math.max(sf + 2, Math.round((cur + cd) * 30) - 1);
      const txt = chunks[i];
      out.push({
        text: txt,
        startFrame: sf,
        endFrame: ef,
        accentColor: ACCENTS[txt],
      });
      cur += cd;
    }
  }
  return out;
}

export const TOON_GTA6_TOMAS_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 991,
  characters: {
    lucia: {
      shirt: "#E63E8D",
      outfit: "casual",
      pants: "#1D2230",
      hair: "curly",
      hairColor: "#241914",
    },
    jason: {
      shirt: "#3FA9A1",
      outfit: "casual",
      pants: "#272C38",
      hat: "cap",
      hatColor: "#26334D",
      hair: "spiky",
    },
    tomas: {
      shirt: "#7DD8FF",
      outfit: "overalls",
      pants: "#3E7CB1",
      hat: "none",
      hair: "curly",
      hairColor: "#3D2618",
    },
    policia: {
      shirt: "#233963",
      outfit: "police",
      pants: "#161E30",
      hat: "police_kepi",
      hatColor: "#1D2E52",
      glasses: true,
      mustache: true,
      belt: true,
    },
    social: {
      shirt: "#4B5565",
      outfit: "suit",
      pants: "#222733",
      tie: true,
      tieColor: "#489CC2",
      glasses: true,
    },
  },
  shots: [
    // 1. Rockstar ocultó el secreto... (Oficina oscura con cartel SECRETO)
    {
      start: 0,
      end: 36,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-5.5, 3.4, 9.2],
      camTo: [-0.8, 2.5, 6.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      rollFrom: -6,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      vignette: 0.45,
      actors: [
        { id: "lucia", pos: [-1.8, 0, 0.8], face: 1, action: "sneak", expr: "smug", bubble: "!" },
        { id: "jason", pos: [1.8, 0, 0.8], face: -1, action: "sneak", expr: "evil_smug" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.6, -1.8], label: "SECRETO", color: "#FF4DC4", scale: 1.1 },
        { type: "orb", pos: [0, 3.6, -1.6], scale: 0.85 },
      ],
    },
    // 2. "...más grande de GTA seis" (Explosión cómica + flash + cartel GTA 6)
    {
      start: 36,
      end: 78,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [3.2, 3.2, 9.2],
      camTo: [-0.2, 2.8, 7.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 45,
      punch: true,
      shakeAt: 38,
      flashAt: 38,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-1.45, 0, 0.6], face: 1, action: "point", expr: "shocked", bubble: "!!" },
        { id: "jason", pos: [1.45, 0, 0.6], face: -1, action: "panic", expr: "shocked" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.4, -2.0], label: "GTA 6", color: "#FFE14D", scale: 1.05 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.4, -0.8], atFrame: 38, durFrames: 24, scale: 0.9 },
      ],
    },
    // 3. "...hasta el estreno!" (Documento OFICIAL ESTRENO)
    {
      start: 78,
      end: 132,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-1.6, 2.2, 5.4],
      camTo: [0.3, 2.0, 4.4],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      rollFrom: 6,
      rollTo: -3,
      punch: true,
      props3d: [
        { type: "doc", pos: [0, 0.5, 0], label: "ESTRENO", scale: 1.1 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 1.8, 0.4], atFrame: 82, durFrames: 42 },
      ],
      actors: [],
    },
    // 4. "En todos los tráileres, Lucía y Jason parecían..." (Vice Neon + deportivo + montaña dinero)
    {
      start: 132,
      end: 192,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-4.5, 3.6, 10.6],
      camTo: [0.4, 3.2, 8.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [-1.55, 0, 0.8], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
        { id: "jason", pos: [1.55, 0, 0.8], face: -1, action: "laugh", expr: "laughing", heldItem: "briefcase" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.2], scale: 1.15 },
        { type: "car", pos: [0.4, 0, -2.8], rotY: -0.25, scale: 0.98, color: "#E63946" },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.0, 0.4], atFrame: 138, durFrames: 48, scale: 1.2 },
      ],
    },
    // 5. "...simples ladrones por dinero." (Gag saco $$$ cara smug!)
    {
      start: 192,
      end: 256,
      stage: "vice_city",
      skyMode: "golden_hour",
      camFrom: [0, 2.2, 6.2],
      camTo: [0.2, 2.0, 4.9],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 42,
      rollFrom: -5,
      rollTo: 4,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.15, color: "#4CE88A", label: "DINERO", faceExpr: "smug" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.4], atFrame: 196, durFrames: 48 },
      ],
      actors: [],
    },
    // 6. "Pero desde la primera escena del juego..." (Corte dramático oscuro + flash!)
    {
      start: 256,
      end: 306,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [4.2, 3.0, 7.2],
      camTo: [-0.8, 2.4, 5.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 42,
      camEase: "whip",
      punch: true,
      flashAt: 260,
      vignette: 0.5,
      actors: [
        { id: "lucia", pos: [0, 0, 0.4], face: 1, action: "panic", expr: "sweating", bubble: "!" },
      ],
    },
    // 7. "...todo cambia por completo." (Zoom extremo al rostro shocked + speed lines!)
    {
      start: 306,
      end: 356,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.2, 4.6],
      camTo: [0, 2.4, 3.4],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      punch: true,
      shakeAt: 310,
      speedLines: "intense",
      vignette: 0.55,
      actors: [
        { id: "lucia", pos: [0, 0, 0], face: 1, action: "panic", expr: "terrified", scale: 1.15, bubble: "!!" },
      ],
    },
    // 8. "Sin un dólar..." (Bolsillo vacío / cartel 0 $)
    {
      start: 356,
      end: 392,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-2.8, 2.4, 5.8],
      camTo: [0.4, 2.1, 4.8],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 42,
      rollFrom: 6,
      rollTo: -3,
      punch: true,
      actors: [
        { id: "lucia", pos: [-1.1, 0, 0.4], face: 1, action: "fall", expr: "sweating" },
      ],
      props3d: [
        { type: "sign", pos: [1.1, 0.4, -0.4], label: "0 DÓLARES", color: "#FF5757", scale: 0.85 },
      ],
    },
    // 9. "...Lucía deja a su bebé Tomás en una cafetería..." (Cafetería cálida + bebé Tomás!)
    {
      start: 392,
      end: 446,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [3.6, 3.1, 8.6],
      camTo: [-0.4, 2.6, 6.8],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 44,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [-1.3, 0, 0.4], face: 1, action: "lean_in", expr: "sweating" },
        { id: "tomas", pos: [1.1, 0, 0.7], face: -1, action: "idle", expr: "happy", scale: 0.58, bubble: "?" },
      ],
      props3d: [
        { type: "desk", pos: [0, 0, -1.6], scale: 0.9, color: "#9C5B34" },
      ],
    },
    // 10. Primer plano tierno de Tomás bebé en el café!
    {
      start: 446,
      end: 472,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [0, 1.8, 4.4],
      camTo: [0.3, 1.7, 3.6],
      lookFrom: [0, 1.1, 0],
      lookTo: [0, 1.1, 0],
      fov: 40,
      punch: true,
      actors: [
        { id: "tomas", pos: [0, 0, 0.3], face: 1, action: "celebrate", expr: "happy", scale: 0.68 },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.2, -1.8], label: "CAFETERÍA", color: "#FFE169", scale: 0.9 },
      ],
    },
    // 11. "...justo antes de entrar desesperada a cometer un atraco." (Corriendo al banco!)
    {
      start: 472,
      end: 518,
      stage: "city_street",
      skyMode: "dramatic_dark",
      camFrom: [-6.0, 3.4, 9.2],
      camTo: [2.2, 2.8, 7.2],
      lookFrom: [-0.8, 1.8, 0],
      lookTo: [0.5, 1.8, 0],
      fov: 48,
      camEase: "whip",
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-3.0, 0, 1.0], toPos: [1.5, 0, 1.0], face: 1, action: "run", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [2.4, 0.4, -1.6], label: "BANCO", color: "#FFE169", scale: 1.0 },
        { type: "crate", pos: [-2.8, 0, -2.0], label: "$$$", color: "#4CE88A" },
      ],
    },
    // 12. "El golpe sale mal..." (EXPLOSIÓN + astillas + flash + shake!)
    {
      start: 518,
      end: 560,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [2.4, 2.6, 6.4],
      camTo: [-0.4, 2.8, 7.2],
      lookFrom: [0, 1.9, 0],
      lookTo: [0, 2.0, 0],
      fov: 44,
      rollFrom: -7,
      rollTo: 5,
      punch: true,
      shakeAt: 545,
      flashAt: 545,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-0.8, 0, 0.6], face: -1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      fx: [
        { type: "comic_star", pos: [0.6, 2.2, -0.4], atFrame: 545, durFrames: 24, scale: 1.0 },
        { type: "splinters", pos: [0.2, 1.8, 0], atFrame: 545, durFrames: 26, scale: 1.1 },
      ],
    },
    // 13. "...llega la policía..." (Vice City con patrullas y luces rojas/azules)
    {
      start: 560,
      end: 615,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [-6.5, 3.6, 10.4],
      camTo: [1.2, 3.0, 7.4],
      lookFrom: [0, 1.7, -0.5],
      lookTo: [0, 1.8, -0.5],
      fov: 48,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "policia", pos: [1.8, 0, 1.0], face: -1, action: "point", expr: "angry", bubble: "!!" },
        { id: "lucia", pos: [-1.8, 0, 1.0], face: 1, action: "panic", expr: "shocked" },
      ],
      props3d: [
        { type: "police_car", pos: [0.4, 0, -2.0], rotY: -0.3, scale: 1.05 },
        { type: "wanted_stars", pos: [-1.8, 4.0, 1.0], scale: 0.75 },
      ],
    },
    // 14. "...y termina arrestada." (Prisión oscura de ladrillo + viñeta)
    {
      start: 615,
      end: 672,
      stage: "brick_corridor",
      skyMode: "dramatic_dark",
      camFrom: [-2.4, 2.5, 5.8],
      camTo: [0.3, 2.2, 4.6],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 42,
      punch: true,
      shakeAt: 618,
      vignette: 0.6,
      actors: [
        { id: "lucia", pos: [0, 0, 0.3], face: -1, action: "fall", expr: "deadpan" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.3, -2.0], label: "PRISIÓN", color: "#FF5757", scale: 1.05 },
      ],
    },
    // 15. "Servicios sociales se lleva al niño..." (Trabajador social + doc CUSTODIA + Tomás!)
    {
      start: 672,
      end: 726,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [3.6, 3.0, 8.6],
      camTo: [-0.3, 2.6, 7.2],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 45,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "social", pos: [-1.35, 0, 0.4], face: 1, action: "talk", expr: "deadpan", heldItem: "paper", bubble: "!" },
        { id: "tomas", pos: [1.15, 0, 0.8], face: -1, action: "panic", expr: "terrified", scale: 0.58 },
      ],
      props3d: [
        { type: "doc", pos: [0, 0.4, -1.6], label: "CUSTODIA", scale: 0.95 },
      ],
    },
    // 16. "...y ahí nace la historia real." (Primer plano documento HISTORIA REAL + chispas)
    {
      start: 726,
      end: 780,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [-1.5, 2.2, 5.2],
      camTo: [0.3, 2.0, 4.3],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      rollFrom: -5,
      rollTo: 2,
      punch: true,
      props3d: [
        { type: "doc", pos: [0, 0.5, 0], label: "HISTORIA REAL", scale: 1.1 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 1.8, 0.4], atFrame: 730, durFrames: 45 },
      ],
      actors: [],
    },
    // 17. "No roban por lujo ni ambición:" (Lucía y Jason determinados frente a dinero!)
    {
      start: 780,
      end: 838,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-4.4, 3.0, 7.8],
      camTo: [0.8, 2.6, 5.8],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 44,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "lucia", pos: [-1.3, 0, 0.6], face: 1, action: "point", expr: "angry", bubble: "!" },
        { id: "jason", pos: [1.3, 0, 0.6], face: -1, action: "talk", expr: "angry" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, -1.8], scale: 1.1 },
      ],
    },
    // 18. "...roban para recuperar a su hijo." (Persecución épica + billetes volando + cielo neón!)
    {
      start: 838,
      end: 896,
      stage: "vice_city",
      skyMode: "sunset_purple",
      camFrom: [-6.0, 3.5, 9.8],
      camTo: [2.8, 3.0, 7.4],
      lookFrom: [0, 1.8, 0],
      lookTo: [0.6, 1.9, 0],
      fov: 48,
      camEase: "whip",
      punch: true,
      shakeAt: 842,
      flashAt: 842,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-2.0, 0, 1.0], toPos: [1.0, 0, 1.0], face: 1, action: "run", expr: "angry", heldItem: "money" },
        { id: "jason", pos: [-0.2, 0, 0.5], toPos: [2.4, 0, 0.5], face: 1, action: "run", expr: "angry", heldItem: "briefcase" },
      ],
      props3d: [
        { type: "car", pos: [1.5, 0, -1.8], rotY: 0.2, scale: 1.0, color: "#2CE6FF" },
      ],
      fx: [
        { type: "flying_bills", pos: [0.4, 2.0, 0.8], atFrame: 842, durFrames: 48, scale: 1.2 },
      ],
    },
    // 19. "¿Te esperabas este giro dramático..." (Los tres juntos + orbe brillante!)
    {
      start: 896,
      end: 944,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [2.8, 2.8, 6.8],
      camTo: [0.2, 2.6, 5.6],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 44,
      rollFrom: -4,
      rollTo: 0,
      punch: true,
      actors: [
        { id: "lucia", pos: [-1.5, 0, 0.5], face: 1, action: "celebrate", expr: "happy" },
        { id: "tomas", pos: [0, 0, 0.9], face: 1, action: "celebrate", expr: "happy", scale: 0.58 },
        { id: "jason", pos: [1.5, 0, 0.5], face: -1, action: "celebrate", expr: "smug" },
      ],
      props3d: [
        { type: "orb", pos: [0, 3.8, 0.5], scale: 0.8 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.0, 0.6], atFrame: 900, durFrames: 42 },
      ],
    },
    // 20. "...dentro de GTA seis?" (Alejamiento épico final bajo neones de Vice City!)
    {
      start: 944,
      end: 991,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [0.2, 2.6, 5.6],
      camTo: [3.8, 4.2, 11.4],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 2.2, -1.0],
      fov: 48,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-1.6, 0, 0.8], face: 1, action: "point", expr: "shocked", bubble: "?" },
        { id: "tomas", pos: [0, 0, 1.1], face: 1, action: "idle", expr: "happy", scale: 0.58 },
        { id: "jason", pos: [1.6, 0, 0.8], face: -1, action: "idle", expr: "smug", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.3, -2.5], label: "GTA 6", color: "#FF4DC4", scale: 1.15 },
        { type: "wanted_stars", pos: [0, 4.2, -1.5], scale: 0.85 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.5, -1.0], atFrame: 946, durFrames: 42, scale: 1.3 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Tomas: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_TOMAS_SPEC} />;
};

