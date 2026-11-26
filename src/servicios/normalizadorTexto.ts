/**
 * Normalizador Fonético de Texto para Motores de Voz Neural (TTS)
 * Convierte números, símbolos, porcentajes, temperaturas y unidades
 * a palabras completas en español para garantizar una dicción fluida y realista.
 */

const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const ESPECIALES = [
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'
];
const VEINTIS = [
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro',
  'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
];
const DECENAS = [
  '', '', '', 'treinta', 'cuarenta', 'cincuenta',
  'sesenta', 'setenta', 'ochenta', 'noventa'
];
const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
];

function seccionMenorMil(num: number): string {
  if (num === 0) return '';
  if (num === 100) return 'cien';

  const c = Math.floor(num / 100);
  const resto = num % 100;
  const res: string[] = [];

  if (c > 0) res.push(CENTENAS[c]);

  if (resto > 0 && resto < 10) {
    res.push(UNIDADES[resto]);
  } else if (resto >= 10 && resto < 20) {
    res.push(ESPECIALES[resto - 10]);
  } else if (resto >= 20 && resto < 30) {
    res.push(VEINTIS[resto - 20]);
  } else if (resto >= 30) {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (u === 0) {
      res.push(DECENAS[d]);
    } else {
      res.push(`${DECENAS[d]} y ${UNIDADES[u]}`);
    }
  }

  return res.filter(Boolean).join(' ').trim();
}

/**
 * Convierte un número entero positivo en su representación textual en español.
 */
export function numeroAPalabras(num: number): string {
  if (isNaN(num)) return '';
  if (num === 0) return 'cero';

  const n = Math.floor(Math.abs(num));

  if (n < 1000) {
    return seccionMenorMil(n);
  }

  if (n < 1_000_000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    const parteMiles = miles === 1 ? 'mil' : `${seccionMenorMil(miles)} mil`;
    const parteResto = seccionMenorMil(resto);
    return `${parteMiles} ${parteResto}`.trim();
  }

  if (n < 1_000_000_000) {
    const millones = Math.floor(n / 1_000_000);
    const resto = n % 1_000_000;
    const parteMillones = millones === 1 ? 'un millón' : `${seccionMenorMil(millones)} millones`;
    const parteResto = numeroAPalabras(resto);
    return `${parteMillones} ${parteResto}`.trim();
  }

  if (n < 1_000_000_000_000) {
    const milesMillones = Math.floor(n / 1_000_000_000);
    const resto = n % 1_000_000_000;
    const parteMiles = milesMillones === 1 ? 'mil millones' : `${seccionMenorMil(milesMillones)} mil millones`;
    const parteResto = numeroAPalabras(resto);
    return `${parteMiles} ${parteResto}`.trim();
  }

  return num.toString();
}

/**
 * Normaliza cualquier texto para narración en off:
 * 1. Convierte unidades compuestas (km/h, km/s, °C, %)
 * 2. Reemplaza números con separadores de miles (18.470, 40,000, 2.000) por palabras
 * 3. Reemplaza números simples (24, 300, 10) por palabras
 * 4. Ajusta signos especiales (+, x, /) para entonación natural
 */
export function normalizarTextoParaVoz(textoOriginal: string): string {
  if (!textoOriginal) return '';

  let t = textoOriginal;

  // Unidades compuestas y velocidades
  t = t.replace(/(\d+[\d.,]*)\s*km\/h/gi, (_, n) => `${limpiarYConvertir(n)} kilómetros por hora`);
  t = t.replace(/(\d+[\d.,]*)\s*km\/s/gi, (_, n) => `${limpiarYConvertir(n)} kilómetros por segundo`);
  t = t.replace(/(\d+[\d.,]*)\s*km\b/gi, (_, n) => `${limpiarYConvertir(n)} kilómetros`);
  t = t.replace(/(\d+[\d.,]*)\s*m\b/gi, (_, n) => `${limpiarYConvertir(n)} metros`);

  // Temperaturas y grados
  t = t.replace(/(\d+[\d.,]*)\s*(°C|grados\s*celsius|grados\s*centígrados)/gi, (_, n) => `${limpiarYConvertir(n)} grados centígrados`);
  t = t.replace(/(\d+[\d.,]*)\s*°/g, (_, n) => `${limpiarYConvertir(n)} grados`);

  // Porcentajes
  t = t.replace(/\+(\d+[\d.,]*)\s*%/g, (_, n) => `más del ${limpiarYConvertir(n)} por ciento`);
  t = t.replace(/(\d+[\d.,]*)\s*%/g, (_, n) => `${limpiarYConvertir(n)} por ciento`);

  // Multiplicadores (10x, 2x)
  t = t.replace(/\b(\d+)\s*[xX]\b/g, (_, n) => `${limpiarYConvertir(n)} veces`);

  // Horas, días, minutos abreviados
  t = t.replace(/(\d+)\s*hrs?\b/gi, (_, n) => `${limpiarYConvertir(n)} horas`);
  t = t.replace(/(\d+)\s*h\b/gi, (_, n) => `${limpiarYConvertir(n)} horas`);
  t = t.replace(/(\d+)\s*mins?\b/gi, (_, n) => `${limpiarYConvertir(n)} minutos`);
  t = t.replace(/(\d+)\s*seg\b/gi, (_, n) => `${limpiarYConvertir(n)} segundos`);

  // Números con separadores de miles o decimales
  // Ej: 18.470, 40.000, 2.000, 384.000 o con coma 18,470
  t = t.replace(/\b(\d{1,3}(?:[.,]\d{3})+)\b/g, (match) => {
    return limpiarYConvertir(match);
  });

  // Números enteros aislados de 1 a 6 dígitos
  t = t.replace(/\b(\d+)\b/g, (match) => {
    const val = parseInt(match, 10);
    return isNaN(val) ? match : numeroAPalabras(val);
  });

  // Limpiar espacios repetidos y retocar signos de interrogación o exclamación
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

function limpiarYConvertir(numeroStr: string): string {
  // Quitar puntos o comas que actúan como separadores de miles
  // Si tiene formato de miles estándar: 18.470 -> 18470
  const limpio = numeroStr.replace(/[.,]/g, '');
  const val = parseInt(limpio, 10);
  if (isNaN(val)) return numeroStr;
  return numeroAPalabras(val);
}
