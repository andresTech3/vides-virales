// Lorakh Entrevista Pro: 3D Cartoon Bean-Head Character Short in Corporate Setting.
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio, interpolate, spring, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { EntrevistaWorld } from './world';
import { InkPass, noInkFallback } from './ink';
import { LensBlur } from './lensblur';
import { GradeEffect, GRADES, GRADE_STRENGTH } from './grade';
import { TOTAL, shotAt, dofAt } from './story';
import { Captions } from './Captions';

export const LORAKH_ENTREVISTA_PRO_FRAMES = TOTAL;

const makeBloom = () => {
  const b = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 0.65,
    luminanceThreshold: 0.85,
    luminanceSmoothing: 0.25,
    mipmapBlur: true,
    levels: 5,
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
  const world = useMemo(() => new EntrevistaWorld(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  const fx = useMemo(
    () => ({
      ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
      lens: new LensBlur({ maxCoC: 16, nearScale: 1.1 }),
      bloom: makeBloom(),
      tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      grade: new GradeEffect(GRADES.golden, GRADE_STRENGTH.golden),
    }),
    [camera, scene]
  );

  useEffect(() => () => {
    if (typeof fx.ink?.dispose === 'function') fx.ink.dispose();
  }, [fx]);

  const post = useMemo(
    () => (
      <EffectComposer multisampling={0}>
        {(<primitive object={fx.ink} dispose={null} />) as any}
        {(<primitive object={fx.lens.pre} dispose={null} />) as any}
        {(<primitive object={fx.lens.main} dispose={null} />) as any}
        {(<primitive object={fx.bloom} dispose={null} />) as any}
        <primitive object={fx.tone} dispose={null} />
        {(<primitive object={fx.grade} dispose={null} />) as any}
      </EffectComposer>
    ),
    [fx]
  );

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

// Motion UI Overlays (Countdown Badge in Shot 1, Showcase HUD in Shot 6)
const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Top Countdown Badge (Shot 1: 0 - 204 frames)
  const isShot1 = f >= 0 && f < 204;
  const shot1Opacity = isShot1
    ? interpolate(f, [0, 15, 185, 204], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // 2. Showcase HUD (Shot 6: 1224 - 1440 frames)
  const isShot6 = f >= 1224;
  const shot6Rel = Math.max(0, f - 1224);
  const shot6Enter = spring({ frame: shot6Rel, fps, config: { damping: 14 } });
  const shot6Opacity = isShot6
    ? interpolate(f, [1224, 1240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top Countdown Pill in Shot 1 */}
      {isShot1 && (
        <div
          style={{
            position: 'absolute',
            top: 42,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: shot1Opacity,
          }}
        >
          <div
            style={{
              padding: '12px 30px',
              borderRadius: 30,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1.5px solid rgba(212, 175, 55, 0.6)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>⏱️</span>
            <span
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 22,
                color: '#ffffff',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              5 Minutos Antes • La Entrevista
            </span>
          </div>
        </div>
      )}

      {/* Finale Showcase Overlay in Shot 6 */}
      {isShot6 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '100px 50px 180px 50px',
            opacity: shot6Opacity,
            transform: `scale(${interpolate(shot6Enter, [0, 1], [0.94, 1])})`,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'serif',
                fontSize: 26,
                letterSpacing: 6,
                color: '#d4af37',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              LORAKH FRAGRANCE HOUSE
            </div>
            <div
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 44,
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              }}
            >
              ¿Cuál eliges para que te recuerden?
            </div>
          </div>

          {/* Product Cards at Mid-Bottom */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: 20,
              marginBottom: 40,
            }}
          >
            {/* Royal Gold */}
            <div
              style={{
                flex: 1,
                padding: '18px 14px',
                borderRadius: 20,
                background: 'rgba(217, 119, 6, 0.18)',
                border: '1.5px solid rgba(245, 158, 11, 0.7)',
                backdropFilter: 'blur(8px)',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)',
              }}
            >
              <div
                style={{
                  fontFamily: 'serif',
                  fontWeight: 800,
                  fontSize: 26,
                  color: '#fbbf24',
                  letterSpacing: 2,
                }}
              >
                ROYAL GOLD
              </div>
              <div
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#fef3c7',
                  marginTop: 4,
                }}
              >
                Ámbar & Cedro • Liderazgo
              </div>
            </div>

            {/* Sapphire Ice */}
            <div
              style={{
                flex: 1,
                padding: '18px 14px',
                borderRadius: 20,
                background: 'rgba(2, 132, 199, 0.18)',
                border: '1.5px solid rgba(56, 189, 248, 0.7)',
                backdropFilter: 'blur(8px)',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(56, 189, 248, 0.25)',
              }}
            >
              <div
                style={{
                  fontFamily: 'serif',
                  fontWeight: 800,
                  fontSize: 26,
                  color: '#38bdf8',
                  letterSpacing: 2,
                }}
              >
                SAPPHIRE ICE
              </div>
              <div
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#e0f2fe',
                  marginTop: 4,
                }}
              >
                Cítrico & Fresco • Confianza
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const LorakhEntrevistaPro: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);

  return (
    <AbsoluteFill style={{ background: '#0a0d14' }}>
      <Audio src={staticFile('lorakh_entrevista_pro/entrevista_pro_audio.mp3')} />
      <ThreeCanvas
        width={1080}
        height={1920}
        gl={{
          antialias: false,
          stencil: false,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.15,
        }}
        camera={{ fov: 46, near: 0.2, far: 1500 }}
      >
        <Inner shotId={shot.id} />
      </ThreeCanvas>
      <Overlays />
      <Captions />
    </AbsoluteFill>
  );
};
