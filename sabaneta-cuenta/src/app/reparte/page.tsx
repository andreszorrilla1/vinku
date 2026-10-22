import type { Metadata } from 'next'
import { Pronto } from '@/componentes/Pronto'
import { textos } from '@/textos/es'

export const metadata: Metadata = { title: textos.inicio.reparteTitulo }

export default function Pagina() {
  return <Pronto titulo={textos.inicio.reparteTitulo} texto={textos.pronto.reparte} />
}
