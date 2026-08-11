# Esquema de datos — Congreso FPT 2026

**Fuente → JSON → sitio estático.** Un solo objeto por panel (`paneles[]`) alimenta
TODOS los componentes del sitio. No hay un formato distinto por componente.

Archivo único: [`paneles.json`](./paneles.json).

## Regla de oro

**No se inventa contenido.** Todo campo cuyo valor empiece con `‹placeholder`
—o esté vacío `""` / `[]` / `null`— aún no tiene contenido real ingerido. Se
reemplaza cuando llegue la relatoría final o la ficha Excel del panel.

## Campos por panel

| Campo | Ficha (§) | Tipo | Notas |
|---|---|---|---|
| `id` | — | string | slug estable, p. ej. `panel-magistral`, `panel-7` |
| `numero` | — | string\|int | `"M"` para el magistral; 2–13 para el resto |
| `titulo`, `subtitulo` | — | string | |
| `tipo` | §5 | `"nacional"` \| `"territorial"` \| `null` | **filtro del buscador** |
| `ejeTematico` | §5 | string \| `null` | **provisional** — ver `meta.ejesTematicos` |
| `estado` | §7 | `"final"` \| `"transcripcion"` \| `"pendiente"` | estado real del producto |
| `ingestado` | — | bool | `true` solo cuando el texto real ya está cargado |
| `confianza` | §7 | `"alto"` \| `"medio"` \| `"bajo"` | trazabilidad |
| `anclajePolitico` | §1 | string | |
| `captura` | §2 | objeto | las 4 tarjetas: `problema`, `reto`, `solucion`, `sinergia` |
| &nbsp;&nbsp;`.<tarjeta>.sintesis` | §2 | string | |
| &nbsp;&nbsp;`.<tarjeta>.cita` | §2 | `{ texto, autor, rol }` | |
| `lecturaEstrategica` | §3 | string | |
| `sintesisEnCaliente` | §4 | string | el mensaje de una frase |
| `codificacion` | §5 | objeto | `temas[]`, `territorios[]`, `actores[]` |
| &nbsp;&nbsp;`.actores[]` | §5 | `{ nombre, rol, entidad }` | |
| `comunicaciones` | §6 | objeto | `fraseClave`, `hashtags[]`, `acciones[]` |
| `recursos` | — | objeto | `pdfRelatoria`, `pdfHojaRuta`, `videoEmbed`, `galeria[]` |
| &nbsp;&nbsp;`.videoEmbed` | — | `{ plataforma, id }` \| `null` | Vimeo (pref.) o YouTube no listado; nunca se aloja el video |

## Qué campos consume cada componente

- **Relatoría visual** (4 tarjetas): `captura.*` + `sintesisEnCaliente` + citas + `recursos.pdfRelatoria`
- **Hoja de ruta** (pin emergente): `captura.problema`, cita destacada, `comunicaciones.acciones`, `codificacion.actores`, `recursos.pdfHojaRuta`
- **Buscador / grid**: `titulo`, `tipo`, `ejeTematico`, `captura.problema.sintesis`, `estado`

## Advertencias del brief incorporadas

- **Ejes temáticos**: viven en `meta.ejesTematicos` como *dato* (no hardcodeados). Son
  una agrupación provisional hecha con solo 6 paneles; no darlos por definitivos.
- **Año**: siempre `2026` en cualquier texto.
- **Estado real del contenido**: finales → Magistral, 2, 3, 7, 8. Con transcripción/ficha
  → 4, 5, 6, 9, 10, 11, 12. Pendiente → 13 (cierre).
