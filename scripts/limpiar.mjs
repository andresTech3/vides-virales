import fs from 'fs';
import path from 'path';

/**
 * Sistema de Auto-Limpieza Inteligente de Video
 *
 * 1. Garantiza que el video final esté resguardado en salida/<slug>/video_<slug>.mp4
 * 2. Elimina node_modules temporales de style-video (ahorra ~800MB por proyecto)
 * 3. Elimina archivos pesados intermedios (ref.mp4, video_silent.mp4, audio_raw.wav, stills)
 * 4. Preserva el código fuente (src/, STYLE.md, package.json) para que sea 100% reproducible
 */

const ROOT = process.cwd();
const SALIDA_DIR = path.join(ROOT, 'salida');
const STYLE_VIDEO_DIR = path.join(ROOT, 'style-video');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirSize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dirPath, f.name);
    try {
      if (f.isDirectory()) {
        size += getDirSize(full);
      } else {
        size += fs.statSync(full).size;
      }
    } catch {}
  }
  return size;
}

export function autoLimpiar(slugFiltro = null) {
  console.log('🧹 [Auto-Limpieza] Iniciando optimización de almacenamiento...');
  let totalLiberado = 0;

  // 1. Limpieza de proyectos style-video
  if (fs.existsSync(STYLE_VIDEO_DIR)) {
    const slugs = fs.readdirSync(STYLE_VIDEO_DIR).filter((f) => {
      const full = path.join(STYLE_VIDEO_DIR, f);
      return fs.statSync(full).isDirectory();
    });

    for (const slug of slugs) {
      if (slugFiltro && slug !== slugFiltro) continue;
      const slugDir = path.join(STYLE_VIDEO_DIR, slug);
      console.log(`\n📦 Procesando proyecto de estilo: ${slug}`);

      // A. Asegurar que final.mp4 esté en salida/<slug>/
      const finalMp4 = path.join(slugDir, 'final.mp4');
      const destinoCarpeta = path.join(SALIDA_DIR, slug);
      const destinoVideo = path.join(destinoCarpeta, `video_${slug}.mp4`);

      if (fs.existsSync(finalMp4)) {
        if (!fs.existsSync(destinoCarpeta)) {
          fs.mkdirSync(destinoCarpeta, { recursive: true });
        }
        if (!fs.existsSync(destinoVideo)) {
          fs.copyFileSync(finalMp4, destinoVideo);
          console.log(`   ✓ Video final resguardado en: salida/${slug}/video_${slug}.mp4`);
        }
        // Resguardar STYLE.md y portada si existen
        const styleMd = path.join(slugDir, 'STYLE.md');
        if (fs.existsSync(styleMd)) {
          fs.copyFileSync(styleMd, path.join(destinoCarpeta, 'STYLE.md'));
        }
        const overviewJpg = path.join(slugDir, 'final_overview.jpg');
        if (fs.existsSync(overviewJpg)) {
          fs.copyFileSync(overviewJpg, path.join(destinoCarpeta, 'portada.jpg'));
        }
      }

      // B. Eliminar node_modules en remotion-project (ahorro masivo de ~800MB)
      const remotionNodeModules = path.join(slugDir, 'remotion-project', 'node_modules');
      if (fs.existsSync(remotionNodeModules)) {
        const size = getDirSize(remotionNodeModules);
        console.log(`   🗑️  Eliminando node_modules temporal (${formatBytes(size)})...`);
        fs.rmSync(remotionNodeModules, { recursive: true, force: true });
        totalLiberado += size;
      }

      // C. Eliminar archivos temporales pesados de render y audio
      const patronesABorrar = [
        'ref.mp4',
        'video_silent.mp4',
        'audio_raw.wav',
        'audio.wav',
        'wave.png',
        'ref.fdash*.mp4',
        'ref.fdash*.m4a',
      ];

      for (const archivo of fs.readdirSync(slugDir)) {
        const esPatron = patronesABorrar.some((pat) => {
          if (pat.includes('*')) {
            const prefix = pat.split('*')[0];
            return archivo.startsWith(prefix);
          }
          return archivo === pat;
        });

        // Borrar stills intermedios generados para QA
        const esStill = archivo.startsWith('still_') && archivo.endsWith('.jpg');

        if (esPatron || esStill) {
          const ruta = path.join(slugDir, archivo);
          try {
            const stat = fs.statSync(ruta);
            totalLiberado += stat.size;
            fs.unlinkSync(ruta);
            console.log(`   ✓ Eliminado temporal: ${archivo} (${formatBytes(stat.size)})`);
          } catch {}
        }
      }

      // D. Limpiar stills dentro de remotion-project si los hay
      const remotionProjDir = path.join(slugDir, 'remotion-project');
      if (fs.existsSync(remotionProjDir)) {
        for (const f of fs.readdirSync(remotionProjDir)) {
          if ((f.startsWith('still_') && (f.endsWith('.jpg') || f.endsWith('.png'))) || f.endsWith('.tmp')) {
            const r = path.join(remotionProjDir, f);
            try {
              const stat = fs.statSync(r);
              totalLiberado += stat.size;
              fs.unlinkSync(r);
              console.log(`   ✓ Eliminado still temporal: remotion-project/${f}`);
            } catch {}
          }
        }
      }
    }
  }

  // 2. Limpieza de cachés globales de Remotion (.remotion)
  const remotionGlobal = path.join(ROOT, '.remotion');
  if (fs.existsSync(remotionGlobal)) {
    const size = getDirSize(remotionGlobal);
    fs.rmSync(remotionGlobal, { recursive: true, force: true });
    totalLiberado += size;
    console.log(`   ✓ Caché global .remotion eliminada (${formatBytes(size)})`);
  }

  // 3. Limpieza de temporales en salida
  if (fs.existsSync(SALIDA_DIR)) {
    for (const f of fs.readdirSync(SALIDA_DIR)) {
      if (f.endsWith('.tmp') || f.endsWith('_temp.wav')) {
        const r = path.join(SALIDA_DIR, f);
        try {
          const stat = fs.statSync(r);
          totalLiberado += stat.size;
          fs.unlinkSync(r);
        } catch {}
      }
    }
  }

  console.log(`\n🎉 [Auto-Limpieza Completa] Espacio recuperado: ${formatBytes(totalLiberado)}`);
}

// Ejecución directa desde CLI si se llama con `node scripts/limpiar.mjs [slug]`
const slugArg = process.argv[2] || null;
autoLimpiar(slugArg);

