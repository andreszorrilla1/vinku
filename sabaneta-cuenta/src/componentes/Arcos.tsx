/** Arcos del logo como decoración de fondo (sin significado: aria-hidden). */
export function Arcos({ className = '', monocromo = false }: { className?: string; monocromo?: boolean }) {
  const acento = monocromo ? 'currentColor' : '#F28C1E'
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M20 156 V135 A11 11 0 0 1 42 135 V156 M64 156 V111 A11 11 0 0 1 86 111 V156 M108 156 V87 A11 11 0 0 1 130 87 V156"
          stroke="currentColor"
          strokeWidth="8"
        />
        <path d="M152 156 V63 A11 11 0 0 1 174 63 V156" stroke={acento} strokeWidth="8" />
        <path d="M16 176 H178" stroke={acento} strokeWidth="4.4" />
      </g>
      <circle cx="163" cy="26" r="6.8" fill={acento} />
    </svg>
  )
}
