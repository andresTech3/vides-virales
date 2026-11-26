---
description: Regla permanente del proyecto: publicar lotes de vídeos en Buffer con un solo comando (--auto-tunnel --stagger-mins 5) para no gastar tokens esperando entre envíos.
---

# Publicación en Buffer en 1 Solo Comando (0 Tokens de Espera)

Cuando el usuario pida subir o publicar vídeos en **Buffer**:
1. **NO** uses temporizadores ni esperes en turnos separados entre vídeo y vídeo.
2. Ejecuta **un solo comando** con [scripts/publicar_buffer.py](file:///c:/Users/SnyX/Documents/Proyectos/Agencia%20IA/generador-videos-ia/scripts/publicar_buffer.py):
   ```powershell
   .venv\Scripts\python.exe scripts/publicar_buffer.py --auto-tunnel --stagger-mins 5 --slugs <slug1> <slug2> <slug3>
   ```
3. Esto abre el túnel temporal, envía todos los vídeos de golpe con separación de **5 minutos** (`+1m`, `+6m`, `+11m`) para que **Buffer** los publique sin spam (y si YouTube alcanza su límite de 2/día, pasa el 3.º automáticamente a `+24h`), y cierra el túnel al terminar en menos de 1 minuto.

