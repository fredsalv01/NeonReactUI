import { supabase } from '../supabase'

export const kardexService = {
  // Entrada de stock vía RPC (actualiza stock_almacen + kardex)
  async entradaStock({ equipo_id, cantidad, motivo, almacen_id }) {
    const payload = {
      p_equipo_id: equipo_id,
      p_cantidad: Number(cantidad),
      p_motivo: motivo || 'Entrada manual',
    }
    if (almacen_id) payload.p_almacen_id = almacen_id

    const { data, error } = await supabase.rpc('fn_entrada_stock', payload)
    if (error) throw new Error(error.message)
    return data
  },

  // Salida de stock vía RPC (actualiza stock_almacen + kardex)
  async salidaStock({ equipo_id, cantidad, motivo, almacen_id, referencia_tipo, referencia_id }) {
    const payload = {
      p_equipo_id: equipo_id,
      p_cantidad: Number(cantidad),
      p_motivo: motivo || 'Salida manual',
    }
    if (almacen_id) payload.p_almacen_id = almacen_id
    if (referencia_tipo) payload.p_referencia_tipo = referencia_tipo
    if (referencia_id) payload.p_referencia_id = referencia_id

    const { data, error } = await supabase.rpc('fn_salida_stock', payload)
    if (error) throw new Error(error.message)
    return data
  },

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

  // Historial de un equipo con join a perfiles + almacenes
  async getHistorialEquipo(equipoId) {
    const { data, error } = await supabase
      .from('kardex')
      .select('*, perfiles(nombre), almacenes:almacen_id(id, nombre)')
      .eq('equipo_id', equipoId)
      .order('created_at', { ascending: false })
    if (error) return []
    return (data || []).map((item) => ({
      ...item,
      usuario: { nombre: item.perfiles?.nombre || 'Sistema' },
    }))
  },

  async getMovimientos(filters = {}) {
    let query = supabase
      .from('kardex')
      .select('*, equipos(nombre, id), perfiles(nombre), almacenes:almacen_id(id, nombre)')
      .order('created_at', { ascending: false })

    if (filters.tipo)       query = query.eq('tipo', filters.tipo)
    if (filters.usuarioId)  query = query.eq('usuario_id', filters.usuarioId)
    if (filters.equipoId)   query = query.eq('equipo_id', filters.equipoId)
    if (filters.almacenId)  query = query.eq('almacen_id', filters.almacenId)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}
