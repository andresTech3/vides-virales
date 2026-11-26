import React from "react";
import activeSpec from "./active_spec.json";
import { ToonFreneticoEngine, type ToonFreneticoSpec } from "./ToonFreneticoEngine";

export const ACTIVE_TOON_SPEC = activeSpec as unknown as ToonFreneticoSpec;

export const ToonDinamico: React.FC = () => (
  <ToonFreneticoEngine spec={ACTIVE_TOON_SPEC} />
);

