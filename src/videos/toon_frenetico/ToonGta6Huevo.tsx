import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Rockstar escondió un huevo de Pascua en GTA seis.", startSec: 0.02, endSec: 3.18 },
  { text: "Literalmente.", startSec: 3.48, endSec: 4.46 },
  { text: "Un jugador vio una torre de comunicaciones gigante en Leonida y pensó:", startSec: 5.05, endSec: 9.19 },
  { text: "¿Qué habrá arriba?", startSec: 9.60, endSec: 10.29 },
  { text: "Empezó a trepar.", startSec: 10.82, endSec: 11.60 },
  { text: "Y trepar.", startSec: 12.05, endSec: 12.74 },
  { text: "Siete minutos escalando sin parar.", startSec: 13.17, endSec: 15.49 },
  { text: "Cuando por fin llegó a la cima,", startSec: 16.08, endSec: 17.63 },
  { text: "encontró un nido.", startSec: 17.85, endSec: 18.88 },
  { text: "Y dentro,", startSec: 19.29, endSec: 19.81 },
  { text: "huevos de colores.", startSec: 20.22, endSec: 21.22 },
  { text: "Sí,", startSec: 21.58, endSec: 21.88 },
  { text: "huevos de Pascua de verdad.", startSec: 22.24, endSec: 23.76 },
  { text: "Agarró uno, se acercó al borde y lo lanzó hacia la carretera.", startSec: 24.33, endSec: 27.84 },
  { text: "Y se activó una cinemática secreta.", startSec: 28.28, endSec: 30.30 },
  { text: "El huevo gira por el aire como un balón de fútbol americano,", startSec: 30.79, endSec: 33.79 },
  { text: "y aterriza justo en el coche de un tipo salido de la Vice City de los ochenta.", startSec: 34.23, endSec: 38.22 },
  { text: "¡Splat!", startSec: 38.58, endSec: 39.25 },
  { text: "Siete minutos de su vida", startSec: 39.64, endSec: 41.14 },
  { text: "por un chiste.", startSec: 41.28, endSec: 41.99 },
  { text: "Y es muy Rockstar.", startSec: 42.36, endSec: 43.57 },
  { text: "Eso sí,", startSec: 44.09, endSec: 44.48 },
  { text: "lo reportaron jugadores, no es algo oficial.", startSec: 44.83, endSec: 47.25 },
  { text: "Y siguen apareciendo secretos por todo el mapa.", startSec: 47.72, endSec: 50.22 },
  { text: "¿Tú subirías siete minutos por esto?", startSec: 50.73, endSec: 52.56 },
  { text: "Cuéntamelo en los comentarios y sígueme para la parte dos.", startSec: 53.05, endSec: 55.82 },
];

const ACCENTS: Record<string, string> = {
  "huevo de": "#FF4DC4",
  "GTA seis.": "#FF4DC4",
  "Literalmente.": "#FFE14D",
  "torre de": "#2CE6FF",
  "en Leonida": "#4CE88A",
  "habrá arriba?": "#FFE14D",
  "Siete minutos": "#FF9F43",
  "sin parar.": "#FF5757",
  "un nido.": "#FFE14D",
  "de colores.": "#2CE6FF",
  "de verdad.": "#FF4DC4",
  "la carretera.": "#FFE14D",
  "cinemática secreta.": "#C58AF9",
  "fútbol americano,": "#FF9F43",
  "Vice City": "#FF4DC4",
  "los ochenta.": "#2CE6FF",
  "¡Splat!": "#FF5757",
  "un chiste.": "#FFE14D",
  "muy Rockstar.": "#4CE88A",
  "algo oficial.": "#FF5757",
  "todo el": "#2CE6FF",
  "los comentarios": "#FFE14D",
  "parte dos.": "#4CE88A",
};

