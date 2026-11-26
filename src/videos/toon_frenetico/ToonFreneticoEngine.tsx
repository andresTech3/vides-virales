import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  makeComicFacePropTexture,
  makeToonTexture,
  type ToonAction,
  type ToonBubbleIcon,
  type ToonCharStyle,
  type ToonExpr,
  type ToonHeldItem,
} from "./toonCharacters";

export interface ToonActor {
  id: string;
  pos: [number, number, number];
  toPos?: [number, number, number];
  face?: 1 | -1;
  scale?: number;
  action: ToonAction;
  expr: ToonExpr;
  heldItem?: ToonHeldItem;
  bubble?: ToonBubbleIcon;
}

export type ToonPropType =
  | "bottle"
  | "crate"
  | "barrel"
  | "pedestal"
  | "orb"
  | "eiffel"
  | "money"
  | "sack"
  | "doc"
  | "desk"
  | "truck"
  | "ship"
  | "car"
  | "police_car"
  | "wanted_stars"
  | "sign"
  | "lamp"
  | "xray_knee"
  | "xray_spine"
  | "elevator_building"
  | "swollen_battery"
  | "tsunami_wall"
  | "fish_flop"
  | "pan_fire"
  | "metal_lid";

export interface ToonProp3D {
  type: ToonPropType;
  pos: [number, number, number];
  toPos?: [number, number, number];
  rotY?: number;
  scale?: number;
  color?: string;
  label?: string;
  faceExpr?: "deadpan" | "shocked" | "smug";
}

export type ToonFXType =
  | "boom"
  | "sparkles"
  | "smoke"
  | "splinters"
  | "comic_star"
  | "flames"
  | "flying_bills"
  | "explosion_plume"
  | "radar";

export interface ToonFX {
  type: ToonFXType;
  pos: [number, number, number];
  atFrame: number;
  durFrames?: number;
  scale?: number;
}

export type ToonStageType =
  | "paris_plaza"
  | "office_interior"
  | "industrial_yard"
  | "brick_corridor"
  | "city_street"
  | "vice_city"
  | "ocean_deck";

export type ToonSkyMode =
  | "day_cyan"
  | "golden_hour"
  | "sunset_purple"
  | "vice_neon"
  | "dramatic_dark"
  | "interior_warm";

export interface ToonCustomBlock {
  shape: "box" | "cylinder" | "sphere" | "cone" | "bars" | "shelf" | "skyscraper" | "server_rack" | "crane" | "arcade_row";
  pos: [number, number, number];
  size?: [number, number, number];
  color?: string;
  accent?: string;
  rotY?: number;
  rotZ?: number;
  label?: string;
  repeat?: [number, number, number, number]; // [nx, nz, stepX, stepZ]
}

export interface ToonShot {
  start: number;
  end: number;
  stage: ToonStageType;
  skyMode: ToonSkyMode;
  horizon?: "paris" | "city" | "vice_city" | "city_blocks" | "neon_alley" | "office_cubicles" | "palace_hall" | "interior" | "elevator_cabin" | "elevator_shaft" | "supermarket_aisle" | "bedroom_night" | "beach_shore" | "kitchen_stove" | "ocean" | "park";
  floorStyle?: "cobble" | "wood_planks" | "grass_path" | "tile_checker" | "brick_grid" | "asphalt_road" | "diamond_carpet" | "solid_grid" | "crosswalk_city";
  floorColor?: string;
  floorAccent?: string;
  wallColor?: string;
  trimColor?: string;
  customBlocks?: ToonCustomBlock[];
  whipBlur?: boolean;
  camFrom: [number, number, number];
  camTo: [number, number, number];
  lookFrom: [number, number, number];
  lookTo: [number, number, number];
  fov?: number;
  rollFrom?: number;
  rollTo?: number;
  camEase?: "fast" | "whip" | "snap" | "linear";
  punch?: boolean;
  shakeAt?: number | number[];
  flashAt?: number | number[];
  speedLines?: boolean | "intense";
  vignette?: number;
  actors: ToonActor[];
  props3d?: ToonProp3D[];
  fx?: ToonFX[];
}

export interface ToonCaption {
  text: string;
  startFrame: number;
  endFrame: number;
  accentColor?: string;
}

export interface ToonFreneticoSpec {
  fps: number;
  durationInFrames: number;
  characters: Record<string, ToonCharStyle>;
  shots: ToonShot[];
  captions: ToonCaption[];
}

const INK = "#141218";

const applyEase = (t: number, mode: ToonShot["camEase"] = "fast") => {
  const c = Math.max(0, Math.min(1, t));
  if (mode === "linear") return c;
  if (mode === "whip") {
    // Barrido ultra agresivo en el primer 30% + deslizamiento constante
    return c < 0.3 ? (1 - Math.pow(1 - c / 0.3, 3)) * 0.78 : 0.78 + ((c - 0.3) / 0.7) * 0.22;
  }
  if (mode === "snap") {
    return 1 - Math.pow(1 - c, 3.8);
  }
  return 1 - Math.pow(1 - c, 2.2);
};

