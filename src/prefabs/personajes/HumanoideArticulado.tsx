/**
 * HumanoideArticulado — Prefab core de personaje 3D reutilizable.
 * Usado en 12+ estilos: lowpoly, fps, clay, crowd, cinematic, etc.
 */

import * as THREE from 'three';

export type AnimacionHumanoide =
  | 'caminar'
  | 'correr'
  | 'idle_respirar'
  | 'idle_mirar'
  | 'caer'
  | 'señalar'
  | 'tumbarse';

export interface OpcionesHumanoide {
  /** Color de piel (hex) */
  colorPiel?: string;
  /** Color de camisa/torso */
  colorCamisa?: string;
  /** Color de pantalón */
  colorPantalon?: string;
  /** Color de cabello */
  colorCabello?: string;
  /** Escala total del personaje */
  escala?: number;
  /** Animación activa */
  animacion?: AnimacionHumanoide;
  /** Progreso del ciclo de animación (0–1, loopable) */
  t?: number;
  /** ¿Mostrar solo silueta? */
  silueta?: boolean;
  /** Color de silueta override */
  colorSilueta?: string;
  /** ¿Estilo low-poly facetado? (true) vs smooth (false) */
  lowpoly?: boolean;
  /** Opacidad (0–1) */
  opacidad?: number;
}

const DEFAULT_OPTS: Required<OpcionesHumanoide> = {
  colorPiel: '#c68642',
  colorCamisa: '#e63946',
  colorPantalon: '#1d3557',
  colorCabello: '#2c1810',
  escala: 1,
  animacion: 'idle_respirar',
  t: 0,
  silueta: false,
  colorSilueta: '#ffffff',
  lowpoly: true,
  opacidad: 1,
};

/** Crea materiales con cache para evitar duplicar texturas en GPU */
const _matCache = new Map<string, THREE.MeshLambertMaterial>();
function mat(color: string, opacidad = 1): THREE.MeshLambertMaterial {
  const key = `${color}_${opacidad}`;
  if (!_matCache.has(key)) {
    _matCache.set(key, new THREE.MeshLambertMaterial({
      color: new THREE.Color(color),
      transparent: opacidad < 1,
      opacity: opacidad,
    }));
  }
  return _matCache.get(key)!;
}

function matSilueta(color: string): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
}

/** Geometría low-poly de caja con faces planas */
function caja(w: number, h: number, d: number): THREE.BoxGeometry {
  return new THREE.BoxGeometry(w, h, d, 1, 1, 1);
}

/** Geometría de esfera low-poly para cabeza */
function esfera(r: number, segs = 6): THREE.SphereGeometry {
  return new THREE.SphereGeometry(r, segs, segs);
}

/** Cilindro ligero para cuello y articulaciones */
function cil(r: number, h: number, segs = 5): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(r, r, h, segs);
}

// ─── Cálculos de animación ─────────────────────────────────────────────────

function calcAnguloCaminar(t: number, velocidad = 1): number {
  return Math.sin(t * Math.PI * 2 * velocidad) * 0.45;
}

function calcAnguloCabeza(t: number): { x: number; y: number } {
  return {
    x: Math.sin(t * Math.PI * 2 * 0.3) * 0.06,
    y: Math.sin(t * Math.PI * 2 * 0.2) * 0.08,
  };
}

function calcBrazoSwing(t: number, offset = 0): number {
  return Math.sin((t + offset) * Math.PI * 2) * 0.4;
}

// ─── Ensamblaje del personaje ─────────────────────────────────────────────

/**
 * Construye el grupo THREE.Group del humanoid.
 * Este grupo se puede añadir directamente a cualquier escena.
 *
 * @example
 * const persona = crearHumanoide({ colorCamisa: '#22d3ee', animacion: 'caminar', t: frame/fps });
 * scene.add(persona);
 */
