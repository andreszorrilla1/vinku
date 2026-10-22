import { spawnSync } from 'node:child_process'
import { cacheLife } from 'next/cache'
import { createSerwistRoute } from '@serwist/turbopack'

// Versión de la pantalla sin conexión: cambia con cada commit para refrescar la caché.
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() || crypto.randomUUID()

const serwist = createSerwistRoute({
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  swSrc: 'src/app/sw.ts',
  useNativeEsbuild: true,
})

export const { generateStaticParams, dynamicParams } = serwist

// Con Cache Components, un GET que hace trabajo asíncrono sin caché se vuelve dinámico.
// Envolverlo en 'use cache' garantiza que el service worker se genere una sola vez, al compilar.
async function archivo(path: string) {
  'use cache'
  cacheLife('max')
  const respuesta = await serwist.GET(new Request('http://localhost'), { params: Promise.resolve({ path }) })
  return { cuerpo: await respuesta.text(), tipo: respuesta.headers.get('Content-Type') ?? 'text/plain' }
}

export async function GET(_: Request, { params }: RouteContext<'/serwist/[path]'>) {
  const { path } = await params
  const { cuerpo, tipo } = await archivo(path)
  return new Response(cuerpo, { headers: { 'Content-Type': tipo, 'Service-Worker-Allowed': '/' } })
}
