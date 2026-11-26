// Timeline, shot definitions, camera paths, transitions and states for Lorakh Short.
import * as THREE from 'three';

export const FPS = 30;
export const TOTAL = 2400; // 80.00 seconds exact
export const D0 = 0.0;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export type ShotDef = {
  id: number;
  a: number;
  b: number;
  name: string;
  light: 'night';
};

export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 358, name: 'hook_bottles', light: 'night' },
  { id: 2, a: 358, b: 590, name: 'club_atmosphere', light: 'night' },
  { id: 3, a: 590, b: 1090, name: 'cheap_guy_fails', light: 'night' },
  { id: 4, a: 1090, b: 1540, name: 'lorakh_guy_radiates', light: 'night' },
  { id: 5, a: 1540, b: 1840, name: 'bar_whisper_compliment', light: 'night' },
  { id: 6, a: 1840, b: 2090, name: 'science_contrast', light: 'night' },
  { id: 7, a: 2090, b: 2400, name: 'grand_finale_pullout', light: 'night' },
];

export const XFADE: Record<number, number> = { 2: 10, 3: 8, 4: 8, 5: 8, 6: 8, 7: 12 };

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

// Planos cinematográficos amplios (Safe Zone garantizada para no cortar a los personajes)
export const cameraAt = (frame: number): CamKey => {
  const f = Math.max(0, Math.min(TOTAL - 1, frame));

  if (f < 358) {
    // Shot 1: Mesa y dos frascos con los dos personajes de pie (plano amplio)
    const t = f / 358;
    const glide = smoother(t) * 0.3;
    return {
      pos: new THREE.Vector3(-4.5, 1.55, 4.6 - glide),
      look: new THREE.Vector3(-4.5, 1.1, -1.0),
      fov: 46,
      roll: 0,
    };
  } else if (f < 590) {
    // Shot 2: Vista general de la discoteca (wide establishing)
    const t = (f - 358) / (590 - 358);
    const glide = smoother(t) * 0.4;
    return {
      pos: new THREE.Vector3(0.0, 2.6 - glide * 0.3, 7.0 - glide),
      look: new THREE.Vector3(0.0, 1.5, -2.5),
      fov: 48,
      roll: -0.01 + t * 0.02,
    };
  } else if (f < 1090) {
    // Shot 3: Chico Perfume Barato en la pista (amplio, centrado, con holgura)
    const t = (f - 590) / (1090 - 590);
    const pushIn = smoother(t) * 0.25;
    return {
      pos: new THREE.Vector3(-1.0, 1.45, 4.6 - pushIn),
      look: new THREE.Vector3(-1.0, 1.05, -0.5),
      fov: 46,
      roll: 0.01 * Math.sin(t * Math.PI * 2),
    };
  } else if (f < 1540) {
    // Shot 4: Chico Lorakh con aura aromática magnética
    const t = (f - 1090) / (1540 - 1090);
    const pushIn = smoother(t) * 0.25;
    return {
      pos: new THREE.Vector3(0.8, 1.45, 4.6 - pushIn),
      look: new THREE.Vector3(0.8, 1.05, -0.5),
      fov: 46,
      roll: -0.01 * Math.sin(t * Math.PI * 2),
    };
  } else if (f < 1840) {
    // Shot 5: En la barra - La chica VIP acercándose a su oído
    const t = (f - 1540) / (1840 - 1540);
    const pushIn = smoother(t) * 0.3;
    return {
      pos: new THREE.Vector3(5.2, 1.45, 5.0 - pushIn),
      look: new THREE.Vector3(5.2, 1.05, 0.6),
      fov: 46,
      roll: 0.01,
    };
  } else if (f < 2090) {
    // Shot 6: Comparativa de calidad y fórmula
    const t = (f - 1840) / (2090 - 1840);
    const glide = smoother(t) * 0.2;
    return {
      pos: new THREE.Vector3(-4.5, 1.5, 4.4 - glide),
      look: new THREE.Vector3(-4.5, 1.05, -1.0),
      fov: 46,
      roll: 0,
    };
  } else {
    // Shot 7: Gran Pull-out hacia atrás revelando el club y la presencia Lorakh
    const t = (f - 2090) / (2400 - 2090);
    const pullOut = smoother(t) * 2.8;
    return {
      pos: new THREE.Vector3(0.0, 1.5 + t * 0.6, 5.0 + pullOut),
      look: new THREE.Vector3(0.0, 1.1, 0.0),
      fov: 48,
      roll: 0,
    };
  }
};

// Profundidad de campo suave (enfocado en los personajes principales)
export const dofAt = (frame: number): { focusDist: number; blurSize: number } => {
  if (frame < 358) return { focusDist: 4.8, blurSize: 5.0 };
  if (frame < 590) return { focusDist: 6.5, blurSize: 3.0 }; // Gran angular nítido
  if (frame < 1090) return { focusDist: 4.6, blurSize: 6.0 };
  if (frame < 1540) return { focusDist: 4.6, blurSize: 6.0 };
  if (frame < 1840) return { focusDist: 4.4, blurSize: 5.5 };
  if (frame < 2090) return { focusDist: 4.5, blurSize: 5.0 };
  return { focusDist: 5.5, blurSize: 3.5 };
};

// Estado dinámico de efectos y personajes
export const lorakhStateAt = (frame: number) => {
  // Nube de perfume barato desapareciendo en shot 3 (590–1090)
  let cheapCloudLevel = 0;
  if (frame >= 590 && frame < 1090) {
    const t = (frame - 590) / (1090 - 590);
    // Aparece al principio (t < 0.2) y luego se desvanece a 0
    cheapCloudLevel = t < 0.2 ? t / 0.2 : Math.max(0, 1.0 - (t - 0.2) / 0.45);
  }

  // Aura aromática de Lorakh en shot 4 (1090–1540) y finale (2090–2400)
  let lorakhAuraLevel = 0;
  if (frame >= 1090 && frame < 1540) {
    const t = (frame - 1090) / (1540 - 1090);
    lorakhAuraLevel = Math.min(1.0, t * 2.0);
  } else if (frame >= 2090) {
    lorakhAuraLevel = 1.0;
  }

  // Acercamiento de la chica al oído en shot 5 (1540–1840)
  let whisperLevel = 0;
  if (frame >= 1540 && frame < 1840) {
    const t = (frame - 1540) / (1840 - 1540);
    whisperLevel = smoother(clamp01(t * 1.5));
  }

  return { cheapCloudLevel, lorakhAuraLevel, whisperLevel };
};