export function crearHumanoide(opts: OpcionesHumanoide = {}): THREE.Group {
  const o: Required<OpcionesHumanoide> = { ...DEFAULT_OPTS, ...opts };
  const t = o.t;
  const opac = o.opacidad;

  const colores = o.silueta
    ? { piel: o.colorSilueta, camisa: o.colorSilueta, pantalon: o.colorSilueta, cabello: o.colorSilueta }
    : { piel: o.colorPiel, camisa: o.colorCamisa, pantalon: o.colorPantalon, cabello: o.colorCabello };

  const getMat = o.silueta
    ? (c: string) => matSilueta(c)
    : (c: string) => mat(c, opac);

  const g = new THREE.Group();

  // ── Torso
  const torso = new THREE.Mesh(caja(0.35, 0.45, 0.22), getMat(colores.camisa));
  torso.position.y = 0.9;
  g.add(torso);

  // ── Cabeza
  const cabezaG = new THREE.Group();
  const cabeza = new THREE.Mesh(esfera(0.18), getMat(colores.piel));
  cabeza.position.y = 1.3;
  const { x: hx, y: hy } = calcAnguloCabeza(t);
  cabeza.rotation.x = hx;
  cabeza.rotation.y = hy;

  // Cabello (parte superior)
  const cabello = new THREE.Mesh(new THREE.SphereGeometry(0.185, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), getMat(colores.cabello));
  cabello.position.y = 1.3 + 0.04;
  g.add(cabezaG);
  cabezaG.add(cabeza);
  cabezaG.add(cabello);

  // ── Cuello
  const cuello = new THREE.Mesh(cil(0.07, 0.1), getMat(colores.piel));
  cuello.position.y = 1.13;
  g.add(cuello);

  // ── Pelvis
  const pelvis = new THREE.Mesh(caja(0.32, 0.2, 0.2), getMat(colores.pantalon));
  pelvis.position.y = 0.63;
  g.add(pelvis);

  // ── Animación principal
  let brazoDer_angulo = 0;
  let brazoIzq_angulo = 0;
  let piernaDer_angulo = 0;
  let piernaIzq_angulo = 0;
  let bodyBob = 0;
  let bodyTilt = 0;

  switch (o.animacion) {
    case 'caminar':
      piernaDer_angulo = calcAnguloCaminar(t, 1);
      piernaIzq_angulo = -calcAnguloCaminar(t, 1);
      brazoDer_angulo = calcBrazoSwing(t, 0.5) * 0.6;
      brazoIzq_angulo = -calcBrazoSwing(t, 0.5) * 0.6;
      bodyBob = Math.abs(Math.sin(t * Math.PI * 2)) * 0.04;
      break;
    case 'correr':
      piernaDer_angulo = calcAnguloCaminar(t, 2) * 1.3;
      piernaIzq_angulo = -calcAnguloCaminar(t, 2) * 1.3;
      brazoDer_angulo = calcBrazoSwing(t, 0.5) * 1.1;
      brazoIzq_angulo = -calcBrazoSwing(t, 0.5) * 1.1;
      bodyBob = Math.abs(Math.sin(t * Math.PI * 4)) * 0.07;
      bodyTilt = 0.15;
      break;
    case 'idle_respirar':
      bodyBob = Math.sin(t * Math.PI * 2 * 0.5) * 0.02;
      brazoDer_angulo = 0.15;
      brazoIzq_angulo = -0.15;
      break;
    case 'idle_mirar':
      bodyBob = Math.sin(t * Math.PI * 2 * 0.5) * 0.02;
      cabezaG.rotation.y = Math.sin(t * Math.PI * 2 * 0.3) * 0.4;
      break;
    case 'caer':
      bodyTilt = -0.5 - t * 0.8;
      piernaDer_angulo = 0.4;
      piernaIzq_angulo = -0.4;
      brazoDer_angulo = 1.0;
      brazoIzq_angulo = -1.0;
      break;
    case 'señalar':
      brazoDer_angulo = -1.1;
      brazoIzq_angulo = 0.15;
      bodyBob = Math.sin(t * Math.PI * 2 * 0.4) * 0.02;
      break;
    case 'tumbarse':
      g.rotation.z = Math.PI / 2;
      break;
  }

  g.position.y += bodyBob;
  torso.rotation.x = bodyTilt;

  // ── Brazo derecho
  const brazoDerG = new THREE.Group();
  brazoDerG.position.set(0.27, 0.95, 0);
  const brazoDer_top = new THREE.Mesh(caja(0.13, 0.28, 0.14), getMat(colores.camisa));
  brazoDer_top.position.y = -0.14;
  const codoDer = new THREE.Mesh(cil(0.06, 0.12), getMat(colores.piel));
  codoDer.position.y = -0.3;
  const antebrDer = new THREE.Mesh(caja(0.11, 0.24, 0.12), getMat(colores.piel));
  antebrDer.position.y = -0.44;
  brazoDerG.add(brazoDer_top, codoDer, antebrDer);
  brazoDerG.rotation.x = brazoDer_angulo;
  g.add(brazoDerG);

  // ── Brazo izquierdo
  const brazoIzqG = new THREE.Group();
  brazoIzqG.position.set(-0.27, 0.95, 0);
  const brazoIzq_top = new THREE.Mesh(caja(0.13, 0.28, 0.14), getMat(colores.camisa));
  brazoIzq_top.position.y = -0.14;
  const codoIzq = new THREE.Mesh(cil(0.06, 0.12), getMat(colores.piel));
  codoIzq.position.y = -0.3;
  const antebrIzq = new THREE.Mesh(caja(0.11, 0.24, 0.12), getMat(colores.piel));
  antebrIzq.position.y = -0.44;
  brazoIzqG.add(brazoIzq_top, codoIzq, antebrIzq);
  brazoIzqG.rotation.x = brazoIzq_angulo;
  g.add(brazoIzqG);

  // ── Pierna derecha
  const piernaDerG = new THREE.Group();
  piernaDerG.position.set(0.1, 0.6, 0);
  const musloDer = new THREE.Mesh(caja(0.14, 0.28, 0.15), getMat(colores.pantalon));
  musloDer.position.y = -0.14;
  const rodillaDer = new THREE.Mesh(cil(0.07, 0.07), getMat(colores.pantalon));
  rodillaDer.position.y = -0.31;
  const espinillaDer = new THREE.Mesh(caja(0.12, 0.27, 0.13), getMat(colores.pantalon));
  espinillaDer.position.y = -0.47;
  const pieDer = new THREE.Mesh(caja(0.12, 0.08, 0.2), getMat(colores.cabello));
  pieDer.position.set(0, -0.63, 0.05);
  piernaDerG.add(musloDer, rodillaDer, espinillaDer, pieDer);
  piernaDerG.rotation.x = piernaDer_angulo;
  g.add(piernaDerG);

  // ── Pierna izquierda
  const piernaIzqG = new THREE.Group();
  piernaIzqG.position.set(-0.1, 0.6, 0);
  const musloIzq = new THREE.Mesh(caja(0.14, 0.28, 0.15), getMat(colores.pantalon));
  musloIzq.position.y = -0.14;
  const rodillaIzq = new THREE.Mesh(cil(0.07, 0.07), getMat(colores.pantalon));
  rodillaIzq.position.y = -0.31;
  const espinillaIzq = new THREE.Mesh(caja(0.12, 0.27, 0.13), getMat(colores.pantalon));
  espinillaIzq.position.y = -0.47;
  const pieIzq = new THREE.Mesh(caja(0.12, 0.08, 0.2), getMat(colores.cabello));
  pieIzq.position.set(0, -0.63, 0.05);
  piernaIzqG.add(musloIzq, rodillaIzq, espinillaIzq, pieIzq);
  piernaIzqG.rotation.x = piernaIzq_angulo;
  g.add(piernaIzqG);

  g.scale.setScalar(o.escala);
  return g;
}

