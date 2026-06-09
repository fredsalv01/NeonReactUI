import { supabase } from '../supabase'

export const ventaService = {
  // Obtener todas las ventas
  async getVentas() {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        equipos:equipo_id(id, nombre, tipo, imagen_url, precio_venta),
        perfiles:usuario_id(id, nombre, email)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener venta por ID
  async getVentaById(id) {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        equipos:equipo_id(id, nombre, tipo, imagen_url, precio_venta, serie, estado),
        perfiles:usuario_id(id, nombre, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Agregar nueva venta
  async addVenta(ventaData) {
    const { data, error } = await supabase
      .from('ventas')
      .insert([
        {
          equipo_id: ventaData.equipo_id,
          cantidad: ventaData.cantidad,
          precio_unitario: ventaData.precio_unitario,
          monto_total: ventaData.monto_total,
          descripcion: ventaData.descripcion || null,
          usuario_id: ventaData.usuario_id,
          active: true,
        }
      ])
      .select(`
        *,
        equipos:equipo_id(id, nombre, tipo, imagen_url, precio_venta),
        perfiles:usuario_id(id, nombre, email)
      `)

    if (error) throw error
    return data?.[0] || null
  },

  // Actualizar venta
  async updateVenta(id, ventaData) {
    const updateObj = {
      updated_at: new Date().toISOString(),
    }

    if (ventaData.cantidad !== undefined) updateObj.cantidad = ventaData.cantidad
    if (ventaData.precio_unitario !== undefined) updateObj.precio_unitario = ventaData.precio_unitario
    if (ventaData.monto_total !== undefined) updateObj.monto_total = ventaData.monto_total
    if (ventaData.descripcion !== undefined) updateObj.descripcion = ventaData.descripcion

    const { data, error } = await supabase
      .from('ventas')
      .update(updateObj)
      .eq('id', id)
      .select(`
        *,
        equipos:equipo_id(id, nombre, tipo, imagen_url, precio_venta),
        perfiles:usuario_id(id, nombre, email)
      `)

    if (error) throw error
    return data?.[0] || null
  },

  // Eliminar venta (soft delete)
  async deleteVenta(id) {
    const { error } = await supabase
      .from('ventas')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  // Actualizar estado activo de la venta
  async updateVentaStatus(id, active) {
    const { error } = await supabase
      .from('ventas')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  // Obtener ventas con filtros
  async getVentasFiltered(filters = {}) {
    let query = supabase
      .from('ventas')
      .select(`
        *,
        equipos:equipo_id(id, nombre, tipo, imagen_url, precio_venta),
        perfiles:usuario_id(id, nombre, email)
      `)
      .eq('active', true)

    if (filters.equipoId) {
      query = query.eq('equipo_id', filters.equipoId)
    }

    if (filters.usuarioId) {
      query = query.eq('usuario_id', filters.usuarioId)
    }

    if (filters.startDate && filters.endDate) {
      query = query
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Obtener totales de ventas
  async getVentasTotals() {
    const { data, error } = await supabase
      .from('ventas')
      .select('monto_total, cantidad')
      .eq('active', true)

    if (error) throw error
    return data || []
  },
}
