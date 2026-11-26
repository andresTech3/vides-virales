/**
 * EspacioCosmos — Prefab de entorno espacial profundo.
 * Incluye: starfield, planetas, nebulosas, disco de tierra plana.
 */

import * as THREE from 'three';

export interface OpcionesEspacio {
  /** ¿Mostrar el disco de tierra plana? */
  tierraPlana?: boolean;
  /** ¿Mostrar planeta esférico? */
  globo?: boolean;
  /** ¿Mostrar sol orbital? */
  sol?: boolean;
  /** ¿Mostrar luna orbital? */
  luna?: boolean;
  /** ¿Nebulosa de color de fondo? */
  nebulosa?: boolean;
  /** Color de nebulosa (hex) */
  colorNebulosa?: string;
  /** Cantidad de estrellas */
  numEstrellas?: number;
  /** Progreso de animación (0–1) */
  t?: number;
}

const DEFAULTS: Required<OpcionesEspacio> = {
  tierraPlana: false,
  globo: true,
  sol: true,
  luna: true,
  nebulosa: true,
  colorNebulosa: '#0a003a',
  numEstrellas: 1000,
  t: 0,
};

// ─── Campo estelar ────────────────────────────────────────────────────────

export function crearCampoEstelar(cantidad = 1200): THREE.Points {
  const positions = new Float32Array(cantidad * 3);
  const colores = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 60 + Math.random() * 80;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Variación de brillo y tinte
    const bright = 0.6 + Math.random() * 0.4;
    const tinte = Math.random();
    colores[i * 3] = bright * (tinte > 0.8 ? 1 : tinte > 0.6 ? 0.8 : 1);
    colores[i * 3 + 1] = bright * (tinte > 0.8 ? 0.9 : tinte > 0.6 ? 0.9 : 1);
    colores[i * 3 + 2] = bright * (tinte > 0.8 ? 0.7 : 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));

  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  }));
}

// ─── Planeta esférico ─────────────────────────────────────────────────────

export function crearGloboTerraqueo(t: number): THREE.Group {
  const g = new THREE.Group();

  // Esfera oceánica vibrante con material estándar y auto-iluminación suave
  const oceano = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0284c7'), // Azul oceánico vibrante
      emissive: new THREE.Color('#0369a1'),
      emissiveIntensity: 0.35, // Asegura que nunca quede en negro absoluto
      roughness: 0.25,
      metalness: 0.1,
    }),
  );
  g.add(oceano);

  // Continentes (masas continentales con verde vivo y relieve)
  const continentes = [
    { x: 0.8, y: 0.5, z: 1.7, sx: 0.7, sy: 0.1, sz: 0.8 },
    { x: -0.9, y: 0.3, z: 1.6, sx: 0.5, sy: 0.1, sz: 0.6 },
    { x: 0.1, y: -0.8, z: 1.8, sx: 0.4, sy: 0.1, sz: 0.5 },
    { x: 1.5, y: 0.8, z: 1.2, sx: 0.6, sy: 0.1, sz: 0.5 },
    { x: -1.8, y: -0.3, z: 0.8, sx: 0.4, sy: 0.1, sz: 0.4 },
    { x: 0.2, y: 1.6, z: 1.1, sx: 0.6, sy: 0.1, sz: 0.5 },
    { x: -0.5, y: -1.5, z: 1.2, sx: 0.5, sy: 0.1, sz: 0.4 },
  ];
  for (const c of continentes) {
    const cont = new THREE.Mesh(
      new THREE.BoxGeometry(c.sx, c.sy, c.sz),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#22c55e'), // Verde esmeralda vivo
        emissive: new THREE.Color('#15803d'),
        emissiveIntensity: 0.25,
        roughness: 0.4,
      }),
    );
    const v = new THREE.Vector3(c.x, c.y, c.z).normalize().multiplyScalar(2.04);
    cont.position.copy(v);
    cont.lookAt(0, 0, 0);
    cont.rotateX(Math.PI / 2);
    g.add(cont);
  }

  // Nubes flotantes blancas
  const nubes = new THREE.Mesh(
    new THREE.SphereGeometry(2.07, 24, 24),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.45,
    }),
  );
  g.add(nubes);

  // Halo atmosférico brillante cian estilo NASA
  const haloAtmosfera = new THREE.Mesh(
    new THREE.SphereGeometry(2.22, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    }),
  );
  g.add(haloAtmosfera);

  // Rotación suave continua
  g.rotation.y = t * Math.PI * 2 * 0.3;
  return g;
}

// ─── Disco de Tierra Plana ────────────────────────────────────────────────

