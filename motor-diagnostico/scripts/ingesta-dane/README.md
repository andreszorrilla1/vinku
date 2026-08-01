# Ingesta DANE — CUOC 2025 (676 ocupaciones)

Carga las ocupaciones de la **Clasificación Única de Ocupaciones para Colombia
(CUOC 2025)** como `pathways` tipo `rol_cuoc`, y **propone** el catálogo de
habilidades a partir de sus conocimientos y destrezas.

No se escribe ningún rol a mano: todo sale del Excel oficial de perfiles
ocupacionales del DANE (once campos clave por ocupación).

## Principio no negociable (regla 7.1 / sección 6.2)

**El script nunca inserta en `skills` directo.** Propone un catálogo deduplicado,
el equipo VinkU lo **revisa y aprueba**, y solo entonces se genera el SQL de
inserción. La compuerta humana está en el paso 2 → 3.

## Requisitos

```bash
npm install            # instala exceljs + tsx (dev deps)
```

Necesitas el Excel oficial. Descárgalo (requiere acceso a `dane.gov.co`) y
guárdalo en `scripts/ingesta-dane/data/dane-cuoc-2025.xlsx`:

```
https://www.dane.gov.co/files/sen/nomenclatura/cuoc/PerfilesOcupacionales-Excel-CUOC-2025.xlsx
```

## Flujo (4 pasos)

```bash
# 0. (recomendado) Diagnóstico: ¿reconoce las columnas del archivo real?
npm run dane:inspeccionar
#    Imprime hoja, fila de encabezado, mapeo de columnas y 2 ocupaciones de muestra.
#    Si no reconoce columnas, ajusta scripts/ingesta-dane/config.ts (COLUMNAS).

# 1. Parsear el Excel → data/ocupaciones.json (normalizado)
npm run dane:parsear

# 2. Proponer el catálogo de habilidades → data/propuesta-skills.csv
npm run dane:proponer
#    conocimientos → hard | destrezas → soft (con pista de 'power' cuando aplica)

# ── REVISIÓN HUMANA (obligatoria) ──────────────────────────────────────────
#    Abre data/propuesta-skills.csv y edítalo:
#      - APROBAR: pon "no" para descartar una habilidad
#      - skill_type_final: ajusta a hard / soft / power (ej. liderazgo → power)
#      - fusionar_con: escribe el nombre_canonico destino para unir duplicados
#    Guárdalo como: data/propuesta-skills.revisada.csv
# ───────────────────────────────────────────────────────────────────────────

# 3. Generar el SQL (solo desde la propuesta YA revisada)
npm run dane:generar-sql
#    → supabase/migrations/010_dane_skills.sql
#    → supabase/migrations/011_dane_pathways.sql
```

Luego aplica las migraciones (`supabase db reset` o `psql -f`) y **commitea**
los dos SQL generados: son el artefacto aprobado por VinkU.

## Qué hace cada clasificación

| Columna DANE | `skill_type` propuesto | Nota |
|---|---|---|
| Conocimientos | `hard` | Áreas de conocimiento técnico. |
| Destrezas | `soft` | Transversales. El script sugiere `power` para pistas como liderazgo, pensamiento crítico, toma de decisiones — el revisor decide. |

## Detalles

- **676 ocupaciones se cargan todas.** La marca `is_priority_display` (migración
  004) señala cuáles se muestran **primero** en el producto: clúster
  administrativo, TI, ventas y transporte (sección 6.4). No afecta la carga.
- **`employability_rank` queda NULL**: no viene en el Excel. Lo completa VinkU
  manualmente (sección 6.5). El script no inventa el número.
- **`requirement_type`**: el Excel no distingue core/deseable; todos los
  conocimientos/destrezas se cargan como `core`. VinkU puede degradar algunos a
  `deseable` desde el panel operativo.
- **Idempotencia**: los INSERT usan `ON CONFLICT DO NOTHING`, así que conviven
  con el catálogo demo (`003_seed.sql`) y se pueden re-aplicar sin duplicar.
- **`data/` está en `.gitignore`**: el Excel y los intermedios no son código
  fuente. Los SQL generados sí se commitean.

## Si las columnas del archivo real no calzan

El parser detecta encabezados por nombre (tolerante a mayúsculas/tildes) y
busca la fila de encabezado entre las primeras 15. Si falla, imprime los
encabezados que encontró. Añade los nombres reales a `COLUMNAS` en `config.ts`.
