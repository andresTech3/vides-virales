import os
import json
import numpy as np
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_quiz"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SR = 44100

# 1. Timeline configuration (37.5 seconds total = 1125 frames @ 30fps)
SCENES = [
    {
        "id": "hook",
        "scene_start": 0.0,
        "voice_start": 0.25,
        "voice_file": "public/lorakh_quiz/hook.wav",
        "text": "¿Cuál es tu perfume según tu personalidad?",
    },
    {
        "id": "arq1",
        "scene_start": 3.5,
        "voice_start": 3.6,
        "voice_file": "public/lorakh_quiz/arq1.wav",
        "text": "Si eres dueño de la noche... Midnight Club: seducción letal.",
    },
    {
        "id": "arq2",
        "scene_start": 9.0,
        "voice_start": 9.1,
        "voice_file": "public/lorakh_quiz/arq2.wav",
        "text": "Si buscas poder y elegancia... Royal Gold: distinción pura.",
    },
    {
        "id": "arq3",
        "scene_start": 14.5,
        "voice_start": 14.6,
        "voice_file": "public/lorakh_quiz/arq3.wav",
        "text": "Si eres libre y enérgico... Sapphire Ice: frescura explosiva.",
    },
    {
        "id": "arq4",
        "scene_start": 20.3,
        "voice_start": 20.4,
        "voice_file": "public/lorakh_quiz/arq4.wav",
        "text": "Si eres magnético y dulce... Velvet Amber: atracción irresistible.",
    },
    {
        "id": "arq5",
        "scene_start": 26.0,
        "voice_start": 26.1,
        "voice_file": "public/lorakh_quiz/arq5.wav",
        "text": "Y si buscas máxima autoridad... Nocturne Extrait: impacto absoluto.",
    },
    {
        "id": "outro",
        "scene_start": 31.8,
        "voice_start": 31.9,
        "voice_file": "public/lorakh_quiz/outro.wav",
        "text": "¿Cuál eres tú? Comenta tu número aquí abajo. Lorakh.",
    },
]

TOTAL_DURATION = 37.6
TOTAL_SAMPLES = int(TOTAL_DURATION * SR)

