import numpy as np
import scipy.signal as signal
import scipy.io.wavfile as wavfile
import subprocess
import os

SR = 48000
DUR = 80.0
TOTAL_SAMPLES = int(SR * DUR)

def env(length, attack, decay, sustain=0.0, release=0.0):
    n_att = int(SR * attack)
    n_dec = int(SR * decay)
    n_rel = int(SR * release)
    n_sus = max(0, length - n_att - n_dec - n_rel)
    parts = []
    if n_att > 0:
        parts.append(np.linspace(0, 1, n_att) ** 1.5)
    if n_dec > 0:
        parts.append(np.linspace(1, sustain, n_dec) ** 2)
    if n_sus > 0:
        parts.append(np.full(n_sus, sustain))
    if n_rel > 0:
        parts.append(np.linspace(sustain, 0, n_rel) ** 2)
    arr = np.concatenate(parts) if parts else np.zeros(length)
    if len(arr) < length:
        arr = np.pad(arr, (0, length - len(arr)))
    return arr[:length]

def synth_kick():
    d = 0.35
    n = int(SR * d)
    t = np.arange(n) / SR
    # Pitch drop from 140 Hz to 45 Hz
    f = 45.0 + 95.0 * np.exp(-t / 0.04)
    phase = 2 * np.pi * np.cumsum(f) / SR
    osc = np.sin(phase)
    # Click transient
    click = (np.random.rand(n) * 2 - 1) * np.exp(-t / 0.005) * 0.4
    e = np.exp(-t / 0.09)
    return (osc + click) * e

def synth_hihat(open_hh=False):
    d = 0.25 if open_hh else 0.06
    n = int(SR * d)
    t = np.arange(n) / SR
    noise = np.random.rand(n) * 2 - 1
    # High pass filter
    sos = signal.butter(4, 7000, 'hp', fs=SR, output='sos')
    filtered = signal.sosfilt(sos, noise)
    decay_rate = 0.06 if open_hh else 0.015
    e = np.exp(-t / decay_rate)
    return filtered * e * 0.35

def synth_snare():
    d = 0.22
    n = int(SR * d)
    t = np.arange(n) / SR
    # Tone body
    tone = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.04)
    # Noise snap
    noise = (np.random.rand(n) * 2 - 1) * np.exp(-t / 0.07)
    sos = signal.butter(2, [1000, 8000], 'bp', fs=SR, output='sos')
    noise = signal.sosfilt(sos, noise)
    return (tone * 0.5 + noise * 0.6) * 0.5

def synth_bass(freq, d):
    n = int(SR * d)
    t = np.arange(n) / SR
    # Sub sine + slight saw harmonic
    saw = signal.sawtooth(2 * np.pi * freq * t)
    sine = np.sin(2 * np.pi * freq * t)
    # Lowpass
    sos = signal.butter(2, min(freq * 4, 800), 'lp', fs=SR, output='sos')
    filt_saw = signal.sosfilt(sos, saw)
    e = env(n, 0.01, 0.08, 0.65, 0.04)
    return (sine * 0.7 + filt_saw * 0.3) * e * 0.5

def synth_synth_chord(freqs, d):
    n = int(SR * d)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f in freqs:
        y += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    sos = signal.butter(2, 2200, 'lp', fs=SR, output='sos')
    y = signal.sosfilt(sos, y)
    e = env(n, 0.02, 0.15, 0.4, 0.08)
    return (y / len(freqs)) * e * 0.3

# SFX functions
def sfx_spray():
    d = 0.3
    n = int(SR * d)
    t = np.arange(n) / SR
    noise = np.random.rand(n) * 2 - 1
    sos = signal.butter(4, [2500, 9000], 'bp', fs=SR, output='sos')
    filtered = signal.sosfilt(sos, noise)
    e = env(n, 0.02, 0.25, 0.0, 0.02)
    return filtered * e * 0.7

def sfx_whoosh_evaporate():
    d = 2.5
    n = int(SR * d)
    t = np.arange(n) / SR
    # Whistling descent
    f_curve = 800 * np.exp(-t / 1.0) + 120
    phase = 2 * np.pi * np.cumsum(f_curve) / SR
    whistle = np.sin(phase) * 0.4
    noise = (np.random.rand(n) * 2 - 1) * 0.6
    sos = signal.butter(2, [300, 3000], 'bp', fs=SR, output='sos')
    noise = signal.sosfilt(sos, noise)
    e = np.sin(np.pi * (t / d)) ** 2
    return (whistle + noise) * e * 0.5

def sfx_golden_chime():
    d = 3.5
    n = int(SR * d)
    t = np.arange(n) / SR
    freqs = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0] # C6, E6, G6, C7, E7
    y = np.zeros(n)
    for i, f in enumerate(freqs):
        delay = int(i * 0.12 * SR)
        if delay < n:
            sub_t = t[:n - delay]
            decay = 0.8 + i * 0.2
            sine = np.sin(2 * np.pi * f * sub_t) * np.exp(-sub_t / decay)
            y[delay:] += sine * 0.25
    return y * 0.6

def sfx_glass_clink():
    d = 1.2
    n = int(SR * d)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * 2450 * t) * 0.7 + np.sin(2 * np.pi * 5800 * t) * 0.3) * np.exp(-t / 0.18)
    return y * 0.4

