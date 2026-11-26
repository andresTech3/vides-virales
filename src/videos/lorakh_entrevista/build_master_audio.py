import os
import json
import numpy as np
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_entrevista"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SR = 44100

SCENES = [
    {
        "id": "hook",
        "scene_start": 0.0,
        "voice_start": 0.25,
        "voice_file": os.path.join(OUTPUT_DIR, "hook.wav"),
        "text": "Faltan cinco minutos para la entrevista de tu vida... y tu aroma ya está decidiendo por ti.",
    },
    {
        "id": "error",
        "scene_start": 5.5,
        "voice_start": 5.6,
        "voice_file": os.path.join(OUTPUT_DIR, "error.wav"),
        "text": "El peor error: un perfume barato que huele a alcohol y arruina tu primera impresión.",
    },
    {
        "id": "gold",
        "scene_start": 10.8,
        "voice_start": 11.0,
        "voice_file": os.path.join(OUTPUT_DIR, "gold.wav"),
        "text": "Si buscas estatus y autoridad: Royal Gold. Cedro y ámbar que imponen respeto.",
    },
    {
        "id": "ice",
        "scene_start": 17.4,
        "voice_start": 17.6,
        "voice_file": os.path.join(OUTPUT_DIR, "ice.wav"),
        "text": "Si buscas energía y mente fría: Sapphire Ice. Frescura limpia e implacable.",
    },
    {
        "id": "impacto",
        "scene_start": 24.0,
        "voice_start": 24.2,
        "voice_file": os.path.join(OUTPUT_DIR, "impacto.wav"),
        "text": "El currículum abre la puerta, pero tu presencia es lo que nunca van a olvidar.",
    },
    {
        "id": "outro",
        "scene_start": 29.2,
        "voice_start": 29.4,
        "voice_file": os.path.join(OUTPUT_DIR, "outro.wav"),
        "text": "¿Cuál llevarías tú? Comenta Gold o Ice. Lorakh Fragrance House.",
    },
]

TOTAL_DURATION = 35.8
TOTAL_SAMPLES = int(TOTAL_DURATION * SR)

def load_wav_resampled(path):
    sr, data = wavfile.read(path)
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    elif data.dtype == np.uint8:
        data = (data.astype(np.float32) - 128.0) / 128.0
        
    if data.ndim == 1:
        data = np.column_stack([data, data])
    elif data.shape[1] > 2:
        data = data[:, :2]
        
    return data

