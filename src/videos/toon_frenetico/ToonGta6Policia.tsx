import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "En GTA seis, escapar de la policía ya no te salva.", startSec: 0.04, endSec: 3.34 },
  { text: "En los juegos viejos bastaba con pintar el coche y esperar un minuto.", startSec: 3.81, endSec: 7.04 },
  { text: "Pero en Vice City, la inteligencia artificial", startSec: 7.50, endSec: 9.71 },
  { text: "tiene memoria real.", startSec: 9.91, endSec: 11.00 },
  { text: "Si atracas una tienda hoy y huyes en tu coche deportivo,", startSec: 11.38, endSec: 14.55 },
  { text: "la policía guarda tu cara, tu ropa y hasta tu matrícula.", startSec: 14.63, endSec: 17.39 },
  { text: "Crees que todo terminó cuando desaparecen las estrellas en pantalla.", startSec: 17.79, endSec: 20.68 },
  { text: "Pero dos días después pasas tranquilo frente a una patrulla…", startSec: 21.14, endSec: 24.42 },
  { text: "…y un oficial te mira fijo, recuerda tu cara y suena la alarma.", startSec: 24.76, endSec: 27.52 },
  { text: "Si no cambias de coche y de ropa,", startSec: 27.88, endSec: 29.38 },
  { text: "vuelves directo a prisión.", startSec: 29.70, endSec: 31.31 },
  { text: "¿Cuánto crees que sobrevivirías sin que te reconozcan?", startSec: 31.41, endSec: 33.50 },
];

