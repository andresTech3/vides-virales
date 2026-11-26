/**
 * ManiquiMinimalista — Modelo 3D de maniquí estilizado de alta gama (viral style).
 * Réplica idéntica de las referencias virales (Higgsfield / What If series).
 * 
 * Características:
 * - Cabeza ovoide suave con corte estilizado.
 * - Torso suave biselado con material mate tipo cerámica/vinilo de diseño.
 * - Articulaciones con cinemática sinusoidal fluida.
 * - Material PBR con roughness calibrada para reflejos suaves de estudio.
 */

import * as THREE from 'three';

export interface OpcionesManiqui {
  colorCuerpo?: string;
  colorAcento?: string;
  escala?: number;
  animacion?: 'caminar' | 'parado' | 'respirar';
  t?: number;
  opacidad?: number;
}

const DEFAULTS: Required<OpcionesManiqui> = {
  colorCuerpo: '#cbd5e1', // Gris perla neutro
  colorAcento: '#94a3b8',
  escala: 1,
  animacion: 'parado',
  t: 0,
  opacidad: 1,
};

const _matCache = new Map<string, THREE.MeshStandardMaterial>();

function getMatVinilo(color: string, roughness = 0.38, metalness = 0.08): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}`;
  if (!_matCache.has(key)) {
    _matCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness,
      })
    );
  }
  return _matCache.get(key) as THREE.MeshStandardMaterial;
}

export function crearManiquiMinimalista(opciones?: OpcionesManiqui): THREE.Group {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();

  const matCuerpo = getMatVinilo(o.colorCuerpo);
  const matAcento = getMatVinilo(o.colorAcento, 0.45, 0.05);

  // ── CABEZA OVOIDE SUAVE ──────────────────────────────────────────────────
  const geomCabeza = new THREE.SphereGeometry(0.18, 20, 16);
  geomCabeza.scale(0.85, 1.15, 0.9);
  const cabeza = new THREE.Mesh(geomCabeza, matCuerpo);
  cabeza.position.set(0, 1.48, 0);

  // Casquete/detalle posterior en la nuca (muy característico en frame_060)
  const geomNuca = new THREE.SphereGeometry(0.13, 16, 12);
  geomNuca.scale(0.78, 0.9, 0.35);
  const nuca = new THREE.Mesh(geomNuca, matAcento);
  nuca.position.set(0, 0.02, 0.06);
  cabeza.add(nuca);
  grupo.add(cabeza);


  // ── CUELLO ───────────────────────────────────────────────────────────────
  const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16), matCuerpo);
  cuello.position.set(0, 1.34, 0);
  grupo.add(cuello);

  // ── TORSO AERODINÁMICO / SUAVE ───────────────────────────────────────────
  const torsoG = new THREE.Group();
  torsoG.position.set(0, 1.05, 0);

  // Parte superior del pecho (hombros anchos redondeados)
  const geomPecho = new THREE.CylinderGeometry(0.24, 0.18, 0.38, 20);
  geomPecho.scale(1.2, 1, 0.65);
  const pecho = new THREE.Mesh(geomPecho, matCuerpo);
  pecho.position.y = 0.12;

  // Cintura
  const geomCintura = new THREE.CylinderGeometry(0.18, 0.16, 0.22, 20);
  geomCintura.scale(1.05, 1, 0.65);
  const cintura = new THREE.Mesh(geomCintura, matAcento);
  cintura.position.y = -0.16;

  torsoG.add(pecho, cintura);
  grupo.add(torsoG);

  // ── PELVIS / CADERA ──────────────────────────────────────────────────────
  const geomPelvis = new THREE.SphereGeometry(0.17, 16, 12);
  geomPelvis.scale(1.05, 0.8, 0.65);
  const pelvis = new THREE.Mesh(geomPelvis, matAcento);
  pelvis.position.set(0, 0.74, 0);
  grupo.add(pelvis);

  // ── CINEMÁTICA Y EXTREMIDADES ─────────────────────────────────────────────
  let brazoIzq_x = 0;
  let brazoDer_x = 0;
  let piernaIzq_x = 0;
  let piernaDer_x = 0;
  let bodyBob = 0;

  if (o.animacion === 'caminar') {
    const ciclo = o.t * Math.PI * 2;
    brazoIzq_x = Math.sin(ciclo) * 0.55;
    brazoDer_x = -Math.sin(ciclo) * 0.55;
    piernaIzq_x = -Math.sin(ciclo) * 0.55;
    piernaDer_x = Math.sin(ciclo) * 0.55;
    bodyBob = Math.abs(Math.sin(ciclo * 2)) * 0.035;
  } else if (o.animacion === 'respirar') {
    const ciclo = o.t * Math.PI * 2;
    bodyBob = Math.sin(ciclo) * 0.015;
    torsoG.scale.set(1 + Math.sin(ciclo) * 0.02, 1, 1 + Math.sin(ciclo) * 0.02);
  }

  grupo.position.y += bodyBob;

  // ── BRAZOS (Cilindros con articulación suave) ────────────────────────────
  // Brazo Izquierdo
  const bIzq = new THREE.Group();
  bIzq.position.set(-0.31, 1.2, 0);
  const geomBrazo = new THREE.CylinderGeometry(0.055, 0.048, 0.52, 16);
  const brazoIzqMesh = new THREE.Mesh(geomBrazo, matCuerpo);
  brazoIzqMesh.position.y = -0.25;
  bIzq.add(brazoIzqMesh);
  bIzq.rotation.x = brazoIzq_x;
  grupo.add(bIzq);

  // Brazo Derecho
  const bDer = new THREE.Group();
  bDer.position.set(0.31, 1.2, 0);
  const brazoDerMesh = new THREE.Mesh(geomBrazo, matCuerpo);
  brazoDerMesh.position.y = -0.25;
  bDer.add(brazoDerMesh);
  bDer.rotation.x = brazoDer_x;
  grupo.add(bDer);

  // ── PIERNAS ──────────────────────────────────────────────────────────────
  const geomPierna = new THREE.CylinderGeometry(0.065, 0.052, 0.68, 16);

  // Pierna Izquierda
  const pIzq = new THREE.Group();
  pIzq.position.set(-0.13, 0.7, 0);
  const piernaIzqMesh = new THREE.Mesh(geomPierna, matAcento);
  piernaIzqMesh.position.y = -0.34;
  pIzq.add(piernaIzqMesh);
  pIzq.rotation.x = piernaIzq_x;
  grupo.add(pIzq);

  // Pierna Derecha
  const pDer = new THREE.Group();
  pDer.position.set(0.13, 0.7, 0);
  const piernaDerMesh = new THREE.Mesh(geomPierna, matAcento);
  piernaDerMesh.position.y = -0.34;
  pDer.add(piernaDerMesh);
  pDer.rotation.x = piernaDer_x;
  grupo.add(pDer);

  grupo.scale.setScalar(o.escala);
  return grupo;
}
