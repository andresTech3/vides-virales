import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "GTA seis tiene DOS protagonistas y puedes cambiar en cualquier momento.", startSec: 0.10, endSec: 4.20 },
  { text: "Lucía y Jason comparten la historia PERO tienen vidas separadas.", startSec: 4.70, endSec: 8.80 },
  { text: "Cuando no controlas a uno, el otro sigue viviendo su vida.", startSec: 9.30, endSec: 12.50 },
  { text: "Jason puede estar en un bar tomando whisky…", startSec: 13.00, endSec: 15.20 },
  { text: "…mientras Lucía escapa de la policía en un deportivo robado.", startSec: 15.60, endSec: 18.80 },
  { text: "Si cambias de personaje en medio de una persecución,", startSec: 19.20, endSec: 21.80 },
  { text: "HEREDAS las estrellas de búsqueda del otro.", startSec: 22.20, endSec: 24.00 },
  { text: "Rockstar confirmó: NO hay pantalla de carga al cambiar.", startSec: 24.50, endSec: 27.30 },
  { text: "El mapa de Leónida es TRES veces Vice City original.", startSec: 27.80, endSec: 30.60 },
  { text: "Pantanos, playas, ciudad neón y Cayo Perico incluido.", startSec: 31.00, endSec: 33.80 },
  { text: "¿Jugarías solo con Lucía o cambias constante a Jason?", startSec: 34.20, endSec: 37.50 },
];

