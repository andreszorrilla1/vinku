import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'

export type Perfil = {
  id: string
  nombre_mostrar: string
  territorio_id: number
  rango_edad: string | null
  codigo_referido: string
  rol: 'vecino' | 'moderador' | 'coordinador' | 'analista' | 'admin'
  tamano_letra: 'normal' | 'grande'
  territorio: { nombre: string; slug: string; tipo: 'barrio' | 'vereda' } | null
}

/** Usuario de la sesión (verificado contra el servidor de Auth) o null. Una sola consulta por petición. */
export const obtenerUsuario = cache(async () => {
  const supabase = await crearClienteServidor()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
})

/** Perfil del vecino de la sesión o null si aún no lo ha creado. */
export const obtenerPerfil = cache(async (): Promise<Perfil | null> => {
  const usuario = await obtenerUsuario()
  if (!usuario) return null
  const supabase = await crearClienteServidor()
  const { data } = await supabase
    .from('perfiles')
    .select(
      'id, nombre_mostrar, territorio_id, rango_edad, codigo_referido, rol, tamano_letra, territorio:territorios(nombre, slug, tipo)',
    )
    .eq('id', usuario.id)
    .maybeSingle()
  return (data as Perfil | null) ?? null
})

/** ¿Ya aceptó el tratamiento de datos? */
export const tieneConsentimiento = cache(async (): Promise<boolean> => {
  const usuario = await obtenerUsuario()
  if (!usuario) return false
  const supabase = await crearClienteServidor()
  const { count } = await supabase
    .from('consentimientos')
    .select('id', { count: 'exact', head: true })
    .eq('perfil_id', usuario.id)
  return (count ?? 0) > 0
})

/** Para páginas que necesitan un vecino con perfil completo. */
export async function exigirPerfil(siguiente: string): Promise<Perfil> {
  const usuario = await obtenerUsuario()
  if (!usuario) redirect(`/ingresar?siguiente=${encodeURIComponent(siguiente)}`)
  const perfil = await obtenerPerfil()
  if (!perfil) redirect('/bienvenida')
  return perfil
}
