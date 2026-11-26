import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "Los supermercados están diseñados para robarte la billetera sin que lo notes.", startSec: 0.15, endSec: 3.91 },
  { text: "Apenas entras te ponen flores, frutas y olor a pan recién hecho para ponerte de buen humor y que bajes la guardia.", startSec: 4.28, endSec: 10.26 },
  { text: "Después te dan un carrito gigante que parece vacío,", startSec: 10.98, endSec: 13.26 },
  { text: "y esconden la leche y el pan bien al fondo,", startSec: 13.64, endSec: 15.77 },
  { text: "obligándote a cruzar toda la tienda.", startSec: 16.00, endSec: 17.82 },
  { text: "En el camino ponen las marcas más caras justo a la altura de tus ojos, con música lenta para que camines despacio y compres de más.", startSec: 18.01, endSec: 24.21 },
  { text: "Y cuando crees que escapaste, en la fila te rodean de dulces y ofertas de último segundo.", startSec: 24.55, endSec: 29.19 },
  { text: "Si alguna vez entraste solo por una cosa y saliste con diez bolsas,", startSec: 29.63, endSec: 32.96 },
  { text: "dale like y comenta qué es lo que siempre terminas comprando de más.", startSec: 33.31, endSec: 36.62 },
];

const ACCENTS: Record<string, string> = {
  "robarte la": "#FF5757",
  "la billetera": "#4CE88A",
  "flores, frutas": "#FF9F43",
  "pan recién": "#FFE14D",
  "la guardia.": "#FF5757",
  "carrito gigante": "#2CE6FF",
  "la leche": "#2CE6FF",
  "al fondo,": "#FFE14D",
  "toda la": "#FF5757",
  "más caras": "#4CE88A",
  "tus ojos,": "#FFE14D",
  "música lenta": "#C58AF9",
  "de más.": "#FF5757",
  "dulces y": "#FF4DC4",
  "último segundo.": "#FFE14D",
  "diez bolsas,": "#4CE88A",
  "dale like": "#2CE6FF",
  "y comenta": "#FFE14D",
  "comprando de": "#FF9F43",
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

export const TOON_SUPERMERCADO_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1109,
  characters: {
    comprador: {
      shirt: "#3B82F6",
      outfit: "casual",
      pants: "#1E293B",
      hair: "spiky",
      hairColor: "#F59E0B",
      glasses: false,
    },
    gerente: {
      shirt: "#1E293B",
      outfit: "suit",
      pants: "#0F172A",
      tie: true,
      tieColor: "#EF4444",
      glasses: true,
    },
  },
  shots: [
    // 1. Entrada del súper (Hook parte 1)
    {
      start: 0,
      end: 62,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      skyMode: "day_cyan",
      camFrom: [-4.8, 3.4, 9.8],
      camTo: [0.3, 2.7, 7.2],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.8, -0.5],
      fov: 48,
      rollFrom: -5,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "comprador", pos: [-1.4, 0, 0.9], face: 1, action: "talk", expr: "happy" },
        { id: "gerente", pos: [1.5, 0, 0.5], face: -1, action: "idle", expr: "evil_smug", bubble: "$$" },
      ],
      props3d: [
        { type: "sign", pos: [0.2, 0.5, -2.0], label: "SUPER", color: "#EF4444", scale: 1.15 },
      ],
    },
    // 2. "...para robarte la billetera sin que lo notes." (Saco de dinero gigante + flash)
    {
      start: 62,
      end: 126,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "solid_grid",
      floorColor: "#221238",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [0.6, 2.7, 7.6],
      camTo: [0, 2.5, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      punch: true,
      shakeAt: 66,
      flashAt: 66,
      speedLines: "intense",
      actors: [
        { id: "comprador", pos: [-1.0, 0, 0.7], face: 1, action: "panic", expr: "shocked", bubble: "$$" },
      ],
      props3d: [
        { type: "sack", pos: [1.0, 0, 0.3], label: "$$$", scale: 1.0, faceExpr: "smug" },
      ],
      fx: [
        { type: "flying_bills", pos: [0.5, 2.0, 0.4], atFrame: 66, durFrames: 55, scale: 1.15 },
      ],
    },
    // 3. "Apenas entras te ponen flores, frutas..." (Sección colorida de entrada)
    {
      start: 126,
      end: 220,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#FFF3D6",
      floorAccent: "#FF9F43",
      wallColor: "#FFE8B8",
      skyMode: "golden_hour",
      camFrom: [-4.0, 3.2, 8.6],
      camTo: [0.4, 2.6, 6.4],
      lookFrom: [0, 1.7, -0.4],
      lookTo: [0, 1.7, -0.4],
      fov: 46,
      camEase: "whip",
      customBlocks: [
        { shape: "shelf", pos: [-3.2, 0, -2.5], size: [1.5, 1.5, 1.3], color: "#22C55E", accent: "#FACC15", repeat: [3, 1, 2.8, 0] },
        { shape: "box", pos: [2.2, 0, -2.6], size: [1.2, 1.5, 1.2], color: "#EC4899", accent: "#FB7185" },
      ],
      actors: [
        { id: "comprador", pos: [-0.8, 0, 0.8], face: 1, action: "talk", expr: "happy", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [1.4, 0.4, -1.2], label: "FRUTA", color: "#22C55E", scale: 0.95 },
      ],
    },
    // 4. "...y olor a pan recién hecho para ponerte de buen humor y que bajes la guardia."
    {
      start: 220,
      end: 320,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "solid_grid",
      floorColor: "#FEF3C7",
      skyMode: "golden_hour",
      camFrom: [3.4, 2.8, 6.8],
      camTo: [-0.2, 2.4, 5.0],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 42,
      punch: true,
      customBlocks: [
        { shape: "shelf", pos: [0.2, 0, -2.2], size: [3.2, 2.0, 1.4], color: "#D97706", accent: "#FDE68A" },
      ],
      actors: [
        { id: "comprador", pos: [-1.1, 0, 0.8], face: 1, action: "celebrate", expr: "laughing", bubble: "JA!" },
        { id: "gerente", pos: [1.5, 0, 0.3], face: -1, action: "idle", expr: "evil_smug" },
      ],
      fx: [
        { type: "comic_star", pos: [-1.1, 2.8, 0.8], atFrame: 235, durFrames: 25, scale: 0.85 },
      ],
    },
    // 5. "Después te dan un carrito gigante que parece vacío,"
    {
      start: 320,
      end: 408,
      stage: "office_interior",
      horizon: "office_cubicles",
      floorStyle: "solid_grid",
      floorColor: "#E0F2FE",
      wallColor: "#F8FAFC",
      skyMode: "interior_warm",
      whipBlur: true,
      camFrom: [-4.2, 3.3, 8.4],
      camTo: [0.2, 2.6, 6.2],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 46,
      punch: true,
      shakeAt: 332,
      customBlocks: [
        { shape: "box", pos: [1.3, 0.5, 0.2], size: [2.4, 1.6, 1.6], color: "#94A3B8", accent: "#E2E8F0" },
        { shape: "shelf", pos: [-3.5, 0, -3.5], size: [1.8, 3.2, 1.2], color: "#38BDF8", accent: "#BAE6FD", repeat: [3, 1, 3.2, 0] },
      ],
      actors: [
        { id: "comprador", pos: [-1.3, 0, 0.7], face: 1, action: "point", expr: "shocked", bubble: "?" },
      ],
      props3d: [
        { type: "sign", pos: [1.3, 0.6, -1.6], label: "2X MAS", color: "#0EA5E9", scale: 1.05 },
      ],
    },
    // 6. "...y esconden la leche y el pan bien al fondo,"
    {
      start: 408,
      end: 480,
      stage: "office_interior",
      horizon: "office_cubicles",
      floorStyle: "solid_grid",
      floorColor: "#DBEAFE",
      wallColor: "#EFF6FF",
      skyMode: "day_cyan",
      camFrom: [0, 3.8, 10.5],
      camTo: [0, 2.8, 7.2],
      lookFrom: [0, 1.8, -2.0],
      lookTo: [0, 1.8, -2.0],
      fov: 50,
      camEase: "whip",
      customBlocks: [
        { shape: "shelf", pos: [-3.4, 0, -2.0], size: [1.4, 3.5, 5.5], color: "#1D4ED8", accent: "#60A5FA" },
        { shape: "shelf", pos: [3.4, 0, -2.0], size: [1.4, 3.5, 5.5], color: "#1D4ED8", accent: "#60A5FA" },
      ],
      actors: [
        { id: "comprador", pos: [0, 0, 1.2], face: 1, action: "run", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.8, -3.8], label: "LECHE", color: "#FFFFFF", scale: 1.1 },
      ],
    },
    // 7. "...obligándote a cruzar toda la tienda."
    {
      start: 480,
      end: 540,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#1E3A8A",
      floorAccent: "#60A5FA",
      skyMode: "vice_neon",
      whipBlur: true,
      camFrom: [-4.5, 2.9, 6.8],
      camTo: [2.2, 2.4, 5.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 44,
      rollFrom: 6,
      rollTo: -4,
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "comprador", pos: [0, 0, 0.5], face: 1, action: "run", expr: "terrified", scale: 1.1 },
      ],
    },
    // 8. "En el camino ponen las marcas más caras justo a la altura de tus ojos,"
    {
      start: 540,
      end: 640,
      stage: "office_interior",
      horizon: "neon_alley",
      floorStyle: "solid_grid",
      floorColor: "#1E1B4B",
      skyMode: "vice_neon",
      camFrom: [3.2, 2.8, 7.8],
      camTo: [0, 2.5, 6.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      customBlocks: [
        { shape: "shelf", pos: [-3.2, 0, -2.2], size: [1.6, 3.6, 1.2], color: "#F59E0B", accent: "#FDE047", repeat: [3, 1, 2.8, 0] },
      ],
      actors: [
        { id: "gerente", pos: [-1.0, 0, 0.7], face: 1, action: "point", expr: "dollar_eyes", bubble: "$$" },
      ],
      props3d: [
        { type: "sign", pos: [1.0, 0.6, -1.2], label: "99.99$", color: "#F59E0B", scale: 0.9 },
      ],
      fx: [
        { type: "flying_bills", pos: [0.4, 2.2, 0.2], atFrame: 560, durFrames: 65, scale: 1.1 },
      ],
    },
    // 9. "...con música lenta para que camines despacio y compres de más."
    {
      start: 640,
      end: 735,
      stage: "office_interior",
      horizon: "palace_hall",
      floorStyle: "diamond_carpet",
      floorColor: "#312E81",
      floorAccent: "#A78BFA",
      wallColor: "#E0E7FF",
      skyMode: "interior_warm",
      camFrom: [-3.2, 3.0, 7.6],
      camTo: [0.4, 2.6, 6.0],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 45,
      actors: [
        { id: "comprador", pos: [-1.0, 0, 0.7], face: 1, action: "talk", expr: "deadpan", heldItem: "paper", bubble: "?" },
      ],
      props3d: [
        { type: "doc", pos: [1.2, 0.5, 0.2], label: "TICKET", scale: 1.0, rotY: -0.3 },
      ],
    },
    // 10. "Y cuando crees que escapaste, en la fila te rodean de dulces y ofertas de último segundo."
    {
      start: 735,
      end: 885,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#991B1B",
      floorAccent: "#FBBF24",
      skyMode: "dramatic_dark",
      whipBlur: true,
      camFrom: [3.8, 3.2, 8.8],
      camTo: [0, 2.7, 7.2],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 48,
      punch: true,
      shakeAt: 790,
      flashAt: 790,
      speedLines: "intense",
      customBlocks: [
        { shape: "shelf", pos: [-3.0, 0, -1.8], size: [1.3, 2.2, 1.2], color: "#EC4899", accent: "#F472B6" },
        { shape: "shelf", pos: [3.0, 0, -1.8], size: [1.3, 2.2, 1.2], color: "#8B5CF6", accent: "#C4B5FD" },
      ],
      actors: [
        { id: "comprador", pos: [-1.1, 0, 0.6], face: 1, action: "panic", expr: "shocked", bubble: "!!" },
        { id: "gerente", pos: [1.1, 0, 0.5], face: -1, action: "laugh", expr: "evil_smug", bubble: "JA!" },
      ],
      props3d: [
        { type: "desk", pos: [0.1, 0, -1.2], scale: 0.85, color: "#475569" },
        { type: "sign", pos: [0.1, 0.7, -2.0], label: "OFERTA!", color: "#EC4899", scale: 0.95 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 2.1, 0.4], atFrame: 790, durFrames: 60, scale: 1.1 },
      ],
    },
    // 11. "Si alguna vez entraste solo por una cosa y saliste con diez bolsas,"
    {
      start: 885,
      end: 995,
      stage: "city_street",
      horizon: "city_blocks",
      floorStyle: "crosswalk_city",
      skyMode: "golden_hour",
      camFrom: [-4.2, 3.2, 8.4],
      camTo: [0.2, 2.5, 5.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      camEase: "whip",
      customBlocks: [
        { shape: "box", pos: [1.5, 0, 0.2], size: [1.2, 1.4, 1.1], color: "#F59E0B", accent: "#FEF3C7", repeat: [2, 1, 1.5, 0] },
      ],
      actors: [
        { id: "comprador", pos: [-1.0, 0, 0.7], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [1.3, 0.6, -1.5], label: "10 BOLSAS", color: "#4CE88A", scale: 1.05 },
      ],
      fx: [
        { type: "comic_star", pos: [-1.0, 2.7, 0.7], atFrame: 920, durFrames: 25, scale: 0.85 },
      ],
    },
    // 12. CTA OBLIGATORIO AL FINAL: "dale like y comenta qué es lo que siempre terminas comprando de más."
    {
      start: 995,
      end: 1109,
      stage: "office_interior",
      horizon: "interior",
      floorStyle: "diamond_carpet",
      floorColor: "#065F46",
      floorAccent: "#34D399",
      skyMode: "day_cyan",
      camFrom: [0, 2.8, 7.4],
      camTo: [0, 2.5, 6.4],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.8, 0],
      fov: 46,
      punch: true,
      speedLines: true,
      actors: [
        { id: "comprador", pos: [-0.9, 0, 0.6], face: 1, action: "celebrate", expr: "laughing", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0.9, 0.5, -1.0], label: "COMENTA!", color: "#FFE14D", scale: 0.85 },
      ],
      fx: [
        { type: "comic_star", pos: [0.9, 2.4, -0.5], atFrame: 1020, durFrames: 30, scale: 0.9 },
        { type: "flying_bills", pos: [0, 2.3, 0.4], atFrame: 1005, durFrames: 85, scale: 1.0 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonSupermercado: React.FC = () => (
  <ToonFreneticoEngine spec={TOON_SUPERMERCADO_SPEC} />
);
