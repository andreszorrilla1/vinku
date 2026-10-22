import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible_Next, Nunito } from 'next/font/google'
import { BarraInferior } from '@/componentes/BarraInferior'
import { Encabezado } from '@/componentes/Encabezado'
import { SCRIPT_PREFERENCIAS } from '@/componentes/preferencias'
import { ProveedorPwa } from '@/componentes/ProveedorPwa'
import { ScriptInline } from '@/componentes/ScriptInline'
import { textos } from '@/textos/es'
import './globals.css'

const nunito = Nunito({
  variable: '--fuente-nunito',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
})

const atkinson = Atkinson_Hyperlegible_Next({
  variable: '--fuente-atkinson',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  // Next no trae métricas de esta fuente para calcular el respaldo; usamos el del sistema.
  adjustFontFallback: false,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO_URL ?? 'http://localhost:3000'),
  title: { default: textos.marca.nombre, template: `%s · ${textos.marca.nombre}` },
  description: textos.marca.descripcion,
  applicationName: textos.marca.nombre,
  appleWebApp: { capable: true, title: textos.marca.nombre, statusBarStyle: 'default' },
  icons: { apple: '/iconos/apple-touch-icon.png' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF6EC' },
    { media: '(prefers-color-scheme: dark)', color: '#11251A' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-CO"
      className={`${nunito.variable} ${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ScriptInline html={SCRIPT_PREFERENCIAS} />
      </head>
      <body className="flex min-h-full flex-col">
        <ProveedorPwa>
          <Encabezado />
          {children}
          <BarraInferior />
        </ProveedorPwa>
      </body>
    </html>
  )
}
