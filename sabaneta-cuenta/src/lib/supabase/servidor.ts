import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { entornoPublico } from '@/lib/entorno'

/** Cliente de Supabase para Server Components, Server Actions y Route Handlers, con la sesión del vecino. */
export async function crearClienteServidor() {
  // Primero marcar la petición como dinámica: Supabase lee cookies y la hora (Date.now) para validar la sesión,
  // y con Cache Components eso no se puede prerenderizar.
  await connection()
  const almacen = await cookies()
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = entornoPublico()

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => almacen.set(name, value, options))
        } catch {
          // Desde un Server Component no se pueden escribir cookies; el proxy refresca la sesión.
        }
      },
    },
  })
}
