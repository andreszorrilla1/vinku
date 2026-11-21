# Aula Invertida · VinkU edu

LMS de upskilling y reskilling justo a tiempo para ciencias sociales y humanas.
No hay cursos: cada persona trae un **encargo** real y sale con un entregable real.
**60 % IA** (Leer, Interpretar, Crear) y **40 % humano** (Mesa con consultor VinkU y Probar con el mundo).

Modelo completo: [`docs/MODELO.md`](docs/MODELO.md).

Aplicación independiente dentro del repo `vinku` (como `motor-diagnostico/`). Reutiliza el stack
(React + TypeScript + Vite, Supabase, Vercel) y la Edge Function `diagnostico-ia` para la IA.

## Correr
```bash
cd aula-invertida
npm install
npm run dev              # http://localhost:5175 (IA en modo demo si no hay variables)
npm run build            # build normal para Vercel
npm run build:artifact   # un solo index.html para publicarlo como página de claude.ai
```

## Dónde vive cada cosa
- `src/data/encargos.ts`: catálogo de encargos y cómo se arma cada servicio (B2C, empresas, universidades).
- `src/lib/motor.ts`: los cinco momentos y los prompts de la IA.
- `src/lib/ia.ts`: adaptador de IA (claude.ai `sample` → Supabase `diagnostico-ia` → demo).
- `src/components/`: el puente (medidor 60/40), la vista del encargo y la Mesa del consultor.
- `supabase/schema.sql`: esquema propuesto para persistir bitácoras, Mesas, evidencias y sellos.

## Estado
Prototipo: el avance se guarda en el navegador. Siguiente fase: autenticación y persistencia en Supabase,
vista de organización (tablero de evidencias) y agendamiento de Mesas.
