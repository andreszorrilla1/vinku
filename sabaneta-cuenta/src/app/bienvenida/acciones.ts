'use server'

import { createHmac } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cuadraH3, puntoEwkt } from '@/lib/cuadra'
import { esquemaConsentimiento, esquemaPerfil } from '@/lib/esquemas'
import { VERSION_POLITICA } from '@/lib/politica'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { textos } from '@/textos/es'

const t = textos.bienvenida

export type EstadoFormulario = { error?: string; campos?: Record<string, string> }

async function usuarioActual() {
  const supabase = await crearClienteServidor()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/ingresar?siguiente=/bienvenida')
  return { supabase, usuario: data.user }
}

/** La IP no se guarda: solo un hash con secreto, para detectar abusos. Sin secreto configurado, no se guarda nada. */
function hashIp(ip: string | null): string | null {
  const secreto = process.env.IP_HASH_SECRETO
  if (!ip || !secreto) return null
  return createHmac('sha256', secreto).update(ip).digest('hex')
}

export async function guardarConsentimiento(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, usuario } = await usuarioActual()
  const resultado = esquemaConsentimiento.safeParse(Object.fromEntries(datos))
  if (!resultado.success) return { error: t.consentimiento.faltaTratamiento }

  const cabeceras = await headers()
  const ip = cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() ?? cabeceras.get('x-real-ip')
  const { error } = await supabase.from('consentimientos').insert({
    perfil_id: usuario.id,
    version_politica: VERSION_POLITICA,
    ...resultado.data,
    ip_hash: hashIp(ip),
    user_agent: cabeceras.get('user-agent')?.slice(0, 400) ?? null,
  })
  if (error) return { error: textos.errores.guardar }
  redirect('/bienvenida')
}

export async function crearPerfil(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, usuario } = await usuarioActual()
  const campos = Object.fromEntries(datos) as Record<string, string>
  const resultado = esquemaPerfil.safeParse(campos)
  if (!resultado.success) {
    return { error: resultado.error.issues[0]?.message ?? t.perfil.errores.guardar, campos }
  }
  const { nombre_mostrar, territorio_id, rango_edad, punto } = resultado.data

  // Quien invitó (enlace /s/CODIGO). Si el código no existe, se ignora.
  const almacen = await cookies()
  const codigo = almacen.get('sc-invitacion')?.value
  let referido_por: string | null = null
  if (codigo) {
    const { data } = await supabase.rpc('id_por_codigo_referido', { codigo })
    referido_por = typeof data === 'string' && data !== usuario.id ? data : null
  }

  const { error } = await supabase.from('perfiles').insert({
    id: usuario.id,
    nombre_mostrar,
    territorio_id,
    rango_edad,
    referido_por,
    punto_cuadra: punto ? puntoEwkt(punto.lat, punto.lng) : null,
    cuadra_h3: punto ? cuadraH3(punto.lat, punto.lng) : null,
  })
  if (error) {
    if (error.hint === 'fuera_de_sabaneta') return { error: t.perfil.fueraDeSabaneta, campos }
    if (error.hint === 'sin_consentimiento') redirect('/bienvenida')
    if (error.code === '23505') redirect('/bienvenida/lista')
    return { error: t.perfil.errores.guardar, campos }
  }
  almacen.delete('sc-invitacion')
  redirect('/bienvenida/lista')
}

export type Ubicacion = { territorio_id: number; nombre: string } | { error: string }

/** «Ubícame»: dice en qué barrio cae el punto, sin guardar nada. */
export async function ubicar(lat: number, lng: number): Promise<Ubicacion> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: t.perfil.sinPermiso }
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.rpc('territorio_en_punto', { lat, lng })
  const fila = Array.isArray(data) ? (data[0] as { id: number; nombre: string } | undefined) : undefined
  if (error || !fila) return { error: t.perfil.fueraDeSabaneta }
  return { territorio_id: fila.id, nombre: fila.nombre }
}