const ACCENTS: Record<string, string> = {
  "GTA seis,": "#FF4DC4",
  "no te": "#FF5757",
  "salva.": "#FF5757",
  "pintar el": "#4CE88A",
  "Vice City,": "#2CE6FF",
  "memoria real.": "#FFE14D",
  "coche deportivo,": "#FF5757",
  "tu cara,": "#FFE14D",
  "tu matrícula.": "#FFE14D",
  "las estrellas": "#FFE14D",
  "una patrulla…": "#2CE6FF",
  "recuerda tu": "#FF5757",
  "la alarma.": "#FF5757",
  "a prisión.": "#FF5757",
  "te reconozcan?": "#FFE14D",
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

export const TOON_GTA6_POLICIA_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1013,
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
    // 1. Hook Vice City: Lucía huyendo frente a patrulla con sirenas
    {
      start: 0,
      end: 34,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-7.5, 3.8, 12.0],
      camTo: [-1.8, 3.0, 8.2],
      lookFrom: [0, 1.8, -0.5],
      lookTo: [0, 1.9, -0.5],
      fov: 48,
      rollFrom: -6,
      rollTo: 2,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-2.8, 0, 1.5], toPos: [-0.8, 0, 1.5], face: 1, action: "run", expr: "shocked", heldItem: "money", bubble: "!!" },
      ],
      props3d: [
        { type: "police_car", pos: [2.4, 0, -1.2], toPos: [1.2, 0, -0.8], rotY: -0.35, scale: 1.05 },
        { type: "wanted_stars", pos: [-0.8, 4.2, 1.0], scale: 0.7 },
      ],
    },
    // 2. Corte cercano alarma: "no te salva!" (shake + flash + estrella impacto)
    {
      start: 34,
      end: 68,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [2.2, 2.4, 5.4],
      camTo: [0, 2.2, 3.8],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 38,
      punch: true,
      shakeAt: 36,
      flashAt: 36,
      speedLines: true,
      actors: [
        { id: "policia", pos: [0, 0, 0], face: -1, action: "point", expr: "angry", scale: 1.15, bubble: "!!" },
      ],
      fx: [
        { type: "comic_star", pos: [0.5, 2.5, -0.8], atFrame: 36, durFrames: 24, scale: 1.1 },
      ],
    },
    // 3. Reacción pánico Lucía + signos GTA 6
    {
      start: 68,
      end: 114,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-4.2, 3.0, 7.6],
      camTo: [1.5, 2.6, 5.8],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 44,
      rollFrom: 6,
      rollTo: -3,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [-1.4, 0, 0.8], face: 1, action: "panic", expr: "terrified", bubble: "!" },
        { id: "jason", pos: [1.6, 0, 0.8], face: -1, action: "panic", expr: "shocked", heldItem: "money" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.2, -2.5], label: "GTA 6", color: "#FF4DC4", scale: 1.1 },
      ],
    },
    // 4. "En los juegos viejos bastaba con pintar el coche..." (coche rojo -> coche verde!)
    {
      start: 114,
      end: 158,
      stage: "industrial_yard",
      horizon: "city",
      floorStyle: "cobble",
      skyMode: "day_cyan",
      camFrom: [-4.5, 3.6, 10.2],
      camTo: [0.4, 3.2, 8.8],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "jason", pos: [-1.8, 0, 1.1], face: 1, action: "point", expr: "smug", heldItem: "wrench" },
      ],
      props3d: [
        { type: "car", pos: [1.1, 0, -0.3], rotY: -0.4, scale: 0.9, color: "#E63946" },
        { type: "crate", pos: [-2.8, 0, -2.2], label: "PINTURA", color: "#4CE88A" },
      ],
    },
    // 5. Puf de humo + coche pintado verde + policía ciego "?"
    {
      start: 158,
      end: 225,
      stage: "vice_city",
      skyMode: "day_cyan",
      camFrom: [4.8, 3.2, 8.6],
      camTo: [-1.2, 2.8, 6.4],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 46,
      punch: true,
      shakeAt: 162,
      actors: [
        { id: "policia", pos: [2.1, 0, 0.8], face: -1, action: "idle", expr: "deadpan", bubble: "?" },
      ],
      props3d: [
        { type: "car", pos: [-1.4, 0, 0], rotY: 0.35, scale: 1.05, color: "#4CE88A" },
      ],
      fx: [
        { type: "smoke", pos: [-1.4, 1.2, 0.2], atFrame: 159, durFrames: 28, scale: 1.1 },
      ],
    },
    // 6. "Pero en Vice City, la inteligencia artificial..." (Cielo neón + radar IA!)
    {
      start: 225,
      end: 262,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-6.0, 4.0, 10.2],
      camTo: [0.8, 3.2, 7.6],
      lookFrom: [0, 2.0, -1.0],
      lookTo: [0, 2.1, -1.0],
      fov: 48,
      rollFrom: -7,
      rollTo: 0,
      camEase: "whip",
      punch: true,
      flashAt: 226,
      actors: [
        { id: "policia", pos: [-1.6, 0, 0.6], face: 1, action: "point", expr: "evil_smug", heldItem: "magnifying", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [1.8, 0.4, -1.8], label: "VICE CITY", color: "#2CE6FF", scale: 1.0 },
        { type: "orb", pos: [-1.6, 3.8, 0.6], scale: 0.8 },
      ],
      fx: [
        { type: "radar", pos: [-1.6, 1.5, 0.6], atFrame: 226, durFrames: 36, scale: 1.2 },
      ],
    },
    // 7. "...tiene memoria REAL!" (Close-up extremo radar rojo en cara del oficial!)
    {
      start: 262,
      end: 298,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.2, 4.8],
      camTo: [0.3, 2.3, 3.5],
      lookFrom: [0, 2.1, 0],
      lookTo: [0, 2.2, 0],
      fov: 36,
      punch: true,
      shakeAt: 296,
      vignette: 0.45,
      speedLines: true,
      actors: [
        { id: "policia", pos: [0, 0, 0], face: 1, action: "lean_in", expr: "evil_smug", scale: 1.18 },
      ],
      fx: [
        { type: "radar", pos: [0, 2.2, 0.4], atFrame: 264, durFrames: 34, scale: 0.9 },
      ],
    },
    // 8. Micro-gag cartel MEMORIA IA brillante!
    {
      start: 298,
      end: 342,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [-1.8, 2.2, 5.2],
      camTo: [0.4, 2.0, 4.0],
      lookFrom: [0, 1.4, 0],
      lookTo: [0, 1.4, 0],
      fov: 40,
      rollFrom: 6,
      rollTo: -4,
      punch: true,
      props3d: [
        { type: "sign", pos: [0, 0.5, 0], label: "MEMORIA IA", color: "#FF4DC4", scale: 1.15 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 1.8, 0.4], atFrame: 300, durFrames: 38 },
      ],
      actors: [],
    },
    // 9. "Si atracas una tienda hoy..." (Interior tienda + lluvia de billetes + cha-ching!)
    {
      start: 342,
      end: 392,
      stage: "office_interior",
      skyMode: "interior_warm",
      camFrom: [-3.8, 3.3, 9.2],
      camTo: [0.4, 3.0, 7.8],
      lookFrom: [0, 1.7, 0],
      lookTo: [0, 1.7, 0],
      fov: 45,
      camEase: "whip",
      punch: true,
      shakeAt: 358,
      flashAt: 358,
      actors: [
        { id: "lucia", pos: [-1.45, 0, 0.6], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
        { id: "jason", pos: [1.45, 0, 0.6], face: -1, action: "run", expr: "happy", heldItem: "briefcase" },
      ],
      props3d: [
        { type: "money", pos: [0, 0, -0.5], scale: 1.15 },
        { type: "desk", pos: [0, 0, -2.6], scale: 0.9 },
      ],
      fx: [
        { type: "flying_bills", pos: [0, 1.8, 0.6], atFrame: 358, durFrames: 32, scale: 1.2 },
      ],
    },
    // 10. "...y huyes en tu coche deportivo!" (Deportivo rojo a toda velocidad!)
    {
      start: 392,
      end: 438,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [6.0, 2.8, 8.8],
      camTo: [-3.5, 2.6, 7.2],
      lookFrom: [0, 1.2, 0],
      lookTo: [0.5, 1.3, 0],
      fov: 48,
      camEase: "whip",
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-1.0, 0.3, 1.4], toPos: [2.2, 0.3, 1.4], face: 1, action: "celebrate", expr: "laughing" },
      ],
      props3d: [
        { type: "car", pos: [-2.8, 0, 0], toPos: [3.2, 0, 0], rotY: 0.1, scale: 1.1, color: "#E63946" },
      ],
      fx: [
        { type: "smoke", pos: [-2.8, 0.5, 0], atFrame: 396, durFrames: 36, scale: 1.0 },
      ],
    },
    // 11. "...la policía guarda tu cara, tu ropa..." (Archivo oficial + lupa!)
    {
      start: 438,
      end: 485,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      camFrom: [2.2, 2.6, 5.8],
      camTo: [-0.6, 2.2, 4.6],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.6, 0],
      fov: 42,
      punch: true,
      actors: [
        { id: "policia", pos: [-1.3, 0, 0.5], face: 1, action: "point", expr: "evil_smug", heldItem: "magnifying" },
      ],
      props3d: [
        { type: "doc", pos: [1.1, 0.5, 0.2], label: "BUSCADO", scale: 1.05, rotY: -0.35 },
      ],
      fx: [
        { type: "radar", pos: [1.1, 1.6, 0.4], atFrame: 444, durFrames: 36, scale: 0.85 },
      ],
    },
    // 12. "...y hasta tu matrícula!" (Macro al saco/placa BUSCADO con cara shocked!)
    {
      start: 485,
      end: 534,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.3, 6.6],
      camTo: [0.2, 2.1, 5.4],
      lookFrom: [0, 1.35, 0],
      lookTo: [0, 1.35, 0],
      fov: 42,
      rollFrom: -6,
      rollTo: 5,
      punch: true,
      shakeAt: 492,
      props3d: [
        { type: "sack", pos: [0, 0, 0], scale: 1.12, color: "#FFE14D", label: "PLACA 6", faceExpr: "shocked" },
      ],
      fx: [
        { type: "comic_star", pos: [0.9, 2.2, -0.3], atFrame: 492, durFrames: 26, scale: 0.8 },
      ],
      actors: [],
    },
    // 13. "Crees que todo terminó cuando desaparecen..." (Lucía bailando feliz!)
    {
      start: 534,
      end: 578,
      stage: "vice_city",
      skyMode: "golden_hour",
      camFrom: [-4.5, 3.0, 7.6],
      camTo: [1.0, 2.5, 5.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 44,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [0, 0, 0.4], face: 1, action: "celebrate", expr: "laughing", heldItem: "money", bubble: "laugh" },
      ],
      props3d: [
        { type: "wanted_stars", pos: [0, 4.1, 0.4], scale: 0.85 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.5], atFrame: 540, durFrames: 34 },
      ],
    },
    // 14. "...las estrellas en pantalla!" (Estrellas apagándose / vuelo de chispas)
    {
      start: 578,
      end: 634,
      stage: "vice_city",
      skyMode: "day_cyan",
      camFrom: [1.8, 3.2, 6.2],
      camTo: [-1.8, 2.8, 5.4],
      lookFrom: [0, 2.2, 0],
      lookTo: [0, 2.3, 0],
      fov: 42,
      punch: true,
      actors: [
        { id: "lucia", pos: [-1.4, 0, 0.5], face: 1, action: "laugh", expr: "happy" },
        { id: "jason", pos: [1.4, 0, 0.5], face: -1, action: "idle", expr: "smug", heldItem: "phone" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.2, -2.0], label: "0 ESTRELLAS", color: "#4CE88A", scale: 1.0 },
      ],
    },
    // 15. "Pero dos días después..." (Cartel 2 DÍAS DESPUÉS + paseo tranquilo)
    {
      start: 634,
      end: 682,
      stage: "vice_city",
      skyMode: "day_cyan",
      camFrom: [-6.5, 3.4, 9.5],
      camTo: [-1.2, 2.8, 7.0],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.9, 0],
      fov: 46,
      camEase: "whip",
      actors: [
        { id: "lucia", pos: [-2.4, 0, 1.2], toPos: [-0.4, 0, 1.2], face: 1, action: "idle", expr: "happy" },
      ],
      props3d: [
        { type: "sign", pos: [1.4, 0.3, -1.6], label: "2 DÍAS LUEGO", color: "#FFE169", scale: 0.95 },
        { type: "car", pos: [-1.5, 0, -2.5], rotY: 0.1, scale: 0.9, color: "#E63946" },
      ],
    },
    // 16. "...pasas tranquilo frente a una patrulla!" (Patrulla encendiendo sirena!)
    {
      start: 682,
      end: 742,
      stage: "vice_city",
      skyMode: "golden_hour",
      camFrom: [4.8, 3.2, 8.8],
      camTo: [0.5, 2.6, 6.2],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 44,
      actors: [
        { id: "lucia", pos: [-2.2, 0, 1.2], toPos: [-0.8, 0, 1.2], face: 1, action: "sneak", expr: "sweating", bubble: "?" },
        { id: "policia", pos: [2.0, 0, 0.6], face: -1, action: "idle", expr: "deadpan" },
      ],
      props3d: [
        { type: "police_car", pos: [1.5, 0, -1.8], rotY: -0.25, scale: 1.05 },
      ],
    },
    // 17. "...y un oficial te mira fijo..." (Primerísimo plano cara a cara de tensión!)
    {
      start: 742,
      end: 786,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [0, 2.2, 5.2],
      camTo: [0, 2.3, 4.2],
      lookFrom: [0, 2.2, 0.2],
      lookTo: [0, 2.3, 0.2],
      fov: 40,
      punch: true,
      vignette: 0.45,
      actors: [
        { id: "lucia", pos: [-0.72, 0, 0.2], face: 1, action: "idle", expr: "sweating", scale: 1.15 },
        { id: "policia", pos: [0.72, 0, 0.2], face: -1, action: "lean_in", expr: "deadpan", scale: 1.15, bubble: "!" },
      ],
    },
    // 18. "...recuerda tu cara y SUENA LA ALARMA!!" (EXPLOSIÓN + SHAKE + FLASH!)
    {
      start: 786,
      end: 836,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      camFrom: [2.4, 2.8, 6.4],
      camTo: [0.2, 2.6, 5.0],
      lookFrom: [0, 2.0, 0],
      lookTo: [0, 2.1, 0],
      fov: 44,
      rollFrom: -8,
      rollTo: 5,
      punch: true,
      shakeAt: 790,
      flashAt: 790,
      speedLines: "intense",
      actors: [
        { id: "policia", pos: [1.2, 0, 0.4], face: -1, action: "point", expr: "angry", bubble: "!!" },
        { id: "lucia", pos: [-1.4, 0, 0.6], face: 1, action: "panic", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "wanted_stars", pos: [0, 4.0, 0.3], scale: 0.9 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.5, -0.5], atFrame: 790, durFrames: 26, scale: 1.0 },
        { type: "radar", pos: [-1.4, 1.6, 0.6], atFrame: 790, durFrames: 38, scale: 1.1 },
      ],
    },
    // 19. "Si no cambias de coche y de ropa..." (Persecución frenética + coche deportivo vs patrulla)
    {
      start: 836,
      end: 890,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [-6.5, 3.6, 10.5],
      camTo: [3.5, 3.2, 8.5],
      lookFrom: [0, 1.6, 0],
      lookTo: [0.6, 1.7, 0],
      fov: 48,
      camEase: "whip",
      punch: true,
      shakeAt: 840,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-1.8, 0, 1.2], toPos: [1.6, 0, 1.2], face: 1, action: "run", expr: "terrified" },
        { id: "policia", pos: [-4.2, 0, 0.8], toPos: [-0.8, 0, 0.8], face: 1, action: "run", expr: "angry" },
      ],
      props3d: [
        { type: "car", pos: [2.2, 0, -0.8], rotY: 0.25, scale: 0.95, color: "#E63946" },
        { type: "police_car", pos: [-2.4, 0, -1.6], rotY: 0.25, scale: 1.0 },
      ],
      fx: [
        { type: "splinters", pos: [0, 1.6, 0.2], atFrame: 840, durFrames: 32, scale: 1.0 },
      ],
    },
    // 20. "...vuelves directo a PRISIÓN!" (Ladrillos + foco dramático + Lucía derrotada)
    {
      start: 890,
      end: 942,
      stage: "brick_corridor",
      skyMode: "dramatic_dark",
      camFrom: [-2.8, 2.6, 6.0],
      camTo: [0.4, 2.2, 4.6],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 1.8, 0],
      fov: 42,
      punch: true,
      shakeAt: 894,
      flashAt: 894,
      vignette: 0.6,
      actors: [
        { id: "lucia", pos: [0, 0, 0.3], face: -1, action: "fall", expr: "deadpan" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.2, -2.0], label: "PRISIÓN", color: "#FF5757", scale: 1.1 },
      ],
    },
    // 21. Remate final pregunta al espectador bajo cielo Vice Neon!
    {
      start: 942,
      end: 1013,
      stage: "vice_city",
      skyMode: "vice_neon",
      camFrom: [2.2, 3.0, 7.8],
      camTo: [4.6, 4.4, 11.4],
      lookFrom: [0, 2.0, -0.5],
      lookTo: [0, 2.2, -1.0],
      fov: 46,
      rollFrom: -4,
      rollTo: 0,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-1.4, 0, 0.8], face: 1, action: "panic", expr: "terrified", bubble: "?" },
        { id: "policia", pos: [1.8, 0, 0.2], face: -1, action: "point", expr: "evil_smug", heldItem: "magnifying" },
      ],
      props3d: [
        { type: "police_car", pos: [0.2, 0, -2.5], rotY: -0.2, scale: 1.05 },
        { type: "wanted_stars", pos: [-1.4, 4.0, 0.8], scale: 0.85 },
      ],
      fx: [
        { type: "radar", pos: [-1.4, 1.6, 0.8], atFrame: 948, durFrames: 60, scale: 1.2 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Policia: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_POLICIA_SPEC} />;
};

