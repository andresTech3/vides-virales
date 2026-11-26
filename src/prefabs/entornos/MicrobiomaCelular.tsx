/**
 * MicrobiomaCelular.tsx — Prefab de Entorno Biológico Microscópico 3D (Three.js).
 * Representa el mundo interior del cuerpo humano:
 * - Túnel orgánico bio-fluorescente (pared intestinal / tejido celular).
 * - Colonias de bacterias bacilos con flagelos ondulantes.
 * - Cúmulos de bacterias cocos doradas y verdes bioluminiscentes.
 * - Glóbulos rojos (eritrocitos) bicóncavos flotando en el torrente.
 * - Partículas de nutrientes y enzimas en suspensión.
 * - Iluminación cinemática de microscopía electrónica de barrido.
 */

import * as THREE from 'three';

export type EtapaMicrobioma =
  | 'zoom_entrada'       // Zoom in de escala macro a escala celular (100,000x)
  | 'enjambre_bacterias' // 38 billones de bacterias interactuando
  | 'segundo_cerebro'    // Comunicación intestino-cerebro (sinapsis y serotonina)
  | 'peso_biomasa'       // 2 kilos de vida dentro de ti (comparativa)
  | 'universo_interior'; // Panorámica cósmica celular interior

export interface OpcionesMicrobioma {
  etapa?: EtapaMicrobioma;
  t?: number;
  colorFluido?: string;
  colorBacteriaA?: string;
  colorBacteriaB?: string;
}

/**
 * Crea un glóbulo rojo bicóncavo estilizado
 */
export function crearGlobuloRojo(): THREE.Group {
  const grupo = new THREE.Group();

  const geoToro = new THREE.TorusGeometry(0.7, 0.32, 16, 24);
  const geoDisco = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 18);

  const matSangre = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.25,
    metalness: 0.1,
    emissive: 0x450a0a,
    emissiveIntensity: 0.3,
  });

  const toro = new THREE.Mesh(geoToro, matSangre);
  toro.rotation.x = Math.PI / 2;
  const centro = new THREE.Mesh(geoDisco, matSangre);

  grupo.add(toro);
  grupo.add(centro);
  grupo.scale.set(0.65, 0.65, 0.65);

  return grupo;
}

/**
 * Crea una bacteria tipo Bacilo (forma cilíndrica con extremos redondeados y flagelos)
 */
export function crearBacteriaBacilo(color = '#10b981'): THREE.Group {
  const bacilo = new THREE.Group();

  // Cuerpo de la bacteria (Cápsula)
  const cuerpoGeo = new THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.28, 0.9, 12, 16)
    : new THREE.CylinderGeometry(0.28, 0.28, 0.9, 12);

  const matBacteria = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.15,
  });

  const cuerpo = new THREE.Mesh(cuerpoGeo, matBacteria);
  bacilo.add(cuerpo);

  // Flagelo (cola ondulada)
  const puntosFlagelo = [
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0.12, -0.85, 0.05),
    new THREE.Vector3(-0.15, -1.25, -0.05),
    new THREE.Vector3(0.08, -1.65, 0.08),
  ];
  const curvaFlagelo = new THREE.CatmullRomCurve3(puntosFlagelo);
  const geoFlagelo = new THREE.TubeGeometry(curvaFlagelo, 16, 0.03, 6, false);
  const matFlagelo = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.7 });
  const flagelo = new THREE.Mesh(geoFlagelo, matFlagelo);
  bacilo.add(flagelo);

  return bacilo;
}

/**
 * Crea un racimo de bacterias esféricas (Cocos)
 */
export function crearRacimoCocos(cantidad = 8, color = '#f59e0b'): THREE.Group {
  const racimo = new THREE.Group();
  const geoCoco = new THREE.SphereGeometry(0.22, 14, 14);
  const matCoco = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.4,
    roughness: 0.35,
  });

  for (let i = 0; i < cantidad; i++) {
    const coco = new THREE.Mesh(geoCoco, matCoco);
    coco.position.set(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7
    );
    racimo.add(coco);
  }

  return racimo;
}

/**
 * Crea las vellosidades intestinales (villi) que revisten el tejido
 */
export function crearVellosidadesTejido(t: number): THREE.Group {
  const grupoVilli = new THREE.Group();
  const matVilli = new THREE.MeshStandardMaterial({
    color: 0x831843, // Rosa/frambuesa celular oscuro
    roughness: 0.6,
    emissive: 0x500724,
    emissiveIntensity: 0.25,
  });

  const numVilli = 45;
  for (let i = 0; i < numVilli; i++) {
    const angulo = (i / numVilli) * Math.PI * 2;
    const radio = 8.5 + Math.sin(i * 1.5) * 0.5;
    const z = (Math.random() - 0.5) * 35;

    const villiGeo = new THREE.ConeGeometry(0.35, 2.2, 8);
    const villi = new THREE.Mesh(villiGeo, matVilli);

    villi.position.set(Math.cos(angulo) * radio, Math.sin(angulo) * radio, z);
    // Apuntan hacia el centro del túnel
    villi.lookAt(0, 0, z);
    // Ondulación viva celular
    villi.rotation.z += Math.sin(t * 4 + i) * 0.12;

    grupoVilli.add(villi);
  }

  return grupoVilli;
}

