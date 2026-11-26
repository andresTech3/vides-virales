/**
 * MontanaRusaEspacio — Prefab de Montaña Rusa Espacial 3D (Three.js).
 * Incluye:
 * - Rieles tubulares 3D continuos con curvas peraltadas, caídas de 400km y bucle orbital.
 * - Tren futurista de montaña rusa con vagones acoplados, faros y propulsores de plasma.
 * - Astronautas tripulantes con trajes espaciales y brazos articulados.
 * - Partículas de polvo estelar / velocidad cósmica (speed lines).
 * - Planeta Tierra de fondo, campo estelar y sol orbital.
 */

import * as THREE from 'three';
import { crearCampoEstelar } from './EspacioCosmos';

export type EtapaMontanaRusa =
  | 'hook_cima'        // En la cima de la caída orbital, viendo la Tierra abajo
  | 'caida_aceleracion' // Caída libre vertiginosa a 40,000 km/h sin resistencia de aire
  | 'loop_gravedad_cero' // Loop orbital gigante con fuerzas G extremas
  | 'fuga_frenos_fallo'  // Soldadura en frío de los frenos y escape gravitatorio
  | 'deriva_eterna';     // El tren flotando en el cosmos infinito para siempre

export interface OpcionesMontanaRusa {
  /** Etapa o tipo de escena */
  etapa?: EtapaMontanaRusa;
  /** Progreso temporal local de la escena (0 a 1) */
  t?: number;
  /** Velocidad del tren (factor de avance) */
  velocidad?: number;
  /** Color de los rieles */
  colorRieles?: string;
  /** Color de iluminación de acento / neón */
  colorNeon?: string;
  /** Número de vagones */
  cantidadVagones?: number;
}

// ── Curva Orbital 3D de la Montaña Rusa ─────────────────────────────────────
// Define un recorrido de montaña rusa a gran escala en el espacio exterior
const PUNTOS_CIRCUITO: THREE.Vector3[] = [
  new THREE.Vector3(0, 18, -35),      // 0. Cima del lift orbital (Hook)
  new THREE.Vector3(6, 16, -25),      // 1. Inicio de la caída
  new THREE.Vector3(14, 2, -10),      // 2. Caída vertical vertiginosa
  new THREE.Vector3(10, -12, 10),     // 3. Fondo de la caída a máxima velocidad
  new THREE.Vector3(0, -6, 22),       // 4. Subida al Loop orbital
  new THREE.Vector3(-8, 14, 24),      // 5. Inversión del loop (cabeza abajo en gravedad cero)
  new THREE.Vector3(2, 6, 16),       // 6. Salida del loop con tirabuzón
  new THREE.Vector3(18, -2, 5),       // 7. Curva peraltada de alta velocidad
  new THREE.Vector3(26, 8, -15),      // 8. Rampa de eyección gravitatoria hacia el cosmos
  new THREE.Vector3(15, 20, -32),     // 9. Cierre del ciclo orbital infinito
];

export const CURVA_MONTANA_RUSA = new THREE.CatmullRomCurve3(PUNTOS_CIRCUITO, true, 'centripetal');

/**
 * Crea la estructura geométrica de los rieles 3D con durmientes y tirantes
 */
