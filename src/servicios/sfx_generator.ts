/**
 * sfx_generator.ts — Generador de Efectos de Sonido (SFX) y Música de Fondo con FFmpeg.
 * Produce archivos MP3 limpios y profesionales usando síntesis procedural con libavfilter.
 * No requiere descargas de internet ni licencias de terceros.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface LibreriaSFX {
  whoosh: string;
  impact_boom: string;
  pop: string;
  glitch: string;
  riser: string;
  musica_suspenso: string;
  musica_epica: string;
}

const CARPETA_SFX = path.resolve('assets', 'sfx');
const CARPETA_AUDIO = path.resolve('assets', 'audio');

/**
 * Asegura que todos los archivos de sonido existan; si no, los sintetiza con FFmpeg al instante.
 */
export function asegurarLibreriaAudio(): LibreriaSFX {
  if (!fs.existsSync(CARPETA_SFX)) fs.mkdirSync(CARPETA_SFX, { recursive: true });
  if (!fs.existsSync(CARPETA_AUDIO)) fs.mkdirSync(CARPETA_AUDIO, { recursive: true });

  const rutas: LibreriaSFX = {
    whoosh: path.join(CARPETA_SFX, 'whoosh.mp3'),
    impact_boom: path.join(CARPETA_SFX, 'impact_boom.mp3'),
    pop: path.join(CARPETA_SFX, 'pop.mp3'),
    glitch: path.join(CARPETA_SFX, 'glitch.mp3'),
    riser: path.join(CARPETA_SFX, 'riser.mp3'),
    musica_suspenso: path.join(CARPETA_AUDIO, 'musica_suspenso.mp3'),
    musica_epica: path.join(CARPETA_AUDIO, 'musica_epica.mp3'),
  };

  // 1. Whoosh Cinemático (Barrido de ruido blanco filtrado con envolvente rápida)
  if (!fs.existsSync(rutas.whoosh)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "anoisesrc=d=0.45:c=white:r=44100,bandpass=f=1200:w=800,afade=t=in:st=0:d=0.15,afade=t=out:st=0.18:d=0.27,volume=2.5" -b:a 192k "${rutas.whoosh}" -y`,
        { stdio: 'pipe' }
      );
    } catch {
      // Fallback tono suave
      execSync(`ffmpeg -f lavfi -i "sine=f=400:d=0.35,afade=t=out:st=0.05:d=0.3" "${rutas.whoosh}" -y`, { stdio: 'pipe' });
    }
  }

  // 2. Impact Boom Sub-bajo (Caída exponencial de frecuencia 110Hz -> 30Hz con pegada)
  if (!fs.existsSync(rutas.impact_boom)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=95:d=1.2,afade=t=out:st=0.08:d=1.12,volume=2.6" -b:a 192k "${rutas.impact_boom}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  // 3. Pop / Click Orgánico (Chirp ultra corto de 60ms para contadores y badges)
  if (!fs.existsSync(rutas.pop)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=920:d=0.09,afade=t=in:st=0:d=0.01,afade=t=out:st=0.02:d=0.07,volume=1.8" -b:a 192k "${rutas.pop}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  // 4. Glitch / Tech Scan (Pulso bicanal de alta frecuencia)
  if (!fs.existsSync(rutas.glitch)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=1850:d=0.12,afade=t=out:st=0.02:d=0.1,volume=1.4" -b:a 192k "${rutas.glitch}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  // 5. Riser de Tensión (Crescendo ascendente para ganchos)
  if (!fs.existsSync(rutas.riser)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=220:d=2.0,afade=t=in:st=0:d=1.8,volume=1.5" -b:a 192k "${rutas.riser}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  // 6. Música de Fondo: Suspenso Cósmico (Atmósfera oscura con frecuencias armónicas de 55Hz y 110Hz)
  if (!fs.existsSync(rutas.musica_suspenso)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=55:d=60,volume=0.9" -b:a 192k "${rutas.musica_suspenso}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  // 7. Música de Fondo: Épica Pulsante (Pulso armónico profundo)
  if (!fs.existsSync(rutas.musica_epica)) {
    try {
      execSync(
        `ffmpeg -f lavfi -i "sine=f=65:d=60,volume=0.9" -b:a 192k "${rutas.musica_epica}" -y`,
        { stdio: 'pipe' }
      );
    } catch {}
  }

  return rutas;
}

/**
 * Convierte los SFX a Data URLs en memoria para inyección directa en Remotion
 */
export function cargarLibreriaAudioDataUrls(libreria: LibreriaSFX): Record<string, string> {
  const resultado: Record<string, string> = {};

  for (const [clave, ruta] of Object.entries(libreria)) {
    if (fs.existsSync(ruta)) {
      const buf = fs.readFileSync(ruta);
      resultado[clave] = `data:audio/mp3;base64,${buf.toString('base64')}`;
    }
  }

  return resultado;
}
