import fs from 'fs';
import path from 'path';

/**
 * Sistema de Limpieza y Mantenimiento de Residuos
 * Garantiza que después de cada renderizado no queden archivos basura,
 * temporales de compilación, wavs intermedios ni cachés huérfanas.
 */
export function limpiarResiduos(carpetaSalida?: string): void {
  console.log('🧹 Ejecutando sistema de limpieza de residuos...');

  // 1. Limpiar temporales en la carpeta de salida específica
  if (carpetaSalida && fs.existsSync(carpetaSalida)) {
    const archivos = fs.readdirSync(carpetaSalida);
    for (const arch of archivos) {
      if (
        arch.endsWith('_cues.json') ||
        arch.endsWith('_input.txt') ||
        arch.endsWith('_temp.wav') ||
        arch.endsWith('.tmp')
      ) {
        try {
          fs.unlinkSync(path.join(carpetaSalida, arch));
          console.log(`   ✓ Eliminado temporal: ${arch}`);
        } catch {}
      }
    }
  }

  // 2. Limpiar temporales en la raíz de salida
  const salidaRoot = path.resolve('salida');
  if (fs.existsSync(salidaRoot)) {
    const rootFiles = fs.readdirSync(salidaRoot);
    for (const f of rootFiles) {
      if (f.endsWith('.tmp') || f.startsWith('test_') || f.endsWith('_temp.wav')) {
        try {
          fs.unlinkSync(path.join(salidaRoot, f));
        } catch {}
      }
    }
  }

  // 3. Limpiar compilaciones intermedias de Remotion (.remotion)
  const remotionDir = path.resolve('.remotion');
  if (fs.existsSync(remotionDir)) {
    try {
      fs.rmSync(remotionDir, { recursive: true, force: true });
      console.log('   ✓ Caché intermedia de Remotion (.remotion) limpiada.');
    } catch {}
  }

  console.log('✨ Limpieza completada. Cero residuos en el sistema.');
}

/**
 * Limpieza profunda completa (resetea carpetas de salida)
 */
export function limpiarTodo(): void {
  console.log('🧹 Limpieza profunda completa solicitada...');
  const salidaRoot = path.resolve('salida');
  if (fs.existsSync(salidaRoot)) {
    fs.rmSync(salidaRoot, { recursive: true, force: true });
    fs.mkdirSync(salidaRoot, { recursive: true });
  }

  const remotionDir = path.resolve('.remotion');
  if (fs.existsSync(remotionDir)) {
    fs.rmSync(remotionDir, { recursive: true, force: true });
  }

  console.log('✨ Sistema 100% restablecido y limpio.');
}
