'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPinPlus, Radio, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { textos } from '@/textos/es'

const t = textos.navegacion

const botones: { href: string; texto: string; Icono: LucideIcon; activa: (ruta: string) => boolean }[] = [
  { href: '/contar', texto: t.contar, Icono: MapPinPlus, activa: (r) => r.startsWith('/contar') },
  { href: '/en-vivo', texto: t.enVivo, Icono: Radio, activa: (r) => r.startsWith('/en-vivo') },
  {
    href: '/mi-cuadra',
    texto: t.miBarrio,
    Icono: Home,
    activa: (r) => r.startsWith('/mi-cuadra') || r.startsWith('/barrio') || r.startsWith('/cartelera'),
  },
  { href: '/perfil', texto: t.yo, Icono: UserRound, activa: (r) => r.startsWith('/perfil') },
]

/** Pantallas de paso único donde la barra estorba. */
const SIN_BARRA = ['/ingresar', '/bienvenida', '/~offline']

/** Barra inferior fija con los 4 botones del vecino. */
export function BarraInferior() {
  const ruta = usePathname()
  if (SIN_BARRA.some((r) => ruta.startsWith(r))) return null

  return (
    <nav
      aria-label={t.etiqueta}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-tarjeta/95 pb-[env(safe-area-inset-bottom)] shadow-flotante backdrop-blur-md"
    >
      <ul className="mx-auto grid w-full max-w-xl grid-cols-4">
        {botones.map(({ href, texto, Icono, activa }) => {
          const actual = activa(ruta)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? 'page' : undefined}
                className="group relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 text-tinta-suave transition-colors aria-[current=page]:text-titulo"
              >
                {/* El punto naranja del logo marca dónde estás */}
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 size-1.5 rounded-full bg-naranja opacity-0 transition-opacity group-aria-[current=page]:opacity-100"
                />
                <span className="flex h-8 w-14 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-verde/12">
                  <Icono aria-hidden="true" className="size-6" strokeWidth={actual ? 2.4 : 2} />
                </span>
                <span className="tipo-pequeno leading-none font-bold">{texto}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
