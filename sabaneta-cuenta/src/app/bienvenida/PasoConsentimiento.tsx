'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Database, ShieldCheck, Target, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LeerEnVozAlta } from '@/componentes/LeerEnVozAlta'
import { Boton } from '@/componentes/ui/Boton'
import { textos } from '@/textos/es'
import { guardarConsentimiento, type EstadoFormulario } from './acciones'
import { Progreso } from './Progreso'

const t = textos.bienvenida.consentimiento

const puntos: { titulo: string; texto: string; Icono: LucideIcon }[] = [
  { titulo: t.queGuardamos, texto: t.queGuardamosTexto, Icono: Database },
  { titulo: t.paraQue, texto: t.paraQueTexto, Icono: Target },
  { titulo: t.quien, texto: t.quienTexto, Icono: ShieldCheck },
  { titulo: t.borrar, texto: t.borrarTexto, Icono: Trash2 },
]

export function PasoConsentimiento() {
  const [estado, enviar, guardando] = useActionState(guardarConsentimiento, {} as EstadoFormulario)
  const lectura = [t.titulo, t.intro, ...puntos.flatMap((p) => [p.titulo, p.texto])].join('. ')

  return (
    <form action={enviar} className="flex flex-col gap-6" noValidate>
      <Progreso actual={1} total={2} />
      <div className="flex flex-col gap-2">
        <h1 className="tipo-titulo-1 text-titulo">{t.titulo}</h1>
        <p className="tipo-cuerpo-grande text-tinta-suave">{t.intro}</p>
      </div>
      <LeerEnVozAlta texto={lectura} className="self-start" />

      <ul className="flex flex-col divide-y divide-borde rounded-hoja border border-borde bg-tarjeta shadow-tarjeta">
        {puntos.map(({ titulo, texto, Icono }) => (
          <li key={titulo} className="flex gap-4 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-verde/12 text-titulo">
              <Icono aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="tipo-etiqueta">{titulo}</h2>
              <p className="tipo-cuerpo text-tinta-suave">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/privacidad"
        target="_blank"
        className="inline-flex min-h-tocable items-center self-start tipo-etiqueta text-naranja-texto underline underline-offset-4"
      >
        {t.leerPolitica}
      </Link>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">{t.titulo}</legend>
        <Casilla nombre="acepta_tratamiento" etiqueta={t.aceptaTratamiento} marca={t.obligatorio} />
        <Casilla
          nombre="acepta_mostrar_nombre"
          etiqueta={t.aceptaNombre}
          ayuda={t.aceptaNombreAyuda}
          marca={t.opcional}
        />
        <Casilla nombre="acepta_whatsapp" etiqueta={t.aceptaWhatsapp} marca={t.opcional} />
      </fieldset>

      {estado.error && (
        <p role="alert" className="tipo-cuerpo font-bold text-error">
          {estado.error}
        </p>
      )}
      <Boton type="submit" disabled={guardando}>
        {t.boton}
      </Boton>
    </form>
  )
}

/** Casilla grande, toda la tarjeta se puede tocar. Nunca viene marcada. */
function Casilla({
  nombre,
  etiqueta,
  ayuda,
  marca,
}: {
  nombre: string
  etiqueta: string
  ayuda?: string
  marca: string
}) {
  return (
    <label className="flex min-h-tocable cursor-pointer gap-4 rounded-hoja border-2 border-borde bg-tarjeta p-4 transition-colors has-checked:border-verde has-checked:bg-verde/8">
      <input type="checkbox" name={nombre} className="mt-0.5 size-7 shrink-0 accent-verde" />
      <span className="flex flex-col gap-1">
        <span className="tipo-cuerpo">{etiqueta}</span>
        {ayuda && <span className="tipo-pequeno text-tinta-suave">{ayuda}</span>}
        <span className="tipo-etiqueta text-tinta-suave">{marca}</span>
      </span>
    </label>
  )
}
