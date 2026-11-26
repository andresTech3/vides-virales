import os
import asyncio
import edge_tts
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_entrevista_pro"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "es-ES-AlvaroNeural"

PRO_SCRIPT = [
    {
        "id": "shot1_hook",
        "text": "Faltan cinco minutos para la entrevista más importante de tu vida... y los nervios están al límite.",
    },
    {
        "id": "shot2_error",
        "text": "El error número uno: bañarte en un perfume barato. En un espacio cerrado, el alcohol etílico marea y arruina tu primera impresión.",
    },
    {
        "id": "shot3_lorakh",
        "text": "El candidato preparado usa Lorakh. Notas nobles de ámbar y cedro que transmiten calma, autoridad y alto estatus.",
    },
    {
        "id": "shot4_rejection",
        "text": "El entrevistador no necesita ver tu currículum si tu olor le provoca dolor de cabeza: descartado al instante.",
    },
    {
        "id": "shot5_approval",
        "text": "Pero con Lorakh, la memoria olfativa crea una conexión inmediata de confianza y liderazgo antes de que digas una sola palabra.",
    },
    {
        "id": "shot6_outro",
        "text": "¿Cuál llevarías tú a la entrevista? Comenta tu opción. Lorakh Fragrance House.",
    },
]

async def generate():
    total_dur = 0
    for s in PRO_SCRIPT:
        mp3 = os.path.join(OUTPUT_DIR, f"{s['id']}.mp3")
        wav = os.path.join(OUTPUT_DIR, f"{s['id']}.wav")
        comm = edge_tts.Communicate(s["text"], VOICE, rate="+0%", pitch="+0Hz")
        await comm.save(mp3)
        os.system(f'ffmpeg -i "{mp3}" -vn -ar 44100 -ac 2 -c:a pcm_s16le "{wav}" -y >nul 2>&1')
        sr, data = wavfile.read(wav)
        dur = len(data) / sr
        total_dur += dur
        print(f"{s['id']}: {dur:.2f}s -> {s['text']}")
    print(f"Total speech duration: {total_dur:.2f}s")

if __name__ == '__main__':
    asyncio.run(generate())

