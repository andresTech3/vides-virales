import os
import json
import numpy as np
import scipy.io.wavfile as wavfile

OUTPUT_DIR = "public/lorakh_estandar"

SCRIPT_PARTS = [
    {
        "id": "hook",
        "start_sec": 0.5,
    },
    {
        "id": "item1",
        "start_sec": 9.0,
    },
    {
        "id": "item2",
        "start_sec": 19.5,
    },
    {
        "id": "item3",
        "start_sec": 30.5,
    },
    {
        "id": "item4",
        "start_sec": 41.2,
    },
    {
        "id": "outro",
        "start_sec": 52.2,
    }
]

def generate_music_and_mix():
    sr = 44100
    total_sec = 60.0
    total_samples = int(total_sec * sr)
    music = np.zeros(total_samples, dtype=np.float32)
    
    # 122 BPM chic deep house track
    bpm = 122.0
    beat_dur = 60.0 / bpm
    total_beats = int(total_sec / beat_dur)
    
    chord_freqs = [73.42, 87.31, 98.00, 116.54] # D2, F2, G2, Bb2
    
    for beat in range(total_beats):
        b_time = beat * beat_dur
        b_idx = int(b_time * sr)
        if b_idx >= total_samples:
            break
            
        # 1. Four-on-the-floor Punchy Kick
        kick_dur = 0.22
        kick_n = int(kick_dur * sr)
        if b_idx + kick_n < total_samples:
            t_k = np.linspace(0, kick_dur, kick_n, endpoint=False)
            f_k = 130.0 * np.exp(-t_k * 24.0) + 48.0
            phase = 2 * np.pi * np.cumsum(f_k) / sr
            kick = np.sin(phase) * np.exp(-t_k * 14.0) * 0.40
            music[b_idx:b_idx+kick_n] += kick
            
        # 2. Off-beat Crisp Hi-Hat (at beat + 0.5)
        hat_idx = int((b_time + beat_dur * 0.5) * sr)
        hat_dur = 0.08
        hat_n = int(hat_dur * sr)
        if hat_idx + hat_n < total_samples:
            noise = np.random.uniform(-1, 1, hat_n).astype(np.float32)
            t_h = np.linspace(0, hat_dur, hat_n, endpoint=False)
            hat = noise * np.exp(-t_h * 55.0) * 0.14
            music[hat_idx:hat_idx+hat_n] += hat
            
        # 3. Deep filtered sub-bass
        bass_idx = int((b_time + beat_dur * 0.25) * sr)
        bass_dur = beat_dur * 0.7
        bass_n = int(bass_dur * sr)
        if bass_idx + bass_n < total_samples:
            chord_idx = (beat // 8) % len(chord_freqs)
            bfreq = chord_freqs[chord_idx]
            t_b = np.linspace(0, bass_dur, bass_n, endpoint=False)
            bass = (np.sin(2 * np.pi * bfreq * t_b) + 0.35 * np.sin(2 * np.pi * bfreq * 2 * t_b))
            bass *= (np.sin(np.pi * t_b / bass_dur) ** 1.5) * 0.25
            music[bass_idx:bass_idx+bass_n] += bass
            
        # 4. Lush synth pad chord
        if beat % 4 == 0:
            pad_dur = beat_dur * 4.0
            pad_n = int(pad_dur * sr)
            if b_idx + pad_n < total_samples:
                chord_idx = (beat // 8) % len(chord_freqs)
                root = chord_freqs[chord_idx] * 2.0
                t_p = np.linspace(0, pad_dur, pad_n, endpoint=False)
                pad = (
                    np.sin(2 * np.pi * root * t_p) +
                    0.7 * np.sin(2 * np.pi * (root * 1.2) * t_p) +
                    0.5 * np.sin(2 * np.pi * (root * 1.5) * t_p)
                )
                env = np.sin(np.pi * t_p / pad_dur) * 0.10
                music[b_idx:b_idx+pad_n] += pad * env

    # Sound effects: Sprays and Chimes at transitions
    sfx_times = [0.8, 9.0, 19.5, 30.5, 41.2, 52.2]
    for st in sfx_times:
        s_idx = int(st * sr)
        sp_dur = 0.35
        sp_n = int(sp_dur * sr)
        if s_idx + sp_n < total_samples:
            sp_t = np.linspace(0, sp_dur, sp_n, endpoint=False)
            spray = np.random.uniform(-1, 1, sp_n).astype(np.float32)
            spray = spray * np.exp(-sp_t * 9.0) * np.sin(np.pi * sp_t / sp_dur) * 0.20
            music[s_idx:s_idx+sp_n] += spray
            
        ch_dur = 0.5
        ch_n = int(ch_dur * sr)
        if s_idx + ch_n < total_samples:
            ch_t = np.linspace(0, ch_dur, ch_n, endpoint=False)
            chime = (np.sin(2 * np.pi * 2093.0 * ch_t) + 0.6 * np.sin(2 * np.pi * 3135.0 * ch_t)) * np.exp(-ch_t * 6.0) * 0.16
            music[s_idx:s_idx+ch_n] += chime

    mixed = np.copy(music) * 0.45
    
    for part in SCRIPT_PARTS:
        part_wav = os.path.join(OUTPUT_DIR, f"{part['id']}.wav")
        if os.path.exists(part_wav):
            fs, v_data = wavfile.read(part_wav)
            if v_data.ndim == 2:
                v_data = v_data.mean(axis=1)
            v_data = v_data.astype(np.float32) / 32768.0
            
            p_idx = int(part["start_sec"] * sr)
            p_len = min(len(v_data), total_samples - p_idx)
            if p_len > 0:
                mixed[p_idx:p_idx+p_len] += v_data[:p_len] * 1.0

    max_val = np.max(np.abs(mixed))
    if max_val > 0.98:
        mixed = mixed / max_val * 0.98
        
    out_wav = os.path.join(OUTPUT_DIR, "lorakh_estandar_final.wav")
    wavfile.write(out_wav, sr, (mixed * 32767).astype(np.int16))
    print(f"Saved {out_wav}")
    
    out_mp3 = os.path.join(OUTPUT_DIR, "lorakh_estandar_audio.mp3")
    os.system(f'ffmpeg -i "{out_wav}" -c:a libmp3lame -b:a 192k "{out_mp3}" -y >nul 2>&1')
    print(f"Saved {out_mp3}")

if __name__ == '__main__':
    generate_music_and_mix()
