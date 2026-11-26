# Especificación: Generador de Videos Virales por Código

*Documento para entregar a Antigravity (agente de programación). Objetivo: construir un sistema donde el usuario escribe un "brief" corto y el sistema produce un video vertical viral listo para publicar, junto con sus copys y hashtags.*

## 1. Objetivo del proyecto

Construir un **generador de videos verticales (9:16) por código** que reciba un brief en JSON (o texto libre) y entregue:

1. Un archivo **MP4** final (1080x1920, 30 fps).
2. Un archivo **copys.md** con captions para TikTok, Reels y Shorts, con **hashtags virales en inglés**.
3. Opcionalmente, varias **variantes** del mismo video (otro hook, otro estilo).

El formato de contenido principal es el de los videos explicativos **"¿Y si...?" (What if...)**: un gancho en forma de pregunta, un dato enorme en pantalla, una escena visual llamativa y subtítulos grandes sincronizados con una voz en off.

**Principio de diseño:** el usuario no toca código. Solo cambia el brief. Todo lo demás (guion, voz, escenas, subtítulos, render, copys) lo hace el sistema.

## 2. Stack tecnológico

Usar las **versiones estables más recientes** y verificar en la documentación oficial antes de instalar.

| Capa | Herramienta | Para qué |
| --- | --- | --- |
| Lenguaje | TypeScript + Node.js 20+ | Todo el proyecto |
| Motor de video | **Remotion** | Componer y renderizar video con React |
| 3D | **three**, **@react-three/fiber**, **@react-three/drei**, **@remotion/three** | Escenas 3D low-poly, multitudes, ciudades |
| Subtítulos | **@remotion/captions** | Subtítulos estilo karaoke palabra por palabra |
| Transiciones | **@remotion/transitions** | Cortes y cambios de escena |
| Audio | **@remotion/media-utils** | Sincronizar con la voz y la música |
| Animación 2D | **@remotion/lottie** (opcional), SVG, Canvas | Pixel art, infografías, ilustraciones |
| Validación | **zod** | Validar el brief y los props de cada escena |
| Voz | **ElevenLabs API** (con timestamps por palabra) | Narración en off |
| Guion | API de un LLM (configurable: Gemini o Claude) | Convertir el brief en guion y escenas |
| Imágenes IA (opcional) | API de generación de imágenes | Fondos de estilo ilustrado/tinta |
| CLI | **commander** o similar | Comando único para generar |
| Render 3D pesado (opcional, fase final) | **Blender** por script Python | Estilo arcilla de alta calidad |

**Regla:** si una escena se puede resolver con Three.js o SVG dentro de Remotion, no usar Blender ni Unity. Blender es solo una opción avanzada para la fase final.

## 3. Formato de entrada (el brief)

El usuario crea un archivo `briefs/mi-video.json`. Ejemplo:

```json
{
  "id": "escalera-regla",
  "idioma": "es",
  "tema": "¿Y si todos en la Tierra siguieran la regla de la escalera mecánica?",
  "estilo": "lowpoly3d",
  "duracionSegundos": 35,
  "tono": "curioso, rápido, asombroso",
  "datoGrande": "8.000.000.000 de personas",
  "voz": "narrador_masculino_es",
  "musica": "suspenso_suave",
  "plataformas": ["tiktok", "reels", "shorts"],
  "variantes": 2
}
```

**Campos obligatorios:** `id`, `tema`, `estilo`, `duracionSegundos`. **Campos opcionales:** el resto. Si faltan, el sistema los infiere con valores por defecto sensatos.

También debe aceptar **texto libre** desde la línea de comandos y convertirlo a brief automáticamente:

```bash
npm run generar -- "¿Y si la Tierra dejara de girar 5 segundos?" --estilo lowpoly3d
```

## 4. Estilos visuales (presets)

Cada estilo es un **preset** reutilizable con su paleta, tipografía, cámara y componentes. Implementar al menos estos cuatro:

### 4.1 `lowpoly3d`

- Ciudad, calles y personajes simples en 3D con Three.js.
- Luz suave, niebla ligera, cielo con degradado, sombras suaves.
- Maniquíes y multitudes con **instancing** (`InstancedMesh`) para rendimiento.
- Cámara con movimientos lentos (dolly, órbita corta, zoom).

### 4.2 `pixelart`

- Escena 2D en Canvas con sprites pixelados y escalado sin suavizado (`image-rendering: pixelated`).
- HUD de videojuego: etiqueta superior, barra de progreso, número gigante central.
- Paleta limitada y tipografía pixel.

### 4.3 `arcilla`

- Personaje y escenario con apariencia de plastilina: materiales redondeados, colores saturados, sombras suaves, ligera animación de "rebote".
- Primera versión con Three.js. Versión avanzada con Blender (fase 5).

### 4.4 `tinta`

