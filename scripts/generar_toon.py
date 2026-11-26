#!/usr/bin/env python3
"""
Generador ultra-rapido y de bajo consumo de tokens para videos Toon Frenetico 3D.
Uso:
  .venv/Scripts/python.exe scripts/generar_toon.py --spec ruta/spec.json --voice ruta/voz.mp3 --slug mi-video --out-name video_final.mp4
"""
import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ACTIVE_SPEC_PATH = os.path.join(ROOT, "src", "videos", "toon_frenetico", "active_spec.json")
AUDIO_SCRIPT = os.path.join(os.path.dirname(__file__), "audio_frenetic.py")


def run(cmd, cwd=ROOT, check=True):
    exe = shutil.which(cmd[0]) or cmd[0]
    res = subprocess.run([exe, *cmd[1:]], cwd=cwd, text=True, encoding="utf-8", errors="replace", capture_output=True)
    if check and res.returncode != 0:
        print(f"[ERR] Fallo comando: {' '.join(cmd)} (exit={res.returncode})", flush=True)
        if res.stdout:
            print(res.stdout, flush=True)
        if res.stderr:
            print(res.stderr, file=sys.stderr, flush=True)
        sys.exit(res.returncode)
    return res


def get_duration(audio_path: str) -> float:
    res = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ])
    return float(res.stdout.strip())


def build_captions(segments, accents):
    out = []
    for seg in segments:
        words = seg["text"].split()
        chunks = [" ".join(words[i:i + 2]) for i in range(0, len(words), 2)]
        weights = [max(3, len(re.sub(r"[.,…:;¿?¡!]", "", c))) for c in chunks]
        total_w = sum(weights) or 1
        dur = seg["endSec"] - seg["startSec"]
        cur = seg["startSec"]
        for c, w in zip(chunks, weights):
            cd = (w / total_w) * dur
            sf = round(cur * 30)
            ef = max(sf + 2, round((cur + cd) * 30) - 1)
            cap = {"text": c, "startFrame": sf, "endFrame": ef}
            if c in accents:
                cap["accentColor"] = accents[c]
            out.append(cap)
            cur += cd
    return out


def apply_anti_clipping(shots):
    for s in shots:
        for p in s.get("props3d", []):
            if p.get("type") == "sign" and p.get("scale", 1.0) > 0.80:
                p["scale"] = 0.78
        if len(s.get("actors", [])) >= 2 and not s.get("allowCloseUp"):
            cam_to = s.get("camTo", [0, 2.5, 6.4])
            if cam_to[2] < 6.4:
                cam_to[2] = 6.5
            s["camTo"] = cam_to
    return shots


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True, help="JSON compacto con characters, segments, accents, shots, audioCues")
    ap.add_argument("--voice", required=True, help="Ruta al MP3/WAV de narracion")
    ap.add_argument("--slug", required=True, help="Carpeta en salida/<slug>")
    ap.add_argument("--out-name", required=True, help="Nombre del MP4 final")
    ap.add_argument("--thumb-sec", type=float, default=2.5)
    ap.add_argument("--keep-temp", action="store_true")
    args = ap.parse_args()

    with open(args.spec, "r", encoding="utf-8") as f:
        raw = json.load(f)

    dur = get_duration(args.voice)
    total_frames = math.ceil(dur * 30)

    shots = apply_anti_clipping(raw["shots"])
    if shots:
        shots[-1]["end"] = total_frames

    captions = raw.get("captions") or build_captions(raw.get("segments", []), raw.get("accents", {}))

    final_spec = {
        "fps": 30,
        "durationInFrames": total_frames,
        "characters": raw["characters"],
        "shots": shots,
        "captions": captions,
    }
    with open(ACTIVE_SPEC_PATH, "w", encoding="utf-8") as f:
        json.dump(final_spec, f, ensure_ascii=False, indent=2)

    out_tmp = os.path.join(ROOT, "out", args.slug)
    out_final_dir = os.path.join(ROOT, "salida", args.slug)
    os.makedirs(out_tmp, exist_ok=True)
    os.makedirs(out_final_dir, exist_ok=True)

    master_wav = os.path.join(out_tmp, "master_audio.wav")
    cues = raw.get("audioCues", {})
    audio_cmd = [sys.executable, AUDIO_SCRIPT, "--voice", args.voice, "--out", master_wav]
    for flag, key in [("--cues", "cues"), ("--impacts", "impacts"), ("--chachings", "chachings"), ("--dings", "dings")]:
        vals = cues.get(key)
        if vals:
            audio_cmd += [flag, ",".join(str(v) for v in vals)]
    run(audio_cmd)

    gl_backend = "--gl=angle" if sys.platform.startswith("win") else "--gl=swangle"
    silent_mp4 = os.path.join(out_tmp, "video_silent.mp4")
    run([
        "npx", "remotion", "render", "src/remotion/index.ts", "ToonDinamico",
        silent_mp4, "--codec=h264", "--pixel-format=yuv420p", "--crf=18", gl_backend
    ])

    final_mp4 = os.path.join(out_final_dir, args.out_name)
    run([
        "ffmpeg", "-y", "-v", "error", "-i", silent_mp4, "-i", master_wav,
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac",
        "-b:a", "192k", "-movflags", "+faststart", "-shortest", final_mp4
    ])

    thumb_jpg = os.path.join(out_final_dir, "portada.jpg")
    run([
        "ffmpeg", "-y", "-v", "error", "-ss", str(args.thumb_sec),
        "-i", final_mp4, "-vframes", "1", "-q:v", "2", thumb_jpg
    ])

    probe = run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size:stream=codec_name,width,height,r_frame_rate",
        "-of", "default=noprint_wrappers=1", final_mp4
    ])
    print(probe.stdout)

    if not args.keep_temp:
        shutil.rmtree(out_tmp, ignore_errors=True)
        if os.path.exists(args.voice):
            os.remove(args.voice)
        print(f"Limpieza OK: out_existe={os.path.exists(out_tmp)}, mp3_existe={os.path.exists(args.voice)}")


if __name__ == "__main__":
    main()