def main():
    print("Synthesizing Nightclub Music & SFX bed...")
    music_L = np.zeros(TOTAL_SAMPLES)
    music_R = np.zeros(TOTAL_SAMPLES)
    sfx_L = np.zeros(TOTAL_SAMPLES)
    sfx_R = np.zeros(TOTAL_SAMPLES)

    kick = synth_kick()
    hat_c = synth_hihat(open_hh=False)
    hat_o = synth_hihat(open_hh=True)
    snare = synth_snare()

    # 120 BPM: quarter note = 0.5s, 8th note = 0.25s, 16th = 0.125s
    BPM = 120.0
    beat_dur = 60.0 / BPM
    total_beats = int(DUR / beat_dur)

    # Chords in Hz: Cm, Ab, Eb, Bb
    CHORDS = [
        [261.63, 311.13, 392.00], # Cm
        [207.65, 261.63, 311.13], # Ab
        [155.56, 196.00, 233.08], # Eb
        [233.08, 293.66, 349.23], # Bb
    ]
    BASS_ROOTS = [65.41, 51.91, 77.78, 58.27] # C2, Ab1, Eb2, Bb1

    for b in range(total_beats):
        t_sec = b * beat_dur
        idx = int(t_sec * SR)
        if idx >= TOTAL_SAMPLES:
            break

        bar = (b // 4) % 4
        beat_in_bar = b % 4

        # 4-on-the-floor Kick
        if idx + len(kick) < TOTAL_SAMPLES:
            music_L[idx:idx + len(kick)] += kick * 0.8
            music_R[idx:idx + len(kick)] += kick * 0.8

        # Off-beat open hi-hat
        idx_off = idx + int(0.25 * SR)
        if idx_off + len(hat_o) < TOTAL_SAMPLES:
            music_L[idx_off:idx_off + len(hat_o)] += hat_o * 0.7
            music_R[idx_off:idx_off + len(hat_o)] += hat_o * 0.65

        # Closed hi-hat on 16ths
        for h16 in [0.125, 0.375]:
            idx_16 = idx + int(h16 * SR)
            if idx_16 + len(hat_c) < TOTAL_SAMPLES:
                music_L[idx_16:idx_16 + len(hat_c)] += hat_c * 0.35
                music_R[idx_16:idx_16 + len(hat_c)] += hat_c * 0.4

        # Snare/Clap on 2 and 4
        if beat_in_bar in [1, 3]:
            if idx + len(snare) < TOTAL_SAMPLES:
                music_L[idx:idx + len(snare)] += snare * 0.75
                music_R[idx:idx + len(snare)] += snare * 0.75

        # Groovy Bassline
        b_freq = BASS_ROOTS[bar]
        bass_hit = synth_bass(b_freq, 0.22)
        if idx + len(bass_hit) < TOTAL_SAMPLES:
            music_L[idx:idx + len(bass_hit)] += bass_hit * 0.7
            music_R[idx:idx + len(bass_hit)] += bass_hit * 0.7

        # Syncopated 2nd bass hit
        if beat_in_bar in [0, 2]:
            idx_sync = idx + int(0.375 * SR)
            bass_sync = synth_bass(b_freq * 1.5, 0.16)
            if idx_sync + len(bass_sync) < TOTAL_SAMPLES:
                music_L[idx_sync:idx_sync + len(bass_sync)] += bass_sync * 0.55
                music_R[idx_sync:idx_sync + len(bass_sync)] += bass_sync * 0.55

        # Synth chords
        if beat_in_bar in [0, 2]:
            chord_notes = CHORDS[bar]
            c_hit = synth_synth_chord(chord_notes, 0.35)
            if idx + len(c_hit) < TOTAL_SAMPLES:
                music_L[idx:idx + len(c_hit)] += c_hit * 0.5
                music_R[idx:idx + len(c_hit)] += c_hit * 0.65

    # Insert SFX
    spray = sfx_spray()
    whoosh = sfx_whoosh_evaporate()
    chimes = sfx_golden_chime()
    glass = sfx_glass_clink()

    def add_sfx(sound, t_sec, gain=1.0, pan=0.0):
        idx = int(t_sec * SR)
        end = min(TOTAL_SAMPLES, idx + len(sound))
        part = sound[:end - idx] * gain
        sfx_L[idx:end] += part * (1.0 - max(0.0, pan))
        sfx_R[idx:end] += part * (1.0 + min(0.0, pan))

    # SFX Cues aligned with video script beats:
    add_sfx(spray, 0.9, gain=0.9, pan=-0.2) # Hook spray
    add_sfx(whoosh, 22.5, gain=1.1, pan=-0.3) # Cheap perfume evaporation
    add_sfx(spray, 37.2, gain=0.9, pan=0.2) # Lorakh spray
    add_sfx(chimes, 41.0, gain=1.2, pan=0.3) # Lorakh golden aroma aura
    add_sfx(glass, 56.5, gain=0.8, pan=0.1) # Bar cocktail clink
    add_sfx(chimes, 71.0, gain=1.0, pan=0.0) # Brand finale shimmer

    # Smooth master volume envelope for music (duck under voice slightly)
    # Music baseline level: ~0.18 (-15 dBFS peak), voice is ~0.8
    music_mix = np.stack([music_L, music_R], axis=1) * 0.22
    sfx_mix = np.stack([sfx_L, sfx_R], axis=1) * 0.35

    bed = music_mix + sfx_mix
    wavfile.write("src/videos/lorakh/voice/bed.wav", SR, np.int16(np.clip(bed, -1.0, 1.0) * 32767))
    print("Bed WAV exported successfully!")

if __name__ == "__main__":
    main()