const lerpTuple = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// --- TEXTURAS PROCEDURALES CARTOON CON CONTORNOS ---
function makeFloorTexture(
  style: NonNullable<ToonShot["floorStyle"]>,
  baseColor?: string,
  accentColor?: string
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  if (style === "cobble") {
    ctx.fillStyle = "#C7BFB2";
    ctx.fillRect(0, 0, 512, 512);
    const cols = 8;
    const rows = 8;
    const w = 512 / cols;
    const h = 512 / rows;
    ctx.strokeStyle = "#3a3530";
    ctx.lineWidth = 4;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (w * 0.5);
      for (let col = -1; col <= cols; col++) {
        ctx.fillStyle = (r + col) % 3 === 0 ? "#B8B0A2" : (r + col) % 2 === 0 ? "#D4CCC0" : "#C7BFB2";
        ctx.fillRect(col * w + off, r * h, w, h);
        ctx.strokeRect(col * w + off, r * h, w, h);
      }
    }
  } else if (style === "grass_path") {
    ctx.fillStyle = "#4EB857";
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = "#3EA348";
    for (let i = 0; i < 32; i++) {
      ctx.fillRect(((i * 73) % 480), ((i * 137) % 480), 34, 14);
    }
    // Camino central de adoquín
    ctx.fillStyle = "#D8CEBC";
    ctx.fillRect(156, 0, 200, 512);
    ctx.strokeStyle = "#3a3530";
    ctx.lineWidth = 5;
    ctx.strokeRect(156, -4, 200, 520);
  } else if (style === "tile_checker") {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#EDE4D0" : "#5D697A";
        ctx.fillRect(x * 64, y * 64, 64, 64);
        ctx.strokeStyle = "#2b2a30";
        ctx.lineWidth = 3;
        ctx.strokeRect(x * 64, y * 64, 64, 64);
      }
    }
  } else if (style === "asphalt_road") {
    ctx.fillStyle = "#2E323D";
    ctx.fillRect(0, 0, 512, 512);
    // Aceras laterales iluminadas
    ctx.fillStyle = "#A9A3B0";
    ctx.fillRect(0, 0, 74, 512);
    ctx.fillRect(438, 0, 74, 512);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(74, 0);
    ctx.lineTo(74, 512);
    ctx.moveTo(438, 0);
    ctx.lineTo(438, 512);
    ctx.stroke();
    // Línea amarilla central discontinua
    ctx.fillStyle = "#FFE14D";
    for (let y = 16; y < 512; y += 96) {
      ctx.fillRect(246, y, 20, 56);
    }
  } else if (style === "diamond_carpet") {
    ctx.fillStyle = baseColor || "#9E2A2B";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = accentColor || "#E2B144";
    ctx.lineWidth = 6;
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x + 32, y + 6);
        ctx.lineTo(x + 58, y + 32);
        ctx.lineTo(x + 32, y + 58);
        ctx.lineTo(x + 6, y + 32);
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (style === "solid_grid") {
    ctx.fillStyle = baseColor || "#1F4E9E";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = accentColor || "rgba(255,255,255,0.16)";
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else if (style === "crosswalk_city") {
    ctx.fillStyle = baseColor || "#434A54";
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = accentColor || "#F2F4F8";
    for (let x = 32; x < 480; x += 72) {
      ctx.fillRect(x, 180, 40, 152);
    }
  } else if (style === "brick_grid") {
    ctx.fillStyle = "#B86852";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#3d1e15";
    ctx.lineWidth = 5;
    for (let r = 0; r < 8; r++) {
      const off = (r % 2) * 64;
      for (let col = -1; col <= 4; col++) {
        ctx.fillStyle = (r + col) % 2 === 0 ? "#B86852" : "#9E523E";
        ctx.fillRect(col * 128 + off, r * 64, 128, 64);
        ctx.strokeRect(col * 128 + off, r * 64, 128, 64);
      }
    }
  } else {
    // wood_planks con clavos estilo srz_reel_001
    ctx.fillStyle = "#DBAF72";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#2b1b10";
    ctx.lineWidth = 4;
    for (let y = 0; y < 512; y += 64) {
      ctx.fillStyle = (y / 64) % 2 === 0 ? "#DBAF72" : "#CA9363";
      ctx.fillRect(0, y, 512, 64);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
      const xJoint = ((y / 64) * 190 + 80) % 512;
      ctx.beginPath();
      ctx.moveTo(xJoint, y);
      ctx.lineTo(xJoint, y + 64);
      ctx.stroke();
      ctx.fillStyle = "#2b1b10";
      ctx.beginPath();
      ctx.arc((xJoint + 24) % 512, y + 16, 4, 0, Math.PI * 2);
      ctx.arc((xJoint + 24) % 512, y + 48, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCrateLabelTexture(text: string, bg: string, sub?: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 14;
  ctx.strokeRect(8, 8, 496, 240);
  ctx.fillStyle = "#1c1510";
  ctx.font = "900 72px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.slice(0, 13).toUpperCase(), 256, sub ? 105 : 128);
  if (sub) {
    ctx.font = "800 36px Arial, sans-serif";
    ctx.fillStyle = "#b82d2d";
    ctx.fillText(sub.slice(0, 18).toUpperCase(), 256, 185);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDocTexture(title: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F7F3E3";
  ctx.fillRect(0, 0, 384, 512);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 372, 500);
  ctx.fillStyle = "#1c1a17";
  ctx.font = "900 40px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title.slice(0, 12).toUpperCase(), 192, 74);
  ctx.fillStyle = "#444";
  for (let y = 135; y <= 345; y += 38) {
    ctx.fillRect(46, y, 292, 12);
  }
  // Sello rojo oficial
  ctx.strokeStyle = "#d93b3b";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(260, 420, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#d93b3b";
  ctx.font = "900 22px Arial, sans-serif";
  ctx.fillText("OFICIAL", 260, 427);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSkyTexture(mode: ToonSkyMode): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  if (mode === "sunset_purple") {
    grad.addColorStop(0.0, "#291B37");
    grad.addColorStop(0.38, "#53294A");
    grad.addColorStop(0.68, "#842A4A");
    grad.addColorStop(1.0, "#DBAF72");
  } else if (mode === "golden_hour") {
    grad.addColorStop(0.0, "#3D5B99");
    grad.addColorStop(0.45, "#D97A54");
    grad.addColorStop(1.0, "#FFE082");
  } else if (mode === "dramatic_dark") {
    grad.addColorStop(0.0, "#120c1a");
    grad.addColorStop(0.6, "#3b1b3d");
    grad.addColorStop(1.0, "#9E413B");
  } else if (mode === "vice_neon") {
    grad.addColorStop(0.0, "#1D0E36");
    grad.addColorStop(0.42, "#781C68");
    grad.addColorStop(0.75, "#D94C7C");
    grad.addColorStop(1.0, "#FF9A52");
  } else if (mode === "interior_warm") {
    grad.addColorStop(0.0, "#3a2518");
    grad.addColorStop(0.5, "#6b3e26");
    grad.addColorStop(1.0, "#a86b3e");
  } else {
    grad.addColorStop(0.0, "#3B95C2");
    grad.addColorStop(0.48, "#86D0ED");
    grad.addColorStop(1.0, "#E9ECD6");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// --- PRIMITIVA 3D CON CONTORNO TINTA ---
const InkBox: React.FC<{
  args: [number, number, number];
  position: [number, number, number];
  color?: string;
  texture?: THREE.Texture;
  rotY?: number;
  rotZ?: number;
}> = ({ args, position, color = "#CA9363", texture, rotY = 0, rotZ = 0 }) => (
  <group position={position} rotation={[0, rotY, rotZ]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhongMaterial color={texture ? "#ffffff" : color} map={texture} shininess={24} />
    </mesh>
    <mesh scale={[1.032, 1.032, 1.032]}>
      <boxGeometry args={args} />
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
  </group>
);

// --- PROPS 3D TEMÁTICOS ---
const PropEiffel3D: React.FC<{ pos: [number, number, number]; scale?: number; color?: string }> = ({
  pos,
  scale = 1,
  color = "#6E7682",
}) => (
  <group position={pos} scale={scale}>
    {/* 4 pilares curvos estilizados */}
    {[
      [-1.35, 1.65, -1.35, 0.28, -0.28],
      [1.35, 1.65, -1.35, 0.28, 0.28],
      [-1.35, 1.65, 1.35, -0.28, -0.28],
      [1.35, 1.65, 1.35, -0.28, 0.28],
    ].map(([x, y, z, rx, rz], i) => (
      <group key={`leg-${i}`} position={[x, y, z]} rotation={[rx, 0, rz]}>
        <mesh castShadow>
          <boxGeometry args={[0.56, 3.6, 0.56]} />
          <meshPhongMaterial color={color} specular="#ffffff" shininess={80} />
        </mesh>
        <mesh scale={[1.08, 1.02, 1.08]}>
          <boxGeometry args={[0.56, 3.6, 0.56]} />
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      </group>
    ))}
    {/* Arco frontal decorativo */}
    <mesh position={[0, 1.9, 1.2]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.95, 0.14, 8, 18, Math.PI]} />
      <meshPhongMaterial color="#525864" />
    </mesh>
    {/* Primer piso */}
    <InkBox args={[2.9, 0.42, 2.9]} position={[0, 3.1, 0]} color="#4B525E" />
    <InkBox args={[2.5, 0.22, 2.5]} position={[0, 3.4, 0]} color="#DBAF72" />
    {/* Segundo tramo */}
    <mesh position={[0, 5.2, 0]} castShadow>
      <cylinderGeometry args={[0.56, 1.25, 3.6, 4]} />
      <meshPhongMaterial color={color} specular="#ffffff" shininess={85} />
    </mesh>
    <mesh position={[0, 5.2, 0]} scale={[1.07, 1.02, 1.07]}>
      <cylinderGeometry args={[0.56, 1.25, 3.6, 4]} />
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
    {/* Segundo piso */}
    <InkBox args={[1.55, 0.34, 1.55]} position={[0, 7.0, 0]} color="#DBAF72" />
    {/* Aguja alta */}
    <mesh position={[0, 9.1, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.48, 4.1, 4]} />
      <meshPhongMaterial color={color} specular="#ffffff" shininess={95} />
    </mesh>
    <mesh position={[0, 9.1, 0]} scale={[1.12, 1.02, 1.12]}>
      <cylinderGeometry args={[0.07, 0.48, 4.1, 4]} />
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
    {/* Antena superior */}
    <mesh position={[0, 11.4, 0]}>
      <cylinderGeometry args={[0.03, 0.05, 0.8, 8]} />
      <meshBasicMaterial color="#141218" />
    </mesh>
  </group>
);

const PropSportsCar3D: React.FC<{
  pos: [number, number, number];
  rotY?: number;
  scale?: number;
  color?: string;
}> = ({ pos, rotY = 0, scale = 1, color = "#E63946" }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    <InkBox args={[4.2, 0.72, 1.85]} position={[0, 0.72, 0]} color={color} />
    <InkBox args={[2.1, 0.68, 1.56]} position={[-0.2, 1.38, 0]} color={color} />
    {/* Parabrisas cian */}
    <mesh position={[0.88, 1.34, 0]} rotation={[0, 0, -0.32]}>
      <boxGeometry args={[0.12, 0.62, 1.38]} />
      <meshBasicMaterial color="#6CE5FF" />
    </mesh>
    {/* Alerón trasero */}
    <InkBox args={[0.42, 0.14, 1.82]} position={[-1.9, 1.35, 0]} color="#1E1D24" />
    {/* Faros delanteros */}
    <mesh position={[2.11, 0.74, 0.56]}>
      <boxGeometry args={[0.06, 0.2, 0.36]} />
      <meshBasicMaterial color="#FFF4A8" />
    </mesh>
    <mesh position={[2.11, 0.74, -0.56]}>
      <boxGeometry args={[0.06, 0.2, 0.36]} />
      <meshBasicMaterial color="#FFF4A8" />
    </mesh>
    {[
      [-1.3, 0.42, 0.96],
      [-1.3, 0.42, -0.96],
      [1.3, 0.42, 0.96],
      [1.3, 0.42, -0.96],
    ].map(([wx, wy, wz], i) => (
      <group key={`cw-${i}`} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.24, 14]} />
          <meshBasicMaterial color="#18171E" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.27, 12]} />
          <meshBasicMaterial color="#E0E4EC" />
        </mesh>
      </group>
    ))}
  </group>
);

const PropPoliceCar3D: React.FC<{
  pos: [number, number, number];
  rotY?: number;
  scale?: number;
  frame: number;
}> = ({ pos, rotY = 0, scale = 1, frame }) => {
  const redOn = Math.floor(frame / 4) % 2 === 0;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <InkBox args={[4.2, 0.76, 1.88]} position={[0, 0.74, 0]} color="#1D2230" />
      <InkBox args={[1.6, 0.78, 1.9]} position={[0, 0.75, 0]} color="#FFFFFF" />
      <InkBox args={[2.1, 0.7, 1.6]} position={[-0.1, 1.44, 0]} color="#FFFFFF" />
      <mesh position={[0.98, 1.4, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.6, 1.4]} />
        <meshBasicMaterial color="#7DD8FF" />
      </mesh>
      {/* Sirena rojo / azul parpadeante */}
      <InkBox args={[0.36, 0.22, 0.56]} position={[-0.1, 1.9, 0.3]} color={redOn ? "#FF3B3B" : "#7A1C1C"} />
      <InkBox args={[0.36, 0.22, 0.56]} position={[-0.1, 1.9, -0.3]} color={redOn ? "#1E3A7A" : "#33A8FF"} />
      <pointLight position={[0, 2.3, 0]} color={redOn ? "#FF3B3B" : "#33A8FF"} intensity={10} distance={10} />
      {[
        [-1.3, 0.42, 0.96],
        [-1.3, 0.42, -0.96],
        [1.3, 0.42, 0.96],
        [1.3, 0.42, -0.96],
      ].map(([wx, wy, wz], i) => (
        <group key={`pw-${i}`} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.24, 14]} />
            <meshBasicMaterial color="#18171E" />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.27, 12]} />
            <meshBasicMaterial color="#DCE1E8" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const PropWantedStars3D: React.FC<{ pos: [number, number, number]; scale?: number; frame: number }> = ({
  pos,
  scale = 1,
  frame,
}) => {
  const pulse = 1 + Math.sin(frame * 0.4) * 0.08;
  return (
    <group position={pos} scale={scale * pulse}>
      {[-1.5, 0, 1.5].map((sx, i) => (
        <group key={`st-${i}`} position={[sx, 0, 0]} rotation={[0, 0, frame * 0.05]}>
          <mesh>
            <octahedronGeometry args={[0.52, 0]} />
            <meshBasicMaterial color={i < 2 || Math.floor(frame / 5) % 2 === 0 ? "#FFE14D" : "#FF4D4D"} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const PropTruck1925: React.FC<{ pos: [number, number, number]; rotY?: number; scale?: number; color?: string }> = ({
  pos,
  rotY = 0,
  scale = 1,
  color = "#4B7C59",
}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    {/* Chasis / plataforma trasera */}
    <InkBox args={[2.5, 0.85, 1.65]} position={[-0.7, 1.05, 0]} color="#CA9363" />
    {/* Cabina vintage */}
    <InkBox args={[1.35, 1.35, 1.55]} position={[1.1, 1.3, 0]} color={color} />
    <InkBox args={[0.95, 0.72, 1.58]} position={[1.72, 0.95, 0]} color={color} />
    {/* Parabrisas cian */}
    <mesh position={[1.79, 1.52, 0]}>
      <boxGeometry args={[0.08, 0.46, 1.25]} />
      <meshBasicMaterial color="#86D0ED" />
    </mesh>
    {/* 4 Ruedas negras + rines amarillos */}
    {[
      [-1.3, 0.45, 0.92],
      [-1.3, 0.45, -0.92],
      [1.35, 0.45, 0.92],
      [1.35, 0.45, -0.92],
    ].map(([wx, wy, wz], i) => (
      <group key={`wh-${i}`} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 0.24, 14]} />
          <meshBasicMaterial color="#1E1D24" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 12]} />
          <meshBasicMaterial color="#DBAF72" />
        </mesh>
      </group>
    ))}
  </group>
);

const PropShip3D: React.FC<{ pos: [number, number, number]; rotY?: number; scale?: number; frame: number }> = ({
  pos,
  rotY = 0,
  scale = 1,
  frame,
}) => {
  const bob = Math.sin(frame * 0.14) * 0.14;
  const rock = Math.sin(frame * 0.11) * 0.03;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, rotY, rock]} scale={scale}>
      <InkBox args={[6.2, 1.3, 2.2]} position={[0, 0.65, 0]} color="#2A2C38" />
      <InkBox args={[5.2, 0.4, 2.1]} position={[0, 1.45, 0]} color="#B86852" />
      <InkBox args={[3.4, 0.9, 1.55]} position={[-0.2, 2.05, 0]} color="#F5F3EA" />
      {/* Dos chimeneas clásicas años 20 */}
      {[-0.8, 0.6].map((fx, idx) => (
        <group key={`fun-${idx}`} position={[fx, 2.95, 0]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.3, 1.15, 12]} />
            <meshPhongMaterial color="#D94E3B" />
          </mesh>
          <mesh scale={[1.1, 1.05, 1.1]}>
            <cylinderGeometry args={[0.26, 0.3, 1.15, 12]} />
            <meshBasicMaterial color={INK} side={THREE.BackSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const PropSack3D: React.FC<{
  pos: [number, number, number];
  scale?: number;
  color?: string;
  label?: string;
  faceExpr?: "deadpan" | "shocked" | "smug";
}> = ({ pos, scale = 1, color = "#DBAF72", label = "$$$", faceExpr }) => {
  const faceTex = useMemo(
    () => (faceExpr ? makeComicFacePropTexture(label ?? "", color, faceExpr) : undefined),
    [label, color, faceExpr]
  );
  return (
    <group position={pos} scale={scale}>
      <mesh position={[0, 0.95, 0]} scale={[1.1, 1.25, 0.95]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <sphereGeometry args={[0.92, 16, 16]} />
        <meshPhongMaterial color={faceTex ? "#ffffff" : color} map={faceTex} shininess={18} />
      </mesh>
      <mesh position={[0, 0.95, 0]} scale={[1.16, 1.31, 1.0]}>
        <sphereGeometry args={[0.92, 16, 16]} />
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
      {/* Cuello atado del saco */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.42, 0.25, 0.45, 12]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <torusGeometry args={[0.3, 0.08, 8, 16]} />
        <meshBasicMaterial color="#4A2F1B" />
      </mesh>
    </group>
  );
};

const PropDesk3D: React.FC<{ pos: [number, number, number]; rotY?: number; scale?: number; color?: string }> = ({
  pos,
  rotY = 0,
  scale = 1,
  color = "#7D4829",
}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    <InkBox args={[3.4, 0.24, 1.6]} position={[0, 1.15, 0]} color={color} />
    <InkBox args={[3.1, 0.95, 1.35]} position={[0, 0.55, 0]} color="#5C321A" />
    {/* Lámpara verde de banquero */}
    <mesh position={[-1.1, 1.55, 0.2]}>
      <cylinderGeometry args={[0.25, 0.35, 0.35, 10]} />
      <meshPhongMaterial color="#389457" shininess={80} />
    </mesh>
  </group>
);

const PropMoneyPile3D: React.FC<{ pos: [number, number, number]; scale?: number }> = ({
  pos,
  scale = 1,
}) => (
  <group position={pos} scale={scale}>
    {[
      [0, 0.22, 0, 0.1],
      [-0.58, 0.22, 0.35, -0.3],
      [0.58, 0.22, 0.3, 0.4],
      [-0.35, 0.22, -0.45, 0.25],
      [0.42, 0.22, -0.4, -0.2],
      [0, 0.66, 0.12, -0.15],
      [-0.25, 0.66, -0.2, 0.3],
      [0.12, 1.1, 0.05, 0.25],
    ].map(([x, y, z, ry], i) => (
      <group key={`cash-${i}`} position={[x, y, z]} rotation={[0, ry, 0]}>
        <InkBox args={[0.92, 0.4, 0.52]} position={[0, 0, 0]} color="#4CA65A" />
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.24, 0.43, 0.55]} />
          <meshBasicMaterial color="#E9ECD6" />
        </mesh>
      </group>
    ))}
  </group>
);

const PropBottle3D: React.FC<{ pos: [number, number, number]; rotY?: number; scale?: number; color?: string }> = ({
  pos,
  rotY = 0,
  scale = 1,
  color = "#5A6069",
}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    <mesh position={[0, 0.95, 0]} castShadow>
      <boxGeometry args={[1.25, 1.65, 0.72]} />
      <meshPhongMaterial color={color} specular="#ffffff" shininess={110} />
    </mesh>
    <mesh position={[0, 0.95, 0]} scale={[1.045, 1.04, 1.055]}>
      <boxGeometry args={[1.25, 1.65, 0.72]} />
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
    <mesh position={[0, 2.02, 0]} castShadow>
      <cylinderGeometry args={[0.32, 0.32, 0.56, 16]} />
      <meshPhongMaterial color="#DBAF72" specular="#ffffff" shininess={120} />
    </mesh>
  </group>
);

const PropBarrel3D: React.FC<{ pos: [number, number, number]; scale?: number; color?: string }> = ({
  pos,
  scale = 1,
  color = "#CA9363",
}) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.58, 0.52, 1.4, 14]} />
      <meshPhongMaterial color={color} shininess={20} />
    </mesh>
    <mesh position={[0, 0.7, 0]} scale={[1.05, 1.03, 1.05]}>
      <cylinderGeometry args={[0.58, 0.52, 1.4, 14]} />
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
  </group>
);

const PropGlowingOrb: React.FC<{ pos: [number, number, number]; scale?: number; frame: number }> = ({
  pos,
  scale = 1,
  frame,
}) => {
  const pulse = 1 + Math.sin(frame * 0.28) * 0.1;
  return (
    <group position={pos} scale={scale * pulse}>
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#FFF3A8" />
      </mesh>
      <mesh scale={1.5}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.45} />
      </mesh>
      <pointLight color="#FFB830" intensity={14} distance={12} />
    </group>
  );
};

const PropStreetLamp3D: React.FC<{ pos: [number, number, number]; scale?: number }> = ({ pos, scale = 1 }) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 2.2, 0]}>
      <cylinderGeometry args={[0.09, 0.16, 4.4, 8]} />
      <meshPhongMaterial color="#1E2028" />
    </mesh>
    <mesh position={[0, 4.55, 0]}>
      <sphereGeometry args={[0.32, 12, 12]} />
      <meshBasicMaterial color="#FFF4B8" />
    </mesh>
  </group>
);

