# Sabaneta Cuenta

**Cuéntale a Sabaneta. Aquí tu barrio cuenta.**

Plataforma cívica para que los vecinos de Sabaneta cuenten lo que vive su cuadra y construyan juntos el programa de gobierno. Especificación completa en [`docs/PROMPT.md`](docs/PROMPT.md); reglas de trabajo en [`CLAUDE.md`](CLAUDE.md).

## Correr en local

Requisitos: Node 22, Docker (para Supabase local).

```bash
cd sabaneta-cuenta
npm install
cp .env.example .env.local
npm run db:iniciar       # Supabase local con PostGIS; copia URL y anon key a .env.local
npm run dev              # http://localhost:3000
```

## Comandos

| Comando                       | Qué hace                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo                                                                   |
| `npm run build` / `npm start` | Compilar y servir en modo producción                                                     |
| `npm run revisar`             | Lint + tipos + formato + pruebas unitarias                                               |
| `npm run e2e`                 | Pruebas en celular (Playwright, 360×740, claro y oscuro). Requiere `npm run build` antes |
| `npm run iconos`              | Regenera los PNG de la PWA desde `public/marca/icono-app.svg`                            |
| `npm run db:reiniciar`        | Aplica de cero migraciones y `seed.sql`                                                  |
| `npm run db:tipos`            | Genera `src/lib/supabase/tipos.ts` desde la base local                                   |

## Estructura

```
src/app/            rutas (App Router), manifiesto, service worker
src/componentes/    Logo, botones y demás piezas de interfaz
src/textos/es.ts    todos los textos que ve el vecino
src/marca/tokens.ts colores de marca (fuente de verdad)
src/lib/            Supabase, entorno
supabase/           migraciones y semilla
pruebas/unidad      Vitest
pruebas/e2e         Playwright + axe
docs/               prompt, decisiones, base de datos, costos, pendientes legales
```

## Despliegue

Proyecto de Vercel aparte con **Root Directory = `sabaneta-cuenta`**, región `gru1`. Guía completa en la Fase 11 (`docs/DESPLIEGUE.md`).