- Ilustración estilo tinta con textura de papel y acentos dorados.
- Capas con **parallax** animado, olas, sol o luna grandes, siluetas.
- Fondos pueden venir de imágenes generadas por IA o de SVG hechos a mano.

Cada preset debe exponer la misma interfaz, para que el sistema pueda cambiar de estilo sin tocar el resto:

```ts
interface EstiloPreset {
  nombre: string;
  paleta: Record<string, string>;
  fuente: string;
  escenas: Record<TipoEscena, React.ComponentType<EscenaProps>>;
}
```

## 5. Tipos de escena (los "ladrillos")

Todo video se arma combinando escenas. Cada una es un componente de React con props validados por zod.

1. **`Hook`**: la pregunta inicial en texto grande, animada, durante 1 a 3 segundos.
2. **`DatoGrande`**: un número o cifra enorme que aparece con impacto (contador animado, zoom).
3. **`EscenaMundo`**: escena 3D/2D del estilo elegido con cámara animada.
4. **`Consecuencia`**: texto + visual que muestra el resultado de cada paso del escenario.
5. **`Giro`**: momento de sorpresa o dato inesperado.
6. **`Cierre`**: remate o nueva pregunta que invite a ver el siguiente video, con opción de **loop** (el último frame conecta con el primero).

El **guion** que genera el LLM es una lista ordenada de escenas con su texto de narración y duración aproximada.

## 6. Pipeline de generación

```
brief.json
   │
   ▼
[1] Validar y completar brief (zod)
   │
   ▼
[2] Generar guion + lista de escenas (LLM)
   │
   ▼
[3] Generar voz en off (ElevenLabs) + timestamps por palabra
   │
   ▼
[4] Construir subtítulos palabra por palabra
   │
   ▼
[5] Ajustar duración de cada escena según el audio
   │
   ▼
[6] Componer en Remotion (estilo + escenas + música + subtítulos)
   │
   ▼
[7] Renderizar MP4 (1080x1920, 30 fps)
   │
   ▼
[8] Generar copys.md (captions + hashtags en inglés)
   │
   ▼
salida/<id>/video.mp4 + copys.md + guion.json
```

**Requisitos de cada paso:**

- **Paso 2 (guion):** el prompt al LLM debe exigir: gancho en el primer segundo, un cambio visual cada 2 a 3 segundos, frases cortas, y un cierre con loop o nueva pregunta. La respuesta debe ser **JSON estricto** validado con zod. Si falla la validación, reintentar hasta 3 veces.
- **Paso 3 (voz):** pedir a ElevenLabs el audio con **timestamps por palabra** para sincronizar subtítulos. Guardar el audio en `salida/<id>/voz.mp3`. Cachear para no gastar créditos si el guion no cambió.
- **Paso 5:** la duración de cada escena sale del audio, no al revés. Sumar una pequeña pausa entre escenas.
- **Paso 7:** usar `renderMedia` de Remotion por código. Mostrar barra de progreso en consola.

## 7. Subtítulos

- Palabra por palabra, grandes, centrados en el tercio inferior-medio, con contorno grueso para legibilidad.
- La palabra activa se resalta (color de acento o escala).
- Máximo 3 a 5 palabras visibles a la vez.
- Respetar la "zona segura" de TikTok/Reels: dejar libres unos 150 px arriba y 250 px abajo para la interfaz de la app.

## 8. Copys y hashtags (salida obligatoria)

Para **cada video** generar `copys.md` con:

- **TikTok:** caption corto con gancho + 5 a 8 hashtags.
- **Instagram Reels:** caption un poco más largo con pregunta final + hashtags.
- **YouTube Shorts:** título (máx. 70 caracteres) + descripción corta + hashtags.

**Regla fija:** los **hashtags virales siempre en inglés**, aunque el video esté en español (por ejemplo: `#whatif #facts #fyp #viral #didyouknow #science #mindblown #learnontiktok`). Mezclar hashtags amplios con otros específicos del tema. El texto del caption va en el idioma del video.

El LLM debe generar 3 opciones de gancho para el caption, y el sistema guarda las tres.

## 9. Estructura de carpetas

```
generador-videos/
├─ briefs/                 # briefs de entrada (.json)
├─ salida/                 # resultados por video
│  └─ <id>/ video.mp4, voz.mp3, guion.json, copys.md
├─ src/
│  ├─ cli/                 # comando "generar"
│  ├─ pipeline/            # pasos 1 a 8
│  ├─ servicios/           # llm.ts, voz.ts, imagenes.ts
│  ├─ remotion/
│  │  ├─ Root.tsx
│  │  ├─ Video.tsx         # composición principal
│  │  ├─ escenas/          # Hook, DatoGrande, EscenaMundo, ...
│  │  ├─ estilos/          # lowpoly3d, pixelart, arcilla, tinta
│  │  ├─ subtitulos/
│  │  └─ componentes3d/    # ciudad, multitud, personajes
│  └─ esquemas/            # zod: brief, guion, escena
├─ assets/                 # fuentes, música, texturas
├─ .env.example            # claves de API
└─ README.md
```

