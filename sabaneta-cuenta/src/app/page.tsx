import Link from 'next/link'
import {
  ArrowRight,
  ChevronRight,
  Frown,
  Hammer,
  HeartHandshake,
  MapPin,
  MessageCircleReply,
  Radio,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Arcos } from '@/componentes/Arcos'
import { InstalarApp } from '@/componentes/InstalarApp'
import { LeerEnVozAlta } from '@/componentes/LeerEnVozAlta'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { textos } from '@/textos/es'

const t = textos.inicio

const tipos: { clave: keyof typeof t.tipos; Icono: LucideIcon; color: string; fondo: string }[] = [
  { clave: 'dolor', Icono: Frown, color: 'text-dolor', fondo: 'bg-dolor/10' },
  { clave: 'deseo', Icono: Sparkles, color: 'text-deseo', fondo: 'bg-deseo/10' },
  { clave: 'proyecto', Icono: Hammer, color: 'text-proyecto', fondo: 'bg-proyecto/10' },
]

const iconosPasos: LucideIcon[] = [MapPin, HeartHandshake, MessageCircleReply]

export default function Inicio() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4 pt-4 pb-12">
        {/* Portada */}
        <section
          aria-labelledby="titulo-marca"
          className="relative isolate overflow-hidden rounded-hoja bg-hero px-6 pt-8 pb-6 text-sobre-hero shadow-tarjeta"
        >
          <Arcos
            monocromo
            className="pointer-events-none absolute -top-6 -right-12 -z-10 size-56 text-sobre-hero/[0.07]"
          />
          <p className="inline-flex items-center gap-2 rounded-full bg-sobre-hero/10 px-3 py-1 tipo-etiqueta">
            <span aria-hidden="true" className="size-2 rounded-full bg-naranja" />
            {t.sello}
          </p>
          <h1 id="titulo-marca" className="mt-5 tipo-display">
            {textos.marca.fraseCorta} <span className="text-naranja">{textos.marca.fraseSegunda}</span>
          </h1>
          <div className="mt-8 flex flex-col gap-3">
            <BotonEnlace
              href="/contar"
              variante="claro"
              icono={<MapPin aria-hidden="true" className="size-6" />}
              className="justify-between"
            >
              <span className="flex-1 text-left">{t.botonContar}</span>
              <ArrowRight aria-hidden="true" className="size-6" />
            </BotonEnlace>
            <BotonEnlace
              href="/en-vivo"
              variante="contorno-claro"
              icono={<Radio aria-hidden="true" className="size-6" />}
            >
              {t.botonEnVivo}
            </BotonEnlace>
          </div>
        </section>

        <InstalarApp />

        {/* Qué es */}
        <section aria-labelledby="titulo-que-es" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-que-es" className="tipo-titulo-2 text-titulo">
              {t.queEsTitulo}
            </h2>
            <LeerEnVozAlta texto={[t.queEsTitulo, ...t.queEs].join(' ')} />
          </div>
          <ul className="flex flex-col gap-3 tipo-cuerpo-grande">
            {t.queEs.map((frase) => (
              <li key={frase} className="flex gap-3">
                <span aria-hidden="true" className="mt-3 size-2 shrink-0 rounded-full bg-naranja" />
                <span>{frase}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Así funciona */}
        <section aria-labelledby="titulo-pasos" className="flex flex-col gap-4">
          <h2 id="titulo-pasos" className="tipo-titulo-2 text-titulo">
            {t.pasosTitulo}
          </h2>
          <ol className="relative flex flex-col gap-4">
            <span aria-hidden="true" className="absolute top-8 bottom-8 left-7 border-l-2 border-dashed border-borde" />
            {t.pasos.map((paso, i) => {
              const Icono = iconosPasos[i] ?? MapPin
              return (
                <li key={paso.titulo} className="relative flex items-start gap-4">
                  <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-verde text-sobre-verde shadow-tarjeta">
                    <Icono aria-hidden="true" className="size-6" />
                    <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-naranja font-titulo text-base font-black text-[#1C2B22]">
                      {i + 1}
                    </span>
                  </span>
                  <div className="pt-2">
                    <h3 className="tipo-etiqueta text-lg">{paso.titulo}</h3>
                    <p className="tipo-cuerpo text-tinta-suave">{paso.texto}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Tipos de cuenta */}
        <section aria-labelledby="titulo-tipos" className="flex flex-col gap-4">
          <h2 id="titulo-tipos" className="tipo-titulo-2 text-titulo">
            {t.tiposTitulo}
          </h2>
          <ul className="flex flex-col gap-3">
            {tipos.map(({ clave, Icono, color, fondo }) => (
              <li key={clave}>
                <Link
                  href={`/contar?tipo=${clave}`}
                  className="group flex min-h-tocable items-center gap-4 rounded-hoja border border-borde bg-tarjeta p-4 shadow-tarjeta transition active:scale-[0.99]"
                >
                  <span className={`flex size-14 shrink-0 items-center justify-center rounded-full ${fondo}`}>
                    <Icono aria-hidden="true" className={`size-7 ${color}`} strokeWidth={2.2} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="tipo-etiqueta text-lg">{t.tipos[clave].nombre}</span>
                    <span className="tipo-pequeno text-tinta-suave">{t.tipos[clave].ayuda}</span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-6 text-tinta-suave transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Reparte los 100 */}
        <section
          aria-labelledby="titulo-reparte"
          className="relative overflow-hidden rounded-hoja border border-borde bg-tarjeta p-6 shadow-tarjeta"
        >
          <p
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -bottom-8 tipo-cifra text-[8rem] leading-none text-naranja/10"
          >
            100
          </p>
          <h2 id="titulo-reparte" className="relative tipo-titulo-2 text-titulo">
            {t.reparteTitulo}
          </h2>
          <p className="relative mt-2 tipo-cuerpo-grande">{t.reparteTexto}</p>
          <BotonEnlace href="/reparte" variante="secundario" className="relative mt-5">
            {t.reparteBoton}
          </BotonEnlace>
        </section>

        {/* Cierre */}
        <section aria-labelledby="titulo-cierre" className="flex flex-col items-center gap-3 px-2 text-center">
          <h2 id="titulo-cierre" className="tipo-titulo-2 text-titulo">
            {t.cierreTitulo}
          </h2>
          <p className="tipo-cuerpo text-tinta-suave">{t.cierreTexto}</p>
          <BotonEnlace href="/ingresar" className="mt-2">
            {t.cierreBoton}
          </BotonEnlace>
        </section>
      </main>

      <footer className="border-t border-borde pb-24">
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
