'use server'

import { revalidatePath } from 'next/cache'
import { esquemaTamanoLetra } from '@/lib/esquemas'
import { crearClienteServidor } from '@/lib/supabase/servidor'

export async function guardarTamanoLetra(tamano: string) {
  const valor = esquemaTamanoLetra.safeParse(tamano)
  if (!valor.success) return { ok: false }
  const supabase = await crearClienteServidor()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return { ok: false }
  const { error } = await supabase.from('perfiles').update({ tamano_letra: valor.data }).eq('id', data.user.id)
  revalidatePath('/perfil')
  return { ok: !error }
}
