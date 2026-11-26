import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { PalabraSubtitulo } from '../esquemas/guion.schema.js';
import { normalizarTextoParaVoz } from './normalizadorTexto.js';

export interface ResultadoVoz {
  audioPath: string;
  duracionSegundos: number;
  subtitulos: PalabraSubtitulo[];
}

/**
 * Catálogo Curado de Voces Neurales Gratuitas de Alta Fidelidad (Microsoft Azure Cognitive)
 * 100% Gratuitas, sin API Key ni suscripción.
 */
export const VOCES_NEURALES_GRATUITAS = [
  {
    id: 'es-ES-AlvaroNeural',
    nombre: 'Álvaro (España)',
    genero: 'Masculino',
    estilo: 'Documental cinematográfico profundo, misterio y ciencia épica',
    recomendadoPara: ['what_if', 'mindblown_facts', 'top_ranking'],
  },
  {
    id: 'es-US-AlonsoNeural',
    nombre: 'Alonso (Latino / EE.UU.)',
    genero: 'Masculino',
    estilo: 'Enérgica, moderna, viral e influencer de TikTok',
    recomendadoPara: ['quiz_trivia', 'fake_chat', 'top_ranking'],
  },
  {
    id: 'es-CO-GonzaloNeural',
    nombre: 'Gonzalo (Colombia)',
    genero: 'Masculino',
    estilo: 'Español latinoamericano neutro, elegante y altamente explicativo',
    recomendadoPara: ['what_if', 'storytelling_split'],
  },
  {
    id: 'es-MX-DaliaNeural',
    nombre: 'Dalia (México)',
    genero: 'Femenino',
    estilo: 'Cálida, narrativa, dinámica y con excelente cadencia vocal',
    recomendadoPara: ['storytelling_split', 'mindblown_facts'],
  },
  {
    id: 'es-ES-ElviraNeural',
    nombre: 'Elvira (España)',
    genero: 'Femenino',
    estilo: 'Dramática, envolvente e imponente de gran pantalla',
    recomendadoPara: ['what_if', 'top_ranking'],
  },
  {
    id: 'es-MX-JorgeNeural',
    nombre: 'Jorge (México)',
    genero: 'Masculino',
    estilo: 'Locución grave clásica mexicana',
    recomendadoPara: ['what_if'],
  },
] as const;

/**
 * Servicio de Generación de Voz en Off y Subtítulos Sincronizados
 * Prioridad:
 * 1. ElevenLabs API (si ELEVENLABS_API_KEY está configurada).
 * 2. Motor Neural de Alta Fidelidad (Edge-TTS Azure Neural con Álvaro, Alonso o Gonzalo).
 * 3. Fallback determinista fonético con FFmpeg.
 */
