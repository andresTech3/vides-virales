/**
 * EscenarioEscaleraMetro — Escenario 3D Remotion para el formato viral de metro/multitudes.
 * 
 * Ensambla:
 * - 3D Three.js: Túnel con iluminación de estudio, escalones móviles y multitudes.
 * - Cámara de seguimiento dinámico con perspectiva cinematográfica.
 * - HUD Editorial idéntico al de Holborn Station de las referencias virales.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { crearEscaleraMetro } from '../../prefabs/entornos/EscaleraMetro';
import { HUDEditorialHolborn, type PropsHUDEditorial } from '../../prefabs/efectos/HUDEditorialHolborn';

export interface PropsEscenarioEscaleraMetro {
  duracionFrames?: number;
  frameInicio?: number;
  frameLocal?: number;
  hud?: Partial<PropsHUDEditorial>;
  colorProtagonista?: string;
  velocidadEscalera?: number;
  textoEditorial?: string;
  palabraClave?: string;
}

export const EscenarioEscaleraMetro: React.FC<PropsEscenarioEscaleraMetro> = ({
  duracionFrames = 150,
  frameInicio = 0,
  frameLocal,
  hud,
  colorProtagonista = '#f97316',
  velocidadEscalera = 1.0,
  textoEditorial = 'Stand on the right, walk on the left: the rule keeping 8 million commuters moving.',
  palabraClave = '8 million',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameGlobal = useCurrentFrame();

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fActual = frameLocal !== undefined ? frameLocal : Math.max(0, frameGlobal - frameInicio);
  const t = fActual / Math.max(1, duracionFrames);

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reutilizar WebGLRenderer para evitar sobrecarga de recreación en cada fotograma
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
      renderer.toneMappingExposure = 1.8; // Exposición brillante de estudio
      rendererRef.current = renderer;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog(new THREE.Color('#0f172a'), 30, 95);

    // Iluminación global de estudio
    const hemi = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#475569'), 1.8);
    scene.add(hemi);

    const camera = new THREE.PerspectiveCamera(68, 1080 / 1920, 0.1, 300);

    // ── Construir mundo 3D del metro

    const {
      grupo,
      luces,
      posicionCamaraSeguimiento,
      targetCamara,
    } = crearEscaleraMetro({
      t,
      colorProtagonista,
      velocidadEscalera,
    });

    scene.add(grupo);
    luces.forEach((l) => scene.add(l));

    // Posición y orientación suave de la cámara
    camera.position.copy(posicionCamaraSeguimiento);
    camera.lookAt(targetCamara);

    // Renderizar fotograma exacto
    renderer.render(scene, camera);

    return () => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [fActual, t, colorProtagonista, velocidadEscalera]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0c1322',
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

      {/* Overlay de HUD Editorial idéntico al de referencia */}
      <HUDEditorialHolborn
        t={t}
        frame={frameLocal}
        textoEditorial={textoEditorial}
        palabraClave={palabraClave}
        {...hud}
      />
    </div>
  );
};
