import os
import asyncio
import json
import numpy as np
import scipy.io.wavfile as wavfile
import edge_tts

OUTPUT_DIR = "public/lorakh_estandar"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 100% NATURAL VOICE - ZERO RATE/PITCH ALTERATION
VOICE = "es-ES-AlvaroNeural"

SCRIPT_PARTS = [
    {
        "id": "hook",
        "text": "Hay cuatro perfumes Lorakh y casi todos eligen el incorrecto. No se eligen por el nombre: se eligen por la ocasión.",
        "start_sec": 0.5,
    },
    {
        "id": "item1",
        "text": "Número uno: Lorakh Midnight Club. Para romper la discoteca y salir de fiesta. Tabaco dulce, vainilla negra y ron oscuro con una proyección brutal que corta el aire a tres metros.",
        "start_sec": 7.5,
    },
    {
        "id": "item2",
        "text": "Número dos: Lorakh Royal Gold. El imán de la seducción. Ámbar cálido, maderas finas y bergamota para primeras citas, hablar al oído y dejar tu recuerdo en su piel.",
        "start_sec": 19.0,
    },
    {
        "id": "item3",
        "text": "Número tres: Lorakh Sapphire Ice. Frescura explosiva para el día a día. Menta helada y notas marinas para la oficina, la universidad y destacar con energía limpia.",
        "start_sec": 30.5,
    },
    {
        "id": "item4",
        "text": "Número cuatro: Nocturne Extrait de Parfum. Treinta y cinco por ciento de aceites puros franceses. Para eventos de gala, reuniones clave y noches frías donde necesitas imponer presencia.",
        "start_sec": 41.5,
    },
    {
        "id": "outro",
        "text": "Ahora ya sabes cuál Lorakh elegir según tu ocasión. Elige calidad pura y hazte notar.",
        "start_sec": 52.5,
    }
]

