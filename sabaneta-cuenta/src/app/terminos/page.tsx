import type { Metadata } from 'next'
import { PaginaLegal } from '@/componentes/PaginaLegal'

export const metadata: Metadata = { title: 'Reglas para participar' }

export default function Terminos() {
  return (
    <PaginaLegal titulo="Reglas para participar" version="2026-10-borrador-1">
      <p>Sabaneta Cuenta es de todos los vecinos. Para que funcione, cuidémonos entre todos.</p>
      <h2>Reglas de convivencia</h2>
      <ul>
        <li>Habla con respeto, aunque no estés de acuerdo.</li>
        <li>No publiques datos de otras personas: teléfonos, direcciones o fotos de caras.</li>
        <li>No acuses a nadie con nombre propio. Cuenta el problema, no a la persona.</li>
        <li>Nada de violencia, amenazas ni insultos.</li>
        <li>Cuenta cosas reales de tu cuadra.</li>
      </ul>
      <h2>Qué pasa con lo que cuentas</h2>
      <p>
        Un equipo revisa cada cuenta antes de publicarla. Si no cumple estas reglas, no se publica y te decimos por qué.
      </p>
    </PaginaLegal>
  )
}
