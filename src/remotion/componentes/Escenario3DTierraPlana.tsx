import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Escenario3DProps {
  frame: number;
  tipoEscena: string; // 'hook', 'dato_grande', 'consecuencia', 'giro', 'cierre'
  width?: number;
  height?: number;
}

/**
 * Escenario 3D Cinematográfico Multiescena con Three.js
 * Genera 5 mundos visuales hiperdinámicos con movimientos continuos de cámara,
 * personajes humanoides animados, ciudades con calles/farolas, cataclismos físicos y el abismo antártico.
 */
export const Escenario3DTierraPlana: React.FC<Escenario3DProps> = ({
  frame,
  tipoEscena,
  width = 1080,
  height = 1920,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Escena y Renderizador Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;

    // Iluminación cinemática global
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(25, 45, 20);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4); // Rim light cian cinematográfico
    rimLight.position.set(-25, 20, -25);
    scene.add(rimLight);

    // =========================================================================
    // HELPER: CREADOR DE PERSONAJES HUMANOIDES ARTICULADOS
    // =========================================================================
    function crearHumanoide(
      x: number,
      y: number,
      z: number,
      colorRopa: number,
      inclinacionZ: number = 0,
      animCycleOffset: number = 0,
      scale: number = 1
    ) {
      const charGroup = new THREE.Group();
      charGroup.position.set(x, y, z);
      charGroup.scale.set(scale, scale, scale);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.6, 8);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: colorRopa,
        roughness: 0.5,
        metalness: 0.1,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.65;
      charGroup.add(torso);

      // Cabeza
      const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffdbac, // Tono piel cálido
        roughness: 0.6,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.08;
      charGroup.add(head);

      // Pelo / Gorro
      const hairGeo = new THREE.SphereGeometry(0.17, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 1.14;
      charGroup.add(hair);

      // Brazos articulados con balanceo
      const armGeo = new THREE.BoxGeometry(0.09, 0.45, 0.09);
      const armMat = new THREE.MeshStandardMaterial({ color: colorRopa, roughness: 0.6 });

      const armL = new THREE.Mesh(armGeo, armMat);
      armL.position.set(-0.25, 0.65, 0);
      const swingL = Math.sin(frame * 0.18 + animCycleOffset) * 0.55;
      armL.rotation.x = swingL;
      charGroup.add(armL);

      const armR = new THREE.Mesh(armGeo, armMat);
      armR.position.set(0.25, 0.65, 0);
      armR.rotation.x = -swingL;
      charGroup.add(armR);

      // Piernas articuladas con paso
      const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.1, 0.25, 0);
      legL.rotation.x = -swingL * 0.8;
      charGroup.add(legL);

      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.1, 0.25, 0);
      legR.rotation.x = swingL * 0.8;
      charGroup.add(legR);

      // Sombra proyectada en suelo
      const shadowGeo = new THREE.CircleGeometry(0.25, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.01;
      charGroup.add(shadow);

      // Inclinación dramática por gravedad
      charGroup.rotation.z = inclinacionZ;

      return charGroup;
    }

    // =========================================================================
    // HELPER: CAMPO ESTELAR Y NEBULOSA CÓSMICA
    // =========================================================================
    function agregarCosmos(scene: THREE.Scene, numStars: number = 2200) {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(numStars * 3);
      const starColors = new Float32Array(numStars * 3);

      for (let i = 0; i < numStars * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 450;
        starPos[i + 1] = (Math.random() - 0.5) * 450;
        starPos[i + 2] = (Math.random() - 0.5) * 450;

        // Estrellas blancas, cian y doradas
        const rColor = Math.random();
        if (rColor > 0.7) {
          starColors[i] = 0.4;
          starColors[i + 1] = 0.8;
          starColors[i + 2] = 1.0; // Cian
        } else if (rColor > 0.4) {
          starColors[i] = 1.0;
          starColors[i + 1] = 0.9;
          starColors[i + 2] = 0.5; // Dorado
        } else {
          starColors[i] = 1.0;
          starColors[i + 1] = 1.0;
          starColors[i + 2] = 1.0; // Blanco
        }
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 1.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);
      return stars;
    }

    // =========================================================================
    // ESCENARIO 1: 'hook' (ÓRBITA ESPACIAL DINÁMICA & DISCO PLANETARIO)
    // =========================================================================
    if (tipoEscena === 'hook') {
      scene.fog = new THREE.FogExp2(0x060814, 0.008);
      agregarCosmos(scene, 2500);

      const diskGroup = new THREE.Group();

      // Disco planetario con atmósfera
      const diskGeo = new THREE.CylinderGeometry(15, 15, 1.4, 64);
      const diskMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Océano azul profundo brillante
        roughness: 0.3,
        metalness: 0.4,
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      diskGroup.add(disk);

      // Continentes centrales (relieve verde esmeralda y oro)
      const landGeo = new THREE.CylinderGeometry(10.5, 10.5, 1.5, 48);
      const landMat = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.7,
      });
      const land = new THREE.Mesh(landGeo, landMat);
      diskGroup.add(land);

      // Anillo de Hielo Exterior (Muro de la Antártida)
      const iceRimGeo = new THREE.TorusGeometry(14.6, 0.8, 16, 64);
      const iceRimMat = new THREE.MeshStandardMaterial({
        color: 0xf0fdfa,
        roughness: 0.2,
        metalness: 0.6,
      });
      const iceRim = new THREE.Mesh(iceRimGeo, iceRimMat);
      iceRim.rotation.x = Math.PI / 2;
      diskGroup.add(iceRim);

      // Sol y Luna orbitando sobre el disco
      const sunOrb = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xfde047 })
      );
      const sunAngle = frame * 0.04;
      sunOrb.position.set(Math.cos(sunAngle) * 8, 4.5, Math.sin(sunAngle) * 8);
      diskGroup.add(sunOrb);

      const moonOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
      );
      moonOrb.position.set(Math.cos(sunAngle + Math.PI) * 8, 4.5, Math.sin(sunAngle + Math.PI) * 8);
      diskGroup.add(moonOrb);

      // Rotación suave del disco
      diskGroup.rotation.y = frame * 0.015;
      scene.add(diskGroup);

      // Cámara orbital en acercamiento progresivo
      const t = frame / 120; // 0 a 1
      camera.position.x = Math.sin(frame * 0.02) * 8;
      camera.position.y = 28 - t * 10;
      camera.position.z = 32 - t * 14;
      camera.lookAt(0, 0, 0);
    }

    // =========================================================================
    // ESCENARIO 2: 'dato_grande' (CIUDAD MODERNA A NIVEL DE CALLE & PEATONES)
    // =========================================================================
    else if (tipoEscena === 'dato_grande') {
      scene.fog = new THREE.FogExp2(0x0a0f1d, 0.02);

      // Suelo: Calle / Avenida de asfalto
      const roadGeo = new THREE.PlaneGeometry(16, 80);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      scene.add(road);

      // Líneas viales amarillas discontinuas
      for (let l = -35; l <= 35; l += 5) {
        const lineGeo = new THREE.PlaneGeometry(0.25, 2.5);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.02, l);
        scene.add(line);
      }

      // Aceras a ambos lados
      const sideWalkGeo = new THREE.BoxGeometry(4, 0.3, 80);
      const sideWalkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });

      const swL = new THREE.Mesh(sideWalkGeo, sideWalkMat);
      swL.position.set(-6, 0.15, 0);
      scene.add(swL);

      const swR = new THREE.Mesh(sideWalkGeo, sideWalkMat);
      swR.position.set(6, 0.15, 0);
      scene.add(swR);

      // Rascacielos con ventanas iluminadas a los costados
      for (let b = 0; b < 18; b++) {
        const side = b % 2 === 0 ? -1 : 1;
        const bHeight = 8 + Math.random() * 14;
        const bWidth = 3 + Math.random() * 2;
        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, 5);
        const bMat = new THREE.MeshStandardMaterial({
          color: b % 3 === 0 ? 0x0f172a : 0x1e293b,
          roughness: 0.2,
          metalness: 0.8,
        });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(side * (9 + bWidth / 2), bHeight / 2, (b - 9) * 4.5);
        scene.add(building);

        // Farolas de luz cálida en la acera
        const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(side * 4.3, 2, (b - 9) * 4.5);
        scene.add(pole);

        const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(side * 4.3, 4, (b - 9) * 4.5);
        scene.add(bulb);
      }

      // Multitud de Personajes Humanoides caminando por las aceras
      const colors = [0x38bdf8, 0xef4444, 0xf59e0b, 0x10b981, 0xa855f7, 0xf43f5e];
      for (let p = 0; p < 12; p++) {
        const side = p % 2 === 0 ? -1 : 1;
        const posX = side * (4.8 + (p % 3) * 0.6);
        const posZ = 15 - p * 3.5 + Math.sin(frame * 0.1 + p) * 0.4;
        const color = colors[p % colors.length];
        const walker = crearHumanoide(posX, 0.3, posZ, color, 0, p, 1.1);
        scene.add(walker);
      }

      // Movimiento continuo de cámara tipo dron a nivel de calle
      const camZ = 16 - (frame * 0.12) % 30;
      camera.position.set(Math.sin(frame * 0.04) * 1.2, 3.2, camZ);
      camera.lookAt(0, 2.5, camZ - 14);
    }

    // =========================================================================
    // ESCENARIO 3: 'consecuencia' (CATACLISMO GRAVITACIONAL A 45°-90° & TSUNAMI)
    // =========================================================================
    else if (tipoEscena === 'consecuencia') {
      scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

      // Suelo fuertemente inclinado simulando la pendiente gravitacional hacia el centro
      const slopeGroup = new THREE.Group();

      const groundGeo = new THREE.PlaneGeometry(30, 80);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      slopeGroup.add(ground);

      // Edificios doblándose y cediendo a 45°
      for (let i = 0; i < 14; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const bHeight = 7 + (i % 4) * 3;
        const bGeo = new THREE.BoxGeometry(3.5, bHeight, 4);
        const bMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.7,
        });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(side * 8, bHeight / 2, (i - 7) * 5);
        building.rotation.z = 0.52; // Inclinación violenta hacia el centro
        slopeGroup.add(building);
      }

      // Personajes resbalando y luchando a 45°-60° de inclinación
      const disasterColors = [0xf97316, 0xef4444, 0xeab308, 0x06b6d4, 0xec4899];
      for (let p = 0; p < 10; p++) {
        const posX = (p % 2 === 0 ? -1 : 1) * (2 + (p % 3) * 1.5);
        const posZ = 12 - p * 3.2;
        const color = disasterColors[p % disasterColors.length];
        const inclinedWalker = crearHumanoide(posX, 0.1, posZ, color, 0.75, p * 2, 1.15);
        slopeGroup.add(inclinedWalker);
      }

      // Flechas holográficas 3D de vector de gravedad
      for (let a = -15; a <= 15; a += 6) {
        const arrowGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.position.set(0, 3 + Math.sin(frame * 0.1 + a) * 0.4, a);
        arrow.rotation.z = Math.PI / 2; // Apuntando lateralmente con fuerza
        slopeGroup.add(arrow);
      }

      // Montaña Colosal de Agua (Tsunami Oceánico al fondo)
      const oceanWallGeo = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI);
      const oceanWallMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.6,
        transparent: true,
        opacity: 0.88,
      });
      const oceanWall = new THREE.Mesh(oceanWallGeo, oceanWallMat);
      oceanWall.position.set(-18, 5, -20);
      oceanWall.rotation.y = Math.PI / 2;
      slopeGroup.add(oceanWall);

      scene.add(slopeGroup);

      // Cámara dinámica tipo cámara en mano con temblor sísmico y ángulo holandés (canted)
      const shake = (Math.sin(frame * 0.6) * 0.08);
      camera.position.set(3 + shake, 4.5 + shake, 15 - (frame * 0.08) % 15);
      camera.rotation.z = -0.22; // Inclinación de cámara cinematográfica de tensión
      camera.lookAt(-2, 3, -10);
    }

    // =========================================================================
    // ESCENARIO 4: 'giro' (EL MURO DE HIELO DE LA ANTÁRTIDA & CATARATAS AL VACÍO)
    // =========================================================================
    else if (tipoEscena === 'giro') {
      scene.fog = new THREE.FogExp2(0x040817, 0.012);
      agregarCosmos(scene, 1800);

      // Muro colosal de hielo cristalino (Acantilados glaciares)
      const glacierGroup = new THREE.Group();

      for (let c = 0; c < 12; c++) {
        const cliffHeight = 12 + (c % 3) * 4;
        const cliffGeo = new THREE.CylinderGeometry(2.5, 4, cliffHeight, 7);
        const cliffMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          roughness: 0.2,
          metalness: 0.5,
        });
        const cliff = new THREE.Mesh(cliffGeo, cliffMat);
        const angle = (c / 12) * Math.PI;
        cliff.position.set(Math.cos(angle) * 14, cliffHeight / 2 - 4, Math.sin(angle) * 14);
        glacierGroup.add(cliff);
      }

      // Plataforma superior de hielo
      const iceTopGeo = new THREE.RingGeometry(10, 16, 32);
      const iceTopMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const iceTop = new THREE.Mesh(iceTopGeo, iceTopMat);
      iceTop.rotation.x = -Math.PI / 2;
      iceTop.position.y = 8;
      glacierGroup.add(iceTop);

      // Partículas de cascada de agua vertiéndose al vacío del espacio
      const waterDropCount = 450;
      const dropGeo = new THREE.BufferGeometry();
      const dropPos = new Float32Array(waterDropCount * 3);
      for (let d = 0; d < waterDropCount * 3; d += 3) {
        dropPos[d] = 13 + (Math.random() - 0.5) * 3;
        dropPos[d + 1] = 8 - ((frame * 0.4 + d) % 24); // Cayendo al infinito
        dropPos[d + 2] = (Math.random() - 0.5) * 12;
      }
      dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
      const dropMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.6,
        transparent: true,
        opacity: 0.75,
      });
      const waterFalls = new THREE.Points(dropGeo, dropMat);
      glacierGroup.add(waterFalls);

      // Explorador ártico en el borde mirando hacia el abismo
      const explorer = crearHumanoide(12.5, 8, 1, 0xe11d48, 0, 0, 1.2);
      glacierGroup.add(explorer);

      scene.add(glacierGroup);

      // Cámara en barrido panorámico circular sobre el abismo helado
      const camAngle = frame * 0.025;
      camera.position.set(Math.cos(camAngle) * 22, 12 + Math.sin(frame * 0.03) * 2, Math.sin(camAngle) * 22);
      camera.lookAt(10, 4, 0);
    }

    // =========================================================================
    // ESCENARIO 5: 'cierre' (RADIACIÓN SOLAR, ESPIRAL CINEMÁTICA Y LOOP)
    // =========================================================================
    else {
      scene.fog = new THREE.FogExp2(0x180505, 0.01);
      agregarCosmos(scene, 2000);

      const endGroup = new THREE.Group();

      // Disco planetario visto desde arriba
      const earthDisk = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 14, 1, 48),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 })
      );
      endGroup.add(earthDisk);

      // Anillos de choque de viento solar / radiación cósmica
      for (let r = 1; r <= 4; r++) {
        const waveRadius = 15 + ((frame * 0.2 + r * 5) % 20);
        const ringGeo = new THREE.TorusGeometry(waveRadius, 0.25, 8, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: r % 2 === 0 ? 0xf97316 : 0xef4444,
          transparent: true,
          opacity: Math.max(0, 1 - waveRadius / 35),
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        endGroup.add(ring);
      }

      scene.add(endGroup);

      // Cámara en rotación espiral continua (corkscrew flyout) creando efecto hipnótico de cierre
      const spin = frame * 0.035;
      const dist = 24 + (frame * 0.08) % 12;
      camera.position.set(Math.sin(spin) * dist, 28, Math.cos(spin) * dist);
      camera.lookAt(0, 0, 0);
    }

    // Renderizar frame exacto
    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
    };
  }, [frame, tipoEscena, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
};