export function crearRieles3D(colorRiel = '#38bdf8', colorNeon = '#0ea5e9'): THREE.Group {
  const grupoRieles = new THREE.Group();

  // Tubos de los rieles izquierdo y derecho
  const resolucion = 220;
  const puntos = CURVA_MONTANARUSA_OFFSET(0.65);
  const puntosIzq = puntos.izq;
  const puntosDer = puntos.der;
  const puntosCentro = puntos.centro;

  const curvaIzq = new THREE.CatmullRomCurve3(puntosIzq, true);
  const curvaDer = new THREE.CatmullRomCurve3(puntosDer, true);
  const curvaCentro = new THREE.CatmullRomCurve3(puntosCentro, true);

  const matRiel = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorRiel),
    metalness: 0.85,
    roughness: 0.2,
    emissive: new THREE.Color(colorNeon),
    emissiveIntensity: 0.25,
  });

  const geoRielIzq = new THREE.TubeGeometry(curvaIzq, resolucion, 0.12, 8, true);
  const geoRielDer = new THREE.TubeGeometry(curvaDer, resolucion, 0.12, 8, true);
  const geoTuboCentral = new THREE.TubeGeometry(curvaCentro, resolucion, 0.22, 8, true);

  grupoRieles.add(new THREE.Mesh(geoRielIzq, matRiel));
  grupoRieles.add(new THREE.Mesh(geoRielDer, matRiel));

  const matTuboCentral = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3,
  });
  grupoRieles.add(new THREE.Mesh(geoTuboCentral, matTuboCentral));

  // Travesaños / Durmientes que conectan los rieles
  const matTravesano = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.8,
    roughness: 0.4,
  });

  const numDurmientes = 140;
  for (let i = 0; i < numDurmientes; i++) {
    const t = i / numDurmientes;
    const ptIzq = curvaIzq.getPointAt(t);
    const ptDer = curvaDer.getPointAt(t);
    const ptCentro = curvaCentro.getPointAt(t);

    const durmienteGeo = new THREE.CylinderGeometry(0.06, 0.06, ptIzq.distanceTo(ptDer), 6);
    const durmiente = new THREE.Mesh(durmienteGeo, matTravesano);

    // Posición y orientación del durmiente entre ambos rieles
    const posMedia = new THREE.Vector3().addVectors(ptIzq, ptDer).multiplyScalar(0.5);
    durmiente.position.copy(posMedia);
    durmiente.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(ptDer, ptIzq).normalize()
    );

    // Tirante diagonal hacia el tubo central
    const tiranteGeo = new THREE.CylinderGeometry(0.04, 0.04, posMedia.distanceTo(ptCentro), 5);
    const tirante = new THREE.Mesh(tiranteGeo, matTravesano);
    tirante.position.copy(new THREE.Vector3().addVectors(posMedia, ptCentro).multiplyScalar(0.5));
    tirante.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(posMedia, ptCentro).normalize()
    );

    grupoRieles.add(durmiente);
    grupoRieles.add(tirante);
  }

  return grupoRieles;
}

/**
 * Genera offsets perpendiculares para riel izquierdo, derecho y centro
 */
function CURVA_MONTANARUSA_OFFSET(separacion: number) {
  const muestras = 200;
  const izq: THREE.Vector3[] = [];
  const der: THREE.Vector3[] = [];
  const centro: THREE.Vector3[] = [];

  for (let i = 0; i < muestras; i++) {
    const t = i / muestras;
    const pt = CURVA_MONTANA_RUSA.getPointAt(t);
    const tang = CURVA_MONTANA_RUSA.getTangentAt(t).normalize();
    // Vector up aproximado
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tang, up).normalize();
    if (normal.length() === 0) normal.set(1, 0, 0);
    const binormal = new THREE.Vector3().crossVectors(normal, tang).normalize();

    izq.push(pt.clone().addScaledVector(normal, separacion));
    der.push(pt.clone().addScaledVector(normal, -separacion));
    centro.push(pt.clone().addScaledVector(binormal, -0.45));
  }

  return { izq, der, centro };
}

/**
 * Crea un vagón de tren espacial con cabina, astronautas y propulsores
 */
