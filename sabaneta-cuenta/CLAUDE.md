# Sabaneta Cuenta — reglas para Claude

@AGENTS.md

Prompt completo: `docs/PROMPT.md`. Decisiones tomadas: `docs/DECISIONES.md`. Este archivo es el resumen que se aplica siempre.

## Reglas de oro (no negociables)

- **Nunca se pide el voto.** Ni en pantallas, textos, notificaciones ni mensajes.
- **No hay premios.** Solo puntos, insignias y niveles. Palabras vetadas en la interfaz: vota/voto/votar, premio, gana/ganador, sorteo, rifa, regalo. `src/textos/prohibidas.ts` las detecta; las pruebas unitarias y e2e fallan si aparecen.
- **Único reconocimiento:** contenido de Juan Carlos Jaramillo Jara **grabado por él**. Nunca voz, cara ni imagen generadas con IA.
- **Nunca** mostrar la distribución real del presupuesto municipal.
- **Ley 1581:** consentimiento explícito antes de guardar datos personales; mínimo dato; nada de cédula, dirección exacta ni correo.
- **Nunca inventar datos reales** de Sabaneta. Datos de prueba marcados `[DEMO]`.

## Lenguaje de la interfaz

- Español de Colombia, de **tú**, frases de menos de 15 palabras, una idea por pantalla.
- Todo texto visible vive en `src/textos/es.ts`. No escribir textos sueltos en componentes.
- Botones que dicen lo que pasa («Contar algo de mi cuadra», no «Enviar»).
- Usar el sistema verbal del prompt (sección 3): «una cuenta», «Me suma», «Reparte los 100», «Cuentas en vivo», etc.

## Diseño

- Colores solo por token (`bg-crema`, `text-tinta`, `text-titulo`, `bg-verde text-sobre-verde`…). Fuente de verdad: `src/marca/tokens.ts`, repetida en `src/app/globals.css` (una prueba verifica que coincidan y el contraste AA).
- `naranja` nunca como color de texto: para texto usar `naranja-texto`.
- Tipografía con utilidades `tipo-display`, `tipo-titulo-1`, `tipo-titulo-2`, `tipo-cifra`, `tipo-cuerpo-grande`, `tipo-cuerpo`, `tipo-etiqueta`, `tipo-pequeno`. Nada por debajo de 16 px.
- Todo lo tocable: `min-h-tocable` (56 px). Radios: `rounded-campo` 8, `rounded-tarjeta` 16, `rounded-hoja` 24.
- Mobile first a 360 px. Íconos Lucide. Marcadores del mapa con ícono **y** palabra.

## Código

- Next.js 16 (App Router, Cache Components, Turbopack). **Leer `node_modules/next/dist/docs/` antes de usar APIs de Next**: cambian respecto a versiones anteriores.
- TypeScript estricto (`noUncheckedIndexedAccess`). Zod en toda entrada, en cliente y servidor.
- Tablas y columnas en español sin tildes ni ñ (`aportes`, `cuadra_h3`, `tamano_letra`). Código y comentarios en español.
- Supabase: `src/lib/supabase/servidor.ts` (sesión del vecino) y `cliente.ts` (navegador, solo llave anon). La llave de servicio y la de Anthropic **solo** en el servidor, nunca con `NEXT_PUBLIC_`.
- RLS en **todas** las tablas, con pruebas por rol. Puntos e insignias solo desde la base (triggers o `security definer` con `search_path` fijo).
- Migraciones en `supabase/migrations/AAAAMMDDHHMMSS_nombre.sql`. Nunca editar una migración ya publicada.
- Estilo: Prettier (sin punto y coma, comillas simples, 120 columnas).

## Antes de cada commit

```bash
npm run revisar     # lint + tipos + formato + pruebas unitarias
npm run build && npm run e2e
```

Si una decisión no está en el prompt: la opción más simple, segura y barata, anotada en `docs/DECISIONES.md`.
