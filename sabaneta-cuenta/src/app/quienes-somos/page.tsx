import type { Metadata } from 'next'
import { PaginaLegal } from '@/componentes/PaginaLegal'
import { textos } from '@/textos/es'

export const metadata: Metadata = { title: 'Quiénes somos' }

export default function QuienesSomos() {
  return (
    <PaginaLegal titulo="Quiénes somos" version="2026-10-borrador-1" aviso={textos.legal.pendienteElectoral}>
      <p>
        Sabaneta Cuenta es una iniciativa liderada por Juan Carlos Jaramillo Jara para construir su programa de gobierno
        con los vecinos de Sabaneta.
      </p>
      <p>
        Aquí cada vecino cuenta lo que vive su cuadra. Con eso armamos juntos el programa. Cada barrio recibe respuesta:
        qué entró, qué no y por qué.
      </p>
      <p>Lo que cuentas se usa solo para construir el programa. Lee cómo cuidamos tus datos.</p>
    </PaginaLegal>
  )
}
