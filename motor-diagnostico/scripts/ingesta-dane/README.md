# Ingesta DANE — CUOC 2025 (680 ocupaciones)

Carga las ocupaciones de la **Clasificación Única de Ocupaciones para Colombia
(CUOC 2025)** y arma, para cada una, el modelo de VinkU.

## Modelo (importante — leer antes de correr)

El CUOC distingue tres cosas que NO son lo mismo:

| Componente CUOC | Qué es para VinkU | Dónde queda |
|---|---|---|
| **Conocimientos** (104) | **Dominios / categorías macro** — no son habilidades. Son pocas y se repiten en cientos de ocupaciones. | `knowledge_areas` (migración 006) + enlace por ocupación |
| **Funciones** (7.319) | La fuente de las **habilidades DURAS**. Cada función se **deriva** en 1–3 skills atómicas y compartibles. | `skills` (hard) + `pathway_skill_requirements` |
| **Destrezas** (40) | Las **habilidades BLANDAS** (soft). Vocabulario controlado de DANE. | `skills` (soft) + `pathway_skill_requirements` |

Las 5 reglas de derivación **función → skills duras**:
1. Una función → 1 a 3 skills atómicas cortas (verbo + objeto).
2. Se quitan los calificativos ("de acuerdo con…", "según…").
3. Se descarta el ruido (ej. "Desempeñar funciones afines" — aparece en las 680).
4. Lo que en realidad es blando (coordinar/liderar personal) NO se vuelve dura.
5. Nombres canónicos y reutilizables entre ocupaciones (piezas Lego).

## Dos motores de derivación

- **IA (Claude API)** — calidad. Requiere `ANTHROPIC_API_KEY` (lado servidor).
  Produce skills atómicas y compartidas. Es el camino recomendado.
- **Heurístico** — sin key; borrador crudo (≈1 skill/función, poco compartida).
  Sirve para arrancar y probar la estructura; VinkU/IA lo pulen después.

## Flujo (5 pasos)

```bash
npm install            # exceljs + tsx
# Excel oficial en: scripts/ingesta-dane/data/dane-cuoc-2025.xlsx

npm run dane:inspeccionar   # diagnóstico: hojas, columnas, áreas
npm run dane:parsear        # Excel relacional → ocupaciones.json + catalogo.json

# Derivar habilidades duras desde las funciones:
export ANTHROPIC_API_KEY=sk-ant-...   # para calidad IA (opcional)
npm run dane:derivar                  # IA si hay key; si no, heurístico
#   variantes: -- --heuristico  (forzar sin IA) | -- --limit 20 (prueba)

npm run dane:proponer       # → data/propuesta-skills.csv   ← REVISIÓN HUMANA

# ── REVISIÓN HUMANA (obligatoria, regla 7.1) ───────────────────────────────
#   Revisa sobre todo las DURAS (son generadas): fusiona duplicados, descarta
#   ruido, ajusta skill_type_final. Guarda como propuesta-skills.revisada.csv
# ───────────────────────────────────────────────────────────────────────────

npm run dane:generar-sql    # solo desde la propuesta revisada:
#   → 010_dane_skills.sql            (duras derivadas + blandas/destrezas)
#   → 011_dane_pathways.sql          (680 pathways + perfil completo + requisitos)
#   → 012_dane_cualificaciones.sql   (26 áreas de cualificación)
#   → 013_dane_knowledge_areas.sql   (104 dominios de conocimiento + enlaces)

npm run dane:perfil -- 25120   # ver un perfil ensamblado (verificación)
```

Aplica con `supabase db reset` y **commitea** las 4 migraciones generadas: son el
artefacto aprobado por VinkU. Requieren las migraciones **004, 005 y 006**.

## Se capturan las 11 hojas (nada se excluye)

El Excel es un libro relacional (encabezado en la fila 2). El perfil completo de
cada ocupación se guarda como JSONB en `pathways.cuoc_profile` (migración 005):
jerarquía (gran grupo → subgrupo ppal → subgrupo → grupo primario), descripción,
funciones, denominaciones, conocimientos, destrezas, ocupaciones afines, áreas de
cualificación principal y complementaria, y equivalencias CIUO-08 / CNO.

## Límites honestos

- **`employability_rank` = NULL**: no viene en el Excel; lo completa VinkU (6.5).
- **`requirement_type` = `core`** (el Excel no distingue core/deseable).
- **MNC y catálogo sectorial**: NO están en este archivo. Se crean las Áreas de
  Cualificación de la CUOC como puente, pero `mnc_level` /
  `sectoral_catalog_name` quedan NULL y `has_sectoral_qualification=false` hasta
  ingresar esas fuentes por separado (regla 7.4).
- **`data/` está en `.gitignore`**: el Excel y los intermedios no son código
  fuente; las migraciones generadas sí se commitean.

## Si el archivo cambia de estructura

Cada hoja se ubica por palabra clave en su nombre y cada columna por candidatos
de encabezado (`config.ts` → `HOJAS`). Si algo no calza, el parser falla en voz
alta mostrando las hojas/encabezados encontrados.
