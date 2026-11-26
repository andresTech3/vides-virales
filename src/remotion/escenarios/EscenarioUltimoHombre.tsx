/**
 * EscenarioUltimoHombre.tsx — Integrador Remotion para el video del último hombre en la Tierra.
 * 
 * Dinamismo continuo garantizado:
 * - Movimiento 3D permanente frame a frame sin congelamiento.
 * - Partículas de polvo y motes bioluminiscentes flotantes continuos.
 * - Sincronización exacta con el frame relativo de cada escena.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import { crearPerimetroMultitud } from '../../prefabs/entornos/PerimetroMultitud';
import { crearBunkerBioseguridad } from '../../prefabs/entornos/BunkerBioseguridad';
import { crearPiramideGenetica3D } from '../../prefabs/entornos/PiramideGenetica3D';
import { crearEspacioCosmos } from '../../prefabs/entornos/EspacioCosmos';
import { HUDEditorialHolborn, type PropsHUDEditorial } from '../../prefabs/efectos/HUDEditorialHolborn';
import { liberarMemoriaGPU } from '../../prefabs/core/matematicas';

export type EtapaUltimoHombre =
  | 'hook_multitud'
  | 'bunker_aislamiento'
  | 'colapso_genetico'
  | 'cierre_planeta';

export interface PropsEscenarioUltimoHombre {
  etapa?: EtapaUltimoHombre;
  duracionFrames?: number;
  frameInicio?: number;
  frameLocal?: number;
  hud?: Partial<PropsHUDEditorial>;
  textoEditorial?: string;
  palabraClave?: string;
}

export const EscenarioUltimoHombre: React.FC<PropsEscenarioUltimoHombre> = ({
  etapa = 'hook_multitud',
  duracionFrames = 150,
  frameInicio = 0,
  frameLocal,
  hud,
  textoEditorial,
  palabraClave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameGlobal = useCurrentFrame();

  // Limpiar WebGLRenderer únicamente cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  // Usar frameLocal directo si viene desde el orquestador o calcularlo respecto a frameInicio
  const fActual = frameLocal !== undefined ? frameLocal : Math.max(0, frameGlobal - frameInicio);
  const t = fActual / Math.max(1, duracionFrames);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // REUTILIZAR WebGLRenderer para evitar recrear el contexto WebGL en cada frame (Acelera 10x)
    let renderer = rendererRef.current;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(1080, 1920);
      renderer.setPixelRatio(1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.9; // Exposición vibrante de estudio de alta definición
      rendererRef.current = renderer;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Azul pizarra profundo de estudio
    scene.fog = new THREE.Fog(new THREE.Color('#0f172a'), 35, 110); // Niebla suave solo en lejanía extrema

    // Iluminación de relleno de estudio global (previene zonas oscuras en cualquier escena)
    const hemiGlobal = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#64748b'), 1.6);
    scene.add(hemiGlobal);

    const camera = new THREE.PerspectiveCamera(65, 1080 / 1920, 0.1, 500);

    let mundo3D: {
      grupo: THREE.Group;
      luces: THREE.Light[];
      posicionCamara: THREE.Vector3;
      targetCamara: THREE.Vector3;
    };

    switch (etapa) {
      case 'bunker_aislamiento':
        mundo3D = crearBunkerBioseguridad({ t, frame: fActual });
        break;

      case 'colapso_genetico':
        mundo3D = crearPiramideGenetica3D({ t, frame: fActual });
        break;

      case 'cierre_planeta':
        const tiempoSec = fActual / 30;
        const espacio = crearEspacioCosmos({ globo: true, t: tiempoSec * 0.1 });
        espacio.grupo.rotation.y = tiempoSec * 0.6; // Rotación veloz del planeta
        const camZ = 7.5 + tiempoSec * 2.2; // Alejamiento continuo
        const camY = 1.2 + Math.sin(tiempoSec * 0.8) * 0.6;
        mundo3D = {
          grupo: espacio.grupo,
          luces: espacio.luces,
          posicionCamara: new THREE.Vector3(Math.sin(tiempoSec * 0.4) * 0.8, camY, camZ),
          targetCamara: new THREE.Vector3(0, 0, 0),
        };
        break;

      case 'hook_multitud':
      default:
        mundo3D = crearPerimetroMultitud({ t, frame: fActual });
        break;
    }

    scene.add(mundo3D.grupo);
    mundo3D.luces.forEach((l) => scene.add(l));

    // MOTES / PARTÍCULAS AMBIENTALES EN MOVIMIENTO PERMANENTE
    const numParticulas = 80;
    const geomPart = new THREE.BufferGeometry();
    const posPart = new Float32Array(numParticulas * 3);
    for (let i = 0; i < numParticulas; i++) {
      const seed = i * 19.37;
      posPart[i * 3] = (Math.sin(seed) * 8);
      // Motes subiendo constantemente
      posPart[i * 3 + 1] = ((seed * 4.3 + fActual * 0.06) % 7.5);
      posPart[i * 3 + 2] = (Math.cos(seed) * 8);
    }
    geomPart.setAttribute('position', new THREE.BufferAttribute(posPart, 3));
    const matPart = new THREE.PointsMaterial({
      color: new THREE.Color('#38bdf8'),
      size: 0.07,
      transparent: true,
      opacity: 0.65,
    });
    scene.add(new THREE.Points(geomPart, matPart));

    // Posición y orientación de cámara con suave vibración cinemática
    const shakeY = Math.sin(fActual * 0.15) * 0.02;
    const shakeX = Math.cos(fActual * 0.12) * 0.02;
    camera.position.set(
      mundo3D.posicionCamara.x + shakeX,
      mundo3D.posicionCamara.y + shakeY,
      mundo3D.posicionCamara.z
    );
    camera.lookAt(mundo3D.targetCamara);

    renderer.render(scene, camera);

    return () => {
      liberarMemoriaGPU(scene);
    };
  }, [fActual, t, etapa]);

  // Configuración de HUD contextual por etapa
  const hudPorEtapa = {
    hook_multitud: {
      ubicacion: 'GENEVA PROTOCOL — BIO-EXCLUSION ZONE',
      metricaPrincipal: { etiqueta: 'TOTAL MALES', valor: '1', incremento: '-99.9%' },
      telemetria: [
        { clave: 'TOTAL POPULATION', valor: '4,000,000,001' },
        { clave: 'MALE RATIO', valor: '0.00000002%' },
        { clave: 'STATUS', valor: 'CRITICAL PRIORITY', color: '#ef4444' },
      ],
    },
    bunker_aislamiento: {
      ubicacion: 'UNDERGROUND VAULT 01 — STERILE LAB',
      metricaPrincipal: { etiqueta: 'BIO-SECURITY', valor: 'LVL 4', incremento: 'MAX' },
      telemetria: [
        { clave: 'CHAMBER STERILITY', valor: '99.98%' },
        { clave: 'AIR PURITY', valor: 'GRADE A' },
        { clave: 'HEART RATE', valor: '74 BPM', color: '#10b981' },
      ],
    },
    colapso_genetico: {
      ubicacion: 'GENOMIC ARCHIVE — Y-CHROMOSOME ANALYSIS',
      metricaPrincipal: { etiqueta: 'GENE POOL', valor: '0.001%', incremento: 'COLLAPSE' },
      telemetria: [
        { clave: 'DIVERSITY INDEX', valor: '1 Y-LINEAGE' },
        { clave: 'INBREEDING RISK', valor: 'EXTREME' },
        { clave: 'IVF FACILITY', valor: 'ONLINE', color: '#38bdf8' },
      ],
    },
    cierre_planeta: {
      ubicacion: 'EARTH — GLOBAL SURVIVAL TASKFORCE',
      metricaPrincipal: { etiqueta: 'FUTURE', valor: 'PENDING', incremento: 'LOOP' },
      telemetria: [
        { clave: 'GLOBAL CONSENSUS', valor: '100% PROTECTED' },
        { clave: 'SPECIES RECOVERY', valor: '300 YEARS' },
      ],
    },
  }[etapa];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#070b14',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '1080px',
          height: '1920px',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      <HUDEditorialHolborn
        t={t}
        frame={fActual}
        textoEditorial={textoEditorial}
        palabraClave={palabraClave}
        {...hudPorEtapa}
        {...hud}
      />
    </div>
  );
};
