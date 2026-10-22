import { NextResponse, type NextRequest } from 'next/server'

/** Enlace de «Sumar un vecino»: guarda el código de quien invitó y lleva a entrar. */
export async function GET(request: NextRequest, { params }: RouteContext<'/s/[codigo]'>) {
  const { codigo } = await params
  const limpio = codigo
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12)
  const respuesta = NextResponse.redirect(new URL('/ingresar', request.url))
  if (limpio.length >= 4) {
    respuesta.cookies.set('sc-invitacion', limpio, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  }
  return respuesta
}
