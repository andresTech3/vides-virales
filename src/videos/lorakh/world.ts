// Lorakh World: Nightclub / Discoteca 3D environment + Billboard Actors + Lights + Post
import * as THREE from 'three';
import { twoTone, untone } from './shade';
import { Pen } from './toon';
import { NOINK } from './ink';
import { Pool, Actor, Fx, lorakhStage, CamInfo, SU } from './cast';
import { FPS, SHOTS, cameraAt, lorakhStateAt, ShotDef } from './story';

export function createDiscoMaterials() {
  const floorMat = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x141224,
    })
  );

  const wallMat = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x181628,
    })
  );

  const neonCyan = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
  });

  const neonMagenta = new THREE.MeshBasicMaterial({
    color: 0xff007f,
  });

  const goldLuxury = twoTone(
    new THREE.MeshPhongMaterial({
      color: 0xd4af37,
      specular: 0xffffff,
      shininess: 90,
    })
  );

  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x1b2838,
    specular: 0x88ccff,
    shininess: 100,
    transparent: true,
    opacity: 0.65,
  });

  const perfumeAmber = new THREE.MeshPhongMaterial({
    color: 0xd9822b,
    specular: 0xffe0a0,
    shininess: 120,
    transparent: true,
    opacity: 0.85,
  });

  const perfumeCheap = new THREE.MeshPhongMaterial({
    color: 0x5a738e,
    specular: 0x99bbdd,
    shininess: 40,
    transparent: true,
    opacity: 0.7,
  });

  const counterMat = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x221f38,
    })
  );

  const darkMetal = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x1e1e26,
    })
  );

  const beamMatCyan = new THREE.MeshBasicMaterial({
    color: 0x00d8f0,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const beamMatMagenta = new THREE.MeshBasicMaterial({
    color: 0xff1493,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const beamMatGold = new THREE.MeshBasicMaterial({
    color: 0xffbb33,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return {
    floorMat,
    wallMat,
    neonCyan,
    neonMagenta,
    goldLuxury,
    glassMat,
    perfumeAmber,
    perfumeCheap,
    counterMat,
    darkMetal,
    beamMatCyan,
    beamMatMagenta,
    beamMatGold,
  };
}

export type DiscoMaterials = ReturnType<typeof createDiscoMaterials>;

export class LorakhWorld {
  public root: THREE.Group;
  public mats: DiscoMaterials;
  public spotBeams: THREE.Mesh[] = [];
  public neonStrips: THREE.Mesh[] = [];
  public discoBall?: THREE.Mesh;
  public perfumeCheapGroup?: THREE.Group;
  public perfumeLorakhGroup?: THREE.Group;
  public djTurntables?: THREE.Group;
  public speakerPulsers: THREE.Mesh[] = [];

  // Iluminación
  private hemi: THREE.HemisphereLight;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.PointLight;
  private neonClubLight: THREE.PointLight;
  private fog: THREE.Fog;

  // Repositorio de actores 2D (billboards)
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];

  constructor() {
    this.root = new THREE.Group();
    this.mats = createDiscoMaterials();

    // Luces de ambiente discoteca
    this.hemi = new THREE.HemisphereLight(0x2a1f4d, 0x0a0914, 1.2);
    this.root.add(this.hemi);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    this.keyLight.position.set(4, 10, 6);
    this.root.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x00f0ff, 1.5, 20);
    this.fillLight.position.set(-4, 5, 2);
    this.root.add(this.fillLight);

    this.neonClubLight = new THREE.PointLight(0xff007f, 2.0, 25);
    this.neonClubLight.position.set(3, 4, -2);
    this.root.add(this.neonClubLight);

    this.fog = new THREE.Fog(0x100e1c, 10, 45);

    this.buildClub();
  }

  private buildClub() {
    // 1. Suelo del Club (pista de baile con brillo uniforme)
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floor = new THREE.Mesh(floorGeo, this.mats.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    this.root.add(floor);

    // 2. Pared trasera de la discoteca
    const backWallGeo = new THREE.BoxGeometry(26, 12, 0.6);
    const backWall = new THREE.Mesh(backWallGeo, this.mats.wallMat);
    backWall.position.set(0, 6, -7);
    this.root.add(backWall);

    // Paredes laterales
    const sideWallGeo = new THREE.BoxGeometry(0.6, 12, 22);
    const leftWall = new THREE.Mesh(sideWallGeo, this.mats.wallMat);
    leftWall.position.set(-10, 6, 2);
    this.root.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, this.mats.wallMat);
    rightWall.position.set(10, 6, 2);
    this.root.add(rightWall);

    // Tiras de Neón en pared trasera
    for (let i = -4; i <= 4; i++) {
      const vStripGeo = new THREE.BoxGeometry(0.08, 6.0, 0.05);
      const isCyan = Math.abs(i) % 2 === 0;
      const vStrip = new THREE.Mesh(vStripGeo, isCyan ? this.mats.neonCyan : this.mats.neonMagenta);
      vStrip.position.set(i * 1.8, 5.0, -6.68);
      this.root.add(vStrip);
      this.neonStrips.push(vStrip);
    }

    const topNeonGeo = new THREE.BoxGeometry(16, 0.1, 0.05);
    const topNeon = new THREE.Mesh(topNeonGeo, this.mats.neonCyan);
    topNeon.position.set(0, 8.1, -6.68);
    this.root.add(topNeon);

    // 3. Cabina de DJ en el fondo elevado
    const djStageGeo = new THREE.BoxGeometry(5.8, 0.7, 3.2);
    const djStage = new THREE.Mesh(djStageGeo, this.mats.counterMat);
    djStage.position.set(0, 0.35, -5.2);
    this.root.add(djStage);

    const djBoothGeo = new THREE.BoxGeometry(3.8, 1.15, 1.3);
    const djBooth = new THREE.Mesh(djBoothGeo, this.mats.darkMetal);
    djBooth.position.set(0, 1.25, -5.0);
    this.root.add(djBooth);

    const djFrontNeonGeo = new THREE.BoxGeometry(3.82, 0.08, 0.05);
    const djFrontNeon = new THREE.Mesh(djFrontNeonGeo, this.mats.neonMagenta);
    djFrontNeon.position.set(0, 1.4, -4.33);
    this.root.add(djFrontNeon);

    // Platos giratorios y mezclador
    this.djTurntables = new THREE.Group();
    const platGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.04, 24);
    const platMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 80 });

    const platLeft = new THREE.Mesh(platGeo, platMat);
    platLeft.position.set(-0.95, 1.84, -4.9);
    this.djTurntables.add(platLeft);

    const platRight = new THREE.Mesh(platGeo, platMat);
    platRight.position.set(0.95, 1.84, -4.9);
    this.djTurntables.add(platRight);

    const mixerGeo = new THREE.BoxGeometry(0.7, 0.06, 0.65);
    const mixer = new THREE.Mesh(mixerGeo, this.mats.darkMetal);
    mixer.position.set(0, 1.84, -4.9);
    this.djTurntables.add(mixer);

    this.root.add(this.djTurntables);

    // Altavoces gigantes
    [-4.0, 4.0].forEach((xPos) => {
      const spkGeo = new THREE.BoxGeometry(1.3, 3.4, 1.3);
      const spk = new THREE.Mesh(spkGeo, this.mats.darkMetal);
      spk.position.set(xPos, 1.7, -5.2);
      this.root.add(spk);

      [1.0, 2.0, 2.8].forEach((yPos, coneIdx) => {
        const coneRadius = coneIdx === 2 ? 0.24 : 0.42;
        const coneGeo = new THREE.CylinderGeometry(coneRadius, coneRadius * 0.7, 0.06, 24);
        coneGeo.rotateX(Math.PI / 2);
        const coneMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(xPos, yPos, -4.53);
        this.root.add(cone);
        this.speakerPulsers.push(cone);
      });
    });

    // 4. Barra del Club (a la derecha)
    const barCounterGeo = new THREE.BoxGeometry(1.2, 1.15, 6.4);
    const barCounter = new THREE.Mesh(barCounterGeo, this.mats.counterMat);
    barCounter.position.set(7.0, 0.58, 0.5);
    this.root.add(barCounter);

    const barTopGeo = new THREE.BoxGeometry(1.4, 0.08, 6.6);
    const barTop = new THREE.Mesh(barTopGeo, this.mats.glassMat);
    barTop.position.set(7.0, 1.18, 0.5);
    this.root.add(barTop);

    const barNeonGeo = new THREE.BoxGeometry(0.06, 0.06, 6.4);
    const barNeon = new THREE.Mesh(barNeonGeo, this.mats.neonCyan);
    barNeon.position.set(6.25, 1.12, 0.5);
    this.root.add(barNeon);

    // Botellas brillantes en estantes
    const shelfGeo = new THREE.BoxGeometry(0.4, 0.06, 5.2);
    const shelf1 = new THREE.Mesh(shelfGeo, this.mats.darkMetal);
    shelf1.position.set(9.0, 1.8, 0.5);
    this.root.add(shelf1);

    const shelf2 = new THREE.Mesh(shelfGeo, this.mats.darkMetal);
    shelf2.position.set(9.0, 2.5, 0.5);
    this.root.add(shelf2);

    const bottleColors = [0x00f0ff, 0xff007f, 0xd4af37, 0x00ff88, 0x9933ff];
    for (let b = 0; b < 10; b++) {
      const bColor = bottleColors[b % bottleColors.length];
      const bMat = new THREE.MeshPhongMaterial({
        color: bColor,
        specular: 0xffffff,
        shininess: 90,
        transparent: true,
        opacity: 0.8,
      });
      const bGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.42, 12);
      const bottle = new THREE.Mesh(bGeo, bMat);
      const zOffset = -1.8 + b * 0.46;
      bottle.position.set(9.0, 2.05, zOffset);
      this.root.add(bottle);
    }

    // 5. Tocador / Mesa de presentación de perfumes (a la izquierda)
    const tableGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32);
    const tableMat = twoTone(
      new THREE.MeshLambertMaterial({
        color: 0x1f1b2d,
      })
    );
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(-4.5, 0.9, -1.0);
    this.root.add(table);

    const legGeo = new THREE.CylinderGeometry(0.1, 0.3, 0.9, 16);
    const tableLeg = new THREE.Mesh(legGeo, this.mats.goldLuxury);
    tableLeg.position.set(-4.5, 0.45, -1.0);
    this.root.add(tableLeg);

    const ringGeo = new THREE.TorusGeometry(1.41, 0.02, 8, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringNeon = new THREE.Mesh(ringGeo, this.mats.goldLuxury);
    ringNeon.position.set(-4.5, 0.94, -1.0);
    this.root.add(ringNeon);

    // 6. Frascos de Perfume 3D
    this.buildPerfumes();

    // 7. Focos volumétricos
    this.buildSpotlights();

    // 8. Bola de discoteca
    const ballGeo = new THREE.SphereGeometry(0.75, 24, 16);
    const ballMat = new THREE.MeshPhongMaterial({
      color: 0xddeeff,
      specular: 0xffffff,
      shininess: 120,
    });
    this.discoBall = new THREE.Mesh(ballGeo, ballMat);
    this.discoBall.position.set(0, 6.4, 0);
    this.root.add(this.discoBall);

    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.5, 8);
    const rod = new THREE.Mesh(rodGeo, this.mats.darkMetal);
    rod.position.set(0, 8.2, 0);
    this.root.add(rod);
  }

  private buildPerfumes() {
    // Frasco Barato (izquierda: x = -5.0, z = -1.0)
    this.perfumeCheapGroup = new THREE.Group();
    const cheapBodyGeo = new THREE.BoxGeometry(0.26, 0.44, 0.18);
    const cheapBody = new THREE.Mesh(cheapBodyGeo, this.mats.perfumeCheap);
    cheapBody.position.y = 0.22;
    this.perfumeCheapGroup.add(cheapBody);

    const cheapCapGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.12, 16);
    const cheapCap = new THREE.Mesh(cheapCapGeo, this.mats.darkMetal);
    cheapCap.position.y = 0.5;
    this.perfumeCheapGroup.add(cheapCap);

    this.perfumeCheapGroup.position.set(-5.0, 0.95, -1.0);
    this.root.add(this.perfumeCheapGroup);

    // Frasco Lorakh (derecha: x = -4.0, z = -1.0)
    this.perfumeLorakhGroup = new THREE.Group();
    const lorakhBodyGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.48, 8);
    const lorakhBody = new THREE.Mesh(lorakhBodyGeo, this.mats.perfumeAmber);
    lorakhBody.position.y = 0.24;
    this.perfumeLorakhGroup.add(lorakhBody);

    const lorakhCollarGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.08, 16);
    const lorakhCollar = new THREE.Mesh(lorakhCollarGeo, this.mats.goldLuxury);
    lorakhCollar.position.y = 0.5;
    this.perfumeLorakhGroup.add(lorakhCollar);

    const lorakhCapGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.18, 16);
    const lorakhCap = new THREE.Mesh(lorakhCapGeo, this.mats.goldLuxury);
    lorakhCap.position.y = 0.61;
    this.perfumeLorakhGroup.add(lorakhCap);

    const pedestalGeo = new THREE.CylinderGeometry(0.3, 0.34, 0.06, 24);
    const pedestal = new THREE.Mesh(pedestalGeo, this.mats.goldLuxury);
    pedestal.position.y = 0.03;
    this.perfumeLorakhGroup.add(pedestal);

    this.perfumeLorakhGroup.position.set(-4.0, 0.95, -1.0);
    this.root.add(this.perfumeLorakhGroup);
  }

  private buildSpotlights() {
    const lampConfigs = [
      { pos: new THREE.Vector3(-4.2, 7.0, -2), rotZ: -0.22, rotX: 0.2 },
      { pos: new THREE.Vector3(-1.6, 7.0, -1), rotZ: 0.16, rotX: 0.25 },
      { pos: new THREE.Vector3(1.6, 7.0, -1), rotZ: -0.16, rotX: 0.25 },
      { pos: new THREE.Vector3(4.2, 7.0, -2), rotZ: 0.25, rotX: 0.2 },
    ];

    lampConfigs.forEach((cfg) => {
      const lampGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.45, 16);
      const lamp = new THREE.Mesh(lampGeo, this.mats.darkMetal);
      lamp.position.copy(cfg.pos);
      lamp.rotation.z = cfg.rotZ;
      lamp.rotation.x = cfg.rotX;
      this.root.add(lamp);
    });
  }

  private actor(i: number) {
    while (this.actors.length <= i) this.actors.push(new Actor(this.root));
    return this.actors[i];
  }

  private fx(i: number) {
    while (this.fxs.length <= i) this.fxs.push(new Fx(this.root));
    return this.fxs[i];
  }

  public update(shotId: number, frame: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): THREE.Vector3 {
    const t = frame / FPS;
    const c = cameraAt(frame);

    // Cámara con ángulos amplios (safe zone para no cortar a los personajes)
    cam.position.copy(c.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(c.look);
    if (c.roll) cam.rotateZ(c.roll);
    cam.fov = c.fov;
    cam.near = 0.2;
    cam.far = 1500;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    cam.layers.enable(NOINK);

    // Niebla de discoteca estilizada
    scene.fog = this.fog;
    scene.background = new THREE.Color(0x0a0914);

    if (this.discoBall) {
      this.discoBall.rotation.y = t * 0.4;
    }

    const pulse = 1.0 + Math.sin(t * Math.PI * 4) * 0.05;
    this.speakerPulsers.forEach((cone) => {
      cone.scale.set(pulse, pulse, 1.0);
    });

    // Información de cámara para cálculo de iluminación y facing
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const camInfo: CamInfo = {
      pos: cam.position,
      right: camRight,
    };

    // Staging de personajes y efectos
    const lst = lorakhStateAt(frame);
    const stage = lorakhStage(shotId, t, lst, camInfo);

    // Actualizar personajes
    for (let i = 0; i < stage.places.length; i++) {
      const p = stage.places[i];
      const a = this.actor(i);
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.y = p.yaw ?? 0;
      a.mesh.scale.set(p.scale ?? 1, p.scale ?? 1, 1);
      a.mesh.visible = true;
      const [w, h, k] = p.size ?? [1080, 1800, 1.8];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
    }
    for (let i = stage.places.length; i < this.actors.length; i++) {
      this.actors[i].mesh.visible = false;
    }

    // Actualizar efectos visuales (auras, estrellas, nubes)
    for (let i = 0; i < stage.fx.length; i++) {
      const f = stage.fx[i];
      const x = this.fx(i);
      x.mesh.position.set(f.x, f.y, f.z);
      x.mesh.scale.set(f.w, f.h, 1);
      x.use(!!f.soft);
      if (f.rot) x.mesh.rotation.z = f.rot;
      if (f.flat) x.mesh.rotation.x = -Math.PI / 2;
      else x.mesh.rotation.x = 0;
      x.mesh.visible = true;
      x.r = this.pool.req(f.key, f.cw, f.ch, 1, f.draw);
    }
    for (let i = stage.fx.length; i < this.fxs.length; i++) {
      this.fxs[i].mesh.visible = false;
    }

    // Renderizar texturas en canvas 2D
    this.pool.flush();
    for (const a of this.actors) a.bind();
    for (const x of this.fxs) x.bind();

    return c.look;
  }
}