async def generate_speech():
    for part in SCRIPT_PARTS:
        part_wav = os.path.join(OUTPUT_DIR, f"{part['id']}_v2.wav")
        part_mp3 = os.path.join(OUTPUT_DIR, f"{part['id']}_v2.mp3")
        
        # EXACT NATURAL VOICE: rate="+0%", pitch="+0Hz"
        communicate = edge_tts.Communicate(part["text"], VOICE, rate="+0%", pitch="+0Hz")
        
        with open(part_mp3, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                    
        os.system(f'ffmpeg -i "{part_mp3}" -vn -c:a pcm_s16le "{part_wav}" -y >nul 2>&1')
        print(f"Generated natural voice part: {part['id']}")

def generate_subtitles_and_mix():
    subtitles = []
    
    # Calculate exact duration for each part
    durations = {}
    for p in SCRIPT_PARTS:
        wav_path = os.path.join(OUTPUT_DIR, f"{p['id']}_v2.wav")
        sr, data = wavfile.read(wav_path)
        dur = len(data) / sr
        durations[p['id']] = dur
        words = p['text'].split()
        w_dur = dur / len(words)
        print(f"{p['id']}: start {p['start_sec']}s, dur {dur:.2f}s ({len(words)} words)")
        
        for i, w in enumerate(words):
            w_start = p['start_sec'] + i * w_dur
            w_end = w_start + w_dur
            subtitles.append({
                'word': w,
                'start': round(w_start, 3),
                'end': round(w_end, 3),
                'part': p['id']
            })

    # Save subtitles.json
    out_json = os.path.join(OUTPUT_DIR, "subtitles.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(subtitles, f, ensure_ascii=False, indent=2)
    print("Saved updated subtitles.json")

    # Now create clean, elegant background music bed
    sr = 44100
    total_sec = 60.0
    total_samples = int(total_sec * sr)
    music = np.zeros(total_samples, dtype=np.float32)
    
    bpm = 120.0
    beat_dur = 60.0 / bpm
    total_beats = int(total_sec / beat_dur)
    
    # Sophisticated chic deep house chords (D minor, F major, C major, Bb major)
    chords = [73.42, 87.31, 65.41, 58.27] # D2, F2, C2, Bb1
    
    for beat in range(total_beats):
        b_time = beat * beat_dur
        b_idx = int(b_time * sr)
        if b_idx >= total_samples:
            break
            
        # 1. Subtle, round kick (soft, not overpowering)
        kick_dur = 0.20
        kick_n = int(kick_dur * sr)
        if b_idx + kick_n < total_samples:
            t_k = np.linspace(0, kick_dur, kick_n, endpoint=False)
            f_k = 110.0 * np.exp(-t_k * 22.0) + 42.0
            phase = 2 * np.pi * np.cumsum(f_k) / sr
            kick = np.sin(phase) * np.exp(-t_k * 15.0) * 0.28
            music[b_idx:b_idx+kick_n] += kick
            
        # 2. Delicate shakers / hi-hat
        hat_idx = int((b_time + beat_dur * 0.5) * sr)
        hat_dur = 0.05
        hat_n = int(hat_dur * sr)
        if hat_idx + hat_n < total_samples:
            noise = np.random.uniform(-1, 1, hat_n).astype(np.float32)
            t_h = np.linspace(0, hat_dur, hat_n, endpoint=False)
            hat = noise * np.exp(-t_h * 65.0) * 0.08
            music[hat_idx:hat_idx+hat_n] += hat
            
        # 3. Warm Rhodes-style synth chords (every 4 beats)
        if beat % 4 == 0:
            pad_dur = beat_dur * 4.0
            pad_n = int(pad_dur * sr)
            if b_idx + pad_n < total_samples:
                c_idx = (beat // 4) % len(chords)
                root = chords[c_idx] * 2.0 # D3
                t_p = np.linspace(0, pad_dur, pad_n, endpoint=False)
                pad = (
                    np.sin(2 * np.pi * root * t_p) +
                    0.6 * np.sin(2 * np.pi * (root * 1.2) * t_p) +
                    0.4 * np.sin(2 * np.pi * (root * 1.5) * t_p)
                )
                env = np.sin(np.pi * t_p / pad_dur) * 0.08
                music[b_idx:b_idx+pad_n] += pad * env

    # Subtle sound effects at transitions (spray & glass shimmer)
    sfx_times = [0.6, 7.5, 19.0, 30.5, 41.5, 52.5]
    for st in sfx_times:
        s_idx = int(st * sr)
        sp_dur = 0.28
        sp_n = int(sp_dur * sr)
        if s_idx + sp_n < total_samples:
            sp_t = np.linspace(0, sp_dur, sp_n, endpoint=False)
            spray = np.random.uniform(-1, 1, sp_n).astype(np.float32)
            spray = spray * np.exp(-sp_t * 11.0) * np.sin(np.pi * sp_t / sp_dur) * 0.14
            music[s_idx:s_idx+sp_n] += spray
            
        ch_dur = 0.4
        ch_n = int(ch_dur * sr)
        if s_idx + ch_n < total_samples:
            ch_t = np.linspace(0, ch_dur, ch_n, endpoint=False)
            chime = (np.sin(2 * np.pi * 2349.0 * ch_t) + 0.5 * np.sin(2 * np.pi * 3520.0 * ch_t)) * np.exp(-ch_t * 7.0) * 0.12
            music[s_idx:s_idx+ch_n] += chime

    # Now add clean, upfront, 100% natural voice!
    mixed = np.copy(music) * 0.40  # Keep music subtle in the background
    
    for part in SCRIPT_PARTS:
        part_wav = os.path.join(OUTPUT_DIR, f"{part['id']}_v2.wav")
        if os.path.exists(part_wav):
            fs, v_data = wavfile.read(part_wav)
            if v_data.ndim == 2:
                v_data = v_data.mean(axis=1)
            v_data = v_data.astype(np.float32) / 32768.0
            
            p_idx = int(part["start_sec"] * sr)
            p_len = min(len(v_data), total_samples - p_idx)
            if p_len > 0:
                # Add natural voice loud and clear
                mixed[p_idx:p_idx+p_len] += v_data[:p_len] * 1.05

    max_val = np.max(np.abs(mixed))
    if max_val > 0.98:
        mixed = mixed / max_val * 0.98
        
    out_wav = os.path.join(OUTPUT_DIR, "lorakh_estandar_final.wav")
    wavfile.write(out_wav, sr, (mixed * 32767).astype(np.int16))
    
    out_mp3 = os.path.join(OUTPUT_DIR, "lorakh_estandar_audio.mp3")
    os.system(f'ffmpeg -i "{out_wav}" -c:a libmp3lame -b:a 192k "{out_mp3}" -y >nul 2>&1')
    print("Master audio generated cleanly at public/lorakh_estandar/lorakh_estandar_audio.mp3")

async def main():
    await generate_speech()
    generate_subtitles_and_mix()

if __name__ == '__main__':
    asyncio.run(main())