export function crearTierraPlana(t: number): THREE.Group {
  const g = new THREE.Group();

  // Disco base
  const disco = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 0.25, 32),
    new THREE.MeshLambertMaterial({ color: new THREE.Color('#1a78c2') }),
  );
  g.add(disco);

  // Tierra sobre el disco
  const tierra = new THREE.Mesh(
    new THREE.CylinderGeometry(3.48, 3.48, 0.18, 32),
    new THREE.MeshLambertMaterial({ color: new THREE.Color('#2d8a3a') }),
  );
  tierra.position.y = 0.14;
  g.add(tierra);

  // Borde de hielo (antártico)
  const hielo = new THREE.Mesh(
    new THREE.TorusGeometry(3.5, 0.3, 6, 32),
    new THREE.MeshLambertMaterial({ color: new THREE.Color('#e8f4f8') }),
  );
  hielo.position.y = 0.18;
  g.add(hielo);

  // Rotación lenta del disco
  g.rotation.x = 0.2;
  g.rotation.y = t * Math.PI * 2 * 0.1;
  return g;
}

// ─── Sol y Luna orbitales ─────────────────────────────────────────────────

export function crearSolOrbital(t: number, radio = 8): THREE.Group {
  const g = new THREE.Group();

  const angulo = t * Math.PI * 2 * 0.4;
  const sol = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 8, 8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffdd00') }),
  );
  sol.position.set(
    Math.cos(angulo) * radio,
    Math.sin(angulo * 0.5) * 2,
    Math.sin(angulo) * radio,
  );

  // Halo luminoso
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 8, 8),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff9900'),
      transparent: true,
      opacity: 0.25,
    }),
  );
  halo.position.copy(sol.position);

  // Luz puntual del sol
  const luz = new THREE.PointLight('#ffcc44', 2, 30);
  luz.position.copy(sol.position);

  g.add(sol, halo, luz);
  return g;
}

export function crearLunaOrbital(t: number, radio = 5): THREE.Group {
  const g = new THREE.Group();

  const angulo = t * Math.PI * 2 * 0.6 + Math.PI;
  const luna = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshLambertMaterial({ color: new THREE.Color('#cccccc') }),
  );
  luna.position.set(
    Math.cos(angulo) * radio,
    Math.cos(angulo * 0.3) * 1.5 + 1,
    Math.sin(angulo) * radio,
  );

  const luzLuna = new THREE.PointLight('#aaaaff', 0.4, 15);
  luzLuna.position.copy(luna.position);

  g.add(luna, luzLuna);
  return g;
}

// ─── Nebulosa de partículas ───────────────────────────────────────────────

export function crearNebulosa(colorHex = '#2200aa', cantidad = 200): THREE.Points {
  const positions = new Float32Array(cantidad * 3);
  const color = new THREE.Color(colorHex);

  for (let i = 0; i < cantidad; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(geo, new THREE.PointsMaterial({
    color,
    size: 0.5,
    transparent: true,
    opacity: 0.3,
  }));
}

// ─── Función principal ────────────────────────────────────────────────────

export function crearEspacioCosmos(opts: OpcionesEspacio = {}): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  colorCielo: THREE.Color;
} {
  const o: Required<OpcionesEspacio> = { ...DEFAULTS, ...opts };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  // Luz ambiental de relleno difusa para que ningún objeto quede a oscuras
  const ambient = new THREE.AmbientLight(new THREE.Color('#38bdf8'), 1.8);
  luces.push(ambient);

  // Luz solar principal frontal directa hacia la Tierra
  const solFrontal = new THREE.DirectionalLight(new THREE.Color('#fffbeb'), 4.2);
  solFrontal.position.set(3, 5, 8);
  luces.push(solFrontal);

  // Contraluz azul de borde para silueta cinemática
  const solContra = new THREE.DirectionalLight(new THREE.Color('#0284c7'), 2.5);
  solContra.position.set(-5, -2, -6);
  luces.push(solContra);

  // Estrellas
  grupo.add(crearCampoEstelar(o.numEstrellas));

  // Nebulosa
  if (o.nebulosa) {
    grupo.add(crearNebulosa(o.colorNebulosa));
  }

  // Objeto central
  if (o.tierraPlana) {
    grupo.add(crearTierraPlana(o.t));
  } else if (o.globo) {
    grupo.add(crearGloboTerraqueo(o.t));
  }

  // Sol
  if (o.sol) {
    const solG = crearSolOrbital(o.t);
    solG.children.forEach((c) => {
      if (c instanceof THREE.Light) luces.push(c);
    });
    grupo.add(solG);
  }

  // Luna
  if (o.luna) {
    const lunaG = crearLunaOrbital(o.t);
    lunaG.children.forEach((c) => {
      if (c instanceof THREE.Light) luces.push(c);
    });
    grupo.add(lunaG);
  }

  return {
    grupo,
    luces,
    colorCielo: new THREE.Color('#000005'),
  };
}
