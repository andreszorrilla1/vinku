# Puesta en marcha — Motor de Autodiagnóstico VinkU

Guía paso a paso para conectar Supabase, las llaves de API y cargar los datos
del CUOC. Pensada para hacerse desde tu computador.

> **Dos llaves distintas, no las confundas:**
> - **Supabase anon key** → va en el *frontend* (es pública, segura de exponer).
> - **Anthropic API key (Claude)** → NUNCA en el frontend. Vive solo del lado
>   servidor: en las Edge Functions y en tu terminal para el script de derivación.

---

## 1. Crear el proyecto en Supabase

1. Entra a <https://supabase.com> → **New project**.
2. Nombre: `motor-diagnostico-vinku` (o el que quieras). Región: la más cercana
   (ej. East US). Guarda la **contraseña de la base** que te pida.
3. Cuando termine de crear, ve a **Project Settings → API** y copia:
   - **Project URL** → será `VITE_SUPABASE_URL`
   - **anon public** key → será `VITE_SUPABASE_ANON_KEY`

## 2. Aplicar las migraciones (crear las tablas)

**Opción A — SQL Editor (la más simple):**
En el panel de Supabase → **SQL Editor → New query**. Abre y pega, **en orden**,
el contenido de cada archivo de `supabase/migrations/` y dale *Run*:

```
001_schema.sql   002_rls.sql   003_seed.sql
004_pathways_display_priority.sql
005_pathways_cuoc_profile.sql
006_knowledge_areas.sql
```

(Los `010–013_dane_*.sql` se generan y aplican DESPUÉS, en el paso 5.)

**Opción B — Supabase CLI:**
```bash
npm i -g supabase
supabase link --project-ref <tu-project-ref>
supabase db push        # aplica supabase/migrations/ en orden
```

**Verifica la regla de seguridad 7.1** (que la IA no pueda escribir en `skills`):
en el SQL Editor corre el contenido de `supabase/tests/rls_skills.test.sql`.
Debe imprimir "OK: la RLS bloqueó el INSERT".

## 3. Variables de entorno del frontend

En la carpeta `motor-diagnostico/`, copia el ejemplo y llénalo:

```bash
cp .env.example .env.local
```

`.env.local`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_EXTRAER_CV_URL=            # (se llena en el paso 4, opcional)
```

Corre la app:
```bash
npm install
npm run dev        # http://localhost:5174
```

> Sin estas variables la app igual corre, pero con el **catálogo de ejemplo en
> memoria**. Con ellas, lee/escribe en tu Supabase real.

## 4. Edge Function de extracción de CV (Claude, lado servidor)

La llave de Claude vive SOLO aquí, nunca en el navegador.

```bash
# desde motor-diagnostico/
supabase functions deploy extraer-cv
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # tu API key de Anthropic
```

Copia la URL que te da el deploy (algo como
`https://xxxxx.supabase.co/functions/v1/extraer-cv`) y ponla en `.env.local`
como `VITE_EXTRAER_CV_URL`. Si la dejas vacía, la app usa el extractor local
(mock) — útil para probar sin gastar API.

> **¿Dónde saco la Anthropic API key?** En <https://console.anthropic.com> →
> *API Keys → Create key*. Necesitas saldo/plan en esa consola.

## 5. Cargar el CUOC (las 680 ocupaciones) con derivación IA

Coloca el Excel oficial en `scripts/ingesta-dane/data/dane-cuoc-2025.xlsx`.

```bash
export ANTHROPIC_API_KEY=sk-ant-...      # la misma API key, en tu terminal

npm run dane:parsear                     # Excel → ocupaciones.json + catalogo.json
npm run dane:derivar -- --limit 10       # PRUEBA: deriva solo 10 (gasta poco)
#   revisa data/derivacion.json; si te gusta el resultado:
npm run dane:derivar                     # las 680 (con IA)

npm run dane:proponer                    # → data/propuesta-skills.csv
#   ── revisa el CSV (fusiona duplicados, descarta ruido, ajusta tipos) ──
#   guárdalo como data/propuesta-skills.revisada.csv

npm run dane:generar-sql                 # → migrations 010–013_dane_*.sql
```

Aplica esas 4 migraciones nuevas (SQL Editor o `supabase db push`) y
**commitéalas** — son el catálogo aprobado por VinkU.

Para ver un perfil ensamblado y verificar:
```bash
npm run dane:perfil -- 25120
```

## 6. Desplegar en Vercel (cuando quieras publicarlo)

1. <https://vercel.com> → **Add New → Project** → importa el repo.
2. **Root Directory**: `motor-diagnostico`.
3. En **Environment Variables** agrega las mismas `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_EXTRAER_CV_URL`.
4. Deploy. El `vercel.json` ya está configurado.

---

## Resumen de dónde va cada llave

| Llave | Dónde vive | Pública |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` + Vercel | sí |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` + Vercel | sí (protegida por RLS) |
| `ANTHROPIC_API_KEY` (Edge Function) | `supabase secrets set` | **NO** |
| `ANTHROPIC_API_KEY` (derivación DANE) | tu terminal (`export`) | **NO** |

Nunca pongas la Anthropic API key en `.env.local` ni en variables `VITE_*`:
todo lo que empieza por `VITE_` se empaqueta en el navegador y sería visible.
