import json

with open('src/videos/lorakh/voice/words.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

print(f"Total words: {len(words)}")
print(f"End time: {words[-1]['end']}s (frame {int(words[-1]['end']*30)})")

print("\n--- Key Markers ---")
for i, w in enumerate(words):
    txt = w['content'].lower()
    if any(k in txt for k in ['dos', 'perdona', 'pista', 'mueren', 'primer', 'nada', 'segundo', 'lorakh', 'fondo', 'magnética', 'llevas', 'barato', 'apaga']):
        print(f"{i:3d}: {w['content']:15} [{w['start']:5.2f}s - {w['end']:5.2f}s] frame {int(w['start']*30)}")