/**
 * Crear multitud de humanoides distribuidos en un área.
 * Para crowd simulations (estilo #12, #20).
 */
export function crearMultitud(params: {
  cantidad: number;
  areaX: number;
  areaZ: number;
  t: number;
  colorDestacado?: string;
  indicePrincipal?: number;
}): THREE.Group {
  const grupo = new THREE.Group();
  const { cantidad, areaX, areaZ, t, colorDestacado, indicePrincipal = 0 } = params;

  const coloresMultitud = [
    '#9ca3af', '#6b7280', '#d1d5db', '#e5e7eb', '#374151',
  ];

  for (let i = 0; i < cantidad; i++) {
    const esProtagonista = i === indicePrincipal;
    // Distribución pseudo-aleatoria determinista
    const rx = (((i * 7919) % 100) / 100 - 0.5) * areaX;
    const rz = (((i * 6271) % 100) / 100 - 0.5) * areaZ;
    const tOffset = (i * 0.13) % 1;

    const colorCamisa = esProtagonista
      ? (colorDestacado ?? '#f59e0b')
      : coloresMultitud[i % coloresMultitud.length];

    const hum = crearHumanoide({
      colorPiel: esProtagonista ? '#c68642' : '#9ca3af',
      colorCamisa,
      colorPantalon: esProtagonista ? '#1d3557' : '#4b5563',
      animacion: 'idle_mirar',
      t: (t + tOffset) % 1,
      escala: 0.85 + (i % 3) * 0.05,
    });
    hum.position.set(rx, 0, rz);
    hum.rotation.y = (i * 1.3) % (Math.PI * 2);
    grupo.add(hum);
  }

  return grupo;
}

/** Libera geometrías y materiales del cache de un humanoide */
export function limpiarHumanoide(g: THREE.Group): void {
  g.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}
