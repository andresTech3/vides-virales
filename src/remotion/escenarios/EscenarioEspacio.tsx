/**
 * EscenarioEspacio — Escenario React/Three.js para Remotion.
 * Usa prefabs: EspacioCosmos (starfield, globo/disco, sol, luna)
 * Estilos de referencia: #1, #21, #25
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { crearEspacioCosmos } from '../../prefabs/entornos/EspacioCosmos';
import { obtenerPoseCamara, aplicarPoseCamara, type TipoCamara } from '../../prefabs/camaras/camaras';

export interface PropsEspacio {
  modo?: 'globo' | 'tierra_plana' | 'jupiter';
  tipoCamara?: TipoCamara;
  duracionFrames?: number;
  frameInicio?: number;
}

export const EscenarioEspacio: React.FC<PropsEspacio> = ({
  modo = 'globo',
  tipoCamara = 'orbital_espacio',
  duracionFrames = 90,
  frameInicio = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  const frameLocal = Math.max(0, frame - frameInicio);
  const t = Math.min(frameLocal / duracionFrames, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(1080, 1920);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000005');

    const camera = new THREE.PerspectiveCamera(55, 1080 / 1920, 0.1, 300);

    const { grupo, luces } = crearEspacioCosmos({
      tierraPlana: modo === 'tierra_plana',
      globo: modo === 'globo',
      sol: true,
      luna: true,
      nebulosa: true,
      colorNebulosa: modo === 'tierra_plana' ? '#1a0044' : '#000a2a',
      numEstrellas: 800,
      t,
    });

    // Júpiter custom
    if (modo === 'jupiter') {
      const jupiterGeo = new THREE.SphereGeometry(3.5, 24, 24);
      const jupiterMat = new THREE.MeshLambertMaterial({ color: '#c88b4a' });
      const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
      // Bandas atmosféricas
      for (let i = -3; i <= 3; i++) {
        const banda = new THREE.Mesh(
          new THREE.TorusGeometry(3.5, 0.2, 4, 32),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? '#b87040' : '#e8c090', transparent: true, opacity: 0.6 }),
        );
        banda.position.y = i * 0.55;
        banda.rotation.x = Math.PI / 2;
        jupiter.add(banda);
      }
      // Gran Mancha Roja
      const mancha = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#cc4422' }),
      );
      mancha.position.set(3.3, -0.5, 0);
      jupiter.add(mancha);
      jupiter.rotation.y = t * Math.PI * 2 * 0.15;
      grupo.add(jupiter);
    }

    scene.add(grupo);
    luces.forEach((l) => scene.add(l));

    const pose = obtenerPoseCamara(tipoCamara, t);
    aplicarPoseCamara(camera, pose);

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
  }, [frame]);

  return (
    <canvas
      ref={canvasRef}
      width={1080}
      height={1920}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

export default EscenarioEspacio;
