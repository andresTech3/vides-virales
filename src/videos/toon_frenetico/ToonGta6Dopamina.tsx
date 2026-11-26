import React from "react";
import { ToonFreneticoEngine, type ToonCaption, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

interface PhraseSeg {
  text: string;
  startSec: number;
  endSec: number;
}

const SEGMENTS: PhraseSeg[] = [
  { text: "GTA seis rompe TODO lo que conocías.", startSec: 0.05, endSec: 2.15 },
  { text: "Dos protagonistas. Vidas simultáneas. Cero pantallas de carga.", startSec: 2.45, endSec: 5.35 },
  { text: "Lucía atraca un banco AHORA.", startSec: 5.65, endSec: 7.25 },
  { text: "Jason está en un strip club gastando el botín.", startSec: 7.55, endSec: 9.85 },
  { text: "Cambias a Jason… y HEREDAS sus 4 estrellas.", startSec: 10.15, endSec: 12.55 },
  { text: "La policía te persigue EN AMBOS personajes.", startSec: 12.85, endSec: 14.95 },
  { text: "Leónida es TRES Vice Citys unidos.", startSec: 15.25, endSec: 17.05 },
  { text: "Pantanos con caimanes que te cazan de verdad.", startSec: 17.35, endSec: 19.25 },
  { text: "Playas donde la marea SUBLE Y BAJA cada hora.", startSec: 19.55, endSec: 21.55 },
  { text: "Ciudad neón con IA que recuerda tu ROSTRO días después.", startSec: 21.85, endSec: 24.45 },
  { text: "Cayo Perico INCLUIDO en el mapa principal.", startSec: 24.75, endSec: 26.55 },
  { text: "Armas nuevas: cuchillo táctico, drone explosivo, lanzacohetes guiado.", startSec: 26.85, endSec: 29.65 },
  { text: "Vehículos: hidroavión, muscle car eléctrico, airboat pantanero.", startSec: 29.95, endSec: 32.65 },
  { text: "El clima CAMBIA la jugada: lluvia = resbalón real, niebla = sigilo.", startSec: 32.95, endSec: 35.85 },
  { text: "¿Listo para el caos más grande de Rockstar?", startSec: 36.15, endSec: 38.55 },
];

const ACCENTS: Record<string, string> = {
  "GTA seis": "#FF4DC4",
  "TODO lo": "#FF5757",
  "Dos protagonistas.": "#FFE14D",
  "Vidas simultáneas.": "#2CE6FF",
  "Cero pantallas": "#4CE88A",
  "Lucía atraca": "#FF5757",
  "AHORA.": "#FFE14D",
  "strip club": "#FF4DC4",
  "gastando el": "#FFE169",
  "Cambias a": "#2CE6FF",
  "HEREDAS sus": "#FF5757",
  "4 estrellas.": "#FFE14D",
  "te persigue": "#FF5757",
  "AMBOS personajes.": "#FF4DC4",
  "Leónida es": "#FFE14D",
  "TRES Vice Citys": "#FF4DC4",
  "caimanes que": "#4CE88A",
  "cazan de": "#FF5757",
  "VERDAD.": "#FFE14D",
  "marea SUBLE": "#2CE6FF",
  "BAJA cada": "#2CE6FF",
  "hora.": "#FFE169",
  "ciudad neón": "#FF4DC4",
  "recuerda tu": "#FF5757",
  "ROSTRO días": "#FFE14D",
  "después.": "#FFE14D",
  "Cayo Perico": "#FFE14D",
  "INCLUIDO": "#4CE88A",
  "mapa principal.": "#2CE6FF",
  "cuchillo táctico,": "#FF5757",
  "drone explosivo,": "#FF4DC4",
  "lanzacohetes guiado.": "#FFE14D",
  "hidroavión,": "#2CE6FF",
  "muscle car eléctrico,": "#FF4DC4",
  "airboat pantanero.": "#4CE88A",
  "clima CAMBIA": "#FFE14D",
  "la jugada:": "#FF5757",
  "lluvia =": "#2CE6FF",
  "resbalón real,": "#FFE169",
  "niebla =": "#FF4DC4",
  "sigilo.": "#4CE88A",
  "¿Listo para": "#FFE14D",
  "caos más": "#FF5757",
  "grande de": "#FF4DC4",
  "Rockstar?": "#FFE14D",
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

export const TOON_GTA6_DOPAMINA_SPEC: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 1155,
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
    stripper: {
      shirt: "#FF3BA7",
      outfit: "casual",
      pants: "#1D2230",
      hair: "slick",
      hairColor: "#FFE169",
    },
    caiman: {
      shirt: "#2E7D32",
      outfit: "casual",
      pants: "#1B5E20",
      hair: "none",
    },
  },
  shots: [
    // 0-2.15s: HOOK EXPLOSIVO - Pantalla partida violenta
    {
      start: 0,
      end: 65,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [0, 12, 15],
      camTo: [0, 3, 5],
      lookFrom: [0, 0, 0],
      lookTo: [0, 1.8, 0],
      fov: 60,
      rollFrom: 15,
      rollTo: -8,
      camEase: "snap",
      punch: true,
      shakeAt: [0, 8, 16],
      flashAt: [0, 16],
      speedLines: "intense",
      vignette: 0.5,
      actors: [
        { id: "lucia", pos: [-2.5, 0, 1], face: 1, action: "panic", expr: "shocked", bubble: "!!", scale: 1.1 },
        { id: "jason", pos: [2.5, 0, 1], face: -1, action: "point", expr: "evil_smug", bubble: "!!", scale: 1.1 },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.5, -2], label: "GTA 6", color: "#FF4DC4", scale: 1.5, rotY: 0.3 },
        { type: "sign", pos: [0, 0.5, -2.5], label: "ROMPE TODO", color: "#FF5757", scale: 1.2 },
        { type: "wanted_stars", pos: [0, 4.5, 0.5], scale: 1.3 },
      ],
      fx: [
        { type: "comic_star", pos: [-2.5, 2.8, -0.5], atFrame: 0, durFrames: 18, scale: 1.3 },
        { type: "comic_star", pos: [2.5, 2.8, -0.5], atFrame: 0, durFrames: 18, scale: 1.3 },
        { type: "radar", pos: [0, 2.5, 0], atFrame: 4, durFrames: 40, scale: 1.5 },
        { type: "sparkles", pos: [0, 3, 0], atFrame: 8, durFrames: 30, scale: 1.2 },
      ],
    },

    // 2.45-5.35s: SPLIT SCREEN CONCEPT - Dos mundos
    {
      start: 65,
      end: 135,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [-8, 4, 10],
      camTo: [8, 4, 10],
      lookFrom: [-2, 1.8, 0],
      lookTo: [2, 1.8, 0],
      fov: 50,
      rollFrom: -10,
      rollTo: 10,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-3, 0, 0.5], toPos: [-1, 0, 0.5], face: 1, action: "run", expr: "terrified", heldItem: "money", bubble: "$$" },
        { id: "jason", pos: [3, 0, 0.5], toPos: [1, 0, 0.5], face: -1, action: "celebrate", expr: "dollar_eyes", heldItem: "briefcase", bubble: "$$" },
      ],
      props3d: [
        { type: "car", pos: [-4, 0, -1], toPos: [-2, 0, -1], rotY: -0.3, scale: 1.0, color: "#E63946" },
        { type: "sign", pos: [-3, 1.2, -2], label: "BANCO", color: "#FFE14D", scale: 0.8 },
        { type: "sign", pos: [3, 1.2, -2], label: "CLUB", color: "#FF3BA7", scale: 0.8 },
        { type: "money", pos: [0, 0, 0], scale: 1.5 },
      ],
      fx: [
        { type: "flying_bills", pos: [-1.5, 2, 0.5], atFrame: 70, durFrames: 40, scale: 1.3 },
        { type: "flying_bills", pos: [1.5, 2, 0.5], atFrame: 70, durFrames: 40, scale: 1.3 },
        { type: "sparkles", pos: [0, 2.5, 0], atFrame: 75, durFrames: 35, scale: 1.0 },
      ],
    },

    // 5.65-7.25s: LUCÍA ATACA BANCO - Interior dramático
    {
      start: 135,
      end: 185,
      stage: "office_interior",
      skyMode: "dramatic_dark",
      floorStyle: "tile_checker",
      camFrom: [0, 2.5, 6],
      camTo: [0.5, 2.2, 3.5],
      lookFrom: [0, 1.9, 0],
      lookTo: [0, 2.1, 0],
      fov: 36,
      rollFrom: 0,
      rollTo: 0,
      camEase: "snap",
      punch: true,
      shakeAt: [138, 150, 162],
      flashAt: [138, 162],
      vignette: 0.6,
      actors: [
        { id: "lucia", pos: [0, 0, 0.3], face: 1, action: "point", expr: "angry", heldItem: "money", bubble: "!!", scale: 1.2 },
        { id: "policia", pos: [2, 0, 0.5], face: -1, action: "panic", expr: "terrified", bubble: "!" },
      ],
      props3d: [
        { type: "desk", pos: [0, 0, -2], scale: 1.0, color: "#7D4829" },
        { type: "money", pos: [0, 0, 0], scale: 2.0 },
        { type: "sign", pos: [0, 0.5, -1.5], label: "ATRACO", color: "#FF5757", scale: 1.1 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.5, -0.5], atFrame: 138, durFrames: 20, scale: 1.2 },
        { type: "splinters", pos: [0, 1.8, 0], atFrame: 150, durFrames: 24, scale: 1.3 },
        { type: "flying_bills", pos: [0, 2, 0.5], atFrame: 155, durFrames: 35, scale: 1.5 },
        { type: "radar", pos: [0, 1.5, 0.5], atFrame: 140, durFrames: 30, scale: 1.0 },
      ],
    },

    // 7.55-9.85s: JASON EN STRIP CLUB - Neon rosa
    {
      start: 185,
      end: 245,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [5, 3, 8],
      camTo: [-3, 2.8, 6],
      lookFrom: [0, 1.6, 0],
      lookTo: [0, 1.7, 0],
      fov: 44,
      rollFrom: -8,
      rollTo: 5,
      camEase: "whip",
      punch: true,
      speedLines: true,
      actors: [
        { id: "jason", pos: [0, 0, 0.5], face: 1, action: "celebrate", expr: "dollar_eyes", heldItem: "money", bubble: "$$" },
        { id: "stripper", pos: [-1.5, 0, 0.5], face: 1, action: "laugh", expr: "laughing", bubble: "laugh" },
        { id: "stripper", pos: [1.5, 0, 0.5], face: -1, action: "celebrate", expr: "happy", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.5, -2], label: "VANILLA UNICORN", color: "#FF3BA7", scale: 1.2 },
        { type: "sign", pos: [0, 0.5, -2.5], label: "GASTANDO BOTÍN", color: "#FFE169", scale: 0.9 },
        { type: "money", pos: [0, 0, 0.2], scale: 1.5 },
        { type: "bottle", pos: [1.2, 0, 0.3], color: "#D94E3B", scale: 0.9 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0.3], atFrame: 190, durFrames: 40, scale: 1.2 },
        { type: "flying_bills", pos: [0, 2, 0.5], atFrame: 200, durFrames: 40, scale: 1.3 },
        { type: "radar", pos: [-1.5, 1.8, 0.5], atFrame: 210, durFrames: 30, scale: 0.9 },
      ],
    },

    // 10.15-12.55s: CAMBIO INSTANTÁNEO - Transición violenta
    {
      start: 245,
      end: 295,
      stage: "vice_city",
      skyMode: "dramatic_dark",
      floorStyle: "asphalt_road",
      camFrom: [0, 4, 8],
      camTo: [0, 2.5, 4],
      lookFrom: [0, 2, 0],
      lookTo: [0, 2.2, 0],
      fov: 34,
      rollFrom: 0,
      rollTo: 0,
      camEase: "snap",
      punch: true,
      shakeAt: [246, 247, 248, 249, 250, 255, 265, 275],
      flashAt: [246, 250, 260, 270],
      speedLines: "intense",
      vignette: 0.7,
      actors: [
        { id: "lucia", pos: [-1, 0, 0.2], face: 1, action: "panic", expr: "shocked", scale: 1.25, bubble: "!!" },
        { id: "jason", pos: [1, 0, 0.2], face: -1, action: "panic", expr: "shocked", scale: 1.25, bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.2, -1.5], label: "CAMBIO", color: "#FF4DC4", scale: 1.3, rotY: 0.2 },
        { type: "sign", pos: [0, 0.4, -2], label: "INSTANTÁNEO", color: "#2CE6FF", scale: 1.1 },
        { type: "wanted_stars", pos: [0, 4, 0.3], scale: 1.5 },
      ],
      fx: [
        { type: "comic_star", pos: [0, 2.8, -0.3], atFrame: 246, durFrames: 18, scale: 1.5 },
        { type: "comic_star", pos: [-1, 2.5, 0.2], atFrame: 247, durFrames: 18, scale: 1.3 },
        { type: "comic_star", pos: [1, 2.5, 0.2], atFrame: 248, durFrames: 18, scale: 1.3 },
        { type: "radar", pos: [0, 2, 0], atFrame: 248, durFrames: 40, scale: 1.5 },
        { type: "sparkles", pos: [0, 2.8, 0], atFrame: 250, durFrames: 30, scale: 1.4 },
      ],
    },

    // 12.85-14.95s: POLICÍA PERSIGUE AMBOS - Split persecución
    {
      start: 295,
      end: 355,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [-6, 3.5, 10],
      camTo: [6, 3.5, 10],
      lookFrom: [-1, 1.5, 0],
      lookTo: [1, 1.5, 0],
      fov: 48,
      rollFrom: -5,
      rollTo: 5,
      camEase: "whip",
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-3, 0.3, 1.5], toPos: [1, 0.3, 1.5], face: 1, action: "run", expr: "terrified", bubble: "!!" },
        { id: "jason", pos: [3, 0.3, 1.5], toPos: [-1, 0.3, 1.5], face: -1, action: "run", expr: "terrified", bubble: "!!" },
        { id: "policia", pos: [-5, 0, 1], toPos: [1, 0, 1], face: 1, action: "run", expr: "angry" },
        { id: "policia", pos: [5, 0, 1], toPos: [-1, 0, 1], face: -1, action: "run", expr: "angry" },
      ],
      props3d: [
        { type: "car", pos: [-4, 0, 0], toPos: [2, 0, 0], rotY: 0.1, scale: 1.1, color: "#E63946" },
        { type: "police_car", pos: [-3, 0, -1], toPos: [3, 0, -1], rotY: 0.1, scale: 1.0 },
        { type: "police_car", pos: [3, 0, -1], toPos: [-3, 0, -1], rotY: -0.1, scale: 1.0 },
        { type: "wanted_stars", pos: [0, 4.5, 0.5], scale: 1.4 },
      ],
      fx: [
        { type: "smoke", pos: [-4, 0.5, -0.2], atFrame: 298, durFrames: 30, scale: 1.2 },
        { type: "smoke", pos: [4, 0.5, -0.2], atFrame: 298, durFrames: 30, scale: 1.2 },
        { type: "radar", pos: [-1, 1.8, 0.5], atFrame: 300, durFrames: 40, scale: 1.2 },
        { type: "radar", pos: [1, 1.8, 0.5], atFrame: 300, durFrames: 40, scale: 1.2 },
        { type: "splinters", pos: [0, 1.5, 0], atFrame: 320, durFrames: 25, scale: 1.0 },
      ],
    },

    // 15.25-17.05s: MAPA LEÓNIDA - Vista aérea épica
    {
      start: 355,
      end: 405,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [0, 25, 30],
      camTo: [0, 8, 12],
      lookFrom: [0, -5, -10],
      lookTo: [0, 0, -5],
      fov: 55,
      rollFrom: -15,
      rollTo: 0,
      camEase: "snap",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-3, 0, 2], face: 1, action: "celebrate", expr: "shocked", scale: 0.9, bubble: "!" },
        { id: "jason", pos: [3, 0, 2], face: -1, action: "celebrate", expr: "smug", scale: 0.9, bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 2, -5], label: "LEÓNIDA", color: "#FF4DC4", scale: 2.0 },
        { type: "sign", pos: [0, 1.2, -5.5], label: "3X VICE CITY", color: "#FFE14D", scale: 1.5 },
        { type: "sign", pos: [-8, 0.8, -8], label: "PANTANOS", color: "#4CE88A", scale: 1.0, rotY: -0.3 },
        { type: "sign", pos: [8, 0.8, -8], label: "PLAYAS", color: "#2CE6FF", scale: 1.0, rotY: 0.3 },
        { type: "sign", pos: [0, 0.8, -3], label: "CIUDAD NEÓN", color: "#FF3BA7", scale: 1.2 },
        { type: "sign", pos: [12, 0.8, -12], label: "CAYO PERICO", color: "#FFE14D", scale: 1.0, rotY: 0.5 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 3, -4], atFrame: 358, durFrames: 40, scale: 2.0 },
        { type: "radar", pos: [0, 2.5, -3], atFrame: 360, durFrames: 45, scale: 1.8 },
      ],
    },

    // 17.35-19.25s: PANTANOS - Caimanes reales
    {
      start: 405,
      end: 455,
      stage: "city_street",
      skyMode: "golden_hour",
      floorStyle: "grass_path",
      camFrom: [-4, 2.5, 7],
      camTo: [2, 2.2, 5],
      lookFrom: [0, 1.2, 0],
      lookTo: [0, 1.3, 0],
      fov: 42,
      rollFrom: -6,
      rollTo: 4,
      camEase: "whip",
      punch: true,
      shakeAt: [408, 420, 435],
      actors: [
        { id: "lucia", pos: [-1.5, 0, 0.5], face: 1, action: "sneak", expr: "terrified", bubble: "!" },
        { id: "caiman", pos: [1.5, 0, 0.5], face: -1, action: "run", expr: "evil_smug", scale: 1.3, bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.6, -1.5], label: "CAIMÁN TE CAZA", color: "#FF5757", scale: 1.1 },
        { type: "sign", pos: [0, 1.2, -2], label: "IA DEPREDADORA", color: "#4CE88A", scale: 0.9 },
        { type: "crate", pos: [-2.5, 0, -1.5], label: "BOTE", color: "#2CE6FF", scale: 0.8 },
      ],
      fx: [
        { type: "comic_star", pos: [1.5, 2.2, 0.3], atFrame: 408, durFrames: 20, scale: 1.2 },
        { type: "splinters", pos: [1.5, 1.5, 0.5], atFrame: 420, durFrames: 25, scale: 1.1 },
        { type: "radar", pos: [1.5, 1.5, 0.5], atFrame: 425, durFrames: 30, scale: 1.0 },
      ],
    },

    // 19.55-21.55s: PLAYAS - Marea dinámica
    {
      start: 455,
      end: 505,
      stage: "ocean_deck",
      skyMode: "sunset_purple",
      floorStyle: "grass_path",
      camFrom: [5, 3, 8],
      camTo: [-3, 2.5, 6],
      lookFrom: [0, 1.2, 0],
      lookTo: [0, 1.4, 0],
      fov: 46,
      rollFrom: 8,
      rollTo: -5,
      camEase: "whip",
      punch: true,
      flashAt: [458, 480],
      actors: [
        { id: "jason", pos: [0, 0, 0.5], face: 1, action: "celebrate", expr: "happy", heldItem: "money", bubble: "$$" },
      ],
      props3d: [
        { type: "sign", pos: [0, 0.8, -1.5], label: "MAREA SUBE", color: "#2CE6FF", scale: 1.1, rotY: 0.2 },
        { type: "sign", pos: [0, 0.3, -2], label: "MAREA BAJA", color: "#4CE88A", scale: 1.1, rotY: -0.2 },
        { type: "ship", pos: [8, 0, -5], rotY: 0.5, scale: 1.0 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2, 0], atFrame: 458, durFrames: 35, scale: 1.2 },
        { type: "radar", pos: [0, 1.5, -1], atFrame: 470, durFrames: 30, scale: 1.0 },
      ],
    },

    // 21.85-24.45s: CIUDAD NEÓN - IA recuerda rostro
    {
      start: 505,
      end: 565,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [0, 2.5, 5],
      camTo: [0.3, 2.3, 3.2],
      lookFrom: [0, 2, 0],
      lookTo: [0, 2.2, 0],
      fov: 35,
      rollFrom: 0,
      rollTo: 0,
      camEase: "snap",
      punch: true,
      shakeAt: [508, 520, 535, 550],
      flashAt: [508, 535],
      vignette: 0.65,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-0.8, 0, 0.2], face: 1, action: "panic", expr: "terrified", scale: 1.3, bubble: "!!" },
        { id: "policia", pos: [0.8, 0, 0.2], face: -1, action: "lean_in", expr: "evil_smug", scale: 1.3, bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.5, -1.5], label: "ROSTRO MEMORIZADO", color: "#FF4DC4", scale: 1.2 },
        { type: "sign", pos: [0, 0.6, -2], label: "DÍAS DESPUÉS", color: "#FFE14D", scale: 1.0 },
        { type: "orb", pos: [0, 2.5, 0.5], scale: 0.8 },
      ],
      fx: [
        { type: "radar", pos: [-0.8, 1.8, 0.5], atFrame: 508, durFrames: 35, scale: 1.3 },
        { type: "radar", pos: [0.8, 1.8, 0.5], atFrame: 520, durFrames: 35, scale: 1.3 },
        { type: "comic_star", pos: [0, 2.5, -0.3], atFrame: 535, durFrames: 20, scale: 1.5 },
        { type: "sparkles", pos: [0, 2.2, 0.3], atFrame: 545, durFrames: 30, scale: 1.2 },
      ],
    },

    // 24.75-26.55s: CAYO PERICO - Isla incluida
    {
      start: 565,
      end: 615,
      stage: "ocean_deck",
      skyMode: "sunset_purple",
      floorStyle: "grass_path",
      camFrom: [10, 5, 15],
      camTo: [-2, 3, 7],
      lookFrom: [0, 1, -2],
      lookTo: [0, 1.5, -1],
      fov: 50,
      rollFrom: -10,
      rollTo: 5,
      camEase: "whip",
      punch: true,
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-2, 0, 1], face: 1, action: "point", expr: "shocked", bubble: "!" },
        { id: "jason", pos: [2, 0, 1], face: -1, action: "point", expr: "smug", bubble: "!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.5, -3], label: "CAYO PERICO", color: "#FFE14D", scale: 1.5 },
        { type: "sign", pos: [0, 0.8, -3.5], label: "EN MAPA PRINCIPAL", color: "#4CE88A", scale: 1.1 },
        { type: "ship", pos: [6, 0, -8], rotY: 0.3, scale: 1.2 },
        { type: "sign", pos: [-5, 0.6, -4], label: "FIESTA", color: "#FF3BA7", scale: 0.9 },
        { type: "sign", pos: [5, 0.6, -4], label: "HEIST", color: "#2CE6FF", scale: 0.9 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.5, -2], atFrame: 568, durFrames: 40, scale: 1.5 },
        { type: "flying_bills", pos: [0, 2, -1.5], atFrame: 575, durFrames: 35, scale: 1.3 },
        { type: "radar", pos: [0, 2, -2], atFrame: 580, durFrames: 30, scale: 1.2 },
      ],
    },

    // 26.85-29.65s: ARMAS NUEVAS - Montaje rápido
    {
      start: 615,
      end: 685,
      stage: "industrial_yard",
      skyMode: "dramatic_dark",
      floorStyle: "cobble",
      camFrom: [-3, 2.5, 6],
      camTo: [3, 2.5, 6],
      lookFrom: [0, 1.5, 0],
      lookTo: [0, 1.5, 0],
      fov: 40,
      rollFrom: -8,
      rollTo: 8,
      camEase: "snap",
      punch: true,
      shakeAt: [618, 628, 638, 648, 658, 668],
      flashAt: [618, 638, 658],
      speedLines: "intense",
      actors: [
        { id: "lucia", pos: [-1.5, 0, 0.5], face: 1, action: "point", expr: "angry", heldItem: "wrench", bubble: "!!" },
        { id: "jason", pos: [1.5, 0, 0.5], face: -1, action: "point", expr: "evil_smug", heldItem: "torch", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [-3, 0.8, -1.5], label: "CUCHILLO TÁCTICO", color: "#FF5757", scale: 0.9 },
        { type: "sign", pos: [0, 0.8, -1.5], label: "DRONE EXPLOSIVO", color: "#FF4DC4", scale: 0.9 },
        { type: "sign", pos: [3, 0.8, -1.5], label: "LANZACOHETES GUIADO", color: "#FFE14D", scale: 0.9 },
        { type: "crate", pos: [-2, 0, -2], label: "ARMAS", color: "#FFE169", scale: 0.8 },
        { type: "crate", pos: [2, 0, -2], label: "TECH", color: "#2CE6FF", scale: 0.8 },
      ],
      fx: [
        { type: "comic_star", pos: [-3, 2.2, -0.5], atFrame: 618, durFrames: 18, scale: 1.1 },
        { type: "comic_star", pos: [0, 2.2, -0.5], atFrame: 628, durFrames: 18, scale: 1.1 },
        { type: "comic_star", pos: [3, 2.2, -0.5], atFrame: 638, durFrames: 18, scale: 1.1 },
        { type: "explosion_plume", pos: [0, 1.5, -0.5], atFrame: 648, durFrames: 30, scale: 1.3 },
        { type: "radar", pos: [0, 1.8, 0], atFrame: 658, durFrames: 25, scale: 1.0 },
      ],
    },

    // 29.95-32.65s: VEHÍCULOS NUEVOS - Montaje velocista
    {
      start: 685,
      end: 755,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [-8, 3, 12],
      camTo: [8, 3, 12],
      lookFrom: [-2, 1.2, 0],
      lookTo: [2, 1.2, 0],
      fov: 52,
      rollFrom: -12,
      rollTo: 12,
      camEase: "whip",
      speedLines: "intense",
      punch: true,
      shakeAt: [688, 700, 712, 724, 736, 748],
      actors: [
        { id: "lucia", pos: [-2, 0.3, 1.5], toPos: [2, 0.3, 1.5], face: 1, action: "celebrate", expr: "laughing" },
        { id: "jason", pos: [2, 0.3, 1.5], toPos: [-2, 0.3, 1.5], face: -1, action: "celebrate", expr: "laughing" },
      ],
      props3d: [
        { type: "car", pos: [-5, 0, 0], toPos: [5, 0, 0], rotY: 0.1, scale: 1.1, color: "#2CE6FF" },
        { type: "sign", pos: [-5, 1.2, -2], label: "MUSCLE ELÉCTRICO", color: "#FF4DC4", scale: 0.85 },
        { type: "sign", pos: [0, 1.2, -2], label: "HIDROAVIÓN", color: "#2CE6FF", scale: 0.85 },
        { type: "sign", pos: [5, 1.2, -2], label: "AIRBOAT PANTANERO", color: "#4CE88A", scale: 0.85 },
        { type: "ship", pos: [0, 0, -8], rotY: 0, scale: 0.8 },
      ],
      fx: [
        { type: "smoke", pos: [-5, 0.5, -0.2], atFrame: 688, durFrames: 25, scale: 1.2 },
        { type: "sparkles", pos: [0, 2.5, -1], atFrame: 700, durFrames: 30, scale: 1.2 },
        { type: "radar", pos: [0, 2, -1], atFrame: 712, durFrames: 30, scale: 1.1 },
        { type: "flying_bills", pos: [0, 2, 0], atFrame: 724, durFrames: 35, scale: 1.3 },
      ],
    },

    // 32.95-35.85s: CLIMA DINÁMICO - Lluvia/niebla gameplay
    {
      start: 755,
      end: 825,
      stage: "city_street",
      skyMode: "dramatic_dark",
      floorStyle: "cobble",
      camFrom: [0, 3, 7],
      camTo: [0.5, 2.5, 4.5],
      lookFrom: [0, 1.8, 0],
      lookTo: [0, 2, 0],
      fov: 38,
      rollFrom: 0,
      rollTo: 0,
      camEase: "snap",
      punch: true,
      shakeAt: [758, 770, 785, 800],
      flashAt: [758, 785],
      vignette: 0.5,
      speedLines: true,
      actors: [
        { id: "lucia", pos: [-1, 0, 0.3], face: 1, action: "sneak", expr: "sweating", bubble: "?" },
        { id: "jason", pos: [1, 0, 0.3], face: -1, action: "run", expr: "terrified", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [-2.5, 0.8, -1.5], label: "LLUVIA = RESVALÓN", color: "#2CE6FF", scale: 0.95 },
        { type: "sign", pos: [2.5, 0.8, -1.5], label: "NIEBLA = SIGILO", color: "#FF4DC4", scale: 0.95 },
        { type: "sign", pos: [0, 0.3, -2], label: "GAMEPLAY CAMBIA", color: "#FFE14D", scale: 1.1 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.2, 0], atFrame: 758, durFrames: 35, scale: 1.1 },
        { type: "radar", pos: [-1, 1.8, 0.3], atFrame: 770, durFrames: 25, scale: 1.0 },
        { type: "radar", pos: [1, 1.8, 0.3], atFrame: 785, durFrames: 25, scale: 1.0 },
        { type: "comic_star", pos: [0, 2.5, -0.3], atFrame: 800, durFrames: 20, scale: 1.3 },
        { type: "splinters", pos: [0, 1.5, 0], atFrame: 810, durFrames: 20, scale: 0.9 },
      ],
    },

    // 36.15-38.55s: REMAte FINAL - Caos total
    {
      start: 825,
      end: 1155,
      stage: "vice_city",
      skyMode: "vice_neon",
      floorStyle: "asphalt_road",
      camFrom: [0, 4, 10],
      camTo: [0, 12, 25],
      lookFrom: [0, 1.5, -2],
      lookTo: [0, 2, -8],
      fov: 55,
      rollFrom: 0,
      rollTo: 0,
      camEase: "whip",
      speedLines: "intense",
      punch: true,
      shakeAt: [828, 860, 890, 920, 950, 980, 1010, 1040, 1070, 1100, 1130],
      flashAt: [828, 890, 950, 1010, 1070, 1130],
      actors: [
        { id: "lucia", pos: [-2, 0, 1], face: 1, action: "celebrate", expr: "shocked", bubble: "?" },
        { id: "jason", pos: [2, 0, 1], face: -1, action: "celebrate", expr: "smug", bubble: "!" },
        { id: "policia", pos: [0, 0, 2], face: 1, action: "point", expr: "angry", bubble: "!!" },
      ],
      props3d: [
        { type: "sign", pos: [0, 1.5, -3], label: "GTA 6", color: "#FF4DC4", scale: 1.8 },
        { type: "sign", pos: [0, 0.8, -3.5], label: "CAOS MÁXIMO", color: "#FF5757", scale: 1.4 },
        { type: "sign", pos: [0, 0.2, -4], label: "ROCKSTAR LO LOGRÓ", color: "#FFE14D", scale: 1.2 },
        { type: "wanted_stars", pos: [0, 4.5, 0], scale: 1.5 },
        { type: "police_car", pos: [2, 0, -3], rotY: -0.2, scale: 1.0 },
        { type: "police_car", pos: [-2, 0, -3], rotY: 0.2, scale: 1.0 },
        { type: "car", pos: [0, 0, 2], rotY: 0.1, scale: 1.1, color: "#E63946" },
        { type: "orb", pos: [0, 4, 1], scale: 1.0 },
      ],
      fx: [
        { type: "radar", pos: [-2, 2, 0.5], atFrame: 828, durFrames: 60, scale: 1.5 },
        { type: "radar", pos: [2, 2, 0.5], atFrame: 828, durFrames: 60, scale: 1.5 },
        { type: "sparkles", pos: [0, 3, -1], atFrame: 835, durFrames: 50, scale: 2.0 },
        { type: "comic_star", pos: [0, 2.8, -0.5], atFrame: 860, durFrames: 25, scale: 1.4 },
        { type: "flying_bills", pos: [0, 2.5, 0], atFrame: 890, durFrames: 40, scale: 1.5 },
        { type: "explosion_plume", pos: [0, 1.5, -1], atFrame: 920, durFrames: 35, scale: 1.5 },
        { type: "comic_star", pos: [0, 3, -0.5], atFrame: 950, durFrames: 25, scale: 1.5 },
        { type: "flying_bills", pos: [0, 2, 0.5], atFrame: 980, durFrames: 40, scale: 1.5 },
        { type: "sparkles", pos: [0, 3.5, -1.5], atFrame: 1010, durFrames: 50, scale: 2.0 },
        { type: "radar", pos: [0, 2.5, 0], atFrame: 1040, durFrames: 50, scale: 1.5 },
        { type: "comic_star", pos: [0, 2.8, -0.3], atFrame: 1070, durFrames: 25, scale: 1.6 },
        { type: "flying_bills", pos: [0, 2, 0], atFrame: 1100, durFrames: 40, scale: 1.6 },
        { type: "explosion_plume", pos: [0, 2, -1], atFrame: 1130, durFrames: 25, scale: 1.4 },
      ],
    },
  ],
  captions: buildCaptions(),
};

export const ToonGta6Dopamina: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_GTA6_DOPAMINA_SPEC} />;
};