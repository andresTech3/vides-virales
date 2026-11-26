#!/usr/bin/env python3
"""
Orquestador 100% autonomo (0 intervencion humana):
1. Lee historial.json para evitar temas repetidos.
2. Pide a Gemini API (gratuita) N guiones virales + specs JSON + copys para redes
   usando la formula +1M (2da persona TU, escalada, escenarios reales y CTA final).
3. Genera la locucion 100% gratis con Microsoft Neural (edge-tts) + WordBoundary.
4. Sincroniza planos 3D y subtitulos palabra por palabra con precision de frame.
5. Renderiza MP4 (yuv420p + faststart) y masteriza audio (-14.1 LUFS).
6. Publica todo en Buffer con intervalos de 5 minutos (opcional --publish).
7. Actualiza historial.json.
"""
import argparse
import datetime
import json
import math
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_PATH = os.path.join(ROOT, ".env")
HISTORIAL_PATH = os.path.join(ROOT, "historial.json")
TTS_SCRIPT = os.path.join(ROOT, "src", "servicios", "tts_engine.py")
GEN_SCRIPT = os.path.join(ROOT, "scripts", "generar_toon.py")
PUB_SCRIPT = os.path.join(ROOT, "scripts", "publicar_buffer.py")

VALID_HORIZONS = [
    "elevator_cabin", "elevator_shaft", "supermarket_aisle", "bedroom_night",
    "beach_shore", "kitchen_stove", "office_cubicles", "palace_hall",
    "neon_alley", "city_blocks", "vice_city", "paris", "ocean", "park", "interior"
]
VALID_FLOORS = [
    "cobble", "wood_planks", "grass_path", "tile_checker", "brick_grid",
    "asphalt_road", "diamond_carpet", "solid_grid", "crosswalk_city"
]
VALID_SKIES = ["day_cyan", "golden_hour", "sunset_purple", "vice_neon", "dramatic_dark", "interior_warm"]
VALID_PROPS = [
    "crate", "barrel", "pedestal", "orb", "money", "sack", "doc", "desk",
    "car", "police_car", "wanted_stars", "sign", "lamp",
    "xray_knee", "xray_spine", "elevator_building", "swollen_battery",
    "tsunami_wall", "fish_flop", "pan_fire", "metal_lid"
]
VALID_ACTIONS = ["idle", "talk", "run", "panic", "celebrate", "fall", "point", "sneak", "laugh", "lying", "jump", "head_bump"]
VALID_EXPRS = ["neutral", "angry", "shocked", "terrified", "smug", "evil_smug", "happy", "laughing", "deadpan", "dollar_eyes", "sweating"]
VALID_FX = ["boom", "sparkles", "smoke", "splinters", "comic_star", "flames", "flying_bills", "explosion_plume", "radar"]


def load_env():
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())


def call_gemini(prompt: str) -> dict:
    import time
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Falta GEMINI_API_KEY en .env o GitHub Secrets.")
    primary = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash").strip()
    candidates = []
    for m in [primary, "gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"]:
        if m and m not in candidates:
            candidates.append(m)

    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "responseMimeType": "application/json",
        },
    }).encode("utf-8")

    last_err = None
    for model in candidates:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        print(f"[Gemini] Intentando {model}...", flush=True)
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            txt = data["candidates"][0]["content"]["parts"][0]["text"]
            print(f"[Gemini] OK con {model}", flush=True)
            return json.loads(txt)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            last_err = f"{model} HTTP {e.code}: {err_body[:240]}"
            print(f"[Gemini] {last_err}", flush=True)
            time.sleep(1)
        except Exception as e:
            last_err = f"{model} ERR: {e}"
            print(f"[Gemini] {last_err}", flush=True)
    raise RuntimeError(f"Gemini fallo en todos los modelos: {last_err}")


