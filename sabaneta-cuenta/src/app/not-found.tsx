import { Logo } from '@/componentes/Logo'
import { BotonEnlace } from '@/componentes/ui/Boton'
import { textos } from '@/textos/es'

export default function NoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <Logo variante="simbolo" className="h-20 w-20" />
      <h1 className="tipo-titulo-1 text-titulo">{textos.noEncontrada.titulo}</h1>
      <p className="tipo-cuerpo-grande">{textos.noEncontrada.texto}</p>
      <BotonEnlace href="/">{textos.noEncontrada.boton}</BotonEnlace>
    </main>
  )
}
