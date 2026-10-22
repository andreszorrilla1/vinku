'use server'

import { redirect } from 'next/navigation'
import { esquemaCanal, esquemaCelular, esquemaCodigo, esquemaSiguiente } from '@/lib/esquemas'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { textos } from '@/textos/es'

const t = textos.ingresar

export type EstadoIngreso =
  | { paso: 'celular'; error?: string; celular?: string }
  | { paso: 'codigo'; celular: string; canal: 'whatsapp' | 'sms'; enviadoEn: number; error?: string }

/** Paso 1: pide el código por WhatsApp (o SMS). */
export async function enviarCodigo(_previo: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const celular = esquemaCelular.safeParse(datos.get('celular') ?? '')
  const canal = esquemaCanal.parse(datos.get('canal'))
  if (!celular.success) {
    return { paso: 'celular', error: t.errores.celular, celular: String(datos.get('celular') ?? '') }
  }

  const supabase = await crearClienteServidor()
  const { error } = await supabase.auth.signInWithOtp({ phone: celular.data, options: { channel: canal } })
  if (error) {
    const muyRapido = error.status === 429 || /seconds|rate/i.test(error.message)
    return { paso: 'celular', error: muyRapido ? t.errores.muyRapido : t.errores.envio, celular: celular.data }
  }
  return { paso: 'codigo', celular: celular.data, canal, enviadoEn: Date.now() }
}

/** Paso 2: revisa el código y lleva al vecino a donde sigue. */
export async function verificarCodigo(previo: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  if (previo.paso !== 'codigo') return previo
  const codigo = esquemaCodigo.safeParse(datos.get('codigo') ?? '')
  if (!codigo.success) return { ...previo, error: t.errores.codigo }

  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.auth.verifyOtp({ phone: previo.celular, token: codigo.data, type: 'sms' })
  if (error || !data.user) return { ...previo, error: t.errores.codigoMalo }

  const { data: perfil } = await supabase.from('perfiles').select('id').eq('id', data.user.id).maybeSingle()
  const siguiente = esquemaSiguiente.parse(datos.get('siguiente') ?? '')
  redirect(perfil ? siguiente || '/perfil' : '/bienvenida')
}

/** Cerrar sesión. */
export async function salir() {
  const supabase = await crearClienteServidor()
  await supabase.auth.signOut()
  redirect('/')
}