/**
 * Partículas bio-luminiscentes flotantes (nutrientes y enzimas)
 */
export function crearParticulasBioluminiscentes(cantidad = 350): THREE.Points {
  const posiciones = new Float32Array(cantidad * 3);
  const colores = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad; i++) {
    posiciones[i * 3] = (Math.random() - 0.5) * 14;
    posiciones[i * 3 + 1] = (Math.random() - 0.5) * 14;
    posiciones[i * 3 + 2] = (Math.random() - 0.5) * 30;

    // Colores cian, esmeralda y oro
    const r = Math.random();
    if (r > 0.6) {
      colores[i * 3] = 0.1;
      colores[i * 3 + 1] = 0.9;
      colores[i * 3 + 2] = 0.6;
    } else if (r > 0.3) {
      colores[i * 3] = 0.2;
      colores[i * 3 + 1] = 0.8;
      colores[i * 3 + 2] = 1.0;
    } else {
      colores[i * 3] = 1.0;
      colores[i * 3 + 1] = 0.75;
      colores[i * 3 + 2] = 0.15;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));

  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })
  );
}

/**
 * Ensamblador del Mundo 3D del Microbioma y Células
 */
export function crearEscenarioMicrobioma3D(opciones: OpcionesMicrobioma = {}) {
  const {
    etapa = 'zoom_entrada',
    t = 0,
    colorFluido = '#18021c',
    colorBacteriaA = '#10b981',
    colorBacteriaB = '#06b6d4',
  } = opciones;

  const grupo = new THREE.Group();

  // 1. Túnel celular orgánico
  const geoTunel = new THREE.CylinderGeometry(9, 9, 45, 24, 16, true);
  const matTunel = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorFluido),
    side: THREE.BackSide,
    roughness: 0.7,
    metalness: 0.1,
  });
  const tunel = new THREE.Mesh(geoTunel, matTunel);
  tunel.rotation.x = Math.PI / 2;
  grupo.add(tunel);

  // 2. Vellosidades tisulares
  const villi = crearVellosidadesTejido(t);
  grupo.add(villi);

  // 3. Colonias de Bacterias Bacilos flotando y rotando
  const numBacilos = 18;
  for (let i = 0; i < numBacilos; i++) {
    const bac = crearBacteriaBacilo(i % 2 === 0 ? colorBacteriaA : colorBacteriaB);
    const zBase = -15 + (i / numBacilos) * 30;
    const angulo = i * 1.35;
    const radio = 2.5 + Math.sin(i * 2) * 1.8;

    bac.position.set(
      Math.cos(angulo) * radio + Math.sin(t * 2 + i) * 0.4,
      Math.sin(angulo) * radio + Math.cos(t * 2 + i) * 0.4,
      zBase + t * 4
    );
    bac.rotation.x = t * 1.5 + i;
    bac.rotation.y = t * 2 + i * 0.7;
    grupo.add(bac);
  }

  // 4. Colonias de Cocos dorados
  for (let i = 0; i < 7; i++) {
    const cocos = crearRacimoCocos(6 + i * 2, '#f59e0b');
    cocos.position.set(
      Math.sin(i * 2.1) * 3.8,
      Math.cos(i * 1.7) * 3.8,
      -10 + i * 3.5 + t * 3
    );
    cocos.rotation.y = t * 1.2 + i;
    grupo.add(cocos);
  }

  // 5. Glóbulos rojos flotando
  for (let i = 0; i < 9; i++) {
    const gr = crearGlobuloRojo();
    gr.position.set(
      Math.cos(i * 1.9) * 3.2,
      Math.sin(i * 2.4) * 3.2,
      -12 + i * 3 + t * 5
    );
    gr.rotation.x = t * 2 + i;
    gr.rotation.z = t * 1.5 + i;
    grupo.add(gr);
  }

  // 6. Polvo bioluminiscente
  const particulas = crearParticulasBioluminiscentes(400);
  particulas.position.z = -t * 4;
  grupo.add(particulas);

  // 7. Luces Bio-luminescentes
  const luces: THREE.Light[] = [];

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.45);
  luces.push(luzAmbiente);

  // Foco bioluminiscente cian
  const luzCian = new THREE.PointLight(0x06b6d4, 3, 25);
  luzCian.position.set(0, 2, -t * 5);
  luces.push(luzCian);

  // Foco bioluminiscente magenta/púrpura
  const luzMagenta = new THREE.PointLight(0xd946ef, 2.5, 30);
  luzMagenta.position.set(3, -3, 10 - t * 5);
  luces.push(luzMagenta);

  return {
    grupo,
    luces,
  };
}