const PropXrayBone3D: React.FC<{
  pos: [number, number, number];
  scale?: number;
  kind: "knee" | "spine";
  localTime: number;
}> = ({ pos, scale = 1, kind, localTime }) => {
  const crackProg = Math.min(1, Math.max(0, (localTime - 0.18) / 0.35));
  const shake = crackProg > 0.2 ? Math.sin(localTime * 42) * 0.06 * (1 - crackProg * 0.5) : 0;
  const splitAngle = crackProg * 0.36;
  return (
    <group position={[pos[0] + shake, pos[1], pos[2]]} scale={scale}>
      {/* Marco luminoso de radiografía */}
      <InkBox args={[2.5, 3.2, 0.18]} position={[0, 1.6, -0.15]} color="#0B132B" />
      <mesh position={[0, 1.6, -0.04]}>
        <planeGeometry args={[2.2, 2.9]} />
        <meshBasicMaterial color="#112240" />
      </mesh>
      {kind === "knee" ? (
        <>
          {/* Hueso superior (Fémur) */}
          <group position={[0, 2.15, 0.12]} rotation={[0, 0, -splitAngle]}>
            <InkBox args={[0.42, 1.15, 0.26]} position={[0, 0.2, 0]} color="#F8FAFC" />
            <mesh position={[-0.18, 0.72, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshBasicMaterial color="#F8FAFC" /></mesh>
            <mesh position={[0.18, 0.72, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshBasicMaterial color="#F8FAFC" /></mesh>
          </group>
          {/* Rótula + Hueso inferior (Tibia) partiéndose */}
          <group position={[0, 1.05, 0.12]} rotation={[0, 0, splitAngle * 1.15]}>
            <InkBox args={[0.40, 1.15, 0.26]} position={[0, -0.25, 0]} color="#F8FAFC" />
            <mesh position={[0, 0.38, 0.08]}><sphereGeometry args={[0.25, 10, 10]} /><meshBasicMaterial color={crackProg > 0.15 ? "#FF5757" : "#F8FAFC"} /></mesh>
          </group>
          {/* Grieta y relámpagos rojos de fractura en la rodilla */}
          {crackProg > 0.1 && (
            <group position={[0, 1.6, 0.26]} scale={0.7 + crackProg * 0.5}>
              <mesh rotation={[0, 0, 0.4]}><boxGeometry args={[1.4, 0.12, 0.06]} /><meshBasicMaterial color="#FF2E2E" /></mesh>
              <mesh rotation={[0, 0, -0.5]}><boxGeometry args={[1.2, 0.12, 0.06]} /><meshBasicMaterial color="#FFE14D" /></mesh>
              <mesh><octahedronGeometry args={[0.35, 0]} /><meshBasicMaterial color="#FF4500" /></mesh>
            </group>
          )}
        </>
      ) : (
        <>
          {/* Vértebras de columna vertebral doblándose/comprimiéndose */}
          {[0, 1, 2, 3, 4, 5].map((vi) => {
            const curveX = Math.sin((vi / 5) * Math.PI) * crackProg * 0.45;
            const isBroken = vi === 2 || vi === 3;
            return (
              <InkBox
                key={`vert-${vi}`}
                args={[0.72, 0.28, 0.26]}
                position={[curveX, 0.65 + vi * 0.38, 0.12]}
                color={isBroken && crackProg > 0.15 ? "#FF4444" : "#F8FAFC"}
              />
            );
          })}
          {crackProg > 0.15 && (
            <mesh position={[0.42, 1.6, 0.26]} rotation={[0, 0, -0.45]}>
              <boxGeometry args={[1.3, 0.12, 0.06]} />
              <meshBasicMaterial color="#FFE14D" />
            </mesh>
          )}
        </>
      )}
    </group>
  );
};

const PropElevatorBuilding3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number }> = ({
  pos,
  scale = 1,
  localTime,
}) => {
  const cabY = Math.max(0.6, 5.2 - localTime * 2.8);
  return (
    <group position={pos} scale={scale}>
      {/* Torre de pisos */}
      <InkBox args={[3.2, 6.4, 1.6]} position={[0, 3.2, 0]} color="#475569" />
      {/* Ventana de hueco transparente central */}
      <mesh position={[0, 3.2, 0.82]}>
        <planeGeometry args={[1.1, 5.8]} />
        <meshBasicMaterial color="#0F172A" />
      </mesh>
      {/* Pisos laterales luminosos */}
      {[1, 2, 3, 4, 5].map((fl) => (
        <React.Fragment key={`fl-${fl}`}>
          <mesh position={[-1.0, fl * 1.05, 0.82]}>
            <planeGeometry args={[0.6, 0.55]} />
            <meshBasicMaterial color="#BAE6FD" />
          </mesh>
          <mesh position={[1.0, fl * 1.05, 0.82]}>
            <planeGeometry args={[0.6, 0.55]} />
            <meshBasicMaterial color="#BAE6FD" />
          </mesh>
        </React.Fragment>
      ))}
      {/* Cabina roja/metálica cayendo por el hueco */}
      <InkBox args={[0.95, 1.05, 0.3]} position={[0, cabY, 0.92]} color="#EF4444" />
    </group>
  );
};

const PropSwollenBattery3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number }> = ({
  pos,
  scale = 1,
  localTime,
}) => {
  const swell = Math.min(1, localTime * 0.85);
  const pulse = 1 + Math.sin(localTime * 22) * 0.06 * swell;
  const bulgeX = (1 + swell * 0.55) * pulse;
  const bulgeZ = (1 + swell * 0.95) * pulse;
  const bodyCol = swell > 0.55 ? "#EF4444" : swell > 0.25 ? "#F97316" : "#334155";
  return (
    <group position={pos} scale={scale}>
      {/* Carcasa batería de litio inflándose */}
      <InkBox args={[1.4 * bulgeX, 2.2, 0.65 * bulgeZ]} position={[0, 1.25, 0]} color={bodyCol} />
      {/* Polos superiores */}
      <InkBox args={[0.45, 0.22, 0.35]} position={[-0.35, 2.45, 0]} color="#CBD5E1" />
      <InkBox args={[0.45, 0.22, 0.35]} position={[0.35, 2.45, 0]} color="#FACC15" />
      {/* Barra de temperatura roja subiendo al lado */}
      <InkBox args={[0.26, 2.1, 0.2]} position={[1.25, 1.2, 0]} color="#0F172A" />
      <mesh position={[1.25, 0.3 + swell * 0.8, 0.12]}>
        <boxGeometry args={[0.16, 0.3 + swell * 1.6, 0.05]} />
        <meshBasicMaterial color="#FF2E2E" />
      </mesh>
    </group>
  );
};

const PropTsunamiWall3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number }> = ({
  pos,
  scale = 1,
  localTime,
}) => {
  const zMove = pos[2] + Math.min(4.5, localTime * 2.2);
  return (
    <group position={[pos[0], pos[1], zMove]} scale={scale}>
      {/* Muro gigante de ola azul */}
      <InkBox args={[14, 5.8, 2.4]} position={[0, 2.9, 0]} color="#0284C7" />
      {/* Cresta curvada con espuma blanca */}
      <InkBox args={[14.2, 1.4, 2.8]} position={[0, 5.7, 0.6]} color="#38BDF8" />
      <InkBox args={[14.3, 0.75, 2.2]} position={[0, 6.2, 1.2]} color="#F8FAFC" />
    </group>
  );
};

const PropFishFlop3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number }> = ({
  pos,
  scale = 1,
  localTime,
}) => (
  <group position={pos} scale={scale}>
    {[-0.9, 0, 0.95].map((fx, i) => {
      const hop = Math.abs(Math.sin(localTime * 11 + i * 1.7)) * 0.55;
      const tilt = Math.sin(localTime * 14 + i) * 0.45;
      return (
        <group key={`fish-${i}`} position={[fx, 0.25 + hop, (i % 2) * 0.4]} rotation={[0, 0, tilt]}>
          <InkBox args={[0.72, 0.34, 0.22]} position={[0, 0, 0]} color={i === 1 ? "#38BDF8" : "#FB923C"} />
          <InkBox args={[0.25, 0.42, 0.16]} position={[-0.45, 0, 0]} color="#FDBA74" />
        </group>
      );
    })}
  </group>
);

