/**
 * CiudadLowPoly — Prefab de entorno urbano 3D reutilizable.
 * Usado en estilos: #6, #8, #12, #16, #20, #22
 * Incluye: edificios parametrizables, acera, calzada, árboles,
 *          farolas, vehículos, y paleta de colores de día/noche.
 */

import * as THREE from 'three';

export type HoraCiudad = 'dia' | 'atardecer' | 'noche' | 'dramatico';

export interface OpcionesCiudad {
  hora?: HoraCiudad;
  /** Densidad de edificios (0 = mínimo, 1 = máximo) */
  densidad?: number;
  /** Color de asfalto */
  colorAsfalto?: string;
  /** Color de fachada de edificios */
  colorFachada?: string;
  /** ¿Incluir vehículos? */
  vehiculos?: boolean;
  /** ¿Incluir árboles? */
  arboles?: boolean;
  /** ¿Incluir farolas? */
  farolas?: boolean;
  /** Numero de filas de edificios a cada lado */
  filasEdificios?: number;
  /** Progreso de animación (0–1) para vehículos */
  t?: number;
}

const DEFAULTS: Required<OpcionesCiudad> = {
  hora: 'dia',
  densidad: 0.7,
  colorAsfalto: '#2a2a2a',
  colorFachada: '#e8e0d0',
  vehiculos: true,
  arboles: true,
  farolas: true,
  filasEdificios: 2,
  t: 0,
};

// ─── Paletas por hora del día ────────────────────────────────────────────

const PALETAS: Record<HoraCiudad, {
  cielo: THREE.Color;
  fog: THREE.Color;
  fogNear: number;
  fogFar: number;
  ambientIntensidad: number;
  ambientColor: THREE.Color;
  sunColor: THREE.Color;
}> = {
  dia: {
    cielo: new THREE.Color('#87ceeb'),
    fog: new THREE.Color('#c9e8f0'),
    fogNear: 20,
    fogFar: 60,
    ambientIntensidad: 0.6,
    ambientColor: new THREE.Color('#ffffff'),
    sunColor: new THREE.Color('#fff5d0'),
  },
  atardecer: {
    cielo: new THREE.Color('#ff7043'),
    fog: new THREE.Color('#ff9a6c'),
    fogNear: 15,
    fogFar: 45,
    ambientIntensidad: 0.4,
    ambientColor: new THREE.Color('#ff9a6c'),
    sunColor: new THREE.Color('#ff6b35'),
  },
  noche: {
    cielo: new THREE.Color('#050a1a'),
    fog: new THREE.Color('#0d1b2a'),
    fogNear: 10,
    fogFar: 35,
    ambientIntensidad: 0.15,
    ambientColor: new THREE.Color('#1a2a4a'),
    sunColor: new THREE.Color('#0044cc'),
  },
  dramatico: {
    cielo: new THREE.Color('#1a0a2e'),
    fog: new THREE.Color('#2a0a3e'),
    fogNear: 8,
    fogFar: 30,
    ambientIntensidad: 0.2,
    ambientColor: new THREE.Color('#3d0070'),
    sunColor: new THREE.Color('#aa00ff'),
  },
};

// ─── Materiales con cache ────────────────────────────────────────────────

function matLambert(color: string | THREE.Color, opacidad = 1): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color: typeof color === 'string' ? new THREE.Color(color) : color,
    transparent: opacidad < 1,
    opacity: opacidad,
  });
}

function matBasic(color: string | THREE.Color): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: typeof color === 'string' ? new THREE.Color(color) : color,
  });
}

// ─── Generadores de objetos ──────────────────────────────────────────────

function crearEdificio(params: {
  ancho: number;
  alto: number;
  profundidad: number;
  colorFachada: string;
  colorVentana: string;
  ventanaRows?: number;
  ventanaCols?: number;
}): THREE.Group {
  const g = new THREE.Group();

  // Cuerpo principal
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(params.ancho, params.alto, params.profundidad),
    matLambert(params.colorFachada),
  );
  cuerpo.position.y = params.alto / 2;
  g.add(cuerpo);

  // Ventanas como cajas planas empotradas
  const rows = params.ventanaRows ?? 4;
  const cols = params.ventanaCols ?? 3;
  const winW = (params.ancho * 0.8) / cols;
  const winH = (params.alto * 0.7) / rows;
  const matVentana = matBasic(params.colorVentana);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(winW * 0.6, winH * 0.6, 0.05),
        matVentana,
      );
      win.position.set(
        (c - (cols - 1) / 2) * winW,
        (params.alto * 0.15) + (r + 0.5) * (params.alto * 0.7 / rows),
        params.profundidad / 2 + 0.03,
      );
      g.add(win);
    }
  }

  return g;
}

