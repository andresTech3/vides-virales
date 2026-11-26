import type { Brief } from '../esquemas/brief.schema.js';
import type { GuionCompleto, EscenaGuion, Copys } from '../esquemas/guion.schema.js';

/**
 * Servicio de Generación de Guiones Virales Multiformato
 * Soporta:
 * - Gemini API (si GEMINI_API_KEY está configurada en .env / .env.local).
 * - Motores de plantillas de alta retención para 7 formatos virales distintos.
 */
export async function generarGuion(brief: Brief): Promise<GuionCompleto> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'FAKE_GEMINI_KEY_REPLACE_WITH_REAL' && apiKey.length > 15) {
    try {
      console.log(`[LLM] Generando guion viral con Gemini para formato: ${brief.formato}...`);
      return await generarConGemini(brief, apiKey);
    } catch (err: any) {
      console.warn(`[LLM] Falló llamada a Gemini (${err.message}). Utilizando generador procedural experto...`);
    }
  }

  // Generador inteligente estructurado por formato
  return generarProcedural(brief);
}

/**
 * Generador con Gemini API oficial (Structured JSON)
 */
async function generarConGemini(brief: Brief, apiKey: string): Promise<GuionCompleto> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
Eres el director creativo de una agencia de videos virales cortos para TikTok, Instagram Reels y YouTube Shorts (9:16).
Crea un guion estructurado para el siguiente brief:
Tema: "${brief.tema}"
Formato viral: "${brief.formato}"
Estilo visual: "${brief.estilo}"
Duración deseada: ${brief.duracionSegundos} segundos
Tono: "${brief.tono}"
Dato grande opcional: "${brief.datoGrande || 'a calcular'}"

