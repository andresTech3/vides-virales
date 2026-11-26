// Story, Shot Definitions, and Camera Paths for Lorakh Entrevista Pro (Corporate 3D Cartoon).
import * as THREE from 'three';

export const FPS = 30;
export const TOTAL = 1440; // 48.0 seconds exact
export const D0 = 0.0;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export type ShotDef = {
  id: number;
  a: number;
  b: number;
  name: string;
  light: 'daylight' | 'golden';
};

export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 204, name: 'lobby_countdown', light: 'daylight' },
  { id: 2, a: 204, b: 495, name: 'candidate_cheap_sprays', light: 'daylight' },
  { id: 3, a: 495, b: 759, name: 'candidate_lorakh_serene', light: 'golden' },
  { id: 4, a: 759, b: 981, name: 'director_rejection_x', light: 'daylight' },
  { id: 5, a: 981, b: 1224, name: 'director_approval_handshake', light: 'golden' },
  { id: 6, a: 1224, b: 1440, name: 'executive_table_showcase', light: 'golden' },
];

export const XFADE: Record<number, number> = { 2: 8, 3: 8, 4: 8, 5: 8, 6: 10 };

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) {
      return [
        { id: s.id - 1, alpha: 1 },
        { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) },
      ];
    }
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export type CamKey = {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  roll?: number;
};

// Ángulos cinematográficos amplios y abiertos (Safe Zone vertical garantizada sin cortar personajes)
export const cameraAt = (frame: number): CamKey => {
  const f = Math.max(0, Math.min(TOTAL - 1, frame));

  if (f < 204) {
    // Shot 1: Gran angular del lobby corporativo, reloj de cuenta regresiva y ambos candidatos en el banco
    const t = f / 204;
    const glide = smoother(t) * 0.5;
    return {
      pos: new THREE.Vector3(0.0, 1.75, 6.6 - glide),
      look: new THREE.Vector3(0.0, 1.15, -0.6),
      fov: 46,
      roll: 0,
    };
  } else if (f < 495) {
    // Shot 2: Candidato Barato en plano medio amplio, rociando perfume con nube tóxica y recepcionista tosiendo
    const t = (f - 204) / (495 - 204);
    const push = smoother(t) * 0.3;
    return {
      pos: new THREE.Vector3(-0.65, 1.45, 4.4 - push),
      look: new THREE.Vector3(-0.65, 1.05, -0.5),
      fov: 44,
      roll: 0.008 * Math.sin(t * Math.PI * 2),
    };
  } else if (f < 759) {
    // Shot 3: Candidato Lorakh con traje impecable, aura dorada y recepcionista sonriendo en plano amplio
    const t = (f - 495) / (759 - 495);
    const push = smoother(t) * 0.3;
    return {
      pos: new THREE.Vector3(0.65, 1.45, 4.4 - push),
      look: new THREE.Vector3(0.65, 1.05, -0.5),
      fov: 44,
      roll: -0.008 * Math.sin(t * Math.PI * 2),
    };
  } else if (f < 981) {
    // Shot 4: Puerta de dirección abierta. Director sale, huele el alcohol barato y hace gesto de rechazo
    const t = (f - 759) / (981 - 759);
    const glide = smoother(t) * 0.4;
    return {
      pos: new THREE.Vector3(0.0, 1.65, 5.6 - glide),
      look: new THREE.Vector3(0.0, 1.15, -1.4),
      fov: 46,
      roll: 0,
    };
  } else if (f < 1224) {
    // Shot 5: Director huele la fragancia Lorakh, sonríe y le estrecha la mano al Candidato Lorakh
    const t = (f - 981) / (1224 - 981);
    const push = smoother(t) * 0.35;
    return {
      pos: new THREE.Vector3(0.0, 1.65, 5.5 - push),
      look: new THREE.Vector3(0.0, 1.15, -1.4),
      fov: 46,
      roll: 0,
    };
  } else {
    // Shot 6: Mesa ejecutiva de mármol con los dos frascos Lorakh de cristal y vista panorámica a rascacielos
    const t = (f - 1224) / (1440 - 1224);
    const pull = smoother(t) * 0.4;
    return {
      pos: new THREE.Vector3(0.0, 1.25, 3.2 - pull),
      look: new THREE.Vector3(0.0, 0.85, 0.0),
      fov: 42,
      roll: 0,
    };
  }
};

export const dofAt = (f: number): { blurSize: number } => {
  if (f < 204) return { blurSize: 8 }; // Gran angular nítido
  if (f < 495) return { blurSize: 12 };
  if (f < 759) return { blurSize: 12 };
  if (f < 981) return { blurSize: 10 };
  if (f < 1224) return { blurSize: 10 };
  return { blurSize: 14 }; // Macro frascos de cristal
};

