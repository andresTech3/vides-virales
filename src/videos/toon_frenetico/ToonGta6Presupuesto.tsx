import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Costó más hacer GTA seis que construir el rascacielos más alto del mundo.", startSec: 0.02, endSec: 3.75 },
  { text: "Levantar el Burj Khalifa en Dubái costó mil quinientos millones de dólares.", startSec: 4.26, endSec: 8.06 },
  { text: "Una superproducción gigante de cine como Avengers ronda cuatrocientos millones.", startSec: 8.73, endSec: 12.94 },
  { text: "Pero entre desarrollo y marketing,", startSec: 13.52, endSec: 15.11 },
  { text: "GTA seis alcanzó los dos mil millones.", startSec: 15.43, endSec: 17.56 },
  { text: "Es literalmente el producto de entretenimiento más caro jamás creado.", startSec: 18.02, endSec: 21.49 },
  { text: "Más dinero que cientos de películas y rascacielos reales juntos.", startSec: 21.98, endSec: 25.23 },
  { text: "¿Crees que cada centavo se nota dentro del juego?", startSec: 25.76, endSec: 27.98 },
];

const ACCENTS: Record<string, string> = {
  "GTA seis": "#FF4DC4",
  "más alto": "#FFE14D",
  "Burj Khalifa": "#2CE6FF",
  "mil quinientos": "#4CE88A",
  "cuatrocientos millones.": "#FFE14D",
  "dos mil": "#4CE88A",
  "millones.": "#4CE88A",
  "más caro": "#FF5757",
  "jamás creado.": "#FFE14D",
  "Más dinero": "#4CE88A",
  "del juego?": "#FFE14D",
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

export const TOON_GTA6_PRESUPUESTO_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 845,
  characters: {
    ejecutivo: {
      shirt: "#243D75",
      outfit: "suit",
      pants: "#191C26",
      hat: "tophat",
      hatColor: "#17161E",
      tie: true,
      tieColor: "#4CE88A",
      glasses: true,
    },
    ingeniero: {
      shirt: "#D97A2B",
      outfit: "overalls",
      pants: "#2C3545",
      hat: "cap",
      hatColor: "#FFE14D",
      mustache: true,
    },
    director: {
      shirt: "#5C3D4E",
      outfit: "trenchcoat",
      pants: "#1E2028",
      hat: "beret",
      hatColor: "#222026",
    },
  },
  shots: [
    // 1. Hook contraste: rascacielos vs montaña gigante de dólares GTA 6!
    {
      start: 0,
      end: 58,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-5.5, 3.8, 10.6],
      camTo: [0.5, 3.0, 7.6],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 2.0, -0.5],
      fov: 48,
      rollFrom: -6,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "ejecutivo", pos: [-1.5, 0, 0.8], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
        { id: "ingeniero", pos: [1.5, 0, 0.8], face: -1, action: "panic", expr: "shocked", heldItem: "wrench", bubble: "!!" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.2], scale: 1.25 },
        { type: "sign", pos: [0, 0.5, -2.5], label: "GTA 6", color: "#FF4DC4", scale: 1.1 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.2, 0.4], atFrame: 6, durFrames: 48, scale: 1.2 },
      ],
    },
    // 2. "...construir el rascacielos más alto del mundo!" (Torre alta + explosión dinero)
    {
      start: 58,
      end: 118,
      stage: "city_street",
      skyMode: "golden_hour",
      camFrom: [4.2, 2.8, 8.8],
      camTo: [-0.8, 3.6, 8.2],
      lookFrom: [0, 2.2, -1.0],
      lookTo: [0, 3.2, -1.5],
      fov: 48,
      punch: true,
      shakeAt: 62,
      flashAt: 62,
      actors: [
        { id: "ingeniero", pos: [-1.6, 0, 0.8], face: 1, action: "point", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.4, 0, -2.8], scale: 1.0, color: "#6E7682" },
        { type: "sign", pos: [-1.2, 0.4, -1.4], label: "RÉCORD", color: "#FFE14D", scale: 0.9 },
      ],
      fx: [
        { type: "comic_star", pos: [1.4, 5.5, -2.5], atFrame: 62, durFrames: 26, scale: 1.0 },
      ],
    },
    // 3. "Levantar el Burj Khalifa en Dubái..." (Obra + ingeniero + letrero 1.500 M$)
    {
      start: 118,
      end: 185,
      stage: "industrial_yard",
      horizon: "city",
      floorStyle: "cobble",
      skyMode: "day_cyan",
      camFrom: [-4.0, 3.5, 10.6],
      camTo: [0.3, 3.0, 9.0],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "ingeniero", pos: [-1.6, 0, 0.7], face: 1, action: "talk", expr: "sweating", heldItem: "wrench" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.5, -0.8], label: "1.500 M$", color: "#2CE6FF", scale: 0.95 },
        { type: "crate", pos: [-2.8, 0, -2.0], label: "DUBÁI", color: "#DBAF72" },
      ],
      fx: [
        { type: "splinters", pos: [0.5, 1.6, -1.2], atFrame: 124, durFrames: 34, scale: 1.0 },
      ],
    },
    // 4. "...mil quinientos millones de dólares!" (Gag saco 1.500 M$)
    {
      start: 185,
      end: 252,
      stage: "city_street",
      skyMode: "day_cyan",
      camFrom: [0, 2.3, 6.4],
      camTo: [0.2, 2.1, 5.1],
      lookFrom: [0, 1.35, 0],
      lookTo: [0, 1.35, 0],
      fov: 42,
      rollFrom: -5,
      rollTo: 4,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.12, color: "#2CE6FF", label: "1.500M$", faceExpr: "deadpan" },
      ],
      actors: [],
    },
    // 5. "Una superproducción gigante de cine como Avengers..." (Director de cine + pilita pequeña)
    {
      start: 252,
      end: 325,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [3.6, 3.1, 9.6],
      camTo: [-0.2, 2.8, 8.4],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 45,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "director", pos: [-1.5, 0, 0.6], face: 1, action: "talk", expr: "deadpan", heldItem: "paper", bubble: "?" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.4, -0.8], label: "400 M$ CINE", color: "#FFE169", scale: 0.9 },
        { type: "money", pos: [1.1, 0, 0.6], scale: 0.6 },
      ],
    },
    // 6. "...ronda cuatrocientos millones." (Primer plano cómico contraste director!)
    {
      start: 325,
      end: 396,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-2.2, 2.3, 5.4],
      camTo: [0.2, 2.2, 4.2],
      lookFrom: [0, 1.9, 0],
      lookTo: [0, 2.0, 0],
      fov: 40,
      punch: true,
      vignette: 0.45,
      actors: [
        { id: "director", pos: [0, 0, 0.3], face: -1, action: "idle", expr: "deadpan", scale: 1.15 },
      ],
    },
    // 7. "Pero entre desarrollo y marketing..." (Estudio Rockstar echando chispas!)
    {
      start: 396,
      end: 454,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-4.5, 3.2, 8.4],
      camTo: [0.4, 2.7, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 44,
      camEase: "whip",
      punch: true,
      shakeAt: 402,
      speedLines: true,
      actors: [
        { id: "ejecutivo", pos: [-1.3, 0, 0.6], face: 1, action: "point", expr: "evil_smug", heldItem: "briefcase", bubble: "$$" },
      ],
      props3d: [
        { type: "crate", pos: [1.3, 0, -0.6], label: "ROCKSTAR", color: "#FFE14D", scale: 1.05 },
        { type: "orb", pos: [0, 3.6, 0], scale: 0.85 },
      ],
    },
    // 8. "...GTA seis alcanzó los DOS MIL MILLONES!" (EXPLOSIÓN DORADA DE DINERO!)
    {
      start: 454,
      end: 534,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [3.2, 3.4, 8.6],
      camTo: [0, 3.0, 7.2],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      rollFrom: -7,
      rollTo: 4,
      punch: true,
      shakeAt: 462,
      flashAt: 462,
      speedLines: "intense",
      actors: [
        { id: "ejecutivo", pos: [-1.6, 0, 0.7], face: 1, action: "laugh", expr: "dollar_eyes", bubble: "$$" },
        { id: "ingeniero", pos: [1.6, 0, 0.7], face: -1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.5, -2.0], label: "2.000 M$", color: "#4CE88A", scale: 1.2 },
        { type: "money", pos: [0, 0, 0.4], scale: 1.2 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.0, 0.4], atFrame: 462, durFrames: 60, scale: 1.3 },
        { type: "comic_star", pos: [0, 2.8, -1.0], atFrame: 462, durFrames: 26, scale: 1.0 },
      ],
    },
    // 9. "Es literalmente el producto de entretenimiento más caro jamás creado." (Saco RÉCORD cara smug + chispas!)
    {
      start: 534,
      end: 615,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [0, 2.2, 6.4],
      camTo: [-0.2, 2.1, 5.2],
      lookFrom: [0, 1.35, 0],
      lookTo: [0, 1.35, 0],
      fov: 42,
      rollFrom: 6,
      rollTo: -3,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.12, color: "#4CE88A", label: "RÉCORD", faceExpr: "smug" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.4], atFrame: 538, durFrames: 65 },
      ],
      actors: [],
    },
    // 10. "Más dinero que cientos de películas y rascacielos reales juntos." (Ejecutivo bailando sobre dinero!)
    {
      start: 615,
      end: 695,
      stage: "vice_city",
      skyMode: "sunset_purple",
      camFrom: [-4.8, 3.2, 8.6],
      camTo: [1.0, 2.8, 6.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "ejecutivo", pos: [-1.4, 0, 0.7], face: 1, action: "celebrate", expr: "laughing", heldItem: "money", bubble: "laugh" },
        { id: "director", pos: [1.5, 0, 0.7], face: -1, action: "fall", expr: "deadpan" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.3], scale: 1.2 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.0, 0.5], atFrame: 620, durFrames: 60, scale: 1.2 },
      ],
    },
    // 11. "¿Crees que cada centavo se nota dentro del juego?" (Remate épico Vice City con coche deportivo!)
    {
      start: 695,
      end: 845,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [1.0, 3.0, 7.6],
      camTo: [4.2, 4.5, 11.8],
      lookFrom: [0, 1.8, -0.6],
      lookTo: [0, 2.2, -1.0],
      fov: 48,
      rollFrom: -4,
      rollTo: 0,
      speedLines: true,
      actors: [
        { id: "ejecutivo", pos: [-1.6, 0, 0.9], face: 1, action: "point", expr: "dollar_eyes", heldItem: "cane", bubble: "?" },
        { id: "ingeniero", pos: [1.6, 0, 0.9], face: -1, action: "celebrate", expr: "happy", bubble: "$$" },
      ],
      props3d: [
        { type: "car", pos: [0, 0, -1.8], rotY: -0.22, scale: 1.05, color: "#FF4DC4" },
        { type: "sign", pos: [0, 0.4, -3.5], label: "GTA 6", color: "#FFE14D", scale: 1.15 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.6, -1.2], atFrame: 702, durFrames: 120, scale: 1.4 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Presupuesto: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_PRESUPUESTO_SPEC} />;
};