function buildCaptions(): ToonCaption[] {
  const out: ToonCaption[] = [];
  for (const seg of SEGMENTS) {
    const words = seg.text.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
    const weights = chunks.map((c) => Math.max(3, c.replace(/[.,…:¿?¡!]/g, "").length));
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

export const TOON_GTA6_HUEVO_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1681,
  characters: {
    jugador: {
      shirt: "#3B82F6",
      outfit: "casual",
      pants: "#1E293B",
      hair: "spiky",
      hairColor: "#F59E0B",
      glasses: false,
    },
    rockstar: {
      shirt: "#1E293B",
      outfit: "suit",
      pants: "#0F172A",
      tie: true,
      tieColor: "#EF4444",
      glasses: true,
    },
    ochentas: {
      shirt: "#EC4899",
      outfit: "casual",
      pants: "#F8FAFC",
      hair: "curly",
      hairColor: "#1F2937",
      glasses: true,
    },
  },
  shots: [
    // 1. "Rockstar escondió un huevo de Pascua en GTA seis."
    {
      start: 0,
      end: 104,
      stage: "vice_city",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#1A1033",
      skyMode: "vice_neon",
      camFrom: [-4.6, 3.2, 9.2],
      camTo: [0.2, 2.6, 7.0],
      lookFrom: [0, 1.8, -0.3],
      lookTo: [0, 1.8, -0.3],
      fov: 46,
      rollFrom: -5,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "jugador", pos: [-1.1, 0, 0.8], face: 1, action: "point", expr: "shocked", bubble: "?" },
      ],
      props3d: [
        { type: "orb", pos: [1.0, 0.7, 0.2], color: "#FF4DC4", scale: 1.0, faceExpr: "smug" },
        { type: "sign", pos: [1.0, 0.7, -1.6], label: "GTA 6", color: "#2CE6FF", scale: 0.95 },
      ],
    },
    // 2. "Literalmente." (Zoom extremo al huevo)
    {
      start: 104,
      end: 150,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "solid_grid",
      floorColor: "#2E1065",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.3, 5.6],
      camTo: [0, 2.0, 4.4],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 40,
      punch: true,
      shakeAt: 108,
      flashAt: 108,
      speedLines: "intense",
      actors: [],
      props3d: [
        { type: "orb", pos: [0, 0.6, 0], color: "#FFE14D", scale: 1.35, faceExpr: "deadpan" },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.4, 0], atFrame: 108, durFrames: 24, scale: 0.95 },
      ],
    },
    // 3. "Un jugador vio una torre de comunicaciones gigante en Leonida y pensó:"
    {
      start: 150,
      end: 285,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      skyMode: "day_cyan",
      camFrom: [-4.4, 3.0, 9.6],
      camTo: [0.3, 3.6, 8.2],
      lookFrom: [0, 2.2, -1.0],
      lookTo: [0, 3.0, -1.5],
      fov: 48,
      camEase: "whip",
      customBlocks: [
        { shape: "crane", pos: [1.5, 0, -2.2], size: [1.6, 7.5, 1.6], color: "#EF4444", accent: "#FFFFFF" },
      ],
      actors: [
        { id: "jugador", pos: [-1.1, 0, 0.9], face: 1, action: "talk", expr: "shocked", bubble: "?" },
      ],
      props3d: [
        { type: "sign", pos: [1.3, 0.5, -1.2], label: "TORRE", color: "#EF4444", scale: 0.9 },
      ],
    },
    // 4. "¿Qué habrá arriba?"
    {
      start: 285,
      end: 324,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "solid_grid",
      floorColor: "#0F172A",
      skyMode: "day_cyan",
      whipBlur: true,
      camFrom: [2.2, 2.4, 6.4],
      camTo: [0, 3.2, 5.4],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.4, 0],
      fov: 42,
      rollFrom: -7,
      rollTo: 5,
      punch: true,
      actors: [
        { id: "jugador", pos: [0, 0, 0.5], face: 1, action: "idle", expr: "shocked", bubble: "?" },
      ],
    },
    // 5. "Empezó a trepar. Y trepar."
    {
      start: 324,
      end: 395,
      stage: "industrial_yard",
      horizon: "city_blocks",
      floorStyle: "solid_grid",
      floorColor: "#1E293B",
      skyMode: "golden_hour",
      camFrom: [-3.8, 2.8, 7.6],
      camTo: [1.5, 3.6, 6.8],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 2.0, 0],
      fov: 46,
      speedLines: true,
      customBlocks: [
        { shape: "bars", pos: [-2.0, 0, -1.5], size: [1.4, 5.0, 1.0], color: "#DC2626", accent: "#F8FAFC", repeat: [3, 1, 2.2, 0] },
      ],
      actors: [
        { id: "jugador", pos: [0, 0, 0.6], face: 1, action: "run", expr: "angry" },
      ],
    },
    // 6. "Siete minutos escalando sin parar."
    {
      start: 395,
      end: 482,
      stage: "industrial_yard",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#0F172A",
      skyMode: "vice_neon",
      whipBlur: true,
      camFrom: [3.2, 3.8, 7.4],
      camTo: [-1.2, 3.0, 6.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 45,
      rollFrom: 7,
      rollTo: -5,
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "jugador", pos: [-0.9, 0, 0.7], face: 1, action: "run", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.6, -1.0], label: "7 MIN", color: "#FF9F43", scale: 0.95 },
      ],
    },
    // 7. "Cuando por fin llegó a la cima, encontró un nido. Y dentro,"
    {
      start: 482,
      end: 606,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#78350F",
      floorAccent: "#F59E0B",
      skyMode: "golden_hour",
      camFrom: [-3.6, 3.2, 8.2],
      camTo: [0, 2.7, 6.8],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 46,
      camEase: "whip",
      customBlocks: [
        { shape: "box", pos: [1.0, 0, -0.5], size: [2.6, 0.9, 2.2], color: "#92400E", accent: "#D97706" },
      ],
      actors: [
        { id: "jugador", pos: [-1.1, 0, 0.7], face: 1, action: "celebrate", expr: "shocked", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.6, -1.8], label: "NIDO!", color: "#FFE14D", scale: 0.9 },
      ],
    },
    // 8. "huevos de colores. Sí,"
    {
      start: 606,
      end: 666,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#78350F",
      floorAccent: "#FBBF24",
      skyMode: "golden_hour",
      camFrom: [0.4, 2.6, 7.2],
      camTo: [0, 2.3, 6.2],
      lookFrom: [0, 1.3, 0],
      lookTo: [0, 1.3, 0],
      fov: 46,
      punch: true,
      flashAt: 612,
      actors: [],
      props3d: [
        { type: "orb", pos: [-1.0, 0.6, 0.2], color: "#FF4DC4", scale: 0.78 },
        { type: "orb", pos: [0, 0.7, -0.2], color: "#2CE6FF", scale: 0.85 },
        { type: "orb", pos: [1.0, 0.6, 0.2], color: "#4CE88A", scale: 0.78 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.1, 0], atFrame: 612, durFrames: 24, scale: 0.85 },
      ],
    },
    // 9. "huevos de Pascua de verdad."
    {
      start: 666,
      end: 730,
      stage: "office_interior",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#3B0764",
      skyMode: "vice_neon",
      camFrom: [0, 2.3, 5.4],
      camTo: [0, 2.1, 4.3],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      punch: true,
      shakeAt: 670,
      speedLines: "intense",
      actors: [],
      props3d: [
        { type: "orb", pos: [0, 0.6, 0], color: "#FF4DC4", scale: 1.3, faceExpr: "smug" },
      ],
    },
    // 10. "Agarró uno, se acercó al borde y lo lanzó hacia la carretera."
    {
      start: 730,
      end: 848,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      skyMode: "golden_hour",
      whipBlur: true,
      camFrom: [-4.0, 3.4, 8.6],
      camTo: [0.5, 2.8, 6.8],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "jugador", pos: [-1.1, 0, 0.6], face: 1, action: "point", expr: "laughing", bubble: "!" },
      ],
      props3d: [
        { type: "orb", pos: [-0.2, 1.6, 0.5], toPos: [2.2, 3.2, -1.5], color: "#FFE14D", scale: 0.7 },
      ],
    },
    // 11. "Y se activó una cinemática secreta."
    {
      start: 848,
      end: 924,
      stage: "vice_city",
      horizon: "neon_alley",
      floorStyle: "diamond_carpet",
      floorColor: "#311042",
      floorAccent: "#FF4DC4",
      skyMode: "dramatic_dark",
      camFrom: [2.8, 2.8, 7.2],
      camTo: [0, 2.4, 5.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 44,
      punch: true,
      flashAt: 852,
      shakeAt: 852,
      speedLines: "intense",
      actors: [
        { id: "jugador", pos: [-1.0, 0, 0.7], face: 1, action: "panic", expr: "shocked", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0.9, 0.6, -1.0], label: "SECRETO", color: "#C58AF9", scale: 0.9 },
      ],
    },
    // 12. "El huevo gira por el aire como un balón de fútbol americano,"
    {
      start: 924,
      end: 1026,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "solid_grid",
      floorColor: "#0284C7",
      skyMode: "day_cyan",
      camFrom: [-3.2, 2.8, 6.8],
      camTo: [2.4, 2.4, 6.4],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 1.8, 0],
      fov: 44,
      rollFrom: -5,
      rollTo: 5,
      speedLines: "intense",
      actors: [],
      props3d: [
        { type: "orb", pos: [-1.8, 2.4, 0.4], toPos: [1.8, 1.4, 0.4], color: "#FF9F43", scale: 1.0, faceExpr: "deadpan" },
      ],
    },
    // 13. "y aterriza justo en el coche de un tipo salido de la Vice City de los ochenta."
    {
      start: 1026,
      end: 1156,
      stage: "vice_city",
      horizon: "vice_city",
      floorStyle: "crosswalk_city",
      skyMode: "vice_neon",
      camFrom: [-3.8, 3.0, 8.4],
      camTo: [0, 2.5, 6.8],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "ochentas", pos: [-1.3, 0, 0.8], face: 1, action: "talk", expr: "happy", bubble: "!" },
      ],
      props3d: [
        { type: "car", pos: [0.7, 0, 0.4], color: "#FF4DC4", scale: 0.95 },
        { type: "orb", pos: [0.7, 5.2, 0.4], toPos: [0.7, 1.3, 0.4], color: "#FFE14D", scale: 0.7 },
      ],
    },
    // 14. "¡Splat! Siete minutos de su vida por un chiste."
    {
      start: 1156,
      end: 1270,
      stage: "vice_city",
      horizon: "vice_city",
      floorStyle: "asphalt_road",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [1.8, 2.8, 8.2],
      camTo: [0, 2.6, 7.2],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 48,
      punch: true,
      flashAt: 1160,
      shakeAt: 1160,
      speedLines: "intense",
      actors: [
        { id: "ochentas", pos: [-1.1, 0, 0.7], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "car", pos: [0.7, 0, 0.4], color: "#FF4DC4", scale: 0.9 },
        { type: "sign", pos: [0.5, 0.7, -1.4], label: "SPLAT!", color: "#FF5757", scale: 0.85 },
      ],
      fx: [
        { type: "boom", pos: [0.7, 1.5, 0.4], atFrame: 1160, durFrames: 26, scale: 1.1 },
        { type: "splinters", pos: [0.7, 1.5, 0.4], atFrame: 1160, durFrames: 45, scale: 1.1 },
      ],
    },
    // 15. "Y es muy Rockstar. Eso sí, lo reportaron jugadores, no es algo oficial."
    {
      start: 1270,
      end: 1430,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#1E1B4B",
      floorAccent: "#F59E0B",
      wallColor: "#E2E8F0",
      skyMode: "interior_warm",
      camFrom: [-3.6, 3.0, 8.2],
      camTo: [0, 2.6, 6.8],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "rockstar", pos: [-1.0, 0, 0.6], face: 1, action: "laugh", expr: "evil_smug", bubble: "JA!" },
      ],
      props3d: [
        { type: "desk", pos: [1.0, 0, -0.8], scale: 0.85, color: "#475569" },
        { type: "doc", pos: [1.0, 0.6, 0.2], label: "RUMOR", scale: 0.95, rotY: -0.3 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.2, 0.4], atFrame: 1285, durFrames: 90, scale: 1.0 },
      ],
    },
    // 16. "Y siguen apareciendo secretos por todo el mapa."
    {
      start: 1430,
      end: 1522,
      stage: "city_street",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#141626",
      skyMode: "vice_neon",
      camFrom: [3.4, 2.8, 7.8],
      camTo: [0, 2.5, 6.6],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "jugador", pos: [-1.0, 0, 0.7], face: 1, action: "point", expr: "shocked", bubble: "?" },
      ],
      props3d: [
        { type: "sign", pos: [0.9, 0.6, -1.1], label: "MAPA GTA 6", color: "#2CE6FF", scale: 0.9 },
      ],
      fx: [
        { type: "radar", pos: [0.9, 1.6, -0.6], atFrame: 1440, durFrames: 65, scale: 1.0 },
      ],
    },
    // 17. CTA OBLIGATORIO: "¿Tú subirías siete minutos por esto? Cuéntamelo en los comentarios y sígueme para la parte dos."
    {
      start: 1522,
      end: 1681,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#065F46",
      floorAccent: "#34D399",
      skyMode: "day_cyan",
      camFrom: [0, 2.8, 7.8],
      camTo: [0, 2.6, 6.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      punch: true,
      speedLines: true,
      actors: [
        { id: "jugador", pos: [-0.95, 0, 0.6], face: 1, action: "celebrate", expr: "laughing", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0.65, 0.5, -1.0], label: "COMENTA!", color: "#FFE14D", scale: 0.72 },
      ],
      fx: [
        { type: "comic_star", pos: [0.7, 2.3, -0.5], atFrame: 1550, durFrames: 30, scale: 0.9 },
        { type: "flying_bills", pos: [0, 2.3, 0.4], atFrame: 1530, durFrames: 110, scale: 1.0 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Huevo: React.FC = () => (
  <ToonFreneticoEngine spec={TOON_GTA6_HUEVO_SPEC} />
);

