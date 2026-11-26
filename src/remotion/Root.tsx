import { UnChoqueEnLaLuna } from './UnChoqueEnLaLuna';
import { ToonFreneticoDemo } from '../videos/toon_frenetico/ToonFreneticoDemo';
import { ToonTorreEiffel } from '../videos/toon_frenetico/ToonTorreEiffel';
import { ToonGta6Policia } from '../videos/toon_frenetico/ToonGta6Policia';
import { ToonGta6Tomas } from '../videos/toon_frenetico/ToonGta6Tomas';
import { ToonGta6Descarga } from '../videos/toon_frenetico/ToonGta6Descarga';
import { ToonGta6Presupuesto } from '../videos/toon_frenetico/ToonGta6Presupuesto';
import { ToonGta6Joker } from '../videos/toon_frenetico/ToonGta6Joker';
import { ToonGta6DualProta } from '../videos/toon_frenetico/ToonGta6DualProta';
import { ToonGta6Dopamina } from '../videos/toon_frenetico/ToonGta6Dopamina';
import { ToonSupermercado } from '../videos/toon_frenetico/ToonSupermercado';
import { ToonGta6Huevo } from '../videos/toon_frenetico/ToonGta6Huevo';
import { ToonAscensor } from '../videos/toon_frenetico/ToonAscensor';
import { ToonDinamico, ACTIVE_TOON_SPEC } from '../videos/toon_frenetico/ToonDinamico';
import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition, type VideoProps } from './Video';
import type { GuionCompleto } from '../esquemas/guion.schema';

const guionPorDefecto: GuionCompleto = {
  id: 'preview-estudio',
  tema: '¿Y si la Tierra dejara de girar 5 segundos?',
  formato: 'what_if',
  estilo: 'neon_kinetic',
  duracionTotalSegundos: 30,
  fps: 30,
  totalFrames: 900,
  voz: 'es-MX-JorgeNeural',
  musica: 'suspenso_suave',
  escenas: [
    {
      id: 'escena_1',
      tipo: 'hook',
      duracionSegundos: 3,
      inicioFrame: 0,
      duracionFrames: 90,
      textoNarracion: '¿Y si la Tierra dejara de girar 5 segundos?',
      tituloVisual: '¿Y SI LA TIERRA SE DETUVIERA?',
      subtituloVisual: 'FÍSICA & CONSECUENCIAS REALES',
      datoDestacado: '¿Y SI...?',
      props: {},
      subtitulos: [
        { palabra: '¿Y', inicioMs: 0, finMs: 300, inicioFrame: 0, finFrame: 9 },
        { palabra: 'si', inicioMs: 300, finMs: 600, inicioFrame: 9, finFrame: 18 },
        { palabra: 'la', inicioMs: 600, finMs: 900, inicioFrame: 18, finFrame: 27 },
        { palabra: 'Tierra', inicioMs: 900, finMs: 1400, inicioFrame: 27, finFrame: 42 },
        { palabra: 'dejara', inicioMs: 1400, finMs: 1900, inicioFrame: 42, finFrame: 57 },
        { palabra: 'de', inicioMs: 1900, finMs: 2100, inicioFrame: 57, finFrame: 63 },
        { palabra: 'girar?', inicioMs: 2100, finMs: 2800, inicioFrame: 63, finFrame: 84 },
      ],
      verificar: false,
    },
    {
      id: 'escena_2',
      tipo: 'dato_grande',
      duracionSegundos: 5,
      inicioFrame: 90,
      duracionFrames: 150,
      textoNarracion: 'La atmósfera seguiría a 1.670 km/h.',
      tituloVisual: '1.670 KM/H',
      subtituloVisual: 'INERCIA DESTRUCTIVA GLOBAL',
      datoDestacado: 'VELOCIDAD SUPERSÓNICA',
      props: {},
      subtitulos: [
        { palabra: 'La', inicioMs: 3000, finMs: 3300, inicioFrame: 90, finFrame: 99 },
        { palabra: 'atmósfera', inicioMs: 3300, finMs: 4000, inicioFrame: 99, finFrame: 120 },
        { palabra: 'seguiría', inicioMs: 4000, finMs: 4600, inicioFrame: 120, finFrame: 138 },
        { palabra: 'a', inicioMs: 4600, finMs: 4800, inicioFrame: 138, finFrame: 144 },
        { palabra: '1.670', inicioMs: 4800, finMs: 5800, inicioFrame: 144, finFrame: 174 },
        { palabra: 'km/h', inicioMs: 5800, finMs: 6600, inicioFrame: 174, finFrame: 198 },
      ],
      verificar: true,
    },
  ],
  copys: {
    tiktok: {
      ganchos: ['¿Y si la Tierra se detiene?'],
      caption: 'Lo que pasaría si la Tierra se detiene 5 segundos.',
      hashtags: ['#whatif', '#science', '#fyp', '#viral'],
    },
    reels: {
      ganchos: ['El impacto de la inercia'],
      caption: 'Consecuencias de frenar la rotación terrestre.',
      preguntaFinal: '¿Sobrevivirías?',
      hashtags: ['#reels', '#viral', '#universe'],
    },
    shorts: {
      titulo: '¿Y si la Tierra se detiene 5 segundos?',
      descripcion: 'Física aplicada en 30 segundos.',
      hashtags: ['#shorts', '#viral'],
    },
  },
  generadoEn: new Date().toISOString(),
};