export async function generarVoz(
  textoEntrada: string,
  outputPath: string,
  vozId: string = 'es-ES-AlvaroNeural'
): Promise<ResultadoVoz> {
  // 1. Normalizar automáticamente cualquier número o símbolo a palabras en español
  const texto = normalizarTextoParaVoz(textoEntrada);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Comprobar si ya existe en caché para no reprocesar
  const metadataPath = outputPath.replace(/\.[^.]+$/, '.meta.json');
  if (fs.existsSync(outputPath) && fs.existsSync(metadataPath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (cached.texto === texto && cached.duracionSegundos > 0) {
        console.log(`[Voz] Usando audio neural en caché para: "${texto.slice(0, 35)}..."`);
        return {
          audioPath: outputPath,
          duracionSegundos: cached.duracionSegundos,
          subtitulos: cached.subtitulos,
        };
      }
    } catch {
      // Regenerar si la caché está corrupta
    }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (apiKey && apiKey !== 'TU_API_KEY_AQUI' && apiKey.length > 20) {
    try {
      console.log(`[Voz] Solicitando narración a ElevenLabs con timestamps por palabra...`);
      return await generarConElevenLabs(texto, outputPath, apiKey, vozId);
    } catch (err: any) {
      console.warn(`[Voz] ElevenLabs falló (${err.message}). Cambiando al motor neural viral de alta fidelidad...`);
    }
  }

  // Motor Neural de Alta Fidelidad (Microsoft Azure Cognitive / Edge Neural)
  try {
    return await generarConEdgeNeural(texto, outputPath, vozId);
  } catch (err: any) {
    console.warn(`[Voz] Motor neural falló (${err.message}). Usando fallback secundario...`);
    return await generarConFallbackFFmpeg(texto, outputPath);
  }
}

/**
 * Generación con ElevenLabs API oficial con timestamps por palabra
 */
async function generarConElevenLabs(
  texto: string,
  outputPath: string,
  apiKey: string,
  vozId: string
): Promise<ResultadoVoz> {
  const voice = vozId === 'narrador_masculino_es' || vozId === 'es-MX-JorgeNeural'
    ? 'pNInz6obpgDQGcFmaJgB'
    : vozId;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: texto,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ElevenLabs HTTP ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as {
    audio_base64: string;
    alignment?: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
  };

  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  fs.writeFileSync(outputPath, audioBuffer);

  const subtitulos: PalabraSubtitulo[] = [];
  if (data.alignment) {
    const { characters, character_start_times_seconds, character_end_times_seconds } = data.alignment;
    let palabraActual = '';
    let inicioPalabra = 0;
    let finPalabra = 0;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const start = character_start_times_seconds[i];
      const end = character_end_times_seconds[i];

      if (char.trim() === '') {
        if (palabraActual.length > 0) {
          subtitulos.push({
            palabra: palabraActual,
            inicioMs: Math.round(inicioPalabra * 1000),
            finMs: Math.round(finPalabra * 1000),
            inicioFrame: Math.round(inicioPalabra * 30),
            finFrame: Math.round(finPalabra * 30),
          });
          palabraActual = '';
        }
      } else {
        if (palabraActual.length === 0) {
          inicioPalabra = start;
        }
        palabraActual += char;
        finPalabra = end;
      }
    }

    if (palabraActual.length > 0) {
      subtitulos.push({
        palabra: palabraActual,
        inicioMs: Math.round(inicioPalabra * 1000),
        finMs: Math.round(finPalabra * 1000),
        inicioFrame: Math.round(inicioPalabra * 30),
        finFrame: Math.round(finPalabra * 30),
      });
    }
  }

  const duracionSegundos =
    subtitulos.length > 0 ? subtitulos[subtitulos.length - 1].finMs / 1000 + 0.2 : 10;

  fs.writeFileSync(
    outputPath.replace(/\.[^.]+$/, '.meta.json'),
    JSON.stringify({ texto, duracionSegundos, subtitulos }, null, 2)
  );

  return { audioPath: outputPath, duracionSegundos, subtitulos };
}

/**
 * Motor Neural de Alta Fidelidad (Edge-TTS 7.3+)
 * Produce narraciones naturales con entonación humana, timbre claro y cadencia viral.
 */
