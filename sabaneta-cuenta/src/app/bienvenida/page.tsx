import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { obtenerPerfil, obtenerUsuario, tieneConsentimiento } from '@/lib/sesion'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { Esqueleto } from '@/componentes/Esqueleto'
import { textos } from '@/textos/es'
import { PasoConsentimiento } from './PasoConsentimiento'
import { PasoPerfil } from './PasoPerfil'

export const metadata: Metadata = { title: textos.bienvenida.consentimiento.titulo }

export default function Bienvenida() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-16">
      <Suspense fallback={<Esqueleto />}>
        <Paso />
      </Suspense>
    </main>
  )
}

async function Paso() {
  if (!(await obtenerUsuario())) redirect('/ingresar?siguiente=/bienvenida')
  if (await obtenerPerfil()) redirect('/bienvenida/lista')
  if (!(await tieneConsentimiento())) return <PasoConsentimiento />

  const supabase = await crearClienteServidor()
  const { data } = await supabase.from('territorios').select('id, nombre, tipo').order('nombre')
  return <PasoPerfil territorios={data ?? []} />
}