import { EscenarioEscaleraMetro } from './escenarios/EscenarioEscaleraMetro';
import { EscenarioUltimoHombre } from './escenarios/EscenarioUltimoHombre';
import { EscenarioChoqueLuna } from './escenarios/EscenarioChoqueLuna';
import { BridgeShort, BRIDGE_FRAMES } from '../videos/bridge/Bridge';
import { RestauranteShort, RESTAURANTE_FRAMES } from '../videos/restaurante/Restaurante';
import { LorakhShort, LORAKH_FRAMES } from '../videos/lorakh/Lorakh';
import { LorakhEstandar, LORAKH_ESTANDAR_FRAMES } from '../videos/lorakh_estandar/LorakhEstandar';
import { LorakhQuiz, LORAKH_QUIZ_FRAMES } from '../videos/lorakh_quiz/LorakhQuiz';
import { LorakhEntrevista, LORAKH_ENTREVISTA_FRAMES } from '../videos/lorakh_entrevista/LorakhEntrevista';
import { LorakhEntrevistaPro, LORAKH_ENTREVISTA_PRO_FRAMES } from '../videos/lorakh_entrevista_pro/LorakhEntrevistaPro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LorakhEntrevistaPro"
        component={LorakhEntrevistaPro}
        durationInFrames={LORAKH_ENTREVISTA_PRO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LorakhEntrevista"
        component={LorakhEntrevista}
        durationInFrames={LORAKH_ENTREVISTA_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LorakhQuiz"
        component={LorakhQuiz}
        durationInFrames={LORAKH_QUIZ_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LorakhEstandar"
        component={LorakhEstandar}
        durationInFrames={LORAKH_ESTANDAR_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LorakhPro"
        component={LorakhShort}
        durationInFrames={LORAKH_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LorakhShort"
        component={LorakhEstandar}
        durationInFrames={LORAKH_ESTANDAR_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RestauranteShort"
        component={RestauranteShort}
        durationInFrames={RESTAURANTE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BridgeShort"
        component={BridgeShort}
        durationInFrames={BRIDGE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoViral"
        component={VideoComposition as any}
        durationInFrames={guionPorDefecto.totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          guion: guionPorDefecto,
        }}
      />
      <Composition
        id="UltimoHombreHook"
        component={EscenarioUltimoHombre as any}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          etapa: 'hook_multitud',
          duracionFrames: 180,
          frameInicio: 0,
          textoEditorial: '1 in 4,000,000,000: The global survival protocol initiates.',
          palabraClave: '1 in 4,000,000,000',
        }}
      />
      <Composition
        id="UltimoHombreGenetica"
        component={EscenarioUltimoHombre as any}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          etapa: 'colapso_genetico',
          duracionFrames: 180,
          frameInicio: 0,
          textoEditorial: 'The Y-Chromosome bottleneck: Extinction in less than two generations.',
          palabraClave: 'Y-Chromosome',
        }}
      />
      <Composition
        id="ChoqueLunaPreview"
        component={EscenarioChoqueLuna as any}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          etapa: 'aproximacion_luna',
          duracionFrames: 180,
          frameInicio: 0,
          textoEditorial: 'Orbital Decay: 3,800 km per hour collision trajectory.',
          palabraClave: '18.470 KM',
        }}
      />
      <Composition
        id="ChoqueLunaRoche"
        component={EscenarioChoqueLuna as any}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          etapa: 'limite_roche',
          duracionFrames: 180,
          frameInicio: 0,
          textoEditorial: 'Roche Limit Breach: Tidal gravitational shredding initiates.',
          palabraClave: 'ROCHE LIMIT',
        }}
      />
      <Composition
        id="un-choque-en-la-luna"
        component={UnChoqueEnLaLuna}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ToonFrenetico"
        component={ToonFreneticoDemo}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonTorreEiffel"
        component={ToonTorreEiffel}
        durationInFrames={1322}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Policia"
        component={ToonGta6Policia}
        durationInFrames={1013}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Tomas"
        component={ToonGta6Tomas}
        durationInFrames={991}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Descarga"
        component={ToonGta6Descarga}
        durationInFrames={840}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Presupuesto"
        component={ToonGta6Presupuesto}
        durationInFrames={845}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Joker"
        component={ToonGta6Joker}
        durationInFrames={995}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6DualProta"
        component={ToonGta6DualProta}
        durationInFrames={1125}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Dopamina"
        component={ToonGta6Dopamina}
        durationInFrames={1155}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonSupermercado"
        component={ToonSupermercado}
        durationInFrames={1109}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonGta6Huevo"
        component={ToonGta6Huevo}
        durationInFrames={1681}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonAscensor"
        component={ToonAscensor}
        durationInFrames={1420}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ToonDinamico"
        component={ToonDinamico}
        durationInFrames={ACTIVE_TOON_SPEC.durationInFrames || 900}
        fps={ACTIVE_TOON_SPEC.fps || 30}
        width={1080}
        height={1920}
      />
    </>
  );
};

