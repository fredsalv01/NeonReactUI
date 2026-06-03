import { supabase } from '../supabase'

export const equipoService = {
  // Obtener todos los equipos activos
  async getEquipos() {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Agregar nuevo equipo
  async addEquipo(equipoData) {
    const { data, error } = await supabase
      .from('equipos')
      .insert([
        {
          nombre: equipoData.nombre,
          tipo: equipoData.tipo,
          serie: equipoData.serie,
          estado: equipoData.estado,
          precio_compra: equipoData.precio_compra,
          precio_venta: equipoData.precio_venta,
          stock: equipoData.stock,
          imagen_url: equipoData.imagen_url,
          vendidos: 0,
          active: true,
        }
      ])
      .select()

    if (error) throw error
    return data?.[0] || null
  },

  // Eliminar equipo (soft delete)
  async deleteEquipo(id) {
    const { error } = await supabase
      .from('equipos')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error
  },

  // Actualizar estado activo del equipo
  async updateEquipoStatus(id, active) {
    const { error } = await supabase
      .from('equipos')
      .update({ active })
      .eq('id', id)

    if (error) throw error
  },
}