def build_prompt(usados: list[str], count: int) -> str:
    hist_txt = "\n".join(f"- {t}" for t in usados[-40:])
    return f"""Eres guionista y director 3D de videos virales Shorts/Reels/TikTok (+1M de visitas) en estilo Toon Frenetico 3D.
Debes generar EXACTAMENTE {count} video(s) nuevos, originales y de altisima retencion sobre situaciones cotidianas de supervivencia, ciencia en casa, tecnologia, psicologia o peligros curiosos que le pasan al espectador.

TEMAS YA USADOS (PROHIBIDO REPETIRLOS):
{hist_txt}

REGLAS OBLIGATORIAS DE GUION (+1M VISTAS):
1. Habla SIEMPRE en 2da persona ("TU" / "TE" / "SI TU...") desde la primera frase. NUNCA empieces hablando de un desconocido lejano.
2. Hook inicial en 1 sola frase paradojica/contraintuitiva (ej. "Si te pasa X, hacer Y es lo peor que puedes hacer").
3. Escalada de 3-4 niveles ("En segundos...", "Peor aun...", "Lo unico que te salva..."), 95-115 palabras (~36-43 segundos).
4. CTA OBLIGATORIO en las ultimas 1-2 frases en 2da persona invitando a comentar y seguir.
5. Usa SOLO texto limpio para locucion en "voz_texto" (sin emojis, sin corchetes, numeros en palabras si ayuda a pronunciar).

REGLAS VISUALES ESTRICTAS:
- Divide el guion en 10 a 14 "escenas". Cada escena tiene:
  - "frase": trozo exacto de "voz_texto" (la concatenacion ordenada de todas las "frase" debe coincidir con "voz_texto").
  - "horizon": uno de {VALID_HORIZONS}. PROHIBIDO usar "interior" sin "wallColor". Escoge siempre el escenario real que corresponda al tema (o "city_blocks", "neon_alley", "office_cubicles", "bedroom_night", "kitchen_stove", "beach_shore", etc.).
  - "floorStyle": uno de {VALID_FLOORS}.
  - "floorColor": hex color ej "#1E293B".
  - "wallColor": hex color ej "#334155".
  - "skyMode": uno de {VALID_SKIES}.
  - "actors": lista de 1 o 2 actores: {{ "id": "tu" (o personaje secundario), "pos": [-1.0, 0, 0.6], "face": 1 o -1, "action": uno de {VALID_ACTIONS}, "expr": uno de {VALID_EXPRS}, "bubble": "!" o "?" o "!!" o "$$" o "none" }}.
  - "props3d": lista opcional (0 a 2 props) usando SOLO tipos de {VALID_PROPS}. Prohibido poner carteles "sign" vagos en lugar de mostrar la accion; usa "sign" solo para datos concretos max 10 chars (ej "80 KM/H", "COMENTA!").
  - "fx": lista opcional de {{ "type": uno de {VALID_FX}, "pos": [x,y,z] }}.
  - "speedLines": true, false o "intense".
  - "punch": true o false.
  - "camPreset": uno de ["wide_left", "wide_right", "center_push", "dutch_dramatic"].

Devuelve EXCLUSIVAMENTE un JSON valido con este esquema:
{{
  "videos": [
    {{
      "slug": "tema-corto-sin-tildes",
      "titulo_tema": "Titulo corto resumen para historial",
      "out_name": "video_corto.mp4",
      "characters": {{
        "tu": {{ "shirt": "#3B82F6", "outfit": "casual", "pants": "#1E293B", "hair": "spiky", "hairColor": "#F59E0B" }},
        "experto": {{ "shirt": "#F8FAFC", "outfit": "lab_coat", "pants": "#1E293B", "glasses": true }}
      }},
      "voz_texto": "Texto completo seguido en espanol...",
      "escenas": [ ... ],
      "copys": {{
        "titulos": ["1...", "2...", "3...", "4...", "5..."],
        "tiktok": "Caption TikTok con emojis, CTA y #hashtags",
        "instagram": "Caption Instagram Reels con bullets, guarda este reel y #hashtags",
        "youtube_titulo": "Titulo YouTube Shorts max 60 chars #Shorts",
        "youtube_desc": "Descripcion SEO corta + CTA + #Shorts",
        "tags_seo": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8",
        "prompt_miniatura": "Cartoon 3D vibrant style..."
      }}
    }}
  ]
}}"""


CAM_PRESETS = {
    "wide_left": ([-3.4, 2.9, 8.2], [0, 2.5, 6.6], [0, 1.7, 0], [0, 1.7, 0], 46, 0, 0),
    "wide_right": ([3.2, 2.8, 8.0], [0, 2.5, 6.6], [0, 1.7, 0], [0, 1.7, 0], 46, 0, 0),
    "center_push": ([0, 2.7, 7.6], [0, 2.4, 6.4], [0, 1.7, 0], [0, 1.7, 0], 45, 0, 0),
    "dutch_dramatic": ([-2.6, 3.0, 8.0], [0.2, 2.5, 6.5], [0, 1.7, 0], [0, 1.7, 0], 46, -5, 4),
}


def align_segments_to_words(escenas: list[dict], words_data: list[dict], total_dur: float) -> list[dict]:
    """Asigna startSec/endSec precisos a cada escena usando los WordBoundary de edge-tts."""
    if not words_data:
        step = total_dur / max(1, len(escenas))
        return [{"text": e["frase"], "startSec": round(i * step, 2), "endSec": round((i + 1) * step, 2)} for i, e in enumerate(escenas)]

    seg_out = []
    w_idx = 0
    n_words = len(words_data)
    for idx, esc in enumerate(escenas):
        phrase = esc["frase"].strip()
        n_tokens = max(1, len(phrase.split()))
        start_i = min(w_idx, n_words - 1)
        end_i = min(n_words - 1, start_i + n_tokens - 1)
        if idx == len(escenas) - 1:
            end_i = n_words - 1
        s_sec = words_data[start_i]["start"]
        e_sec = words_data[end_i]["end"] + 0.08
        seg_out.append({"text": phrase, "startSec": round(s_sec, 3), "endSec": round(min(total_dur, e_sec), 3)})
        w_idx = min(n_words - 1, end_i + 1)
    return seg_out


