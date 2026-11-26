import os
import json
import numpy as np
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_entrevista_pro"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SR = 44100
TOTAL_DURATION = 48.0
TOTAL_SAMPLES = int(TOTAL_DURATION * SR)

SHOTS = [
    {
        "id": "shot1_hook",
        "scene_start": 0.0,
        "voice_start": 0.3,
        "voice_file": os.path.join(OUTPUT_DIR, "shot1_hook.wav"),
        "text": "Faltan cinco minutos para la entrevista más importante de tu vida... y los nervios están al límite.",
    },
    {
        "id": "shot2_error",
        "scene_start": 6.8,
        "voice_start": 7.0,
        "voice_file": os.path.join(OUTPUT_DIR, "shot2_error.wav"),
        "text": "El error número uno: bañarte en un perfume barato. En un espacio cerrado, el alcohol etílico marea y arruina tu primera impresión.",
    },
    {
        "id": "shot3_lorakh",
        "scene_start": 16.5,
        "voice_start": 16.7,
        "voice_file": os.path.join(OUTPUT_DIR, "shot3_lorakh.wav"),
        "text": "El candidato preparado usa Lorakh. Notas nobles de ámbar y cedro que transmiten calma, autoridad y alto estatus.",
    },
    {
        "id": "shot4_rejection",
        "scene_start": 25.3,
        "voice_start": 25.5,
        "voice_file": os.path.join(OUTPUT_DIR, "shot4_rejection.wav"),
        "text": "El entrevistador no necesita ver tu currículum si tu olor le provoca dolor de cabeza: descartado al instante.",
    },
    {
        "id": "shot5_approval",
        "scene_start": 32.7,
        "voice_start": 32.9,
        "voice_file": os.path.join(OUTPUT_DIR, "shot5_approval.wav"),
        "text": "Pero con Lorakh, la memoria olfativa crea una conexión inmediata de confianza y liderazgo antes de que digas una sola palabra.",
    },
    {
        "id": "shot6_outro",
        "scene_start": 40.8,
        "voice_start": 41.0,
        "voice_file": os.path.join(OUTPUT_DIR, "shot6_outro.wav"),
        "text": "¿Cuál llevarías tú a la entrevista? Comenta tu opción. Lorakh Fragrance House.",
    },
]

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

