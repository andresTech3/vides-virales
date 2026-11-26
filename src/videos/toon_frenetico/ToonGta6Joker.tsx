import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Exigió diez millones de dólares a Rockstar…", startSec: 0.02, endSec: 2.48 },
  { text: "…y mira cómo terminó.", startSec: 2.85, endSec: 3.85 },
  { text: "Cuando salió el primer tráiler de GTA seis,", startSec: 4.59, endSec: 6.96 },
  { text: "un hombre se volvió loco.", startSec: 7.28, endSec: 8.51 },
  { text: "Era el famoso Joker de Florida, con pelo morado y tatuajes en la cara.", startSec: 8.66, endSec: 12.32 },
  { text: "Juró que copiaron su rostro sin permiso y amenazó con demandar.", startSec: 12.96, endSec: 15.92 },
  { text: "Subió de dos millones a cinco…", startSec: 16.59, endSec: 18.35 },
  { text: "…hasta exigir diez millones de dólares.", startSec: 18.84, endSec: 20.66 },
  { text: "Pero en las oficinas de Rockstar nadie entró en pánico.", startSec: 21.00, endSec: 23.72 },
  { text: "Al final no hubo juicio millonario:", startSec: 24.35, endSec: 25.88 },
  { text: "lo pusieron en los créditos oficiales como población local.", startSec: 26.38, endSec: 28.85 },
  { text: "Y en lugar de seguir enojado…", startSec: 29.24, endSec: 30.53 },
  { text: "…lo terminó celebrando en redes sociales.", startSec: 30.96, endSec: 32.92 },
];

