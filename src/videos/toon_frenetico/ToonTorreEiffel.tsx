import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Un hombre vendió la Torre Eiffel…", startSec: 0.05, endSec: 1.85 },
  { text: "…dos veces seguidas.", startSec: 2.11, endSec: 3.35 },
  { text: "París, mil novecientos veinticinco:", startSec: 4.07, endSec: 6.28 },
  { text: "corrían rumores de que iban a demolerla.", startSec: 6.48, endSec: 8.75 },
  { text: "Víctor falsificó documentos del gobierno y reunió a seis chatarreros ricos.", startSec: 9.37, endSec: 13.35 },
  { text: "Les vendió el secreto del siglo:", startSec: 13.67, endSec: 15.32 },
  { text: "todo ese hierro estaba en oferta.", startSec: 15.70, endSec: 17.20 },
  { text: "Uno cayó en la trampa y pagó una montaña de dinero.", startSec: 17.34, endSec: 20.10 },
  { text: "Cuando llegó con camiones a desmontarla…", startSec: 20.41, endSec: 22.55 },
  { text: "…nadie sabía absolutamente nada.", startSec: 22.83, endSec: 25.15 },
  { text: "Muerto de vergüenza, calló la estafa para no quedar en ridículo.", startSec: 25.44, endSec: 28.90 },
  { text: "Como nadie denunció nada, Víctor regresó un mes después.", startSec: 29.24, endSec: 32.70 },
  { text: "Repitió exactamente el mismo engaño con otra víctima distinta.", startSec: 32.70, endSec: 35.98 },
  { text: "Esta vez lo descubrieron…", startSec: 36.22, endSec: 37.45 },
  { text: "…pero ya escapaba en barco muerto de risa.", startSec: 37.98, endSec: 40.42 },
  { text: "Si la mentira es gigante, nadie se atreve a confesar que cayó.", startSec: 40.61, endSec: 43.95 },
];

const ACCENTS: Record<string, string> = {
  "Torre Eiffel…": "#FFE14D",
  "…dos veces": "#4CE88A",
  "demolerla.": "#FF5757",
  "seis chatarreros": "#FFE14D",
  "del siglo:": "#FFE14D",
  "en oferta.": "#4CE88A",
  "montaña": "#4CE88A",
  "de dinero.": "#4CE88A",
  "absolutamente nada.": "#FF5757",
  "en ridículo.": "#FF5757",
  "mes después.": "#FFE14D",
  "lo descubrieron…": "#FF5757",
  "de risa.": "#FFE14D",
  "es gigante,": "#FFE14D",
};

