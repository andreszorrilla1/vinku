# Congreso FPT 2026 — Sitio web

Sitio público del **Congreso de Finanzas Públicas Territoriales 2026** (FPT 2026),
producido por Magna Comunicaciones bajo lineamientos de marca de **GOBS Estrategias
Públicas**. Concepto madre: *"El territorio cobra valor"*.

## Restricción técnica

**Sitio estático puro** (HTML / CSS / JS plano o React compilado a estático). Sin base
de datos ni servidor que administrar. Única excepción de backend: el muro de firmantes
del manifiesto, vía Google Apps Script. Cero fricción de acceso: sin login, sin muros.

## Estructura

```
fpt-2026/
├─ data/
│  ├─ paneles.json     ← fuente única de datos (13 paneles). Ver data/README.md
│  └─ README.md        ← contrato del esquema
├─ assets/
│  ├─ pdf/             ← relatorías y hojas de ruta (enlace directo)
│  └─ images/          ← imágenes optimizadas a .webp
└─ src/                ← código del sitio (pendiente)
```

## Estado de construcción

- [x] **1. Esquema JSON + andamiaje** — `data/paneles.json` con los 13 paneles y su estado real
- [ ] 2. Sistema de diseño (tokens de marca GOBS)
- [ ] 3. Home / landing
- [ ] 4. Hoja de ruta (camino con pines) — *prioridad 1*
- [ ] 5. Relatoría visual (4 tarjetas) + logo GOBS
- [ ] 6. Buscador + grid de 13 paneles
- [ ] 7. Manifiesto + backend Apps Script
- [ ] 8. Galería y relatoría audiovisual

## Pendiente de insumos

Los archivos de referencia del brief (3 `.jsx` aprobados, relatorías en `/fuentes`,
manual de marca GOBS, `.gs` del backend) aún no están en el proyecto. El contenido real
se ingiere cuando lleguen; mientras tanto, todo campo `‹placeholder›` está marcado como tal.
