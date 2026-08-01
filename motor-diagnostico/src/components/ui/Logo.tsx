// ============================================================================
// Wordmark de VinkU.
//
// ⚠️ PLACEHOLDER: la sección 9 exige usar los wordmarks REALES de VinkU (no
// reconstruir el logo como texto plano). Este SVG es un marcador temporal con
// la "U" en violeta de marca. Reemplazar por el asset oficial:
//   - variante tinta oscura sobre fondo claro (portal de la persona)
//   - variante clara sobre fondo oscuro (donde aplique)
// Deja los archivos en src/assets/ y sustituye este componente.
// ============================================================================

import { MARCA } from '@/lib/marca';

export function Logo({ variante = 'oscuro' }: { variante?: 'oscuro' | 'claro' }) {
  const color = variante === 'claro' ? '#FFFFFF' : MARCA.oscuro;
  return (
    <span
      className="font-display inline-flex items-center gap-0.5 text-2xl font-extrabold tracking-tight"
      style={{ color }}
      aria-label="VinkU"
    >
      Vink
      <span style={{ color: MARCA.violeta }}>U</span>
    </span>
  );
}
