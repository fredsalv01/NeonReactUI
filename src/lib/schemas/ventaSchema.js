import { z } from 'zod'
import { buildItemSchema, flattenZodIssues, optionalUuid } from './itemSchema'

const ventaItemSchema = buildItemSchema({ allowZeroPrice: false })

export const ventaSchema = z.object({
  cliente_id: optionalUuid('Cliente inválido'),
  almacen_id: z.string({ error: 'Almacén requerido' }).min(1, 'Almacén requerido'),
  fecha:      z.string({ error: 'Fecha requerida' })
    .min(1, 'Fecha requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  descripcion: z.string().nullable().optional(),
  items: z.array(ventaItemSchema).min(1, 'Agrega al menos un item'),
})

export const validateVenta = (raw) => {
  const parsed = ventaSchema.safeParse(raw)
  if (parsed.success) return { success: true, errors: {}, data: parsed.data }
  return { success: false, errors: flattenZodIssues(parsed.error) }
}
