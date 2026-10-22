import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Rutas que necesitan sesión iniciada. */
const PRIVADAS = [
  '/contar',
  '/reparte',
  '/mi-cuadra',
  '/cartelera',
  '/sumar',
  '/perfil',
  '/mesa',
  '/bienvenida',
  '/equipo',
]

/**
 * Refresca la sesión de Supabase en cada petición y hace la revisión optimista de acceso.
 * La autorización real se repite en cada página y Server Action (no se confía solo en esto).
 */
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const { pathname, search } = request.nextUrl
  const esPrivada = PRIVADAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))

  // Sin Supabase configurado (despliegue nuevo) nadie tiene sesión: lo privado lleva a /ingresar («Muy pronto»).
  if (!url || !anon) return esPrivada ? NextResponse.redirect(urlIngresar(request, pathname + search)) : respuesta

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value))
        respuesta = NextResponse.next({ request })
        lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options))
      },
    },
  })

  // No poner código entre createServerClient y getClaims: puede cerrar sesiones al azar.
  const { data } = await supabase.auth.getClaims()
  const conSesion = Boolean(data?.claims?.sub)

  if (esPrivada && !conSesion) {
    return copiarCookies(respuesta, NextResponse.redirect(urlIngresar(request, pathname + search)))
  }

  if (pathname === '/ingresar' && conSesion) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/perfil'
    destino.search = ''
    return copiarCookies(respuesta, NextResponse.redirect(destino))
  }

  return respuesta
}

function urlIngresar(request: NextRequest, siguiente: string) {
  const destino = request.nextUrl.clone()
  destino.pathname = '/ingresar'
  destino.search = `?siguiente=${encodeURIComponent(siguiente)}`
  return destino
}

function copiarCookies(desde: NextResponse, hacia: NextResponse) {
  desde.cookies.getAll().forEach((cookie) => hacia.cookies.set(cookie))
  return hacia
}

export const config = {
  matcher: [
    // Todo menos archivos estáticos, íconos, service worker y manifiesto.
    '/((?!_next/static|_next/image|serwist|iconos|marca|icon.svg|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
}
