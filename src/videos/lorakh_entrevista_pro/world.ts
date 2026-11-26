// Corporate Skyscraper Executive Lobby 3D Environment & Billboard Actors.
import * as THREE from 'three';
import { twoTone } from './shade';
import { Pen, bodyFront, fxStars, fxPuff, fxBurst } from './toon';
import { NOINK } from './ink';
import { Pool, Actor, Fx, CANDIDATE_CHEAP, CANDIDATE_LORAKH, RECEPTIONIST, BOSS_DIRECTOR } from './cast';
import { FPS, cameraAt } from './story';

export function createCorporateMaterials() {
  const floorMarble = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x111622, // Deep navy executive polished marble
    })
  );

  const wallPanels = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x1e1713, // Rich dark walnut acoustic wood
    })
  );

  const wallConcrete = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x161b26,
    })
  );

  const glassWindow = new THREE.MeshPhongMaterial({
    color: 0x60a5fa,
    specular: 0xffffff,
    shininess: 120,
    transparent: true,
    opacity: 0.35,
  });

  const doorGlass = new THREE.MeshPhongMaterial({
    color: 0x1e293b,
    specular: 0x94a3b8,
    shininess: 90,
    transparent: true,
    opacity: 0.75,
  });

  const goldLuxury = twoTone(
    new THREE.MeshPhongMaterial({
      color: 0xc69b35,
      specular: 0xfff0c0,
      shininess: 110,
    })
  );

  const darkMetal = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x181e2b,
    })
  );

  const perfumeAmber = new THREE.MeshPhongMaterial({
    color: 0xd97706,
    specular: 0xfde68a,
    shininess: 140,
    transparent: true,
    opacity: 0.88,
  });

  const perfumeIce = new THREE.MeshPhongMaterial({
    color: 0x0284c7,
    specular: 0xe0f2fe,
    shininess: 140,
    transparent: true,
    opacity: 0.88,
  });

  const deskMat = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x0f172a,
    })
  );

  const benchMat = twoTone(
    new THREE.MeshLambertMaterial({
      color: 0x1e293b,
    })
  );

  return {
    floorMarble,
    wallPanels,
    wallConcrete,
    glassWindow,
    doorGlass,
    goldLuxury,
    darkMetal,
    perfumeAmber,
    perfumeIce,
    deskMat,
    benchMat,
  };
}

