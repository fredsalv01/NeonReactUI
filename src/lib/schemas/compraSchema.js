import { z } from 'zod'
import { buildItemSchema, flattenZodIssues, optionalUuid } from './itemSchema'

// allowZeroPrice=true: una compra puede contener un item gratuito (muestra/garantía)
const compraItemSchema = buildItemSchema({ allowZeroPrice: true })

export const compraSchema = z.object({
  proveedor_id: optionalUuid('Proveedor inválido'),
  almacen_id:   z.string({ error: 'Almacén requerido' }).min(1, 'Almacén requerido'),
  fecha:        z.string({ error: 'Fecha requerida' })
    .min(1, 'Fecha requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  notas: z.string().nullable().optional(),
  items: z.array(compraItemSchema).min(1, 'La compra debe tener al menos un item'),
})

export const validateCompra = (raw) => {
  const parsed = compraSchema.safeParse(raw)
  if (parsed.success) return { success: true, errors: {}, data: parsed.data }
  return { success: false, errors: flattenZodIssues(parsed.error) }
}
