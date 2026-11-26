/**
 * EscenarioCiudad — Escenario React/Three.js para Remotion.
 * Usa prefabs: CiudadLowPoly + HumanoideArticulado + HUDDatos
 * Estilos de referencia: #6, #8, #16, #20, #22
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { crearCiudadLowPoly, type HoraCiudad } from '../../prefabs/entornos/CiudadLowPoly';
import { crearHumanoide, crearMultitud, type AnimacionHumanoide } from '../../prefabs/personajes/HumanoideArticulado';
import { obtenerPoseCamara, aplicarPoseCamara, type TipoCamara } from '../../prefabs/camaras/camaras';
import { HUDDatos, type TipoHUD, type DatoHUD } from '../../prefabs/efectos/HUDDatos';

export interface PropsCiudad {
  hora?: HoraCiudad;
  tipoCamara?: TipoCamara;
  /** Animación del personaje central */
  animacionPersonaje?: AnimacionHumanoide;
  colorPersonaje?: string;
  /** ¿Mostrar multitud en lugar de personaje individual? */
  modoMultitud?: boolean;
  cantidadMultitud?: number;
  /** HUD de datos superpuesto */
  hud?: {
    tipo: TipoHUD;
    datos: DatoHUD[];
    posicion?: 'inferior_izq' | 'superior_izq' | 'inferior_der';
  };
  /** Duración en frames de esta escena */
  duracionFrames?: number;
  /** Frame de inicio relativo */
  frameInicio?: number;
}

export const EscenarioCiudad: React.FC<PropsCiudad> = ({
  hora = 'dia',
  tipoCamara = 'dolly_acercamiento',
  animacionPersonaje = 'idle_mirar',
  colorPersonaje = '#e63946',
  modoMultitud = false,
  cantidadMultitud = 20,
  hud,
  duracionFrames = 90,
  frameInicio = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tiempo local dentro de esta escena (0–1)
  const frameLocal = Math.max(0, frame - frameInicio);
  const t = Math.min(frameLocal / duracionFrames, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(1080, 1920);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false; // OFF para performance

    // ── Escena + cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1080 / 1920, 0.1, 200);

    // ── Ciudad
    const { grupo: ciudad, luces, fog, colorCielo } = crearCiudadLowPoly({
      hora,
      vehiculos: true,
      arboles: true,
      farolas: true,
      filasEdificios: 2,
      t,
    });
    scene.background = colorCielo;
    scene.fog = fog;
    scene.add(ciudad);
    luces.forEach((l) => scene.add(l));

    // ── Personaje(s)
    if (modoMultitud) {
      const multitud = crearMultitud({
        cantidad: cantidadMultitud,
        areaX: 12,
        areaZ: 20,
        t,
        colorDestacado: colorPersonaje,
        indicePrincipal: Math.floor(cantidadMultitud / 2),
      });
      multitud.position.set(0, 0.12, 0);
      scene.add(multitud);
    } else {
      const persona = crearHumanoide({
        colorCamisa: colorPersonaje,
        animacion: animacionPersonaje,
        t,
        escala: 1.1,
      });
      persona.position.set(0, 0.12, 0);
      scene.add(persona);
    }

    // ── Cámara
    const pose = obtenerPoseCamara(tipoCamara, t);
    aplicarPoseCamara(camera, pose);

    // ── Render
    renderer.render(scene, camera);

    // ── Cleanup
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

  const hudEntrada = Math.min(1, (frameLocal - 10) / 20);

  return (
    <div style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {hud && hudEntrada > 0 && (
        <HUDDatos
          tipo={hud.tipo}
          datos={hud.datos}
          posicion={hud.posicion ?? 'inferior_izq'}
          t={hudEntrada}
        />
      )}
    </div>
  );
};

export default EscenarioCiudad;
