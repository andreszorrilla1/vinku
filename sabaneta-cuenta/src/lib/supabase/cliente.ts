'use client'

import { createBrowserClient } from '@supabase/ssr'
import { entornoPublico } from '@/lib/entorno'

/** Cliente de Supabase para el navegador. Solo usa la llave pública (anon); RLS protege los datos. */
export function crearClienteNavegador() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = entornoPublico()
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