const PropPanFire3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number; withWater?: boolean }> = ({
  pos,
  scale = 1,
  localTime,
  withWater = false,
}) => (
  <group position={pos} scale={scale}>
    {/* Sartén metálica negra con mango */}
    <InkBox args={[2.1, 0.42, 2.1]} position={[0, 1.1, 0]} color="#1E293B" />
    <InkBox args={[1.6, 0.18, 0.28]} position={[1.7, 1.22, 0]} color="#0F172A" />
    {/* Aceite amarillo caliente */}
    <mesh position={[0, 1.32, 0]}>
      <boxGeometry args={[1.8, 0.06, 1.8]} />
      <meshBasicMaterial color="#F59E0B" />
    </mesh>
    {/* Llamas sobre la sartén */}
    {[-0.5, 0, 0.5].map((lx, i) => {
      const fh = 1.1 + Math.sin(localTime * 22 + i * 2) * 0.35 + (withWater ? 1.2 : 0);
      return (
        <mesh key={`pf-${i}`} position={[lx, 1.4 + fh * 0.4, (i % 2) * 0.25]}>
          <coneGeometry args={[0.36, fh, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#FF4500" : "#FDE047"} />
        </mesh>
      );
    })}
    {/* Gotas de agua cayendo encima cuando withWater */}
    {withWater && [-0.35, 0.1, 0.4].map((wx, i) => {
      const wy = 3.2 - ((localTime * 4.5 + i * 0.4) % 1.9);
      return (
        <mesh key={`wd-${i}`} position={[wx, wy, 0.1]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      );
    })}
  </group>
);

const PropMetalLid3D: React.FC<{ pos: [number, number, number]; scale?: number; localTime: number }> = ({
  pos,
  scale = 1,
  localTime,
}) => {
  const slideX = Math.max(0, 1 - Math.min(1, localTime * 1.4)) * 1.9;
  return (
    <group position={[pos[0] + slideX, pos[1], pos[2]]} scale={scale}>
      <InkBox args={[2.25, 0.16, 2.25]} position={[0, 1.42, 0]} color="#CBD5E1" />
      <InkBox args={[0.55, 0.28, 0.35]} position={[0, 1.62, 0]} color="#475569" />
    </group>
  );
};

// --- EFECTOS SLAPSTICK DOPAMÍNICOS 3D ---
const ComicFX3D: React.FC<{ fx: ToonFX; frame: number }> = ({ fx, frame }) => {
  const k = frame - fx.atFrame;
  const dur = fx.durFrames ?? 22;
  if (k < 0 || k > dur) return null;
  const prog = k / dur;
  const sc = fx.scale ?? 1;

  if (fx.type === "comic_star") {
    // Estrella explosiva naranja/amarilla nítida sin tapar toda la pantalla
    const s = sc * (0.45 + Math.sin(Math.min(1, prog * 1.4) * Math.PI * 0.65) * 0.85);
    const op = prog > 0.75 ? Math.max(0, (1 - prog) * 4) : 1;
    return (
      <group position={fx.pos} scale={s} rotation={[0, 0, k * 0.14]}>
        <mesh>
          <octahedronGeometry args={[0.52, 0]} />
          <meshBasicMaterial color="#FFE97D" transparent opacity={op} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]} scale={[1.35, 1.35, 0.35]}>
          <octahedronGeometry args={[0.52, 0]} />
          <meshBasicMaterial color="#FF7A1A" transparent opacity={op * 0.9} />
        </mesh>
        <mesh scale={1.6}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshBasicMaterial color="#FFA726" transparent opacity={op * 0.28} />
        </mesh>
      </group>
    );
  }

  if (fx.type === "flames") {
    return (
      <group position={fx.pos} scale={sc}>
        {[-0.9, -0.35, 0.25, 0.85].map((ox, i) => {
          const h = 1.4 + Math.sin(k * 0.7 + i * 1.5) * 0.55;
          return (
            <group key={`fl-${i}`} position={[ox, h * 0.5, (i % 2) * 0.2]}>
              <mesh>
                <coneGeometry args={[0.48, h * 1.5, 6]} />
                <meshBasicMaterial color={i % 2 === 0 ? "#FF6A1A" : "#FFB82E"} />
              </mesh>
              <mesh position={[0, -0.1, 0.05]} scale={0.6}>
                <coneGeometry args={[0.42, h * 1.3, 6]} />
                <meshBasicMaterial color="#FFF176" />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  if (fx.type === "flying_bills") {
    return (
      <group position={fx.pos} scale={sc}>
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i / 12) * Math.PI * 2 + k * 0.05;
          const dist = 0.5 + prog * 3.8;
          const y = prog * 3.2 - Math.pow(prog, 2) * 1.4 + (i % 3) * 0.45;
          return (
            <mesh
              key={`bill-${i}`}
              position={[Math.cos(ang) * dist, y, Math.sin(ang) * dist]}
              rotation={[k * 0.28 + i, k * 0.35, i * 0.7]}
            >
              <boxGeometry args={[0.56, 0.04, 0.28]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#4CA65A" : "#67CC78"} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (fx.type === "splinters") {
    return (
      <group position={fx.pos} scale={sc}>
        {Array.from({ length: 14 }).map((_, i) => {
          const ang = (i / 14) * Math.PI * 2;
          const dist = 0.6 + prog * 5.2;
          const yOff = Math.sin(prog * Math.PI) * 2.8 + (i % 3) * 0.45;
          return (
            <group
              key={i}
              position={[Math.cos(ang) * dist, yOff, Math.sin(ang) * dist]}
              rotation={[k * 0.3 + i, k * 0.35, i]}
            >
              <mesh>
                <boxGeometry args={[0.62, 0.18, 0.09]} />
                <meshBasicMaterial color={i % 3 === 0 ? "#FFE169" : i % 2 === 0 ? "#DBAF72" : "#B86852"} />
              </mesh>
              <mesh scale={[1.08, 1.18, 1.18]}>
                <boxGeometry args={[0.62, 0.18, 0.09]} />
                <meshBasicMaterial color={INK} side={THREE.BackSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  if (fx.type === "explosion_plume" || fx.type === "smoke" || fx.type === "boom") {
    const s = sc * (0.55 + applyEase(prog, "fast") * (fx.type === "explosion_plume" ? 3.2 : 2.3));
    const op = Math.max(0, 1 - Math.pow(prog, 1.6));
    const col = fx.type === "explosion_plume" ? "#4B3B36" : "#FFFFFF";
    return (
      <group position={fx.pos} scale={s}>
        {fx.type === "boom" && (
          <mesh>
            <dodecahedronGeometry args={[0.95, 0]} />
            <meshBasicMaterial color="#FFCC33" transparent opacity={op} />
          </mesh>
        )}
        {[
          [0.7, 0.4, 0],
          [-0.7, 0.3, 0.4],
          [0, 1.05, -0.3],
          [0.35, -0.2, 0.6],
          [-0.3, 0.9, 0.45],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.66, 10, 10]} />
            <meshBasicMaterial color={col} transparent opacity={op * 0.92} />
          </mesh>
        ))}
      </group>
    );
  }

  if (fx.type === "radar") {
    const r = 0.7 + ((k % 18) / 18) * 2.4;
    const op = Math.max(0.15, 1 - (k % 18) / 18);
    return (
      <group position={fx.pos} scale={sc}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.09, 8, 24]} />
          <meshBasicMaterial color="#FF3B3B" transparent opacity={op} />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[r * 0.65, 0.07, 8, 20]} />
          <meshBasicMaterial color="#2CE6FF" transparent opacity={op} />
        </mesh>
      </group>
    );
  }

  // sparkles
  return (
    <group position={fx.pos} scale={sc}>
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = (i / 9) * Math.PI * 2 + k * 0.1;
        const r = 0.8 + prog * 2.1;
        return (
          <mesh key={i} position={[Math.cos(ang) * r, prog * 2.5 + (i % 2) * 0.5, Math.sin(ang) * r]}>
            <octahedronGeometry args={[0.24, 0]} />
            <meshBasicMaterial color="#FFE169" />
          </mesh>
        );
      })}
    </group>
  );
};

// --- PERSONAJE BILLBOARD CABEZA BLANCA ---
const CharacterBillboard: React.FC<{
  actor: ToonActor;
  style: ToonCharStyle;
  camPos: [number, number, number];
  shotStart: number;
  frame: number;
  fps: number;
}> = ({ actor, style, camPos, shotStart, frame, fps }) => {
  const lt = (frame - shotStart) / fps;
  const pos = actor.toPos
    ? lerpTuple(actor.pos, actor.toPos, Math.min(1, applyEase(lt / 1.1, "fast")))
    : actor.pos;

  const tex = useMemo(
    () =>
      makeToonTexture(
        style,
        actor.action,
        actor.expr,
        lt,
        actor.face ?? 1,
        actor.heldItem ?? "none",
        actor.bubble ?? "none"
      ),
    [
      style,
      actor.action,
      actor.expr,
      Math.floor(lt * 18),
      actor.face,
      actor.heldItem,
      actor.bubble,
    ]
  );

  const yaw = Math.atan2(camPos[0] - pos[0], camPos[2] - pos[2]);
  const sc = actor.scale ?? 1;

  return (
    <mesh position={[pos[0], pos[1] + 1.55 * sc, pos[2]]} rotation={[0, yaw, 0]}>
      <planeGeometry args={[2.15 * sc, 3.22 * sc]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
};

// --- ESCENARIOS MODULARES COHERENTES CON LA HISTORIA ---
const StageEnvironment: React.FC<{
  shot: ToonShot;
  frame: number;
}> = ({ shot, frame }) => {
  const defaultFloor: NonNullable<ToonShot["floorStyle"]> =
    shot.stage === "paris_plaza"
      ? "grass_path"
      : shot.stage === "vice_city"
      ? "asphalt_road"
      : shot.stage === "office_interior"
      ? "tile_checker"
      : shot.stage === "brick_corridor"
      ? "brick_grid"
      : shot.stage === "city_street"
      ? "cobble"
      : "wood_planks";

  const floorTex = useMemo(
    () => makeFloorTexture(shot.floorStyle ?? defaultFloor, shot.floorColor, shot.floorAccent),
    [shot.floorStyle, defaultFloor, shot.floorColor, shot.floorAccent]
  );

  const horizon =
    shot.horizon ??
    (shot.stage === "office_interior" || shot.stage === "brick_corridor"
      ? "interior"
      : shot.stage === "ocean_deck"
      ? "ocean"
      : shot.stage === "paris_plaza"
      ? "paris"
      : shot.stage === "vice_city"
      ? "vice_city"
      : "city");

  const wallCol =
    shot.wallColor ??
    (shot.stage === "brick_corridor" ? "#9E523E" : "#D6C5A3");
  const trimCol = shot.trimColor ?? "#6E4125";

  return (
    <>
      {/* Suelo principal */}
      <InkBox args={[24, 0.8, 22]} position={[0, -0.4, 0]} texture={floorTex} />

      {(horizon === "interior" || horizon === "office_cubicles" || horizon === "palace_hall") && (
        <group>
          <InkBox args={[24, 9.5, 0.6]} position={[0, 4.3, -7.8]} color={wallCol} />
          <InkBox args={[0.6, 9.5, 22]} position={[-9.5, 4.3, 0]} color={wallCol} />
          <InkBox args={[0.6, 9.5, 22]} position={[9.5, 4.3, 0]} color={wallCol} />
          {horizon === "office_cubicles" && (
            <>
              {[-5.5, 0, 5.5].map((wx, i) => (
                <mesh key={`owin-${i}`} position={[wx, 4.8, -7.42]}>
                  <boxGeometry args={[4.2, 4.5, 0.1]} />
                  <meshBasicMaterial color="#9BD7F5" />
                </mesh>
              ))}
              <InkBox args={[23.6, 1.8, 0.2]} position={[0, 0.9, -7.45]} color={trimCol} />
            </>
          )}
          {horizon === "palace_hall" && (
            <>
              {[-6.5, 6.5].map((px, i) => (
                <InkBox key={`pil-${i}`} args={[1.4, 9.2, 1.4]} position={[px, 4.4, -6.8]} color="#DBAF72" />
              ))}
              <InkBox args={[6.2, 6.8, 0.25]} position={[0, 4.2, -7.42]} color="#A82424" />
            </>
          )}
          {horizon === "interior" && shot.stage === "office_interior" && !shot.wallColor && (
            <>
              <InkBox args={[23.6, 2.2, 0.2]} position={[0, 1.1, -7.45]} color={trimCol} />
              <InkBox args={[2.8, 2.1, 0.16]} position={[-3.8, 4.6, -7.45]} color="#DBAF72" />
              <mesh position={[-3.8, 4.6, -7.35]}>
                <boxGeometry args={[2.3, 1.6, 0.05]} />
                <meshBasicMaterial color="#489CC2" />
              </mesh>
              <InkBox args={[2.8, 2.1, 0.16]} position={[3.8, 4.6, -7.45]} color="#DBAF72" />
              <mesh position={[3.8, 4.6, -7.35]}>
                <boxGeometry args={[2.3, 1.6, 0.05]} />
                <meshBasicMaterial color="#B86852" />
              </mesh>
            </>
          )}
          <mesh position={[0, 9.1, -1]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[24, 22]} />
            <meshBasicMaterial color="#3a281d" />
          </mesh>
          <pointLight position={[0, 7.6, -1.5]} intensity={16} color="#FFE4AD" distance={22} />
        </group>
      )}

      {/* CUADRÍCULA DE CIUDAD COLORIDA (estilo Ref 8 Uber!) */}
      {horizon === "city_blocks" && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, -24]}>
            <planeGeometry args={[180, 180]} />
            <meshBasicMaterial color="#4D5461" />
          </mesh>
          {[-18, -11, 11, 18].map((bx, i) =>
            [-14, -22, -30, -38].map((bz, j) => {
              const palette = ["#F28B82", "#8AB4F8", "#81C995", "#FDD663", "#C58AF9", "#78D9EC"];
              const h = 4.5 + ((i * 3 + j * 5) % 6) * 1.4;
              return (
                <InkBox
                  key={`cb-${i}-${j}`}
                  args={[4.6, h, 4.6]}
                  position={[bx, h * 0.5 - 0.3, bz]}
                  color={palette[(i + j) % palette.length]}
                />
              );
            })
          )}
        </group>
      )}

      {/* CALLEJÓN NOCTURNO NEÓN (estilo Ref 5 Pachinko!) */}
      {horizon === "neon_alley" && (
        <group>
          <InkBox args={[3.5, 11, 22]} position={[-8.5, 5.1, -2]} color="#262840" />
          <InkBox args={[3.5, 11, 22]} position={[8.5, 5.1, -2]} color="#262840" />
          {[
            [-6.6, 5.5, -5, "#FF3BA7"],
            [6.6, 4.8, -6, "#2CE6FF"],
            [-6.6, 6.2, -11, "#FFE14D"],
            [6.6, 6.0, -12, "#FF4D4D"],
          ].map(([nx, ny, nz, nc], i) => (
            <mesh key={`ns-${i}`} position={[nx as number, ny as number, nz as number]}>
              <boxGeometry args={[0.3, 3.2, 1.1]} />
              <meshBasicMaterial color={nc as string} />
            </mesh>
          ))}
        </group>
      )}

      {/* HORIZONTE VICE CITY (Edificios Art Deco con neón rosa/cian + palmeras!) */}
      {horizon === "vice_city" && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, -18]}>
            <planeGeometry args={[180, 160]} />
            <meshBasicMaterial color="#252836" />
          </mesh>
          {[
            [-15, 5.5, -20, 5.5, 11, "#F5E9DA", "#FF3BA7"],
            [-7.5, 7.0, -24, 6.2, 14, "#D7E8F5", "#2CE6FF"],
            [8.5, 6.5, -23, 6.0, 13, "#F5E9DA", "#FF3BA7"],
            [16.5, 5.0, -20, 5.2, 10, "#FCE2C4", "#FFE14D"],
          ].map(([bx, by, bz, bw, bh, bc, nc], i) => (
            <group key={`vc-${i}`} position={[bx as number, by as number, bz as number]}>
              <InkBox args={[bw as number, bh as number, 4]} position={[0, 0, 0]} color={bc as string} />
              <mesh position={[0, (bh as number) * 0.42, 2.08]}>
                <boxGeometry args={[(bw as number) * 0.9, 0.38, 0.12]} />
                <meshBasicMaterial color={nc as string} />
              </mesh>
            </group>
          ))}
          {/* Palmeras de Vice City */}
          {[
            [-7.5, 0, -9.5],
            [7.5, 0, -9.5],
            [-11.0, 0, -14.0],
            [11.0, 0, -14.0],
          ].map(([px, py, pz], idx) => (
            <group key={`palm-${idx}`} position={[px, py, pz]}>
              <mesh position={[0, 2.8, 0]} rotation={[0, 0, idx % 2 === 0 ? 0.08 : -0.08]}>
                <cylinderGeometry args={[0.18, 0.32, 5.6, 8]} />
                <meshBasicMaterial color="#6B4427" />
              </mesh>
              {[-0.8, 0, 0.8].map((ang, k) => (
                <mesh key={k} position={[ang * 1.1, 5.5, 0]} rotation={[0, 0, -ang * 0.8]}>
                  <boxGeometry args={[2.2, 0.25, 0.8]} />
                  <meshBasicMaterial color="#34C759" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* HORIZONTE PARÍS / CIUDAD (Edificios Haussmann + árboles + faroles — CERO barcos/mar!) */}
      {(horizon === "paris" || horizon === "city" || horizon === "park") && (
        <group>
          {/* Pradera o asfalto extendido alrededor de la plaza */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, -18]}>
            <planeGeometry args={[180, 160]} />
            <meshBasicMaterial color={horizon === "paris" || horizon === "park" ? "#56AD5E" : "#7E8491"} />
          </mesh>
          {/* Balaustrada/murete bajo parisino de piedra */}
          <InkBox args={[24, 0.85, 0.5]} position={[0, 0.42, -9.8]} color="#DDD4C3" />

          {/* Silueta de edificios Haussmann color crema/terracota/gris en horizonte */}
          {[
            [-18, 4.5, -24, 6, 9, "#E2CC97"],
            [-10, 5.2, -26, 5.5, 10.4, "#D7C3AE"],
            [11, 5.0, -25, 6.2, 10, "#E2CC97"],
            [19, 4.2, -23, 5.5, 8.4, "#CA9363"],
          ].map(([bx, by, bz, bw, bh, bc], i) => (
            <group key={`bld-${i}`} position={[bx as number, by as number, bz as number]}>
              <InkBox args={[bw as number, bh as number, 4]} position={[0, 0, 0]} color={bc as string} />
              {/* Techo mansarda gris pizarra parisino */}
              <InkBox args={[(bw as number) + 0.3, 1.5, 4.2]} position={[0, (bh as number) * 0.5 + 0.65, 0]} color="#495260" />
            </group>
          ))}

          {/* Árboles estilizados verdes */}
          {[
            [-8.5, 0, -11.5],
            [8.8, 0, -11.2],
            [-13.5, 0, -16.5],
            [13.5, 0, -16.0],
          ].map(([tx, ty, tz], idx) => (
            <group key={`tree-${idx}`} position={[tx, ty, tz]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.25, 0.35, 2.8, 8]} />
                <meshBasicMaterial color="#5C3B22" />
              </mesh>
              <mesh position={[0, 3.3, 0]}>
                <sphereGeometry args={[1.4, 10, 10]} />
                <meshPhongMaterial color="#3FA14B" />
              </mesh>
            </group>
          ))}

          <PropStreetLamp3D pos={[-7.8, 0, -6.5]} />
          <PropStreetLamp3D pos={[7.8, 0, -6.5]} />
        </group>
      )}

      {/* CABINA DE ASCENSOR METÁLICA REAL */}
      {horizon === "elevator_cabin" && (
        <group>
          {/* Paredes metálicas de cabina */}
          <InkBox args={[14, 9.2, 0.5]} position={[0, 4.3, -6.5]} color={shot.wallColor ?? "#64748B"} />
          <InkBox args={[0.5, 9.2, 16]} position={[-6.8, 4.3, 0]} color={shot.wallColor ?? "#475569"} />
          <InkBox args={[0.5, 9.2, 16]} position={[6.8, 4.3, 0]} color={shot.wallColor ?? "#475569"} />
          {/* Puertas corredizas dobles + ranura central */}
          <InkBox args={[2.7, 6.2, 0.25]} position={[-1.4, 3.1, -6.15]} color="#CBD5E1" />
          <InkBox args={[2.7, 6.2, 0.25]} position={[1.4, 3.1, -6.15]} color="#CBD5E1" />
          <mesh position={[0, 3.1, -6.0]}>
            <boxGeometry args={[0.14, 6.2, 0.06]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          {/* Indicador digital de piso encima de las puertas */}
          <InkBox args={[2.4, 0.9, 0.22]} position={[0, 6.9, -6.1]} color="#0F172A" />
          <mesh position={[0, 6.9, -5.96]}>
            <boxGeometry args={[1.9, 0.55, 0.05]} />
            <meshBasicMaterial color={frame % 12 < 6 ? "#EF4444" : "#F59E0B"} />
          </mesh>
          {/* Panel lateral de botones luminosos */}
          <InkBox args={[0.9, 2.8, 0.2]} position={[3.7, 2.7, -6.12]} color="#1E293B" />
          {[0, 1, 2, 3].map((bi) => (
            <mesh key={`eb-${bi}`} position={[3.7, 1.9 + bi * 0.52, -5.99]}>
              <boxGeometry args={[0.38, 0.28, 0.06]} />
              <meshBasicMaterial color={bi === 0 ? "#EF4444" : bi === 3 ? "#4CE88A" : "#FDE047"} />
            </mesh>
          ))}
          {/* Barandilla metálica */}
          <InkBox args={[13.2, 0.22, 0.25]} position={[0, 1.65, -5.85]} color="#E2E8F0" />
          {/* Techo metálico + luz de emergencia */}
          <mesh position={[0, 8.8, -1]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[14, 16]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0, 8.65, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 1.2]} />
            <meshBasicMaterial color={frame % 10 < 5 ? "#FCA5A5" : "#F8FAFC"} />
          </mesh>
        </group>
      )}

      {/* HUECO DE ASCENSOR EN CAÍDA (cables + vigas pasando rápido) */}
      {horizon === "elevator_shaft" && (
        <group>
          <InkBox args={[18, 22, 0.6]} position={[0, 6, -8.5]} color="#0F172A" />
          <InkBox args={[0.6, 22, 18]} position={[-8.2, 6, 0]} color="#1E293B" />
          <InkBox args={[0.6, 22, 18]} position={[8.2, 6, 0]} color="#1E293B" />
          {/* Cables de acero tensos */}
          {[-2.8, -1.0, 1.0, 2.8].map((cx, i) => (
            <InkBox key={`cab-${i}`} args={[0.14, 22, 0.14]} position={[cx, 6, -5.5]} color="#94A3B8" />
          ))}
          {/* Vigas y luces de pisos pasando hacia arriba por la caída */}
          {[0, 1, 2, 3].map((bi) => {
            const by = ((bi * 5 + frame * 0.45) % 20) - 2;
            return (
              <group key={`beam-${bi}`} position={[0, by, -6.2]}>
                <InkBox args={[16, 0.55, 0.5]} position={[0, 0, 0]} color="#334155" />
                <mesh position={[-5.2, 0.4, 0.3]}>
                  <boxGeometry args={[0.9, 0.35, 0.1]} />
                  <meshBasicMaterial color="#EF4444" />
                </mesh>
                <mesh position={[5.2, 0.4, 0.3]}>
                  <boxGeometry args={[0.9, 0.35, 0.1]} />
                  <meshBasicMaterial color="#FACC15" />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* PASILLO DE SUPERMERCADO */}
      {horizon === "supermarket_aisle" && (
        <group>
          <InkBox args={[24, 9.5, 0.5]} position={[0, 4.3, -8.5]} color={shot.wallColor ?? "#F1F5F9"} />
          {[-5.2, 5.2].map((sx, side) =>
            [-5.5, -2.5, 0.5].map((sz, j) => (
              <group key={`aisle-${side}-${j}`} position={[sx, 0, sz]}>
                <InkBox args={[1.6, 4.0, 2.4]} position={[0, 2.0, 0]} color="#E2E8F0" />
                {[0.9, 1.9, 2.9].map((sy, k) => (
                  <InkBox
                    key={`prod-${k}`}
                    args={[1.7, 0.5, 2.1]}
                    position={[0, sy, 0]}
                    color={["#EF4444", "#22C55E", "#3B82F6", "#F59E0B", "#EC4899"][(side + j + k) % 5]}
                  />
                ))}
              </group>
            ))
          )}
        </group>
      )}

      {/* DORMITORIO NOCTURNO REAL (cama, almohada, lámpara y ventana) */}
      {horizon === "bedroom_night" && (
        <group>
          <InkBox args={[22, 9.5, 0.5]} position={[0, 4.3, -7.8]} color={shot.wallColor ?? "#1E1B4B"} />
          <InkBox args={[0.5, 9.5, 20]} position={[-9.0, 4.3, 0]} color={shot.wallColor ?? "#17143A"} />
          <InkBox args={[0.5, 9.5, 20]} position={[9.0, 4.3, 0]} color={shot.wallColor ?? "#17143A"} />
          {/* Ventana con cielo nocturno */}
          <InkBox args={[3.2, 3.0, 0.2]} position={[-3.8, 5.0, -7.45]} color="#312E81" />
          <mesh position={[-3.8, 5.0, -7.32]}>
            <planeGeometry args={[2.7, 2.5]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          <mesh position={[-3.2, 5.6, -7.28]}>
            <circleGeometry args={[0.35, 12]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
          {/* Cama real con colchón, cobija y almohada blanca */}
          <InkBox args={[5.4, 1.1, 3.4]} position={[1.4, 0.55, -2.8]} color="#78350F" />
          <InkBox args={[5.1, 0.7, 3.1]} position={[1.4, 1.3, -2.8]} color="#3B82F6" />
          <InkBox args={[1.5, 0.5, 2.6]} position={[3.0, 1.85, -2.8]} color="#F8FAFC" />
          {/* Mesita de noche y lámpara */}
          <InkBox args={[1.4, 1.4, 1.4]} position={[4.9, 0.7, -3.2]} color="#451A03" />
          <InkBox args={[0.9, 0.7, 0.9]} position={[4.9, 2.0, -3.2]} color="#FDE047" />
        </group>
      )}

      {/* PLAYA REAL CON PALMERAS, SOMBRILLA Y OCÉANO */}
      {horizon === "beach_shore" && (
        <group>
          {/* Mar al fondo (azul profundo o seco según floorColor) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, -26]}>
            <planeGeometry args={[180, 44]} />
            <meshBasicMaterial color={shot.wallColor ?? "#0284C7"} />
          </mesh>
          {/* Palmeras cartoon */}
          {[-5.5, 5.8].map((px, i) => (
            <group key={`palm-${i}`} position={[px, 0, -5.5]}>
              <InkBox args={[0.48, 5.2, 0.48]} position={[0, 2.6, 0]} color="#78350F" />
              <InkBox args={[2.8, 0.55, 2.8]} position={[0, 5.3, 0]} color="#22C55E" />
            </group>
          ))}
          {/* Sombrilla de playa */}
          <InkBox args={[0.18, 3.6, 0.18]} position={[3.2, 1.8, -3.2]} color="#E2E8F0" />
          <mesh position={[3.2, 3.6, -3.2]}>
            <coneGeometry args={[1.9, 0.9, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </group>
      )}

      {/* COCINA REAL CON ESTUFA, CAMPANA Y GABINETES */}
      {horizon === "kitchen_stove" && (
        <group>
          <InkBox args={[22, 9.5, 0.5]} position={[0, 4.3, -7.8]} color={shot.wallColor ?? "#F8FAFC"} />
          {/* Encimera + muebles inferiores */}
          <InkBox args={[14, 2.1, 2.8]} position={[0, 1.05, -5.2]} color="#475569" />
          <InkBox args={[14.2, 0.25, 3.0]} position={[0, 2.15, -5.2]} color="#0F172A" />
          {/* Gabinetes superiores */}
          <InkBox args={[4.4, 2.4, 1.4]} position={[-4.5, 5.6, -6.4]} color="#B45309" />
          <InkBox args={[4.4, 2.4, 1.4]} position={[4.5, 5.6, -6.4]} color="#B45309" />
          {/* Campana extractora metálica encima de la estufa */}
          <InkBox args={[3.4, 2.2, 2.0]} position={[0, 5.8, -5.8]} color="#CBD5E1" />
        </group>
      )}

      {/* HORIZONTE MARÍTIMO (SOLO para escenas que realmente pasan en el mar/barco!) */}
      {horizon === "ocean" && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
            <planeGeometry args={[180, 180]} />
            <meshBasicMaterial color={shot.skyMode === "sunset_purple" ? "#2E6A82" : "#34C3B5"} />
          </mesh>
          {/* Barandilla roja cubierta solo cuando ocean_deck */}
          <InkBox args={[24, 1.7, 0.55]} position={[0, 0.85, -8.5]} color="#B86852" />
          {/* Olas caricaturescas animadas */}
          {[-14, -4, 7, 16].map((wx, i) => (
            <mesh
              key={`wave-${i}`}
              position={[wx + Math.sin(frame * 0.1 + i) * 1.4, -0.4, -15 - i * 4]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[4.5, 0.35]} />
              <meshBasicMaterial color="#BDF3EE" />
            </mesh>
          ))}
        </group>
      )}

      {/* Nubes estilizadas en exteriores */}
      {horizon !== "interior" &&
        shot.skyMode !== "dramatic_dark" &&
        [
          [-15, 16, -42],
          [8, 19, -46],
          [24, 15, -38],
        ].map((cp, idx) => (
          <group key={`cloud-${idx}`} position={cp as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[2.7, 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[2.2, -0.5, 0]}>
              <sphereGeometry args={[1.9, 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[-2.1, -0.6, 0]}>
              <sphereGeometry args={[1.8, 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}
    </>
  );
};

// --- MUNDO 3D CON CÁMARA FRENÉTICA ---
const ToonWorld: React.FC<{
  shot: ToonShot;
  characters: Record<string, ToonCharStyle>;
  camPos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  rollDeg: number;
  frame: number;
  fps: number;
}> = ({ shot, characters, camPos, lookAt, fov, rollDeg, frame, fps }) => {
  const skyTex = useMemo(() => makeSkyTexture(shot.skyMode), [shot.skyMode]);

  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(camPos[0], camPos[1], camPos[2]);
  cam.up.set(0, 1, 0);
  cam.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  if (rollDeg !== 0) {
    cam.rotateZ((rollDeg * Math.PI) / 180);
  }
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }

  const lt = (frame - shot.start) / fps;

  return (
    <>
      <ambientLight intensity={1.18} color="#ffffff" />
      <directionalLight position={[12, 24, 14]} intensity={1.65} color="#fff7e2" castShadow />

      {/* Domo de cielo */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[105, 24, 16]} />
        <meshBasicMaterial map={skyTex} side={THREE.BackSide} />
      </mesh>

      <StageEnvironment shot={shot} frame={frame} />

      {/* Bloques 3D personalizados únicos por escena (customBlocks) */}
      {(shot.customBlocks ?? []).map((b, bIdx) => {
        const [nx, nz, sx, sz] = b.repeat ?? [1, 1, 0, 0];
        const sz3: [number, number, number] = b.size ?? [2, 2, 2];
        const col = b.color ?? "#CA9363";
        const acc = b.accent ?? "#FFE14D";
        const instances: [number, number, number][] = [];
        for (let ix = 0; ix < nx; ix++) {
          for (let iz = 0; iz < nz; iz++) {
            instances.push([b.pos[0] + ix * sx, b.pos[1], b.pos[2] + iz * sz]);
          }
        }
        return instances.map((ip, rIdx) => {
          const key = `cb-${bIdx}-${rIdx}`;
          if (b.shape === "bars") {
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                {[-1.5, -0.75, 0, 0.75, 1.5].map((bx, k) => (
                  <mesh key={k} position={[bx, sz3[1] * 0.5, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, sz3[1], 8]} />
                    <meshBasicMaterial color={col} />
                  </mesh>
                ))}
              </group>
            );
          }
          if (b.shape === "shelf") {
            const pcols = ["#FF5757", "#4CE88A", "#2CE6FF", "#FFE14D", "#C58AF9"];
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                <InkBox args={[sz3[0], sz3[1], sz3[2]]} position={[0, sz3[1] * 0.5, 0]} color={col} />
                {[0.25, 0.55, 0.82].map((yf, row) =>
                  [-0.32, 0, 0.32].map((xf, c) => (
                    <InkBox
                      key={`${row}-${c}`}
                      args={[sz3[0] * 0.24, sz3[1] * 0.18, sz3[2] * 0.4]}
                      position={[xf * sz3[0], yf * sz3[1], sz3[2] * 0.42]}
                      color={pcols[(row * 3 + c) % pcols.length]}
                    />
                  ))
                )}
              </group>
            );
          }
          if (b.shape === "skyscraper") {
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                <InkBox args={[sz3[0], sz3[1], sz3[2]]} position={[0, sz3[1] * 0.5, 0]} color={col} />
                {[0.25, 0.5, 0.75].map((yf, wi) => (
                  <mesh key={wi} position={[0, yf * sz3[1], sz3[2] * 0.51]}>
                    <boxGeometry args={[sz3[0] * 0.72, sz3[1] * 0.1, 0.05]} />
                    <meshBasicMaterial color={acc} />
                  </mesh>
                ))}
              </group>
            );
          }
          if (b.shape === "server_rack") {
            const blink = (frame + rIdx * 3) % 8 < 4;
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                <InkBox args={[sz3[0], sz3[1], sz3[2]]} position={[0, sz3[1] * 0.5, 0]} color={col} />
                {[0.3, 0.55, 0.8].map((yf, li) => (
                  <mesh key={li} position={[0, yf * sz3[1], sz3[2] * 0.51]}>
                    <boxGeometry args={[sz3[0] * 0.65, 0.14, 0.05]} />
                    <meshBasicMaterial color={blink && li % 2 === 0 ? "#FF3B3B" : acc} />
                  </mesh>
                ))}
              </group>
            );
          }
          if (b.shape === "crane") {
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                <InkBox args={[0.7, sz3[1], 0.7]} position={[0, sz3[1] * 0.5, 0]} color={col} />
                <InkBox args={[sz3[0], 0.6, 0.6]} position={[sz3[0] * 0.3, sz3[1] - 0.3, 0]} color={col} />
                <mesh position={[sz3[0] * 0.65, sz3[1] - 1.8, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 2.8, 6]} />
                  <meshBasicMaterial color={INK} />
                </mesh>
              </group>
            );
          }
          if (b.shape === "arcade_row") {
            return (
              <group key={key} position={ip} rotation={[0, b.rotY ?? 0, 0]}>
                <InkBox args={[sz3[0], sz3[1], sz3[2]]} position={[0, sz3[1] * 0.5, 0]} color={col} />
                <mesh position={[0, sz3[1] * 0.62, sz3[2] * 0.52]}>
                  <boxGeometry args={[sz3[0] * 0.72, sz3[1] * 0.45, 0.06]} />
                  <meshBasicMaterial color={acc} />
                </mesh>
              </group>
            );
          }
          if (b.shape === "cylinder") {
            return (
              <mesh key={key} position={[ip[0], ip[1] + sz3[1] * 0.5, ip[2]]} rotation={[0, b.rotY ?? 0, 0]}>
                <cylinderGeometry args={[sz3[0] * 0.5, sz3[0] * 0.5, sz3[1], 14]} />
                <meshPhongMaterial color={col} />
              </mesh>
            );
          }
          if (b.shape === "sphere") {
            return (
              <mesh key={key} position={ip}>
                <sphereGeometry args={[sz3[0] * 0.5, 14, 14]} />
                <meshPhongMaterial color={col} />
              </mesh>
            );
          }
          if (b.shape === "cone") {
            return (
              <mesh key={key} position={[ip[0], ip[1] + sz3[1] * 0.5, ip[2]]}>
                <coneGeometry args={[sz3[0] * 0.5, sz3[1], 10]} />
                <meshPhongMaterial color={col} />
              </mesh>
            );
          }
          return (
            <InkBox
              key={key}
              args={sz3}
              position={[ip[0], ip[1] + sz3[1] * 0.5, ip[2]]}
              color={col}
              rotY={b.rotY}
              rotZ={b.rotZ}
            />
          );
        });
      })}

      {/* Props 3D */}
      {(shot.props3d ?? []).map((p, idx) => {
        const pPos = p.toPos
          ? lerpTuple(p.pos, p.toPos, Math.min(1, applyEase(lt / 1.0, "fast")))
          : p.pos;
        if (p.type === "eiffel") {
          return <PropEiffel3D key={idx} pos={pPos} scale={p.scale} color={p.color} />;
        }
        if (p.type === "truck") {
          return <PropTruck1925 key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} color={p.color} />;
        }
        if (p.type === "car") {
          return <PropSportsCar3D key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} color={p.color} />;
        }
        if (p.type === "police_car") {
          return <PropPoliceCar3D key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} frame={frame} />;
        }
        if (p.type === "wanted_stars") {
          return <PropWantedStars3D key={idx} pos={pPos} scale={p.scale} frame={frame} />;
        }
        if (p.type === "ship") {
          return <PropShip3D key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} frame={frame} />;
        }
        if (p.type === "desk") {
          return <PropDesk3D key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} color={p.color} />;
        }
        if (p.type === "sack") {
          return (
            <PropSack3D
              key={idx}
              pos={pPos}
              scale={p.scale}
              color={p.color}
              label={p.label}
              faceExpr={p.faceExpr}
            />
          );
        }
        if (p.type === "money") {
          return <PropMoneyPile3D key={idx} pos={pPos} scale={p.scale} />;
        }
        if (p.type === "doc") {
          const docTex = makeDocTexture(p.label ?? "CONTRATO");
          const sc = p.scale ?? 1;
          return (
            <InkBox
              key={idx}
              args={[1.25 * sc, 1.55 * sc, 0.14 * sc]}
              position={[pPos[0], pPos[1] + 0.8 * sc, pPos[2]]}
              texture={docTex}
              rotY={p.rotY}
            />
          );
        }
        if (p.type === "sign") {
          const tex = makeCrateLabelTexture(p.label ?? "OFERTA", p.color ?? "#FFE169");
          const sc = p.scale ?? 1;
          return (
            <InkBox
              key={idx}
              args={[3.2 * sc, 1.35 * sc, 0.25 * sc]}
              position={[pPos[0], pPos[1] + 0.7 * sc, pPos[2]]}
              texture={tex}
              rotY={p.rotY}
            />
          );
        }
        if (p.type === "lamp") {
          return <PropStreetLamp3D key={idx} pos={pPos} scale={p.scale} />;
        }
        if (p.type === "xray_knee") {
          return <PropXrayBone3D key={idx} pos={pPos} scale={p.scale} kind="knee" localTime={lt} />;
        }
        if (p.type === "xray_spine") {
          return <PropXrayBone3D key={idx} pos={pPos} scale={p.scale} kind="spine" localTime={lt} />;
        }
        if (p.type === "elevator_building") {
          return <PropElevatorBuilding3D key={idx} pos={pPos} scale={p.scale} localTime={lt} />;
        }
        if (p.type === "swollen_battery") {
          return <PropSwollenBattery3D key={idx} pos={pPos} scale={p.scale} localTime={lt} />;
        }
        if (p.type === "tsunami_wall") {
          return <PropTsunamiWall3D key={idx} pos={pPos} scale={p.scale} localTime={lt} />;
        }
        if (p.type === "fish_flop") {
          return <PropFishFlop3D key={idx} pos={pPos} scale={p.scale} localTime={lt} />;
        }
        if (p.type === "pan_fire") {
          return <PropPanFire3D key={idx} pos={pPos} scale={p.scale} localTime={lt} withWater={p.label === "WATER"} />;
        }
        if (p.type === "metal_lid") {
          return <PropMetalLid3D key={idx} pos={pPos} scale={p.scale} localTime={lt} />;
        }
        if (p.type === "bottle") {
          return <PropBottle3D key={idx} pos={pPos} rotY={p.rotY} scale={p.scale} color={p.color} />;
        }
        if (p.type === "barrel") {
          return <PropBarrel3D key={idx} pos={pPos} scale={p.scale} color={p.color} />;
        }
        if (p.type === "orb") {
          return <PropGlowingOrb key={idx} pos={pPos} scale={p.scale} frame={frame} />;
        }
        if (p.type === "pedestal") {
          return <InkBox key={idx} args={[2.2, 1.0, 2.2]} position={[pPos[0], pPos[1] + 0.5, pPos[2]]} color={p.color ?? "#E2CC97"} />;
        }
        const tex = p.label ? makeCrateLabelTexture(p.label, p.color ?? "#CA9363") : undefined;
        const sc = p.scale ?? 1;
        return (
          <InkBox
            key={idx}
            args={[1.7 * sc, 1.35 * sc, 1.35 * sc]}
            position={[pPos[0], pPos[1] + 0.68 * sc, pPos[2]]}
            color={p.color ?? "#CA9363"}
            texture={tex}
            rotY={p.rotY}
          />
        );
      })}

      {/* Personajes cabeza blanca */}
      {shot.actors.map((a, idx) => (
        <CharacterBillboard
          key={`${a.id}-${idx}`}
          actor={a}
          style={characters[a.id] ?? { shirt: "#3a6ea5" }}
          camPos={camPos}
          shotStart={shot.start}
          frame={frame}
          fps={fps}
        />
      ))}

      {/* FX slapstick */}
      {(shot.fx ?? []).map((fx, idx) => (
        <ComicFX3D key={idx} fx={fx} frame={frame} />
      ))}
    </>
  );
};

// --- OVERLAY RADIAL SPEED LINES (DOPAMINA VISUAL) ---
const SpeedLinesOverlay: React.FC<{ frame: number; intense?: boolean }> = ({ frame, intense }) => {
  const count = intense ? 30 : 20;
  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const ang = (i / count) * Math.PI * 2 + (frame % 3) * 0.08;
        const innerR = (intense ? 430 : 510) + ((i * 37 + frame * 55) % 140);
        const outerR = 1280;
        const x1 = 540 + Math.cos(ang) * innerR;
        const y1 = 960 + Math.sin(ang) * innerR * 1.45;
        const x2 = 540 + Math.cos(ang) * outerR;
        const y2 = 960 + Math.sin(ang) * outerR * 1.45;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 3 === 0 ? "#FFFFFF" : "#141218"}
            strokeWidth={intense ? 8 : 5}
            strokeOpacity={intense ? 0.65 : 0.42}
          />
        );
      })}
    </svg>
  );
};

// --- ENGINE PRINCIPAL TOON FRENÉTICO ---
export const ToonFreneticoEngine: React.FC<{ spec: ToonFreneticoSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const shot =
    spec.shots.find((s) => frame >= s.start && frame < s.end) ??
    spec.shots[spec.shots.length - 1];

  const dur = Math.max(1, shot.end - shot.start);
  const t = applyEase((frame - shot.start) / dur, shot.camEase ?? "fast");

  let camPos = lerpTuple(shot.camFrom, shot.camTo, t);
  let lookAt = lerpTuple(shot.lookFrom, shot.lookTo, t);
  let fov = shot.fov ?? 46;
  let rollDeg = (shot.rollFrom ?? 0) + ((shot.rollTo ?? 0) - (shot.rollFrom ?? 0)) * t;

  // Golpe de zoom en los primeros frames del corte
  if (shot.punch && frame - shot.start < 6) {
    const k = 1 - (frame - shot.start) / 6;
    fov -= k * 6.5;
  }

  // Soporte de múltiples sacudidas por plano
  const shakes = Array.isArray(shot.shakeAt)
    ? shot.shakeAt
    : shot.shakeAt !== undefined
    ? [shot.shakeAt]
    : [];
  for (const sa of shakes) {
    if (frame >= sa && frame < sa + 11) {
      const sk = 1 - (frame - sa) / 11;
      const jx = Math.sin(frame * 3.1) * 0.58 * sk;
      const jy = Math.cos(frame * 3.9) * 0.58 * sk;
      camPos = [camPos[0] + jx, camPos[1] + jy, camPos[2]];
      lookAt = [lookAt[0] + jx * 0.45, lookAt[1] + jy * 0.45, lookAt[2]];
      rollDeg += Math.sin(frame * 4.5) * 4.2 * sk;
    }
  }

  // Flash de impacto blanco/dorado (2 frames)
  const flashes = Array.isArray(shot.flashAt)
    ? shot.flashAt
    : shot.flashAt !== undefined
    ? [shot.flashAt]
    : [];
  let flashOp = 0;
  for (const fa of flashes) {
    if (frame >= fa && frame <= fa + 2) {
      flashOp = Math.max(flashOp, frame === fa ? 0.55 : 0.28);
    }
  }

  const activeCaption = spec.captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );
  const capPop = activeCaption
    ? interpolate(frame - activeCaption.startFrame, [0, 3], [1.18, 1.0], { extrapolateRight: "clamp" })
    : 1;

  const blurActive = shot.whipBlur && frame - shot.start < 4;

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: blurActive ? "blur(6px) saturate(1.15)" : "none",
          transform: blurActive ? "scaleX(1.06)" : "none",
        }}
      >
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ position: camPos, fov, near: 0.1, far: 260 }}
        >
          <ToonWorld
            shot={shot}
            characters={spec.characters}
            camPos={camPos}
            lookAt={lookAt}
            fov={fov}
            rollDeg={rollDeg}
            frame={frame}
            fps={fps}
          />
        </ThreeCanvas>
      </div>

      {/* Líneas de velocidad radiales en momentos de adrenalina */}
      {shot.speedLines && (
        <SpeedLinesOverlay frame={frame} intense={shot.speedLines === "intense"} />
      )}

      {/* Viñeta dramática opcional */}
      {shot.vignette && shot.vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle, rgba(0,0,0,0) 42%, rgba(15,10,20,${shot.vignette}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Flash de impacto */}
      {flashOp > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFF9D6",
            opacity: flashOp,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Subtítulo grueso estilo srz_reel_001: paintOrder stroke fill + contorno negro real */}
      {activeCaption && (
        <div
          style={{
            position: "absolute",
            top: "69%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${capPop})`,
            fontFamily: "'Arial Black', 'Montserrat', sans-serif",
            fontSize: 68,
            fontWeight: 900,
            color: activeCaption.accentColor ?? "#FFFFFF",
            paintOrder: "stroke fill",
            WebkitTextStroke: "14px #141218",
            textShadow: "0 7px 0 #141218, 0 10px 18px rgba(20,18,24,0.85)",
            textAlign: "center",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {activeCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
