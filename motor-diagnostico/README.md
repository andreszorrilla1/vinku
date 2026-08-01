# Motor de Autodiagnóstico — SkillPass / UniVenture (VinkU)

Aplicación **independiente de Campus Pass**. Vive en `motor-diagnostico/` dentro del
repo `vinku` pero no comparte código, tablas ni build con el prototipo de Campus Pass
(`/src`, `/supabase` en la raíz del repo).

Stack: **React + TypeScript + Vite**, **Supabase** (PostgreSQL + Auth + RLS) desde el
día uno, deploy en **Vercel**, IA vía **Claude API** (solo desde el servidor).

## Qué hace (esta fase — vertical de punta a punta)

El flujo de la persona, de principio a fin:

1. **Propósito primero** — antes de nada técnico, capturamos qué busca la persona
   (`purpose_macro` / `purpose_subcategory` / `purpose_notes`). Esto condiciona todo.
2. **Sube su hoja de vida** — se extraen habilidades **contra un catálogo cerrado**.
   Cero texto libre generado por IA; lo que no calza va a `unmatched_mentions`.
3. **Confirma sus habilidades** — confirma/descarta, declara nivel, agrega del catálogo
   (autocomplete), y responde un **sondeo conversacional** de soft/power skills.
4. **Resultado** — dónde está hoy, a qué trayectorias puede llegar, a cuántas
   habilidades de distancia, y **por qué le conviene** (conectado a su propósito).
   La ruta queda **esperando revisión humana**: nunca se presenta como definitiva.

## Correr en local

```bash
cd motor-diagnostico
npm install
npm run dev        # http://localhost:5174
```

Sin variables de entorno, la app corre con un **catálogo mock en memoria**
(`src/data/mockCatalog.ts`, espejo del seed SQL) y un **extractor de CV local** que
imita el comportamiento de la IA sin llamar a Claude. Basta para recorrer el flujo.

Con Supabase real, copia `.env.example` → `.env.local` y llena las variables.

## Base de datos (Supabase)

```
supabase/migrations/001_schema.sql   -- todas las tablas (sección 4 del producto)
supabase/migrations/002_rls.sql      -- RLS: bloquea INSERT de IA en `skills` (regla 7.1)
supabase/migrations/003_seed.sql     -- catálogo demo + 15 competencias EntreComp + trayectorias
supabase/tests/rls_skills.test.sql   -- prueba de que anon NO puede insertar en skills
supabase/functions/extraer-cv/       -- Edge Function: proxy seguro a Claude (llave solo en servidor)
```

Aplicar:

```bash
supabase db reset            # corre migraciones + seed
psql "$DATABASE_URL" -f supabase/tests/rls_skills.test.sql   # verifica la regla 7.1
supabase functions deploy extraer-cv
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Reglas de negocio bloqueadas en código

- **7.1** `skills` es de escritura restringida: la RLS (`002_rls.sql`) impide que
  anon/authenticated (el flujo de IA) inserten. Solo panel operativo / ingesta con
  `service_role`. Prueba: `supabase/tests/rls_skills.test.sql`.
- **7.2** Habilidad `autodeclarada` ≠ `validada_skillpass`: estilos distintos en
  `src/lib/marca.ts` (`ESTADO_HABILIDAD`) y `SkillBadge`.
- **7.3** Ninguna `route_recommendation` pasa a `confirmada` sin acción humana
  (sin policy de UPDATE para anon; el paso a la revisión humana es explícito en el flujo).
- **7.4** Copy normativo centralizado en `src/lib/copyNormativo.ts` (`avalNormativo`):
  las trayectorias `objetivo_no_ocupacional` nunca usan lenguaje CUOC/MNC.
- **7.5** `ai_rationale` siempre conecta con el propósito (`src/services/rationale.ts`);
  para emprendimiento nombra las fortalezas de dominio explícitamente.
- **Consistencia de propósito**: validada en aplicación (`src/lib/proposito.ts`),
  no solo en el check de SQL.

## Ingesta DANE (CUOC 2025)

Pipeline para cargar las **680 ocupaciones** oficiales como `pathways` tipo
`rol_cuoc`, **proponer** el catálogo de habilidades (104 conocimientos + 40
destrezas, deduplicados por ID de DANE) con **revisión humana obligatoria** antes
de insertar (regla 7.1), y crear las **26 Áreas de Cualificación** como puente al
marco de cualificaciones. Ver [`scripts/ingesta-dane/README.md`](scripts/ingesta-dane/README.md).

```bash
npm run dane:inspeccionar   # diagnóstico: hojas, columnas, áreas
npm run dane:parsear        # Excel relacional → data/ocupaciones.json + catalogo.json
npm run dane:proponer       # → data/propuesta-skills.csv  (revisar a mano)
npm run dane:generar-sql    # propuesta revisada → migrations/010,011,012_dane_*.sql
```

El **MNC (niveles) y el catálogo sectorial no vienen en este archivo**: la ingesta
deja `mnc_level`/`sectoral_catalog_name` en NULL y no los inventa (regla 7.4).

## Pendiente (fuera del alcance de esta fase)

- **Panel operativo** (equipo VinkU): cola de revisión, `unmatched_mentions`, gestión
  de catálogo y grafo. El modelo de datos ya está listo.
- Parseo real de PDF/Word en la Edge Function (hoy: texto plano o pegado).
- Integración con CampusLife (el modelo deja el gancho: `person_skill_status.evidence_source`).
- Confirmación de las 15 competencias EntreComp contra la guía oficial antes de fijarlas.

## Nota sobre marca

`src/components/ui/Logo.tsx` es un **placeholder**. La sección 9 exige los wordmarks
reales de VinkU; reemplazar por el asset oficial antes de producción.
