/**
 * matematicas.ts — Funciones Matemáticas Puras y Optimizadores WebGL
 * 
 * Incluye:
 * - Liberador de memoria GPU (dispose recursivo de geometrías y materiales)
 * - Ruido procedural determinista (Simplex/Perlin simplificado 1D/2D/3D)
 * - Curvas de Bézier cúbicas e interpolaciones elásticas
 */

import * as THREE from 'three';

// ── 1. GESTIÓN DE RECURSOS GPU (GARBAGE COLLECTION) ────────────────────────

export function liberarMemoriaGPU(nodo: THREE.Object3D): void {
  nodo.traverse((hijo) => {
    if (hijo instanceof THREE.Mesh) {
      if (hijo.geometry) {
        hijo.geometry.dispose();
      }
      if (Array.isArray(hijo.material)) {
        hijo.material.forEach((m) => m.dispose());
      } else if (hijo.material) {
        hijo.material.dispose();
      }
    }
  });
}

// ── 2. RUIDO DETERMINISTA PROCEDURAL (CERO DEPENDENCIAS) ───────────────────

function hash(n: number): number {
  return (Math.sin(n) * 43758.5453123) % 1;
}

export function ruido1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3.0 - 2.0 * f);
  return (hash(i) * (1.0 - u) + hash(i + 1.0) * u) * 2.0 - 1.0;
}

export function ruido2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  const n00 = hash(ix + iy * 57.0);
  const n10 = hash(ix + 1.0 + iy * 57.0);
  const n01 = hash(ix + (iy + 1.0) * 57.0);
  const n11 = hash(ix + 1.0 + (iy + 1.0) * 57.0);

  const nx0 = n00 * (1.0 - ux) + n10 * ux;
  const nx1 = n01 * (1.0 - ux) + n11 * ux;

  return (nx0 * (1.0 - uy) + nx1 * uy) * 2.0 - 1.0;
}

// ── 3. INTERPOLACIÓN SUAVE & CURVAS PARAMÉTRICAS ───────────────────────────

export function bezierCubica(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function oscilacionSinusoidal(t: number, frecuencia = 1.0, amplitud = 1.0, fase = 0): number {
  return Math.sin(t * Math.PI * 2 * frecuencia + fase) * amplitud;
}
