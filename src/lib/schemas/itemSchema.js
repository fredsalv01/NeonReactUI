import { z } from 'zod'

// Item de detalle común para ventas / compras / cotizaciones.
// allowZeroPrice = true → para compras donde un item gratuito tiene sentido.
export const buildItemSchema = ({ allowZeroPrice = false } = {}) =>
  z.object({
    equipo_id: z.string().min(1, 'Cada item necesita un equipo'),
    cantidad: z.number()
      .int('La cantidad debe ser entera')
      .positive('Las cantidades deben ser > 0'),
    precio_unitario: z.number()
      .finite('Precio inválido')
      .refine(
        (v) => (allowZeroPrice ? v >= 0 : v > 0),
        allowZeroPrice ? 'Los precios deben ser ≥ 0' : 'Los precios deben ser > 0',
      ),
  })

// ZodError multi-path → { campo: 'msg' } que los modales esperan.
// - Errores top-level: errors[campo]
// - Errores en items[i].*: errors.items (primer mensaje útil)
export const flattenZodIssues = (zodError) => {
  const errors = {}
  for (const issue of zodError.issues) {
    const head = issue.path?.[0]
    if (head === 'items') {
      // Prioriza mensajes específicos de un item sobre "array too small"
      if (!errors.items || issue.path.length > 1) errors.items = issue.message
    } else if (head !== undefined) {
      if (!errors[head]) errors[head] = issue.message
    } else {
      errors.general = issue.message
    }
  }
  return errors
}

// Helper para normalizar cliente_id/proveedor_id opcional:
// acepta '' (sin selección) y lo transforma a null. Resto debe ser uuid string.
export const optionalUuid = (label = 'ID inválido') =>
  z.string()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()
    .refine(
      (v) => v === null || v === undefined || /^[0-9a-fA-F-]{36}$/.test(v),
      label,
    )