function buildCaptions(): ToonCaption[] {
  const out: ToonCaption[] = [];
  for (const seg of SEGMENTS) {
    const words = seg.text.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
    const weights = chunks.map((c) => Math.max(3, c.replace(/[.,…:]/g, "").length));
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

export const TOON_TORRE_EIFFEL_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1322,
  characters: {
    victor: {
      shirt: "#243D75",
      outfit: "suit",
      pants: "#191C26",
      hat: "tophat",
      hatColor: "#17161E",
      tie: true,
      tieColor: "#D93B3B",
      mustache: true,
    },
    comprador1: {
      shirt: "#6E3B2B",
      outfit: "overalls",
      pants: "#2C3545",
      hat: "flat_cap",
      hatColor: "#423328",
      mustache: true,
    },
    comprador2: {
      shirt: "#3A5F4D",
      outfit: "trenchcoat",
      pants: "#20242D",
      hat: "bowler",
      hatColor: "#222026",
      glasses: true,
      tie: true,
      tieColor: "#DBAF72",
    },
    ciudadano: {
      shirt: "#7A4958",
      outfit: "casual",
      pants: "#242733",
      hat: "beret",
      hatColor: "#2B242B",
    },
    policia: {
      shirt: "#1D325C",
      outfit: "police",
      pants: "#162038",
      hat: "police_kepi",
      hatColor: "#1A2B4C",
      mustache: true,
      belt: true,
    },
  },
  shots: [
    // 1. Hook rápido en París: Campo de Marte + Torre Eiffel + Víctor con bastón
    {
      start: 0,
      end: 28,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [-7.5, 4.2, 13.5],
      camTo: [-2.8, 3.3, 8.8],
      lookFrom: [0, 2.8, -2.5],
      lookTo: [-0.2, 2.5, -1.8],
      fov: 48,
      rollFrom: -7,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "victor", pos: [-2.1, 0, 1.3], face: 1, action: "point", expr: "evil_smug", heldItem: "cane", bubble: "$$" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.4, 0, -3.2], scale: 1.05 },
      ],
    },
    // 2. Contrapicado explosivo mirando arriba a la Torre Eiffel
    {
      start: 28,
      end: 58,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [-2.5, 1.8, 6.2],
      camTo: [1.8, 4.8, 9.6],
      lookFrom: [0.4, 2.5, -1.2],
      lookTo: [0.8, 6.2, -3.2],
      fov: 50,
      rollFrom: 5,
      rollTo: -3,
      camEase: "snap",
      speedLines: true,
      actors: [
        { id: "victor", pos: [-1.2, 0, 1.6], face: 1, action: "laugh", expr: "laughing", bubble: "laugh" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.2, 0, -3.2], scale: 1.1 },
      ],
      fx: [
        { type: "comic_star", pos: [1.2, 11.2, -3.2], atFrame: 32, durFrames: 24, scale: 1.3 },
      ],
    },
    // 3. "...dos veces seguidas!" Shake + billetes volando + ojos dólar
    {
      start: 58,
      end: 84,
      stage: "paris_plaza",
      skyMode: "golden_hour",
      camFrom: [3.6, 3.6, 8.5],
      camTo: [0.5, 2.9, 6.0],
      lookFrom: [0, 1.8, 0.4],
      lookTo: [0, 2.0, 0.4],
      fov: 44,
      camEase: "whip",
      punch: true,
      shakeAt: 59,
      flashAt: 59,
      speedLines: "intense",
      actors: [
        { id: "victor", pos: [-1.5, 0, 0.8], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
      ],
      props3d: [
        { type: "money", pos: [1.2, 0, 0.8], scale: 1.35 },
        { type: "eiffel", pos: [0.5, 0, -5.0], scale: 0.9 },
      ],
      fx: [
        { type: "flying_bills", pos: [0.5, 1.2, 0.8], atFrame: 59, durFrames: 25, scale: 1.1 },
      ],
    },
    // 4. Micro-gag extremo: saco 2X $$ con cara smug en primerísimo plano!
    {
      start: 84,
      end: 110,
      stage: "paris_plaza",
      skyMode: "golden_hour",
      camFrom: [0, 2.2, 6.2],
      camTo: [0.3, 1.9, 4.8],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 42,
      rollFrom: -6,
      rollTo: 4,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.15, color: "#DBAF72", label: "2X $$", faceExpr: "smug" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.5], atFrame: 85, durFrames: 24, scale: 1.1 },
      ],
      actors: [],
    },
    // 5. París, mil novecientos veinticinco (calle parisina + camión de época)
    {
      start: 110,
      end: 152,
      stage: "city_street",
      skyMode: "day_cyan",
      camFrom: [-8.0, 4.0, 11.5],
      camTo: [3.2, 3.4, 9.2],
      lookFrom: [-0.5, 1.8, -0.5],
      lookTo: [0.4, 2.0, -1.0],
      fov: 48,
      camEase: "whip",
      actors: [
        { id: "ciudadano", pos: [-3.2, 0, 1.2], face: 1, action: "talk", expr: "shocked", heldItem: "paper", bubble: "!" },
        { id: "comprador1", pos: [2.8, 0, 0.8], face: -1, action: "idle", expr: "neutral", heldItem: "wrench" },
      ],
      props3d: [
        { type: "sign", pos: [0, 2.8, -3.5], label: "PARÍS 1925", color: "#FFE169", scale: 1.15 },
        { type: "truck", pos: [-5.0, 0, -1.5], toPos: [3.5, 0, -1.5], scale: 0.95, color: "#4B7C59" },
      ],
    },
    // 6. Víctor planea el golpe en primer plano con Dutch tilt
    {
      start: 152,
      end: 190,
      stage: "city_street",
      skyMode: "day_cyan",
      camFrom: [3.5, 2.4, 5.2],
      camTo: [-0.8, 2.3, 4.2],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.1, 0],
      fov: 38,
      rollFrom: 8,
      rollTo: -4,
      punch: true,
      actors: [
        { id: "victor", pos: [0, 0, 0], face: 1, action: "sneak", expr: "evil_smug", heldItem: "paper", bubble: "!" },
      ],
      props3d: [
        { type: "eiffel", pos: [3.2, 0, -5.0], scale: 0.85 },
      ],
    },
    // 7. Rumores de DEMOLICIÓN -> ciudadanos corriendo en caos!
    {
      start: 190,
      end: 225,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [-5.5, 3.8, 10.5],
      camTo: [3.8, 3.6, 9.0],
      lookFrom: [0, 2.0, -1.5],
      lookTo: [0, 2.2, -1.5],
      fov: 48,
      camEase: "whip",
      speedLines: true,
      actors: [
        { id: "ciudadano", pos: [-4.2, 0, 1.4], toPos: [3.0, 0, 1.4], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
        { id: "comprador1", pos: [3.6, 0, 0.4], toPos: [-3.2, 0, 0.4], face: -1, action: "run", expr: "shocked" },
      ],
      props3d: [
        { type: "eiffel", pos: [0.2, 0, -3.5], scale: 1.0 },
        { type: "sign", pos: [-3.2, 0.4, -1.2], label: "DEMOLICIÓN", color: "#FF6B5B", scale: 0.9 },
      ],
    },
    // 8. EXPLOSIÓN CÓMICA de rumor + astillas + sacudida brutal
    {
      start: 225,
      end: 252,
      stage: "paris_plaza",
      skyMode: "golden_hour",
      camFrom: [2.2, 2.8, 7.2],
      camTo: [0.2, 3.4, 8.8],
      lookFrom: [0, 2.2, -1.8],
      lookTo: [0, 2.0, -1.8],
      fov: 46,
      punch: true,
      shakeAt: 226,
      flashAt: 226,
      speedLines: "intense",
      actors: [
        { id: "ciudadano", pos: [-2.2, 0, 0.5], face: -1, action: "fall", expr: "terrified" },
      ],
      props3d: [
        { type: "eiffel", pos: [0.3, 0, -3.0], scale: 1.05 },
      ],
      fx: [
        { type: "comic_star", pos: [0.3, 2.2, -1.6], atFrame: 225, durFrames: 26, scale: 1.8 },
        { type: "splinters", pos: [0.3, 2.0, -1.6], atFrame: 225, durFrames: 27, scale: 1.2 },
      ],
    },
    // 9. Reacción en macro de chatarrero frente a muro rojo ladrillo
    {
      start: 252,
      end: 275,
      stage: "brick_corridor",
      skyMode: "interior_warm",
      camFrom: [0, 2.2, 5.2],
      camTo: [0, 2.4, 3.6],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      rollFrom: -8,
      rollTo: 0,
      punch: true,
      actors: [
        { id: "comprador1", pos: [0, 0, 0], face: 1, action: "panic", expr: "shocked", scale: 1.15, bubble: "!" },
      ],
    },
    // 10. Oficina elegante / Hotel París: Víctor falsificando papeles
    {
      start: 275,
      end: 318,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-5.2, 3.2, 7.6],
      camTo: [-1.4, 2.6, 5.5],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.9, -0.5],
      fov: 44,
      camEase: "whip",
      actors: [
        { id: "victor", pos: [0, 0, -1.2], face: 1, action: "talk", expr: "evil_smug", heldItem: "paper" },
      ],
      props3d: [
        { type: "desk", pos: [0, 0, 0.2], scale: 1.0 },
        { type: "doc", pos: [0.8, 1.0, 0.4], label: "GOBIERNO", scale: 0.75, rotY: -0.25 },
      ],
    },
    // 11. Micro-corte al documento OFICIAL + sello brillante!
    {
      start: 318,
      end: 355,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [2.0, 2.3, 5.2],
      camTo: [0.2, 2.0, 4.2],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      rollFrom: 6,
      rollTo: -4,
      punch: true,
      shakeAt: 324,
      flashAt: 324,
      props3d: [
        { type: "doc", pos: [0, 0.6, 0], label: "SECRETO", scale: 1.1 },
      ],
      fx: [
        { type: "comic_star", pos: [0.95, 2.1, 0.2], atFrame: 324, durFrames: 22, scale: 0.75 },
      ],
      actors: [],
    },
    // 12. Reunió a seis chatarreros ricos (sala elegante!)
    {
      start: 355,
      end: 405,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [5.5, 3.4, 8.6],
      camTo: [-1.2, 2.8, 6.8],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.8, -0.5],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "victor", pos: [-2.2, 0, -0.3], face: 1, action: "point", expr: "smug", heldItem: "paper" },
        { id: "comprador1", pos: [0.8, 0, 0.6], face: -1, action: "idle", expr: "happy", heldItem: "wrench" },
        { id: "comprador2", pos: [2.6, 0, -0.8], face: -1, action: "lean_in", expr: "smug", heldItem: "briefcase" },
      ],
      props3d: [
        { type: "desk", pos: [-0.8, 0, -1.5], scale: 0.9 },
      ],
    },
    // 13. Secreto del siglo (iluminación dramática oscura + viñeta)
    {
      start: 405,
      end: 436,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-2.8, 2.4, 5.2],
      camTo: [0.4, 2.2, 4.0],
      lookFrom: [0, 2.0, 0.2],
      lookTo: [0, 2.0, 0.2],
      fov: 36,
      punch: true,
      vignette: 0.45,
      speedLines: true,
      actors: [
        { id: "victor", pos: [-1.0, 0, 0.4], face: 1, action: "lean_in", expr: "evil_smug", bubble: "!" },
        { id: "comprador1", pos: [1.1, 0, 0.4], face: -1, action: "idle", expr: "shocked" },
      ],
      props3d: [
        { type: "orb", pos: [0, 3.6, 0.2], scale: 0.85 },
      ],
    },
    // 14. Extreme close-up cómico (caras enormes frente a frente!)
    {
      start: 436,
      end: 466,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.1, 5.2],
      camTo: [0, 2.3, 4.4],
      lookFrom: [0, 2.2, 0.3],
      lookTo: [0, 2.35, 0.3],
      fov: 42,
      rollFrom: -5,
      rollTo: 5,
      punch: true,
      vignette: 0.35,
      actors: [
        { id: "victor", pos: [-0.68, 0, 0.3], face: 1, action: "talk", expr: "smug", scale: 1.15 },
        { id: "comprador1", pos: [0.72, 0, 0.3], face: -1, action: "idle", expr: "dollar_eyes", scale: 1.15 },
      ],
    },
    // 15. "Todo ese hierro estaba en oferta!" (París brillante + cartel dorado)
    {
      start: 466,
      end: 517,
      stage: "paris_plaza",
      skyMode: "golden_hour",
      camFrom: [4.2, 3.5, 9.2],
      camTo: [-1.5, 3.0, 6.8],
      lookFrom: [0.5, 2.4, -1.5],
      lookTo: [0.5, 2.8, -2.0],
      fov: 46,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "victor", pos: [-2.0, 0, 0.8], face: 1, action: "point", expr: "smug", heldItem: "cane" },
        { id: "comprador1", pos: [2.0, 0, 0.8], face: -1, action: "celebrate", expr: "dollar_eyes", bubble: "$$" },
      ],
      props3d: [
        { type: "eiffel", pos: [0.6, 0, -3.8], scale: 1.05 },
        { type: "sign", pos: [0.4, 0.3, -1.2], label: "EN OFERTA", color: "#4CE88A", scale: 1.05 },
      ],
      fx: [
        { type: "sparkles", pos: [0.6, 4.5, -3.5], atFrame: 472, durFrames: 42, scale: 1.3 },
      ],
    },
    // 16. Montaña de dinero + lluvia de billetes + impacto!
    {
      start: 517,
      end: 556,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [3.2, 3.4, 8.8],
      camTo: [0.2, 3.2, 7.6],
      lookFrom: [0, 1.6, 0.3],
      lookTo: [0, 1.7, 0.3],
      fov: 46,
      punch: true,
      shakeAt: 538,
      flashAt: 538,
      speedLines: "intense",
      actors: [
        { id: "victor", pos: [-1.85, 0, 0.4], face: 1, action: "celebrate", expr: "dollar_eyes" },
        { id: "comprador1", pos: [1.85, 0, 0.4], face: -1, action: "point", expr: "happy", heldItem: "money" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.5], scale: 1.25 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 1.8, 0.5], atFrame: 538, durFrames: 20, scale: 1.2 },
      ],
    },
    // 17. Gag saco FRANCOS con cara deadpan en primer plano!
    {
      start: 556,
      end: 582,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-1.2, 2.1, 5.8],
      camTo: [0.3, 1.9, 4.6],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 42,
      rollFrom: 6,
      rollTo: -3,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.15, color: "#58B368", label: "FRANCOS", faceExpr: "deadpan" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.1, 0.5], atFrame: 558, durFrames: 22 },
      ],
      actors: [],
    },
    // 18. Víctor celebrando con maletín lleno!
    {
      start: 582,
      end: 608,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [-3.5, 2.5, 6.0],
      camTo: [0.5, 2.4, 5.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 42,
      camEase: "whip",
      actors: [
        { id: "victor", pos: [-0.3, 0, 0.3], face: 1, action: "laugh", expr: "laughing", heldItem: "briefcase", bubble: "$$" },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.2, 0.5], atFrame: 583, durFrames: 24 },
      ],
    },
    // 19. Llegaron camiones vintage de 1925 a París!
    {
      start: 608,
      end: 644,
      stage: "city_street",
      skyMode: "day_cyan",
      camFrom: [-8.5, 3.8, 10.5],
      camTo: [2.2, 3.2, 8.0],
      lookFrom: [-1.5, 1.8, -1.0],
      lookTo: [0.8, 1.8, -1.5],
      fov: 46,
      camEase: "whip",
      speedLines: true,
      actors: [
        { id: "comprador1", pos: [-3.8, 0, 1.4], toPos: [-0.4, 0, 1.2], face: 1, action: "run", expr: "happy", heldItem: "wrench" },
      ],
      props3d: [
        { type: "truck", pos: [-4.0, 0, -1.2], toPos: [1.8, 0, -1.2], scale: 1.05, color: "#4B7C59" },
        { type: "eiffel", pos: [2.8, 0, -5.0], scale: 0.95 },
      ],
      fx: [
        { type: "smoke", pos: [-1.5, 0.8, -1.2], atFrame: 616, durFrames: 24 },
      ],
    },
    // 20. Contrapicado Dutch tilt camión frenando frente a la Torre
    {
      start: 644,
      end: 680,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [5.5, 2.2, 7.5],
      camTo: [1.8, 2.6, 6.5],
      lookFrom: [0, 1.8, -1.0],
      lookTo: [0, 2.2, -1.8],
      fov: 46,
      rollFrom: -8,
      rollTo: 3,
      actors: [
        { id: "comprador1", pos: [-1.6, 0, 1.0], face: 1, action: "point", expr: "happy", heldItem: "paper" },
      ],
      props3d: [
        { type: "truck", pos: [1.4, 0, -0.5], rotY: -0.6, scale: 1.0, color: "#6E7682" },
        { type: "eiffel", pos: [0.4, 0, -4.5], scale: 1.0 },
      ],
    },
    // 21. SHOCK! Nadie sabía absolutamente nada!
    {
      start: 680,
      end: 708,
      stage: "paris_plaza",
      skyMode: "dramatic_dark",
      camFrom: [1.5, 2.6, 5.2],
      camTo: [0, 2.2, 3.7],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      punch: true,
      shakeAt: 682,
      flashAt: 682,
      speedLines: "intense",
      actors: [
        { id: "comprador1", pos: [0, 0, 0], face: 1, action: "panic", expr: "terrified", scale: 1.15, bubble: "!!" },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.8, -0.8], atFrame: 682, durFrames: 22, scale: 1.4 },
      ],
    },
    // 22. Contraste cómico deadpan: empleado parisino con "?" sin mover un músculo
    {
      start: 708,
      end: 734,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [-1.8, 2.3, 4.8],
      camTo: [0.2, 2.2, 3.8],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      punch: true,
      actors: [
        { id: "ciudadano", pos: [0, 0, 0], face: -1, action: "idle", expr: "deadpan", scale: 1.12, bubble: "?" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.8, 0, -4.5], scale: 0.9 },
      ],
    },
    // 23. Comprador se desploma con astillas de shock!
    {
      start: 734,
      end: 760,
      stage: "paris_plaza",
      skyMode: "dramatic_dark",
      camFrom: [-2.8, 2.6, 6.2],
      camTo: [1.0, 2.0, 5.0],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.3, 0],
      fov: 42,
      rollFrom: 6,
      rollTo: -6,
      shakeAt: 736,
      actors: [
        { id: "comprador1", pos: [0, 0, 0], face: -1, action: "fall", expr: "terrified" },
      ],
      fx: [
        { type: "splinters", pos: [0, 1.5, 0], atFrame: 736, durFrames: 24, scale: 1.0 },
      ],
    },
    // 24. Muerto de vergüenza en callejón oscuro de ladrillo
    {
      start: 760,
      end: 816,
      stage: "brick_corridor",
      skyMode: "dramatic_dark",
      camFrom: [-3.2, 2.6, 6.4],
      camTo: [-5.2, 3.4, 9.2],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 42,
      vignette: 0.65,
      actors: [
        { id: "comprador1", pos: [0, 0, 0], face: -1, action: "sneak", expr: "sweating", heldItem: "paper", bubble: "?" },
      ],
    },
    // 25. Calló la estafa para no quedar en ridículo (París atardecer púrpura)
    {
      start: 816,
      end: 872,
      stage: "paris_plaza",
      skyMode: "sunset_purple",
      camFrom: [4.2, 3.0, 7.6],
      camTo: [-1.8, 2.6, 6.8],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0.4, 2.0, -1.5],
      fov: 44,
      actors: [
        { id: "comprador1", pos: [-1.2, 0, 0.8], face: -1, action: "fall", expr: "deadpan" },
        { id: "ciudadano", pos: [2.4, 0, -0.8], toPos: [-3.5, 0, -0.8], face: -1, action: "run", expr: "laughing" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.8, 0, -4.2], scale: 0.95 },
      ],
    },
    // 26. Como nadie denunció... Víctor regresó UN MES DESPUÉS!
    {
      start: 872,
      end: 928,
      stage: "paris_plaza",
      skyMode: "day_cyan",
      camFrom: [6.2, 3.8, 10.6],
      camTo: [1.0, 2.8, 6.4],
      lookFrom: [0, 1.8, 0],
      lookTo: [-0.2, 1.9, 0],
      fov: 46,
      rollFrom: 8,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "victor", pos: [-3.8, 0, 0.6], toPos: [-0.4, 0, 0.6], face: 1, action: "celebrate", expr: "evil_smug", heldItem: "cane", bubble: "$$" },
      ],
      props3d: [
        { type: "eiffel", pos: [2.0, 0, -3.6], scale: 1.0 },
        { type: "sign", pos: [-2.8, 0.3, -1.8], label: "1 MES DESPUÉS", color: "#FFE169", scale: 0.95 },
      ],
      fx: [
        { type: "sparkles", pos: [-0.4, 2.2, 0.6], atFrame: 890, durFrames: 36 },
      ],
    },
    // 27. Mismo truco, nuevo contrato OFERTA 2
    {
      start: 928,
      end: 982,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-3.8, 2.6, 5.8],
      camTo: [0.6, 2.3, 4.4],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 40,
      punch: true,
      actors: [
        { id: "victor", pos: [-0.6, 0, 0.4], face: 1, action: "talk", expr: "evil_smug", heldItem: "paper" },
      ],
      props3d: [
        { type: "doc", pos: [1.2, 0.5, 0.4], label: "OFERTA 2", scale: 0.9, rotY: -0.35 },
      ],
    },
    // 28. Otra víctima distinta (Comprador 2 con bombín + gafas!)
    {
      start: 982,
      end: 1034,
      stage: "office_interior",
      skyMode: "sunset_purple",
      camFrom: [-4.5, 3.2, 8.0],
      camTo: [1.2, 2.6, 6.2],
      lookFrom: [0, 1.7, 0.2],
      lookTo: [0, 1.8, 0.2],
      fov: 44,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "victor", pos: [-1.8, 0, 0.5], face: 1, action: "point", expr: "smug", heldItem: "paper" },
        { id: "comprador2", pos: [1.8, 0, 0.5], face: -1, action: "lean_in", expr: "dollar_eyes", heldItem: "briefcase", bubble: "$$" },
      ],
      props3d: [
        { type: "desk", pos: [0, 0, -1.2], scale: 0.9 },
      ],
    },
    // 29. Segundo pago gigante + shake + lluvia de billetes!
    {
      start: 1034,
      end: 1082,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [2.8, 3.0, 6.8],
      camTo: [-0.5, 2.8, 5.4],
      lookFrom: [0, 1.6, 0.4],
      lookTo: [0, 1.8, 0.4],
      fov: 42,
      punch: true,
      shakeAt: 1038,
      flashAt: 1038,
      speedLines: true,
      actors: [
        { id: "victor", pos: [-1.7, 0, 0.5], face: 1, action: "laugh", expr: "laughing", bubble: "laugh" },
        { id: "comprador2", pos: [1.7, 0, 0.5], face: -1, action: "celebrate", expr: "happy", heldItem: "money" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.5], scale: 1.3 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 1.8, 0.5], atFrame: 1038, durFrames: 40, scale: 1.2 },
      ],
    },
    // 30. "¡Esta vez lo descubrieron!" Gendarmes + víctima furiosa en la calle!
    {
      start: 1082,
      end: 1128,
      stage: "city_street",
      skyMode: "dramatic_dark",
      camFrom: [-5.5, 3.2, 8.6],
      camTo: [1.5, 2.8, 6.2],
      lookFrom: [0, 1.8, 0.3],
      lookTo: [0, 1.9, 0.3],
      fov: 46,
      rollFrom: -7,
      rollTo: 5,
      punch: true,
      shakeAt: 1084,
      flashAt: 1084,
      speedLines: "intense",
      actors: [
        { id: "policia", pos: [-3.2, 0, 0.4], toPos: [-0.8, 0, 0.4], face: 1, action: "run", expr: "angry", bubble: "!!" },
        { id: "comprador2", pos: [1.2, 0, 0.5], face: -1, action: "panic", expr: "angry", bubble: "anger" },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.5, -0.5], atFrame: 1084, durFrames: 26, scale: 1.4 },
      ],
    },
    // 31. "...pero ya escapaba en barco!" -> AHORA SÍ escena marítima con trasatlántico!
    {
      start: 1128,
      end: 1174,
      stage: "ocean_deck",
      horizon: "ocean",
      skyMode: "sunset_purple",
      camFrom: [-4.5, 4.5, 13.5],
      camTo: [1.5, 4.2, 12.2],
      lookFrom: [-0.5, 2.0, -2.5],
      lookTo: [0.6, 2.0, -3.2],
      fov: 48,
      camEase: "whip",
      speedLines: true,
      actors: [
        { id: "policia", pos: [-2.6, 0, 1.2], face: 1, action: "panic", expr: "angry", bubble: "!!" },
        { id: "comprador2", pos: [-0.8, 0, 1.4], face: 1, action: "panic", expr: "terrified" },
      ],
      props3d: [
        { type: "ship", pos: [-1.2, 0.2, -6.2], toPos: [3.4, 0.2, -6.4], rotY: 0.15, scale: 1.05 },
      ],
      fx: [
        { type: "smoke", pos: [0.8, 4.2, -6.2], atFrame: 1132, durFrames: 38, scale: 1.0 },
      ],
    },
    // 32. Víctor muerto de risa sobre la cubierta del barco con billetes!
    {
      start: 1174,
      end: 1214,
      stage: "ocean_deck",
      horizon: "ocean",
      skyMode: "sunset_purple",
      camFrom: [-2.2, 2.6, 5.6],
      camTo: [0.8, 2.4, 4.2],
      lookFrom: [0, 2.0, 0.2],
      lookTo: [0, 2.1, 0.2],
      fov: 40,
      rollFrom: 6,
      rollTo: -4,
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "victor", pos: [0, 0, 0.4], face: 1, action: "laugh", expr: "laughing", heldItem: "money", scale: 1.15, bubble: "laugh" },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.0, 0.5], atFrame: 1176, durFrames: 36, scale: 1.3 },
      ],
    },
    // 33. "Si la mentira es gigante..." vuelta épica a París con Torre Eiffel dorada
    {
      start: 1214,
      end: 1266,
      stage: "paris_plaza",
      skyMode: "sunset_purple",
      camFrom: [3.2, 3.4, 9.2],
      camTo: [0.8, 3.8, 10.6],
      lookFrom: [-0.2, 2.2, -1.5],
      lookTo: [0, 2.8, -2.0],
      fov: 46,
      rollFrom: -4,
      rollTo: 0,
      punch: true,
      actors: [
        { id: "victor", pos: [-1.75, 0, 0.9], face: 1, action: "point", expr: "evil_smug", heldItem: "cane", scale: 1.05 },
      ],
      props3d: [
        { type: "eiffel", pos: [1.2, 0, -3.2], scale: 1.1 },
        { type: "money", pos: [1.4, 0, 1.0], scale: 1.4 },
        { type: "orb", pos: [1.2, 11.7, -3.2], scale: 0.85 },
      ],
      fx: [
        { type: "sparkles", pos: [1.4, 2.2, 1.0], atFrame: 1218, durFrames: 45 },
      ],
    },
    // 34. Remate final apoteósico: cartel 2X VENDIDA + lluvia de chispas y billetes!
    {
      start: 1266,
      end: 1322,
      stage: "paris_plaza",
      skyMode: "sunset_purple",
      camFrom: [0.8, 3.8, 10.6],
      camTo: [4.6, 5.4, 14.2],
      lookFrom: [0, 2.8, -2.0],
      lookTo: [0, 3.2, -2.2],
      fov: 48,
      actors: [
        { id: "victor", pos: [-1.8, 0, 0.9], face: 1, action: "celebrate", expr: "laughing", scale: 1.08, bubble: "$$" },
      ],
      props3d: [
        { type: "eiffel", pos: [1.2, 0, -3.2], scale: 1.12 },
        { type: "money", pos: [1.4, 0, 1.0], scale: 1.45 },
        { type: "sign", pos: [-2.2, 0.3, -1.6], label: "2X VENDIDA", color: "#FFE169", scale: 0.95 },
        { type: "orb", pos: [1.2, 11.9, -3.2], scale: 0.9 },
      ],
      fx: [
        { type: "flying_bills", pos: [1.2, 2.5, 0.8], atFrame: 1268, durFrames: 50, scale: 1.3 },
        { type: "sparkles", pos: [1.2, 5.5, -2.0], atFrame: 1270, durFrames: 50, scale: 1.4 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonTorreEiffel: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_TORRE_EIFFEL_SPEC} />;
};