def build_shots(escenas: list[dict], segments: list[dict], total_frames: int) -> tuple[list[dict], dict]:
    shots = []
    cues, impacts = [], []
    for i, (esc, seg) in enumerate(zip(escenas, segments)):
        sf = 0 if i == 0 else max(shots[-1]["end"], round(seg["startSec"] * 30))
        ef = total_frames if i == len(escenas) - 1 else max(sf + 15, round(seg["endSec"] * 30))
        cues.append(round(sf / 30.0, 2))
        if esc.get("punch"):
            impacts.append(round((sf + 4) / 30.0, 2))

        preset = CAM_PRESETS.get(esc.get("camPreset", "wide_left"), CAM_PRESETS["wide_left"])
        horizon = esc.get("horizon", "city_blocks")
        if horizon not in VALID_HORIZONS:
            horizon = "city_blocks"
        if horizon == "interior":
            horizon = "office_cubicles"

        actors = []
        for a in (esc.get("actors") or [])[:2]:
            if isinstance(a, str):
                a = {"id": a}
            elif not isinstance(a, dict):
                continue
            actors.append({
                "id": a.get("id", "tu"),
                "pos": a.get("pos", [-0.9, 0, 0.6]),
                "face": 1 if a.get("face", 1) >= 0 else -1,
                "action": a.get("action") if a.get("action") in VALID_ACTIONS else "talk",
                "expr": a.get("expr") if a.get("expr") in VALID_EXPRS else "shocked",
                "bubble": a.get("bubble", "none"),
            })

        props = []
        for p in (esc.get("props3d") or [])[:2]:
            if isinstance(p, str):
                p = {"type": p}
            elif not isinstance(p, dict):
                continue
            pt = p.get("type", "crate")
            if pt not in VALID_PROPS:
                continue
            sc = p.get("scale", 0.85)
            item = {"type": pt, "pos": p.get("pos", [0.85, 0, 0.3]), "scale": min(1.0, float(sc) if isinstance(sc, (int, float)) else 0.85)}
            if p.get("color"):
                item["color"] = p["color"]
            if p.get("label"):
                item["label"] = str(p["label"])[:12]
            props.append(item)

        fx_list = []
        for fx in (esc.get("fx") or [])[:2]:
            if isinstance(fx, str):
                fx = {"type": fx}
            elif not isinstance(fx, dict):
                continue
            ft = fx.get("type")
            if ft not in VALID_FX:
                continue
            fx_list.append({"type": ft, "pos": fx.get("pos", [0, 1.8, 0.3]), "atFrame": sf + 4, "durFrames": max(18, min(50, ef - sf - 4)), "scale": 1.0})

        shot = {
            "start": sf,
            "end": ef,
            "stage": "office_interior" if horizon in ("elevator_cabin", "supermarket_aisle", "bedroom_night", "kitchen_stove", "office_cubicles", "palace_hall") else "city_street",
            "horizon": horizon,
            "floorStyle": esc.get("floorStyle") if esc.get("floorStyle") in VALID_FLOORS else "solid_grid",
            "floorColor": esc.get("floorColor", "#1E293B"),
            "wallColor": esc.get("wallColor", "#334155"),
            "skyMode": esc.get("skyMode") if esc.get("skyMode") in VALID_SKIES else "dramatic_dark",
            "camFrom": preset[0],
            "camTo": preset[1],
            "lookFrom": preset[2],
            "lookTo": preset[3],
            "fov": preset[4],
            "rollFrom": preset[5],
            "rollTo": preset[6],
            "camEase": "whip" if i % 2 == 0 else "fast",
            "punch": bool(esc.get("punch", i % 3 == 0)),
            "speedLines": esc.get("speedLines", False),
            "actors": actors,
        }
        if shot["punch"]:
            shot["shakeAt"] = sf + 4
        if props:
            shot["props3d"] = props
        if fx_list:
            shot["fx"] = fx_list
        shots.append(shot)

    return shots, {"cues": cues, "impacts": impacts, "dings": [cues[-1]] if cues else []}


