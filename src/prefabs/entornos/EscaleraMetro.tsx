/**
 * EscaleraMetro — Prefab de entorno 3D de Estación de Metro y Escalera Mecánica.
 * Réplica idéntica 1:1 por código de la referencia viral (Holborn Station).
 * 
 * Vistas y elementos clave:
 * - Perspectiva ascendente: cámara colocada abajo mirando hacia arriba a lo largo de la pendiente (30°).
 * - Fila de maniquíes grises/blancos parados a la derecha (Stand on the right).
 * - Protagonista naranja brillante subiendo a paso firme por la izquierda (Walk on the left).
 * - Balustradas de acero inoxidable pulido y pasamanos continuos.
 * - Túnel abovedado con lámparas tubulares y carteles de metro (ALL TRAINS ON TIME).
 */

import * as THREE from 'three';
import { crearManiquiMinimalista } from '../personajes/ManiquiMinimalista';

export interface OpcionesEscaleraMetro {
  /** Progreso de animación (0–1) */
  t?: number;
  /** Cantidad de personas en la fila derecha */
  pasajerosDerecha?: number;
  /** Color del protagonista que camina */
  colorProtagonista?: string;
  /** Velocidad de avance de los escalones */
  velocidadEscalera?: number;
  /** Inclinación de la escalera (radianes) */
  anguloInclinacion?: number;
}


const DEFAULTS: Required<OpcionesEscaleraMetro> = {
  t: 0,
  pasajerosDerecha: 10,
  colorProtagonista: '#ea580c', // Naranja/ámbar brillante como la referencia
  velocidadEscalera: 1.0,
  anguloInclinacion: Math.PI / 6, // 30 grados
};

// ── Cache de materiales para ultra-rendimiento ───────────────────────────────
const _matCache = new Map<string, THREE.Material>();

function getMatLambert(color: string): THREE.MeshLambertMaterial {
  const key = `lambert_${color}`;
  if (!_matCache.has(key)) {
    _matCache.set(key, new THREE.MeshLambertMaterial({ color: new THREE.Color(color) }));
  }
  return _matCache.get(key) as THREE.MeshLambertMaterial;
}

function getMatMetalico(color: string, roughness = 0.25): THREE.MeshStandardMaterial {
  const key = `metal_${color}_${roughness}`;
  if (!_matCache.has(key)) {
    _matCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness: 0.8,
      })
    );
  }
  return _matCache.get(key) as THREE.MeshStandardMaterial;
}

function getMatEmisivo(color: string): THREE.MeshBasicMaterial {
  const key = `emisivo_${color}`;
  if (!_matCache.has(key)) {
    _matCache.set(key, new THREE.MeshBasicMaterial({ color: new THREE.Color(color) }));
  }
  return _matCache.get(key) as THREE.MeshBasicMaterial;
}

// ────────────────────────────────────────────────────────────────────────────
// GENERADOR PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────