export function crearVagonEspacial(esLocomotora = false, animarBrazosArriba = false): THREE.Group {
  const vagon = new THREE.Group();

  // Chasis aerodinámico
  const chasisGeo = new THREE.BoxGeometry(1.4, 0.55, 2.2);
  const chasisMat = new THREE.MeshStandardMaterial({
    color: esLocomotora ? 0xef4444 : 0x0284c7, // Rojo ferrari para locomotora, azul cyan para vagones
    metalness: 0.9,
    roughness: 0.25,
  });
  const chasis = new THREE.Mesh(chasisGeo, chasisMat);
  chasis.position.y = 0.3;
  vagon.add(chasis);

  // Morro afilado si es el primer vagón
  if (esLocomotora) {
    const morroGeo = new THREE.ConeGeometry(0.7, 1.2, 4);
    const morro = new THREE.Mesh(morroGeo, chasisMat);
    morro.rotation.x = Math.PI / 2;
    morro.rotation.y = Math.PI / 4;
    morro.position.set(0, 0.3, 1.6);
    vagon.add(morro);

    // Faros delanteros gemelos ultra brillantes
    const faroGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const faroMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const faroIzq = new THREE.Mesh(faroGeo, faroMat);
    faroIzq.position.set(-0.45, 0.35, 1.7);
    const faroDer = faroIzq.clone();
    faroDer.position.x = 0.45;
    vagon.add(faroIzq);
    vagon.add(faroDer);

    // Luz focal del faro
    const spot = new THREE.SpotLight(0x38bdf8, 4, 35, Math.PI / 5, 0.4);
    spot.position.set(0, 0.4, 1.8);
    spot.target.position.set(0, 0, 10);
    vagon.add(spot);
    vagon.add(spot.target);
  }

  // Ruedas magnéticas de agarre (boogies)
  const ruedaGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12);
  const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.1 });
  const posicionesRuedas = [
    [-0.7, 0, 0.7],
    [0.7, 0, 0.7],
    [-0.7, 0, -0.7],
    [0.7, 0, -0.7],
  ];
  posicionesRuedas.forEach(([rx, ry, rz]) => {
    const rueda = new THREE.Mesh(ruedaGeo, ruedaMat);
    rueda.rotation.z = Math.PI / 2;
    rueda.position.set(rx, ry, rz);
    vagon.add(rueda);
  });

  // Asientos dobles (2 tripulantes por vagón)
  const matAsiento = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
  const asientoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.45);
  const asientoIzq = new THREE.Mesh(asientoGeo, matAsiento);
  asientoIzq.position.set(-0.35, 0.75, 0);
  const asientoDer = asientoIzq.clone();
  asientoDer.position.x = 0.35;
  vagon.add(asientoIzq);
  vagon.add(asientoDer);

  // Astronautas sentados
  const astronautaIzq = crearAstronautaTripulante(animarBrazosArriba);
  astronautaIzq.position.set(-0.35, 0.65, 0.05);
  const astronautaDer = crearAstronautaTripulante(animarBrazosArriba);
  astronautaDer.position.set(0.35, 0.65, 0.05);
  vagon.add(astronautaIzq);
  vagon.add(astronautaDer);

  // Propulsor de plasma trasero
  const toberaGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.45, 12);
  const toberaMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  const tobera = new THREE.Mesh(toberaGeo, toberaMat);
  tobera.rotation.x = Math.PI / 2;
  tobera.position.set(0, 0.3, -1.25);
  vagon.add(tobera);

  // Llama de plasma azul cian brillante
  const llamaGeo = new THREE.ConeGeometry(0.24, 0.8, 8);
  const llamaMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });
  const llama = new THREE.Mesh(llamaGeo, llamaMat);
  llama.rotation.x = -Math.PI / 2;
  llama.position.set(0, 0.3, -1.75);
  vagon.add(llama);

  return vagon;
}

/**
 * Crea un astronauta 3D estilizado con casco de reflejos dorados y brazos
 */
