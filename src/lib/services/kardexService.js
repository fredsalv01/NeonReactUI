import { supabase } from '../supabase'

export const kardexService = {
  // Registrar una entrada de movimiento de inventario
  async registrarMovimiento(movimiento) {
    const { data, error } = await supabase
      .from('kardex')
      .insert([
        {
          equipo_id: movimiento.equipo_id,
          tipo: movimiento.tipo, // 'entrada', 'salida', 'ajuste'
          cantidad: movimiento.cantidad,
          descripcion: movimiento.descripcion || null,
          usuario_id: movimiento.usuario_id,
          referencia: movimiento.referencia || null,
        }
      ])
      .select()

    if (error) throw error
    return data?.[0] || null
  },

  // Obtener historial de movimientos de un equipo
  async getHistorialEquipo(equipoId) {
    const { data, error } = supabase
      .from('kardex')
      .select('*, usuarios(nombre, email)')
      .eq('equipo_id', equipoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener todos los movimientos
  async getMovimientos(filters = {}) {
    let query = supabase
      .from('kardex')
      .select('*, equipos(nombre, id), usuarios(nombre, email)')
      .order('created_at', { ascending: false })

    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo)
    }

    if (filters.usuarioId) {
      query = query.eq('usuario_id', filters.usuarioId)
    }

    if (filters.equipoId) {
      query = query.eq('equipo_id', filters.equipoId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },
}
