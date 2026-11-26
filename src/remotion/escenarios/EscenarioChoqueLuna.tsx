/**
 * EscenarioChoqueLuna.tsx — Integrador Remotion para el video "¿Qué pasaría si la Luna choca con la Tierra?".
 * 
 * Dinamismo continuo:
 * - 5 fases cósmicas completas con física orbital, desgarro de Roche y lluvia de meteoros.
 * - Reutilización de WebGLRenderer para máximo rendimiento a 30 FPS.
 * - HUD Editorial con reloj de telemetría y coordenadas en vivo.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import { crearChoqueLunaTierra, type EtapaChoqueLuna } from '../../prefabs/entornos/ChoqueLunaTierra';
import { HUDEditorialHolborn, type PropsHUDEditorial } from '../../prefabs/efectos/HUDEditorialHolborn';
import { liberarMemoriaGPU } from '../../prefabs/core/matematicas';

export type { EtapaChoqueLuna };

export interface PropsEscenarioChoqueLuna {
  etapa?: EtapaChoqueLuna;
  duracionFrames?: number;
  frameInicio?: number;
  frameLocal?: number;
  hud?: Partial<PropsHUDEditorial>;
  textoEditorial?: string;
  palabraClave?: string;
}

export const EscenarioChoqueLuna: React.FC<PropsEscenarioChoqueLuna> = ({
  etapa = 'aproximacion_luna',
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

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  const fActual = frameLocal !== undefined ? frameLocal : Math.max(0, frameGlobal - frameInicio);
  const t = fActual / Math.max(1, duracionFrames);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      renderer.toneMappingExposure = 1.9;
      rendererRef.current = renderer;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');

    const camera = new THREE.PerspectiveCamera(65, 1080 / 1920, 0.1, 800);

    const mundo = crearChoqueLunaTierra({
      etapa,
      t,
      frame: fActual,
    });

    scene.add(mundo.grupo);
    mundo.luces.forEach((l) => scene.add(l));

    camera.position.copy(mundo.posicionCamara);
    camera.lookAt(mundo.targetCamara);

    renderer.render(scene, camera);

    return () => {
      liberarMemoriaGPU(mundo.grupo);
    };
  }, [etapa, t, fActual]);

  const subLabelHud =
    etapa === 'aproximacion_luna'
      ? 'DISTANCIA ORBITAL: 150.000 KM'
      : etapa === 'limite_roche'
      ? 'LÍMITE DE ROCHE: 18.470 KM // FRACTURA'
      : etapa === 'bombardeo_cataclismo'
      ? 'IMPACTO KINÉTICO GLOBAL: 2.000 °C'
      : 'ACRECIÓN & SUPERTIERRA DE MAGMA';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* HUD Editorial de Telemetría Cósmica */}
      <HUDEditorialHolborn
        frame={fActual}
        ubicacion="SIMULACIÓN ASTROFÍSICA — TIERRA/LUNA"
        tiempoReloj="23:59:58"
        metricaPrincipal={{
          etiqueta: 'DISTANCIA LUNAR',
          valor: etapa === 'aproximacion_luna' ? '150.000 KM' : etapa === 'limite_roche' ? '18.470 KM' : '0 KM',
          incremento: '-3.800 KM/H',
        }}
        telemetria={[
          { clave: 'ESTADO', valor: subLabelHud, color: '#f59e0b' },
          { clave: 'TEMPERATURA', valor: etapa === 'bombardeo_cataclismo' ? '2.000 °C' : '15 °C', color: '#ef4444' },
        ]}
        textoEditorial={textoEditorial}
        palabraClave={palabraClave || '18.470 KM'}
        {...hud}
      />
    </div>
  );
};
