/**
 * EscenarioMontanaRusa — Componente de Escenario 3D Remotion para Montaña Rusa Espacial.
 * Sincroniza la cámara con el avance del tren en cada escena y superpone el HUD de datos físicos.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import {
  crearEscenarioMontanaRusaEspacio,
  type EtapaMontanaRusa,
} from '../../prefabs/entornos/MontanaRusaEspacio';
import { HUDDatos, type TipoHUD, type DatoHUD } from '../../prefabs/efectos/HUDDatos';

export interface PropsEscenarioMontanaRusa {
  etapa?: EtapaMontanaRusa;
  duracionFrames?: number;
  frameInicio?: number;
  hud?: {
    tipo: TipoHUD;
    datos: DatoHUD[];
    posicion?: 'inferior_izq' | 'superior_izq' | 'inferior_der';
  };
  colorRieles?: string;
  colorNeon?: string;
}

export const EscenarioMontanaRusa: React.FC<PropsEscenarioMontanaRusa> = ({
  etapa = 'hook_cima',
  duracionFrames = 90,
  frameInicio = 0,
  hud,
  colorRieles = '#38bdf8',
  colorNeon = '#0ea5e9',
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
    scene.background = new THREE.Color('#01020a');

    const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.1, 800);

    // Crear mundo 3D de la montaña rusa
    const { grupo, luces, posicionTren, tangenteTren } = crearEscenarioMontanaRusaEspacio({
      etapa,
      t,
      colorRieles,
      colorNeon,
    });

    scene.add(grupo);
    luces.forEach((l) => scene.add(l));

    // ── Cinemáticas de Cámara específicas para cada etapa ──
    const normalTren = new THREE.Vector3(0, 1, 0);
    const lateralTren = new THREE.Vector3().crossVectors(tangenteTren, normalTren).normalize();

    switch (etapa) {
      case 'hook_cima': {
        // Cámara POV / sobre el hombro del primer vagón mirando hacia el abismo de la Tierra
        const camOffset = new THREE.Vector3()
          .copy(posicionTren)
          .addScaledVector(tangenteTren, -3.8)
          .add(new THREE.Vector3(0, 1.8, 0));

        camera.position.copy(camOffset);
        // Mira hacia adelante y ligeramente hacia abajo
        const target = posicionTren.clone().addScaledVector(tangenteTren, 14).add(new THREE.Vector3(0, -3, 0));
        camera.lookAt(target);
        break;
      }

      case 'caida_aceleracion': {
        // Cámara lateral persecutoria de alta velocidad con sacudida sutil (G-forces)
        const shake = (Math.sin(frame * 1.5) * 0.08) * Math.min(1, t * 1.5);
        const camOffset = new THREE.Vector3()
          .copy(posicionTren)
          .addScaledVector(lateralTren, 6.5)
          .addScaledVector(tangenteTren, -4.5)
          .add(new THREE.Vector3(0, 3.2 + shake, 0));

        camera.position.copy(camOffset);
        camera.lookAt(posicionTren.clone().add(new THREE.Vector3(0, 0.5, 0)));
        break;
      }

      case 'loop_gravedad_cero': {
        // Giro orbital 360 alrededor del loop para capturar la inversión
        const anguloOrbita = t * Math.PI * 1.2;
        const radioOrbita = 12;
        const camPos = new THREE.Vector3(
          posicionTren.x + Math.sin(anguloOrbita) * radioOrbita,
          posicionTren.y + 4 + Math.cos(anguloOrbita) * 3,
          posicionTren.z + Math.cos(anguloOrbita) * radioOrbita
        );

        camera.position.copy(camPos);
        camera.lookAt(posicionTren);
        break;
      }

      case 'fuga_frenos_fallo': {
        // Gran angular alejándose (Dolly out) mientras el tren se convierte en bólido cósmico
        const camPos = new THREE.Vector3(
          posicionTren.x - 12 - t * 10,
          posicionTren.y + 8 + t * 5,
          posicionTren.z + 18 + t * 12
        );

        camera.position.copy(camPos);
        camera.lookAt(posicionTren);
        break;
      }

      case 'deriva_eterna':
      default: {
        // Vuelo suave cinematográfico contemplando el tren surcar el cosmos entre estrellas
        const anguloSuave = t * 0.8;
        camera.position.set(
          posicionTren.x + Math.cos(anguloSuave) * 9,
          posicionTren.y + 2.5 + Math.sin(anguloSuave) * 2,
          posicionTren.z + Math.sin(anguloSuave) * 9
        );
        camera.lookAt(posicionTren);
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
  }, [frame, etapa, duracionFrames, frameInicio, colorRieles, colorNeon]);

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
