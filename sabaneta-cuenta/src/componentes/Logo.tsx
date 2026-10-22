import type { CSSProperties } from 'react'

type Props = {
  variante?: 'horizontal' | 'simbolo'
  /** `auto` sigue el tema de la página; `claro` u `oscuro` lo fijan. */
  tema?: 'claro' | 'oscuro' | 'auto'
  /** `compacto` para barras de navegación. */
  tamano?: 'normal' | 'compacto'
  className?: string
}

const coloresFijos: Record<'claro' | 'oscuro', CSSProperties> = {
  claro: {
    '--logo-arcos': '#14532D',
    '--logo-sabaneta': '#14532D',
    '--logo-cuenta': '#B45309',
  } as CSSProperties,
  oscuro: {
    '--logo-arcos': '#FBF6EC',
    '--logo-sabaneta': '#FBF6EC',
    '--logo-cuenta': '#F28C1E',
  } as CSSProperties,
}

/** Cuatro arcos que suben como una cuenta, el último naranja con su «+1» y la raya de la suma. */
function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M20 156 V135 A11 11 0 0 1 42 135 V156 M64 156 V111 A11 11 0 0 1 86 111 V156 M108 156 V87 A11 11 0 0 1 130 87 V156"
          stroke="var(--logo-arcos)"
          strokeWidth="8"
        />
        <path d="M152 156 V63 A11 11 0 0 1 174 63 V156" stroke="#F28C1E" strokeWidth="8" />
        <path d="M16 176 H178" stroke="#F28C1E" strokeWidth="4.4" />
      </g>
      <circle cx="163" cy="26" r="6.8" fill="#F28C1E" />
    </svg>
  )
}

export function Logo({ variante = 'horizontal', tema = 'auto', tamano = 'normal', className = '' }: Props) {
  const estilo = tema === 'auto' ? undefined : coloresFijos[tema]

  if (variante === 'simbolo') {
    return (
      <span role="img" aria-label="Sabaneta Cuenta" style={estilo} className={`inline-block ${className}`}>
        <Simbolo className="h-full w-full" />
      </span>
    )
  }

  return (
    <span
      role="img"
      aria-label="Sabaneta Cuenta"
      style={estilo}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <Simbolo className={`shrink-0 ${tamano === 'compacto' ? 'size-11' : 'size-14'}`} />
      <span
        className={`flex flex-col font-titulo font-bold ${tamano === 'compacto' ? 'text-[1.375rem] leading-[1.375rem]' : 'text-[1.625rem] leading-[1.625rem]'}`}
        aria-hidden="true"
      >
        <span style={{ color: 'var(--logo-sabaneta)' }}>Sabaneta</span>
        <span style={{ color: 'var(--logo-cuenta)' }}>Cuenta</span>
      </span>
    </span>
  )
}