def load_wav_resampled(path):
    # Ensure wav is read and converted to float32 stereo (-1.0 to 1.0)
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
    
    # Bass notes (D minor progression: D2, F2, C2, G2)
    # Frequencies: D2 = 73.42 Hz, F2 = 87.31 Hz, C2 = 65.41 Hz, G2 = 98.00 Hz
    prog_freqs = [73.42, 87.31, 65.41, 98.00]
    
    for b in range(total_beats):
        b_start = b * beat_sec
        b_idx = int(b_start * SR)
        if b_idx >= TOTAL_SAMPLES:
            break
            
        # 1. PUNCHY 808 CLUB KICK on every beat (4-on-the-floor)
        kick_dur = 0.22
        k_n = int(kick_dur * SR)
        if b_idx + k_n < TOTAL_SAMPLES:
            t = np.linspace(0, kick_dur, k_n, endpoint=False)
            # Pitch drop envelope (from 160Hz punch down to 48Hz sub)
            f_env = 120.0 * np.exp(-t * 28.0) + 48.0
            phase = 2 * np.pi * np.cumsum(f_env) / SR
            # Body + slight harmonic distortion
            body = np.sin(phase) + 0.25 * np.sin(phase * 2)
            kick_amp = np.exp(-t * 14.0) * 0.40
            kick = np.tanh(body * 1.5) * kick_amp
            beat_track[b_idx:b_idx+k_n, 0] += kick
            beat_track[b_idx:b_idx+k_n, 1] += kick

        # 2. CRISP CLAP / SNARE on beats 2 and 4 (beats 1, 3 in 0-indexed per measure)
        if (b % 4 == 1) or (b % 4 == 3):
            clap_dur = 0.14
            c_n = int(clap_dur * SR)
            if b_idx + c_n < TOTAL_SAMPLES:
                t_c = np.linspace(0, clap_dur, c_n, endpoint=False)
                noise = np.random.uniform(-1, 1, c_n).astype(np.float32)
                # Bandpass-like snappy burst
                clap_env = np.exp(-t_c * 30.0) * 0.22
                tone = np.sin(2 * np.pi * 950.0 * t_c) * np.exp(-t_c * 40.0) * 0.12
                clap = (noise * 0.8 + tone) * clap_env
                beat_track[b_idx:b_idx+c_n, 0] += clap * 0.95
                beat_track[b_idx:b_idx+c_n, 1] += clap * 1.05

        # 3. ROLLING 16th-NOTE HI-HATS with groove
        for sub in range(4):
            sub_time = b_start + sub * (beat_sec / 4.0)
            sub_idx = int(sub_time * SR)
            h_dur = 0.04 if sub % 2 == 0 else 0.06
            h_n = int(h_dur * SR)
            if sub_idx + h_n < TOTAL_SAMPLES:
                t_h = np.linspace(0, h_dur, h_n, endpoint=False)
                h_noise = np.random.uniform(-1, 1, h_n).astype(np.float32)
                # Velocity: offbeats louder
                vol = 0.08 if sub == 2 else 0.04
                hat = h_noise * np.exp(-t_h * 75.0) * vol
                # Stereo pan flutter
                pan_l = 0.8 if sub % 2 == 0 else 1.2
                pan_r = 1.2 if sub % 2 == 0 else 0.8
                beat_track[sub_idx:sub_idx+h_n, 0] += hat * pan_l
                beat_track[sub_idx:sub_idx+h_n, 1] += hat * pan_r

        # 4. ROLLING SUB-BASS (8th notes, pulsing)
        measure = (b // 4) % len(prog_freqs)
        base_f = prog_freqs[measure]
        for sub_b in range(2):
            sb_time = b_start + sub_b * (beat_sec / 2.0)
            sb_idx = int(sb_time * SR)
            sb_dur = beat_sec * 0.45
            sb_n = int(sb_dur * SR)
            if sb_idx + sb_n < TOTAL_SAMPLES:
                t_sb = np.linspace(0, sb_dur, sb_n, endpoint=False)
                # Rich filtered sawtooth / square hybrid
                f = base_f if sub_b == 0 else base_f * 1.0
                bass = (
                    np.sin(2 * np.pi * f * t_sb) +
                    0.4 * np.sin(2 * np.pi * (f * 2) * t_sb) +
                    0.15 * np.sin(2 * np.pi * (f * 3) * t_sb)
                )
                bass_env = np.sin(np.pi * t_sb / sb_dur) * 0.20
                beat_track[sb_idx:sb_idx+sb_n, 0] += bass * bass_env
                beat_track[sb_idx:sb_idx+sb_n, 1] += bass * bass_env

        # 5. CHIC PLUCK / ARPEGGIO CHORDS
        chord_dur = beat_sec * 2.0
        if b % 2 == 0:
            c_idx = int(b_start * SR)
            c_n = int(chord_dur * SR)
            if c_idx + c_n < TOTAL_SAMPLES:
                t_p = np.linspace(0, chord_dur, c_n, endpoint=False)
                chord_root = base_f * 4.0 # High register
                chord = (
                    np.sin(2 * np.pi * chord_root * t_p) +
                    0.7 * np.sin(2 * np.pi * (chord_root * 1.2) * t_p) +
                    0.5 * np.sin(2 * np.pi * (chord_root * 1.5) * t_p)
                )
                p_env = np.exp(-t_p * 3.5) * 0.08
                beat_track[c_idx:c_idx+c_n, 0] += chord * p_env * 1.1
                beat_track[c_idx:c_idx+c_n, 1] += chord * p_env * 0.9

    return beat_track

def add_sfx(audio_mix):
    # Convert assets/sfx to 44100 stereo and mix at key timestamps
    sfx_files = {
        "whoosh": "assets/sfx/whoosh.mp3",
        "boom": "assets/sfx/impact_boom.mp3",
        "pop": "assets/sfx/pop.mp3",
    }
    
    # Pre-resample sfx to wav
    loaded_sfx = {}
    for k, v in sfx_files.items():
        wav_tmp = f"public/lorakh_quiz/sfx_{k}.wav"
        os.system(f'ffmpeg -i "{v}" -ar 44100 -ac 2 -c:a pcm_s16le "{wav_tmp}" -y >nul 2>&1')
        loaded_sfx[k] = load_wav_resampled(wav_tmp)
        
    # 1. Impact Boom at Hook (0.0s) and Outro (31.8s)
    for t_hit in [0.0, 31.8]:
        idx = int(t_hit * SR)
        boom = loaded_sfx["boom"] * 0.65
        n = min(len(boom), TOTAL_SAMPLES - idx)
        audio_mix[idx:idx+n] += boom[:n]
        
    # 2. Whooshes at every scene transition
    transition_times = [0.0, 3.5, 9.0, 14.5, 20.3, 26.0, 31.8]
    for t_w in transition_times:
        idx = int(t_w * SR)
        whoosh = loaded_sfx["whoosh"] * 0.50
        n = min(len(whoosh), TOTAL_SAMPLES - idx)
        audio_mix[idx:idx+n] += whoosh[:n]

    # 3. Spray & Pop at bottle reveal and essence keyword
    for sc in SCENES[1:6]: # 5 archetypes
        # Bottle reveal spray at scene_start + 0.6s
        sp_idx = int((sc["scene_start"] + 0.6) * SR)
        sp_dur = 0.28
        sp_n = int(sp_dur * SR)
        if sp_idx + sp_n < TOTAL_SAMPLES:
            t_s = np.linspace(0, sp_dur, sp_n, endpoint=False)
            spray_noise = np.random.uniform(-1, 1, sp_n).astype(np.float32)
            spray_env = np.sin(np.pi * t_s / sp_dur) * np.exp(-t_s * 8.0) * 0.16
            audio_mix[sp_idx:sp_idx+sp_n, 0] += spray_noise * spray_env
            audio_mix[sp_idx:sp_idx+sp_n, 1] += spray_noise * spray_env

        # Pop SFX when keyword reveals at scene_start + 2.8s
        pop_idx = int((sc["scene_start"] + 2.8) * SR)
        pop = loaded_sfx["pop"] * 0.40
        p_n = min(len(pop), TOTAL_SAMPLES - pop_idx)
        audio_mix[pop_idx:pop_idx+p_n] += pop[:p_n]

def mix_master_and_subtitles():
    print("Generating energetic club beat...")
    beat = build_energetic_beat()
    
    print("Adding transitions and SFX...")
    add_sfx(beat)
    
    # Master mix starts with beat
    # Duck music: base volume 0.32, drops to 0.14 during speech
    duck_envelope = np.ones(TOTAL_SAMPLES, dtype=np.float32) * 0.30
    voice_track = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)
    
    subtitles = []
    
    for sc in SCENES:
        v_data = load_wav_resampled(sc["voice_file"])
        v_dur = len(v_data) / SR
        v_start = sc["voice_start"]
        v_end = v_start + v_dur
        v_idx = int(v_start * SR)
        v_n = min(len(v_data), TOTAL_SAMPLES - v_idx)
        
        # Add voice with 100% clarity and power
        voice_track[v_idx:v_idx+v_n] += v_data[:v_n] * 1.30
        
        # Duck music during voice with smooth ramp
        duck_start = max(0, v_idx - int(0.1 * SR))
        duck_end = min(TOTAL_SAMPLES, v_idx + v_n + int(0.15 * SR))
        duck_envelope[duck_start:duck_end] = 0.13
        
        # Calculate word subtitles
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
            
    # Smooth ducking envelope
    window_n = int(0.08 * SR)
    window = np.ones(window_n) / window_n
    duck_smoothed_l = np.convolve(duck_envelope, window, mode='same')
    duck_smoothed = np.column_stack([duck_smoothed_l, duck_smoothed_l])
    
    # Final combine: Ducked Beat + Prominent Alvaro Voice
    final_mix = (beat * duck_smoothed) + voice_track
    
    # Master limiter / normalizer
    max_peak = np.max(np.abs(final_mix))
    print(f"Max peak before limiting: {max_peak:.2f}")
    if max_peak > 0.95:
        final_mix = final_mix / max_peak * 0.95
        
    master_wav = os.path.join(OUTPUT_DIR, "quiz_audio_final.wav")
    master_mp3 = os.path.join(OUTPUT_DIR, "quiz_audio.mp3")
    
    wavfile.write(master_wav, SR, (final_mix * 32767).astype(np.int16))
    os.system(f'ffmpeg -i "{master_wav}" -c:a libmp3lame -b:a 256k "{master_mp3}" -y >nul 2>&1')
    
    sub_json = os.path.join(OUTPUT_DIR, "quiz_subtitles.json")
    with open(sub_json, "w", encoding="utf-8") as f:
        json.dump(subtitles, f, ensure_ascii=False, indent=2)
        
    print(f"Saved master audio to {master_mp3}")
    print(f"Saved {len(subtitles)} subtitle tokens to {sub_json}")

if __name__ == '__main__':
    mix_master_and_subtitles()

