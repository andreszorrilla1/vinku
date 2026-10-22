import { Hammer } from 'lucide-react'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { Arcos } from '@/componentes/Arcos'
import { textos } from '@/textos/es'

/** Pantalla amable para lo que todavía se está construyendo. */
export function Pronto({ titulo, texto, incrustado = false }: { titulo: string; texto: string; incrustado?: boolean }) {
  // `incrustado` cuando ya hay un <main> alrededor (no se pueden anidar).
  const Contenedor = incrustado ? 'div' : 'main'
  return (
    <Contenedor
      className={
        incrustado ? 'flex flex-col gap-6' : 'mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-8 pb-32'
      }
    >
      <h1 className="tipo-titulo-1 text-titulo">{titulo}</h1>
      <section className="relative overflow-hidden rounded-hoja border border-borde bg-tarjeta p-6 shadow-tarjeta">
        <Arcos monocromo className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-verde/10" />
        <span className="inline-flex items-center gap-2 rounded-full bg-aviso/12 px-3 py-1 tipo-etiqueta text-tinta">
          <Hammer aria-hidden="true" className="size-4 text-aviso" />
          {textos.pronto.titulo}
        </span>
        <p className="relative mt-4 tipo-cuerpo-grande">{texto}</p>
        <p className="relative mt-2 tipo-cuerpo text-tinta-suave">{textos.pronto.texto}</p>
      </section>
      <BotonEnlace href="/" variante="borde">
        {textos.pronto.volver}
      </BotonEnlace>
    </Contenedor>
  )
}
