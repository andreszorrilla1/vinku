'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import type { ReactNode } from 'react'

/** Registra el service worker (solo en producción, para no estorbar en desarrollo). */
export function ProveedorPwa({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== 'production'}>
      {children}
    </SerwistProvider>
  )
}
