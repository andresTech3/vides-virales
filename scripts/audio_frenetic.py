"""
Mezclador Audio Dopamínico (-14.1 LUFS, LRA ~2.0 LU) para toon-frenetico.
Incluye groove 128 BPM (kick, snare, hi-hats 16th, bajo + stabs), whooshes, booms,
pops, risers, cha-ching (dinero) y ding (revelación/gag).
Uso:
  python audio_frenetic.py --voice voz.mp3 --cues 0,1.1,2.2 --impacts 3.2,8.5 --chachings 6.1,18.2 --dings 13.8 --out master.wav
  (--sweeten_existing evita volver a poner música de fondo si la pista ya trae base musical)
"""
import argparse, subprocess, os
import numpy as np
import scipy.io.wavfile as wavfile

SR = 44100


def make_kick():
    n = int(0.18 * SR)
    t = np.linspace(0, 0.18, n, endpoint=False)
    f = 155 * np.exp(-t * 28) + 48
    return (np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) * 2.0) * 0.58).astype(np.float32)


def make_snare():
    n = int(0.13 * SR)
    t = np.linspace(0, 0.13, n, endpoint=False)
    tone = np.sin(2 * np.pi * 245 * t) * np.exp(-t * 32)
    noise = np.random.uniform(-1, 1, n) * np.exp(-t * 24)
    return ((0.42 * tone + 0.58 * noise) * 0.36).astype(np.float32)


def make_hihat():
    n = int(0.05 * SR)
    t = np.linspace(0, 0.05, n, endpoint=False)
    noise = np.diff(np.random.uniform(-1, 1, n + 1)) * 0.5
    return (noise * np.exp(-t * 75) * 0.16).astype(np.float32)


def make_whoosh():
    n = int(0.24 * SR)
    t = np.linspace(0, 0.24, n, endpoint=False)
    sw = np.sin(2 * np.pi * np.cumsum(np.linspace(320, 1750, n)) / SR)
    noise = np.convolve(np.random.uniform(-1, 1, n), np.ones(10) / 10, mode="same")
    env = np.sin(np.pi * t / 0.24) ** 1.5
    return ((0.35 * sw + 0.65 * noise) * env * 0.34).astype(np.float32)


def make_boom():
    n = int(0.42 * SR)
    t = np.linspace(0, 0.42, n, endpoint=False)
    f = 175 * np.exp(-t * 12) + 36
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    crackle = np.random.uniform(-1, 1, n) * np.exp(-t * 15)
    return (np.tanh((0.72 * sub + 0.42 * crackle) * 1.7) * 0.52).astype(np.float32)


def make_pop():
    n = int(0.065 * SR)
    t = np.linspace(0, 0.065, n, endpoint=False)
    f = np.linspace(620, 1650, n)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 50) * 0.34).astype(np.float32)


def make_ding():
    n = int(0.32 * SR)
    t = np.linspace(0, 0.32, n, endpoint=False)
    s = np.sin(2 * np.pi * 1568 * t) + 0.5 * np.sin(2 * np.pi * 3136 * t)
    return (s * np.exp(-t * 11) * 0.26).astype(np.float32)


def make_chaching():
    n = int(0.38 * SR)
    t = np.linspace(0, 0.38, n, endpoint=False)
    d1 = np.sin(2 * np.pi * 2093 * t) * np.exp(-t * 16)
    d2 = np.where(t > 0.08, np.sin(2 * np.pi * 2637 * (t - 0.08)) * np.exp(-(t - 0.08) * 11), 0.0)
    return ((d1 * 0.22 + d2 * 0.28)).astype(np.float32)


def add_sig(buf, sec, sig):
    idx = int(sec * SR)
    end = min(idx + len(sig), len(buf))
    if end > idx >= 0:
        buf[idx:end] += sig[: end - idx]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--cues", default="0")
    ap.add_argument("--impacts", default="")
    ap.add_argument("--chachings", default="")
    ap.add_argument("--dings", default="")
    ap.add_argument("--sweeten_existing", action="store_true")
    ap.add_argument("--out", default="master.wav")
    args = ap.parse_args()

    tmp_wav = args.out + ".vtmp.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", args.voice, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", tmp_wav],
        check=True,
    )
    _, v_raw = wavfile.read(tmp_wav)
    os.remove(tmp_wav)

    voice = v_raw.astype(np.float32) / 32768.0
    n = len(voice)
    dur = n / SR

    music = np.zeros(n, dtype=np.float32)
    if not args.sweeten_existing:
        # Groove energético 128 BPM con 16th hi-hats + stabs de bajo
        bpm = 128.0
        beat = 60.0 / bpm
        kick, snare, hh = make_kick(), make_snare(), make_hihat()
        for b in range(int(dur / beat)):
            sec = b * beat
            if b % 2 == 0:
                add_sig(music, sec, kick)
            else:
                add_sig(music, sec, snare * 0.85)
            # Hi-hats en semicorcheas para energía constante
            for sub_i in range(2):
                add_sig(music, sec + sub_i * (beat * 0.5), hh)
            bf = [110.0, 130.8, 146.8, 164.8][(b // 4) % 4]
            bn = int(beat * 0.42 * SR)
            bt = np.linspace(0, beat * 0.42, bn, endpoint=False)
            bass = (np.tanh(np.sin(2 * np.pi * bf * bt) * 1.6) * 0.22 + np.sin(2 * np.pi * bf * 2 * bt) * 0.08) * np.exp(-bt * 7)
            add_sig(music, sec, bass.astype(np.float32))

    sfx = np.zeros(n, dtype=np.float32)
    wh, bm, pp, dg, cc = make_whoosh(), make_boom(), make_pop(), make_ding(), make_chaching()
    for i, s in enumerate(args.cues.split(",")):
        if s.strip():
            sec = float(s)
            add_sig(sfx, sec, wh if i % 2 == 1 and sec > 0.3 else pp)
    for s in args.impacts.split(","):
        if s.strip():
            add_sig(sfx, float(s), bm)
    for s in args.chachings.split(","):
        if s.strip():
            add_sig(sfx, float(s), cc)
    for s in args.dings.split(","):
        if s.strip():
            add_sig(sfx, float(s), dg)

    if args.sweeten_existing:
        mix = voice * 0.90 + sfx * 0.42
    else:
        chunk = int(SR * 0.04)
        nc = n // chunk
        v_abs = np.abs(voice[: nc * chunk]).reshape(nc, chunk).mean(axis=1)
        duck_low = 1.0 - np.clip(np.convolve(v_abs, np.ones(4) / 4.0, mode="same") * 2.5, 0, 0.36)
        duck = np.pad(np.repeat(duck_low, chunk), (0, n - nc * chunk), constant_values=1.0)
        mix = voice * 0.95 + (music * duck) * 0.44 + sfx * 0.56

    pk = np.max(np.abs(mix))
    if pk > 0.95:
        mix *= 0.92 / pk

    raw = args.out + ".raw.wav"
    wavfile.write(raw, SR, mix)
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", "loudnorm=I=-14.1:TP=-1.5:LRA=2.0", args.out],
        check=True,
    )
    os.remove(raw)
    print(f"Frenetic dopaminic master (-14.1 LUFS): {args.out} ({dur:.2f}s)")


if __name__ == "__main__":
    main()