export class EntrevistaWorld {
  public root: THREE.Group;
  public mats: ReturnType<typeof createCorporateMaterials>;
  private hemi: THREE.HemisphereLight;
  private sunKey: THREE.DirectionalLight;
  private officeFill: THREE.PointLight;
  private windowRimLight: THREE.DirectionalLight;
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];

  // Scenery props
  public doorWing?: THREE.Group;
  public secondHand?: THREE.Mesh;
  public waitingBench?: THREE.Group;
  public tableGroup?: THREE.Group;
  public goldBottle?: THREE.Group;
  public iceBottle?: THREE.Group;

  constructor() {
    this.root = new THREE.Group();
    this.mats = createCorporateMaterials();

    // Balanced Lighting for High-End Corporate Architecture
    this.hemi = new THREE.HemisphereLight(0xdbeafe, 0x0a0f1d, 1.3);
    this.root.add(this.hemi);

    this.sunKey = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.sunKey.position.set(4, 10, 6);
    this.root.add(this.sunKey);

    this.officeFill = new THREE.PointLight(0x38bdf8, 1.2, 25);
    this.officeFill.position.set(-3.5, 4, 1.5);
    this.root.add(this.officeFill);

    this.windowRimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    this.windowRimLight.position.set(8, 6, -2);
    this.root.add(this.windowRimLight);

    this.buildLobbyArchitecture();
  }

  private buildLobbyArchitecture() {
    // 1. Floor: Polished Navy Marble Lobby with Gold Inlay Grid
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floor = new THREE.Mesh(floorGeo, this.mats.floorMarble);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.root.add(floor);

    // Marble floor subtle tile seams
    const gridHelper = new THREE.GridHelper(24, 8, 0xc69b35, 0x1e293b);
    gridHelper.position.y = 0.005;
    this.root.add(gridHelper);

    // 2. Back Wall (Dark Walnut Wood Acoustic Slats)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 9, 0.3), this.mats.wallPanels);
    backWall.position.set(0, 4.5, -3.2);
    this.root.add(backWall);

    // Walnut acoustic vertical slats
    const slatMat = new THREE.MeshLambertMaterial({ color: 0x120d0a });
    for (let x = -8; x <= 8; x += 0.35) {
      // Leave center gap for door and right gap for panoramic window
      if (x > -1.2 && x < 1.2) continue; // Door area
      if (x > 1.8) continue; // Window area
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.035, 8.8, 0.04), slatMat);
      slat.position.set(x, 4.5, -3.03);
      this.root.add(slat);
    }

    // 3. Boardroom Doorway in Center (Real Architectural Door Frame, NOT solid yellow!)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, -3.1);

    // Dark bronze / charcoal door surround frame (lintel and posts)
    const postMat = this.mats.darkMetal;
    const trimMat = this.mats.goldLuxury;

    // Left post
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.16), postMat);
    leftPost.position.set(-1.0, 1.8, 0);
    doorGroup.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.16), postMat);
    rightPost.position.set(1.0, 1.8, 0);
    doorGroup.add(rightPost);

    // Top lintel
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.14, 0.16), postMat);
    lintel.position.set(0, 3.65, 0);
    doorGroup.add(lintel);

    // Gold trim inner bevels
    const goldTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.6, 0.02), trimMat);
    goldTrimL.position.set(-0.93, 1.8, 0.08);
    doorGroup.add(goldTrimL);

    const goldTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.6, 0.02), trimMat);
    goldTrimR.position.set(0.93, 1.8, 0.08);
    doorGroup.add(goldTrimR);

    const goldTrimT = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.02, 0.02), trimMat);
    goldTrimT.position.set(0, 3.57, 0.08);
    doorGroup.add(goldTrimT);

    // Interior Boardroom Back Wall (visible through open door)
    const innerRoom = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 4.5),
      new THREE.MeshLambertMaterial({ color: 0x1a2233 })
    );
    innerRoom.position.set(0, 2.2, -4.2);
    doorGroup.add(innerRoom);

    // Interior warm spotlight behind door
    const innerLight = new THREE.PointLight(0xfef08a, 1.5, 6);
    innerLight.position.set(0, 3.2, -3.8);
    doorGroup.add(innerLight);

    // The Movable Door Leaf (frosted smokey glass with gold bar handle)
    const doorWing = new THREE.Group();
    doorWing.position.set(-0.94, 0, 0); // Pivot at left hinge
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.88, 3.5, 0.06), this.mats.doorGlass);
    doorLeaf.position.set(0.94, 1.77, 0);
    doorWing.add(doorLeaf);

    const doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 16), trimMat);
    doorHandle.position.set(1.75, 1.77, 0.06);
    doorWing.add(doorHandle);

    this.doorWing = doorWing;
    doorGroup.add(doorWing);
    this.root.add(doorGroup);

    // 4. Executive Wall Clock directly above door at y = 4.15 (fully visible in frame!)
    const clockGroup = new THREE.Group();
    clockGroup.position.set(0, 4.15, -3.0);

    const clockRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.024, 16, 32), trimMat);
    clockGroup.add(clockRing);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.36, 32),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    clockGroup.add(clockFace);

    // 12 hour ticks
    for (let h = 0; h < 12; h++) {
      const angle = (h / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.045, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x0f172a })
      );
      tick.position.set(Math.sin(angle) * 0.31, Math.cos(angle) * 0.31, 0.015);
      tick.rotation.z = -angle;
      clockGroup.add(tick);
    }

    // Hour hand (pointing at 9 o'clock)
    const hHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.015), this.mats.deskMat);
    hHand.position.set(-0.06, 0.02, 0.02);
    hHand.rotation.z = Math.PI * 0.44;
    clockGroup.add(hHand);

    // Minute hand (at 11 o'clock = 55 minutes)
    const mHand = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.28, 0.015), this.mats.deskMat);
    mHand.position.set(-0.05, 0.11, 0.025);
    mHand.rotation.z = Math.PI * 0.16;
    clockGroup.add(mHand);

    // Red second hand (animated in update)
    const sHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.3, 0.015),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    sHand.position.set(0, 0.09, 0.03);
    this.secondHand = sHand;
    clockGroup.add(sHand);

    // Clock center cap
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16), trimMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.z = 0.035;
    clockGroup.add(pin);

    this.root.add(clockGroup);

    // 5. Panoramic Skyscraper Window in Background on Right Side (x = 2.0 to 7.0)
    const winGroup = new THREE.Group();
    winGroup.position.set(3.8, 4.5, -3.1);

    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 7.8), this.mats.glassWindow);
    winGroup.add(winGlass);

    // Window vertical mullions
    const mullionMat = this.mats.darkMetal;
    const mullion1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 7.8, 0.08), mullionMat);
    mullion1.position.set(-1.2, 0, 0.02);
    winGroup.add(mullion1);

    const mullion2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 7.8, 0.08), mullionMat);
    mullion2.position.set(1.2, 0, 0.02);
    winGroup.add(mullion2);

    this.root.add(winGroup);

    // 3D Skyscraper skyline towers visible outside window
    const skyMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const litWinMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const towersGroup = new THREE.Group();
    towersGroup.position.set(3.8, 0, -6.5);

    const towerConfigs = [
      { x: -1.2, w: 1.4, h: 9.5, z: 0 },
      { x: 0.6, w: 1.8, h: 12.0, z: -1.5 },
      { x: 2.2, w: 1.2, h: 8.5, z: 0.5 },
      { x: -2.4, w: 1.0, h: 7.5, z: -1.0 },
    ];

    towerConfigs.forEach((tc) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(tc.w, tc.h, tc.w), skyMat);
      tower.position.set(tc.x, tc.h / 2, tc.z);
      towersGroup.add(tower);

      // Windows
      for (let wy = 2; wy < tc.h - 1; wy += 0.8) {
        const winBand = new THREE.Mesh(new THREE.BoxGeometry(tc.w * 0.85, 0.12, tc.w * 0.85), litWinMat);
        winBand.position.set(tc.x, wy, tc.z);
        towersGroup.add(winBand);
      }
    });

    this.root.add(towersGroup);

    // 6. Receptionist Desk on Left Side
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-2.8, 0, -1.4);

    const deskBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.0), this.mats.deskMat);
    deskBody.position.y = 0.55;
    deskGroup.add(deskBody);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 1.1), trimMat);
    deskTop.position.y = 1.13;
    deskGroup.add(deskTop);

    // Laptop on desk
    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.02, 0.25),
      new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
    );
    laptop.position.set(0, 1.17, 0);
    deskGroup.add(laptop);

    this.root.add(deskGroup);

    // 7. Executive Waiting Bench (clean modern leather with gold legs)
    const benchGroup = new THREE.Group();
    benchGroup.position.set(0, 0, -0.7);

    const benchCushion = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.22, 0.7), this.mats.benchMat);
    benchCushion.position.y = 0.32;
    benchGroup.add(benchCushion);

    // Gold legs
    const legGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.32, 12);
    [
      [-1.2, -0.25],
      [-1.2, 0.25],
      [1.2, -0.25],
      [1.2, 0.25],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, trimMat);
      leg.position.set(lx, 0.16, lz);
      benchGroup.add(leg);
    });

    this.waitingBench = benchGroup;
    this.root.add(benchGroup);

    // 8. Executive Coffee Table with Lorakh Bottles (Showcase)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 0);

    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32), this.mats.floorMarble);
    tableTop.position.y = 0.52;
    tableGroup.add(tableTop);

    const tableRim = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.02, 8, 32), trimMat);
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.y = 0.52;
    tableGroup.add(tableRim);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.49, 16), trimMat);
    tableLeg.position.y = 0.245;
    tableGroup.add(tableLeg);

    // Royal Gold bottle
    const bg = new THREE.Group();
    const gBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.14), this.mats.perfumeAmber);
    gBody.position.y = 0.19;
    const gCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16), trimMat);
    gCap.position.y = 0.44;
    bg.add(gBody, gCap);
    bg.position.set(-0.35, 0.55, 0.0);
    this.goldBottle = bg;
    tableGroup.add(bg);

    // Sapphire Ice bottle
    const bi = new THREE.Group();
    const iBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.14), this.mats.perfumeIce);
    iBody.position.y = 0.19;
    const iCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16), trimMat);
    iCap.position.y = 0.44;
    bi.add(iBody, iCap);
    bi.position.set(0.35, 0.55, 0.0);
    this.iceBottle = bi;
    tableGroup.add(bi);

    this.tableGroup = tableGroup;
    this.root.add(tableGroup);
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
    const camKey = cameraAt(frame);
    cam.position.copy(camKey.pos);
    cam.fov = camKey.fov;
    cam.updateProjectionMatrix();
    cam.lookAt(camKey.look);
    cam.layers.enable(NOINK);

    scene.background = new THREE.Color(0x0c111d);

    const f = frame;
    const t = f / FPS;

    // 1. Ticking clock second hand
    if (this.secondHand) {
      this.secondHand.rotation.z = -t * Math.PI * 2; // 1 rotation per 60s
    }

    // 2. Door wing animation in shots 4 & 5 (Director opening boardroom door)
    if (this.doorWing) {
      if (f >= 759 && f < 1224) {
        const openProg = Math.min(1, (f - 759) / 25);
        this.doorWing.rotation.y = -openProg * (Math.PI * 0.4);
      } else {
        this.doorWing.rotation.y = 0;
      }
    }

    // 3. Table Group visibility & positioning
    if (this.tableGroup) {
      if (shotId === 6) {
        this.tableGroup.position.set(0.0, 0.0, 0.0);
        this.tableGroup.visible = true;
        if (this.goldBottle) this.goldBottle.rotation.y = Math.sin(t * 1.5) * 0.2;
        if (this.iceBottle) this.iceBottle.rotation.y = -Math.sin(t * 1.5) * 0.2;
      } else {
        this.tableGroup.position.set(0.0, -10.0, 0.0); // Hidden from shots 1-5!
        this.tableGroup.visible = false;
      }
    }

    // Bench visibility
    if (this.waitingBench) {
      this.waitingBench.visible = shotId <= 3;
    }

    const cheapAct = this.actor(0);
    const lorakhAct = this.actor(1);
    const recepAct = this.actor(2);
    const bossAct = this.actor(3);

    const sprayMistFx = this.fx(0);
    const goldAuraFx = this.fx(1);
    const rejectSignFx = this.fx(2);
    const handshakeBurstFx = this.fx(3);

    // Reset visibility
    this.actors.forEach((a) => {
      a.mesh.visible = false;
    });
    this.fxs.forEach((x) => {
      x.mesh.visible = false;
    });

    const humanScale = 0.88;

    // ----------------------------------------------------
    // ACTOR 1: RECEPTIONIST (Visible in shots 1, 2, 3)
    // ----------------------------------------------------
    if (shotId <= 3) {
      recepAct.mesh.visible = true;
      recepAct.mesh.position.set(-2.8, 0.45, -1.4);
      recepAct.mesh.scale.set(humanScale, humanScale, 1);
      recepAct.mesh.quaternion.copy(cam.quaternion);

      const isCoughing = shotId === 2;
      const isHappy = shotId === 3;

      recepAct.r = this.pool.req(
        `recep_${isCoughing ? 'cough' : isHappy ? 'smile' : 'normal'}`,
        480,
        800,
        0.8,
        (p: Pen) => {
          bodyFront(p, RECEPTIONIST, {
            mode: 'sit',
            expr: isCoughing ? 'pained' : isHappy ? 'smile' : 'neutral',
          });
        }
      );
    }

    // ----------------------------------------------------
    // ACTOR 2: CANDIDATE CHEAP
    // ----------------------------------------------------
    if (shotId === 1 || shotId === 2 || shotId === 4) {
      cheapAct.mesh.visible = true;
      cheapAct.mesh.scale.set(humanScale, humanScale, 1);
      cheapAct.mesh.quaternion.copy(cam.quaternion);

      if (shotId === 1) {
        const legJitter = Math.sin(t * 14) * 0.015;
        cheapAct.mesh.position.set(-0.65, 0.35 + legJitter, -0.7);
        cheapAct.r = this.pool.req('cheap_waiting', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_CHEAP, {
            mode: 'sit',
            expr: 'nervous',
          });
        });
      } else if (shotId === 2) {
        cheapAct.mesh.position.set(-0.65, 0.35, -0.7);
        cheapAct.r = this.pool.req('cheap_spraying', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_CHEAP, {
            mode: 'sit',
            expr: 'nervous',
            prop: 'perfume',
          });
        });

        // Spray toxic mist cloud FX
        sprayMistFx.mesh.visible = true;
        sprayMistFx.mesh.position.set(-0.45, 1.05, -0.5);
        sprayMistFx.mesh.quaternion.copy(cam.quaternion);
        sprayMistFx.mesh.scale.set(1.4, 1.4, 1);
        sprayMistFx.use(true);

        const mistPhase = (t * 2.5) % 1.0;
        sprayMistFx.r = this.pool.req(`toxic_mist_${Math.floor(mistPhase * 6)}`, 300, 300, 1.0, (p: Pen) => {
          fxPuff(p, mistPhase);
          p.dot(180, 140, 45, 'rgba(239, 68, 68, 0.35)');
          p.dot(130, 190, 55, 'rgba(148, 163, 184, 0.45)');
        });
      } else if (shotId === 4) {
        cheapAct.mesh.position.set(-0.55, 0.05, -1.2);
        cheapAct.r = this.pool.req('cheap_rejected', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_CHEAP, {
            mode: 'stand',
            expr: 'nervous',
          });
        });

        // Red X Rejection sign FX
        rejectSignFx.mesh.visible = true;
        rejectSignFx.mesh.position.set(-0.55, 1.75, -1.0);
        rejectSignFx.mesh.quaternion.copy(cam.quaternion);
        rejectSignFx.mesh.scale.set(0.9, 0.9, 1);
        rejectSignFx.use(true);

        rejectSignFx.r = this.pool.req('red_x_stamp', 200, 200, 1.0, (p: Pen) => {
          p.stroke(
            [
              [30, 30],
              [170, 170],
            ],
            22,
            '#ef4444'
          );
          p.stroke(
            [
              [170, 30],
              [30, 170],
            ],
            22,
            '#ef4444'
          );
        });
      }
    }

    // ----------------------------------------------------
    // ACTOR 3: CANDIDATE LORAKH
    // ----------------------------------------------------
    if (shotId === 1 || shotId === 3 || shotId === 5) {
      lorakhAct.mesh.visible = true;
      lorakhAct.mesh.scale.set(humanScale, humanScale, 1);
      lorakhAct.mesh.quaternion.copy(cam.quaternion);

      if (shotId === 1) {
        lorakhAct.mesh.position.set(0.65, 0.35, -0.7);
        lorakhAct.r = this.pool.req('lorakh_waiting', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_LORAKH, {
            mode: 'sit',
            expr: 'smile',
          });
        });
      } else if (shotId === 3) {
        lorakhAct.mesh.position.set(0.65, 0.35, -0.7);
        lorakhAct.r = this.pool.req('lorakh_radiating', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_LORAKH, {
            mode: 'sit',
            expr: 'smile',
            prop: 'perfume',
          });
        });

        // Golden aura FX
        goldAuraFx.mesh.visible = true;
        goldAuraFx.mesh.position.set(0.65, 1.05, -0.5);
        goldAuraFx.mesh.quaternion.copy(cam.quaternion);
        goldAuraFx.mesh.scale.set(1.5, 1.5, 1);
        goldAuraFx.use(true);

        const auraPhase = (t * 1.5) % 1.0;
        goldAuraFx.r = this.pool.req(`gold_stars_${Math.floor(auraPhase * 6)}`, 420, 210, 1.0, (p: Pen) => {
          fxStars(p, auraPhase);
          p.dot(210, 105, 75, 'rgba(251, 191, 36, 0.35)');
        });
      } else if (shotId === 5) {
        lorakhAct.mesh.position.set(0.45, 0.05, -1.5);
        lorakhAct.r = this.pool.req('lorakh_handshake', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, CANDIDATE_LORAKH, {
            mode: 'stand',
            expr: 'smile',
          });
        });

        // Handshake burst FX
        handshakeBurstFx.mesh.visible = true;
        handshakeBurstFx.mesh.position.set(0.0, 0.95, -1.3);
        handshakeBurstFx.mesh.quaternion.copy(cam.quaternion);
        handshakeBurstFx.mesh.scale.set(1.1, 1.1, 1);
        handshakeBurstFx.use(true);

        const burstPhase = Math.min(1.0, ((f - 981) % 60) / 45);
        handshakeBurstFx.r = this.pool.req(`handshake_burst_${Math.floor(burstPhase * 6)}`, 500, 500, 1.0, (p: Pen) => {
          fxBurst(p, burstPhase, '#fbbf24', 12, 30, 180);
        });
      }
    }

    // ----------------------------------------------------
    // ACTOR 4: BOSS DIRECTOR (Shots 4 and 5)
    // ----------------------------------------------------
    if (shotId === 4 || shotId === 5) {
      bossAct.mesh.visible = true;
      bossAct.mesh.scale.set(humanScale * 1.02, humanScale * 1.02, 1);
      bossAct.mesh.quaternion.copy(cam.quaternion);

      if (shotId === 4) {
        bossAct.mesh.position.set(0.45, 0.05, -1.5);
        bossAct.r = this.pool.req('boss_disgust', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, BOSS_DIRECTOR, {
            mode: 'stand',
            expr: 'stern',
          });
        });
      } else if (shotId === 5) {
        bossAct.mesh.position.set(-0.45, 0.05, -1.5);
        bossAct.r = this.pool.req('boss_approve', 480, 800, 0.8, (p: Pen) => {
          bodyFront(p, BOSS_DIRECTOR, {
            mode: 'stand',
            expr: 'smile',
          });
        });
      }
    }

    // Flush pool textures and bind
    this.pool.flush();

    for (const a of this.actors) {
      a.bind();
    }
    for (const x of this.fxs) {
      x.bind();
    }

    return camKey.look;
  }
}
