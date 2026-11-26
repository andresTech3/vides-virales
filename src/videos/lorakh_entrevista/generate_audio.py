import os
import asyncio
import edge_tts
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_entrevista"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "es-ES-AlvaroNeural"

SCRIPTS = [
    {
        "id": "hook",
        "text": "Faltan cinco minutos para la entrevista más importante de tu vida... y tu aroma ya está decidiendo por ti.",
    },
    {
        "id": "error",
        "text": "El peor error: usar un perfume barato que huele a alcohol en el elevador y satura la oficina.",
    },
    {
        "id": "solucion_gold",
        "text": "Para una posición de alto estatus: Royal Gold. Notas de cedro y ámbar que transmiten distinción y calma.",
    },
    {
        "id": "solucion_ice",
        "text": "Para demostrar energía y mente fría: Sapphire Ice. Una frescura magnética de impacto impecable.",
    },
    {
        "id": "impacto",
        "text": "Tu currículum te consigue la entrevista, pero tu presencia es lo que nunca van a olvidar.",
    },
    {
        "id": "outro",
        "text": "¿Cuál llevarías tú? Comenta Royal Gold o Sapphire Ice. Lorakh Fragrance House.",
    },
]

async def generate():
    for item in SCRIPTS:
        mp3 = os.path.join(OUTPUT_DIR, f"{item['id']}.mp3")
        wav = os.path.join(OUTPUT_DIR, f"{item['id']}.wav")
        comm = edge_tts.Communicate(item["text"], VOICE, rate="+0%", pitch="+0Hz")
        with open(mp3, "wb") as f:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                    
        cmd = f'ffmpeg -i "{mp3}" -vn -ar 44100 -ac 2 -c:a pcm_s16le "{wav}" -y >nul 2>&1'
        os.system(cmd)
        
        sr, data = wavfile.read(wav)
        dur = len(data) / sr
        print(f"Generated {item['id']}: {dur:.2f}s (sr={sr})")

if __name__ == '__main__':
    asyncio.run(generate())

