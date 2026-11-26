import os
import asyncio
import json
import edge_tts
import numpy as np
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_quiz"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "es-ES-AlvaroNeural"

SECTIONS = [
    {
        "id": "hook",
        "text": "¿Cuál es tu perfume según tu personalidad?",
        "start_sec": 0.3,
        "scene_start_sec": 0.0,
        "scene_end_sec": 3.5,
    },
    {
        "id": "arq1",
        "text": "Si eres dueño de la noche... Midnight Club: seducción letal.",
        "start_sec": 3.7,
        "scene_start_sec": 3.5,
        "scene_end_sec": 8.0,
    },
    {
        "id": "arq2",
        "text": "Si buscas poder y elegancia... Royal Gold: distinción pura.",
        "start_sec": 8.2,
        "scene_start_sec": 8.0,
        "scene_end_sec": 12.5,
    },
    {
        "id": "arq3",
        "text": "Si eres libre y enérgico... Sapphire Ice: frescura explosiva.",
        "start_sec": 12.7,
        "scene_start_sec": 12.5,
        "scene_end_sec": 17.0,
    },
    {
        "id": "arq4",
        "text": "Si eres magnético y dulce... Velvet Amber: atracción irresistible.",
        "start_sec": 17.2,
        "scene_start_sec": 17.0,
        "scene_end_sec": 21.5,
    },
    {
        "id": "arq5",
        "text": "Y si buscas máxima autoridad... Nocturne Extrait: impacto absoluto.",
        "start_sec": 21.7,
        "scene_start_sec": 21.5,
        "scene_end_sec": 26.0,
    },
    {
        "id": "outro",
        "text": "¿Cuál eres tú? Comenta tu número aquí abajo. Lorakh.",
        "start_sec": 26.3,
        "scene_start_sec": 26.0,
        "scene_end_sec": 31.0,
    },
]

async def generate_speech():
    for sec in SECTIONS:
        mp3_path = os.path.join(OUTPUT_DIR, f"{sec['id']}.mp3")
        wav_path = os.path.join(OUTPUT_DIR, f"{sec['id']}.wav")
        
        # 100% natural rate and pitch
        communicate = edge_tts.Communicate(sec["text"], VOICE, rate="+0%", pitch="+0Hz")
        with open(mp3_path, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                    
        # Force resample to strictly 44100 Hz, stereo
        cmd = f'ffmpeg -i "{mp3_path}" -vn -ar 44100 -ac 2 -c:a pcm_s16le "{wav_path}" -y >nul 2>&1'
        os.system(cmd)
        
        sr, data = wavfile.read(wav_path)
        dur = len(data) / sr
        print(f"Generated {sec['id']}: {dur:.2f}s (sr={sr}, shape={data.shape}) -> starts at {sec['start_sec']}s, fits in scene [{sec['scene_start_sec']}s - {sec['scene_end_sec']}s]")

if __name__ == '__main__':
    asyncio.run(generate_speech())