function crearArbol(altura = 1.5, colorTronco = '#5c3d1e', colorCopa = '#2d6a2d'): THREE.Group {
  const g = new THREE.Group();
  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, altura * 0.4, 5),
    matLambert(colorTronco),
  );
  tronco.position.y = altura * 0.2;
  g.add(tronco);

  // 3 conos para copa de árbol
  const niveles = [
    { radio: 0.5, altura: altura * 0.5, y: altura * 0.45 },
    { radio: 0.35, altura: altura * 0.4, y: altura * 0.65 },
    { radio: 0.2, altura: altura * 0.3, y: altura * 0.82 },
  ];
  for (const n of niveles) {
    const copa = new THREE.Mesh(
      new THREE.ConeGeometry(n.radio, n.altura, 6),
      matLambert(colorCopa),
    );
    copa.position.y = n.y;
    g.add(copa);
  }
  return g;
}

function crearFarola(color = '#e8e870', altura = 2.5): THREE.Group {
  const g = new THREE.Group();
  const poste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, altura, 5),
    matLambert('#888888'),
  );
  poste.position.y = altura / 2;
  g.add(poste);

  const brazo = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.04, 0.04),
    matLambert('#888888'),
  );
  brazo.position.set(0.2, altura - 0.1, 0);
  g.add(brazo);

  const lampara = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 5, 5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color) }),
  );
  lampara.position.set(0.4, altura - 0.15, 0);
  g.add(lampara);

  return g;
}

function crearVehiculo(params: {
  colorCarroceria: string;
  tipo: 'sedan' | 'van' | 'camion';
  t: number;
  carrilesOffset: number;
  velocidad: number;
}): THREE.Group {
  const g = new THREE.Group();
  const { colorCarroceria, tipo, t, carrilesOffset, velocidad } = params;

  const dims = tipo === 'sedan'
    ? { l: 1.6, w: 0.8, h: 0.6 }
    : tipo === 'van'
    ? { l: 2.2, w: 0.9, h: 0.9 }
    : { l: 3.5, w: 1.1, h: 1.2 };

  // Carrocería
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(dims.l, dims.h, dims.w),
    matLambert(colorCarroceria),
  );
  body.position.y = dims.h / 2 + 0.15;
  g.add(body);

  // Cabina (solo sedan/van)
  if (tipo !== 'camion') {
    const cabina = new THREE.Mesh(
      new THREE.BoxGeometry(dims.l * 0.55, dims.h * 0.55, dims.w * 0.9),
      matLambert(colorCarroceria),
    );
    cabina.position.y = dims.h + 0.15;
    cabina.position.x = -dims.l * 0.05;
    g.add(cabina);
  }

  // 4 ruedas
  const wheelPositions = [
    [-dims.l * 0.32, 0.15, dims.w / 2 + 0.05],
    [ dims.l * 0.32, 0.15, dims.w / 2 + 0.05],
    [-dims.l * 0.32, 0.15, -dims.w / 2 - 0.05],
    [ dims.l * 0.32, 0.15, -dims.w / 2 - 0.05],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const rueda = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.12, 7),
      matLambert('#1a1a1a'),
    );
    rueda.rotation.z = Math.PI / 2;
    rueda.position.set(wx, wy, wz);
    g.add(rueda);
  }

  // Movimiento del vehículo
  const z = ((t * velocidad + carrilesOffset) % 25) - 12;
  g.position.set(carrilesOffset, 0, z);

  return g;
}

// ─── Función principal ───────────────────────────────────────────────────

/**
 * Construye una escena de ciudad completa lista para añadir a THREE.Scene.
 * @returns { grupo, luces, fog, colorCielo }
 */