REGLAS DE RETENCIÓN EXTREMA:
1. Primer segundo: Hook visual y sonoro agresivo que impida hacer scroll.
2. Cambio de escena visual cada 2.5 a 4 segundos.
3. Frases cortas y contundentes. Vocabulario directo.
4. Cierre con bucle (loop) o pregunta de alta fricción para provocar comentarios.
5. Los hashtags SIEMPRE deben ser en INGLÉS (ej. #whatif #fyp #viral #mindblown #facts), mientras los captions van en español.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura:
{
  "escenas": [
    {
      "id": "escena_1",
      "tipo": "hook",
      "textoNarracion": "Frase que se dirá en voz en off...",
      "tituloVisual": "TEXTO GIGANTE EN PANTALLA",
      "subtituloVisual": "Texto secundario",
      "datoDestacado": "100%",
      "duracionAproxSegundos": 3,
      "verificar": false
    }
  ],
  "copys": {
    "tiktok": {
      "ganchos": ["Gancho 1", "Gancho 2", "Gancho 3"],
      "caption": "Texto del caption con gancho y llamada a la acción",
      "hashtags": ["#whatif", "#facts", "#fyp", "#viral", "#science"]
    },
    "reels": {
      "ganchos": ["Gancho 1", "Gancho 2", "Gancho 3"],
      "caption": "Caption más detallado...",
      "preguntaFinal": "¿Qué harías tú?",
      "hashtags": ["#reelsviral", "#didyouknow", "#mindblown", "#trending"]
    },
    "shorts": {
      "titulo": "Título de impacto de menos de 70 caracteres",
      "descripcion": "Descripción corta del Short",
      "hashtags": ["#shorts", "#viral", "#facts"]
    }
  }
}
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}`);
  }

  const json = await response.json() as any;
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Respuesta vacía de Gemini');

  const parsed = JSON.parse(rawText);

  // Mapear a GuionCompleto con timestamps de frames iniciales
  let acumuladoFrames = 0;
  const escenas: EscenaGuion[] = (parsed.escenas || []).map((e: any, idx: number) => {
    const durSec = e.duracionAproxSegundos || 4;
    const durFrames = Math.round(durSec * 30);
    const inicio = acumuladoFrames;
    acumuladoFrames += durFrames;

    return {
      id: e.id || `escena_${idx + 1}`,
      tipo: e.tipo || 'escena_mundo',
      duracionSegundos: durSec,
      inicioFrame: inicio,
      duracionFrames: durFrames,
      textoNarracion: e.textoNarracion || '',
      tituloVisual: e.tituloVisual,
      subtituloVisual: e.subtituloVisual,
      datoDestacado: e.datoDestacado,
      props: {},
      subtitulos: [],
      verificar: Boolean(e.verificar),
    };
  });

  return {
    id: brief.id,
    tema: brief.tema,
    formato: brief.formato,
    estilo: brief.estilo,
    duracionTotalSegundos: brief.duracionSegundos,
    fps: 30,
    totalFrames: acumuladoFrames || brief.duracionSegundos * 30,
    voz: brief.voz,
    musica: brief.musica,
    escenas,
    copys: parsed.copys || generarCopysPorDefecto(brief),
    generadoEn: new Date().toISOString(),
  };
}

/**
 * Generador procedural inteligente que produce guiones profesionales para cada uno de los 7 formatos virales
 */
function generarProcedural(brief: Brief): GuionCompleto {
  let escenas: EscenaGuion[] = [];
  const copys = generarCopysPorDefecto(brief);

  switch (brief.formato) {
    case 'what_if':
      const esChoqueLuna =
        brief.tema.toLowerCase().includes('luna') ||
        brief.tema.toLowerCase().includes('moon');
      const esTierraPlana = brief.tema.toLowerCase().includes('plana');
      const esUltimoHombre =
        brief.tema.toLowerCase().includes('hombre') ||
        brief.tema.toLowerCase().includes('mujeres');
      const esMontanaRusa =
        brief.tema.toLowerCase().includes('montana') ||
        brief.tema.toLowerCase().includes('montaña') ||
        brief.tema.toLowerCase().includes('rusa') ||
        brief.tema.toLowerCase().includes('coaster');

      if (esChoqueLuna) {
        escenas = [
          {
            id: 'hook_choque_luna',
            tipo: 'hook',
            duracionSegundos: 5,
            inicioFrame: 0,
            duracionFrames: 150,
            textoNarracion: '¿Qué pasaría si la Luna comenzara a caer en picada hacia la Tierra? La catástrofe empezaría mucho antes de que toque el suelo.',
            tituloVisual: '¿Y SI LA LUNA CHOCA?',
            subtituloVisual: 'TRAYECTORIA DE COLISIÓN ORBITAL',
            datoDestacado: 'COLAPSO CÓSMICO',
            props: {
              escenario: 'choque_luna',
              etapa: 'aproximacion_luna',
            },
            subtitulos: [],
            verificar: false,
          },
          {
            id: 'limite_roche_luna',
            tipo: 'dato_grande',
            duracionSegundos: 7,
            inicioFrame: 150,
            duracionFrames: 210,
            textoNarracion: 'Al llegar a los dieciocho mil cuatrocientos setenta kilómetros cruzaría el límite de Roche. La colosal gravedad terrestre destrozaría la Luna entera en billones de rocas y magma hirviente.',
            tituloVisual: '18.470 KM // LÍMITE DE ROCHE',
            subtituloVisual: 'DESINTEGRACIÓN GRAVITATORIA',
            datoDestacado: 'FRACTURA LUNAR',
            props: {
              escenario: 'choque_luna',
              etapa: 'limite_roche',
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'bombardeo_cataclismo',
            tipo: 'consecuencia',
            duracionSegundos: 8,
            inicioFrame: 360,
            duracionFrames: 240,
            textoNarracion: 'Una lluvia apocalíptica de meteoritos bombardearía el planeta a cuarenta mil kilómetros por hora. La atmósfera alcanzaría dos mil grados y los océanos hervirían en cuestión de minutos.',
            tituloVisual: '2.000 °C EN LA SUPERFICIE',
            subtituloVisual: 'OCÉANOS EVAPORADOS AL INSTANTE',
            datoDestacado: 'BOMBARDEO MASIVO',
            props: {
              escenario: 'choque_luna',
              etapa: 'bombardeo_cataclismo',
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'fusion_anillos',
            tipo: 'giro',
            duracionSegundos: 7,
            inicioFrame: 600,
            duracionFrames: 210,
            textoNarracion: 'La Tierra no explotaría. Ambos cuerpos se fundirían en una supertierra de lava rodeada por un descomunal anillo de fuego, como los anillos de Saturno.',
            tituloVisual: 'ANILLO DE FUEGO CÓSMICO',
            subtituloVisual: 'FUSIÓN PLANETARIA DE MAGMA',
            datoDestacado: 'NUEVA SUPERTIERRA',
            props: {
              escenario: 'choque_luna',
              etapa: 'fusion_anillos',
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'cierre_luna',
            tipo: 'cierre',
            duracionSegundos: 5,
            inicioFrame: 810,
            duracionFrames: 150,
            textoNarracion: '¿Crees que la humanidad tendría tiempo de escapar a Marte antes del impacto final? Comenta tu teoría.',
            tituloVisual: '¿LOGRARÍAS ESCAPAR A MARTE?',
            subtituloVisual: 'DEJA TU TEORÍA EN COMENTARIOS',
            datoDestacado: 'ESCAPE ESPACIAL',
            props: {
              escenario: 'choque_luna',
              etapa: 'cierre_bucle',
            },
            subtitulos: [],
            verificar: false,
          },
        ];
      } else if (esUltimoHombre) {
        escenas = [
          {
            id: 'hook_ultimo_hombre',
            tipo: 'hook',
            duracionSegundos: 7,
            inicioFrame: 0,
            duracionFrames: 210,
            textoNarracion: '¿Y si mañana despiertas y eres el ÚNICO hombre vivo en un planeta de cuatro mil millones de mujeres? Si crees que serías un rey, la realidad científica te va a aterrorizar.',
            tituloVisual: '¿Y SI FUERAS EL ÚLTIMO HOMBRE?',
            subtituloVisual: '1 CONTRA 4.000.000.000 DE MUJERES',
            datoDestacado: '1 EN LA TIERRA',
            props: {
              escenario: 'ultimo_hombre',
              etapa: 'hook_multitud',
            },
            subtitulos: [],
            verificar: false,
          },
          {
            id: 'bunker_bioseguridad',
            tipo: 'dato_grande',
            duracionSegundos: 9,
            inicioFrame: 210,
            duracionFrames: 270,
            textoNarracion: 'En menos de veinticuatro horas perderías toda tu libertad. Serías declarado el recurso de bioseguridad más valioso del planeta, custodiado en un búnker subterráneo estéril bajo vigilancia médica permanente.',
            tituloVisual: 'BÚNKER DE BIOSEGURIDAD NIVEL 4',
            subtituloVisual: 'RECURSO BIOLÓGICO CLASIFICADO',
            datoDestacado: 'MÁXIMO AISLAMIENTO',
            props: {
              escenario: 'ultimo_hombre',
              etapa: 'bunker_aislamiento',
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'colapso_genetico',
            tipo: 'consecuencia',
            duracionSegundos: 10,
            inicioFrame: 480,
            duracionFrames: 300,
            textoNarracion: 'La especie enfrentaría el peor cuello de botella genético de la historia. Sin diversidad en el cromosoma Y, la reproducción natural causaría mutaciones letales. La fertilización in vitro y la clonación serían la única salvación.',
            tituloVisual: 'CUELLO DE BOTELLA GENÉTICO',
            subtituloVisual: 'COLAPSO DEL CROMOSOMA Y',
            datoDestacado: 'CRISIS EXTINCIÓN',
            props: {
              escenario: 'ultimo_hombre',
              etapa: 'colapso_genetico',
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'cierre_ultimo_hombre',
            tipo: 'cierre',
            duracionSegundos: 7,
            inicioFrame: 780,
            duracionFrames: 210,
            textoNarracion: 'Toda la economía global trabajaría para mantenerte con vida hasta tu último respiro. ¿Aceptarías vivir en una jaula de cristal para salvar a la humanidad? Comenta qué harías tú.',
            tituloVisual: '¿ACEPTARÍAS LA JAULA?',
            subtituloVisual: 'COMENTA TU DECISIÓN',
            datoDestacado: 'SÍGUENOS',
            props: {
              escenario: 'ultimo_hombre',
              etapa: 'cierre_planeta',
            },
            subtitulos: [],
            verificar: false,
          },
        ];
      } else if (esMontanaRusa) {
        escenas = [
          {
            id: 'hook',
            tipo: 'hook',
            duracionSegundos: 4,
            inicioFrame: 0,
            duracionFrames: 120,
            textoNarracion: '¿Qué pasaría si construyéramos una montaña rusa en el espacio? La respuesta desafía todas las leyes del universo.',
            tituloVisual: 'MONTAÑA RUSA EN EL ESPACIO',
            subtituloVisual: 'FÍSICA ORBITAL & VELOCIDAD PURA',
            datoDestacado: '400 KM DE ALTITUD',
            props: {
              escenario: 'montana_rusa',
              etapa: 'hook_cima',
              hud: {
                tipo: 'fisica',
                datos: [
                  { etiqueta: 'ALTITUD', valor: '412', unidad: 'KM', color: '#38bdf8' },
                  { etiqueta: 'RESISTENCIA AIRE', valor: '0.00', unidad: 'N', color: '#10b981' },
                  { etiqueta: 'GRAVEDAD', valor: '0.0', unidad: 'G', color: '#f59e0b' },
                ],
              },
            },
            subtitulos: [],
            verificar: false,
          },
          {
            id: 'dato_grande',
            tipo: 'dato_grande',
            duracionSegundos: 6,
            inicioFrame: 120,
            duracionFrames: 180,
            textoNarracion: 'En el vacío no hay aire. Sin resistencia del viento, no existe velocidad terminal. En una sola caída, el tren aceleraría hasta superar los cuarenta mil kilómetros por hora.',
            tituloVisual: '40,000 KM/H',
            subtituloVisual: 'SIN RESISTENCIA DEL AIRE',
            datoDestacado: 'ACELERACIÓN INFINITA',
            props: {
              escenario: 'montana_rusa',
              etapa: 'caida_aceleracion',
              hud: {
                tipo: 'contador',
                datos: [
                  { etiqueta: 'VELOCIDAD', valor: '40,320', unidad: 'KM/H', color: '#ef4444' },
                  { etiqueta: 'FRICCIÓN AIRE', valor: '0.0', unidad: 'N', color: '#38bdf8' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'consecuencia',
            tipo: 'consecuencia',
            duracionSegundos: 7,
            inicioFrame: 300,
            duracionFrames: 210,
            textoNarracion: 'Al entrar al primer loop en gravedad cero, la fuerza centrípeta aplastaría tu cuerpo con más de catorce G. Tu sangre descendería a los pies y perderías el conocimiento al instante.',
            tituloVisual: '14.2 G CENTRÍPETAS',
            subtituloVisual: 'COLAPSO BIOMÉTRICO INMEDIATO',
            datoDestacado: 'LÍMITE HUMANO',
            props: {
              escenario: 'montana_rusa',
              etapa: 'loop_gravedad_cero',
              hud: {
                tipo: 'biometrico',
                datos: [
                  { etiqueta: 'FUERZA G', valor: '14.2', unidad: 'G', color: '#ef4444' },
                  { etiqueta: 'PULSO', valor: '195', unidad: 'BPM', color: '#ef4444' },
                  { etiqueta: 'ESTADO', valor: 'BLACKOUT', color: '#f59e0b' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'giro',
            tipo: 'giro',
            duracionSegundos: 7,
            inicioFrame: 510,
            duracionFrames: 210,
            textoNarracion: 'Y los frenos jamás funcionarían. En el vacío, el metal se suelda en frío y sin aire que disipe el calor, el tren rompería la gravedad terrestre disparándose hacia el cosmos profundo.',
            tituloVisual: 'SOLDADURA EN FRÍO',
            subtituloVisual: 'ESCAPE DE LA GRAVEDAD TERRESTRE',
            datoDestacado: 'FRENOS FUNDIDOS',
            props: {
              escenario: 'montana_rusa',
              etapa: 'fuga_frenos_fallo',
              hud: {
                tipo: 'temperatura',
                datos: [
                  { etiqueta: 'TEMP. FRENOS', valor: '+1,480', unidad: '°C', color: '#ef4444' },
                  { etiqueta: 'VELOCIDAD ESCAPE', valor: '11.2', unidad: 'KM/S', color: '#10b981' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'cierre',
            tipo: 'cierre',
            duracionSegundos: 6,
            inicioFrame: 720,
            duracionFrames: 180,
            textoNarracion: 'El convoy orbitaría el Sol por millones de años como la atracción más rápida del cosmos. ¿Te atreverías a subir? Comenta y síguenos para más ciencia extrema.',
            tituloVisual: 'BUCLE CÓSMICO ETERNO',
            subtituloVisual: '¿TE ATREVERÍAS A SUBIR?',
            datoDestacado: 'SÍGUENOS',
            props: {
              escenario: 'montana_rusa',
              etapa: 'deriva_eterna',
              hud: {
                tipo: 'mision',
                datos: [
                  { etiqueta: 'DESTINO', valor: 'ÓRBITA SOLAR', color: '#38bdf8' },
                  { etiqueta: 'DURACIÓN', valor: 'ETERNA', color: '#f59e0b' },
                ],
              },
            },
            subtitulos: [],
            verificar: false,
          },
        ];
      } else if (
        brief.tema.toLowerCase().includes('bacteri') ||
        brief.tema.toLowerCase().includes('microbio') ||
        (brief.tema.toLowerCase().includes('cuerpo') && brief.tema.toLowerCase().includes('viven'))
      ) {
        escenas = [
          {
            id: 'hook_microbio',
            tipo: 'hook',
            duracionSegundos: 4,
            inicioFrame: 0,
            duracionFrames: 120,
            textoNarracion: '¿Sabías que no eres un solo ser humano? Eres un planeta andante donde viven treinta y ocho billones de bacterias.',
            tituloVisual: 'NO ERES SOLO HUMANO',
            subtituloVisual: 'UN PLANETA ANDANTE DE BACTERIAS',
            datoDestacado: '38 BILLONES VIVAS',
            props: {
              escenario: 'microbioma',
              etapa: 'zoom_entrada',
              hud: {
                tipo: 'cientifico',
                datos: [
                  { etiqueta: 'POBLACIÓN', valor: '38,000,000,000,000', unidad: 'CÉLULAS', color: '#10b981' },
                  { etiqueta: 'PROPORCIÓN', valor: '1.3 a 1', color: '#38bdf8' },
                ],
              },
            },
            subtitulos: [],
            verificar: false,
          },
          {
            id: 'dato_poblacion',
            tipo: 'dato_grande',
            duracionSegundos: 6,
            inicioFrame: 120,
            duracionFrames: 180,
            textoNarracion: 'Por cada célula humana en tu organismo, tienes más de una bacteria viva. En realidad, solo el cuarenta y tres por ciento de tu cuerpo es verdaderamente tú.',
            tituloVisual: 'SOLO 43% HUMANO',
            subtituloVisual: 'EL 57% RESTANTE SON MICROORGANISMOS',
            datoDestacado: '57% BACTERIANO',
            props: {
              escenario: 'microbioma',
              etapa: 'enjambre_bacterias',
              hud: {
                tipo: 'contador',
                datos: [
                  { etiqueta: 'CÉLULAS HUMANAS', valor: '43%', color: '#f59e0b' },
                  { etiqueta: 'MICROBIOMA', valor: '57%', color: '#10b981' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'segundo_cerebro',
            tipo: 'consecuencia',
            duracionSegundos: 7,
            inicioFrame: 300,
            duracionFrames: 210,
            textoNarracion: 'En tu intestino forman una selva que produce el noventa por ciento de la serotonina de tu cuerpo. Ellas influyen en tu felicidad, tu ansiedad e incluso en los antojos que sientes.',
            tituloVisual: 'CONTROLAN TU CEREBRO',
            subtituloVisual: 'PRODUCEN EL 90% DE TU SEROTONINA',
            datoDestacado: '90% SEROTONINA',
            props: {
              escenario: 'microbioma',
              etapa: 'segundo_cerebro',
              hud: {
                tipo: 'biometrico',
                datos: [
                  { etiqueta: 'SEROTONINA INTESTINAL', valor: '90%', color: '#38bdf8' },
                  { etiqueta: 'CONEXIÓN VAGO', valor: 'ACTIVA', color: '#10b981' },
                  { etiqueta: 'IMPACTO ANÍMICO', valor: 'TOTAL', color: '#ef4444' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'peso_biomasa',
            tipo: 'giro',
            duracionSegundos: 6,
            inicioFrame: 510,
            duracionFrames: 180,
            textoNarracion: 'Si las juntaras todas, pesarían dos kilos completos de masa viva. Y albergan dos millones de genes distintos, frente a solo veinte mil genes humanos.',
            tituloVisual: '2 KILOS DE BACTERIAS',
            subtituloVisual: '2.000.000 DE GENES NO HUMANOS',
            datoDestacado: '2.0 KG DE PESO',
            props: {
              escenario: 'microbioma',
              etapa: 'peso_biomasa',
              hud: {
                tipo: 'peso_escala',
                datos: [
                  { etiqueta: 'PESO TOTAL', valor: '2.0', unidad: 'KG', color: '#f59e0b' },
                  { etiqueta: 'GENES BACTERIANOS', valor: '99%', color: '#10b981' },
                ],
              },
            },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'cierre_universo',
            tipo: 'cierre',
            duracionSegundos: 5,
            inicioFrame: 690,
            duracionFrames: 150,
            textoNarracion: 'Sin ellas, morirías en cuestión de semanas. ¿Crees que eres tú quien decide lo que comes? Comenta y síguenos para más revelaciones.',
            tituloVisual: '¿QUIÉN DECIDE EN TU CUERPO?',
            subtituloVisual: 'DEJA TU OPINIÓN EN COMENTARIOS',
            datoDestacado: 'SÍGUENOS',
            props: {
              escenario: 'microbioma',
              etapa: 'universo_interior',
              hud: {
                tipo: 'mision',
                datos: [
                  { etiqueta: 'SUPERVIVENCIA', valor: 'SIMBIÓTICA', color: '#10b981' },
                  { etiqueta: 'ESTADO', valor: 'ECOSISTEMA VIVO', color: '#38bdf8' },
                ],
              },
            },
            subtitulos: [],
            verificar: false,
          },
        ];
      } else if (esTierraPlana) {
        escenas = [
            {
              id: 'hook',
              tipo: 'hook',
              duracionSegundos: 4,
              inicioFrame: 0,
              duracionFrames: 120,
              textoNarracion: '¿Qué pasaría si la Tierra fuera realmente plana? La física real tiene una respuesta aterradora.',
              tituloVisual: '¿Y SI LA TIERRA FUERA PLANA?',
              subtituloVisual: 'SIMULACIÓN CIENTÍFICA REAL',
              datoDestacado: 'FÍSICA EXTREMA',
              props: {},
              subtitulos: [],
              verificar: false,
            },
            {
              id: 'dato_grande',
              tipo: 'dato_grande',
              duracionSegundos: 6,
              inicioFrame: 120,
              duracionFrames: 180,
              textoNarracion: 'En un disco plano, la gravedad no tiraría hacia abajo. Te arrastraría con fuerza brutal hacia el Polo Norte, el centro exacto del planeta.',
              tituloVisual: 'GRAVEDAD RADIAL',
              subtituloVisual: 'ATRACCIÓN DIRECTA HACIA EL CENTRO',
              datoDestacado: '100% AL POLO NORTE',
              props: { animacion: 'contador' },
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'consecuencia',
              tipo: 'consecuencia',
              duracionSegundos: 8,
              inicioFrame: 300,
              duracionFrames: 240,
              textoNarracion: 'Cuanto más te alejes del centro, más inclinado tendrías que caminar. En las ciudades caminarías doblado a noventa grados, mientras todos los océanos se precipitan al centro formando una descomunal montaña de agua.',
              tituloVisual: 'CAMINAR A 90°',
              subtituloVisual: 'TSUNAMI Y COLAPSO DE LA GRAVEDAD',
              datoDestacado: 'INCLINACIÓN TOTAL',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'giro',
              tipo: 'giro',
              duracionSegundos: 7,
              inicioFrame: 540,
              duracionFrames: 210,
              textoNarracion: 'En los bordes exteriores, sin atmósfera suficiente, el aire escaparía al vacío del espacio. El fin del mundo sería un desierto congelado frente a un abismo infinito.',
              tituloVisual: 'EL BORDE DEL MUNDO',
              subtituloVisual: 'FUGA DE ATMÓSFERA AL VACÍO',
              datoDestacado: 'ABISMO CÓSMICO',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'cierre',
              tipo: 'cierre',
              duracionSegundos: 5,
              inicioFrame: 750,
              duracionFrames: 150,
              textoNarracion: 'Sin núcleo giratorio ni campo magnético protector, la radiación solar extinguiría toda la vida en cuestión de días. ¿Creías que era posible? Comenta qué harías.',
              tituloVisual: '¿CREÍAS QUE ERA POSIBLE?',
              subtituloVisual: 'DEJA TU OPINIÓN EN COMENTARIOS',
              datoDestacado: 'SÍGUENOS PARA MÁS',
              props: { loop: true },
              subtitulos: [],
              verificar: false,
            },
          ];
        } else if (
          brief.tema.toLowerCase().includes('solar') ||
          brief.tema.toLowerCase().includes('panel') ||
          brief.tema.toLowerCase().includes('fotovolt')
        ) {
          escenas = [
            {
              id: 'hook_solar',
              tipo: 'hook',
              duracionSegundos: 5,
              inicioFrame: 0,
              duracionFrames: 150,
              textoNarracion: 'La luz del Sol viaja ciento cincuenta millones de kilómetros en ocho minutos, y en una fracción de segundo se transforma en electricidad pura en tu techo.',
              tituloVisual: '¿CÓMO FUNCIONA UN PANEL SOLAR?',
              subtituloVisual: 'FÍSICA CUÁNTICA EN TU TECHO',
              datoDestacado: '150.000.000 KM',
              props: {},
              subtitulos: [],
              verificar: false,
            },
            {
              id: 'efecto_fotovoltaico',
              tipo: 'dato_grande',
              duracionSegundos: 7,
              inicioFrame: 150,
              duracionFrames: 210,
              textoNarracion: 'Todo ocurre gracias al efecto fotovoltaico. La luz del Sol está formada por partículas de energía llamadas fotones, que viajan a trescientos mil kilómetros por segundo bombardeando la Tierra.',
              tituloVisual: 'FOTONES A 300.000 KM/S',
              subtituloVisual: 'EL EFECTO FOTOVOLTAICO',
              datoDestacado: '300.000 KM/S',
              props: { animacion: 'contador' },
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'silicio_electrones',
              tipo: 'consecuencia',
              duracionSegundos: 8,
              inicioFrame: 360,
              duracionFrames: 240,
              textoNarracion: 'Cada panel está hecho de silicio dopado con fósforo y boro. Cuando los fotones golpean los átomos de silicio, arrancan electrones y los liberan violentamente de sus órbitas.',
              tituloVisual: 'BOMBARDEO DE ELECTRONES',
              subtituloVisual: 'LÁMINAS DE SILICIO DOPADO',
              datoDestacado: 'ENERGÍA CUÁNTICA',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'corriente_continua',
              tipo: 'giro',
              duracionSegundos: 7,
              inicioFrame: 600,
              duracionFrames: 210,
              textoNarracion: 'El campo eléctrico interno del panel empuja a esos billones de electrones en una sola dirección. Ese flujo continuo es electricidad pura de corriente directa lista para alimentar tu hogar.',
              tituloVisual: 'FLUJO DE ELECTRICIDAD PURA',
              subtituloVisual: 'CORRIENTE DIRECTA A TU HOGAR',
              datoDestacado: 'ENERGÍA SOLAR',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'cierre_solar',
              tipo: 'cierre',
              duracionSegundos: 6,
              inicioFrame: 810,
              duracionFrames: 180,
              textoNarracion: 'En solo una hora, el Sol envía suficiente energía a la Tierra para abastecer a la humanidad durante un año entero. ¿Por qué crees que no la aprovechamos al cien por cien? Comenta tu opinión.',
              tituloVisual: '1 AÑO DE ENERGÍA EN 1 HORA',
              subtituloVisual: '¿POR QUÉ NO LA USAMOS TODA?',
              datoDestacado: 'SÍGUENOS',
              props: { loop: true },
              subtitulos: [],
              verificar: false,
            },
          ];
        } else {
          escenas = [
            {
              id: 'hook',
              tipo: 'hook',
              duracionSegundos: 3,
              inicioFrame: 0,
              duracionFrames: 90,
              textoNarracion: `${brief.tema}. ¿Sabes exactamente qué pasaría?`,
              tituloVisual: brief.tema.toUpperCase(),
              subtituloVisual: 'ESCENARIOS REALES & FÍSICA APLICADA',
              datoDestacado: '¿Y SI...?',
              props: {},
              subtitulos: [],
              verificar: false,
            },
            {
              id: 'dato_grande',
              tipo: 'dato_grande',
              duracionSegundos: 5,
              inicioFrame: 90,
              duracionFrames: 150,
              textoNarracion: `En el primer segundo, ${brief.datoGrande || 'más de 8 mil millones de personas'} sentirían el impacto de inmediato.`,
              tituloVisual: brief.datoGrande || '8.000.000.000',
              subtituloVisual: 'PERSONAS AFECTADAS EN 1 SEGUNDO',
              datoDestacado: brief.datoGrande || '8 MIL MILLONES',
              props: { animacion: 'contador' },
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'consecuencia',
              tipo: 'consecuencia',
              duracionSegundos: 7,
              inicioFrame: 240,
              duracionFrames: 210,
              textoNarracion: 'La atmósfera seguiría en movimiento a más de mil seiscientos kilómetros por hora, barriendo ciudades enteras.',
              tituloVisual: '1.670 KM/H',
              subtituloVisual: 'INERCIA TOTAL DE LA ATMÓSFERA',
              datoDestacado: 'VELOCIDAD CRÍTICA',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'giro',
              tipo: 'giro',
              duracionSegundos: 6,
              inicioFrame: 450,
              duracionFrames: 180,
              textoNarracion: 'Pero lo más aterrador no sería el impacto exterior, sino el colapso instantáneo del campo magnético.',
              tituloVisual: 'COLAPSO MAGNÉTICO',
              subtituloVisual: 'SIN PROTECCIÓN CONTRA RADIACIÓN SOLAR',
              datoDestacado: 'PELIGRO EXTREMO',
              props: {},
              subtitulos: [],
              verificar: true,
            },
            {
              id: 'cierre',
              tipo: 'cierre',
              duracionSegundos: 5,
              inicioFrame: 630,
              duracionFrames: 150,
              textoNarracion: 'Si sobrevivieras, el mundo que conoces ya no existiría. Síguenos y comenta: ¿cuál sería tu primer instinto?',
              tituloVisual: '¿SOBREVIVIRÍAS?',
              subtituloVisual: 'COMENTA TU ESTRATEGIA ABAJO',
              datoDestacado: 'PARTE 2 PRONTO',
              props: { loop: true },
              subtitulos: [],
              verificar: false,
            },
          ];
        }
        break;

    case 'storytelling_split':
      escenas = [
        {
          id: 'hook_historia',
          tipo: 'hook',
          duracionSegundos: 4,
          inicioFrame: 0,
          duracionFrames: 120,
          textoNarracion: `No debí haber revisado ese mensaje. Todo empezó hace tres días cuando encontré algo inexplicable.`,
          tituloVisual: 'CONFESIÓN ANÓNIMA',
          subtituloVisual: 'HISTORIA REAL DE LA COMUNIDAD',
          datoDestacado: 'PARTE 1',
          props: { splitScreen: true, gameplayBottom: 'satisfying_loop' },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'desarrollo_historia',
          tipo: 'consecuencia',
          duracionSegundos: 12,
          inicioFrame: 120,
          duracionFrames: 360,
          textoNarracion: `Eran las dos de la mañana y recibí una notificación de un número que no existía. Decía exactamente lo que estaba haciendo en mi habitación.`,
          tituloVisual: '02:14 AM',
          subtituloVisual: 'ALERTA DE SEGURIDAD',
          datoDestacado: 'MENSAJE SOSPECHOSO',
          props: { splitScreen: true },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'climax_historia',
          tipo: 'giro',
          duracionSegundos: 10,
          inicioFrame: 480,
          duracionFrames: 300,
          textoNarracion: `Cuando miré hacia la ventana, no había nadie. Pero la pantalla de mi televisor se encendió sola con una cuenta regresiva.`,
          tituloVisual: 'CUENTA REGRESIVA',
          subtituloVisual: 'LA RESPUESTA ESTABA CERCA',
          datoDestacado: 'MINUTOS RESTANTES',
          props: { splitScreen: true },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'cierre_historia',
          tipo: 'cierre',
          duracionSegundos: 6,
          inicioFrame: 780,
          duracionFrames: 180,
          textoNarracion: 'Si quieres saber lo que decía el último mensaje, comenta para subir la parte dos ahora mismo.',
          tituloVisual: '¿PARTE 2?',
          subtituloVisual: 'DÉJALO EN LOS COMENTARIOS',
          datoDestacado: 'CONTINUARÁ',
          props: { splitScreen: true },
          subtitulos: [],
          verificar: false,
        },
      ];
      break;

    case 'quiz_trivia':
      escenas = [
        {
          id: 'quiz_pregunta',
          tipo: 'quiz_pregunta',
          duracionSegundos: 5,
          inicioFrame: 0,
          duracionFrames: 150,
          textoNarracion: `Solo el 5% de las personas responde esto bien a la primera. ${brief.tema}`,
          tituloVisual: 'DESAFÍO CEREBRAL',
          subtituloVisual: '¿ERES DEL 5% GENIO?',
          datoDestacado: 'NIVEL EXPERTO',
          props: {
            pregunta: brief.tema,
            opciones: brief.opcionesQuiz || [
              { texto: 'Opción A', esCorrecta: false },
              { texto: 'Opción B (Correcta)', esCorrecta: true },
              { texto: 'Opción C', esCorrecta: false },
            ],
          },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'quiz_timer',
          tipo: 'quiz_timer',
          duracionSegundos: 4,
          inicioFrame: 150,
          duracionFrames: 120,
          textoNarracion: 'Tienes tres segundos para elegir. Tres, dos, uno...',
          tituloVisual: 'TIEMPO CORRIENDO',
          subtituloVisual: 'DECIDE RÁPIDO',
          datoDestacado: '3.. 2.. 1..',
          props: { timerSegundos: 3 },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'quiz_revelacion',
          tipo: 'quiz_revelacion',
          duracionSegundos: 6,
          inicioFrame: 270,
          duracionFrames: 180,
          textoNarracion: '¡La respuesta correcta es la B! Si acertaste, dale me gusta y reta a un amigo a ver si puede.',
          tituloVisual: '¡RESPUESTA REVELADA!',
          subtituloVisual: 'SOLO POCOS ACIERTAN',
          datoDestacado: 'OPCIÓN CORRECTA',
          props: { respuestaRevelada: true },
          subtitulos: [],
          verificar: false,
        },
      ];
      break;

    case 'top_ranking':
      if (brief.itemsRanking && brief.itemsRanking.length > 0) {
        const itemsOrdenados = [...brief.itemsRanking].sort((a, b) => b.posicion - a.posicion);
        escenas = [
          {
            id: 'ranking_intro',
            tipo: 'hook',
            duracionSegundos: 4,
            inicioFrame: 0,
            duracionFrames: 120,
            textoNarracion: `Los ${itemsOrdenados.length} mayores secretos sobre ${brief.tema}. El número uno llena locales en minutos.`,
            tituloVisual: `TOP ${itemsOrdenados.length} CLAVES`,
            subtituloVisual: brief.tema.toUpperCase(),
            datoDestacado: '#1 ES BRUTAL',
            props: {},
            subtitulos: [],
            verificar: false,
          },
          ...itemsOrdenados.map((item, idx) => ({
            id: `ranking_${item.posicion}`,
            tipo: 'ranking_item' as const,
            duracionSegundos: 7,
            inicioFrame: 120 + idx * 210,
            duracionFrames: 210,
            textoNarracion: `Número ${item.posicion}: ${item.titulo}. ${item.descripcion}`,
            tituloVisual: `#${item.posicion} ${item.titulo.toUpperCase()}`,
            subtituloVisual: 'ESTRATEGIA PROBADA',
            datoDestacado: `TOP ${item.posicion}`,
            props: { posicion: item.posicion },
            subtitulos: [],
            verificar: true,
          })),
          {
            id: 'ranking_cierre',
            tipo: 'cierre',
            duracionSegundos: 5,
            inicioFrame: 120 + itemsOrdenados.length * 210,
            duracionFrames: 150,
            textoNarracion: '¿Cuál de estos tres trucos vas a aplicar hoy en tu negocio? Comenta y síguenos para más estrategias.',
            tituloVisual: '¿CUÁL APLICARÍAS?',
            subtituloVisual: 'SÍGUENOS PARA MÁS TRUCOS',
            datoDestacado: 'COMENTA',
            props: {},
            subtitulos: [],
            verificar: false,
          },
        ];
      } else {
        escenas = [
          {
            id: 'ranking_intro',
            tipo: 'hook',
            duracionSegundos: 3,
            inicioFrame: 0,
            duracionFrames: 90,
            textoNarracion: `Top 3 cosas que no sabías sobre ${brief.tema}. El número uno te dejará sin palabras.`,
            tituloVisual: 'TOP 3 ASOMBROSOS',
            subtituloVisual: brief.tema.toUpperCase(),
            datoDestacado: '#1 ES BRUTAL',
            props: {},
            subtitulos: [],
            verificar: false,
          },
          {
            id: 'ranking_3',
            tipo: 'ranking_item',
            duracionSegundos: 6,
            inicioFrame: 90,
            duracionFrames: 180,
            textoNarracion: 'Número tres: El primer hallazgo desafía toda la física convencional que aprendiste en la escuela.',
            tituloVisual: '#3 HALLAZGO INICIAL',
            subtituloVisual: 'DESAFÍO CIENTÍFICO',
            datoDestacado: 'PUESTO 3',
            props: { posicion: 3 },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'ranking_2',
            tipo: 'ranking_item',
            duracionSegundos: 6,
            inicioFrame: 270,
            duracionFrames: 180,
            textoNarracion: 'Número dos: Menos del uno por ciento de la población mundial ha tenido acceso a esta información clasificada.',
            tituloVisual: '#2 ACCESO RESTRINGIDO',
            subtituloVisual: 'DATOS POCO CONOCIDOS',
            datoDestacado: 'PUESTO 2',
            props: { posicion: 2 },
            subtitulos: [],
            verificar: true,
          },
          {
            id: 'ranking_1',
            tipo: 'ranking_item',
            duracionSegundos: 8,
            inicioFrame: 450,
            duracionFrames: 240,
            textoNarracion: 'Y número uno: Si esto se aplicara hoy mismo, cambiaría tu día a día para siempre. ¿Cuál te impactó más?',
            tituloVisual: '#1 EL MÁS IMPORTANTE',
            subtituloVisual: 'IMPACTO GLOBAL DEFINITIVO',
            datoDestacado: 'EL GANADOR',
            props: { posicion: 1 },
            subtitulos: [],
            verificar: true,
          },
        ];
      }
      break;

    case 'fake_chat':
      escenas = [
        {
          id: 'chat_intro',
          tipo: 'hook',
          duracionSegundos: 3,
          inicioFrame: 0,
          duracionFrames: 90,
          textoNarracion: 'Cuando revisó el chat de su teléfono, no esperaba leer esto...',
          tituloVisual: 'CHATS FILTRADOS',
          subtituloVisual: 'CONVERSACIÓN VIRAL',
          datoDestacado: 'EN LÍNEA',
          props: {},
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'chat_msg_1',
          tipo: 'chat_msg',
          duracionSegundos: 8,
          inicioFrame: 90,
          duracionFrames: 240,
          textoNarracion: '—¿Dónde estás? —En casa, descansando. —Mentira, estoy viendo tu auto afuera de su edificio ahora mismo.',
          tituloVisual: 'WHATSAPP EN VIVO',
          subtituloVisual: 'MENSAJE LEÍDO ✓✓',
          datoDestacado: 'DESCUBIERTO',
          props: {
            mensajes: [
              { remitente: 'otro', texto: '¿Dónde estás?' },
              { remitente: 'yo', texto: 'En casa, descansando 😴' },
              { remitente: 'otro', texto: 'Mentira. Estoy viendo tu auto afuera de su casa.' },
            ],
          },
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'chat_cierre',
          tipo: 'cierre',
          duracionSegundos: 5,
          inicioFrame: 330,
          duracionFrames: 150,
          textoNarracion: 'Lo que respondió después destruyó todo. Comenta "PARTE 2" para ver la respuesta completa.',
          tituloVisual: 'ESCRIBE "PARTE 2"',
          subtituloVisual: 'CONTINUACIÓN INMEDIATA',
          datoDestacado: 'FINAL INESPERADO',
          props: {},
          subtitulos: [],
          verificar: false,
        },
      ];
      break;

    case 'mindblown_facts':
      escenas = [
        {
          id: 'facts_hook',
          tipo: 'hook',
          duracionSegundos: 3,
          inicioFrame: 0,
          duracionFrames: 90,
          textoNarracion: 'Cosas psicológicas que tu cerebro hace sin que te des cuenta.',
          tituloVisual: 'PSICOLOGÍA OCULTA',
          subtituloVisual: 'DATOS DE TU MENTE',
          datoDestacado: 'MINDBLOWN',
          props: {},
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'fact_1',
          tipo: 'consecuencia',
          duracionSegundos: 7,
          inicioFrame: 90,
          duracionFrames: 210,
          textoNarracion: 'Cuando una persona no puede mirarte a los ojos más de tres segundos seguidos, significa dos cosas: o le gustas, o te oculta algo grande.',
          tituloVisual: '3 SEGUNDOS DE CONTACTO',
          subtituloVisual: 'SEÑAL PSICOLÓGICA DIRECTA',
          datoDestacado: 'ATRACCIÓN O MENTIRA',
          props: {},
          subtitulos: [],
          verificar: true,
        },
        {
          id: 'fact_cierre',
          tipo: 'cierre',
          duracionSegundos: 5,
          inicioFrame: 300,
          duracionFrames: 150,
          textoNarracion: '¿A quién vino a tu mente mientras escuchabas esto? No lo digas, solo síguenos para más.',
          tituloVisual: '¿PENSASTE EN ALGUIEN?',
          subtituloVisual: 'GUARDA ESTE VIDEO',
          datoDestacado: 'COMPARTE',
          props: {},
          subtitulos: [],
          verificar: false,
        },
      ];
      break;

    case 'quote_wisdom':
    default:
      escenas = [
        {
          id: 'quote_intro',
          tipo: 'hook',
          duracionSegundos: 3,
          inicioFrame: 0,
          duracionFrames: 90,
          textoNarracion: 'Marco Aurelio escribió esto hace dos mil años para alguien como tú hoy.',
          tituloVisual: 'ESTOICISMO MODERNO',
          subtituloVisual: 'MARCO AURELIO — 180 D.C.',
          datoDestacado: 'MEDITACIONES',
          props: {},
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'quote_body',
          tipo: 'consecuencia',
          duracionSegundos: 10,
          inicioFrame: 90,
          duracionFrames: 300,
          textoNarracion: 'Tienes poder sobre tu mente, no sobre los acontecimientos externos. Comprende esto, y encontrarás toda tu fuerza.',
          tituloVisual: 'TIENES PODER SOBRE TU MENTE',
          subtituloVisual: 'NO SOBRE LO QUE OCURRE AFUERA',
          datoDestacado: 'FUERZA INTERIOR',
          props: {},
          subtitulos: [],
          verificar: false,
        },
        {
          id: 'quote_cierre',
          tipo: 'cierre',
          duracionSegundos: 6,
          inicioFrame: 390,
          duracionFrames: 180,
          textoNarracion: 'Deja de buscar validación en quienes ni siquiera se respetan a sí mismos. Guarda esto para recordarlo.',
          tituloVisual: 'RESPÉTATE A TI MISMO',
          subtituloVisual: 'GUARDA ESTE RECORDATORIO',
          datoDestacado: 'ACTÚA HOY',
          props: {},
          subtitulos: [],
          verificar: false,
        },
      ];
      break;
  }

  const totalFrames = escenas.reduce((acc, e) => acc + e.duracionFrames, 0);

  return {
    id: brief.id,
    tema: brief.tema,
    formato: brief.formato,
    estilo: brief.estilo,
    duracionTotalSegundos: Math.round(totalFrames / 30),
    fps: 30,
    totalFrames,
    voz: brief.voz,
    musica: brief.musica,
    escenas,
    copys,
    generadoEn: new Date().toISOString(),
  };
}