const ACCENTS: Record<string, string> = {
  "GTA seis": "#FF4DC4",
  "DOS protagonistas": "#FFE14D",
  "cambiar en": "#2CE6FF",
  "Lucía y Jason": "#FF4DC4",
  "vidas separadas.": "#FF5757",
  "sigue viviendo": "#4CE88A",
  "un bar": "#FFE169",
  "whisky…": "#FFE169",
  "escapa de": "#FF5757",
  "deportivo robado.": "#2CE6FF",
  "cambias de": "#FFE14D",
  "HEREDAS las": "#FF5757",
  "estrellas de": "#FFE14D",
  "otro.": "#FF5757",
  "Rockstar confirmó:": "#FF4DC4",
  "NO hay": "#FF5757",
  "cambiar.": "#2CE6FF",
  "TRES veces": "#FFE14D",
  "Vice City": "#2CE6FF",
  "Pantanos,": "#4CE88A",
  "playas,": "#2CE6FF",
  "ciudad neón": "#FF4DC4",
  "Cayo Perico": "#FFE14D",
  "¿Jugarías": "#FFE14D",
  "solo con": "#2CE6FF",
  "cambias constante": "#FF5757",
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

export const TOON_GTA6_DUAL_PROTA_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1125,
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
  },
  shots: [
    // 1. Hook: Pantalla partida GTA 6 - DOS protagonistas
    {
      start: 0,
      end: 42,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-5.5, 3.8, 11.0],
      camTo: [0, 3.0, 7.5],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 46,
      rollFrom: -6,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-2.2, 0, 0.8], face: 1, action: "point", expr: "shocked", bubble: "!!" },
        { id: "jason", pos: [2.2, 0, 0.8], face: -1, action: "point", expr: "smug", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.6, -2.0], label: "GTA 6", color: "#FF4DC4", scale: 1.15 },
        { type: "sign", pos: [0, 1.2, -2.5], label: "2 PROTAGONISTAS", color: "#FFE14D", scale: 1.0 },
      ],
      fx: [
        { type: "comic_star", pos: [-2.2, 2.5, -0.5], atFrame: 4, durFrames: 20, scale: 0.8 },
        { type: "comic_star", pos: [2.2, 2.5, -0.5], atFrame: 4, durFrames: 20, scale: 0.8 },
      ],
    },
    // 2. "Lucía y Jason comparten la historia PERO..." (Split screen concept)
    {
      start: 42,
      end: 90,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [0, 3.2, 8.5],
      camTo: [0.2, 2.8, 6.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 42,
      rollFrom: 4,
      rollTo: -4,
      camEase: "whip",
      punch: true,
      shakeAt: 46,
      actors: [
        { id: "lucia", pos: [-2.5, 0, 0.6], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
        { id: "jason", pos: [2.5, 0, 0.6], face: -1, action: "laugh", expr: "laughing", heldItem: "briefcase", bubble: "!" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, 0.2], scale: 1.2 },
        { type: "sign", pos: [0, 0.4, -2.2], label: "HISTORIA COMPARTIDA", color: "#2CE6FF", scale: 0.9 },
      ],
    },
    // 3. "...tienen vidas separadas" (Oficinas separadas - Jason bar, Lucía persecución)
    {
      start: 90,
      end: 138,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-4.0, 3.0, 8.5],
      camTo: [0.4, 2.5, 6.5],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 44,
      camEase: "whip",
      actors: [
        { id: "jason", pos: [-1.5, 0, 0.5], face: 1, action: "talk", expr: "smug", heldItem: "phone", bubble: "?" },
      ],
      props3d: [
        { type: "desk", pos: [0, 0, -1.5], scale: 0.9, color: "#7D4829" },
        { type: "bottle", pos: [-0.8, 0, 0.2], color: "#D94E3B", scale: 0.8 },
        { type: "sign", pos: [1.5, 0.5, -1.2], label: "BAR VICE CITY", color: "#FFE169", scale: 0.85 },
      ],
    },
    // 4. "Jason puede estar en un bar tomando whisky…" (Close up whisky + Jason smug)
    {
      start: 138,
      end: 186,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [1.2, 2.0, 5.0],
      camTo: [0.2, 1.8, 3.8],
      lookFrom: [0, 1.3, 0],
      lookTo: [0, 1.4, 0],
      fov: 38,
      punch: true,
      rollFrom: -5,
      rollTo: 3,
      actors: [
        { id: "jason", pos: [0, 0, 0.3], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", scale: 1.1, bubble: "$$" },
      ],
      props3d: [
        { type: "bottle", pos: [1.2, 0, 0], color: "#D94E3B", scale: 1.0, rotY: 0.3 },
        { type: "sign", pos: [0, 0.3, -1.8], label: "WHISKY", color: "#FFE169", scale: 0.8 },
      ],
      fx: [
        { type: "sparkles", pos: [1.2, 2.0, 0.2], atFrame: 142, durFrames: 36, scale: 0.9 },
      ],
    },
    // 5. "…mientras Lucía escapa de la policía en un deportivo robado." (Vice City neon chase!)
    {
      start: 186,
      end: 234,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [6.5, 3.2, 9.5],
      camTo: [-3.8, 2.8, 7.2],
      lookFrom: [0, 1.4, 0],
      lookTo: [0.5, 1.5, 0],
      fov: 48,
      camEase: "whip",
      speedLines: "intense",
      shakeAt: 190,
      flashAt: 190,
      actors: [
        { id: "lucia", pos: [-1.2, 0.3, 1.2], toPos: [2.8, 0.3, 1.2], face: 1, action: "run", expr: "terrified", bubble: "!!" },
        { id: "policia", pos: [-4.5, 0, 0.8], toPos: [-1.2, 0, 0.8], face: 1, action: "run", expr: "angry" },
      ],
      props3d: [
        { type: "car", pos: [-3.0, 0, -0.5], toPos: [3.5, 0, -0.5], rotY: 0.15, scale: 1.1, color: "#E63946" },
        { type: "police_car", pos: [-2.5, 0, -1.8], toPos: [0.5, 0, -1.8], rotY: 0.15, scale: 1.0 },
        { type: "wanted_stars", pos: [0, 4.0, 0.5], scale: 0.85 },
      ],
      fx: [
        { type: "smoke", pos: [-3.0, 0.5, -0.2], atFrame: 190, durFrames: 36, scale: 1.1 },
        { type: "radar", pos: [-1.2, 1.6, 0.6], atFrame: 192, durFrames: 40, scale: 1.2 },
      ],
    },
    // 6. "Si cambias de personaje en medio de una persecución,"
    {
      start: 234,
      end: 276,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.5, 6.0],
      camTo: [0.2, 2.3, 4.5],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.1, 0],
      fov: 38,
      punch: true,
      shakeAt: 238,
      flashAt: 238,
      vignette: 0.5,
      actors: [
        { id: "lucia", pos: [-0.8, 0, 0.2], face: 1, action: "panic", expr: "shocked", scale: 1.15, bubble: "!!" },
        { id: "jason", pos: [0.8, 0, 0.2], face: -1, action: "panic", expr: "shocked", scale: 1.15, bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.4, -1.8], label: "CAMBIO INSTANTÁNEO", color: "#FF4DC4", scale: 1.0 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.5, -0.5], atFrame: 238, durFrames: 24, scale: 1.1 },
      ],
    },
    // 7. "HEREDAS las estrellas de búsqueda del otro." (Estrellas explotando + transferencia)
    {
      start: 276,
      end: 324,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [-2.0, 3.0, 7.5],
      camTo: [0.4, 2.6, 5.8],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.1, 0],
      fov: 42,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-1.5, 0, 0.6], face: 1, action: "point", expr: "angry", bubble: "!!" },
      ],
      props3d: [
        { type: "wanted_stars", pos: [0, 3.8, 0.3], scale: 1.2 },
        { type: "sign", pos: [1.5, 0.5, -1.5], label: "5 ESTRELLAS", color: "#FF5757", scale: 1.0 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 3.2, 0.2], atFrame: 280, durFrames: 24, scale: 1.3 },
        { type: "sparkles", pos: [0, 3.5, 0.3], atFrame: 280, durFrames: 40, scale: 1.2 },
      ],
    },
    // 8. "Rockstar confirmó: NO hay pantalla de carga al cambiar." (Cartel OFICIAL + sparkles)
    {
      start: 324,
      end: 372,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-1.8, 2.2, 5.5],
      camTo: [0.3, 2.0, 4.3],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      rollFrom: 5,
      rollTo: -3,
      punch: true,
      props3d: [
        { type: "doc", pos: [0, 0.5, 0], label: "CONFIRMADO", scale: 1.15 },
        { type: "sign", pos: [0, 1.2, -1.8], label: "0 PANTALLAS DE CARGA", color: "#4CE88A", scale: 0.95 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 1.8, 0.4], atFrame: 328, durFrames: 44 },
      ],
      actors: [],
    },
    // 9. "El mapa de Leónida es TRES veces Vice City original." (Mapa gigante extendido)
    {
      start: 372,
      end: 420,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [0, 8.0, 15.0],
      camTo: [0.5, 4.0, 8.0],
      lookFrom: [0, 1.0, -5.0],
      lookTo: [0, 1.5, -3.0],
      fov: 52,
      rollFrom: -8,
      rollTo: 0,
      camEase: "whip",
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-2.0, 0, 1.0], face: 1, action: "celebrate", expr: "shocked", bubble: "!" },
        { id: "jason", pos: [2.0, 0, 1.0], face: -1, action: "celebrate", expr: "smug", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.8, -3.0], label: "LEÓNIDA", color: "#FF4DC4", scale: 1.3 },
        { type: "sign", pos: [0, 1.6, -3.5], label: "3X VICE CITY", color: "#FFE14D", scale: 1.1 },
      ],
    },
    // 10. "Pantanos, playas, ciudad neón y Cayo Perico incluido." (Montaje rápido biomas)
    {
      start: 420,
      end: 468,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-5.0, 3.5, 9.0],
      camTo: [0.5, 2.8, 6.5],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [-1.5, 0, 0.5], face: 1, action: "point", expr: "happy", bubble: "!" },
        { id: "jason", pos: [1.5, 0, 0.5], face: -1, action: "point", expr: "smug" },
      ],
      props3d: [
        { type: "sign", pos: [-3.5, 0.4, -1.5], label: "PANTANOS", color: "#4CE88A", scale: 0.8 },
        { type: "sign", pos: [3.5, 0.4, -1.5], label: "PLAYAS", color: "#2CE6FF", scale: 0.8 },
        { type: "sign", pos: [0, 0.4, -1.0], label: "CIUDAD NEÓN", color: "#FF4DC4", scale: 0.9 },
        { type: "sign", pos: [0, 1.0, -2.2], label: "CAYO PERICO", color: "#FFE14D", scale: 0.85 },
      ],
    },
    // 11. "¿Jugarías solo con Lucía o cambias constante a Jason?" (Remate final split)
    {
      start: 468,
      end: 525,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [2.5, 3.0, 7.5],
      camTo: [5.5, 4.5, 12.5],
      lookFrom: [0, 2.0, -0.5],
      lookTo: [0, 2.2, -1.0],
      fov: 48,
      rollFrom: -4,
      rollTo: 0,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-1.8, 0, 0.8], face: 1, action: "point", expr: "shocked", bubble: "?" },
        { id: "jason", pos: [1.8, 0, 0.8], face: -1, action: "idle", expr: "smug", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.3, -2.5], label: "GTA 6", color: "#FF4DC4", scale: 1.2 },
        { type: "wanted_stars", pos: [0, 4.0, -1.5], scale: 0.8 },
        { type: "police_car", pos: [0.2, 0, -2.8], rotY: -0.2, scale: 1.0 },
      ],
      fx: [
        { type: "radar", pos: [-1.8, 1.6, 0.8], atFrame: 472, durFrames: 50, scale: 1.3 },
        { type: "sparkles", pos: [0, 2.5, -1.0], atFrame: 472, durFrames: 44, scale: 1.3 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6DualProta: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_DUAL_PROTA_SPEC} />;
};