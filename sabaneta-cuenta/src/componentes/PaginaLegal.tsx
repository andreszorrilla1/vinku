import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { textos } from '@/textos/es'

/** Página de texto legal con aviso de revisión pendiente. */
export function PaginaLegal({
  titulo,
  version,
  aviso = textos.legal.pendiente,
  children,
}: {
  titulo: string
  version: string
  aviso?: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-6 pb-32">
      <p className="flex items-center gap-2 rounded-tarjeta border-2 border-aviso bg-aviso/10 px-4 py-3 tipo-etiqueta text-tinta">
        <TriangleAlert aria-hidden="true" className="size-5 shrink-0 text-aviso" />
        {aviso}
      </p>
      <h1 className="tipo-titulo-1 text-titulo">{titulo}</h1>
      <p className="tipo-pequeno text-tinta-suave">
        {textos.legal.actualizado}: {version}
      </p>
      <div className="flex flex-col gap-4 tipo-cuerpo [&_h2]:mt-4 [&_h2]:tipo-titulo-2 [&_h2]:text-titulo [&_li]:ml-6 [&_li]:list-disc">
        {children}
      </div>
    </main>
  )
}
