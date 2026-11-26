import { z } from 'zod';

export const FormatoViralEnum = z.enum([
  'what_if',             // Escenarios hipotéticos y ciencia absurda ("¿Y si la Tierra se detuviera?")
  'storytelling_split',  // Historias / Reddit / Confesiones (Arriba historia, abajo gameplay/ASMR)
  'quiz_trivia',         // Trivia interactiva / ¿Qué prefieres? con temporizador y revelación
  'top_ranking',         // Top 3 o Top 5 con conteo regresivo animado
  'fake_chat',           // Conversación de WhatsApp / Mensajería viral con audios y respuestas
  'mindblown_facts',     // Datos psicológicos impactantes con tipografía cinética agresiva
  'quote_wisdom',        // Citas estoicas / Motivación épica con estética cinematográfica
]);

export type FormatoViral = z.infer<typeof FormatoViralEnum>;

export const EstiloVisualEnum = z.enum([
  // ── Estilos 3D ────────────────────────────────────────────────────────────
  'neon_kinetic',        // Tipografía cinética, glow neón — referencia #19
  'lowpoly3d',           // Ciudad/maniquíes low-poly — referencia #2, #8, #20
  'fps_realista',        // Calle FPS primera persona con HUD — referencia #6, #16
  'clay_arcilla',        // Claymation Chibi / Plastilina — referencia #3, #9
  'cinematic_dark',      // Fotografía espacial + serif — referencia #1, #25
  // ── Estilos 2D / Ilustración ──────────────────────────────────────────────
  'pixelart',            // Pixel art retro 16-bit — referencia #7
  'flat_design_2d',      // Flat design animado tipo globo — referencia #21, #23
  'risografia_vintage',  // Cartel 2-3 colores tipo risografía — referencia #10, #14
  'diagrama_cientifico', // Kurzgesagt / infografía científica — referencia #5, #24
  'acuarela_grabado',    // Silhouette dorado + acuarela — referencia #10 náutico
]);

export type EstiloVisual = z.infer<typeof EstiloVisualEnum>;

export const BriefSchema = z.object({
  id: z.string().min(1, 'El ID del video es obligatorio').regex(/^[a-z0-9-_]+$/, 'El ID solo puede contener letras minúsculas, números, guiones y guiones bajos'),
  idioma: z.enum(['es', 'en']).default('es'),
  tema: z.string().min(3, 'El tema debe tener al menos 3 caracteres'),
  formato: FormatoViralEnum.default('what_if'),
  estilo: EstiloVisualEnum.default('neon_kinetic'),
  duracionSegundos: z.number().min(15).max(65).default(35),
  tono: z.string().default('curioso, dinámico, asombroso'),
  datoGrande: z.string().optional(),
  voz: z.string().default('es-MX-JorgeNeural'),
  musica: z.enum(['suspenso_suave', 'epica_motivacion', 'lofi_curiosidad', 'upbeat_gaming']).default('suspenso_suave'),
  plataformas: z.array(z.enum(['tiktok', 'reels', 'shorts'])).default(['tiktok', 'reels', 'shorts']),
  variantes: z.number().int().min(1).max(5).default(1),
  // Datos específicos opcionales para formatos concretos:
  opcionesQuiz: z.array(z.object({
    texto: z.string(),
    esCorrecta: z.boolean().default(false),
  })).optional(),
  itemsRanking: z.array(z.object({
    posicion: z.number(),
    titulo: z.string(),
    descripcion: z.string(),
  })).optional(),
  mensajesChat: z.array(z.object({
    remitente: z.enum(['yo', 'otro']),
    texto: z.string(),
    tiempo: z.number().optional(),
  })).optional(),
});

export type Brief = z.infer<typeof BriefSchema>;
