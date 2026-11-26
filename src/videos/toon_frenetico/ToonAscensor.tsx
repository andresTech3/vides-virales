import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Si tu ascensor empieza a caer,", startSec: 0.02, endSec: 1.77 },
  { text: "saltar justo antes de chocar es lo peor que puedes hacer.", startSec: 2.12, endSec: 5.63 },
  { text: "Cuando la cabina cae a ochenta kilómetros por hora,", startSec: 6.17, endSec: 8.75 },
  { text: "tú también caes a ochenta;", startSec: 9.06, endSec: 10.55 },
  { text: "así que si saltas con todas tus fuerzas,", startSec: 11.01, endSec: 13.36 },
  { text: "apenas restas un poquito y sigues cayendo como una piedra.", startSec: 13.63, endSec: 17.19 },
  { text: "Peor aún:", startSec: 17.66, endSec: 18.23 },
  { text: "como no puedes ver el fondo,", startSec: 18.68, endSec: 20.06 },
  { text: "si saltas medio segundo antes,", startSec: 20.32, endSec: 22.11 },
  { text: "te estampas la cabeza contra el techo justo cuando el ascensor frena.", startSec: 22.36, endSec: 25.88 },
  { text: "Y si te quedas parado con las piernas rectas,", startSec: 26.32, endSec: 28.51 },
  { text: "toda la fuerza del golpe sube directo a tus rodillas y tu espalda.", startSec: 28.91, endSec: 32.34 },
  { text: "Lo único que de verdad te salva es tirarte boca arriba en el suelo,", startSec: 32.79, endSec: 36.44 },
  { text: "proteger tu cabeza con los brazos y repartir el golpe por todo tu cuerpo.", startSec: 36.79, endSec: 40.78 },
  { text: "Y tú, ¿también creías que saltar te salvaba?", startSec: 41.33, endSec: 43.99 },
  { text: "Cuéntamelo en los comentarios y sígueme para el siguiente.", startSec: 44.49, endSec: 47.09 },
];

const ACCENTS: Record<string, string> = {
  "empieza a": "#FF5757",
  "a caer,": "#FF5757",
  "lo peor": "#FFE14D",
  "puedes hacer.": "#FF5757",
  "ochenta kilómetros": "#2CE6FF",
  "a ochenta;": "#2CE6FF",
  "una piedra.": "#FF9F43",
  "Peor aún:": "#FF5757",
  "el techo": "#FFE14D",
  "ascensor frena.": "#FF5757",
  "piernas rectas,": "#FF9F43",
  "tu espalda.": "#FF5757",
  "boca arriba": "#4CE88A",
  "tu cuerpo.": "#4CE88A",
  "te salvaba?": "#2CE6FF",
  "los comentarios": "#FFE14D",
  "el siguiente.": "#4CE88A",
};

