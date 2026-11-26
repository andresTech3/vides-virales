import fs from 'fs';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { BriefSchema, type Brief } from '../esquemas/brief.schema.js';
import type { GuionCompleto, PalabraSubtitulo } from '../esquemas/guion.schema.js';
import { generarGuion } from '../servicios/llm.js';
import { generarVoz } from '../servicios/voz.js';
import { normalizarTextoParaVoz } from '../servicios/normalizadorTexto.js';
import { asegurarLibreriaAudio, cargarLibreriaAudioDataUrls } from '../servicios/sfx_generator.js';
import { limpiarResiduos } from './limpiador.js';
import { compilarProyectoHyperFrames } from '../hyperframes/index.js';
import { execSync } from 'child_process';

export interface PipelineOptions {
  renderVideo?: boolean;
  motor?: 'remotion' | 'hyperframes' | 'hibrido';
}

export async function ejecutarPipeline(briefInput: unknown, options: PipelineOptions = {}) {
  const tiempoInicio = Date.now();
  console.log('\n============================================================');
  console.log('🚀 GENERADOR DE VIDEOS VIRALES POR CÓDIGO (NEXUS AI)');
  console.log('============================================================\n');

  // [Paso 1]: Validar y autocompletar el Brief con Zod
  console.log('⏳ [1/7] Validando brief con esquema estricto Zod...');
  const brief = BriefSchema.parse(briefInput);
  console.log(`✓ Brief validado: ID = "${brief.id}", Formato = "${brief.formato}", Estilo = "${brief.estilo}"`);

  // Crear directorio de salida
  const carpetaSalida = path.resolve('salida', brief.id);
  if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
  }

  // [Paso 2]: Generar Guion y Escenas (LLM o Motor Viral Especializado)
  console.log(`\n⏳ [2/7] Generando estructura y guion viral para "${brief.tema}"...`);
  const guion = await generarGuion(brief);
  console.log(`✓ Guion generado con ${guion.escenas.length} escenas dinámicas.`);

  // [Paso 3, 4 y 5]: Generar Voz en Off y calcular Timestamps de palabra y frames
  console.log('\n⏳ [3/7] Generando narración en off y timestamps sincronizados...');
  const rutaVozMp3 = path.join(carpetaSalida, 'voz.mp3');

  // Normalizar números y abreviaturas a palabras escritas completas en todas las escenas
  for (const escena of guion.escenas) {
    if (escena.textoNarracion) {
      escena.textoNarracion = normalizarTextoParaVoz(escena.textoNarracion);
    }
  }

  // Unir todo el texto para una narración fluida y coherente
  const textoCompleto = guion.escenas.map((e) => e.textoNarracion).filter(Boolean).join(' ');
  const resultadoVoz = await generarVoz(textoCompleto, rutaVozMp3, brief.voz);
  console.log(`✓ Audio generado: ${resultadoVoz.duracionSegundos.toFixed(2)}s (${resultadoVoz.subtitulos.length} palabras detectadas con marcas de tiempo nativas).`);

  // Sincronizar duración y frames de cada escena basándose en el audio real
  console.log('\n⏳ [4/7] Ajustando duración de escenas y asignando subtítulos karaoke...');
  let palabraOffset = 0;
  let frameAcumulado = 0;

  for (let i = 0; i < guion.escenas.length; i++) {
    const escena = guion.escenas[i];
    const palabrasEscena = escena.textoNarracion.split(/\s+/).filter(Boolean);
    const countPalabras = palabrasEscena.length;

    const subtitulosEscena = resultadoVoz.subtitulos.slice(palabraOffset, palabraOffset + countPalabras);
    palabraOffset += countPalabras;

    let inicioFrame = frameAcumulado;
    let duracionFrames = 90; // Default 3s

    if (subtitulosEscena.length > 0) {
      inicioFrame = subtitulosEscena[0].inicioFrame;
      const finFrame = subtitulosEscena[subtitulosEscena.length - 1].finFrame;
      duracionFrames = Math.max(45, finFrame - inicioFrame + 15); // Añade 15 frames de respiro
    }

    escena.inicioFrame = frameAcumulado;
    escena.duracionFrames = duracionFrames;
    escena.duracionSegundos = duracionFrames / 30;
    escena.subtitulos = subtitulosEscena;

    frameAcumulado += duracionFrames;
  }

  guion.totalFrames = Math.max(450, frameAcumulado);
  guion.duracionTotalSegundos = Math.round(guion.totalFrames / 30);

  // Guardar guion.json completo
  const rutaGuionJson = path.join(carpetaSalida, 'guion.json');
  fs.writeFileSync(rutaGuionJson, JSON.stringify(guion, null, 2), 'utf8');
  console.log(`✓ Guion persistido en: ${rutaGuionJson}`);

  // [Paso 6]: Compilar Proyecto Nativo HyperFrames
  console.log('\n⏳ [5/7] Generando copys.md y Proyecto Nativo HyperFrames...');
  const copysMd = generarMarkdownCopys(guion);
  const rutaCopysMd = path.join(carpetaSalida, 'copys.md');
  fs.writeFileSync(rutaCopysMd, copysMd, 'utf8');
  console.log(`✓ Copys persistidos en: ${rutaCopysMd}`);

  const dirHyperFrames = path.join(carpetaSalida, 'hyperframes');
  compilarProyectoHyperFrames({
    guion,
    dirDestino: dirHyperFrames,
    rutaAudioVoz: fs.existsSync(rutaVozMp3) ? rutaVozMp3 : undefined,
  });
  console.log(`✓ Proyecto nativo HyperFrames generado en: ${dirHyperFrames}`);
  console.log(`  💡 Puedes previsualizarlo con: npx hyperframes preview ${dirHyperFrames}`);

  // [Paso 7]: Renderizar Video MP4 (1080x1920, 30fps) si está habilitado
  const rutaVideoMp4 = path.join(carpetaSalida, 'video.mp4');
  const motor = options.motor || 'hibrido';

  if (options.renderVideo !== false) {
    if (motor === 'hyperframes') {
      console.log('\n⏳ [6/7] Renderizando video con Motor Nativo HyperFrames (HTML + CSS + GSAP)...');
      try {
        execSync(`npx hyperframes render -o "${rutaVideoMp4}"`, {
          cwd: dirHyperFrames,
          stdio: 'inherit',
        });
        console.log(`\n🎉 ¡VIDEO HYPERFRAMES RENDERIZADO EXITOSAMENTE!`);
        console.log(`📁 Archivo final: ${rutaVideoMp4}`);
      } catch (err: any) {
        console.error('❌ Error al renderizar con HyperFrames:', err.message || err);
        throw err;
      }
    } else {
      console.log('\n⏳ [6/7] Empaquetando y Renderizando video MP4 vertical (1080x1920, 30fps)...');
      console.log('⚡ Modo Turbo Híbrido: Remotion 3D + Gráficos Cinéticos HyperFrames');

      const entryPoint = path.resolve('src/remotion/index.ts');
      console.log('   Compilando composición con Remotion Bundler...');
      const bundleLocation = await bundle({
        entryPoint,
        onProgress: (p) => {
          if (p === 100) console.log('   ✓ Bundle completado.');
        },
      });

      // Convertir audio a Data URL para portabilidad absoluta
      let audioDataUrl: string | undefined;
      if (fs.existsSync(rutaVozMp3)) {
        const audioBuffer = fs.readFileSync(rutaVozMp3);
        audioDataUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
      }

      // Preparar librería de SFX y Música procedural para diseño sonoro viral
      console.log('   Inyectando diseño sonoro (SFX de impacto + música con auto-ducking)...');
      const libreriaAudio = asegurarLibreriaAudio();
      const sfxDataUrls = cargarLibreriaAudioDataUrls(libreriaAudio);

      const musicaDataUrl =
        guion.musica === 'epica_motivacion' || guion.musica === 'upbeat_gaming'
          ? sfxDataUrls.musica_epica
          : sfxDataUrls.musica_suspenso;

      let videoFondoUrl: string | undefined = undefined;

      console.log('   Seleccionando composición "VideoViral"...');
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'VideoViral',
        inputProps: {
          guion,
          audioDataUrl,
          musicaDataUrl,
          sfxMap: sfxDataUrls,
          videoFondoUrl,
        },
      });

      console.log(`   Renderizando ${guion.totalFrames} frames a máxima velocidad (Turbo 6 hilos)...`);
      let ultimoPorcentaje = -1;

      await renderMedia({
        composition: {
          ...composition,
          durationInFrames: guion.totalFrames,
        },
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: rutaVideoMp4,
        inputProps: {
          guion,
          audioDataUrl,
          musicaDataUrl,
          sfxMap: sfxDataUrls,
          videoFondoUrl,
        },
        concurrency: 6, // 6 procesos concurrentes sobre 12 núcleos CPU (~8.5-9.5 GB RAM, ~60% de 16GB)
        imageFormat: 'jpeg', // Captura nativa JPEG (3x más rápida que compresión PNG en CPU)
        jpegQuality: 92, // Calidad cristalina de estudio sin artefactos
        x264Preset: 'faster', // Acelera compresión H.264 manteniendo máxima fidelidad visual
        chromiumOptions: {
          disableWebSecurity: true,
          ignoreCertificateErrors: true,
          gl: 'angle',
        },
        onProgress: ({ progress }) => {
          const pct = Math.round(progress * 100);
          if (pct % 10 === 0 && pct !== ultimoPorcentaje) {
            console.log(`   ⏳ Progreso de render: ${pct}%`);
            ultimoPorcentaje = pct;
          }
        },
      });

      console.log(`\n🎉 ¡VIDEO RENDERIZADO EXITOSAMENTE!`);
      console.log(`📁 Archivo final: ${rutaVideoMp4}`);
    }
  } else {
    console.log('\n⏩ [6/7] Renderizado omitido por flag (audio, guion, hyperframes y copys generados).');
  }

  // [Paso 7]: Limpieza automática de residuos y temporales
  limpiarResiduos(carpetaSalida);

  const tiempoTotal = ((Date.now() - tiempoInicio) / 1000).toFixed(1);
  console.log(`\n✨ Proceso completado en ${tiempoTotal} segundos.`);
  console.log(`📂 Carpeta de entrega: ${carpetaSalida}`);

  return {
    id: brief.id,
    carpetaSalida,
    videoPath: rutaVideoMp4,
    guionPath: rutaGuionJson,
    copysPath: rutaCopysMd,
    vozPath: rutaVozMp3,
  };
}

