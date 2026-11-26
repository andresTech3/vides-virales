import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    es = [v for v in voices if v['Locale'].startswith('es-')]
    for v in es[:10]:
        print(f"{v['ShortName']}: {v['Gender']} ({v['FriendlyName']})")

if __name__ == '__main__':
    asyncio.run(main())

