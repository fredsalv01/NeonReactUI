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

  // Obtener historial de movimientos de un equipo con información del usuario
  async getHistorialEquipo(equipoId) {
    const { data, error } = await supabase
      .from('kardex')
      .select('*')
      .eq('equipo_id', equipoId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich with user emails from auth.users
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(
        data.map(async (item) => {
          if (item.usuario_id) {
            try {
              const { data: usuario } = await supabase.auth.admin.getUserById(item.usuario_id)
              return {
                ...item,
                usuario_email: usuario?.email || 'Sistema'
              }
            } catch (err) {
              return { ...item, usuario_email: 'Sistema' }
            }
          }
          return { ...item, usuario_email: 'Sistema' }
        })
      )
      return enrichedData
    }
    return data || []
  },

  // Obtener todos los movimientos
  async getMovimientos(filters = {}) {
    let query = supabase
      .from('kardex')
      .select('*, equipos(nombre, id)')
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