function crearAstronautaTripulante(brazosArriba: boolean): THREE.Group {
  const astro = new THREE.Group();

  const matTraje = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
  const matVisor = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.05,
    emissive: 0x78350f,
    emissiveIntensity: 0.3,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.3), matTraje);
  torso.position.y = 0.3;
  astro.add(torso);

  // Mochila de soporte vital (PLSS)
  const mochila = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.16), matTraje);
  mochila.position.set(0, 0.3, -0.2);
  astro.add(mochila);

  // Casco esférico con visor
  const casco = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), matTraje);
  casco.position.y = 0.65;
  astro.add(casco);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI, 0, Math.PI / 1.5), matVisor);
  visor.rotation.x = -Math.PI / 2.2;
  visor.position.set(0, 0.66, 0.1);
  astro.add(visor);

  // Brazos
  const matBrazo = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  const brazoGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.36, 6);

  const brazoIzq = new THREE.Mesh(brazoGeo, matBrazo);
  const brazoDer = new THREE.Mesh(brazoGeo, matBrazo);

  if (brazosArriba) {
    // Manos arriba estilo euforia / caída libre
    brazoIzq.position.set(-0.25, 0.65, 0.05);
    brazoIzq.rotation.z = Math.PI / 1.3;
    brazoIzq.rotation.x = -Math.PI / 6;

    brazoDer.position.set(0.25, 0.65, 0.05);
    brazoDer.rotation.z = -Math.PI / 1.3;
    brazoDer.rotation.x = -Math.PI / 6;
  } else {
    // Agarrados a la barra de seguridad del vagón
    brazoIzq.position.set(-0.22, 0.3, 0.22);
    brazoIzq.rotation.x = Math.PI / 2.5;
    brazoDer.position.set(0.22, 0.3, 0.22);
    brazoDer.rotation.x = Math.PI / 2.5;
  }

  astro.add(brazoIzq);
  astro.add(brazoDer);

  return astro;
}

/**
 * Crea un tren completo de 3 vagones y lo posiciona a lo largo de la curva
 */
export function crearTrenMontanaRusa(tPos: number, brazosArriba = false): THREE.Group {
  const convoy = new THREE.Group();
  const numVagones = 3;
  const espaciadoT = 0.035; // Espacio fraccional entre vagones

  for (let i = 0; i < numVagones; i++) {
    const tVagon = ((tPos - i * espaciadoT) % 1 + 1) % 1;
    const vagonMesh = crearVagonEspacial(i === 0, brazosArriba);

    // Posición en la curva
    const pt = CURVA_MONTANA_RUSA.getPointAt(tVagon);
    const tang = CURVA_MONTANA_RUSA.getTangentAt(tVagon).normalize();

    vagonMesh.position.copy(pt);

    // Orientación alineada con la tangente de la montaña rusa
    const lookTarget = pt.clone().add(tang);
    vagonMesh.lookAt(lookTarget);

    convoy.add(vagonMesh);
  }

  return convoy;
}

/**
 * Efecto de estelas de velocidad cósmica (speed lines) para dar sensación de 40,000 km/h
 */
export function crearLineasVelocidad(cantidad = 200): THREE.LineSegments {
  const posiciones = new Float32Array(cantidad * 6);
  const colores = new Float32Array(cantidad * 6);

  for (let i = 0; i < cantidad; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 35;
    const z = (Math.random() - 0.5) * 60;
    const len = 3 + Math.random() * 8;

    posiciones[i * 6] = x;
    posiciones[i * 6 + 1] = y;
    posiciones[i * 6 + 2] = z;

    posiciones[i * 6 + 3] = x;
    posiciones[i * 6 + 4] = y;
    posiciones[i * 6 + 5] = z - len;

    // Color degradado azul cyan a blanco
    colores[i * 6] = 0.2;
    colores[i * 6 + 1] = 0.7;
    colores[i * 6 + 2] = 1.0;

    colores[i * 6 + 3] = 0.8;
    colores[i * 6 + 4] = 0.95;
    colores[i * 6 + 5] = 1.0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));

  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    })
  );
}

/**
 * Planeta Tierra estilizado de fondo a escala orbital
 */
