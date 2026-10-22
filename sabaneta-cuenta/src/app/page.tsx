import Link from 'next/link'
import { Frown, Hammer, MapPin, Radio, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/componentes/Logo'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { textos } from '@/textos/es'

const t = textos.inicio

const tipos: { clave: keyof typeof t.tipos; Icono: LucideIcon; color: string }[] = [
  { clave: 'dolor', Icono: Frown, color: 'text-dolor' },
  { clave: 'deseo', Icono: Sparkles, color: 'text-deseo' },
  { clave: 'proyecto', Icono: Hammer, color: 'text-proyecto' },
]

export default function Inicio() {
  return (
    <>
      <header className="mx-auto w-full max-w-xl px-4 pt-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-12 px-4 pt-12 pb-16">
        <section aria-labelledby="titulo-marca" className="flex flex-col gap-8">
          <h1 id="titulo-marca" className="tipo-display text-titulo">
            {textos.marca.fraseCorta} <span className="text-naranja-texto">{textos.marca.fraseSegunda}</span>
          </h1>
          <div className="flex flex-col gap-4">
            <BotonEnlace href="/contar" icono={<MapPin aria-hidden="true" className="h-6 w-6" />}>
              {t.botonContar}
            </BotonEnlace>
            <BotonEnlace href="/en-vivo" variante="borde" icono={<Radio aria-hidden="true" className="h-6 w-6" />}>
              {t.botonEnVivo}
            </BotonEnlace>
          </div>
        </section>

        <section aria-labelledby="titulo-que-es" className="rounded-tarjeta border border-borde bg-tarjeta p-6">
          <h2 id="titulo-que-es" className="tipo-titulo-2 text-titulo">
            {t.queEsTitulo}
          </h2>
          <ul className="mt-4 flex flex-col gap-3 tipo-cuerpo">
            {t.queEs.map((frase) => (
              <li key={frase}>{frase}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-tipos" className="flex flex-col gap-4">
          <h2 id="titulo-tipos" className="tipo-titulo-2 text-titulo">
            {t.tiposTitulo}
          </h2>
          <ul className="flex flex-col gap-3">
            {tipos.map(({ clave, Icono, color }) => (
              <li
                key={clave}
                className="flex min-h-tocable items-center gap-4 rounded-tarjeta border border-borde bg-tarjeta px-4 py-3"
              >
                <Icono aria-hidden="true" className={`h-8 w-8 shrink-0 ${color}`} strokeWidth={2} />
                <span className="flex flex-col">
                  <span className="tipo-etiqueta text-lg">{t.tipos[clave].nombre}</span>
                  <span className="tipo-pequeno text-tinta-suave">{t.tipos[clave].ayuda}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-borde">
        <nav aria-label="Información" className="mx-auto flex w-full max-w-xl flex-col px-4 py-4">
          {[
            { href: '/privacidad', texto: textos.pie.privacidad },
            { href: '/terminos', texto: textos.pie.terminos },
            { href: '/quienes-somos', texto: textos.pie.quienesSomos },
          ].map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              prefetch={false}
              className="flex min-h-tocable items-center tipo-pequeno text-naranja-texto underline underline-offset-4"
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </footer>
    </>
  )
}
