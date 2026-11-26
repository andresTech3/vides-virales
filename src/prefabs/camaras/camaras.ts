/**
 * camaras.ts — Librería de 12 tipos de cámara reutilizables.
 * Cada función recibe t (0–1) y retorna position + lookAt para THREE.Camera.
 */

import * as THREE from 'three';

export type TipoCamara =
  | 'orbital_espacio'
  | 'street_fps'
  | 'dron_aerial'
  | 'dutch_angle'
  | 'corkscrew_salida'
  | 'seguimiento_lateral'
  | 'zoom_in_rapido'
  | 'pan_paisaje'
  | 'dolly_acercamiento'
  | 'estatica_editorial'
  | 'over_shoulder'
  | 'corte_tecnico';

export interface PoseCamara {
  position: THREE.Vector3;
  target: THREE.Vector3;
  /** Rotación de roll en radianes (para dutch angle) */
  roll?: number;
  /** FOV en grados (default 60) */
  fov?: number;
}

// ─── Implementaciones ─────────────────────────────────────────────────────

/**
 * Órbita suave alrededor del origen en el espacio.
 * Ideal para: planetas, discos, objetos espaciales.
 */
export function cam_orbital_espacio(t: number, radio = 8, altura = 2): PoseCamara {
  const angulo = t * Math.PI * 2 * 0.4;
  return {
    position: new THREE.Vector3(
      Math.cos(angulo) * radio,
      altura + Math.sin(t * Math.PI * 2 * 0.2) * 1.5,
      Math.sin(angulo) * radio,
    ),
    target: new THREE.Vector3(0, 1, 0),
    fov: 55,
  };
}

/**
 * Cámara primera persona avanzando por calle urbana.
 * Ideal para: ciudad, multitud, FPS experiments.
 */
export function cam_street_fps(t: number, largoCalle = 20): PoseCamara {
  const z = -5 + t * largoCalle;
  const headBob = Math.sin(t * Math.PI * 2 * 4) * 0.04;
  return {
    position: new THREE.Vector3(0, 1.65 + headBob, z),
    target: new THREE.Vector3(0, 1.6, z + 5),
    fov: 75,
  };
}

/**
 * Vista de dron bajando en picada desde arriba.
 */
export function cam_dron_aerial(t: number, altura = 25, horizontalSpan = 10): PoseCamara {
  const y = altura - t * (altura - 6);
  return {
    position: new THREE.Vector3(Math.sin(t * Math.PI) * horizontalSpan * 0.3, y, Math.cos(t * Math.PI) * horizontalSpan * 0.2),
    target: new THREE.Vector3(0, 0, 0),
    fov: 60,
  };
}

/**
 * Ángulo holandés (Dutch angle) con shake para tensión.
 * Ideal para: catástrofes, giros dramáticos.
 */
export function cam_dutch_angle(t: number, intensidad = 1): PoseCamara {
  const shake = Math.sin(t * Math.PI * 2 * 12) * 0.03 * intensidad;
  return {
    position: new THREE.Vector3(
      2 + Math.sin(t * Math.PI * 2 * 0.8) * 0.5,
      2 + shake,
      5 + shake,
    ),
    target: new THREE.Vector3(0, 1, 0),
    roll: 0.25 * intensidad + shake * 0.5,
    fov: 65,
  };
}

/**
 * Espiral corkscrew alejándose del sujeto. Ideal para cierres hipnóticos.
 */
export function cam_corkscrew_salida(t: number): PoseCamara {
  const radio = 3 + t * 8;
  const altura = 1 + t * 5;
  const angulo = t * Math.PI * 2 * 2;
  return {
    position: new THREE.Vector3(
      Math.cos(angulo) * radio,
      altura,
      Math.sin(angulo) * radio,
    ),
    target: new THREE.Vector3(0, 1, 0),
    fov: 55 + t * 20,
  };
}

/**
 * Tracking lateral de un personaje en movimiento.
 * Ideal para: corredor, vehículo, personaje caminando.
 */
export function cam_seguimiento_lateral(t: number, velocidad = 1): PoseCamara {
  const x = -4 + t * 12 * velocidad;
  return {
    position: new THREE.Vector3(x - 3, 1.5, 4),
    target: new THREE.Vector3(x, 1, 0),
    fov: 55,
  };
}

/**
 * Zoom dramático rápido hacia un dato u objeto.
 * Ideal para: reveals de números grandes, CMB.
 */
