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

  // Obtener equipo por ID
  async getEquipoById(id) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
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

  // Actualizar equipo
  async updateEquipo(id, equipoData) {
    const { data, error } = await supabase
      .from('equipos')
      .update({
        nombre: equipoData.nombre,
        tipo: equipoData.tipo,
        serie: equipoData.serie,
        estado: equipoData.estado,
        precio_compra: equipoData.precio_compra,
        precio_venta: equipoData.precio_venta,
        stock: equipoData.stock,
        imagen_url: equipoData.imagen_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) throw error
    return data?.[0] || null
  },

  // Eliminar equipo (soft delete)
  async deleteEquipo(id) {
    const { error } = await supabase
      .from('equipos')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  // Actualizar estado activo del equipo
  async updateEquipoStatus(id, active) {
    const { error } = await supabase
      .from('equipos')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  // Validar serie única
  async checkSerieUnique(serie, excludeId = null) {
    let query = supabase
      .from('equipos')
      .select('id')
      .eq('serie', serie)
      .eq('active', true)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data.length === 0
  },
}
