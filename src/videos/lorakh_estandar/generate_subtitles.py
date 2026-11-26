import os
import json
import scipy.io.wavfile as wavfile

PARTS = [
    {
        'id': 'hook',
        'text': '¿Vas a la discoteca y compras cualquier perfume barato? Aunque los frascos se vean parecidos, en la pista la diferencia es brutal.',
        'start_sec': 0.5,
    },
    {
        'id': 'item1',
        'text': 'Número uno: El perfume barato. Puro alcohol diluido. Con el humo y el calor de la pista, se evapora a los veinte minutos y terminas oliendo a nada.',
        'start_sec': 9.0,
    },
    {
        'id': 'item2',
        'text': 'Número dos: Lorakh Midnight Club. Diseñado para dominar la noche. Notas de tabaco dulce, vainilla negra y ron oscuro que cortan el aire a tres metros.',
        'start_sec': 19.5,
    },
    {
        'id': 'item3',
        'text': 'Número tres: Lorakh Royal Gold. El imán de la barra. Ámbar cálido y maderas finas para hablar al oído y dejar tu aroma en su ropa hasta el día siguiente.',
        'start_sec': 30.5,
    },
    {
        'id': 'item4',
        'text': 'Número cuatro: Nocturne Extrait de Parfum. Treinta y cinco por ciento de aceites puros franceses. Cero relleno: catorce horas de presencia imponente.',
        'start_sec': 41.2,
    },
    {
        'id': 'outro',
        'text': 'Ahora ya sabes qué Lorakh elegir según tu noche. Deja las copias baratas y hazte notar.',
        'start_sec': 52.2,
    }
]

subtitles = []
for p in PARTS:
    wav_path = os.path.join('public/lorakh_estandar', f"{p['id']}.wav")
    sr, data = wavfile.read(wav_path)
    dur = len(data) / sr
    words = p['text'].split()
    w_dur = dur / len(words)
    
    for i, w in enumerate(words):
        w_start = p['start_sec'] + i * w_dur
        w_end = w_start + w_dur
        subtitles.append({
            'word': w,
            'start': round(w_start, 3),
            'end': round(w_end, 3),
            'part': p['id']
        })

out_json = 'public/lorakh_estandar/subtitles.json'
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(subtitles, f, ensure_ascii=False, indent=2)

print(f'Wrote {len(subtitles)} subtitle tokens to {out_json}')
