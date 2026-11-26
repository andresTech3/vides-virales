// Lorakh Short: 80s Cartoon 3D short in the stylized flat-bean-head style.
// Setting: High-end Disco / Nightclub comparing cheap fragrance vs Lorakh Eau de Parfum.
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { LorakhWorld } from './world';
import { InkPass, noInkFallback } from './ink';
import { LensBlur } from './lensblur';
import { GradeEffect, GRADES, GRADE_STRENGTH } from './grade';
import { TOTAL, layersAt, dofAt } from './story';
import { Captions } from './Captions';

export const LORAKH_FRAMES = TOTAL;

const makeBloom = () => {
  const b = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 0.7,
    luminanceThreshold: 0.85,
    luminanceSmoothing: 0.25,
    mipmapBlur: true,
    levels: 6,
    radius: 0.7,
  });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3();
const fpt = new THREE.Vector3();

const Inner: React.FC<{ shotId: number }> = ({ shotId }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new LorakhWorld(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 22, nearScale: 1.1 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.golden, GRADE_STRENGTH.golden),
  }), [camera, scene]);

  useEffect(() => () => {
    if (typeof fx.ink?.dispose === 'function') fx.ink.dispose();
  }, [fx]);

  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      {(<primitive object={fx.ink} dispose={null} />) as any}
      {(<primitive object={fx.lens.pre} dispose={null} />) as any}
      {(<primitive object={fx.lens.main} dispose={null} />) as any}
      {(<primitive object={fx.bloom} dispose={null} />) as any}
      <primitive object={fx.tone} dispose={null} />
      {(<primitive object={fx.grade} dispose={null} />) as any}
    </EffectComposer>
  ), [fx]);

  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(shotId, f, cam, scene));
  noInkFallback(world.root);

  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.blurSize;

  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const ShotView: React.FC<{ shotId: number; alpha: number }> = ({ shotId, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas
      width={1080}
      height={1920}
      shadows
      gl={{
        antialias: false,
        stencil: false,
        powerPreference: 'high-performance',
        toneMappingExposure: 1.1,
      }}
      camera={{ fov: 46, near: 0.2, far: 1500 }}
    >
      <Inner shotId={shotId} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const LorakhShort: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#0a0914' }}>
      <Audio src={staticFile('lorakh/full_audio_mix.mp3')} />
      {layersAt(f).map((l, i) => (
        <ShotView key={i ? 'over' : 'base'} shotId={l.id} alpha={l.alpha} />
      ))}
      <Captions />
    </AbsoluteFill>
  );
};