async function generarConEdgeNeural(
  texto: string,
  outputPath: string,
  vozId: string
): Promise<ResultadoVoz> {
  let voz = vozId;
  if (voz === 'narrador_masculino_es' || !voz.includes('Neural')) {
    voz = 'es-ES-AlvaroNeural'; // Voz cinematográfica documental profunda y ultra-realista
  }
  console.log(`[Voz] Generando narración humana ultra-realista con voz neural: ${voz}...`);

  const tempTxt = outputPath.replace(/\.[^.]+$/, '_input.txt');
  const tempJson = outputPath.replace(/\.[^.]+$/, '_cues.json');
  const enginePy = path.resolve('src/servicios/tts_engine.py');

  fs.writeFileSync(tempTxt, texto, 'utf8');

  const venvPy = path.resolve('.venv/Scripts/python.exe');
  const pythonCmd = fs.existsSync(venvPy) ? `"${venvPy}"` : 'python';

  try {
    execSync(`${pythonCmd} "${enginePy}" "${tempTxt}" "${outputPath}" "${tempJson}" "${voz}" "+0%" "+0Hz"`, {
      stdio: 'pipe',
    });
  } finally {
    if (fs.existsSync(tempTxt)) {
      fs.unlinkSync(tempTxt);
    }
  }

  // Obtener duración exacta con ffprobe
  let duracionSegundos = 10;
  try {
    const probe = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`,
      { encoding: 'utf8' }
    );
    duracionSegundos = parseFloat(probe.trim()) || 10;
  } catch {
    duracionSegundos = Math.max(3, texto.split(/\s+/).length * 0.38);
  }

  // Leer las palabras y marcas de tiempo nativas
  const subtitulos: PalabraSubtitulo[] = [];

  if (fs.existsSync(tempJson)) {
    try {
      const cues = JSON.parse(fs.readFileSync(tempJson, 'utf8')) as Array<{
        start: number;
        end: number;
        content: string;
      }>;

      for (const cue of cues) {
        const contenido = cue.content?.trim();
        if (!contenido) continue;

        if (!contenido.includes(' ')) {
          // WordBoundary exacto de Edge-TTS
          const inicioMs = Math.round(cue.start * 1000);
          const finMs = Math.max(inicioMs + 100, Math.round(cue.end * 1000));
          subtitulos.push({
            palabra: contenido,
            inicioMs,
            finMs,
            inicioFrame: Math.round((inicioMs / 1000) * 30),
            finFrame: Math.round((finMs / 1000) * 30),
          });
        } else {
          // Fallback si viene una frase completa
          const palabras = contenido.split(/\s+/).filter(Boolean);
          const totalChars = palabras.reduce((acc, p) => acc + p.length, 0) || 1;
          const duracionCue = Math.max(0.15, cue.end - cue.start);

          let acumulado = cue.start;
          for (const p of palabras) {
            const durPalabra = Math.max(0.12, (p.length / totalChars) * duracionCue);
            const inicioMs = Math.round(acumulado * 1000);
            const finMs = Math.round((acumulado + durPalabra) * 1000);
            acumulado += durPalabra;

            subtitulos.push({
              palabra: p,
              inicioMs,
              finMs,
              inicioFrame: Math.round((inicioMs / 1000) * 30),
              finFrame: Math.round((finMs / 1000) * 30),
            });
          }
        }
      }
      fs.unlinkSync(tempJson);
    } catch {
      // Si falla lectura, fallback a distribución uniforme
    }
  }

  // Si no se extrajeron subtítulos detallados, distribuir sobre la duración total
  if (subtitulos.length === 0) {
    const palabras = texto.split(/\s+/).filter(Boolean);
    const totalChars = palabras.reduce((acc, p) => acc + p.length, 0) || 1;
    let tiempoAcum = 0.05;

    for (const p of palabras) {
      const dur = Math.max(0.12, (p.length / totalChars) * (duracionSegundos - 0.2));
      const inicioMs = Math.round(tiempoAcum * 1000);
      const finMs = Math.round((tiempoAcum + dur) * 1000);
      tiempoAcum += dur;

      subtitulos.push({
        palabra: p,
        inicioMs,
        finMs,
        inicioFrame: Math.round((inicioMs / 1000) * 30),
        finFrame: Math.round((finMs / 1000) * 30),
      });
    }
  }

  // Guardar metadata en caché
  fs.writeFileSync(
    outputPath.replace(/\.[^.]+$/, '.meta.json'),
    JSON.stringify({ texto, duracionSegundos, subtitulos }, null, 2)
  );

  return { audioPath: outputPath, duracionSegundos, subtitulos };
}

/**
 * Fallback determinista en caso extremo de que falle la red
 */
async function generarConFallbackFFmpeg(
  texto: string,
  outputPath: string
): Promise<ResultadoVoz> {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const duracionSegundos = Math.max(5, Math.round(palabras.length * 0.38));

  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${duracionSegundos} -q:a 9 -acodec libmp3lame "${outputPath}"`,
    { stdio: 'pipe' }
  );

  const totalChars = palabras.reduce((acc, p) => acc + p.length, 0) || 1;
  let tiempoAcum = 0.05;
  const subtitulos: PalabraSubtitulo[] = palabras.map((p) => {
    const dur = Math.max(0.12, (p.length / totalChars) * (duracionSegundos - 0.2));
    const inicioMs = Math.round(tiempoAcum * 1000);
    const finMs = Math.round((tiempoAcum + dur) * 1000);
    tiempoAcum += dur;
    return {
      palabra: p,
      inicioMs,
      finMs,
      inicioFrame: Math.round((inicioMs / 1000) * 30),
      finFrame: Math.round((finMs / 1000) * 30),
    };
  });

  return { audioPath: outputPath, duracionSegundos, subtitulos };
}
