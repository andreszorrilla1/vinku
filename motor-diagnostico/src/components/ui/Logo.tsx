// ============================================================================
// Logo VinkU — recreación en SVG del logo real (escalable y theme-aware).
//
// Diseño de marca: "Vink" en Plus Jakarta Sans extra bold + la "U" en una caja
// AMARILLA con borde oscuro y sombras offset apiladas (estilo sticker/pop-art).
// El punto VIOLETA es el acento del isotipo.
//
// Si prefieres los PNG exactos: déjalos en src/assets/ e impórtalos aquí.
// ============================================================================

import { MARCA } from '@/lib/marca';

// --- Isotipo: la caja "U" con sombras offset y (opcional) punto violeta ---
export function IsotipoU({ size = 40, conPunto = true }: { size?: number; conPunto?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* sombras apiladas (sticker) */}
      <rect x="9" y="11" width="33" height="33" rx="3" fill={MARCA.oscuro} transform="rotate(-5 25 27)" />
      <rect x="7" y="9" width="33" height="33" rx="3" fill={MARCA.amarillo} stroke={MARCA.oscuro} strokeWidth="2.5" transform="rotate(-2 23 25)" />
      {/* caja frontal */}
      <rect x="5" y="5" width="33" height="33" rx="3.5" fill={MARCA.amarillo} stroke={MARCA.oscuro} strokeWidth="3" transform="rotate(3 21 21)" />
      {/* letra U */}
      <path
        d="M14.5 13 L14.5 24 Q14.5 31 21.5 31 Q28.5 31 28.5 24 L28.5 13"
        fill="none"
        stroke={MARCA.oscuro}
        strokeWidth="4.6"
        strokeLinecap="round"
        transform="rotate(3 21 21)"
      />
      {conPunto && <circle cx="36" cy="35" r="4.5" fill={MARCA.violeta} stroke={MARCA.oscuro} strokeWidth="1.5" />}
    </svg>
  );
}

// --- Wordmark completo: "Vink" + isotipo ---
export function Logo({ variante = 'oscuro', size = 26 }: { variante?: 'oscuro' | 'claro'; size?: number }) {
  const colorTexto = variante === 'claro' ? '#FFFFFF' : MARCA.oscuro;
  return (
    <span className="inline-flex items-center gap-2" aria-label="VinkU">
      <span
        className="font-display font-extrabold tracking-tight"
        style={{ color: colorTexto, fontSize: size, lineHeight: 1 }}
      >
        Vink
      </span>
      <IsotipoU size={size * 1.5} conPunto={false} />
    </span>
  );
}