def build_music_score():
    music = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    bpm = 124.0
    beat_sec = 60.0 / bpm
    total_beats = int(TOTAL_DURATION / beat_sec)
    
    # Cinematic minor harmony (Cm, Ab, Eb, Bb)
    prog_freqs = [65.41, 51.91, 77.78, 58.27] # C2, Ab1, Eb2, Bb1
    
    for b in range(total_beats):
        b_start = b * beat_sec
        b_idx = int(b_start * SR)
        if b_idx >= TOTAL_SAMPLES:
            break
            
        # 1. Round Kick on every beat
        k_dur = 0.20
        k_n = int(k_dur * SR)
        if b_idx + k_n < TOTAL_SAMPLES:
            t_k = np.linspace(0, k_dur, k_n, endpoint=False)
            f_k = 115.0 * np.exp(-t_k * 25.0) + 45.0
            phase = 2 * np.pi * np.cumsum(f_k) / SR
            kick = np.tanh(np.sin(phase) * 1.5) * np.exp(-t_k * 14.0) * 0.38
            music[b_idx:b_idx+k_n, 0] += kick
            music[b_idx:b_idx+k_n, 1] += kick
            
        # 2. Crisp Clap on beats 2 and 4
        if (b % 4 == 1) or (b % 4 == 3):
            c_dur = 0.12
            c_n = int(c_dur * SR)
            if b_idx + c_n < TOTAL_SAMPLES:
                t_c = np.linspace(0, c_dur, c_n, endpoint=False)
                noise = np.random.uniform(-1, 1, c_n).astype(np.float32)
                clap = noise * np.exp(-t_c * 35.0) * 0.18
                music[b_idx:b_idx+c_n, 0] += clap
                music[b_idx:b_idx+c_n, 1] += clap
                
        # 3. 16th-note Hi-hats
        for sub in range(4):
            sub_idx = int((b_start + sub * beat_sec / 4.0) * SR)
            h_dur = 0.04
            h_n = int(h_dur * SR)
            if sub_idx + h_n < TOTAL_SAMPLES:
                t_h = np.linspace(0, h_dur, h_n, endpoint=False)
                hat = np.random.uniform(-1, 1, h_n).astype(np.float32) * np.exp(-t_h * 75.0) * 0.05
                music[sub_idx:sub_idx+h_n, 0] += hat
                music[sub_idx:sub_idx+h_n, 1] += hat
                
        # 4. Bass pulse
        m_idx = (b // 4) % len(prog_freqs)
        base_f = prog_freqs[m_idx]
        b_dur = beat_sec * 0.48
        b_n = int(b_dur * SR)
        if b_idx + b_n < TOTAL_SAMPLES:
            t_b = np.linspace(0, b_dur, b_n, endpoint=False)
            bass = (np.sin(2 * np.pi * base_f * t_b) + 0.3 * np.sin(2 * np.pi * base_f * 2 * t_b)) * np.sin(np.pi * t_b / b_dur) * 0.18
            music[b_idx:b_idx+b_n, 0] += bass
            music[b_idx:b_idx+b_n, 1] += bass
            
        # 5. Clock tick on hook (first 6.8s)
        if b_start < 6.8:
            t_tk = np.linspace(0, 0.03, int(0.03 * SR), endpoint=False)
            tick = np.sin(2 * np.pi * 3200.0 * t_tk) * np.exp(-t_tk * 120.0) * 0.16
            music[b_idx:b_idx+len(t_tk), 0] += tick
            music[b_idx:b_idx+len(t_tk), 1] += tick
            
    return music

def add_sfx(mix):
    # SFX files
    sfx_files = {
        "whoosh": "assets/sfx/whoosh.mp3",
        "boom": "assets/sfx/impact_boom.mp3",
        "glitch": "assets/sfx/glitch.mp3",
    }
    loaded = {}
    for k, v in sfx_files.items():
        w_tmp = os.path.join(OUTPUT_DIR, f"sfx_{k}.wav")
        os.system(f'ffmpeg -i "{v}" -ar 44100 -ac 2 -c:a pcm_s16le "{w_tmp}" -y >nul 2>&1')
        loaded[k] = load_wav_resampled(w_tmp)
        
    # Transition whooshes
    transitions = [0.0, 6.8, 16.5, 25.3, 32.7, 40.8]
    for tr in transitions:
        idx = int(tr * SR)
        whoosh = loaded["whoosh"] * 0.45
        n = min(len(whoosh), TOTAL_SAMPLES - idx)
        mix[idx:idx+n] += whoosh[:n]
        
    # Impact booms
    for tr in [0.0, 40.8]:
        idx = int(tr * SR)
        boom = loaded["boom"] * 0.60
        n = min(len(boom), TOTAL_SAMPLES - idx)
        mix[idx:idx+n] += boom[:n]
        
    # Glitch / error at rejection (27.5s)
    g_idx = int(27.5 * SR)
    glitch = loaded["glitch"] * 0.50
    n = min(len(glitch), TOTAL_SAMPLES - g_idx)
    mix[g_idx:g_idx+n] += glitch[:n]
    
    # Spray sounds
    # 4x rapid spray on Cheap Guy (Shot 2: 9.0s, 9.4s, 9.8s, 10.2s)
    for sp_t in [9.0, 9.4, 9.8, 10.2]:
        idx = int(sp_t * SR)
        dur = 0.18
        n_sp = int(dur * SR)
        if idx + n_sp < TOTAL_SAMPLES:
            t = np.linspace(0, dur, n_sp, endpoint=False)
            sp = np.random.uniform(-1, 1, n_sp).astype(np.float32) * np.exp(-t * 12.0) * 0.14
            mix[idx:idx+n_sp, 0] += sp
            mix[idx:idx+n_sp, 1] += sp
            
    # 1x elegant spray on Lorakh Guy (Shot 3: 18.0s)
    idx_l = int(18.0 * SR)
    dur_l = 0.28
    n_l = int(dur_l * SR)
    if idx_l + n_l < TOTAL_SAMPLES:
        t = np.linspace(0, dur_l, n_l, endpoint=False)
        sp_l = np.random.uniform(-1, 1, n_l).astype(np.float32) * np.sin(np.pi * t / dur_l) * np.exp(-t * 8.0) * 0.18
        mix[idx_l:idx_l+n_l, 0] += sp_l
        mix[idx_l:idx_l+n_l, 1] += sp_l

def mix_master():
    print("Building score...")
    score = build_music_score()
    add_sfx(score)
    
    duck_env = np.ones(TOTAL_SAMPLES, dtype=np.float32) * 0.32
    voice_track = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    subtitles = []
    
    for sh in SHOTS:
        v_data = load_wav_resampled(sh["voice_file"])
        v_dur = len(v_data) / SR
        v_start = sh["voice_start"]
        v_idx = int(v_start * SR)
        v_n = min(len(v_data), TOTAL_SAMPLES - v_idx)
        
        voice_track[v_idx:v_idx+v_n] += v_data[:v_n] * 1.30
        
        # Duck music during speech
        d_start = max(0, v_idx - int(0.1 * SR))
        d_end = min(TOTAL_SAMPLES, v_idx + v_n + int(0.15 * SR))
        duck_env[d_start:d_end] = 0.12
        
        words = sh["text"].split()
        w_dur = v_dur / len(words)
        for i, w in enumerate(words):
            subtitles.append({
                "word": w,
                "start": round(v_start + i * w_dur, 3),
                "end": round(v_start + (i + 1) * w_dur, 3),
                "part": sh["id"],
                "scene": sh["id"]
            })
            
    # Smooth ducking
    win = np.ones(int(0.08 * SR)) / int(0.08 * SR)
    duck_s = np.convolve(duck_env, win, mode='same')
    duck_s = np.column_stack([duck_s, duck_s])
    
    final_mix = (score * duck_s) + voice_track
    
    max_peak = np.max(np.abs(final_mix))
    print(f"Max peak: {max_peak:.2f}")
    if max_peak > 0.95:
        final_mix = final_mix / max_peak * 0.95
        
    out_wav = os.path.join(OUTPUT_DIR, "entrevista_pro_audio_final.wav")
    out_mp3 = os.path.join(OUTPUT_DIR, "entrevista_pro_audio.mp3")
    wavfile.write(out_wav, SR, (final_mix * 32767).astype(np.int16))
    os.system(f'ffmpeg -i "{out_wav}" -c:a libmp3lame -b:a 256k "{out_mp3}" -y >nul 2>&1')
    
    sub_json = os.path.join(OUTPUT_DIR, "entrevista_pro_subtitles.json")
    with open(sub_json, "w", encoding="utf-8") as f:
        json.dump(subtitles, f, ensure_ascii=False, indent=2)
        
    print(f"Master audio saved to {out_mp3}")
    print(f"Saved {len(subtitles)} subtitle tokens to {sub_json}")

if __name__ == '__main__':
    mix_master()

