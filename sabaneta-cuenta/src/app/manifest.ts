import type { MetadataRoute } from 'next'
import { textos } from '@/textos/es'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: textos.marca.nombre,
    short_name: textos.marca.nombre,
    description: textos.marca.descripcion,
    lang: 'es-CO',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF6EC',
    theme_color: '#14532D',
    icons: [
      { src: '/iconos/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/iconos/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/iconos/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
