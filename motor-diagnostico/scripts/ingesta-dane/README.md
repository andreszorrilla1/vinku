# Ingesta DANE — CUOC 2025 (680 ocupaciones)

Carga las ocupaciones de la **Clasificación Única de Ocupaciones para Colombia
(CUOC 2025)** como `pathways` tipo `rol_cuoc`, **propone** el catálogo de
habilidades desde sus conocimientos y destrezas, y crea las **Áreas de
Cualificación** como puente al marco de cualificaciones.

## Estructura real del Excel

El archivo oficial es un **libro relacional**: cada uno de los once campos clave
es su propia hoja, en formato largo, unida por *Código de la Ocupación*
(encabezado en la fila 2). Las hojas que usa la ingesta:

| Hoja | Uso |
|---|---|
| `Ocupación` | Maestro: 680 ocupaciones (código de 5 dígitos, nombre, gran grupo). |
| `Nivel Competencia` | Nivel 1–4 por ocupación → `competence_level`. |
| `Área Cual. Principal` | Área de cualificación (SIGLA + nombre) → `sector` + `qualifications`. |
| `Conocimientos` | Habilidades **duras**. Cada fila trae un **ID de DANE**. |
| `Destrezas` | Habilidades **transversales**. Cada fila trae un **ID de DANE**. |
| `Descripción` | Descripción de la ocupación. |

**Clave de deduplicación = el ID de DANE**, no el nombre (los nombres traen
variantes de grafía). El nombre canónico es la variante más frecuente por ID.

## Principio no negociable (regla 7.1 / sección 6.2)

**El script nunca inserta en `skills` directo.** Propone un catálogo, el equipo
VinkU lo **revisa y aprueba**, y solo entonces se genera el SQL de inserción.

## Flujo

```bash
npm install            # exceljs + tsx (dev deps)
# Coloca el Excel oficial en: scripts/ingesta-dane/data/dane-cuoc-2025.xlsx

npm run dane:inspeccionar   # diagnóstico: hojas, columnas, áreas, 1 ocupación
npm run dane:parsear        # → data/ocupaciones.json + data/catalogo.json
npm run dane:proponer       # → data/propuesta-skills.csv   ← REVISIÓN HUMANA

# ── REVISIÓN HUMANA (obligatoria) ──────────────────────────────────────────
#   Edita data/propuesta-skills.csv:
#     - APROBAR=no            → descartar una habilidad
#     - skill_type_final      → hard / soft / power (ej. liderazgo → power)
#     - fusionar_con=<dane_id> → unir dos entradas en una sola habilidad
#   Guárdalo como: data/propuesta-skills.revisada.csv
# ───────────────────────────────────────────────────────────────────────────

npm run dane:generar-sql    # solo desde la propuesta revisada:
#   → supabase/migrations/010_dane_skills.sql
#   → supabase/migrations/011_dane_pathways.sql
#   → supabase/migrations/012_dane_cualificaciones.sql
```

Aplica con `supabase db reset` (o `psql -f`) y **commitea** las migraciones
generadas: son el artefacto aprobado por VinkU.

## Cifras del archivo actual (CUOC 2025)

- **680** ocupaciones · niveles de competencia 1–4
- **104** conocimientos (hard) · **40** destrezas (soft/power) — vocabulario
  controlado por DANE, ya deduplicado por ID
- **26** áreas de cualificación · **~30** ocupaciones marcadas para exhibición
  inicial (admin, TI, ventas, transporte)

## Reglas y límites honestos

- **`employability_rank` = NULL**: no viene en el Excel; lo completa VinkU (6.5).
- **`requirement_type` = `core`** por defecto (el Excel no distingue core/deseable).
- **`is_priority_display`** (migración 004) marca la exhibición inicial; se cargan
  las 680, esto solo cambia el orden.
- **Marco Nacional de Cualificaciones (MNC) y catálogo sectorial**: este archivo
  **no** los contiene. La ingesta crea las Áreas de Cualificación de la CUOC
  (`qualifications.name`/`sector`) como puente, pero deja `mnc_level` y
  `sectoral_catalog_name` en NULL y `has_sectoral_qualification=false`. Rellenarlos
  requiere ingresar esas fuentes por separado — no se inventan (regla 7.4).
- **Idempotencia**: `ON CONFLICT DO NOTHING` / `WHERE NOT EXISTS`; convive con el
  seed demo (`003_seed.sql`) y se puede re-aplicar sin duplicar.
- **`data/` está en `.gitignore`**: el Excel y los intermedios no son código
  fuente; las migraciones generadas sí se commitean.

## Si el archivo cambia de estructura

Cada hoja se ubica por palabra clave en su nombre y cada columna por candidatos
de encabezado (`config.ts` → `HOJAS`). Si algo no calza, el parser falla en voz
alta mostrando las hojas/encabezados encontrados.
