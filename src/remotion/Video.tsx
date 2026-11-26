import React from 'react';
import { useCurrentFrame, useVideoConfig, OffthreadVideo } from 'remotion';
import type { GuionCompleto } from '../esquemas/guion.schema';
import { ESTILOS_PRESETS } from '../estilos';
import { FORMAT_RENDERERS } from '../formatos';
import { KaraokeSubtitles } from './subtitulos/KaraokeSubtitles';
import { SoundDesign } from './componentes/SoundDesign';
import { HyperCameraMove, HyperScreenWarp } from './hyperframes';

export interface VideoProps {
  guion: GuionCompleto;
  audioDataUrl?: string;
  musicaDataUrl?: string;
  sfxMap?: Record<string, string>;
  videoFondoUrl?: string;
}

export const VideoComposition: React.FC<VideoProps> = ({
  guion,
  audioDataUrl,
  musicaDataUrl,
  sfxMap = {},
  videoFondoUrl,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const estilo = ESTILOS_PRESETS[guion.estilo] || ESTILOS_PRESETS.neon_kinetic;
  const Renderer = FORMAT_RENDERERS[guion.formato] || FORMAT_RENDERERS.what_if;

  // Encontrar la escena actual correspondiente a este frame
  const escenaActual =
    guion.escenas.find(
      (e) => frame >= e.inicioFrame && frame < e.inicioFrame + e.duracionFrames
    ) || guion.escenas[guion.escenas.length - 1];

  const frameEnEscena = frame - (escenaActual?.inicioFrame || 0);

  // Recolectar todos los subtítulos del guion completo para sincronización global
  const todosLosSubtitulos = guion.escenas.flatMap((e) => e.subtitulos || []);

  // Barra de progreso viral superior
  const progreso = Math.min(1, Math.max(0, frame / durationInFrames));

  // ── PATTERN INTERRUPT 1: Micro Punch-In en cada cambio de escena ────────
  // Hace un zoom sutil del 4% en los primeros 8 frames que aterriza en 1.00
  const microPunch =
    frameEnEscena < 8 ? 1.04 - (frameEnEscena / 8) * 0.04 : 1.0;

  // ── PATTERN INTERRUPT 2: Screen Shake en impactos y datos gigantes ─────
  let shakeX = 0;
  let shakeY = 0;
  if (
    (escenaActual?.tipo === 'dato_grande' || escenaActual?.tipo === 'consecuencia') &&
    frameEnEscena < 12
  ) {
    const intensidad = (1 - frameEnEscena / 12) * 9;
    shakeX = Math.sin(frame * 2.8) * intensidad;
    shakeY = Math.cos(frame * 3.2) * intensidad;
  }

  // ── PATTERN INTERRUPT 3: Flash blanco de 2 fotogramas al cambiar de plano ──
  const flashOpacidad =
    frameEnEscena === 0 ? 0.35 : frameEnEscena === 1 ? 0.18 : 0;

  return (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: estilo.colorFondo,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${microPunch})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Fondo Gradiente Dinámico */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${estilo.colorAcento}15 0%, transparent 65%), linear-gradient(180deg, ${estilo.colorFondo} 0%, #000000 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Capa de Vídeo Cinemático IA (Muse) si está configurado */}
      {(escenaActual?.props?.videoFondo || videoFondoUrl) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
          <OffthreadVideo
            src={escenaActual?.props?.videoFondo || videoFondoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.55) contrast(1.15)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.7) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Barra de Progreso Viral Superior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progreso * 100}%`,
            background: `linear-gradient(90deg, ${estilo.colorSecundario}, ${estilo.colorAcento})`,
            boxShadow: `0 0 12px ${estilo.colorAcento}`,
          }}
        />
      </div>

      {/* Renderizador de Formato Viral Específico con Cámara Dinámica HyperFrames */}
      {escenaActual && (
        <div style={{ flex: 1, position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
          <HyperCameraMove
            frame={frameEnEscena}
            tipo={escenaActual.tipo === 'dato_grande' ? 'punch_in' : 'orbit_subtle'}
            intensidad={0.8}
            conDefocusBorde={true}
          >
            <Renderer
              escena={escenaActual}
              estilo={estilo}
              frameEnEscena={frameEnEscena}
            />
          </HyperCameraMove>
        </div>
      )}

      {/* Capa de Monitor y Telemetría OSD HyperScreenWarp */}
      <HyperScreenWarp
        frame={frame}
        scanlineOpacidad={0.07}
        conTelemetria={true}
        tituloTelemetria={`${guion.tema.slice(0, 32).toUpperCase()} // SIM`}
        tinte={guion.estilo === 'neon_kinetic' ? 'cian' : 'ambar'}
      />

      {/* Flash blanco de transición de escena */}
      {flashOpacidad > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: flashOpacidad,
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}

      {/* Subtítulos Hormozi / MrBeast de Alta Retención con Emojis */}
      <KaraokeSubtitles
        subtitulos={todosLosSubtitulos}
        colorActivo={estilo.colorAcento}
        colorInactivo={estilo.colorTexto}
      />

      {/* Sistema Completo de Diseño Sonoro (Voz + Música Ducking + SFX) */}
      <SoundDesign
        guion={guion}
        audioVozDataUrl={audioDataUrl}
        musicaDataUrl={musicaDataUrl}
        sfxMap={sfxMap}
      />
    </div>
  );
};