export function crearTierraFondo(): THREE.Group {
  const g = new THREE.Group();

  // Esfera terrestre azul
  const geoTierra = new THREE.SphereGeometry(18, 32, 32);
  const matTierra = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.6,
    metalness: 0.1,
  });
  const tierra = new THREE.Mesh(geoTierra, matTierra);
  g.add(tierra);

  // Continentes simplificados
  const matContinente = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  for (let i = 0; i < 18; i++) {
    const theta = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
    const phi = (Math.random() * 0.6 + 0.2) * Math.PI;
    const cMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 + Math.random() * 2), matContinente);
    cMesh.position.set(
      18 * Math.sin(phi) * Math.cos(theta),
      18 * Math.sin(phi) * Math.sin(theta),
      18 * Math.cos(phi)
    );
    g.add(cMesh);
  }

  // Atmósfera brillante con rim light
  const geoAtmos = new THREE.SphereGeometry(18.6, 32, 32);
  const matAtmos = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide,
  });
  g.add(new THREE.Mesh(geoAtmos, matAtmos));

  // Ubicar el planeta a la distancia adecuada abajo
  g.position.set(-15, -45, 10);
  return g;
}

/**
 * Ensamblador maestro de la escena 3D completa de la Montaña Rusa Espacial
 */
export function crearEscenarioMontanaRusaEspacio(opciones: OpcionesMontanaRusa = {}) {
  const {
    etapa = 'hook_cima',
    t = 0,
    colorRieles = '#38bdf8',
    colorNeon = '#0ea5e9',
  } = opciones;

  const grupo = new THREE.Group();

  // 1. Campo de estrellas
  const estrellas = crearCampoEstelar(1400);
  grupo.add(estrellas);

  // 2. Tierra majestuosa de fondo
  const tierra = crearTierraFondo();
  tierra.rotation.y = t * 0.3;
  grupo.add(tierra);

  // 3. Rieles 3D de la montaña rusa
  const rieles = crearRieles3D(colorRieles, colorNeon);
  grupo.add(rieles);

  // 4. Determinar avance del tren según la etapa para sincronía perfecta
  let tAvance = 0;
  let brazosArriba = false;

  switch (etapa) {
    case 'hook_cima':
      // El tren se asoma lentamente al precipicio orbital
      tAvance = 0.01 + t * 0.08;
      brazosArriba = false;
      break;
    case 'caida_aceleracion':
      // Caída libre en picada a máxima aceleración
      tAvance = 0.09 + Math.pow(t, 1.8) * 0.28;
      brazosArriba = true;
      break;
    case 'loop_gravedad_cero':
      // El loop orbital con inversión 360
      tAvance = 0.38 + t * 0.22;
      brazosArriba = false;
      break;
    case 'fuga_frenos_fallo':
      // Salida en tirabuzón y eyección de la órbita
      tAvance = 0.62 + t * 0.25;
      brazosArriba = true;
      break;
    case 'deriva_eterna':
    default:
      // Navegación perpetua en el cosmos infinito
      tAvance = (0.87 + t * 0.15) % 1;
      brazosArriba = false;
      break;
  }

  // 5. Tren y astronautas
  const tren = crearTrenMontanaRusa(tAvance, brazosArriba);
  grupo.add(tren);

  // 6. Líneas de velocidad en momentos de alta velocidad
  if (etapa === 'caida_aceleracion' || etapa === 'loop_gravedad_cero') {
    const speedLines = crearLineasVelocidad(220);
    speedLines.position.y = -t * 8;
    grupo.add(speedLines);
  }

  // 7. Luces cinematográficas
  const luces: THREE.Light[] = [];

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.45);
  luces.push(luzAmbiente);

  // Luz solar directa dorada
  const solDirecto = new THREE.DirectionalLight(0xfff7ed, 2.5);
  solDirecto.position.set(40, 50, -30);
  luces.push(solDirecto);

  // Luz reflejada azulada desde la Tierra
  const luzTierra = new THREE.DirectionalLight(0x38bdf8, 1.2);
  luzTierra.position.set(-15, -20, 15);
  luces.push(luzTierra);

  return {
    grupo,
    luces,
    tAvance,
    posicionTren: CURVA_MONTANA_RUSA.getPointAt(tAvance),
    tangenteTren: CURVA_MONTANA_RUSA.getTangentAt(tAvance).normalize(),
  };
}
