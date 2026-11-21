# Aprendizaje Basado en Herramientas · VinkU edu

LMS de upskilling y reskilling justo a tiempo para ciencias sociales y humanas.
Cada experiencia de aprendizaje es una **herramienta** que se descarga y se usa en un caso real:
**toolset** (lo que te llevas), **skillset** (lo que aprendes a hacer) y **mindset** (de profesional a emprendedor).
**60 % IA** (Descargar, Cápsulas, Usar) y **40 % humano** (masterclass en vivo semanal y Lanzar con el mundo).

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
- `src/data/herramientas.ts`: catálogo de herramientas (kit, cápsulas, precio, semana) y cómo se arma cada servicio.
- `src/lib/motor.ts`: los cinco momentos, el kit descargable y los prompts de la IA.
- `src/lib/descarga.ts`: descarga del kit (capacidad `downloads` en claude.ai o enlace normal).
- `src/lib/ia.ts`: adaptador de IA (claude.ai `sample` → Supabase `diagnostico-ia` → demo).
- `src/components/`: el puente (medidor 60/40), la vista del encargo y la vista de la masterclass en vivo.
- `supabase/schema.sql`: esquema propuesto para persistir progreso, evidencias y sellos (por adaptar a herramientas).

## Estado
Prototipo: el avance se guarda en el navegador. Siguiente fase: autenticación y persistencia en Supabase,
vista de organización (tablero de evidencias) y agendamiento de Mesas.
