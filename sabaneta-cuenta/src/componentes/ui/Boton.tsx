import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variante = 'principal' | 'secundario' | 'borde' | 'claro' | 'contorno-claro'

const base =
  'tipo-etiqueta inline-flex min-h-tocable w-full items-center justify-center gap-2 rounded-tarjeta px-6 text-center text-lg transition-[transform,filter,background-color] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60'

const variantes: Record<Variante, string> = {
  // Verde con texto blanco (claro) o crema oscuro (oscuro)
  principal: 'bg-verde text-sobre-verde hover:brightness-110',
  // Naranja de relleno siempre con texto tinta oscura
  secundario: 'bg-naranja text-[#1C2B22] hover:brightness-105',
  borde: 'border-2 border-tinta-suave bg-tarjeta text-tinta hover:bg-crema',
  // Sobre fondos verdes oscuros (hero)
  claro: 'bg-sobre-hero text-[#14532D] shadow-tarjeta hover:brightness-95',
  'contorno-claro': 'border-2 border-sobre-hero/70 text-sobre-hero hover:bg-sobre-hero/10',
}

type PropsComunes = { variante?: Variante; icono?: ReactNode; children: ReactNode; className?: string }

export function Boton({
  variante = 'principal',
  icono,
  children,
  className = '',
  ...resto
}: PropsComunes & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variantes[variante]} ${className}`} {...resto}>
      {icono}
      {children}
    </button>
  )
}

export function BotonEnlace({
  variante = 'principal',
  icono,
  children,
  className = '',
  ...resto
}: PropsComunes & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variantes[variante]} ${className}`} {...resto}>
      {icono}
      {children}
    </Link>
  )
}
