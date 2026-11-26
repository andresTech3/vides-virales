/**
 * ChoqueLunaTierra.ts — Prefab 3D de la Colisión Cósmica Tierra-Luna.
 * 
 * Etapas cinematográficas de alta retención:
 * 1. 'aproximacion_luna': La Luna gigantesca se aproxima a la Tierra con marea gravitatoria.
 * 2. 'limite_roche': Desgarro gravitacional a 18.470 km con fractura de la Luna y fisuras de lava.
 * 3. 'bombardeo_cataclismo': Impactos masivos, ondas de choque lumínicas y atmósfera incandescente.
 * 4. 'fusion_anillos': Disco de acreción de magma orbitando la Tierra fundida.
 * 5. 'cierre_bucle': Sistema cósmico renovado en loop visual perfecto.
 */

import * as THREE from 'three';
import { crearCampoEstelar } from './EspacioCosmos';

export type EtapaChoqueLuna =
  | 'aproximacion_luna'
  | 'limite_roche'
  | 'bombardeo_cataclismo'
  | 'fusion_anillos'
  | 'cierre_bucle';

export interface OpcionesChoqueLuna {
  etapa?: EtapaChoqueLuna;
  /** Progreso de la escena (0 a 1) */
  t?: number;
  /** Fotograma local */
  frame?: number;
}

const DEFAULTS: Required<OpcionesChoqueLuna> = {
  etapa: 'aproximacion_luna',
  t: 0,
  frame: 0,
};