const ACCENTS: Record<string, string> = {
  "diez millones": "#4CE88A",
  "cómo terminó.": "#FFE14D",
  "GTA seis,": "#FF4DC4",
  "volvió loco.": "#FF5757",
  "pelo morado": "#C58AF9",
  "con demandar.": "#FF5757",
  "a cinco…": "#4CE88A",
  "de dólares.": "#4CE88A",
  "en pánico.": "#2CE6FF",
  "juicio millonario:": "#FFE14D",
  "población local.": "#FFE14D",
  "redes sociales.": "#2CE6FF",
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

export const TOON_GTA6_JOKER_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 995,
  characters: {
    joker: {
      shirt: "#FF7A2F",
      outfit: "casual",
      pants: "#1D2230",
      hair: "spiky",
      hairColor: "#A855F7",
      glasses: false,
    },
    ejecutivo: {
      shirt: "#233963",
      outfit: "suit",
      pants: "#161B26",
      tie: true,
      tieColor: "#D93B3B",
      glasses: true,
    },
    juez: {
      shirt: "#1D1B22",
      outfit: "trenchcoat",
      pants: "#141218",
      hair: "curly",
      hairColor: "#E5E7EB",
    },
  },
  shots: [
    // 1. Callejón neón único: Joker exigiendo 10M$ con lluvia de billetes
    {
      start: 0,
      end: 74,
      stage: "city_street",
      horizon: "neon_alley",
      floorStyle: "asphalt_road",
      skyMode: "dramatic_dark",
      camFrom: [-5.5, 3.6, 10.4],
      camTo: [0.4, 2.8, 7.6],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.9, -0.5],
      fov: 48,
      rollFrom: -6,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "joker", pos: [-1.4, 0, 0.8], face: 1, action: "point", expr: "angry", heldItem: "phone", bubble: "$$" },
      ],
      props3d: [
        { type: "sign", pos: [1.3, 0.5, -1.6], label: "10 M$", color: "#4CE88A", scale: 1.1 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.0, 0.4], atFrame: 8, durFrames: 55, scale: 1.2 },
      ],
    },
    // 2. "...y mira cómo terminó." (Pantallas arcade + flash!)
    {
      start: 74,
      end: 138,
      stage: "office_interior",
      horizon: "neon_alley",
      floorStyle: "diamond_carpet",
      floorColor: "#3A1C5A",
      floorAccent: "#FF4DC4",
      skyMode: "vice_neon",
      whipBlur: true,
      camFrom: [3.2, 3.0, 8.2],
      camTo: [-0.4, 2.6, 6.2],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 46,
      punch: true,
      shakeAt: 78,
      flashAt: 78,
      customBlocks: [
        { shape: "arcade_row", pos: [-4.2, 0, -4.5], size: [1.6, 3.4, 1.2], color: "#222638", accent: "#2CE6FF", repeat: [4, 1, 2.8, 0] },
      ],
      actors: [
        { id: "joker", pos: [0, 0, 0.7], face: 1, action: "celebrate", expr: "laughing", bubble: "JA!" },
      ],
    },
    // 3. "Cuando salió el primer tráiler de GTA seis..." (Pantalla gigante tráiler!)
    {
      start: 138,
      end: 214,
      stage: "city_street",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#141626",
      skyMode: "vice_neon",
      camFrom: [-4.5, 3.2, 8.8],
      camTo: [0.4, 2.7, 6.6],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.9, -0.5],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "joker", pos: [-1.4, 0, 0.9], face: 1, action: "panic", expr: "shocked", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [1.2, 0.5, -1.5], label: "GTA 6", color: "#FF4DC4", scale: 1.1 },
      ],
      fx: [
        { type: "comic_star", pos: [1.2, 2.4, -1.0], atFrame: 145, durFrames: 24, scale: 0.85 },
      ],
    },
    // 4. "...un hombre se volvió loco." (Zoom extremo cara pelo morado!)
    {
      start: 214,
      end: 264,
      stage: "office_interior",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#1D1030",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.2, 4.8],
      camTo: [0, 2.4, 3.6],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      punch: true,
      shakeAt: 218,
      speedLines: "intense",
      actors: [
        { id: "joker", pos: [0, 0, 0], face: 1, action: "panic", expr: "terrified", scale: 1.15, bubble: "!!" },
      ],
    },
    // 5. "Era el famoso Joker de Florida..." (Suelo rombos + cartel FLORIDA)
    {
      start: 264,
      end: 375,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#8C2230",
      floorAccent: "#E2B144",
      wallColor: "#E8DCC8",
      skyMode: "golden_hour",
      camFrom: [-4.2, 3.2, 8.6],
      camTo: [0.3, 2.8, 6.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "joker", pos: [-1.4, 0, 0.7], face: 1, action: "talk", expr: "angry", heldItem: "phone" },
        { id: "juez", pos: [1.5, 0, 0.4], face: -1, action: "idle", expr: "deadpan" },
      ],
      props3d: [
        { type: "desk", pos: [1.5, 0, -1.6], scale: 0.9, color: "#5C321A" },
      ],
    },
    // 6. "Juró que copiaron su rostro sin permiso y amenazó con demandar." (Documento DEMANDA!)
    {
      start: 375,
      end: 492,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#8C2230",
      floorAccent: "#E2B144",
      wallColor: "#D8C8B0",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [3.2, 2.8, 6.8],
      camTo: [-0.2, 2.3, 5.2],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 42,
      punch: true,
      shakeAt: 420,
      actors: [
        { id: "joker", pos: [-1.3, 0, 0.6], face: 1, action: "point", expr: "angry", heldItem: "paper", bubble: "!!" },
      ],
      props3d: [
        { type: "doc", pos: [1.1, 0.5, 0.2], label: "DEMANDA", scale: 1.05, rotY: -0.35 },
      ],
    },
    // 7. "Subió de dos millones a cinco... hasta exigir diez millones de dólares." (Saco 10 M$ + billetes!)
    {
      start: 492,
      end: 624,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#235347",
      floorAccent: "#4CE88A",
      wallColor: "#E5D9C3",
      skyMode: "golden_hour",
      camFrom: [0, 2.3, 6.6],
      camTo: [0.3, 2.1, 5.2],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 42,
      rollFrom: -6,
      rollTo: 4,
      punch: true,
      shakeAt: 550,
      flashAt: 550,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.15, color: "#4CE88A", label: "10 M$", faceExpr: "smug" },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.2, 0.4], atFrame: 550, durFrames: 65, scale: 1.2 },
      ],
      actors: [],
    },
    // 8. "Pero en las oficinas de Rockstar nadie entró en pánico." (Oficina azul con cubículos estilo Ref 6!)
    {
      start: 624,
      end: 725,
      stage: "office_interior",
      horizon: "office_cubicles",
      floorStyle: "solid_grid",
      floorColor: "#1D4E9E",
      floorAccent: "rgba(255,255,255,0.22)",
      wallColor: "#EAEFF7",
      trimColor: "#3B6CB7",
      skyMode: "day_cyan",
      whipBlur: true,
      camFrom: [-4.5, 3.2, 8.6],
      camTo: [0.5, 2.7, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 45,
      camEase: "whip",
      customBlocks: [
        { shape: "box", pos: [-3.8, 0, -3.8], size: [2.2, 1.2, 1.3], color: "#CBD5E1", repeat: [3, 1, 3.8, 0] },
      ],
      actors: [
        { id: "ejecutivo", pos: [-1.4, 0, 0.7], face: 1, action: "idle", expr: "deadpan", heldItem: "paper" },
        { id: "juez", pos: [1.5, 0, 0.7], face: -1, action: "laugh", expr: "smug" },
      ],
    },
    // 9. "Al final no hubo juicio millonario: lo pusieron en los créditos oficiales como población local."
    {
      start: 725,
      end: 870,
      stage: "city_street",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#181A28",
      skyMode: "sunset_purple",
      camFrom: [3.2, 2.8, 7.8],
      camTo: [-0.2, 2.5, 6.2],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 44,
      punch: true,
      actors: [
        { id: "ejecutivo", pos: [-1.5, 0, 0.6], face: 1, action: "point", expr: "evil_smug", bubble: "JA!" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.5, -0.8], label: "CRÉDITOS", color: "#FFE14D", scale: 1.05 },
      ],
      fx: [
        { type: "sparkles", pos: [1.0, 2.2, -0.4], atFrame: 735, durFrames: 110, scale: 1.2 },
      ],
    },
    // 10. "Y en lugar de seguir enojado... lo terminó celebrando en redes sociales." (Cuadrícula ciudad colorida estilo Ref 8!)
    {
      start: 870,
      end: 995,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      floorColor: "#3D4452",
      skyMode: "vice_neon",
      camFrom: [-3.5, 3.2, 8.2],
      camTo: [3.8, 4.6, 11.4],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 2.2, -1.0],
      fov: 48,
      rollFrom: -4,
      rollTo: 0,
      speedLines: true,
      actors: [
        { id: "joker", pos: [0, 0, 0.8], face: 1, action: "celebrate", expr: "laughing", heldItem: "phone", scale: 1.1, bubble: "JA!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.4, -2.5], label: "LOCAL POP", color: "#FF4DC4", scale: 1.1 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.2, 0.5], atFrame: 880, durFrames: 100, scale: 1.2 },
        { type: "sparkles", pos: [0, 3.2, 0], atFrame: 890, durFrames: 90, scale: 1.3 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Joker: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_JOKER_SPEC} />;
};

