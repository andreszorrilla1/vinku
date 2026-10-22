import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { Logo } from '@/componentes/Logo'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { textos } from '@/textos/es'

export const metadata: Metadata = { title: textos.sinConexion.titulo }

export default function SinConexion() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <Logo variante="simbolo" className="h-20 w-20" />
      <WifiOff aria-hidden="true" className="h-12 w-12 text-tinta-suave" strokeWidth={1.75} />
      <h1 className="tipo-titulo-1 text-titulo">{textos.sinConexion.titulo}</h1>
      <p className="tipo-cuerpo-grande">{textos.sinConexion.texto}</p>
      <BotonEnlace href="/">{textos.sinConexion.boton}</BotonEnlace>
    </main>
  )
}
