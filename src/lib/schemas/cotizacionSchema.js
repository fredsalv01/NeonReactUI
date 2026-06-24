import { z } from 'zod'
import { buildItemSchema, flattenZodIssues, optionalUuid } from './itemSchema'

const cotizacionItemSchema = buildItemSchema({ allowZeroPrice: false })

export const cotizacionSchema = z.object({
  cliente_id: optionalUuid('Cliente inválido'),
  fecha:      z.string({ error: 'Fecha requerida' })
    .min(1, 'Fecha requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  notas: z.string().nullable().optional(),
  items: z.array(cotizacionItemSchema).min(1, 'Agrega al menos un item'),
})

export const validateCotizacion = (raw) => {
  const parsed = cotizacionSchema.safeParse(raw)
  if (parsed.success) return { success: true, errors: {}, data: parsed.data }
  return { success: false, errors: flattenZodIssues(parsed.error) }
}