/**
 * Generador de Copys y Hashtags Virales en Inglés por defecto
 */
export function generarCopysPorDefecto(brief: Brief): Copys {
  const hashtagsMap: Record<string, string[]> = {
    what_if: ['#whatif', '#mindblown', '#sciencefacts', '#didyouknow', '#learnontiktok', '#fyp', '#viral', '#universe'],
    storytelling_split: ['#storytime', '#redditstories', '#confession', '#viralvideo', '#satisfying', '#fyp', '#trending'],
    quiz_trivia: ['#quiztime', '#trivia', '#brainteaser', '#riddle', '#challenge', '#smart', '#fyp', '#testyourbrain'],
    top_ranking: ['#top5', '#top3', '#facts', '#ranking', '#curiosities', '#unbelievable', '#fyp', '#mindblowing'],
    fake_chat: ['#textstory', '#chatdrama', '#relationship', '#texts', '#exposed', '#viraltext', '#fyp'],
    mindblown_facts: ['#psychologyfacts', '#mindhacks', '#deepthoughts', '#humanbehavior', '#brainfacts', '#fyp', '#viral'],
    quote_wisdom: ['#stoicism', '#wisdom', '#philosophy', '#discipline', '#motivation', '#selfimprovement', '#mindset', '#fyp'],
  };

  const hashtags = hashtagsMap[brief.formato] || ['#viral', '#trending', '#facts', '#fyp', '#learnontiktok'];

  return {
    tiktok: {
      ganchos: [
        `¿Sabías esto sobre ${brief.tema}? 🤯`,
        `Nadie te dice la verdad sobre ${brief.tema} 👀`,
        `Esto cambiará como ves ${brief.tema} para siempre ⚡`,
      ],
      caption: `Esto es lo que realmente pasaría con ${brief.tema}. ¿Cuál sería tu reacción en los comentarios? 👇`,
      hashtags,
    },
    reels: {
      ganchos: [
        `La explicación definitiva que estabas buscando 🧠`,
        `Guarda esto antes de que lo borren 📌`,
        `¿Y tú qué opinas sobre esto? 🤔`,
      ],
      caption: `Explorando las consecuencias reales de ${brief.tema}. Las implicaciones son mucho mayores de lo que imaginas.`,
      preguntaFinal: `¿Qué harías tú en esta situación? Deja tu opinión abajo.`,
      hashtags: [...hashtags, '#reelsinstagram', '#exploremore'],
    },
    shorts: {
      titulo: `${brief.tema.slice(0, 55)} 😱`,
      descripcion: `Descubre la verdad sobre ${brief.tema}. Suscríbete para más revelaciones diarias.`,
      hashtags: hashtags.slice(0, 5),
    },
  };
}
