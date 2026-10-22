import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { salir } from '@/app/ingresar/acciones'
import { exigirPerfil } from '@/lib/sesion'
import { Esqueleto } from '@/componentes/Esqueleto'
import { textos } from '@/textos/es'
import { BotonCopiar } from './BotonCopiar'
import { SelectorLetra } from './SelectorLetra'

const t = textos.perfil

export const metadata: Metadata = { title: t.titulo }

export default function Perfil() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-6 pb-32">
      <h1 className="tipo-titulo-1 text-titulo">{t.titulo}</h1>
      <Suspense fallback={<Esqueleto />}>
        <Contenido />
      </Suspense>
    </main>
  )
}

async function Contenido() {
  const perfil = await exigirPerfil('/perfil')
  const iniciales = perfil.nombre_mostrar
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <>
      <section className="flex items-center gap-4 rounded-hoja border border-borde bg-tarjeta p-5 shadow-tarjeta">
        <span
          aria-hidden="true"
          className="relative flex size-16 shrink-0 items-center justify-center rounded-full bg-verde font-titulo text-2xl font-black text-sobre-verde"
        >
          {iniciales}
          <span className="absolute -top-0.5 right-0 size-4 rounded-full border-2 border-tarjeta bg-naranja" />
        </span>
        <div className="min-w-0">
          <p className="truncate tipo-titulo-2 text-titulo">{perfil.nombre_mostrar}</p>
          {perfil.territorio && (
            <p className="flex items-center gap-1 tipo-cuerpo text-tinta-suave">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              {perfil.territorio.nombre}
            </p>
          )}
          <p className="mt-1 inline-flex rounded-full bg-verde/12 px-3 py-0.5 tipo-etiqueta text-titulo">
            {t.nivel}: {textos.bienvenida.lista.nivelNombre}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-hoja border border-borde bg-tarjeta p-5 shadow-tarjeta">
        <h2 className="tipo-etiqueta text-tinta-suave">{t.codigo}</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-titulo text-3xl font-black tracking-[0.2em] text-naranja-texto">
            {perfil.codigo_referido}
          </p>
          <BotonCopiar valor={perfil.codigo_referido} etiqueta={t.copiar} hecho={t.copiado} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-hoja border border-borde bg-tarjeta p-5 shadow-tarjeta">
        <h2 className="tipo-etiqueta text-tinta-suave">{t.preferencias}</h2>
        <p className="tipo-cuerpo">{t.letra}</p>
        <SelectorLetra guardado={perfil.tamano_letra} />
      </section>

      <section className="flex items-start gap-4 rounded-hoja border border-borde bg-tarjeta p-5 shadow-tarjeta">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-verde/12 text-titulo">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="tipo-etiqueta">{t.misDatos}</h2>
          <p className="tipo-cuerpo text-tinta-suave">{t.misDatosPronto}</p>
        </div>
      </section>

      <form action={salir}>
        <button
          type="submit"
          className="inline-flex min-h-tocable w-full items-center justify-center gap-2 rounded-tarjeta border-2 border-borde tipo-etiqueta text-lg text-error active:scale-[0.98]"
        >
          <LogOut aria-hidden="true" className="size-5" />
          {t.salir}
        </button>
      </form>
    </>
  )
}
