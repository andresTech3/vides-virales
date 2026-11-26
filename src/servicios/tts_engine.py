import asyncio
import json
import sys
import os
import edge_tts

async def run(text_path, output_mp3, output_json, voice="es-ES-AlvaroNeural", rate="+0%", pitch="+0Hz"):
    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read().strip()

    if not voice or "Neural" not in voice:
        voice = "es-ES-AlvaroNeural"

    # edge-tts soporta boundary="WordBoundary" para emitir cada palabra con marca de tiempo precisa
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    submaker = edge_tts.SubMaker()

    os.makedirs(os.path.dirname(os.path.abspath(output_mp3)), exist_ok=True)

    with open(output_mp3, "wb") as fp:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                fp.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)

    cues_data = []
    for c in submaker.cues:
        cues_data.append({
            "start": c.start.total_seconds(),
            "end": c.end.total_seconds(),
            "content": c.content.strip()
        })

    with open(output_json, "w", encoding="utf-8") as fp:
        json.dump(cues_data, fp, ensure_ascii=False, indent=2)

    print(f"OK: Generadas {len(cues_data)} palabras sincronizadas con voz neural {voice}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python tts_engine.py <text_path> <output_mp3> <output_json> [voice] [rate] [pitch]")
        sys.exit(1)
        
    text_path = sys.argv[1]
    output_mp3 = sys.argv[2]
    output_json = sys.argv[3]
    voice = sys.argv[4] if len(sys.argv) > 4 else "es-ES-AlvaroNeural"
    rate = sys.argv[5] if len(sys.argv) > 5 else "+0%"
    pitch = sys.argv[6] if len(sys.argv) > 6 else "+0Hz"
    
    asyncio.run(run(text_path, output_mp3, output_json, voice, rate, pitch))
