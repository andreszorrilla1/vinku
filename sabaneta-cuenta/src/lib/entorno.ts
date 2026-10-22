import { z } from 'zod'

/** Variables públicas: se pueden leer en el navegador. */
const esquemaPublico = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

/** ¿Está configurado Supabase? (En un despliegue nuevo puede faltar todavía.) */
export function supabaseConfigurado() {
  return esquemaPublico.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success
}

/**
 * Lee y valida las variables públicas de Supabase.
 * Se llama al usar el cliente (no al importar) para que el build no falle sin `.env`.
 */
export function entornoPublico() {
  return esquemaPublico.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
