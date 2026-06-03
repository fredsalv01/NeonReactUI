import { z } from 'zod'

export const equipoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  tipo: z
    .string()
    .min(1, 'El tipo es requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  serie: z
    .string()
    .min(1, 'La serie es requerida')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  estado: z.enum(['Disponible', 'En uso', 'Mantenimiento', 'Baja'], {
    errorMap: () => ({ message: 'Estado inválido' })
  }),
  precio_compra: z
    .number()
    .positive('Debe ser mayor a 0')
    .finite('Número inválido'),
  precio_venta: z
    .number()
    .positive('Debe ser mayor a 0')
    .finite('Número inválido'),
  stock: z
    .number()
    .int('Debe ser un número entero')
    .nonnegative('No puede ser negativo'),
  imagen: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'La imagen no debe superar 5MB'
    )
    .refine(
      (file) => !file || file.type.startsWith('image/'),
      'Solo se aceptan archivos de imagen'
    )
})

export const validateEquipo = (data) => {
  try {
    equipoSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {}
      error.errors.forEach((err) => {
        errors[err.path[0]] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Error de validación' } }
  }
}