def write_copys_md(slug: str, v: dict):
    c = v["copys"]
    titulos = "\n".join(f"{i+1}. {t}" for i, t in enumerate(c["titulos"][:5]))
    md = f"""# Copy Optimizado para Redes — «{v['titulo_tema']}»

## 5 Títulos con Curiosidad (para portada / hook)
{titulos}

---

## TikTok
**Caption:**
{c['tiktok']}

---

## Instagram Reels
**Caption:**
{c['instagram']}

---

## YouTube Shorts
**Título:**
{c['youtube_titulo']}

**Descripción:**
{c['youtube_desc']}

---

## Tags SEO (para copiar y pegar en YouTube Studio / Shorts)
```text
{c['tags_seo']}
```

---

## Prompt de Miniatura (IA / Portada)
> `{c['prompt_miniatura']}`
"""
    out_dir = os.path.join(ROOT, "salida", slug)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "copys.md"), "w", encoding="utf-8") as f:
        f.write(md)


def main():
    load_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=2, help="Cantidad de videos a generar hoy (2 recomendado por limite diario YT)")
    ap.add_argument("--plan-json", default=None, help="Archivo JSON de guion/escenas para saltar la llamada a Gemini")
    ap.add_argument("--voice", default="es-US-AlonsoNeural", help="Voz neural gratuita edge-tts")
    ap.add_argument("--rate", default="+8%", help="Velocidad de narracion")
    ap.add_argument("--publish", action="store_true", help="Publicar en Buffer automaticamente cada 5 min")
    ap.add_argument("--dry-run", action="store_true", help="Solo genera guiones, voz y specs sin renderizar MP4")
    args = ap.parse_args()

    hist = {"temas_usados": []}
    if os.path.exists(HISTORIAL_PATH):
        with open(HISTORIAL_PATH, "r", encoding="utf-8") as f:
            hist = json.load(f)

    if args.plan_json:
        with open(args.plan_json, "r", encoding="utf-8-sig") as f:
            plan = json.load(f)
    else:
        plan = call_gemini(build_prompt(hist.get("temas_usados", []), args.count))
    videos = plan.get("videos", [])
    if not videos:
        raise RuntimeError(f"Gemini no devolvio videos: {plan}")

    tmp_dir = os.path.join(ROOT, "out", "auto_diario")
    os.makedirs(tmp_dir, exist_ok=True)
    generated_slugs = []

    for v in videos:
        slug = re.sub(r"[^a-z0-9-]+", "-", v["slug"].lower()).strip("-")
        if not slug:
            slug = "video-" + datetime.datetime.now().strftime("%Y%m%d-%H%M")
        slug = f"{datetime.date.today().strftime('%m%d')}-{slug}"

        txt_path = os.path.join(tmp_dir, f"{slug}.txt")
        mp3_path = os.path.join(tmp_dir, f"{slug}.mp3")
        cues_path = os.path.join(tmp_dir, f"{slug}_words.json")
        spec_path = os.path.join(tmp_dir, f"{slug}_spec.json")

        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(v["voz_texto"].strip())

        subprocess.run([sys.executable, TTS_SCRIPT, txt_path, mp3_path, cues_path, args.voice, args.rate], check=True)

        dur = float(subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", mp3_path
        ], text=True).strip())
        total_frames = math.ceil(dur * 30)

        with open(cues_path, "r", encoding="utf-8") as f:
            words_data = json.load(f)

        segments = align_segments_to_words(v["escenas"], words_data, dur)
        shots, audio_cues = build_shots(v["escenas"], segments, total_frames)

        spec = {
            "characters": v["characters"],
            "segments": segments,
            "accents": {},
            "audioCues": audio_cues,
            "shots": shots,
        }
        with open(spec_path, "w", encoding="utf-8") as f:
            json.dump(spec, f, ensure_ascii=False, indent=2)

        write_copys_md(slug, v)
        print(f"[AUTO] Preparado {slug} ({dur:.2f}s, {len(shots)} planos)")

        if not args.dry_run:
            out_name = v.get("out_name", f"{slug}.mp4")
            subprocess.run([
                sys.executable, GEN_SCRIPT,
                "--spec", spec_path,
                "--voice", mp3_path,
                "--slug", slug,
                "--out-name", out_name,
            ], check=True)
            hist.setdefault("temas_usados", []).append(v["titulo_tema"])
            generated_slugs.append(slug)

    if not args.dry_run:
        with open(HISTORIAL_PATH, "w", encoding="utf-8") as f:
            json.dump(hist, f, ensure_ascii=False, indent=2)
        if args.publish and generated_slugs:
            subprocess.run([
                sys.executable, PUB_SCRIPT,
                "--auto-tunnel", "--stagger-mins", "5",
                "--slugs", *generated_slugs,
            ], check=True)
    else:
        print("[DRY-RUN] Generacion verificada sin renderizar MP4 ni publicar.")


if __name__ == "__main__":
    main()
