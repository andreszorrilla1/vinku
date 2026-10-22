import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Award, MessageCircle } from 'lucide-react'
import { Arcos } from '@/componentes/Arcos'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { exigirPerfil } from '@/lib/sesion'
import { Esqueleto } from '@/componentes/Esqueleto'
import { textos } from '@/textos/es'

const t = textos.bienvenida.lista

export const metadata: Metadata = { title: t.texto }

export default function Lista() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-16">
      <Suspense fallback={<Esqueleto />}>
        <Contenido />
      </Suspense>
    </main>
  )
}

async function Contenido() {
  const perfil = await exigirPerfil('/bienvenida/lista')
  return (
    <div className="flex flex-col gap-6">
      <section className="relative isolate animate-aparecer overflow-hidden rounded-hoja bg-hero p-6 text-sobre-hero shadow-tarjeta">
        <Arcos
          monocromo
          className="pointer-events-none absolute -right-8 -bottom-8 -z-10 size-48 text-sobre-hero/[0.08]"
        />
        <h1 className="tipo-titulo-1">{t.titulo(perfil.nombre_mostrar)}</h1>
        <p className="mt-2 tipo-cuerpo-grande">{t.texto}</p>
        {perfil.territorio && <p className="mt-1 tipo-cuerpo opacity-90">{perfil.territorio.nombre}</p>}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3 rounded-hoja border border-borde bg-tarjeta p-4 shadow-tarjeta">
          <p className="tipo-etiqueta text-tinta-suave">{t.nivel}</p>
          <Insignia activa />
          <p className="tipo-titulo-2 text-titulo">{t.nivelNombre}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-hoja border border-borde bg-tarjeta p-4 shadow-tarjeta">
          <p className="tipo-etiqueta text-tinta-suave">{t.insignia}</p>
          <Insignia activa={false} />
          <p className="tipo-etiqueta">{t.insigniaNombre}</p>
          <p className="-mt-2 tipo-pequeno text-tinta-suave">{t.insigniaAyuda}</p>
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-hoja border border-borde bg-tarjeta p-4 shadow-tarjeta">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-proyecto/12 text-proyecto">
          <MessageCircle aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="tipo-etiqueta">{t.comunidad}</h2>
          <p className="tipo-cuerpo text-tinta-suave">{t.comunidadPronto}</p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <BotonEnlace href="/contar">{t.boton}</BotonEnlace>
        <BotonEnlace href="/" variante="borde">
          {t.despues}
        </BotonEnlace>
      </div>
    </div>
  )
}

/** Insignia en líneas: círculo con ícono verde y el punto naranja del logo. Gris si aún no se tiene. */
function Insignia({ activa }: { activa: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex size-16 items-center justify-center rounded-full border-[3px] ${activa ? 'border-verde text-verde' : 'border-dashed border-borde text-tinta-suave'}`}
    >
      <Award className="size-7" />
      <span className={`absolute -top-1 right-0 size-3.5 rounded-full ${activa ? 'bg-naranja' : 'bg-borde'}`} />
    </span>
  )
}
