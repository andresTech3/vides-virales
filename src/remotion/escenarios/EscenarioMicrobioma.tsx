/**
 * EscenarioMicrobioma.tsx — Escenario 3D de Remotion para Microbioma y Bacterias.
 * Sincroniza la cámara microscópica y el HUD científico sobre el canvas 3D.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import {
  crearEscenarioMicrobioma3D,
  type EtapaMicrobioma,
} from '../../prefabs/entornos/MicrobiomaCelular';
import { HUDDatos, type TipoHUD, type DatoHUD } from '../../prefabs/efectos/HUDDatos';

export interface PropsEscenarioMicrobioma {
  etapa?: EtapaMicrobioma;
  duracionFrames?: number;
  frameInicio?: number;
  hud?: {
    tipo: TipoHUD;
    datos: DatoHUD[];
    posicion?: 'inferior_izq' | 'superior_izq' | 'inferior_der';
  };
  colorBacteriaA?: string;
  colorBacteriaB?: string;
}

export const EscenarioMicrobioma: React.FC<PropsEscenarioMicrobioma> = ({
  etapa = 'zoom_entrada',
  duracionFrames = 90,
  frameInicio = 0,
  hud,
  colorBacteriaA = '#10b981',
  colorBacteriaB = '#06b6d4',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  const frameLocal = Math.max(0, frame - frameInicio);
  const t = Math.min(frameLocal / Math.max(1, duracionFrames), 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(1080, 1920);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a010d'); // Fondo biológico oscuro profundo

    const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.1, 100);

    // Crear mundo 3D celular
    const { grupo, luces } = crearEscenarioMicrobioma3D({
      etapa,
      t,
      colorBacteriaA,
      colorBacteriaB,
    });

    scene.add(grupo);
    luces.forEach((l) => scene.add(l));

    // ── Cinemáticas de Cámara Microscópica por Etapa ──
    switch (etapa) {
      case 'zoom_entrada': {
        // Dolly in acelerado de 100x a 100,000x
        const camZ = 16 - Math.pow(t, 1.4) * 14;
        camera.position.set(Math.sin(t * 3) * 0.8, Math.cos(t * 2.5) * 0.6, camZ);
        camera.lookAt(0, 0, camZ - 10);
        break;
      }

      case 'enjambre_bacterias': {
        // Vuelo entre colonias rotando suavemente
        const angulo = t * Math.PI * 0.6;
        camera.position.set(Math.cos(angulo) * 3, Math.sin(angulo) * 2, 2 - t * 8);
        camera.lookAt(0, 0, -8);
        break;
      }

      case 'segundo_cerebro': {
        // Enfoque cercano a vellosidades con pulsación
        camera.position.set(1.5 + Math.sin(t * 4) * 0.4, 0.5, 0 - t * 6);
        camera.lookAt(-1, 0, -8);
        break;
      }

      case 'peso_biomasa': {
        // Plano amplio contemplando el cúmulo celular
        camera.position.set(0, 1.2, 5 - t * 4);
        camera.lookAt(0, -0.5, -6);
        break;
      }

      case 'universo_interior':
      default: {
        // Giro panorámico contemplativo del cosmos biológico
        const anguloSuave = t * Math.PI * 0.8;
        camera.position.set(Math.sin(anguloSuave) * 3.5, 1.0, Math.cos(anguloSuave) * 3.5);
        camera.lookAt(0, 0, 0);
        break;
      }
    }

    renderer.render(scene, camera);

    return () => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [frame, etapa, duracionFrames, frameInicio, colorBacteriaA, colorBacteriaB]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {hud && (
        <HUDDatos
          tipo={hud.tipo}
          datos={hud.datos}
          posicion={hud.posicion ?? 'inferior_izq'}
        />
      )}
    </div>
  );
};
