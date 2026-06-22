import { supabase } from '../supabase'

export const kardexService = {
  // Registrar entrada de stock (usa RPC function)
  async entradaStock({ equipo_id, cantidad, motivo }) {
    const { data, error } = await supabase.rpc('fn_entrada_stock', {
      p_equipo_id: equipo_id,
      p_cantidad: Number(cantidad),
      p_motivo: motivo || 'Entrada manual',
    })
    if (error) throw new Error(error.message)
    return data
  },

  // Obtener kardex de un equipo
  async fetchKardex(equipoId) {
    const { data, error } = await supabase
      .from('kardex')
      .select('*')
      .eq('equipo_id', equipoId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error(error.message)
    return data
  },

  // Registrar una entrada de movimiento de inventario (método alternativo)
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
    const { data, error } = await supabase
      .from('kardex')
      .select('*, perfiles(nombre)')
      .eq('equipo_id', equipoId)
      .order('created_at', { ascending: false })
    if (error) return []
    return (data || []).map((item) => ({
      ...item,
      usuario: { nombre: item.perfiles?.nombre || 'Sistema' },
    }))
  },

  // Obtener todos los movimientos
  async getMovimientos(filters = {}) {
    let query = supabase
      .from('kardex')
      .select('*, equipos(nombre, id), perfiles(nombre)')
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
