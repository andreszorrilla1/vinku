'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageCircle, Smartphone } from 'lucide-react'
import { Boton } from '@/componentes/ui/Boton'
import { formatearCelular, formatearMientrasEscribe } from '@/lib/telefono'
import { textos } from '@/textos/es'
import { enviarCodigo, verificarCodigo, type EstadoIngreso } from './acciones'

const t = textos.ingresar
const ESPERA_REENVIO = 60

export function FormularioIngreso({ siguiente, invitado }: { siguiente: string; invitado: boolean }) {
  const [estado, pedir, enviando] = useActionState(enviarCodigo, { paso: 'celular' } as EstadoIngreso)
  // Marca de tiempo del envío que el vecino decidió corregir con «Cambiar número».
  const [corrigiendo, setCorrigiendo] = useState<number | null>(null)

  if (estado.paso === 'codigo' && corrigiendo !== estado.enviadoEn) {
    return (
      <PasoCodigo
        key={estado.enviadoEn}
        estado={estado}
        siguiente={siguiente}
        onCambiar={() => setCorrigiendo(estado.enviadoEn)}
        pedir={pedir}
        enviando={enviando}
      />
    )
  }
  const paraCorregir: Extract<EstadoIngreso, { paso: 'celular' }> =
    estado.paso === 'codigo' ? { paso: 'celular', celular: estado.celular } : estado
  return <PasoCelular estado={paraCorregir} pedir={pedir} enviando={enviando} invitado={invitado} />
}

function PasoCelular({
  estado,
  pedir,
  enviando,
  invitado,
}: {
  estado: Extract<EstadoIngreso, { paso: 'celular' }>
  pedir: (d: FormData) => void
  enviando: boolean
  invitado: boolean
}) {
  const [valor, setValor] = useState(formatearMientrasEscribe(estado.celular ?? ''))
  return (
    <form action={pedir} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="tipo-titulo-1 text-titulo">{t.tituloCelular}</h1>
        <p className="tipo-cuerpo-grande text-tinta-suave">{t.ayudaCelular}</p>
      </div>
      {invitado && (
        <p className="rounded-tarjeta bg-proyecto/10 px-4 py-3 tipo-cuerpo text-tinta" role="status">
          {t.invitado}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="celular" className="tipo-etiqueta">
          {t.etiquetaCelular}
        </label>
        <div className="flex items-stretch overflow-hidden rounded-tarjeta border-2 border-tinta-suave bg-tarjeta focus-within:border-verde focus-within:ring-4 focus-within:ring-verde/20">
          <span className="flex items-center gap-2 border-r-2 border-borde px-4 tipo-cuerpo-grande font-bold text-tinta-suave">
            <span aria-hidden="true">🇨🇴</span>+57
          </span>
          <input
            id="celular"
            name="celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            autoFocus
            placeholder={t.ejemploCelular}
            value={valor}
            onChange={(e) => setValor(formatearMientrasEscribe(e.target.value))}
            aria-invalid={Boolean(estado.error)}
            aria-describedby={estado.error ? 'error-celular' : undefined}
            className="min-h-16 w-full min-w-0 bg-transparent px-4 font-titulo text-2xl font-bold tracking-wide text-tinta outline-none placeholder:font-texto placeholder:text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-tinta-suave"
          />
        </div>
        {estado.error && (
          <p id="error-celular" role="alert" className="tipo-cuerpo font-bold text-error">
            {estado.error}
          </p>
        )}
      </div>
      <input type="hidden" name="canal" value="whatsapp" />
      <Boton type="submit" disabled={enviando} icono={<MessageCircle aria-hidden="true" className="size-6" />}>
        {enviando ? t.enviando : t.botonEnviar}
      </Boton>
      <p className="tipo-pequeno text-tinta-suave">{t.privacidad}</p>
    </form>
  )
}

function PasoCodigo({
  estado,
  siguiente,
  onCambiar,
  pedir,
  enviando,
}: {
  estado: Extract<EstadoIngreso, { paso: 'codigo' }>
  siguiente: string
  onCambiar: () => void
  pedir: (d: FormData) => void
  enviando: boolean
}) {
  const [resultado, verificar, verificando] = useActionState(verificarCodigo, estado)
  const [restante, setRestante] = useState(ESPERA_REENVIO)
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const reloj = setInterval(
      () => setRestante(Math.max(0, ESPERA_REENVIO - Math.floor((Date.now() - estado.enviadoEn) / 1000))),
      1000,
    )
    return () => clearInterval(reloj)
  }, [estado.enviadoEn])

  const error = resultado.paso === 'codigo' && resultado.enviadoEn === estado.enviadoEn ? resultado.error : undefined
  useEffect(() => {
    if (error) campo.current?.select()
  }, [error])

  function reenviar(canal: 'whatsapp' | 'sms') {
    const datos = new FormData()
    datos.set('celular', estado.celular)
    datos.set('canal', canal)
    pedir(datos)
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onCambiar}
        className="-ml-2 inline-flex min-h-12 items-center gap-2 self-start rounded-full px-2 tipo-etiqueta text-naranja-texto"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        {t.cambiarNumero}
      </button>
      <div className="flex flex-col gap-2">
        <h1 className="tipo-titulo-1 text-titulo">{t.tituloCodigo}</h1>
        <p className="tipo-cuerpo-grande text-tinta-suave">
          {t.ayudaCodigo(formatearCelular(estado.celular), estado.canal)}
        </p>
      </div>
      <form action={verificar} className="flex flex-col gap-6" noValidate>
        <input type="hidden" name="siguiente" value={siguiente} />
        <div className="flex flex-col gap-2">
          <label htmlFor="codigo" className="tipo-etiqueta">
            {t.etiquetaCodigo}
          </label>
          <input
            ref={campo}
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'error-codigo' : undefined}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)
              if (e.target.value.length === 6) e.target.form?.requestSubmit()
            }}
            placeholder="••••••"
            className="min-h-20 w-full rounded-tarjeta border-2 border-tinta-suave bg-tarjeta text-center font-titulo text-4xl font-black tracking-[0.5em] text-tinta outline-none placeholder:text-borde focus:border-verde focus:ring-4 focus:ring-verde/20"
          />
          {error && (
            <p id="error-codigo" role="alert" className="tipo-cuerpo font-bold text-error">
              {error}
            </p>
          )}
        </div>
        <Boton type="submit" disabled={verificando}>
          {verificando ? t.verificando : t.botonVerificar}
        </Boton>
      </form>
      <div className="flex flex-col gap-2 border-t border-borde pt-4">
        {restante > 0 ? (
          <p className="tipo-cuerpo text-tinta-suave" aria-live="polite">
            {t.reenviarEn(restante)}
          </p>
        ) : (
          <>
            <Boton
              type="button"
              variante="borde"
              disabled={enviando}
              onClick={() => reenviar('whatsapp')}
              icono={<MessageCircle aria-hidden="true" className="size-5" />}
            >
              {t.reenviar}
            </Boton>
            <Boton
              type="button"
              variante="borde"
              disabled={enviando}
              onClick={() => reenviar('sms')}
              icono={<Smartphone aria-hidden="true" className="size-5" />}
            >
              {t.porSms}
            </Boton>
          </>
        )}
      </div>
    </div>
  )
}
