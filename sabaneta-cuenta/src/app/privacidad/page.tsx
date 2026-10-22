import type { Metadata } from 'next'
import { PaginaLegal } from '@/componentes/PaginaLegal'
import { VERSION_POLITICA } from '@/lib/politica'

export const metadata: Metadata = { title: 'Cómo cuidamos tus datos' }

const contacto = process.env.NEXT_PUBLIC_CONTACTO_DATOS || '[correo de contacto por definir]'

// Plantilla en lenguaje simple. Debe revisarla un abogado antes de salir a producción (docs/PENDIENTES_LEGALES.md).
export default function Privacidad() {
  return (
    <PaginaLegal titulo="Cómo cuidamos tus datos" version={VERSION_POLITICA}>
      <p>
        Esta es la política de tratamiento de datos de Sabaneta Cuenta. Sigue la Ley 1581 de 2012 y el Decreto 1377 de
        2013.
      </p>
      <h2>Quién maneja tus datos</h2>
      <p>
        El equipo de Sabaneta Cuenta, iniciativa liderada por Juan Carlos Jaramillo Jara. [Razón social, NIT y dirección
        por definir.]
      </p>
      <h2>Qué datos guardamos</h2>
      <ul>
        <li>Tu número de celular, para que entres con un código.</li>
        <li>El nombre con el que quieres que te llamemos.</li>
        <li>Tu barrio o vereda y, si lo eliges, un punto aproximado de tu cuadra.</li>
        <li>Tu rango de edad, solo si lo eliges.</li>
        <li>Lo que cuentes, tus «Me suma», comentarios y cómo repartes los 100.</li>
      </ul>
      <p>No pedimos cédula, dirección exacta ni correo.</p>
      <h2>Para qué los usamos</h2>
      <p>
        Solo para construir con los vecinos el programa de gobierno de Sabaneta. No los vendemos ni se los damos a nadie
        más.
      </p>
      <h2>Dato sensible</h2>
      <p>
        Participar aquí puede mostrar tu opinión política. Eso es un dato sensible. Por eso te pedimos permiso aparte y
        de forma clara. No es obligatorio darlo.
      </p>
      <h2>Dónde están tus datos</h2>
      <p>
        Los servidores están en São Paulo, Brasil. Para ordenar lo que cuentas usamos inteligencia artificial de una
        empresa en Estados Unidos, sin enviar tu celular ni tu nombre. Esto es una transferencia internacional de datos.
      </p>
      <h2>Tus derechos</h2>
      <ul>
        <li>Conocer los datos que tenemos de ti.</li>
        <li>Corregirlos o actualizarlos.</li>
        <li>Quitar los permisos opcionales cuando quieras.</li>
        <li>Pedir que borremos tu cuenta.</li>
      </ul>
      <p>Escríbenos a: {contacto}</p>
    </PaginaLegal>
  )
}
