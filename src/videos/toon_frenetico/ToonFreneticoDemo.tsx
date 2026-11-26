import React from "react";
import { ToonFreneticoEngine, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

export const TOON_FRENETICO_DEMO: ToonFreneticoSpec = {
  fps: 30,
  durationInFrames: 180,
  characters: {
    capitan: {
      shirt: "#2d4a8a",
      pants: "#1f2430",
      hat: "wide_hat",
      hatColor: "#222026",
      belt: true,
    },
    marinero: {
      shirt: "#FFFFFF",
      stripeColor: "#d93b3b",
      hat: "bandana",
      bandanaColor: "#d93b3b",
      mustache: true,
    },
  },
  shots: [
    {
      start: 0,
      end: 90,
      stage: "ocean_deck",
      skyMode: "day_cyan",
      camFrom: [-4, 4.2, 10.5],
      camTo: [-1.2, 3.2, 7.2],
      lookFrom: [0, 1.5, -1],
      lookTo: [0.2, 1.6, -1.5],
      fov: 48,
      punch: true,
      shakeAt: 35,
      actors: [
        { id: "capitan", pos: [-3.2, 0, -1.8], face: 1, action: "point", expr: "angry" },
        { id: "marinero", pos: [2.2, 0, -1.2], face: -1, action: "panic", expr: "shocked" },
      ],
      props3d: [
        { type: "pedestal", pos: [0, 0, -1.6], color: "#CA9363" },
        { type: "bottle", pos: [0, 1.0, -1.6], scale: 1.0, color: "#5A6069" },
        { type: "crate", pos: [-4.8, 0, -3.5], label: "EXTRACTO", color: "#CA9363" },
        { type: "barrel", pos: [4.2, 0, -3.2], color: "#DBAF72" },
      ],
      fx: [
        { type: "splinters", pos: [0.4, 1.4, -1.0], atFrame: 35, durFrames: 30 },
        { type: "boom", pos: [0.2, 1.8, -1.2], atFrame: 35, durFrames: 24 },
      ],
    },
    {
      start: 90,
      end: 180,
      stage: "ocean_deck",
      skyMode: "sunset_purple",
      camFrom: [4.5, 4.0, 9.5],
      camTo: [1.5, 3.0, 6.2],
      lookFrom: [0, 1.6, -1.2],
      lookTo: [0, 1.7, -1.5],
      fov: 46,
      punch: true,
      actors: [
        { id: "capitan", pos: [-2.0, 0, -1.4], face: 1, action: "talk", expr: "smug" },
        { id: "marinero", pos: [2.4, 0, -1.0], face: -1, action: "celebrate", expr: "happy" },
      ],
      props3d: [
        { type: "pedestal", pos: [0, 0, -1.6], color: "#DBAF72" },
        { type: "bottle", pos: [0, 1.0, -1.6], scale: 1.1, color: "#842A4A" },
        { type: "orb", pos: [0, 4.2, -1.6], scale: 1.1 },
      ],
      fx: [
        { type: "sparkles", pos: [0, 2.5, -1.6], atFrame: 105, durFrames: 50 },
      ],
    },
  ],
  captions: [
    { text: "una gota", startFrame: 25, endFrame: 60 },
    { text: "cambia todo", startFrame: 115, endFrame: 165 },
  ],
};

export const ToonFreneticoDemo: React.FC = () => {
  return <ToonFreneticoEngine spec={TOON_FRENETICO_DEMO} />;
};

