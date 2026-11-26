import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { ejecutarPipeline } from '../pipeline/index.js';
import { limpiarResiduos, limpiarTodo } from '../pipeline/limpiador.js';
import type { FormatoViral, EstiloVisual } from '../esquemas/brief.schema.js';

// Cargar variables de entorno desde .env, .env.local o raíz
dotenv.config();
dotenv.config({ path: path.resolve('..', '.env.local') });
dotenv.config({ path: path.resolve('.env.local') });

const program = new Command();

program
  .name('generador-videos')
  .description('Generador de Videos Virales 9:16 por Código con Inteligencia Artificial')
  .version('1.0.0');

// Comando Principal: Generar Video (acepta archivo JSON o texto libre)
program
  .argument('[entrada]', 'Ruta a archivo .json o texto libre del tema')
  .option('-f, --formato <formato>', 'Formato viral (what_if, storytelling_split, quiz_trivia, top_ranking, fake_chat, mindblown_facts, quote_wisdom)')
  .option('-e, --estilo <estilo>', 'Estilo visual (neon_kinetic, lowpoly3d, pixelart, cinematic_dark, clay_arcilla)')
  .option('-d, --duracion <segundos>', 'Duración deseada en segundos (15 a 60)')
  .option('-m, --motor <motor>', 'Motor de renderizado: hibrido (por defecto), remotion, hyperframes')
  .option('--dato <dato>', 'Dato numérico gigante a destacar')
  .option('--voz <voz>', 'Identificador de voz o modelo')
  .option('--lote <carpeta>', 'Procesar todos los briefs en lote de una carpeta')
  .option('--variantes <cantidad>', 'Generar múltiples variantes del mismo video')
  .option('--sin-video', 'Omitir render de video MP4 (solo generar voz, guion y copys)')
  .option('--limpiar', 'Limpiar archivos temporales y cachés sin borrar videos')
  .option('--limpiar-todo', 'Limpieza profunda completa (resetea carpeta de salida y cachés)')
  .action(async (entrada, opts) => {
    try {
      if (opts.limpiarTodo) {
        limpiarTodo();
        return;
      }

      if (opts.limpiar) {
        limpiarResiduos();
        return;
      }
      // MODO 1: Procesamiento en Lote
      if (opts.lote) {
        const carpeta = path.resolve(opts.lote);
        if (!fs.existsSync(carpeta)) {
          console.error(`❌ La carpeta "${carpeta}" no existe.`);
          process.exit(1);
        }

        const archivos = fs.readdirSync(carpeta).filter((f) => f.endsWith('.json'));
        console.log(`📁 Procesando lote de ${archivos.length} briefs en "${carpeta}"...`);

        for (const arch of archivos) {
          const ruta = path.join(carpeta, arch);
          const raw = JSON.parse(fs.readFileSync(ruta, 'utf8'));
          await ejecutarPipeline(raw, { renderVideo: !opts.sinVideo, motor: opts.motor });
        }
        return;
      }

      // MODO 2: Archivo JSON
      if (entrada && entrada.endsWith('.json')) {
        const rutaArchivo = path.resolve(entrada);
        if (!fs.existsSync(rutaArchivo)) {
          console.error(`❌ El archivo brief "${rutaArchivo}" no existe.`);
          process.exit(1);
        }

        const rawBrief = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
        const nVariantes = parseInt(opts.variantes || String(rawBrief.variantes || 1), 10);

        for (let i = 1; i <= nVariantes; i++) {
          const briefActual = {
            ...rawBrief,
            id: nVariantes > 1 ? `${rawBrief.id}-v${i}` : rawBrief.id,
          };
          if (opts.formato) briefActual.formato = opts.formato;
          if (opts.estilo) briefActual.estilo = opts.estilo;

          await ejecutarPipeline(briefActual, { renderVideo: !opts.sinVideo, motor: opts.motor });
        }
        return;
      }

      // MODO 3: Texto Libre
      const tema = entrada || '¿Y si la Tierra dejara de girar 5 segundos?';
      const cleanId = tema
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30) || 'video-viral';

      const nVariantes = parseInt(opts.variantes || '1', 10);

      for (let i = 1; i <= nVariantes; i++) {
        const briefTexto = {
          id: nVariantes > 1 ? `${cleanId}-v${i}` : cleanId,
          tema,
          formato: (opts.formato || 'what_if') as FormatoViral,
          estilo: (opts.estilo || 'neon_kinetic') as EstiloVisual,
          duracionSegundos: parseInt(opts.duracion, 10) || 30,
          datoGrande: opts.dato,
          voz: opts.voz,
          idioma: 'es' as const,
          plataformas: ['tiktok', 'reels', 'shorts'] as const,
        };

        await ejecutarPipeline(briefTexto, { renderVideo: !opts.sinVideo, motor: opts.motor });
      }
    } catch (err: any) {
      console.error('\n❌ Error durante la ejecución del pipeline:', err.message || err);
      process.exit(1);
    }
  });

program.parse(process.argv);
