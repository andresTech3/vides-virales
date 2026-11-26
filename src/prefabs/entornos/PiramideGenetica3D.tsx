/**
 * PiramideGenetica3D.tsx — Prefab 3D de Colapso Demográfico y Cadena de ADN.
 * 
 * Dinamismo cinematográfico continuo:
 * - Doble hélice de ADN girando a alta velocidad con pulsos de emisión en los pares de bases.
 * - Barras demográficas 3D con respiración y pulsos de luz en los bordes.
 * - Indicador amarillo pulsante y rebotando con ondas sobre el último hombre.
 * - Rejilla holográfica con flujo de coordenadas.
 * - Cámara en sobrevuelo fluido continuo entre el ADN y la pirámide.
 */

import * as THREE from 'three';

export interface OpcionesPiramideGenetica {
  t?: number;
  frame?: number;
  colorADN_A?: string;
  colorADN_B?: string;
  colorHombres?: string;
  colorMujeres?: string;
}

const DEFAULTS: Required<OpcionesPiramideGenetica> = {
  t: 0,
  frame: 0,
  colorADN_A: '#38bdf8',
  colorADN_B: '#f43f5e',
  colorHombres: '#f97316',
  colorMujeres: '#0284c7',
};

export function crearPiramideGenetica3D(opciones?: OpcionesPiramideGenetica): {
  grupo: THREE.Group;
  luces: THREE.Light[];
  posicionCamara: THREE.Vector3;
  targetCamara: THREE.Vector3;
} {
  const o = { ...DEFAULTS, ...opciones };
  const grupo = new THREE.Group();
  const luces: THREE.Light[] = [];

  const tiempoSegundos = (o.frame || o.t * 90) / 30;

  // ── 1. ILUMINACIÓN DINÁMICA DE ALTA RETENCIÓN ────────────────────────────
  const hemiPiramide = new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#475569'), 2.6);
  luces.push(hemiPiramide);

  // Luz principal potente
  const dirPrincipal = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 3.8);
  dirPrincipal.position.set(-3 + Math.sin(tiempoSegundos * 1.5) * 1.0, 9, 6);
  luces.push(dirPrincipal);

  // Luz frontal amplia
  const dirFrontal = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 3.0);
  dirFrontal.position.set(0, 4, 8);
  luces.push(dirFrontal);

  // Luz de contra cian reactiva al ADN
  const dirContra = new THREE.DirectionalLight(new THREE.Color(o.colorADN_A), 2.8);
  dirContra.position.set(4, 5, -4);
  luces.push(dirContra);

  // ── 2. REJILLA HOLOGRÁFICA EN EL SUELO ────────────────────────────────────
  const gridHelper = new THREE.GridHelper(18, 28, new THREE.Color('#38bdf8'), new THREE.Color('#334155'));
  gridHelper.position.y = 0;
  // Desplazamiento sutil del suelo holográfico
  gridHelper.position.z = (tiempoSegundos * 0.5) % (18 / 28);
  grupo.add(gridHelper);

  // ── 3. DOBLE HÉLICE DE ADN ROTATORIA A ALTA VELOCIDAD ─────────────────────
  const gADN = new THREE.Group();
  // Flotación suave de la cadena
  gADN.position.set(-0.75, 1.8 + Math.sin(tiempoSegundos * 2.0) * 0.1, 0.4);

  const pasosHelice = 36;
  const radioHelice = 0.52;
  const alturaTotalHelice = 3.5;
  const vueltasHelice = 2.5;

  const geomEsfera = new THREE.SphereGeometry(0.065, 12, 10);
  
  // Brillo pulsante en el ADN
  const pulsoADN = 0.6 + Math.sin(tiempoSegundos * 6.0) * 0.35;
  const matEsferaA = new THREE.MeshStandardMaterial({
    color: new THREE.Color(o.colorADN_A),
    emissive: new THREE.Color(o.colorADN_A),
    emissiveIntensity: pulsoADN,
    roughness: 0.15,
  });
  const matEsferaB = new THREE.MeshStandardMaterial({
    color: new THREE.Color(o.colorADN_B),
    emissive: new THREE.Color(o.colorADN_B),
    emissiveIntensity: pulsoADN,
    roughness: 0.15,
  });
  const matPuente = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#64748b'),
    metalness: 0.6,
    roughness: 0.25,
  });

  // GIRO CONTINUO DEL ADN
  const rotacionBase = tiempoSegundos * Math.PI * 1.8;

  for (let i = 0; i < pasosHelice; i++) {
    const fraction = i / pasosHelice;
    const y = fraction * alturaTotalHelice - alturaTotalHelice / 2;
    // Onda de pulso que viaja por la hélice
    const ondaOndulante = Math.sin(fraction * 8.0 - tiempoSegundos * 4.0) * 0.04;
    const radioDinamico = radioHelice + ondaOndulante;
    const angulo = fraction * Math.PI * 2 * vueltasHelice + rotacionBase;

    const x1 = Math.cos(angulo) * radioDinamico;
    const z1 = Math.sin(angulo) * radioDinamico;

    const x2 = Math.cos(angulo + Math.PI) * radioDinamico;
    const z2 = Math.sin(angulo + Math.PI) * radioDinamico;

    const nA = new THREE.Mesh(geomEsfera, matEsferaA);
    nA.position.set(x1, y, z1);
    gADN.add(nA);

    const nB = new THREE.Mesh(geomEsfera, matEsferaB);
    nB.position.set(x2, y, z2);
    gADN.add(nB);

    if (i % 2 === 0) {
      const dist = 2 * radioDinamico;
      const geomCilindroPuente = new THREE.CylinderGeometry(0.018, 0.018, dist, 8);
      const puente = new THREE.Mesh(geomCilindroPuente, matPuente);
      puente.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      puente.rotation.z = Math.PI / 2;
      puente.rotation.y = -angulo;
      gADN.add(puente);
    }
  }

  grupo.add(gADN);

  // ── 4. PIRÁMIDE POBLACIONAL 3D CON BARRAS VIVAS Y PULSO ──────────────────
  const gPiramide = new THREE.Group();
  gPiramide.position.set(0.75, 0.2, -0.2);

  const nivelesPoblacion = [
    { edad: '60+', mujeresAncho: 1.1, hombresAncho: 0.05 },
    { edad: '40-60', mujeresAncho: 1.4, hombresAncho: 0.05 },
    { edad: '20-40', mujeresAncho: 1.7, hombresAncho: 0.12 },
    { edad: '0-20', mujeresAncho: 1.3, hombresAncho: 0.02 },
  ];

  const altoBarra = 0.42;
  const profundidadBarra = 0.5;

  nivelesPoblacion.forEach((nivel, idx) => {
    const yPos = idx * (altoBarra + 0.12) + altoBarra / 2 + 0.1;
    const respiracionNivel = 1.0 + Math.sin(tiempoSegundos * 3.0 + idx) * 0.03;

    // Barra Mujeres
    const geomMujeres = new THREE.BoxGeometry(
      nivel.mujeresAncho * respiracionNivel,
      altoBarra,
      profundidadBarra
    );
    const matMujeres = new THREE.MeshStandardMaterial({
      color: new THREE.Color(o.colorMujeres),
      emissive: new THREE.Color(o.colorMujeres),
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.1,
    });
    const barraM = new THREE.Mesh(geomMujeres, matMujeres);
    barraM.position.set(nivel.mujeresAncho / 2 + 0.05, yPos, 0);
    gPiramide.add(barraM);

    // Barra Hombres (El único hombre en nivel 2)
    const esElUnico = idx === 2;
    const pulsoHombre = esElUnico ? 0.6 + Math.sin(tiempoSegundos * 8.0) * 0.4 : 0;

    const geomHombres = new THREE.BoxGeometry(
      nivel.hombresAncho,
      altoBarra,
      profundidadBarra
    );
    const matHombres = new THREE.MeshStandardMaterial({
      color: esElUnico ? new THREE.Color(o.colorHombres) : new THREE.Color('#334155'),
      emissive: esElUnico ? new THREE.Color(o.colorHombres) : new THREE.Color('#000000'),
      emissiveIntensity: pulsoHombre,
      roughness: esElUnico ? 0.2 : 0.8,
    });
    const barraH = new THREE.Mesh(geomHombres, matHombres);
    barraH.position.set(-nivel.hombresAncho / 2 - 0.05, yPos, 0);
    gPiramide.add(barraH);

    // Indicador amarillo rebotando con vigor
    if (esElUnico) {
      const rebote = Math.abs(Math.sin(tiempoSegundos * 6.0)) * 0.25;
      const geomPin = new THREE.ConeGeometry(0.1, 0.24, 8);
      const matPin = new THREE.MeshBasicMaterial({ color: new THREE.Color('#facc15') });
      const pin = new THREE.Mesh(geomPin, matPin);
      pin.rotation.z = Math.PI;
      pin.position.set(-0.15, yPos + altoBarra / 2 + 0.25 + rebote, 0);
      gPiramide.add(pin);
    }
  });

  grupo.add(gPiramide);

  // ── 5. CÁMARA EN SOBREVUELO FLUIDO CONTINUO (ORBITAL SWEEP) ───────────────
  const velocidadCamara = tiempoSegundos * 0.35;
  const radioCamara = 6.2 + Math.sin(tiempoSegundos * 0.7) * 0.5;
  const camX = Math.sin(velocidadCamara) * 1.8;
  const camY = 1.8 + Math.cos(tiempoSegundos * 0.8) * 0.4;
  const camZ = 6.2 - Math.cos(velocidadCamara) * 0.8;

  const posicionCamara = new THREE.Vector3(camX, camY, camZ);
  const targetCamara = new THREE.Vector3(
    Math.sin(tiempoSegundos * 0.5) * 0.2,
    1.45,
    0
  );

  return {
    grupo,
    luces,
    posicionCamara,
    targetCamara,
  };
}