export function cam_zoom_in_rapido(t: number, inicio = 10, fin = 2): PoseCamara {
  const d = inicio + (fin - inicio) * Math.pow(t, 0.5);
  return {
    position: new THREE.Vector3(0, 1.5, d),
    target: new THREE.Vector3(0, 1.5, 0),
    fov: 60 - t * 20,
  };
}

/**
 * Barrido panorámico de izquierda a derecha.
 * Ideal para: paisajes, multitud, ciudad en panorama.
 */
export function cam_pan_paisaje(t: number, radio = 15): PoseCamara {
  const angulo = -0.4 + t * 0.8;
  return {
    position: new THREE.Vector3(0, 3, radio),
    target: new THREE.Vector3(Math.sin(angulo) * 20, 1, 0),
    fov: 50,
  };
}

/**
 * Dolly suave acercándose al sujeto desde distancia media.
 */
export function cam_dolly_acercamiento(t: number, inicio = 8, fin = 3): PoseCamara {
  const z = inicio + (fin - inicio) * t;
  return {
    position: new THREE.Vector3(0.5, 1.8, z),
    target: new THREE.Vector3(0, 1.2, 0),
    fov: 50,
  };
}

/**
 * Plano fijo limpio tipo editorial/diagrama.
 * Ideal para: infografías, diagramas científicos, posters.
 */
export function cam_estatica_editorial(_t: number): PoseCamara {
  return {
    position: new THREE.Vector3(0, 2, 6),
    target: new THREE.Vector3(0, 1, 0),
    fov: 45,
  };
}

/**
 * Vista sobre el hombro del personaje.
 */
export function cam_over_shoulder(t: number): PoseCamara {
  const sway = Math.sin(t * Math.PI * 2 * 0.3) * 0.1;
  return {
    position: new THREE.Vector3(0.5 + sway, 1.7, 1.5),
    target: new THREE.Vector3(0, 1.6, -5),
    fov: 60,
  };
}

/**
 * Corte técnico: cámara frontal elevada revelando interior de objeto.
 * Ideal para: dishwasher, motor, órgano, máquina.
 */
export function cam_corte_tecnico(t: number): PoseCamara {
  const y = 5 - t * 1.5;
  return {
    position: new THREE.Vector3(0, y, 6),
    target: new THREE.Vector3(0, 1, 0),
    fov: 40,
  };
}

// ─── Dispatcher unificado ────────────────────────────────────────────────

export const CAMARAS: Record<TipoCamara, (t: number) => PoseCamara> = {
  orbital_espacio: cam_orbital_espacio,
  street_fps: cam_street_fps,
  dron_aerial: cam_dron_aerial,
  dutch_angle: cam_dutch_angle,
  corkscrew_salida: cam_corkscrew_salida,
  seguimiento_lateral: cam_seguimiento_lateral,
  zoom_in_rapido: cam_zoom_in_rapido,
  pan_paisaje: cam_pan_paisaje,
  dolly_acercamiento: cam_dolly_acercamiento,
  estatica_editorial: cam_estatica_editorial,
  over_shoulder: cam_over_shoulder,
  corte_tecnico: cam_corte_tecnico,
};

/**
 * Obtiene la pose de cámara para un tipo y tiempo dados.
 * @param tipo — TipoCamara
 * @param t — Progreso de la escena (0–1)
 */
export function obtenerPoseCamara(tipo: TipoCamara, t: number): PoseCamara {
  return CAMARAS[tipo](t);
}

/**
 * Aplica una PoseCamara a una cámara THREE.js.
 */
export function aplicarPoseCamara(
  camera: THREE.PerspectiveCamera,
  pose: PoseCamara,
): void {
  camera.position.copy(pose.position);
  camera.lookAt(pose.target);
  if (pose.roll !== undefined) {
    camera.rotation.z = pose.roll;
  }
  if (pose.fov !== undefined && camera.fov !== pose.fov) {
    camera.fov = pose.fov;
    camera.updateProjectionMatrix();
  }
}

/**
 * Interpola suavemente entre dos poses de cámara (para transiciones).
 */
export function interpolarPoses(a: PoseCamara, b: PoseCamara, t: number): PoseCamara {
  return {
    position: a.position.clone().lerp(b.position, t),
    target: a.target.clone().lerp(b.target, t),
    roll: ((a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * t),
    fov: ((a.fov ?? 60) + ((b.fov ?? 60) - (a.fov ?? 60)) * t),
  };
}