export function crearEscaleraMetro(opciones?: OpcionesEscaleraMetro): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  posicionCamaraSeguimiento: THREE.Vector3;
  targetCamara: THREE.Vector3;
} {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  const tanTheta = Math.tan(o.anguloInclinacion);
  const cosTheta = Math.cos(o.anguloInclinacion);
  const sinTheta = Math.sin(o.anguloInclinacion);

  // ── 1. ILUMINACIÓN ESTUDIO REALISTA ──────────────────────────────────────
  // Luz de ambiente difusa neutra potente
  const amb = new THREE.AmbientLight(new THREE.Color('#f8fafc'), 1.6);
  luces.push(amb);

  // Luz principal cenital suave (tubo de metro)
  const dirLuz = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 2.6);
  dirLuz.position.set(-2, 12, 4);
  luces.push(dirLuz);

  // Luz de relleno cálida desde la parte superior de la escalera
  const dirFill = new THREE.DirectionalLight(new THREE.Color('#fef08a'), 1.2);
  dirFill.position.set(3, 8, -15);
  luces.push(dirFill);

  // ── 2. TÚNEL ABOVEDADO DEL METRO ─────────────────────────────────────────
  const radioTunel = 4.5;
  const longTunel = 50;
  const geomTunel = new THREE.CylinderGeometry(
    radioTunel,
    radioTunel,
    longTunel,
    32,
    1,
    true,
    0,
    Math.PI
  );
  // Color beige/gris claro típico del London Underground
  const matParedTunel = getMatLambert('#94a3b8');
  const tunel = new THREE.Mesh(geomTunel, matParedTunel);
  tunel.rotation.x = Math.PI / 2 + o.anguloInclinacion;
  tunel.position.set(0, (longTunel / 2) * sinTheta + 1.5, -(longTunel / 2) * cosTheta);
  grupo.add(tunel);

  // Tira de iluminación central superior
  const tiraLuz = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.1, longTunel),
    getMatEmisivo('#ffffff')
  );
  tiraLuz.rotation.x = -o.anguloInclinacion;
  tiraLuz.position.set(
    0,
    radioTunel * 0.95 + (longTunel / 2) * sinTheta,
    -(longTunel / 2) * cosTheta
  );
  grupo.add(tiraLuz);

  // ── 3. ESTRUCTURA Y BALUSTRADAS DE LA ESCALERA ───────────────────────────
  const anchoTotal = 2.4;
  const anchoCarril = 1.05;
  const posX_izq = -anchoTotal / 4; // -0.6
  const posX_der = anchoTotal / 4;  // +0.6

  // Rampa base inclinada
  const rampaBase = new THREE.Mesh(
    new THREE.BoxGeometry(anchoTotal + 0.8, 0.4, longTunel),
    getMatMetalico('#475569')
  );
  rampaBase.rotation.x = -o.anguloInclinacion;
  rampaBase.position.set(0, -0.2 + (longTunel / 2) * sinTheta, -(longTunel / 2) * cosTheta);
  grupo.add(rampaBase);

  // Balustradas (izquierda, centro, derecha)
  const posBalustradas = [-anchoTotal / 2 - 0.15, 0, anchoTotal / 2 + 0.15];
  posBalustradas.forEach((bx, idx) => {
    // Panel de acero cepillado
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.95, longTunel),
      getMatMetalico(idx === 1 ? '#64748b' : '#94a3b8', 0.2)
    );
    panel.rotation.x = -o.anguloInclinacion;
    panel.position.set(bx, 0.5 + (longTunel / 2) * sinTheta, -(longTunel / 2) * cosTheta);
    grupo.add(panel);

    // Pasamanos negro continuo
    const pasamanos = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, longTunel),
      getMatLambert('#0f172a')
    );
    pasamanos.rotation.x = -o.anguloInclinacion;
    pasamanos.position.set(bx, 0.98 + (longTunel / 2) * sinTheta, -(longTunel / 2) * cosTheta);
    grupo.add(pasamanos);
  });

  // ── 4. ESCALONES METÁLICOS CON LÍNEA AMARILLA ────────────────────────────
  const pasoEscalon = 0.4;
  const altoEscalon = pasoEscalon * tanTheta;
  const numPasos = 55;
  const offsetLoop = (o.t * o.velocidadEscalera * 8) % 1;

  const geomPaso = new THREE.BoxGeometry(anchoCarril - 0.05, altoEscalon, pasoEscalon);
  const geomLineaAmarilla = new THREE.BoxGeometry(anchoCarril - 0.05, 0.015, 0.03);
  const matPaso = getMatMetalico('#64748b', 0.4);
  const matAmarillo = getMatEmisivo('#facc15');

  for (let i = 0; i < numPasos; i++) {
    const k = i - offsetLoop;
    const z = -k * pasoEscalon;
    const y = k * altoEscalon;

    // Escalón Izquierda
    const pIzq = new THREE.Mesh(geomPaso, matPaso);
    pIzq.position.set(posX_izq, y, z);
    const bIzq = new THREE.Mesh(geomLineaAmarilla, matAmarillo);
    bIzq.position.set(posX_izq, y + altoEscalon / 2 + 0.008, z + pasoEscalon / 2 - 0.015);
    grupo.add(pIzq, bIzq);

    // Escalón Derecha
    const pDer = new THREE.Mesh(geomPaso, matPaso);
    pDer.position.set(posX_der, y, z);
    const bDer = new THREE.Mesh(geomLineaAmarilla, matAmarillo);
    bDer.position.set(posX_der, y + altoEscalon / 2 + 0.008, z + pasoEscalon / 2 - 0.015);
    grupo.add(pDer, bDer);
  }

  // ── 5. SEÑALETICA 3D (ALL TRAINS ON TIME / PLEASE STAND ON RIGHT) ────────
  // Poste con cartel negro y texto dorado idéntico al del frame 090
  const gCartel = new THREE.Group();
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), getMatMetalico('#475569'));
  poste.position.y = 0.9;
  const tablero = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.9), getMatLambert('#1e293b'));
  tablero.position.set(0, 1.6, 0);
  const placaTexto = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.82), getMatLambert('#d97706'));
  placaTexto.position.set(0, 1.6, 0);
  gCartel.add(poste, tablero, placaTexto);
  gCartel.position.set(anchoTotal / 2 + 0.3, 4.5 * tanTheta, -4.5);
  grupo.add(gCartel);

  // ── 6. MULTITUD DE MANIQUÍES A LA DERECHA (STAND ON THE RIGHT) ───────────
  // Avanzan hacia arriba al ritmo de la escalera mecánica
  const avanceEscalera = (o.t * o.velocidadEscalera * 3.2);

  const tonosGrisMultitud = [
    { cuerpo: '#e2e8f0', acento: '#94a3b8' },
    { cuerpo: '#cbd5e1', acento: '#64748b' },
    { cuerpo: '#f1f5f9', acento: '#cbd5e1' },
    { cuerpo: '#94a3b8', acento: '#475569' },
  ];

  // Posición del protagonista calculada primero
  const distProtagonista = 1.8 + (o.t * 12);
  const yProtagonista = distProtagonista * tanTheta + altoEscalon / 2;

  // Maniquíes a la derecha alineados y por delante del protagonista
  for (let p = 0; p < o.pasajerosDerecha; p++) {
    const distZ = (distProtagonista - 0.4) + p * 2.0;
    const yPos = distZ * tanTheta + altoEscalon / 2;

    const pal = tonosGrisMultitud[p % tonosGrisMultitud.length];
    const maniqui = crearManiquiMinimalista({
      colorCuerpo: pal.cuerpo,
      colorAcento: pal.acento,
      animacion: 'respirar',
      t: (o.t * 2 + p * 0.19) % 1,
      escala: 0.95,
    });

    maniqui.position.set(posX_der, yPos, -distZ);
    // Mirando hacia arriba
    maniqui.rotation.y = 0;
    grupo.add(maniqui);
  }

  // ── 7. PROTAGONISTA NARANJA SUBIENDO POR LA IZQUIERDA (WALK ON LEFT) ─────
  const protagonista = crearManiquiMinimalista({
    colorCuerpo: o.colorProtagonista, // Naranja icónico brillante
    colorAcento: '#c2410c',          // Naranja tostado sombra
    animacion: 'caminar',
    t: (o.t * 8) % 1,                // Ciclo de pasos suave
    escala: 0.98,
  });

  protagonista.position.set(posX_izq, yProtagonista, -distProtagonista);
  protagonista.rotation.y = 0; // Mirando hacia arriba
  grupo.add(protagonista);


  // ── 8. CÁMARA DE SEGUIMIENTO PERSPECTIVA ASCENDENTE (FRAME 060/090) ───────
  // Cámara centrada entre ambos carriles, ligeramente elevada para captar barandillas y multitud
  const posicionCamaraSeguimiento = new THREE.Vector3(
    -0.08,
    yProtagonista + 1.65,
    -distProtagonista + 3.4
  );

  const targetCamara = new THREE.Vector3(
    0.05,
    yProtagonista + 2.3,
    -distProtagonista - 6.0
  );

  return {
    grupo,
    luces,
    posicionCamaraSeguimiento,
    targetCamara,
  };
}

