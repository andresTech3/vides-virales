import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Para instalar GTA seis vas a tener que borrar casi todo.", startSec: 0.12, endSec: 3.25 },
  { text: "El juego pesa doscientos doce gigas en consola desde el primer día.", startSec: 3.54, endSec: 7.12 },
  { text: "Millones de jugadores entraron a descargarlo exactamente al mismo minuto.", startSec: 7.57, endSec: 11.78 },
  { text: "Las consolas echaban humo y los servidores de internet casi explotan.", startSec: 12.30, endSec: 15.63 },
  { text: "Algunos tuvieron que esperar días enteros mirando el uno por ciento.", startSec: 16.07, endSec: 19.89 },
  { text: "Y otros borraron cinco juegos completos solo para hacer espacio.", startSec: 20.22, endSec: 23.66 },
  { text: "¿Cuántos juegos tendrías que sacrificar en tu consola ahora mismo?", startSec: 24.21, endSec: 27.60 },
];

const ACCENTS: Record<string, string> = {
  "GTA seis": "#FF4DC4",
  "casi todo.": "#FF5757",
  "doscientos doce": "#FFE14D",
  "gigas en": "#FFE14D",
  "primer día.": "#4CE88A",
  "mismo minuto.": "#2CE6FF",
  "echaban humo": "#FF5757",
  "casi explotan.": "#FF5757",
  "días enteros": "#FFE14D",
  "por ciento.": "#FF5757",
  "cinco juegos": "#FFE14D",
  "hacer espacio.": "#4CE88A",
  "ahora mismo?": "#FFE14D",
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

export const TOON_GTA6_DESCARGA_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 840,
  characters: {
    gamer: {
      shirt: "#7A3EB1",
      outfit: "casual",
      pants: "#1D2230",
      hair: "spiky",
      hairColor: "#241914",
      glasses: true,
    },
    amigo: {
      shirt: "#3FA9A1",
      outfit: "casual",
      pants: "#272C38",
      hat: "cap",
      hatColor: "#D93B3B",
    },
  },
  shots: [
    // 1. Setup gamer ilusionado con cartel GTA 6
    {
      start: 0,
      end: 48,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-4.8, 3.2, 8.6],
      camTo: [-0.8, 2.5, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      rollFrom: -5,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "gamer", pos: [-1.2, 0, 0.7], face: 1, action: "celebrate", expr: "happy", heldItem: "phone", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [1.1, 0.5, -1.6], label: "GTA 6", color: "#FF4DC4", scale: 1.05 },
        { type: "desk", pos: [0, 0, -2.5], scale: 0.9 },
      ],
    },
    // 2. "...vas a tener que borrar casi todo!" (Astillas + pánico + shake!)
    {
      start: 48,
      end: 104,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [2.8, 2.8, 6.8],
      camTo: [-0.2, 2.5, 5.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 44,
      punch: true,
      shakeAt: 52,
      flashAt: 52,
      speedLines: "intense",
      actors: [
        { id: "gamer", pos: [0, 0, 0.5], face: 1, action: "panic", expr: "terrified", scale: 1.12, bubble: "!!" },
      ],
      props3d: [
        { type: "crate", pos: [-1.8, 0, -1.6], label: "SSD LLENO", color: "#FF5757" },
      ],
      fx: [
        { type: "splinters", pos: [0, 1.8, 0], atFrame: 52, durFrames: 34, scale: 1.1 },
      ],
    },
    // 3. "El juego pesa 212 gigas..." (Cartel enorme 212 GB + explosión cómica)
    {
      start: 104,
      end: 158,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-4.2, 3.2, 8.8],
      camTo: [0.4, 2.6, 6.2],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      punch: true,
      shakeAt: 108,
      actors: [
        { id: "gamer", pos: [-1.6, 0, 0.8], face: 1, action: "point", expr: "shocked" },
        { id: "amigo", pos: [1.6, 0, 0.8], face: -1, action: "panic", expr: "shocked", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.5, -1.8], label: "212 GB", color: "#FFE14D", scale: 1.15 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.6, -1.2], atFrame: 108, durFrames: 26, scale: 0.9 },
      ],
    },
    // 4. "...en consola desde el primer día!" (Gag saco gigante 212 GB con cara shocked!)
    {
      start: 158,
      end: 218,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [0, 2.3, 6.4],
      camTo: [0.2, 2.1, 5.2],
      lookFrom: [0, 1.35, 0],
      lookTo: [0, 1.35, 0],
      fov: 42,
      rollFrom: -6,
      rollTo: 4,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.12, color: "#FFE14D", label: "212 GB", faceExpr: "shocked" },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.4], atFrame: 162, durFrames: 42 },
      ],
      actors: [],
    },
    // 5. "Millones de jugadores entraron a descargarlo..." (Carrera caótica calle!)
    {
      start: 218,
      end: 288,
      stage: "city_street",
      skyMode: "day_cyan",
      camFrom: [-6.5, 3.6, 10.2],
      camTo: [2.5, 3.0, 8.0],
      lookFrom: [0, 1.8, 0],
      lookTo: [0.4, 1.9, 0],
      fov: 48,
      camEase: "whip",
      speedLines: true,
      actors: [
        { id: "gamer", pos: [-2.6, 0, 1.0], toPos: [1.0, 0, 1.0], face: 1, action: "run", expr: "shocked", heldItem: "phone" },
        { id: "amigo", pos: [2.2, 0, 0.4], toPos: [-1.8, 0, 0.4], face: -1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.4, -2.2], label: "MILLONES", color: "#2CE6FF", scale: 1.1 },
      ],
    },
    // 6. "...exactamente al mismo minuto!" (Close-up doble tensión + radar!)
    {
      start: 288,
      end: 356,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [0, 2.1, 5.4],
      camTo: [0, 2.3, 4.4],
      lookFrom: [0, 2.1, 0.2],
      lookTo: [0, 2.2, 0.2],
      fov: 42,
      punch: true,
      shakeAt: 292,
      actors: [
        { id: "gamer", pos: [-0.72, 0, 0.2], face: 1, action: "panic", expr: "terrified", scale: 1.12, heldItem: "phone" },
        { id: "amigo", pos: [0.72, 0, 0.2], face: -1, action: "panic", expr: "shocked", scale: 1.12, bubble: "!" },
      ],
      fx: [
        { type: "radar", pos: [0, 2.0, 0.4], atFrame: 292, durFrames: 55, scale: 1.0 },
      ],
    },
    // 7. "Las consolas echaban humo..." (Fuego + humo denso + shake!)
    {
      start: 356,
      end: 416,
      stage: "brick_corridor",
      skyMode: "dramatic_dark",
      camFrom: [4.2, 3.0, 8.2],
      camTo: [-0.5, 2.5, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 45,
      camEase: "whip",
      punch: true,
      shakeAt: 362,
      actors: [
        { id: "gamer", pos: [-1.5, 0, 0.8], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "crate", pos: [1.0, 0, -0.4], label: "CONSOLA", color: "#2D3342", scale: 1.1 },
      ],
      fx: [
        { type: "flames", pos: [1.0, 1.4, -0.4], atFrame: 358, durFrames: 56, scale: 1.1 },
        { type: "smoke", pos: [1.0, 2.4, -0.4], atFrame: 362, durFrames: 50, scale: 1.1 },
      ],
    },
    // 8. "...y los servidores de internet casi explotan!" (BOOM + plume + flash!)
    {
      start: 416,
      end: 474,
      stage: "brick_corridor",
      skyMode: "dramatic_dark",
      camFrom: [-2.6, 2.8, 8.4],
      camTo: [0.0, 3.0, 9.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 46,
      rollFrom: -7,
      rollTo: 5,
      punch: true,
      shakeAt: 422,
      flashAt: 422,
      speedLines: "intense",
      actors: [
        { id: "amigo", pos: [-1.1, 0, 0.9], face: -1, action: "fall", expr: "terrified" },
      ],
      props3d: [
        { type: "crate", pos: [0.8, 0, -1.2], label: "INTERNET", color: "#5A6069", scale: 1.1 },
      ],
      fx: [
        { type: "comic_star", pos: [0.6, 2.2, -0.6], atFrame: 422, durFrames: 26, scale: 1.0 },
        { type: "explosion_plume", pos: [0.6, 1.6, -0.6], atFrame: 424, durFrames: 45, scale: 0.9 },
        { type: "splinters", pos: [0.6, 2.0, -0.6], atFrame: 422, durFrames: 36, scale: 1.1 },
      ],
    },
    // 9. "Algunos tuvieron que esperar días enteros..." (Súper cansado/sudando)
    {
      start: 474,
      end: 536,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-3.4, 2.6, 6.8],
      camTo: [0.4, 2.3, 5.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 42,
      vignette: 0.55,
      actors: [
        { id: "gamer", pos: [-1.1, 0, 0.5], face: 1, action: "sneak", expr: "sweating", bubble: "?" },
      ],
      props3d: [
        { type: "sign", pos: [1.2, 0.4, -1.2], label: "3 DÍAS...", color: "#DBAF72", scale: 0.9 },
      ],
    },
    // 10. "...mirando el UNO POR CIENTO!" (Gag saco/pantalla 1% con cara deadpan!)
    {
      start: 536,
      end: 598,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [0, 2.2, 6.2],
      camTo: [-0.2, 2.0, 4.9],
      lookFrom: [0, 1.35, 0],
      lookTo: [0, 1.35, 0],
      fov: 42,
      rollFrom: 5,
      rollTo: -4,
      punch: true,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.12, color: "#489CC2", label: "1 %", faceExpr: "deadpan" },
      ],
      actors: [],
    },
    // 11. "Y otros borraron cinco juegos completos..." (Cajas saliendo volando!)
    {
      start: 598,
      end: 658,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [4.2, 3.2, 8.8],
      camTo: [-0.5, 2.8, 6.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      camEase: "whip",
      punch: true,
      shakeAt: 604,
      speedLines: true,
      actors: [
        { id: "amigo", pos: [-1.4, 0, 0.6], face: 1, action: "panic", expr: "shocked", bubble: "!!" },
      ],
      props3d: [
        { type: "crate", pos: [1.4, 0, -0.8], label: "-5 JUEGOS", color: "#B86852", scale: 1.05 },
      ],
      fx: [
        { type: "splinters", pos: [1.4, 1.6, -0.8], atFrame: 604, durFrames: 38, scale: 1.15 },
      ],
    },
    // 12. "...solo para hacer espacio." (Gamer abrazando espacio vacío!)
    {
      start: 658,
      end: 716,
      stage: "office_interior",
      skyMode: "golden_hour",
      camFrom: [-2.8, 2.6, 6.4],
      camTo: [0.4, 2.4, 5.2],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 44,
      punch: true,
      actors: [
        { id: "gamer", pos: [-1.2, 0, 0.5], face: 1, action: "fall", expr: "deadpan" },
      ],
      props3d: [
        { type: "sign", pos: [1.2, 0.4, -1.0], label: "ESPACIO", color: "#4CE88A", scale: 0.9 },
      ],
    },
    // 13. "¿Cuántos juegos tendrías que sacrificar..." (Vice City esperando detrás!)
    {
      start: 716,
      end: 778,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-5.0, 3.4, 9.2],
      camTo: [0.5, 2.8, 7.2],
      lookFrom: [0, 1.7, -0.5],
      lookTo: [0, 1.8, -0.5],
      fov: 46,
      camEase: "whip",
      punch: true,
      actors: [
        { id: "gamer", pos: [-1.5, 0, 0.8], face: 1, action: "talk", expr: "sweating", bubble: "?" },
        { id: "amigo", pos: [1.5, 0, 0.8], face: -1, action: "idle", expr: "shocked", heldItem: "phone" },
      ],
      props3d: [
        { type: "car", pos: [0, 0, -2.5], rotY: -0.2, scale: 1.0, color: "#2CE6FF" },
      ],
    },
    // 14. "...en tu consola ahora mismo?" (Remate épico neón con 212 GB + chispas + humo!)
    {
      start: 778,
      end: 840,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [0.5, 2.8, 7.2],
      camTo: [3.8, 4.4, 11.4],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 2.2, -1.0],
      fov: 48,
      speedLines: true,
      actors: [
        { id: "gamer", pos: [-1.5, 0, 0.8], face: 1, action: "celebrate", expr: "laughing", bubble: "?" },
        { id: "amigo", pos: [1.5, 0, 0.8], face: -1, action: "point", expr: "shocked", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.4, -2.4], label: "212 GB", color: "#FF4DC4", scale: 1.15 },
      ],
      fx: [
        { type: "smoke", pos: [0, 1.8, -2.0], atFrame: 782, durFrames: 55, scale: 1.0 },
        { type: "sparkles", pos: [0, 3.0, -1.5], atFrame: 784, durFrames: 52, scale: 1.3 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Descarga: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_DESCARGA_SPEC} />;
};