function buildCaptions(): ToonCaption[] {
  const out: ToonCaption[] = [];
  for (const seg of SEGMENTS) {
    const words = seg.text.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
    const weights = chunks.map((c) => Math.max(3, c.replace(/[.,…:;¿?¡!]/g, "").length));
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

export const TOON_ASCENSOR_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1420,
  characters: {
    tu: {
      shirt: "#3B82F6",
      outfit: "casual",
      pants: "#1E293B",
      hair: "spiky",
      hairColor: "#F59E0B",
      glasses: false,
    },
    tecnico: {
      shirt: "#F97316",
      outfit: "overalls",
      pants: "#1E293B",
      hat: "flat_cap",
      hatColor: "#FACC15",
      glasses: true,
    },
  },
  shots: [
    // 1. Exterior del edificio con cabina cayendo: "Si tu ascensor empieza a caer,"
    {
      start: 0,
      end: 62,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      skyMode: "dramatic_dark",
      camFrom: [-4.2, 3.8, 10.6],
      camTo: [0, 3.2, 8.6],
      lookFrom: [0, 2.4, -0.5],
      lookTo: [0, 2.4, -0.5],
      fov: 48,
      rollFrom: -5,
      rollTo: 3,
      camEase: "whip",
      punch: true,
      shakeAt: 12,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.4, 0, 1.0], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "elevator_building", pos: [0.9, 0, -0.8], scale: 0.9 },
      ],
    },
    // 2. Cabina metálica por dentro: "saltar justo antes de chocar es lo peor que puedes hacer."
    {
      start: 62,
      end: 184,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#334155",
      wallColor: "#475569",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [2.4, 2.8, 7.6],
      camTo: [0, 2.5, 6.6],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      punch: true,
      flashAt: 66,
      shakeAt: 66,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.0, 0, 0.6], face: 1, action: "jump", expr: "shocked", bubble: "!!" },
        { id: "tecnico", pos: [1.0, 0, 0.5], face: -1, action: "point", expr: "angry", bubble: "!" },
      ],
    },
    // 3. Hueco oscuro cayendo: "Cuando la cabina cae a ochenta kilómetros por hora,"
    {
      start: 184,
      end: 270,
      stage: "industrial_yard",
      horizon: "elevator_shaft",
      floorStyle: "solid_grid",
      floorColor: "#0F172A",
      skyMode: "dramatic_dark",
      camFrom: [-3.2, 3.2, 8.2],
      camTo: [0.2, 2.6, 6.6],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      rollFrom: 6,
      rollTo: -4,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-0.9, 0, 0.7], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0.8, 0.6, -1.1], label: "80 KM/H", color: "#2CE6FF", scale: 0.75 },
      ],
    },
    // 4. Close-up extremo de caída: "tú también caes a ochenta;"
    {
      start: 270,
      end: 330,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#1E293B",
      wallColor: "#475569",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.5, 5.8],
      camTo: [0, 2.2, 4.7],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.0, 0],
      fov: 40,
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [0, 0, 0.4], face: 1, action: "fall", expr: "terrified", scale: 1.15, bubble: "!!" },
      ],
    },
    // 5. Salto explícito dentro de la cabina: "así que si saltas con todas tus fuerzas,"
    {
      start: 330,
      end: 408,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#334155",
      wallColor: "#64748B",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [-2.8, 2.2, 7.4],
      camTo: [0, 2.8, 6.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 2.2, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "tu", pos: [0, 0, 0.6], face: 1, action: "jump", expr: "angry", bubble: "!" },
      ],
      fx: [
        { type: "comic_star", pos: [0, 1.0, 0.6], atFrame: 342, durFrames: 22, scale: 0.85 },
      ],
    },
    // 6. "...apenas restas un poquito..." (Cabina cayendo por fuera)
    {
      start: 408,
      end: 465,
      stage: "industrial_yard",
      horizon: "elevator_shaft",
      floorStyle: "solid_grid",
      floorColor: "#0F172A",
      skyMode: "dramatic_dark",
      camFrom: [2.8, 3.0, 8.2],
      camTo: [0, 2.6, 7.2],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.0, 0],
      fov: 46,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.1, 0, 0.6], face: 1, action: "fall", expr: "deadpan", bubble: "?" },
      ],
      props3d: [
        { type: "elevator_building", pos: [0.9, 0, -0.6], scale: 0.8 },
      ],
    },
    // 7. "...y sigues cayendo como una piedra."
    {
      start: 465,
      end: 525,
      stage: "industrial_yard",
      horizon: "elevator_shaft",
      floorStyle: "solid_grid",
      floorColor: "#1C1917",
      skyMode: "dramatic_dark",
      camFrom: [-2.4, 2.6, 7.4],
      camTo: [0, 2.4, 6.4],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 45,
      shakeAt: 495,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.0, 0, 0.6], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "crate", pos: [0.9, 3.6, 0.3], toPos: [0.9, 0, 0.3], color: "#78716C", scale: 1.0, faceExpr: "deadpan" },
      ],
      fx: [
        { type: "smoke", pos: [0.9, 0.6, 0.3], atFrame: 495, durFrames: 26, scale: 1.1 },
      ],
    },
    // 8. "Peor aún: como no puedes ver el fondo," (Puertas cerradas a oscuras)
    {
      start: 525,
      end: 608,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#09090B",
      wallColor: "#1E293B",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [0, 2.6, 7.2],
      camTo: [0, 2.4, 6.5],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 45,
      punch: true,
      flashAt: 530,
      shakeAt: 530,
      actors: [
        { id: "tu", pos: [-0.9, 0, 0.6], face: 1, action: "panic", expr: "shocked", bubble: "?" },
        { id: "tecnico", pos: [0.9, 0, 0.5], face: -1, action: "talk", expr: "deadpan", bubble: "!!" },
      ],
    },
    // 9. "si saltas medio segundo antes," (Salto hacia el techo)
    {
      start: 608,
      end: 670,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#334155",
      wallColor: "#475569",
      skyMode: "dramatic_dark",
      camFrom: [-2.4, 2.2, 7.0],
      camTo: [0, 2.7, 6.2],
      lookFrom: [0, 1.9, 0],
      lookTo: [0, 2.3, 0],
      fov: 45,
      rollFrom: -4,
      rollTo: 5,
      customBlocks: [
        { shape: "box", pos: [0, 4.2, 0.4], size: [5.5, 0.7, 2.6], color: "#64748B", accent: "#EF4444" },
      ],
      actors: [
        { id: "tu", pos: [0, 0, 0.6], face: 1, action: "jump", expr: "shocked", bubble: "!" },
      ],
    },
    // 10. LITERAL SIN CARTEL: "te estampas la cabeza contra el techo justo cuando el ascensor frena."
    {
      start: 670,
      end: 788,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#450A0A",
      wallColor: "#64748B",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [2.0, 2.8, 7.0],
      camTo: [0, 2.6, 5.9],
      lookFrom: [0, 2.2, 0],
      lookTo: [0, 2.2, 0],
      fov: 45,
      punch: true,
      flashAt: 674,
      shakeAt: 674,
      speedLines: "intense",
      customBlocks: [
        { shape: "box", pos: [0, 3.65, 0.5], size: [5.2, 0.85, 2.5], color: "#94A3B8", accent: "#EF4444" },
      ],
      actors: [
        { id: "tu", pos: [0, 0.35, 0.5], face: 1, action: "head_bump", expr: "terrified", scale: 1.1, bubble: "!!" },
      ],
      fx: [
        { type: "boom", pos: [0, 3.0, 0.5], atFrame: 674, durFrames: 26, scale: 1.15 },
        { type: "splinters", pos: [0, 3.0, 0.5], atFrame: 674, durFrames: 42, scale: 1.1 },
      ],
    },
    // 11. "Y si te quedas parado con las piernas rectas,"
    {
      start: 788,
      end: 865,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#1E293B",
      wallColor: "#64748B",
      skyMode: "dramatic_dark",
      camFrom: [-3.2, 2.8, 7.6],
      camTo: [0, 2.4, 6.5],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 45,
      camEase: "whip",
      actors: [
        { id: "tu", pos: [-0.9, 0, 0.6], face: 1, action: "idle", expr: "shocked", bubble: "?" },
        { id: "tecnico", pos: [0.9, 0, 0.5], face: -1, action: "point", expr: "angry", bubble: "!" },
      ],
    },
    // 12. RADIOGRAFÍA EXPLÍCITA RODILLA PARTIÉNDOSE: "toda la fuerza del golpe sube directo a tus rodillas..."
    {
      start: 865,
      end: 925,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#450A0A",
      wallColor: "#334155",
      skyMode: "dramatic_dark",
      camFrom: [1.8, 2.5, 8.2],
      camTo: [0, 2.4, 7.4],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 46,
      punch: true,
      shakeAt: 874,
      flashAt: 874,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.05, 0, 0.5], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "xray_knee", pos: [0.75, 0.1, 0.3], scale: 0.84 },
      ],
      fx: [
        { type: "boom", pos: [0.75, 1.5, 0.6], atFrame: 874, durFrames: 24, scale: 0.9 },
      ],
    },
    // 13. RADIOGRAFÍA EXPLÍCITA COLUMNA QUEBRÁNDOSE: "...y tu espalda."
    {
      start: 925,
      end: 982,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#450A0A",
      wallColor: "#1E293B",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [-1.8, 2.5, 8.2],
      camTo: [0, 2.4, 7.4],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 46,
      punch: true,
      shakeAt: 932,
      flashAt: 932,
      speedLines: "intense",
      actors: [
        { id: "tu", pos: [-1.05, 0, 0.5], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "xray_spine", pos: [0.75, 0.1, 0.3], scale: 0.84 },
      ],
      fx: [
        { type: "boom", pos: [0.75, 1.5, 0.6], atFrame: 932, durFrames: 24, scale: 0.9 },
      ],
    },
    // 14. LITERAL ACOSTADO BOCA ARRIBA: "Lo único que de verdad te salva es tirarte boca arriba en el suelo,"
    {
      start: 982,
      end: 1102,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#064E3B",
      wallColor: "#64748B",
      skyMode: "day_cyan",
      camFrom: [-3.2, 2.8, 7.8],
      camTo: [0, 2.4, 6.5],
      lookFrom: [0, 1.2, 0],
      lookTo: [0, 1.1, 0],
      fov: 46,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "tu", pos: [-0.4, 0, 0.7], face: 1, action: "lying", expr: "happy", scale: 1.05, bubble: "!" },
        { id: "tecnico", pos: [1.3, 0, 0.3], face: -1, action: "point", expr: "happy" },
      ],
      fx: [
        { type: "comic_star", pos: [-0.4, 1.5, 0.8], atFrame: 995, durFrames: 26, scale: 0.85 },
      ],
    },
    // 15. ZOOM PROTEGIENDO LA CABEZA: "proteger tu cabeza con los brazos y repartir el golpe por todo tu cuerpo."
    {
      start: 1102,
      end: 1236,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#065F46",
      wallColor: "#64748B",
      skyMode: "day_cyan",
      camFrom: [2.6, 2.4, 7.0],
      camTo: [0, 2.1, 5.8],
      lookFrom: [0, 1.1, 0.4],
      lookTo: [0, 1.1, 0.4],
      fov: 44,
      speedLines: true,
      actors: [
        { id: "tu", pos: [0, 0, 0.6], face: 1, action: "lying", expr: "happy", scale: 1.15, bubble: "!" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 1.3, 0.6], atFrame: 1115, durFrames: 55, scale: 1.1 },
      ],
    },
    // 16. CTA EN 2.ª PERSONA: "Y tú, ¿también creías que saltar te salvaba?"
    {
      start: 1236,
      end: 1325,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#1E293B",
      wallColor: "#475569",
      skyMode: "day_cyan",
      camFrom: [0, 2.8, 7.6],
      camTo: [0, 2.5, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 45,
      punch: true,
      actors: [
        { id: "tu", pos: [0, 0, 0.6], face: 1, action: "talk", expr: "shocked", scale: 1.05, bubble: "?" },
      ],
    },
    // 17. CTA FINAL: "Cuéntamelo en los comentarios y sígueme para el siguiente."
    {
      start: 1325,
      end: 1420,
      stage: "office_interior",
      horizon: "elevator_cabin",
      floorStyle: "solid_grid",
      floorColor: "#1E293B",
      wallColor: "#475569",
      skyMode: "day_cyan",
      camFrom: [-1.8, 2.7, 7.6],
      camTo: [0, 2.6, 6.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      punch: true,
      speedLines: true,
      actors: [
        { id: "tu", pos: [-0.95, 0, 0.6], face: 1, action: "celebrate", expr: "laughing", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0.65, 0.5, -1.0], label: "COMENTA!", color: "#FFE14D", scale: 0.72 },
      ],
      fx: [
        { type: "comic_star", pos: [0.7, 2.3, -0.5], atFrame: 1340, durFrames: 30, scale: 0.9 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonAscensor: React.FC = () => (
  <ToonFreneticoEngine spec={TOON_ASCENSOR_SPEC} />
);