export function crearChoqueLunaTierra(opciones?: OpcionesChoqueLuna): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  posicionCamara: THREE.Vector3;
  targetCamara: THREE.Vector3;
} {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  const tiempoSeg = (o.frame || o.t * 90) / 30;
  const progreso = Math.min(1, Math.max(0, o.t));

  // ── 1. CAMPO ESTELAR Y NEBULOSA DE FONDO ──────────────────────────────────
  const starfield = crearCampoEstelar(1500);
  grupo.add(starfield);

  // ── 2. ILUMINACIÓN SOLAR Y RIM LIGHT DRAMÁTICA ────────────────────────────
  const hemiLuz = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#0f172a'), 1.8);
  luces.push(hemiLuz);

  // Sol lateral potente que proyecta sombras crudas en cráteres y océanos
  const solDirecto = new THREE.DirectionalLight(new THREE.Color('#fffbeb'), 4.2);
  solDirecto.position.set(40, 20, 25);
  luces.push(solDirecto);

  // Rim light cósmica (azul cian y destello ámbar de impacto)
  const rimLightCian = new THREE.DirectionalLight(new THREE.Color('#38bdf8'), 2.2);
  rimLightCian.position.set(-30, 15, -30);
  luces.push(rimLightCian);

  const posCamara = new THREE.Vector3(0, 0, 18);
  const targetCam = new THREE.Vector3(0, 0, 0);

  // =========================================================================
  // HELPER: TIERRA PROCEDURAL
  // =========================================================================
  function crearTierra(radio = 3.2, quemada = false) {
    const tierraGrupo = new THREE.Group();

    const matOceano = new THREE.MeshStandardMaterial({
      color: quemada ? new THREE.Color('#450a0a') : new THREE.Color('#0284c7'),
      emissive: quemada ? new THREE.Color('#ea580c') : new THREE.Color('#0369a1'),
      emissiveIntensity: quemada ? 0.75 : 0.25,
      roughness: 0.3,
      metalness: 0.15,
    });
    const oceano = new THREE.Mesh(new THREE.SphereGeometry(radio, 36, 36), matOceano);
    tierraGrupo.add(oceano);

    // Continentes con relieve
    const continentes = [
      { x: 0.8, y: 0.5, z: 1.7, sx: 1.1, sy: 0.2, sz: 1.2 },
      { x: -1.2, y: 0.3, z: 1.5, sx: 0.9, sy: 0.2, sz: 1.0 },
      { x: 0.2, y: -1.0, z: 1.8, sx: 0.8, sy: 0.2, sz: 0.9 },
      { x: 1.8, y: 0.9, z: 1.1, sx: 1.2, sy: 0.2, sz: 1.0 },
      { x: -1.9, y: -0.4, z: 0.9, sx: 0.8, sy: 0.2, sz: 0.7 },
      { x: 0.3, y: 1.9, z: 1.0, sx: 1.0, sy: 0.2, sz: 0.8 },
      { x: -0.6, y: -1.8, z: 1.1, sx: 0.9, sy: 0.2, sz: 0.7 },
    ];

    continentes.forEach((c) => {
      const matCont = new THREE.MeshStandardMaterial({
        color: quemada ? new THREE.Color('#1c1917') : new THREE.Color('#22c55e'),
        emissive: quemada ? new THREE.Color('#b91c1c') : new THREE.Color('#15803d'),
        emissiveIntensity: quemada ? 0.8 : 0.2,
        roughness: 0.5,
      });
      const contMesh = new THREE.Mesh(new THREE.BoxGeometry(c.sx, c.sy, c.sz), matCont);
      const v = new THREE.Vector3(c.x, c.y, c.z).normalize().multiplyScalar(radio * 1.02);
      contMesh.position.copy(v);
      contMesh.lookAt(0, 0, 0);
      contMesh.rotateX(Math.PI / 2);
      tierraGrupo.add(contMesh);
    });

    // Atmósfera / Halo incandescente
    const matAtmosfera = new THREE.MeshBasicMaterial({
      color: quemada ? new THREE.Color('#f97316') : new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: quemada ? 0.55 : 0.35,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radio * 1.12, 32, 32), matAtmosfera);
    tierraGrupo.add(halo);

    tierraGrupo.rotation.y = tiempoSeg * 0.25;
    return tierraGrupo;
  }

  // =========================================================================
  // HELPER: LUNA PROCEDURAL CON CRÁTERES Y MAGMA
  // =========================================================================
  function crearLuna(radio = 1.2, agrietada = false) {
    const lunaGrupo = new THREE.Group();

    const matLuna = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      roughness: 0.85,
      metalness: 0.1,
      emissive: agrietada ? new THREE.Color('#f97316') : new THREE.Color('#000000'),
      emissiveIntensity: agrietada ? 0.6 : 0.0,
    });
    const cuerpoLuna = new THREE.Mesh(new THREE.SphereGeometry(radio, 28, 28), matLuna);
    lunaGrupo.add(cuerpoLuna);

    // Cráteres superficiales realistas
    for (let i = 0; i < 14; i++) {
      const phi = (i * 0.85) % Math.PI;
      const theta = (i * 1.6) % (Math.PI * 2);
      const rCrater = radio * 0.2 + (i % 3) * 0.08;
      const geomCrater = new THREE.TorusGeometry(rCrater, 0.035, 6, 16);
      const matCrater = new THREE.MeshStandardMaterial({
        color: agrietada ? new THREE.Color('#ef4444') : new THREE.Color('#475569'),
        roughness: 0.9,
      });
      const crater = new THREE.Mesh(geomCrater, matCrater);
      const pos = new THREE.Vector3(
        radio * Math.sin(phi) * Math.cos(theta),
        radio * Math.sin(phi) * Math.sin(theta),
        radio * Math.cos(phi)
      );
      crater.position.copy(pos);
      crater.lookAt(0, 0, 0);
      lunaGrupo.add(crater);
    }

    lunaGrupo.rotation.y = tiempoSeg * 0.15;
    return lunaGrupo;
  }

  // =========================================================================
  // CONSTRUCCIÓN SEGÚN ETAPA CINEMATOGRÁFICA
  // =========================================================================
  switch (o.etapa) {
    case 'aproximacion_luna': {
      // Tierra en el centro
      const tierra = crearTierra(3.4, false);
      tierra.position.set(-1.8, -0.6, 0);
      grupo.add(tierra);

      // Luna colosal acercándose desde la distancia
      const distLuna = 15 - progreso * 8.5; // De 15 a 6.5
      const luna = crearLuna(1.6, false);
      luna.position.set(distLuna * 0.85, 2.2 - progreso * 0.8, -2 + progreso * 3.5);
      grupo.add(luna);

      // Haz gravitatorio de alerta
      const geomTether = new THREE.CylinderGeometry(0.04, 0.08, distLuna, 8);
      const matTether = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#38bdf8'),
        transparent: true,
        opacity: 0.35 + Math.sin(tiempoSeg * 8) * 0.2,
      });
      const tether = new THREE.Mesh(geomTether, matTether);
      tether.position.lerpVectors(tierra.position, luna.position, 0.5);
      tether.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(luna.position, tierra.position).normalize()
      );
      grupo.add(tether);

      // Cámara orbital dramática
      posCamara.set(
        Math.sin(tiempoSeg * 0.2) * 2,
        1.5 + Math.cos(tiempoSeg * 0.25) * 0.5,
        14 - progreso * 3
      );
      targetCam.set(0.5, 0.2, 0);
      break;
    }

    case 'limite_roche': {
      // Tierra con deformación de marea y océanos inquietos
      const tierra = crearTierra(3.3, false);
      tierra.position.set(-1.2, 0, 0);
      grupo.add(tierra);

      // Luna desgarrándose en el límite de Roche (~18.000 km)
      const lunaCentro = new THREE.Vector3(3.6, 0.8, 0);
      const grupoFragmentos = new THREE.Group();
      grupoFragmentos.position.copy(lunaCentro);

      // Núcleo agrietado
      const nucleo = crearLuna(1.1, true);
      grupoFragmentos.add(nucleo);

      // Anillo de fragmentos y rocas gigantes despedazadas
      const numRocas = 42;
      for (let i = 0; i < numRocas; i++) {
        const ang = (i / numRocas) * Math.PI * 2 + tiempoSeg * 0.4;
        const distRoca = 1.4 + Math.sin(i * 1.5) * 0.8 + progreso * 1.8;
        const geomRoca = new THREE.DodecahedronGeometry(0.2 + (i % 3) * 0.12);
        const matRoca = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#475569'),
          emissive: new THREE.Color('#f97316'),
          emissiveIntensity: 0.85,
        });
        const roca = new THREE.Mesh(geomRoca, matRoca);
        roca.position.set(Math.cos(ang) * distRoca, (Math.sin(i) * 0.6), Math.sin(ang) * distRoca);
        roca.rotation.set(i + tiempoSeg, i * 2, 0);
        grupoFragmentos.add(roca);
      }
      grupo.add(grupoFragmentos);

      // Línea de telemetría de Límite de Roche
      const anilloRoche = new THREE.Mesh(
        new THREE.RingGeometry(5.2, 5.28, 64),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#facc15'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65 + Math.sin(tiempoSeg * 6) * 0.25,
        })
      );
      anilloRoche.position.copy(tierra.position);
      anilloRoche.rotation.x = Math.PI / 2.3;
      grupo.add(anilloRoche);

      posCamara.set(1.5, 3.2, 12);
      targetCam.set(1.2, 0.3, 0);
      break;
    }

    case 'bombardeo_cataclismo': {
      // Tierra ardiendo con cráteres de magma gigantes
      const tierra = crearTierra(3.4, true);
      tierra.position.set(0, 0, 0);
      grupo.add(tierra);

      // Ondas de choque lumínicas (Shockwaves en la superficie)
      for (let i = 0; i < 4; i++) {
        const expansion = ((tiempoSeg * 2.5 + i * 0.8) % 2.5);
        const shockRing = new THREE.Mesh(
          new THREE.RingGeometry(expansion * 1.2, expansion * 1.35, 32),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#facc15'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: Math.max(0, 1 - expansion / 2.5),
          })
        );
        shockRing.position.set(Math.sin(i * 1.7) * 2.5, Math.cos(i * 2.1) * 2.2, 2.2);
        shockRing.lookAt(0, 0, 0);
        grupo.add(shockRing);
      }

      // Meteoritos lunares en descenso hiperbólico
      const lluviaMeteoros = new THREE.Group();
      for (let j = 0; j < 30; j++) {
        const tDescenso = (tiempoSeg * 3 + j * 0.4) % 4;
        const geomMeteoro = new THREE.ConeGeometry(0.15, 0.8, 6);
        const matMeteoro = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ef4444'),
        });
        const meteoro = new THREE.Mesh(geomMeteoro, matMeteoro);
        const anguloLluvia = (j * 0.4);
        const rInicio = 9 - tDescenso * 1.8;
        meteoro.position.set(
          Math.cos(anguloLluvia) * rInicio,
          Math.sin(anguloLluvia) * rInicio + 2,
          Math.sin(j) * 3
        );
        meteoro.lookAt(0, 0, 0);
        lluviaMeteoros.add(meteoro);
      }
      grupo.add(lluviaMeteoros);

      // Luz parpadeante de impacto catastrófico
      const luzImpacto = new THREE.PointLight('#ff7700', 6.0 + Math.sin(tiempoSeg * 18) * 3, 25);
      luzImpacto.position.set(2, 2, 4);
      luces.push(luzImpacto);

      posCamara.set(Math.sin(tiempoSeg * 0.4) * 1.5, 1.8, 10.5);
      targetCam.set(0, 0, 0);
      break;
    }

    case 'fusion_anillos':
    case 'cierre_bucle': {
      // Supertierra de Magma Fundido
      const matMagma = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#7f1d1d'),
        emissive: new THREE.Color('#f97316'),
        emissiveIntensity: 0.95,
        roughness: 0.4,
        metalness: 0.3,
      });
      const orbeMagma = new THREE.Mesh(new THREE.SphereGeometry(3.6, 40, 40), matMagma);
      grupo.add(orbeMagma);

      // Vientre de lava brillante pulsante
      const haloLava = new THREE.Mesh(
        new THREE.SphereGeometry(3.9, 32, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ea580c'),
          transparent: true,
          opacity: 0.4,
          side: THREE.BackSide,
        })
      );
      grupo.add(haloLava);

      // Disco de Acreción / Anillo de fuego y escombros estilo Saturno incandescente
      const geomAnillo = new THREE.RingGeometry(5.2, 10.5, 64);
      const matAnillo = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#fbbf24'),
        emissive: new THREE.Color('#ea580c'),
        emissiveIntensity: 0.7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        roughness: 0.6,
      });
      const anillo = new THREE.Mesh(geomAnillo, matAnillo);
      anillo.rotation.x = Math.PI / 2.6;
      anillo.rotation.z = tiempoSeg * 0.15;
      grupo.add(anillo);

      // Rocas orbitando dentro del anillo
      for (let k = 0; k < 50; k++) {
        const radK = 5.6 + (k % 5) * 0.9;
        const angK = (k / 50) * Math.PI * 2 + tiempoSeg * 0.35;
        const rocaAnillo = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.12 + (k % 4) * 0.06),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color('#fed7aa'),
            emissive: new THREE.Color('#f97316'),
            emissiveIntensity: 0.9,
          })
        );
        rocaAnillo.position.set(
          Math.cos(angK) * radK,
          Math.sin(angK) * 0.3,
          Math.sin(angK) * radK * 0.45
        );
        grupo.add(rocaAnillo);
      }

      // Cámara orbital gloriosa en retroceso
      const distFinal = o.etapa === 'cierre_bucle' ? 18.5 : 15.5;
      posCamara.set(
        Math.sin(tiempoSeg * 0.25) * 4,
        6.5,
        distFinal - Math.cos(tiempoSeg * 0.2) * 1.5
      );
      targetCam.set(0, 0, 0);
      break;
    }
  }

  return {
    grupo,
    luces,
    posicionCamara: posCamara,
    targetCamara: targetCam,
  };
}