/**
 * Generador del documento copys.md según especificación oficial (Sección 8)
 */
function generarMarkdownCopys(guion: GuionCompleto): string {
  const { copys, tema, formato, duracionTotalSegundos } = guion;

  return `# Copys & Hashtags Virales — ${tema}

> **Formato:** ${formato} | **Duración:** ${duracionTotalSegundos}s | **ID:** \`${guion.id}\`
> **Generado:** ${new Date(guion.generadoEn).toLocaleString('es-ES')}

---

## 🎵 TikTok

### Opciones de Gancho (Primeras líneas del caption):
${copys.tiktok.ganchos.map((g, i) => `${i + 1}. **${g}**`).join('\n')}

### Caption Listo para Publicar:
\`\`\`text
${copys.tiktok.caption}

${copys.tiktok.hashtags.join(' ')}
\`\`\`

---

## 📸 Instagram Reels

### Opciones de Gancho:
${copys.reels.ganchos.map((g, i) => `${i + 1}. **${g}**`).join('\n')}

### Caption Completo:
\`\`\`text
${copys.reels.caption}

${copys.reels.preguntaFinal}

${copys.reels.hashtags.join(' ')}
\`\`\`

---

## 🔴 YouTube Shorts

### Título Sugerido (Máx 70 caracteres):
\`\`\`text
${copys.shorts.titulo}
\`\`\`

### Descripción:
\`\`\`text
${copys.shorts.descripcion}

${copys.shorts.hashtags.join(' ')}
\`\`\`

---

*Generado automáticamente por el motor de código de NexusAI.*
`;
}
