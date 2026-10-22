'use client'

import { useActionState, useState, useTransition } from 'react'
import { Check, LocateFixed } from 'lucide-react'
import { Boton } from '@/componentes/ui/Boton'
import { RANGOS_EDAD } from '@/lib/esquemas'
import { textos } from '@/textos/es'
import { crearPerfil, ubicar, type EstadoFormulario } from './acciones'
import { Progreso } from './Progreso'

const t = textos.bienvenida.perfil

type Territorio = { id: number; nombre: string; tipo: 'barrio' | 'vereda' }

export function PasoPerfil({ territorios }: { territorios: Territorio[] }) {
  const [estado, enviar, guardando] = useActionState(crearPerfil, {} as EstadoFormulario)
  const campos = estado.campos ?? {}
  const [territorio, setTerritorio] = useState(campos.territorio_id ?? '')
  const [punto, setPunto] = useState<{ lat: number; lng: number } | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ubicando, iniciarUbicacion] = useTransition()

  function ubicarme() {
    setAviso(null)
    if (!('geolocation' in navigator)) {
      setAviso(t.sinPermiso)
      return
    }
    iniciarUbicacion(async () => {
      const posicion = await new Promise<GeolocationPosition | null>((resolver) =>
        navigator.geolocation.getCurrentPosition(resolver, () => resolver(null), {
          enableHighAccuracy: true,
          timeout: 15000,
        }),
      )
      if (!posicion) {
        setAviso(t.sinPermiso)
        return
      }
      const { latitude: lat, longitude: lng } = posicion.coords
      const resultado = await ubicar(lat, lng)
      if ('error' in resultado) {
        setPunto(null)
        setAviso(resultado.error)
        return
      }
      setTerritorio(String(resultado.territorio_id))
      setPunto({ lat, lng })
      setAviso(t.ubicado(resultado.nombre))
    })
  }

  return (
    <form action={enviar} className="flex flex-col gap-8" noValidate>
      <Progreso actual={2} total={2} />
      <div className="flex flex-col gap-2">
        <h1 className="tipo-titulo-1 text-titulo">{t.titulo}</h1>
        <p className="tipo-cuerpo-grande text-tinta-suave">{t.intro}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nombre_mostrar" className="tipo-etiqueta">
          {t.etiquetaNombre}
        </label>
        <input
          id="nombre_mostrar"
          name="nombre_mostrar"
          type="text"
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={40}
          required
          defaultValue={campos.nombre_mostrar}
          placeholder={t.ejemploNombre}
          className="min-h-16 rounded-tarjeta border-2 border-tinta-suave bg-tarjeta px-4 tipo-cuerpo-grande text-tinta outline-none placeholder:text-tinta-suave focus:border-verde focus:ring-4 focus:ring-verde/20"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <legend className="tipo-etiqueta">{t.etiquetaBarrio}</legend>
          <button
            type="button"
            onClick={ubicarme}
            disabled={ubicando}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-verde/12 px-4 tipo-etiqueta text-titulo transition active:scale-[0.98] disabled:opacity-60"
          >
            <LocateFixed aria-hidden="true" className={`size-5 ${ubicando ? 'animate-spin' : ''}`} />
            {ubicando ? t.ubicando : t.ubicarme}
          </button>
        </div>
        {aviso && (
          <p role="status" className="tipo-cuerpo text-tinta-suave">
            {aviso}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {territorios.map((terr) => (
            <label
              key={terr.id}
              className="flex min-h-tocable cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-borde bg-tarjeta px-4 py-3 transition-colors has-checked:border-verde has-checked:bg-verde/8"
            >
              <input
                type="radio"
                name="territorio_id"
                value={terr.id}
                checked={territorio === String(terr.id)}
                onChange={(e) => {
                  setTerritorio(e.target.value)
                  setPunto(null)
                }}
                className="peer sr-only"
              />
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-tinta-suave peer-checked:border-verde peer-checked:bg-verde peer-focus-visible:ring-4 peer-focus-visible:ring-naranja">
                <Check aria-hidden="true" className="size-4 text-sobre-verde" strokeWidth={3} />
              </span>
              <span className="tipo-cuerpo">{terr.nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <input type="hidden" name="lat" value={punto?.lat ?? ''} />
      <input type="hidden" name="lng" value={punto?.lng ?? ''} />

      <fieldset className="flex flex-col gap-3">
        <legend className="tipo-etiqueta">{t.etiquetaEdad}</legend>
        <p className="tipo-pequeno text-tinta-suave">{t.ayudaEdad}</p>
        <div className="grid grid-cols-3 gap-2">
          {RANGOS_EDAD.map((rango) => (
            <label key={rango} className="relative">
              <input
                type="radio"
                name="rango_edad"
                value={rango}
                defaultChecked={campos.rango_edad === rango}
                className="peer sr-only"
              />
              <span className="flex min-h-tocable cursor-pointer items-center justify-center rounded-full border-2 border-borde bg-tarjeta px-2 text-center tipo-etiqueta peer-checked:border-verde peer-checked:bg-verde peer-checked:text-sobre-verde peer-focus-visible:ring-4 peer-focus-visible:ring-naranja">
                {t.edades[rango]}
              </span>
            </label>
          ))}
        </div>
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
