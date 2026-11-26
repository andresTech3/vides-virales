/**
 * PerimetroMultitud.tsx — Prefab 3D de Perímetro de Cuarentena y Multitud Masiva.
 * 
 * Dinamismo cinematográfico continuo:
 * - 3 Reflectores móviles tipo estadio barriendo la multitud.
 * - Anillos de radar pulsantes que se expanden continuamente desde el centro.
 * - Multitud con movimiento ondulatorio individual (respiración, cabeceo y balanceo).
 * - Protagonista caminando y girando en la zona central.
 * - Cámara cinemática en descenso espiral continuo.
 */

import * as THREE from 'three';
import { crearManiquiMinimalista } from '../personajes/ManiquiMinimalista';

export interface OpcionesPerimetroMultitud {
  t?: number;
  frame?: number;
  colorProtagonista?: string;
  radioZonaSegura?: number;
  densidadMultitud?: number;
}

const DEFAULTS: Required<OpcionesPerimetroMultitud> = {
  t: 0,
  frame: 0,
  colorProtagonista: '#ea580c',
  radioZonaSegura: 3.2,
  densidadMultitud: 130,
};

export function crearPerimetroMultitud(opciones?: OpcionesPerimetroMultitud): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  posicionCamara: THREE.Vector3;
  targetCamara: THREE.Vector3;
} {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  const tiempoSegundos = (o.frame || o.t * 90) / 30;

  // ── 1. ILUMINACIÓN DINÁMICA DE REFLECTORES MÓVILES (ESTUDIO POTENTE) ─────
  const hemiLuz = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#475569'), 2.4);
  luces.push(hemiLuz);

  // Spot cenital de alta potencia sobre el protagonista
  const spotCenital = new THREE.SpotLight(new THREE.Color('#ffffff'), 8.5, 40, Math.PI / 3, 0.4, 1.1);
  spotCenital.position.set(Math.sin(tiempoSegundos * 1.2) * 1.5, 14, Math.cos(tiempoSegundos * 1.2) * 1.5);
  spotCenital.target.position.set(0, 0, 0);
  luces.push(spotCenital);
  grupo.add(spotCenital.target);

  // Luz frontal de relleno amplia para iluminar a toda la multitud sin sombras densas
  const dirFrontal = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 3.2);
  dirFrontal.position.set(0, 10, 14);
  luces.push(dirFrontal);

  // REFLECTOR 1: Barriendo la multitud en círculo
  const anguloBarrido1 = tiempoSegundos * 1.8;
  const reflectorA = new THREE.SpotLight(new THREE.Color('#38bdf8'), 7.5, 36, Math.PI / 4, 0.4, 1.1);
  reflectorA.position.set(-9, 8, 9);
  reflectorA.target.position.set(Math.cos(anguloBarrido1) * 8, 0, Math.sin(anguloBarrido1) * 8);
  luces.push(reflectorA);
  grupo.add(reflectorA.target);

  // REFLECTOR 2: Barriendo en sentido opuesto
  const anguloBarrido2 = -tiempoSegundos * 1.4 + Math.PI;
  const reflectorB = new THREE.SpotLight(new THREE.Color('#f59e0b'), 6.5, 36, Math.PI / 4, 0.4, 1.1);
  reflectorB.position.set(9, 8, -9);
  reflectorB.target.position.set(Math.cos(anguloBarrido2) * 7, 0, Math.sin(anguloBarrido2) * 7);
  luces.push(reflectorB);
  grupo.add(reflectorB.target);

  // ── 2. PAVIMENTO Y ANILLOS DE RADAR EXPANSIVOS ────────────────────────────
  const geomSuelo = new THREE.PlaneGeometry(40, 40);
  const matSuelo = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'), // Slate de estudio limpio y reflectante
    roughness: 0.35,
    metalness: 0.25,
  });
  const suelo = new THREE.Mesh(geomSuelo, matSuelo);
  suelo.rotation.x = -Math.PI / 2;
  grupo.add(suelo);

  // 3 Anillos de radar que se expanden continuamente
  for (let r = 0; r < 3; r++) {
    const progresoOnda = (tiempoSegundos * 0.8 + r * 0.33) % 1.0;
    const radioOnda = progresoOnda * (o.radioZonaSegura * 1.3);
    const opacidadOnda = Math.max(0, 1 - progresoOnda);

    const geomOnda = new THREE.RingGeometry(Math.max(0.1, radioOnda - 0.08), radioOnda, 40);
    const matOnda = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacidadOnda * 0.6,
    });
    const onda = new THREE.Mesh(geomOnda, matOnda);
    onda.rotation.x = -Math.PI / 2;
    onda.position.y = 0.006 + r * 0.001;
    grupo.add(onda);
  }

  // Anillo perimétrico de seguridad amarillo
  const geomAnillo = new THREE.RingGeometry(o.radioZonaSegura - 0.15, o.radioZonaSegura, 48);
  const matAnillo = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#facc15'),
    side: THREE.DoubleSide,
  });
  const anilloSeguridad = new THREE.Mesh(geomAnillo, matAnillo);
  anilloSeguridad.rotation.x = -Math.PI / 2;
  anilloSeguridad.position.y = 0.005;
  grupo.add(anilloSeguridad);

  // Barreras físicas de acero
  const numBarreras = 16;
  const geomBarrera = new THREE.BoxGeometry(0.85, 0.75, 0.08);
  const matBarrera = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    metalness: 0.8,
    roughness: 0.25,
  });

  for (let i = 0; i < numBarreras; i++) {
    const angulo = (i / numBarreras) * Math.PI * 2;
    const bx = Math.cos(angulo) * (o.radioZonaSegura + 0.1);
    const bz = Math.sin(angulo) * (o.radioZonaSegura + 0.1);

    const barrera = new THREE.Mesh(geomBarrera, matBarrera);
    barrera.position.set(bx, 0.375, bz);
    barrera.rotation.y = -angulo + Math.PI / 2;
    grupo.add(barrera);
  }

  // ── 3. PROTAGONISTA EN MOVIMIENTO Y GIRO CONTINUO ─────────────────────────
  const cicloCaminar = (tiempoSegundos * 2.2) % 1.0;
  const posXProtagonista = Math.sin(tiempoSegundos * 0.8) * 0.6;
  const posZProtagonista = Math.cos(tiempoSegundos * 0.8) * 0.6;
  const rotProtagonista = tiempoSegundos * 0.9;

  const protagonista = crearManiquiMinimalista({
    colorCuerpo: o.colorProtagonista,
    colorAcento: '#9a3412',
    animacion: 'caminar',
    t: cicloCaminar,
    escala: 1.05,
  });
  protagonista.position.set(posXProtagonista, 0, posZProtagonista);
  protagonista.rotation.y = rotProtagonista;
  grupo.add(protagonista);

  // ── 4. MULTITUD INSTANCIADA CON BALANCEO Y RESPIRACIÓN VIVA ───────────────
  const geomCuerpoInst = new THREE.CylinderGeometry(0.2, 0.16, 0.85, 12);
  const geomCabezaInst = new THREE.SphereGeometry(0.16, 12, 10);

  const matMultitud = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f8fafc'), // Blanco perlado luminoso de estudio
    emissive: new THREE.Color('#cbd5e1'),
    emissiveIntensity: 0.15, // Asegura luminosidad uniforme en silueta
    roughness: 0.25,
    metalness: 0.1,
  });

  const instCuerpo = new THREE.InstancedMesh(geomCuerpoInst, matMultitud, o.densidadMultitud);
  const instCabeza = new THREE.InstancedMesh(geomCabezaInst, matMultitud, o.densidadMultitud);

  const dummy = new THREE.Object3D();
  let instanceIndex = 0;

  const numAnillos = 5;
  for (let r = 0; r < numAnillos; r++) {
    const distR = o.radioZonaSegura + 1.2 + r * 1.35;
    const itemsEnAnillo = 16 + r * 10;

    for (let j = 0; j < itemsEnAnillo && instanceIndex < o.densidadMultitud; j++) {
      const ang = (j / itemsEnAnillo) * Math.PI * 2 + (r * 0.3);
      const px = Math.cos(ang) * distR;
      const pz = Math.sin(ang) * distR;

      // Dinamismo individual: balanceo y respiración ondulatoria
      const bobbing = Math.sin(tiempoSegundos * 3.0 + j * 0.4 + r) * 0.04;
      const giroCabeza = Math.sin(tiempoSegundos * 2.0 + j * 0.7) * 0.18;

      dummy.position.set(px, 0.75 + bobbing, pz);
      dummy.rotation.set(0, -ang - Math.PI / 2, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instCuerpo.setMatrixAt(instanceIndex, dummy.matrix);

      dummy.position.set(px, 1.45 + bobbing, pz);
      dummy.rotation.set(0, -ang - Math.PI / 2 + giroCabeza, 0);
      dummy.updateMatrix();
      instCabeza.setMatrixAt(instanceIndex, dummy.matrix);

      instanceIndex++;
    }
  }

  instCuerpo.instanceMatrix.needsUpdate = true;
  instCabeza.instanceMatrix.needsUpdate = true;
  grupo.add(instCuerpo, instCabeza);

  // ── 5. CÁMARA ESPIRAL DESCENDENTE Y ORBITAL CONTINUA ─────────────────────
  // Descenso y órbita continua alrededor del protagonista
  const anguloCamara = tiempoSegundos * 0.4;
  const progresoDescenso = Math.min(1, tiempoSegundos / 6.0);
  const camY = THREE.MathUtils.lerp(12.0, 3.2, progresoDescenso) + Math.sin(tiempoSegundos * 0.8) * 0.3;
  const radioCamara = THREE.MathUtils.lerp(4.0, 5.8, progresoDescenso);

  const posicionCamara = new THREE.Vector3(
    Math.cos(anguloCamara) * radioCamara,
    camY,
    Math.sin(anguloCamara) * radioCamara
  );

  const targetCamara = new THREE.Vector3(
    posXProtagonista * 0.5,
    1.1,
    posZProtagonista * 0.5
  );

  return {
    grupo,
    luces,
    posicionCamara,
    targetCamara,
  };
}
