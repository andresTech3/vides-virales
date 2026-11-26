#!/usr/bin/env python3
"""
Publica o programa videos de salida/<slug>/ en los canales vinculados de Buffer
(YouTube Shorts, Instagram Reels y Facebook) en UNA sola corrida, con intervalos
automaticos (ej. 5 min) para que Buffer gestione la publicacion sin gastar tokens.

Uso recomendado (túnel automático + intervalos de 5 min):
  .venv/Scripts/python.exe scripts/publicar_buffer.py --auto-tunnel --stagger-mins 5 --slugs video1 video2 video3

Modo prueba sin enviar a Buffer:
  .venv/Scripts/python.exe scripts/publicar_buffer.py --dry-run --stagger-mins 5 --slugs toon-celular-almohada toon-mar-tsunami toon-sarten-agua
"""
import argparse
import datetime
import functools
import http.server
import json
import os
import re
import shutil
import socketserver
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_PATH = os.path.join(ROOT, ".env")
API_URL = "https://api.buffer.com"
CLOUDFLARED_CANDIDATES = [
    shutil.which("cloudflared"),
    r"C:\Program Files (x86)\cloudflared\cloudflared.exe",
    r"C:\Program Files\cloudflared\cloudflared.exe",
]


def load_token() -> str:
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("BUFFER_API_KEY="):
                    return line.split("=", 1)[1].strip()
    token = os.environ.get("BUFFER_API_KEY", "").strip()
    if not token:
        raise RuntimeError("No se encontro BUFFER_API_KEY en .env ni en variables de entorno.")
    return token


def gql(token: str, query: str, variables: dict | None = None) -> dict:
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Buffer HTTP {e.code}: {body}") from e


def get_channels(token: str) -> dict[str, dict]:
    acc = gql(token, "{ account { id organizations { id name } } }")
    orgs = acc.get("data", {}).get("account", {}).get("organizations", [])
    if not orgs:
        raise RuntimeError(f"No se encontraron organizaciones en Buffer: {acc}")
    org_id = orgs[0]["id"]
    ch_res = gql(
        token,
        "query($id: OrganizationId!) { channels(input: { organizationId: $id }) { id name service displayName } }",
        {"id": org_id},
    )
    return {ch["service"]: ch for ch in ch_res.get("data", {}).get("channels", [])}


def parse_copys_md(copys_path: str) -> dict:
    with open(copys_path, "r", encoding="utf-8") as f:
        md = f.read()

    def extract_section(header: str) -> str:
        m = re.search(rf"## {re.escape(header)}\s*\n(.*?)(?=\n---|\n## |\Z)", md, re.S)
        return m.group(1).strip() if m else ""

    ig_sec = extract_section("Instagram Reels")
    ig_caption = re.sub(r"^\*\*Caption:\*\*\s*\n?", "", ig_sec).strip()

    yt_sec = extract_section("YouTube Shorts")
    yt_title_m = re.search(r"\*\*T[ií]tulo:\*\*\s*\n([^\n]+)", yt_sec)
    yt_desc_m = re.search(r"\*\*Descripci[oó]n:\*\*\s*\n(.*)", yt_sec, re.S)
    yt_title = yt_title_m.group(1).strip() if yt_title_m else "Video corto #Shorts"
    yt_desc = yt_desc_m.group(1).strip() if yt_desc_m else ig_caption

    tags_sec = extract_section("Tags SEO (para copiar y pegar en YouTube Studio / Shorts)")
    tags_m = re.search(r"```(?:text)?\s*\n(.*?)\n```", tags_sec, re.S)
    tags_text = tags_m.group(1).strip() if tags_m else ""

    return {
        "instagram_text": ig_caption,
        "facebook_text": ig_caption,
        "youtube_title": yt_title[:100],
        "youtube_text": f"{yt_desc}\n\nTags: {tags_text}".strip() if tags_text else yt_desc,
    }


def find_video(slug: str) -> str:
    folder = os.path.join(ROOT, "salida", slug)
    if not os.path.isdir(folder):
        raise FileNotFoundError(f"No existe la carpeta salida/{slug}")
    mp4s = [f for f in os.listdir(folder) if f.lower().endswith(".mp4")]
    if not mp4s:
        raise FileNotFoundError(f"No hay archivo .mp4 dentro de salida/{slug}")
    return mp4s[0]


def create_post(token: str, input_obj: dict) -> dict:
    mut = """
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id text status dueAt }
        }
        ... on MutationError {
          message
        }
      }
    }
    """
    return gql(token, mut, {"input": input_obj})


class QuietHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def start_local_server(port: int = 8787):
    salida_dir = os.path.join(ROOT, "salida")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=salida_dir)
    httpd = QuietHTTPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def start_cloudflared_tunnel(port: int = 8787) -> tuple[subprocess.Popen, str]:
    exe = next((p for p in CLOUDFLARED_CANDIDATES if p and os.path.exists(p)), None)
    if not exe:
        raise RuntimeError("No se encontro cloudflared.exe. Instala con: winget install Cloudflare.cloudflared")
    proc = subprocess.Popen(
        [exe, "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    deadline = time.time() + 25
    url = None
    assert proc.stdout is not None
    while time.time() < deadline:
        line = proc.stdout.readline()
        if not line:
            if proc.poll() is not None:
                break
            continue
        m = re.search(r"(https://[a-z0-9-]+\.trycloudflare\.com)", line)
        if m:
            url = m.group(1)
            break
    if not url:
        proc.terminate()
        raise RuntimeError("No se pudo obtener URL del tunel de Cloudflare a tiempo.")
    time.sleep(2.5)
    return proc, url


def iso_utc(dt: datetime.datetime) -> str:
    return dt.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slugs", nargs="+", required=True, help="Carpetas dentro de salida/, ej. toon-celular-almohada")
    ap.add_argument("--base-url", default="https://PUBLIC-URL-PENDIENTE", help="URL base publica apuntando a salida/")
    ap.add_argument("--auto-tunnel", action="store_true", help="Levanta servidor local + cloudflared y los cierra al terminar")
    ap.add_argument("--port", type=int, default=8787)
    ap.add_argument("--services", nargs="+", default=["youtube", "instagram", "facebook"])
    ap.add_argument("--stagger-mins", type=int, default=5, help="Minutos de separacion entre cada video (0 = usar --mode)")
    ap.add_argument("--mode", default="addToQueue", choices=["addToQueue", "shareNext", "shareNow", "customScheduled"])
    ap.add_argument("--due-at", default=None, help="ISO 8601 DateTime fijo si --stagger-mins=0")
    ap.add_argument("--yt-category", default="24", help="ID de categoria de YouTube (24=Entretenimiento, 28=Ciencia/Tec)")
    ap.add_argument("--draft", action="store_true", help="Guardar como borrador en Buffer")
    ap.add_argument("--dry-run", action="store_true", help="Mostrar payloads sin enviar a Buffer")
    args = ap.parse_args()

    token = load_token()
    channels = get_channels(token)
    print("Canales detectados en Buffer:", {k: v["displayName"] for k, v in channels.items()})

    httpd = None
    tunnel_proc = None
    try:
        base = args.base_url.rstrip("/")
        if args.auto_tunnel and not args.dry_run:
            httpd = start_local_server(args.port)
            tunnel_proc, base = start_cloudflared_tunnel(args.port)
            print(f"Tunel temporal activo: {base}")

        now_utc = datetime.datetime.now(datetime.timezone.utc)

        for idx, slug in enumerate(args.slugs):
            mp4_name = find_video(slug)
            copys = parse_copys_md(os.path.join(ROOT, "salida", slug, "copys.md"))
            video_asset = {"url": f"{base}/{slug}/{mp4_name}"}

            if args.stagger_mins > 0:
                offset_mins = 1 + idx * args.stagger_mins
                post_mode = "customScheduled"
                due_dt = now_utc + datetime.timedelta(minutes=offset_mins)
                due_at_str = iso_utc(due_dt)
            else:
                post_mode = args.mode
                due_dt = None
                due_at_str = args.due_at

            for svc in args.services:
                if svc not in channels:
                    print(f"[SKIP] Canal '{svc}' no encontrado en Buffer.")
                    continue
                ch = channels[svc]
                inp: dict = {
                    "channelId": ch["id"],
                    "schedulingType": "automatic",
                    "mode": post_mode,
                    "needsApproval": False,
                    "assets": [{"video": video_asset}],
                }
                if args.draft:
                    inp["saveToDraft"] = True
                if post_mode == "customScheduled" and due_at_str:
                    inp["dueAt"] = due_at_str

                if svc == "youtube":
                    inp["text"] = copys["youtube_text"]
                    inp["metadata"] = {
                        "youtube": {
                            "title": copys["youtube_title"],
                            "categoryId": args.yt_category,
                            "type": "short",
                            "privacy": "public",
                            "madeForKids": False,
                            "notifySubscribers": True,
                        }
                    }
                elif svc == "instagram":
                    inp["text"] = copys["instagram_text"]
                    inp["metadata"] = {"instagram": {"type": "reel", "shouldShareToFeed": True}}
                elif svc == "facebook":
                    inp["text"] = copys["facebook_text"]
                    inp["metadata"] = {"facebook": {"type": "post"}}

                if args.dry_run:
                    print(f"\n[DRY-RUN] {slug} -> {svc} ({ch['displayName']}) | mode={post_mode} dueAt={due_at_str}")
                    continue

                res = create_post(token, inp)
                cp = res.get("data", {}).get("createPost", {})
                msg = cp.get("message", "")
                # Si YouTube excede el limite de 2/dia, reprogramar automaticamente +24h
                if svc == "youtube" and "maximum number of posts YouTube allows in a day" in msg:
                    fallback_dt = (due_dt or now_utc) + datetime.timedelta(days=1)
                    inp["mode"] = "customScheduled"
                    inp["dueAt"] = iso_utc(fallback_dt)
                    res = create_post(token, inp)
                print(f"[BUFFER] {slug} -> {svc} ({ch['displayName']}):", json.dumps(res, ensure_ascii=False))

        if args.auto_tunnel and not args.dry_run:
            time.sleep(12)
    finally:
        if tunnel_proc:
            tunnel_proc.terminate()
        if httpd:
            httpd.shutdown()


if __name__ == "__main__":
    main()
