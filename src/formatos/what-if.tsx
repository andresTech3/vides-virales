import React from 'react';
import { interpolate, spring } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { Escenario3DTierraPlana } from '../remotion/componentes/Escenario3DTierraPlana';
import { EscenarioMontanaRusa } from '../remotion/escenarios/EscenarioMontanaRusa';
import type { EtapaMontanaRusa } from '../prefabs/entornos/MontanaRusaEspacio';
import { EscenarioMicrobioma } from '../remotion/escenarios/EscenarioMicrobioma';
import type { EtapaMicrobioma } from '../prefabs/entornos/MicrobiomaCelular';
import { EscenarioEscaleraMetro } from '../remotion/escenarios/EscenarioEscaleraMetro';
import { EscenarioUltimoHombre, type EtapaUltimoHombre } from '../remotion/escenarios/EscenarioUltimoHombre';
import { EscenarioChoqueLuna, type EtapaChoqueLuna } from '../remotion/escenarios/EscenarioChoqueLuna';
import { HyperVoxAnnotate, HyperFeatherSpotlight } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const WhatIfRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;

  // Detectar si el tema o escena es de montaña rusa en el espacio
  const esMontanaRusa =
    escena.props?.escenario === 'montana_rusa' ||
    Boolean(escena.props?.etapaMontana) ||
    escena.id.includes('montana') ||
    escena.textoNarracion.toLowerCase().includes('montaña') ||
    escena.textoNarracion.toLowerCase().includes('montana') ||
    (escena.tituloVisual && escena.tituloVisual.toLowerCase().includes('montaña'));

  // Detectar si el tema o escena es de bacterias / microbioma celular
  const esMicrobioma =
    escena.props?.escenario === 'microbioma' ||
    Boolean(escena.props?.etapaMicrobioma) ||
    escena.id.includes('bacteri') ||
    escena.id.includes('microbio') ||
    escena.textoNarracion.toLowerCase().includes('bacteria') ||
    escena.textoNarracion.toLowerCase().includes('bacterias') ||
    escena.textoNarracion.toLowerCase().includes('microbio') ||
    (escena.tituloVisual && (
      escena.tituloVisual.toLowerCase().includes('bacteria') ||
      escena.tituloVisual.toLowerCase().includes('microbio') ||
      escena.tituloVisual.toLowerCase().includes('célula')
    ));

  // Detectar si el tema o escena es del último hombre en la Tierra
  const esUltimoHombre =
    escena.props?.escenario === 'ultimo_hombre' ||
    escena.id.includes('hombre') ||
    escena.textoNarracion.toLowerCase().includes('hombre') ||
    escena.textoNarracion.toLowerCase().includes('mujeres') ||
    (escena.tituloVisual && (
      escena.tituloVisual.toLowerCase().includes('HOMBRE') ||
      escena.tituloVisual.toLowerCase().includes('GENÉTIC') ||
      escena.tituloVisual.toLowerCase().includes('BÚNKER') ||
      escena.tituloVisual.toLowerCase().includes('BIOSEGURIDAD')
    ));

  // Detectar si el tema o escena es de la escalera mecánica de metro
  const esMetro =
    escena.props?.escenario === 'metro_escalera' ||
    escena.id.includes('escalera') ||
    escena.id.includes('metro') ||
    escena.textoNarracion.toLowerCase().includes('escalera') ||
    escena.textoNarracion.toLowerCase().includes('metro') ||
    (escena.tituloVisual && escena.tituloVisual.toLowerCase().includes('ESCALERA'));

  // Detectar si el tema o escena es de la colisión de la Luna con la Tierra
  const esChoqueLuna =
    escena.props?.escenario === 'choque_luna' ||
    escena.id.includes('luna') ||
    escena.id.includes('choque') ||
    escena.id.includes('roche') ||
    escena.textoNarracion.toLowerCase().includes('luna') ||
    (escena.tituloVisual && (
      escena.tituloVisual.toLowerCase().includes('luna') ||
      escena.tituloVisual.toLowerCase().includes('roche') ||
      escena.tituloVisual.toLowerCase().includes('colisión') ||
      escena.tituloVisual.toLowerCase().includes('colision') ||
      escena.tituloVisual.toLowerCase().includes('impacto')
    ));

  // Determinar la etapa del choque de la luna
  let etapaLuna: EtapaChoqueLuna = 'aproximacion_luna';
  if (escena.props?.etapa) {
    etapaLuna = escena.props.etapa as EtapaChoqueLuna;
  } else if (escena.tipo === 'dato_grande' || escena.textoNarracion.toLowerCase().includes('roche')) {
    etapaLuna = 'limite_roche';
  } else if (escena.tipo === 'consecuencia') {
    etapaLuna = 'bombardeo_cataclismo';
  } else if (escena.tipo === 'giro') {
    etapaLuna = 'fusion_anillos';
  } else if (escena.tipo === 'cierre') {
    etapaLuna = 'cierre_bucle';
  }

  // Determinar la etapa de la montaña rusa según tipo de escena o prop explícito
  let etapaCoaster: EtapaMontanaRusa = 'hook_cima';
  if (escena.props?.etapa) {
    etapaCoaster = escena.props.etapa as EtapaMontanaRusa;
  } else if (escena.tipo === 'dato_grande') {
    etapaCoaster = 'caida_aceleracion';
  } else if (escena.tipo === 'consecuencia') {
    etapaCoaster = 'loop_gravedad_cero';
  } else if (escena.tipo === 'giro') {
    etapaCoaster = 'fuga_frenos_fallo';
  } else if (escena.tipo === 'cierre') {
    etapaCoaster = 'deriva_eterna';
  }

  // Determinar la etapa del microbioma celular
  let etapaBio: EtapaMicrobioma = 'zoom_entrada';
  if (escena.props?.etapa) {
    etapaBio = escena.props.etapa as EtapaMicrobioma;
  } else if (escena.tipo === 'dato_grande') {
    etapaBio = 'enjambre_bacterias';
  } else if (escena.tipo === 'consecuencia') {
    etapaBio = 'segundo_cerebro';
  } else if (escena.tipo === 'giro') {
    etapaBio = 'peso_biomasa';
  } else if (escena.tipo === 'cierre') {
    etapaBio = 'universo_interior';
  }

  // Determinar la etapa del último hombre en la Tierra
  let etapaHombre: EtapaUltimoHombre = 'hook_multitud';
  if (escena.props?.etapa) {
    etapaHombre = escena.props.etapa as EtapaUltimoHombre;
  } else if (escena.tipo === 'dato_grande') {
    etapaHombre = 'bunker_aislamiento';
  } else if (escena.tipo === 'consecuencia') {
    etapaHombre = 'colapso_genetico';
  } else if (escena.tipo === 'giro' || escena.tipo === 'cierre') {
    etapaHombre = 'cierre_planeta';
  }

  // Animación de entrada con spring suave y premium
  const entrada = spring({
    frame,
    fps: 30,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  const translateY = interpolate(entrada, [0, 1], [30, 0]);
  const opacity = interpolate(entrada, [0, 1], [0, 1]);
  const scale = interpolate(entrada, [0, 1], [0.96, 1]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#060814',
      }}
    >
      {/* 1. ESCENARIOS 3D CINEMATOGRÁFICOS MULTIESCENA (Three.js) */}
      {esChoqueLuna ? (
        <EscenarioChoqueLuna
          etapa={etapaLuna}
          duracionFrames={escena.duracionFrames || 90}
          frameLocal={frameEnEscena}
          hud={escena.props?.hud}
          textoEditorial={escena.subtituloVisual}
        />
      ) : esUltimoHombre ? (
        <EscenarioUltimoHombre
          etapa={etapaHombre}
          duracionFrames={escena.duracionFrames || 90}
          frameLocal={frameEnEscena}
          hud={escena.props?.hud}
          textoEditorial={escena.subtituloVisual}
        />
      ) : esMetro ? (
        <EscenarioEscaleraMetro
          duracionFrames={escena.duracionFrames || 90}
          frameLocal={frameEnEscena}
          hud={escena.props?.hud}
          textoEditorial={escena.subtituloVisual}
        />
      ) : esMontanaRusa ? (
        <EscenarioMontanaRusa
          etapa={etapaCoaster}
          duracionFrames={escena.duracionFrames || 90}
          frameInicio={0}
          hud={escena.props?.hud}
          colorRieles={estilo.colorAcento}
          colorNeon={estilo.colorSecundario}
        />
      ) : esMicrobioma ? (
        <EscenarioMicrobioma
          etapa={etapaBio}
          duracionFrames={escena.duracionFrames || 90}
          frameInicio={0}
          hud={escena.props?.hud}
          colorBacteriaA={estilo.colorAcento}
          colorBacteriaB={estilo.colorSecundario}
        />
      ) : (
        <Escenario3DTierraPlana
          frame={frame}
          tipoEscena={escena.tipo}
          width={1080}
          height={1920}
        />
      )}

      {/* 2. GRADIENTE CINEMATOGRÁFICO CRISTALINO (Sin ensuciar la escena 3D) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(6,8,20,0.6) 0%, transparent 18%, transparent 72%, rgba(6,8,20,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* 2.1 FOCO SUAVE EMPLUMADO HYPERFRAMES (HyperFeatherSpotlight) */}
      <HyperFeatherSpotlight
        frame={frameEnEscena}
        centroX={50}
        centroY={escena.tipo === 'dato_grande' ? 36 : 42}
        radio={escena.tipo === 'dato_grande' ? 420 : 360}
        oscuridadMaxima={0.65}
        colorHalo={`${estilo.colorAcento}15`}
        respiracion={true}
      />

      {/* 3. OVERLAY EDITORIAL MODERNO Y ELEGANTE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '160px', // Zona segura superior
          paddingLeft: '44px',
          paddingRight: '44px',
          textAlign: 'center',
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          pointerEvents: 'none',
        }}
      >
        {/* Badge Superior Glassmorphism */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 24px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${estilo.colorAcento}80`,
            marginBottom: '20px',
            boxShadow: `0 0 25px ${estilo.colorAcento}40`,
          }}
        >
          <span style={{ fontSize: '18px', color: estilo.colorAcento }}>⚡</span>
          <span
            style={{
              fontFamily: estilo.fuenteSubtitulo,
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: estilo.colorAcento,
            }}
          >
            {escena.datoDestacado || 'SIMULACIÓN REAL'}
          </span>
        </div>

        {/* Título Visual Principal con Anotación Vox HyperFrames */}
        {escena.tituloVisual && (
          <HyperVoxAnnotate
            frame={frameEnEscena}
            inicioFrame={8}
            labelCallout={escena.tipo === 'dato_grande' ? 'IMPACTO CRÍTICO' : 'TELEMETRÍA // LIVE'}
            colorMarcador={estilo.colorAcento}
            colorEtiqueta={estilo.colorSecundario}
          >
            <h1
              style={{
                fontFamily: estilo.fuenteTitulo,
                fontSize: escena.tipo === 'dato_grande' ? '82px' : '62px',
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textTransform: 'uppercase',
                marginBottom: '16px',
                textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 0 35px rgba(56,189,248,0.3)',
                maxWidth: '960px',
              }}
            >
              {escena.tituloVisual}
            </h1>
          </HyperVoxAnnotate>
        )}

        {/* Subtítulo / Descripción Visual Pulida */}
        {escena.subtituloVisual && (
          <div
            style={{
              fontFamily: estilo.fuenteSubtitulo,
              fontSize: '22px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              maxWidth: '820px',
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(12px)',
              padding: '8px 22px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {escena.subtituloVisual}
          </div>
        )}
      </div>
    </div>
  );
};