export function crearCiudadLowPoly(opts: OpcionesCiudad = {}): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  fog: THREE.FogExp2;
  colorCielo: THREE.Color;
} {
  const o: Required<OpcionesCiudad> = { ...DEFAULTS, ...opts };
  const paleta = PALETAS[o.hora];
  const grupo = new THREE.Group();

  // ── Suelo (calle + aceras)
  const calzada = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 80),
    matLambert(o.colorAsfalto),
  );
  calzada.rotation.x = -Math.PI / 2;
  grupo.add(calzada);

  // Líneas de carretera
  for (let i = -3; i <= 3; i += 1.5) {
    for (let j = -38; j < 38; j += 4) {
      const linea = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 1.8),
        matBasic('#ffffff'),
      );
      linea.rotation.x = -Math.PI / 2;
      linea.position.set(i, 0.01, j);
      grupo.add(linea);
    }
  }

  // Aceras
  for (const lado of [-1, 1]) {
    const acera = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.12, 80),
      matLambert('#d4c9b0'),
    );
    acera.position.set(lado * 8, 0.06, 0);
    grupo.add(acera);
  }

  // ── Edificios
  const coloresEdificios = [
    o.colorFachada, '#c8b89a', '#d4c4aa', '#e0d5c0', '#b8a890',
    '#dcd3c0', '#c0b8a0', '#e8ddd0',
  ];
  const coloresVentana = o.hora === 'noche' || o.hora === 'dramatico'
    ? '#ffee99'
    : '#87ceeb';

  for (let lado of [-1, 1]) {
    for (let fila = 0; fila < o.filasEdificios; fila++) {
      const baseX = lado * (11 + fila * 5);
      const count = Math.floor(6 * o.densidad) + 2;
      for (let i = 0; i < count; i++) {
        const seed = (fila * 100 + i * 17) % 8;
        const alto = 3 + (seed % 5) * 2;
        const ancho = 2 + (seed % 3) * 0.8;
        const edif = crearEdificio({
          ancho,
          alto,
          profundidad: 2,
          colorFachada: coloresEdificios[seed],
          colorVentana: coloresVentana,
          ventanaRows: Math.floor(alto / 1.2),
          ventanaCols: Math.floor(ancho * 1.5),
        });
        edif.position.set(baseX + lado * (seed % 3) * 0.5, 0, -24 + i * 9);
        grupo.add(edif);
      }
    }
  }

  // ── Árboles
  if (o.arboles) {
    const colorCopa = o.hora === 'noche' ? '#1a3a1a' : '#2d6a2d';
    for (let lado of [-1, 1]) {
      for (let i = -30; i < 30; i += 5) {
        const arbol = crearArbol(1.8 + (Math.abs(i) % 3) * 0.3, '#5c3d1e', colorCopa);
        arbol.position.set(lado * 6.5, 0.12, i);
        grupo.add(arbol);
      }
    }
  }

  // ── Farolas
  if (o.farolas) {
    const colorLuz = o.hora === 'noche' || o.hora === 'dramatico' ? '#ffee55' : '#ffe8a0';
    for (let lado of [-1, 1]) {
      for (let i = -25; i < 25; i += 8) {
        const farola = crearFarola(colorLuz, 2.8);
        farola.position.set(lado * 5.5, 0.12, i);
        grupo.add(farola);
      }
    }
  }

  // ── Vehículos
  if (o.vehiculos) {
    const vehiculosConfig = [
      { color: '#cc3333', tipo: 'sedan' as const, carril: -1.5, vel: 12 },
      { color: '#3366cc', tipo: 'sedan' as const, carril: 0,    vel: 10 },
      { color: '#eeeeee', tipo: 'van'   as const, carril:  1.5, vel: 8  },
      { color: '#2a2a2a', tipo: 'sedan' as const, carril: -3,   vel: 14 },
    ];
    for (const vc of vehiculosConfig) {
      const veh = crearVehiculo({
        colorCarroceria: vc.color,
        tipo: vc.tipo,
        t: o.t,
        carrilesOffset: vc.carril,
        velocidad: vc.vel,
      });
      grupo.add(veh);
    }
  }

  // ── Iluminación
  const ambient = new THREE.AmbientLight(paleta.ambientColor, paleta.ambientIntensidad);
  const directional = new THREE.DirectionalLight(paleta.sunColor, 0.8);
  directional.position.set(5, 12, 8);

  const luces: THREE.Light[] = [ambient, directional];

  // Farolas como point lights en modo noche
  if (o.hora === 'noche' || o.hora === 'dramatico') {
    for (let i = -20; i < 20; i += 8) {
      const plight = new THREE.PointLight('#ffee55', 0.5, 8);
      plight.position.set(5.5, 2.8, i);
      luces.push(plight);
    }
  }

  return {
    grupo,
    luces,
    fog: new THREE.FogExp2(paleta.fog, 0.022),
    colorCielo: paleta.cielo,
  };
}
