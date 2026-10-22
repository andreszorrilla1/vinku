import { z } from 'zod'
import { normalizarCelular } from '@/lib/telefono'
import { textos } from '@/textos/es'

const t = textos

export const esquemaCelular = z.string().transform((valor, ctx) => {
  const e164 = normalizarCelular(valor)
  if (!e164) {
    ctx.addIssue({ code: 'custom', message: t.ingresar.errores.celular })
    return z.NEVER
  }
  return e164
})

export const esquemaCanal = z.enum(['whatsapp', 'sms']).catch('whatsapp')

export const esquemaCodigo = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().length(6, t.ingresar.errores.codigo))

/** Ruta interna segura para volver después de entrar (evita redirecciones a otros sitios). */
export const esquemaSiguiente = z
  .string()
  .regex(/^\/(?!\/)[\w\-/?=&%.]*$/)
  .max(200)
  .catch('')

/** Casilla de formulario: marcada llega como 'on'; sin marcar no llega. */
const casilla = z
  .string()
  .nullish()
  .transform((v) => v === 'on' || v === 'true')

export const esquemaConsentimiento = z.object({
  acepta_tratamiento: casilla.refine((v) => v, t.bienvenida.consentimiento.faltaTratamiento),
  acepta_mostrar_nombre: casilla,
  acepta_whatsapp: casilla,
})

export const RANGOS_EDAD = ['menos_30', 'de_30_a_59', 'mas_60'] as const

export const esquemaPerfil = z
  .object({
    nombre_mostrar: z
      .string()
      .transform((v) => v.replace(/\s+/g, ' ').trim())
      .pipe(z.string().min(2, t.bienvenida.perfil.errores.nombre).max(40, t.bienvenida.perfil.errores.nombre)),
    territorio_id: z.coerce
      .number({ error: t.bienvenida.perfil.errores.barrio })
      .int(t.bienvenida.perfil.errores.barrio)
      .positive(t.bienvenida.perfil.errores.barrio),
    rango_edad: z.enum(RANGOS_EDAD).nullable().catch(null),
    lat: z.coerce.number().min(-90).max(90).nullable().catch(null),
    lng: z.coerce.number().min(-180).max(180).nullable().catch(null),
  })
  .transform(({ lat, lng, ...resto }) => ({
    ...resto,
    punto: lat !== null && lng !== null && !(lat === 0 && lng === 0) ? { lat, lng } : null,
  }))

export const esquemaTamanoLetra = z.enum(['normal', 'grande'])
