# Decisiones

Decisiones que no estaban en el prompt o que lo ajustan. La más reciente va al final.

## Fase 0

1. **Repositorio compartido.** Sabaneta Cuenta vive en `sabaneta-cuenta/` dentro del repositorio `vinku`, que ya tenía otra app (Campus Pass) desplegada en Vercel. Tiene su propio `package.json`, su propio `supabase/` y un proyecto de Vercel aparte con _Root Directory_ = `sabaneta-cuenta`. Se puede pasar a un repositorio propio después sin perder historial (`git subtree split`). Aprobado por el dueño.
2. **Next.js 16.4 con Cache Components y Turbopack** (lo que trae `create-next-app` hoy). Si Cache Components estorba con la sesión de Supabase en la Fase 1, se apaga y se anota aquí.
3. **PWA con `@serwist/turbopack`** en lugar de `@serwist/next`: `@serwist/next` solo funciona con webpack y Next 16 compila con Turbopack. El service worker (`src/app/sw.ts`) se sirve en `/serwist/sw.js` desde una ruta estática. Solo se registra en producción. Tiene su propio `tsconfig.sw.json` porque usa las librerías de _webworker_.
4. **Tailwind 4 con tokens CSS.** Los colores son variables CSS que cambian con el tema; Tailwind solo las nombra (`@theme inline`). Se borró la paleta por defecto de Tailwind (`--color-*: initial`) para que solo se puedan usar colores de marca.
5. **Tokens extra:** `titulo` (verde profundo en claro, tinta en oscuro: en oscuro `verde-profundo` es casi el fondo) y `sobre-verde` (texto del botón principal: blanco en claro, crema oscuro en oscuro).
6. **Modo oscuro** según el sistema, con `<html data-tema="claro|oscuro">` para fijarlo. **Letra grande** con `<html data-letra="grande">` (112,5 %); todo se mide en `rem`.
7. **`<Logo tema="auto">`** por defecto: sigue el tema de la página. `claro` y `oscuro` lo fijan, como pide el prompt.
8. **Atkinson Hyperlegible Next** sin fuente de respaldo ajustada (`adjustFontFallback: false`): Next no trae sus métricas.
9. **npm** como gestor de paquetes, igual que el resto del repositorio. Node 22.
10. **Prettier** sin punto y coma, comillas simples, 120 columnas.
11. **Supabase local:** Docker funciona, pero en este entorno de nube la imagen de Realtime no se pudo descargar (límite del proxy). La migración se validó contra la imagen oficial `supabase/postgres:17`. En la CI de GitHub (`supabase start`) y en un computador normal funciona completo.
12. **Migraciones con marca de tiempo** (`20261022000000_extensiones.sql`), la convención de Supabase CLI.
13. **Palabras vetadas** con raíces y límites de palabra (`vot(a|o|ar…)`, `gan(a|ador…)`), para no confundir «organizar» o «devoto».
14. **`vercel.json` fija `buildCommand` y `outputDirectory: ".next"`.** El proyecto de Vercel se creó primero como Vite y quedó con la carpeta de salida `dist`; `vercel.json` manda sobre el panel, así que el despliegue no depende de esa configuración. Node fijado en `22.x` para que Vercel no suba de versión mayor solo.
