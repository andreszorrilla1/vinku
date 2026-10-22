import Link from 'next/link'
import { BotonLetra } from '@/componentes/BotonLetra'
import { Logo } from '@/componentes/Logo'

export function Encabezado() {
  return (
    <header className="sticky top-0 z-30 border-b border-borde/70 bg-crema/85 backdrop-blur-md supports-[backdrop-filter]:bg-crema/75">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="-ml-1 flex min-h-tocable items-center rounded-tarjeta px-1">
          <Logo tamano="compacto" />
        </Link>
        <BotonLetra />
      </div>
    </header>
  )
}
