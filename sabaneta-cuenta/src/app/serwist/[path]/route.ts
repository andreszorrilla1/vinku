import { spawnSync } from 'node:child_process'
import { createSerwistRoute } from '@serwist/turbopack'

// Versión de la pantalla sin conexión: cambia con cada commit para refrescar la caché.
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() || crypto.randomUUID()

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  swSrc: 'src/app/sw.ts',
  useNativeEsbuild: true,
})