def build_energetic_beat():
    beat_track = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    bpm = 126.0
    beat_sec = 60.0 / bpm
    total_beats = int(TOTAL_DURATION / beat_sec)
    
    # Minor progression: Em, C, G, D (Executive, high-stakes suspense feel)
    prog_freqs = [82.41, 65.41, 98.00, 73.42] # E2, C2, G2, D2
    
    for b in range(total_beats):
        b_start = b * beat_sec
        b_idx = int(b_start * SR)
        if b_idx >= TOTAL_SAMPLES:
            break
            
        # 1. PUNCHY 808 KICK
        kick_dur = 0.22
        k_n = int(kick_dur * SR)
        if b_idx + k_n < TOTAL_SAMPLES:
            t = np.linspace(0, kick_dur, k_n, endpoint=False)
            f_env = 130.0 * np.exp(-t * 26.0) + 48.0
            phase = 2 * np.pi * np.cumsum(f_env) / SR
            body = np.sin(phase) + 0.22 * np.sin(phase * 2)
            kick_amp = np.exp(-t * 14.0) * 0.42
            kick = np.tanh(body * 1.6) * kick_amp
            beat_track[b_idx:b_idx+k_n, 0] += kick
            beat_track[b_idx:b_idx+k_n, 1] += kick

        # 2. CRISP CLAP on beats 2 and 4
        if (b % 4 == 1) or (b % 4 == 3):
            clap_dur = 0.14
            c_n = int(clap_dur * SR)
            if b_idx + c_n < TOTAL_SAMPLES:
                t_c = np.linspace(0, clap_dur, c_n, endpoint=False)
                noise = np.random.uniform(-1, 1, c_n).astype(np.float32)
                clap_env = np.exp(-t_c * 32.0) * 0.22
                tone = np.sin(2 * np.pi * 1050.0 * t_c) * np.exp(-t_c * 40.0) * 0.12
                clap = (noise * 0.8 + tone) * clap_env
                beat_track[b_idx:b_idx+c_n, 0] += clap * 0.95
                beat_track[b_idx:b_idx+c_n, 1] += clap * 1.05

        # 3. 16th-NOTE HI-HATS
        for sub in range(4):
            sub_time = b_start + sub * (beat_sec / 4.0)
            sub_idx = int(sub_time * SR)
            h_dur = 0.04 if sub % 2 == 0 else 0.06
            h_n = int(h_dur * SR)
            if sub_idx + h_n < TOTAL_SAMPLES:
                t_h = np.linspace(0, h_dur, h_n, endpoint=False)
                h_noise = np.random.uniform(-1, 1, h_n).astype(np.float32)
                vol = 0.09 if sub == 2 else 0.04
                hat = h_noise * np.exp(-t_h * 80.0) * vol
                pan_l = 0.85 if sub % 2 == 0 else 1.15
                pan_r = 1.15 if sub % 2 == 0 else 0.85
                beat_track[sub_idx:sub_idx+h_n, 0] += hat * pan_l
                beat_track[sub_idx:sub_idx+h_n, 1] += hat * pan_r

        # 4. ROLLING SUB-BASS
        measure = (b // 4) % len(prog_freqs)
        base_f = prog_freqs[measure]
        for sub_b in range(2):
            sb_time = b_start + sub_b * (beat_sec / 2.0)
            sb_idx = int(sb_time * SR)
            sb_dur = beat_sec * 0.45
            sb_n = int(sb_dur * SR)
            if sb_idx + sb_n < TOTAL_SAMPLES:
                t_sb = np.linspace(0, sb_dur, sb_n, endpoint=False)
                bass = (
                    np.sin(2 * np.pi * base_f * t_sb) +
                    0.35 * np.sin(2 * np.pi * (base_f * 2) * t_sb) +
                    0.15 * np.sin(2 * np.pi * (base_f * 3) * t_sb)
                )
                bass_env = np.sin(np.pi * t_sb / sb_dur) * 0.22
                beat_track[sb_idx:sb_idx+sb_n, 0] += bass * bass_env
                beat_track[sb_idx:sb_idx+sb_n, 1] += bass * bass_env

        # 5. SUSPENSE CLOCK TICK on every beat during hook (first 5.5s)
        if b_start < 5.5:
            tick_dur = 0.03
            tk_n = int(tick_dur * SR)
            t_tk = np.linspace(0, tick_dur, tk_n, endpoint=False)
            tick = np.sin(2 * np.pi * 3200.0 * t_tk) * np.exp(-t_tk * 120.0) * 0.18
            beat_track[b_idx:b_idx+tk_n, 0] += tick
            beat_track[b_idx:b_idx+tk_n, 1] += tick

    return beat_track

def add_sfx(audio_mix):
    sfx_files = {
        "whoosh": "assets/sfx/whoosh.mp3",
        "boom": "assets/sfx/impact_boom.mp3",
        "pop": "assets/sfx/pop.mp3",
        "glitch": "assets/sfx/glitch.mp3",
    }
    
    loaded_sfx = {}
    for k, v in sfx_files.items():
        wav_tmp = os.path.join(OUTPUT_DIR, f"sfx_{k}.wav")
        os.system(f'ffmpeg -i "{v}" -ar 44100 -ac 2 -c:a pcm_s16le "{wav_tmp}" -y >nul 2>&1')
        loaded_sfx[k] = load_wav_resampled(wav_tmp)
        
    # Impact Boom at start (0.0s) and Outro (29.2s)
    for t_hit in [0.0, 24.0, 29.2]:
        idx = int(t_hit * SR)
        boom = loaded_sfx["boom"] * 0.65
        n = min(len(boom), TOTAL_SAMPLES - idx)
        audio_mix[idx:idx+n] += boom[:n]
        
    # Transition whooshes
    transitions = [0.0, 5.5, 10.8, 17.4, 24.0, 29.2]
    for t_w in transitions:
        idx = int(t_w * SR)
        whoosh = loaded_sfx["whoosh"] * 0.50
        n = min(len(whoosh), TOTAL_SAMPLES - idx)
        audio_mix[idx:idx+n] += whoosh[:n]

    # Glitch SFX at error scene (6.0s)
    g_idx = int(6.0 * SR)
    glitch = loaded_sfx["glitch"] * 0.45
    n_g = min(len(glitch), TOTAL_SAMPLES - g_idx)
    audio_mix[g_idx:g_idx+n_g] += glitch[:n_g]

    # Spray mist SFX on Gold (11.5s) and Ice (18.1s)
    for t_sp in [11.5, 18.1]:
        sp_idx = int(t_sp * SR)
        sp_dur = 0.28
        sp_n = int(sp_dur * SR)
        if sp_idx + sp_n < TOTAL_SAMPLES:
            t_s = np.linspace(0, sp_dur, sp_n, endpoint=False)
            spray_noise = np.random.uniform(-1, 1, sp_n).astype(np.float32)
            spray_env = np.sin(np.pi * t_s / sp_dur) * np.exp(-t_s * 8.0) * 0.18
            audio_mix[sp_idx:sp_idx+sp_n, 0] += spray_noise * spray_env
            audio_mix[sp_idx:sp_idx+sp_n, 1] += spray_noise * spray_env

def mix_master():
    print("Building energetic suspense house beat...")
    beat = build_energetic_beat()
    
    print("Adding SFX (whooshes, boom, spray, glitch)...")
    add_sfx(beat)
    
    duck_envelope = np.ones(TOTAL_SAMPLES, dtype=np.float32) * 0.32
    voice_track = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    
    subtitles = []
    
    for sc in SCENES:
        v_data = load_wav_resampled(sc["voice_file"])
        v_dur = len(v_data) / SR
        v_start = sc["voice_start"]
        v_idx = int(v_start * SR)
        v_n = min(len(v_data), TOTAL_SAMPLES - v_idx)
        
        # Add voice with 100% clarity
        voice_track[v_idx:v_idx+v_n] += v_data[:v_n] * 1.30
        
        # Duck music during voice
        duck_start = max(0, v_idx - int(0.1 * SR))
        duck_end = min(TOTAL_SAMPLES, v_idx + v_n + int(0.15 * SR))
        duck_envelope[duck_start:duck_end] = 0.12
        
        words = sc["text"].split()
        w_dur = v_dur / len(words)
        for i, w in enumerate(words):
            subtitles.append({
                "word": w,
                "start": round(v_start + i * w_dur, 3),
                "end": round(v_start + (i + 1) * w_dur, 3),
                "part": sc["id"],
                "scene": sc["id"]
            })
            
    # Smooth ducking
    window_n = int(0.08 * SR)
    window = np.ones(window_n) / window_n
    duck_smoothed_l = np.convolve(duck_envelope, window, mode='same')
    duck_smoothed = np.column_stack([duck_smoothed_l, duck_smoothed_l])
    
    final_mix = (beat * duck_smoothed) + voice_track
    
    max_peak = np.max(np.abs(final_mix))
    print(f"Peak before limiting: {max_peak:.2f}")
    if max_peak > 0.95:
        final_mix = final_mix / max_peak * 0.95
        
    master_wav = os.path.join(OUTPUT_DIR, "entrevista_audio_final.wav")
    master_mp3 = os.path.join(OUTPUT_DIR, "entrevista_audio.mp3")
    
    wavfile.write(master_wav, SR, (final_mix * 32767).astype(np.int16))
    os.system(f'ffmpeg -i "{master_wav}" -c:a libmp3lame -b:a 256k "{master_mp3}" -y >nul 2>&1')
    
    sub_json = os.path.join(OUTPUT_DIR, "entrevista_subtitles.json")
    with open(sub_json, "w", encoding="utf-8") as f:
        json.dump(subtitles, f, ensure_ascii=False, indent=2)
        
    print(f"Master audio generated: {master_mp3}")
    print(f"Saved {len(subtitles)} subtitle tokens to {sub_json}")

if __name__ == '__main__':
    mix_master()

