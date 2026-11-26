/**
 * BunkerBioseguridad.tsx — Prefab 3D de Búnker de Bioseguridad y Cápsula de Aislamiento.
 * 
 * Dinamismo cinematográfico extremo:
 * - 2 Sirenas de alerta rotatorias de 360° (rojo y cian) que barren el escenario.
 * - Anillo láser UV con escaneo vertical oscilante rápido y chispas de luz.
 * - Protagonista caminando y girando ansioso dentro de la cápsula.
 * - Terminales holográficas flotantes con oscilación sinusoidal independiente y líneas de datos activas.
 * - Cámara orbital dinámica continua con efecto de paneo cinemático.
 */

import * as THREE from 'three';
import { crearManiquiMinimalista } from '../personajes/ManiquiMinimalista';

export interface OpcionesBunker {
  /** Progreso relativo (0 a 1 o continuo) */
  t?: number;
  /** Fotograma local para cinemática continua */
  frame?: number;
  colorNeon?: string;
  colorAlerta?: string;
  mostrarProtagonista?: boolean;
}

const DEFAULTS: Required<OpcionesBunker> = {
  t: 0,
  frame: 0,
  colorNeon: '#00f2fe',
  colorAlerta: '#f59e0b',
  mostrarProtagonista: true,
};

export function crearBunkerBioseguridad(opciones?: OpcionesBunker): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  posicionCamara: THREE.Vector3;
  targetCamara: THREE.Vector3;
} {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  const tiempoSegundos = (o.frame || o.t * 90) / 30;

  // ── 1. ILUMINACIÓN DINÁMICA DE ALERTA MÉDICA (ILUMINACIÓN DE ESTUDIO POTENTE) ──
  const hemiBunker = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#475569'), 2.5);
  luces.push(hemiBunker);

  // Spot cenital estéril potente sobre la cápsula
  const spotCentral = new THREE.SpotLight(new THREE.Color('#ffffff'), 8.0, 30, Math.PI / 3, 0.45, 1.1);
  spotCentral.position.set(0, 7.5, 0);
  spotCentral.target.position.set(0, 1, 0);
  luces.push(spotCentral);
  grupo.add(spotCentral.target);

  // Luz de relleno frontal amplia para evitar sombras negras
  const dirFrontal = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 3.4);
  dirFrontal.position.set(0, 5, 8);
  luces.push(dirFrontal);

  // Luz puntual interior dentro de la cápsula para que el protagonista resalte con máxima claridad
  const luzInterior = new THREE.PointLight(new THREE.Color('#fffbeb'), 6.5, 8);
  luzInterior.position.set(0, 1.8, 0);
  luces.push(luzInterior);

  // SIRENAS DE ALERTA ROTATORIAS DE 360° (Barrido de luz de alta potencia)
  const anguloSirena = tiempoSegundos * Math.PI * 2.5; // Giro continuo rápido
  const sirenaRoja = new THREE.SpotLight(new THREE.Color('#ff3333'), 7.0, 24, Math.PI / 4, 0.4, 1.1);
  sirenaRoja.position.set(0, 5.5, 0);
  sirenaRoja.target.position.set(Math.cos(anguloSirena) * 8, 0.3, Math.sin(anguloSirena) * 8);
  luces.push(sirenaRoja);
  grupo.add(sirenaRoja.target);

  const sirenaCian = new THREE.SpotLight(new THREE.Color('#38bdf8'), 6.0, 24, Math.PI / 4, 0.4, 1.1);
  sirenaCian.position.set(0, 5.5, 0);
  sirenaCian.target.position.set(Math.cos(anguloSirena + Math.PI) * 8, 0.3, Math.sin(anguloSirena + Math.PI) * 8);
  luces.push(sirenaCian);
  grupo.add(sirenaCian.target);

  // ── 2. PLATAFORMA HEXAGONAL DE TITANIO ───────────────────────────────────
  const geomBaseHex = new THREE.CylinderGeometry(4.2, 4.5, 0.35, 6);
  const matBase = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    metalness: 0.8,
    roughness: 0.2,
  });
  const baseHex = new THREE.Mesh(geomBaseHex, matBase);
  baseHex.position.y = -0.175;
  grupo.add(baseHex);

  // Anillo de advertencia amarillo/negro con pulso emisivo
  const geomAnilloAlerta = new THREE.RingGeometry(3.6, 3.85, 32);
  const brilloPulso = 0.6 + Math.sin(tiempoSegundos * 6) * 0.35;
  const matAlerta = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#facc15'),
    side: THREE.DoubleSide,
  });
  const anilloAlerta = new THREE.Mesh(geomAnilloAlerta, matAlerta);
  anilloAlerta.rotation.x = -Math.PI / 2;
  anilloAlerta.position.y = 0.005;
  grupo.add(anilloAlerta);

  // ── 3. CÁPSULA CRIOGÉNICA DE AISLAMIENTO ──────────────────────────────────
  const radioCapsula = 0.95;
  const altoCapsula = 2.6;

  const geomPedestal = new THREE.CylinderGeometry(radioCapsula + 0.15, radioCapsula + 0.25, 0.25, 32);
  const matMetalOscuro = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1e293b'),
    metalness: 0.85,
    roughness: 0.2,
  });
  const pedestal = new THREE.Mesh(geomPedestal, matMetalOscuro);
  pedestal.position.y = 0.125;
  grupo.add(pedestal);

  const geomVidrio = new THREE.CylinderGeometry(radioCapsula, radioCapsula, altoCapsula, 32, 1, true);
  const matVidrio = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f0f9ff'),
    metalness: 0.05,
    roughness: 0.05,
    transmission: 0.95,
    opacity: 0.35,
    transparent: true,
    ior: 1.45,
  });
  const cilindroVidrio = new THREE.Mesh(geomVidrio, matVidrio);
  cilindroVidrio.position.y = altoCapsula / 2 + 0.25;
  grupo.add(cilindroVidrio);

  const geomCupula = new THREE.CylinderGeometry(radioCapsula + 0.18, radioCapsula + 0.1, 0.2, 32);
  const cupula = new THREE.Mesh(geomCupula, matMetalOscuro);
  cupula.position.y = altoCapsula + 0.35;
  grupo.add(cupula);

  // ESCÁNER LÁSER UV RÁPIDO OSCILANTE
  const alturaLaser = 0.45 + (Math.sin(tiempoSegundos * 4.5) * 0.5 + 0.5) * 2.0;
  const geomLaserRing = new THREE.TorusGeometry(radioCapsula + 0.05, 0.035, 16, 32);
  const matLaser = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00f2fe'),
  });
  const laserRing = new THREE.Mesh(geomLaserRing, matLaser);
  laserRing.rotation.x = Math.PI / 2;
  laserRing.position.y = alturaLaser;
  laserRing.rotation.z = tiempoSegundos * 3; // Giro del anillo
  grupo.add(laserRing);

  const luzLaser = new THREE.PointLight(new THREE.Color('#00f2fe'), 2.5, 3.5);
  luzLaser.position.y = alturaLaser;
  grupo.add(luzLaser);

  // Luz cálida interior brillante para resaltar al maniquí
  const luzInteriorCapsula = new THREE.PointLight(new THREE.Color('#ffedd5'), 4.8, 4.5);
  luzInteriorCapsula.position.set(0, 1.4, 0.2);
  grupo.add(luzInteriorCapsula);

  // ── 4. PROTAGONISTA EN MOVIMIENTO ACTIVO DENTRO DE LA CÁPSULA ─────────────
  if (o.mostrarProtagonista) {
    // El protagonista se mueve y camina ansiosamente dentro del tubo
    const cicloPaso = (tiempoSegundos * 2.0) % 1;
    const desplazamientoX = Math.sin(tiempoSegundos * 1.5) * 0.2;
    const desplazamientoZ = Math.cos(tiempoSegundos * 1.5) * 0.1;
    const rotacionCuerpo = Math.sin(tiempoSegundos * 1.5) * 0.45;

    const maniqui = crearManiquiMinimalista({
      colorCuerpo: '#ea580c',
      colorAcento: '#9a3412',
      animacion: 'caminar',
      t: cicloPaso,
      escala: 0.95,
    });
    maniqui.position.set(desplazamientoX, 0.25, desplazamientoZ);
    maniqui.rotation.y = rotacionCuerpo;
    grupo.add(maniqui);
  }

  // ── 5. TERMINALES HOLOGRÁFICAS FLOTANTES CON ONDAS SENOIDALES ─────────────
  const radioTerminales = 2.2;
  const numTerminales = 4;

  for (let i = 0; i < numTerminales; i++) {
    const angulo = (i / numTerminales) * Math.PI * 2 + Math.PI / 4;
    const px = Math.cos(angulo) * radioTerminales;
    const pz = Math.sin(angulo) * radioTerminales;

    const gTerminal = new THREE.Group();
    // Flotación senoidal independiente
    const flotacionY = Math.sin(tiempoSegundos * 2.5 + i * 1.5) * 0.08;
    gTerminal.position.set(px, 1.35 + flotacionY, pz);
    gTerminal.rotation.y = -angulo - Math.PI / 2 + Math.sin(tiempoSegundos * 1.2 + i) * 0.08;

    const poste = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 1.4, 16),
      matMetalOscuro
    );
    poste.position.y = -0.7 - flotacionY;
    gTerminal.add(poste);

    // Pantalla translúcida
    const pantalla = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.46, 0.015),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0369a1'),
        emissive: new THREE.Color('#0284c7'),
        emissiveIntensity: 0.6,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65,
      })
    );
    gTerminal.add(pantalla);

    const marco = new THREE.Mesh(
      new THREE.BoxGeometry(0.70, 0.48, 0.01),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#38bdf8'),
        wireframe: true,
      })
    );
    gTerminal.add(marco);

    // Línea de datos que sube y baja dentro de la pantalla
    const yLinea = Math.sin(tiempoSegundos * 5 + i * 2) * 0.16;
    const lineaDato = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.03, 0.025),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#38bdf8') })
    );
    lineaDato.position.set(0, yLinea, 0.01);
    gTerminal.add(lineaDato);

    grupo.add(gTerminal);
  }

  // ── 6. CÁMARA CINEMATOGRÁFICA EN MOVIMIENTO CONTINUO (ORBITAL + PUSH) ──────
  // Nunca estática: órbita fluida con balanceo vertical continuo
  const velocidadOrbita = tiempoSegundos * 0.35;
  const radioCamara = 3.6 + Math.sin(tiempoSegundos * 0.6) * 0.4;
  const camY = 1.6 + Math.cos(tiempoSegundos * 0.7) * 0.35;

  const posicionCamara = new THREE.Vector3(
    Math.cos(velocidadOrbita) * radioCamara,
    camY,
    Math.sin(velocidadOrbita) * radioCamara
  );

  const targetCamara = new THREE.Vector3(
    Math.sin(tiempoSegundos * 0.8) * 0.1,
    1.35,
    Math.cos(tiempoSegundos * 0.8) * 0.1
  );

  return {
    grupo,
    luces,
    posicionCamara,
    targetCamara,
  };
}