## 10. Comandos esperados

```bash
npm run estudio                 # abrir Remotion Studio para previsualizar
npm run generar -- briefs/escalera-regla.json
npm run generar -- "¿Y si...?" --estilo pixelart
npm run lote -- briefs/        # generar todos los briefs de una carpeta
npm run variantes -- escalera-regla --n 3
```

## 11. Reglas de calidad

1. **Primer segundo:** siempre hay texto o movimiento fuerte. Nunca pantalla vacía.
2. **Ritmo:** cambio visual notable cada 2 a 3 segundos.
3. **Legibilidad:** texto con contraste alto, nunca sobre fondos que lo hagan ilegible.
4. **Rendimiento 3D:** usar instancing, geometrías simples y luces limitadas. El render completo de un video de 35 s debe terminar en un tiempo razonable en un portátil normal.
5. **Determinismo:** mismo brief + misma semilla = mismo video. Todo movimiento aleatorio debe usar una semilla (`random()` de Remotion), nunca `Math.random()`.
6. **Audio:** normalizar volumen de la voz y bajar la música automáticamente mientras habla.
7. **Sin derechos problemáticos:** solo música y assets libres o generados. No usar personajes, marcas ni imágenes con copyright.
8. **Datos verificables:** el guion no debe inventar cifras. Si el LLM incluye un dato numérico, marcarlo en `guion.json` con un campo `verificar: true` para que el usuario lo revise.

## 12. Fases de construcción (orden sugerido)

**Fase 1: Base mínima funcional**

- Proyecto Remotion + TypeScript, `Root.tsx`, composición vertical 1080x1920.
- Escenas `Hook` y `DatoGrande` con texto animado y fondo de color.
- Render por CLI de un MP4 de prueba.
- *Criterio de aceptación:* `npm run generar` produce un MP4 de 10 s con un hook y un dato grande.

**Fase 2: Voz, subtítulos y guion**

- Integrar LLM para guion en JSON validado.
- Integrar ElevenLabs con timestamps.
- Subtítulos palabra por palabra sincronizados.
- *Criterio:* un brief de texto libre produce un video con voz y subtítulos correctos.

**Fase 3: Estilo `lowpoly3d`**

- Integrar `@remotion/three`, ciudad low-poly, multitud con instancing, cámara animada.
- *Criterio:* una escena 3D de ciudad con personas renderiza a 30 fps sin errores.

**Fase 4: Estilos `pixelart` y `tinta`**

- Preset pixel art con HUD y número gigante.
- Preset tinta con capas parallax.
- *Criterio:* el mismo brief se puede renderizar cambiando solo el campo `estilo`.

**Fase 5: Copys, lotes y variantes**

- Generación de `copys.md` con hashtags en inglés.
- Comandos `lote` y `variantes`.
- Preset `arcilla` y, opcionalmente, integración con Blender por script.
- *Criterio:* una carpeta con 5 briefs genera 5 videos y 5 archivos de copys sin intervención.

## 13. Instrucciones directas para el agente (Antigravity)

1. Lee este documento completo antes de escribir código.
2. Trabaja **fase por fase**. Al terminar cada fase, ejecuta el criterio de aceptación y muéstrame el resultado antes de pasar a la siguiente.
3. Antes de instalar cualquier paquete, **consulta la documentación oficial** para confirmar la API actual (Remotion y react-three-fiber cambian con frecuencia).
4. Si algo de este documento es imposible o poco práctico, propón una alternativa y explica por qué, en lugar de omitirlo en silencio.
5. Guarda las claves de API solo en `.env`, nunca en el código ni en el repositorio.
6. Escribe un `README.md` en español que explique cómo instalar, configurar las claves y generar el primer video.
7. Comenta el código en español y usa nombres claros.
8. Prefiere soluciones simples. No agregues librerías que no estén justificadas por una necesidad concreta.

## 14. Requisitos del equipo del usuario

- Node.js 20 o superior y npm.
- Remotion descarga Chromium la primera vez que renderiza, así que se necesita conexión a internet en esa primera ejecución.
- Claves de API: ElevenLabs y el LLM elegido (Gemini o Claude). Generación de imágenes es opcional.
- Un computador con GPU ayuda al render 3D, pero no es obligatorio.

## 15. Ideas de series para empezar

- **¿Y si...?** escenarios absurdos o gigantes (la escalera, el planeta que se detiene, todos saltando a la vez).
- **Psicología en 30 segundos:** sesgos y hábitos mentales explicados con escenas visuales.
- **Si fueras...:** el espectador toma una decisión imposible (presidente en una emergencia, dueño de una ciudad).
- **Datos locos con número gigante:** una cifra enorme como protagonista de cada video.

*Fin de la especificación.*
