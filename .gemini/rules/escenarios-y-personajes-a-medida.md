---
description: Regla permanente del proyecto: cada vídeo debe construir escenarios, interiores, props 3D y personajes 100% adaptados a su temática (nunca planos ni habitaciones genéricas).
---

# Escenarios, Interiores y Personajes 100% a Medida + Literalismo Visual

En **todo** vídeo futuro (`toon-frenetico` o cualquier composición):
1. **Literalismo visual explícito (22–32 micro-planos por ~45s):**
   - Cada cláusula o dato físico importante debe tener su **propio plano visual explícito** (`0.9–1.8 s`).
   - **Prohibido** tapar una acción con carteles vagos (`IMPACTO!`, `BONK!`, `DAÑO!`). Si el guion dice *"golpe a tus rodillas y tu espalda"*, muestra `xray_knee` partiéndose y `xray_spine` doblándose; si dice *"tirarte boca arriba"*, usa `action: "lying"`; si dice *"saltar"*, usa `action: "jump"`; si choca contra el techo, usa `action: "head_bump"` con techo encima; si cae un edificio, usa `elevator_building`.
   - Amplía `ToonFreneticoEngine.tsx` / `toonCharacters.ts` con nuevos props o poses explícitas siempre que un guion mencione una acción o parte del cuerpo/objeto específico que aún no exista.
2. **Escenarios reales del tema en cada plano:**
   - **Prohibido** usar `horizon: "interior"` sin `wallColor` + `customBlocks` específicos del lugar real (de lo contrario aparece una habitación beige genérica).
   - Usa `horizon` nativo (`elevator_cabin`, `elevator_shaft`, `supermarket_aisle`, `office_cubicles`, `palace_hall`, `neon_alley`, `city_blocks`, `vice_city`, `paris`, `ocean`, `park`) o arma el interior/exterior exacto con `wallColor` + `floorStyle` + `customBlocks`.
3. **Personajes y vestuario propios de la historia:**
   - Define `characters` específicos con `outfit`, `shirt`, `pants`, `hat`, `glasses`, `hair` coherentes con su rol.
4. **Ahorro de tokens sin perder calidad:**
   - Usa siempre `ToonDinamico` + `scripts/generar_toon.py` con JSON compacto en lugar de duplicar `.tsx` completos ni editar `Root.tsx`.

