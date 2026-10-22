import type { Metadata } from 'next'
import { Pronto } from '@/componentes/Pronto'
import { textos } from '@/textos/es'

export const metadata: Metadata = { title: textos.navegacion.enVivo }

export default function Pagina() {
  return <Pronto titulo={textos.navegacion.enVivo} texto={textos.pronto.enVivo} />
}
