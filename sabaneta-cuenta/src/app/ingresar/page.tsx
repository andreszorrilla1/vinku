import type { Metadata } from 'next'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { Pronto } from '@/componentes/Pronto'
import { supabaseConfigurado } from '@/lib/entorno'
import { esquemaSiguiente } from '@/lib/esquemas'
import { Esqueleto } from '@/componentes/Esqueleto'
import { textos } from '@/textos/es'
import { FormularioIngreso } from './FormularioIngreso'

export const metadata: Metadata = { title: textos.ingresar.tituloCelular }

export default function Ingresar({ searchParams }: PageProps<'/ingresar'>) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-16">
      <Suspense fallback={<Esqueleto />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function Contenido({ searchParams }: Pick<PageProps<'/ingresar'>, 'searchParams'>) {
  const parametros = await searchParams
  if (!supabaseConfigurado())
    return <Pronto titulo={textos.ingresar.tituloCelular} texto={textos.ingresar.noDisponible} incrustado />
  const siguiente = esquemaSiguiente.parse(typeof parametros.siguiente === 'string' ? parametros.siguiente : '')
  const invitado = Boolean((await cookies()).get('sc-invitacion')?.value)
  return <FormularioIngreso siguiente={siguiente} invitado={invitado} />
}
