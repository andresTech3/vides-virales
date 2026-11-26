import { z } from 'zod';
import { FormatoViralEnum, EstiloVisualEnum } from './brief.schema';

export const PalabraSubtituloSchema = z.object({
  palabra: z.string(),
  inicioMs: z.number(),
  finMs: z.number(),
  inicioFrame: z.number().default(0),
  finFrame: z.number().default(0),
});

export type PalabraSubtitulo = z.infer<typeof PalabraSubtituloSchema>;

export const EscenaGuionSchema = z.object({
  id: z.string(),
  tipo: z.string(), // 'hook', 'dato_grande', 'escena_mundo', 'consecuencia', 'giro', 'cierre', 'quiz_pregunta', 'quiz_revelacion', 'ranking_item', 'chat_msg', 'cita'
  duracionSegundos: z.number(),
  inicioFrame: z.number(),
  duracionFrames: z.number(),
  textoNarracion: z.string(),
  tituloVisual: z.string().optional(),
  subtituloVisual: z.string().optional(),
  datoDestacado: z.string().optional(),
  props: z.record(z.any()).default({}),
  subtitulos: z.array(PalabraSubtituloSchema).default([]),
  verificar: z.boolean().default(false), // Marcado true si el dato requiere verificación fáctica
});

export type EscenaGuion = z.infer<typeof EscenaGuionSchema>;

export const CopysSchema = z.object({
  tiktok: z.object({
    ganchos: z.array(z.string()).min(1),
    caption: z.string(),
    hashtags: z.array(z.string()),
  }),
  reels: z.object({
    ganchos: z.array(z.string()).min(1),
    caption: z.string(),
    preguntaFinal: z.string(),
    hashtags: z.array(z.string()),
  }),
  shorts: z.object({
    titulo: z.string().max(70),
    descripcion: z.string(),
    hashtags: z.array(z.string()),
  }),
});

export type Copys = z.infer<typeof CopysSchema>;

export const GuionCompletoSchema = z.object({
  id: z.string(),
  tema: z.string(),
  formato: FormatoViralEnum,
  estilo: EstiloVisualEnum,
  duracionTotalSegundos: z.number(),
  fps: z.number().default(30),
  totalFrames: z.number(),
  voz: z.string(),
  musica: z.string(),
  escenas: z.array(EscenaGuionSchema),
  copys: CopysSchema,
  generadoEn: z.string(),
});

export type GuionCompleto = z.infer<typeof GuionCompletoSchema>;
