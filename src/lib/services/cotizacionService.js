import { supabase } from '../supabase'

const COT_SELECT = `
  id, fecha, total, estado, notas, venta_id, created_at, updated_at,
  cliente_id, cliente, cliente_tipo_doc, cliente_nro_doc, cliente_telefono, cliente_email,
  perfiles:usuario_id(id, nombre, email),
  cotizaciones_items(
    id, equipo_id, cantidad, precio_unitario, subtotal, created_at,
    equipos:equipo_id(id, nombre, tipo, imagen_url)
  )
`

export const cotizacionService = {
  async fetchCotizaciones({ page = 1, pageSize = 10, estado = null } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('cotizaciones')
      .select(COT_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (estado) query = query.eq('estado', estado)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    return { data: data || [], total: count ?? (data?.length ?? 0) }
  },

  async getCotizacionById(id) {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(COT_SELECT)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // Multi-producto: RPC fn_registrar_cotizacion (1 tx: header + items + trigger total)
  // payload = { cotizacion: { cliente_id, usuario_id, fecha, notas },
  //             items: [{ equipo_id, cantidad, precio_unitario }] }
  async crearCotizacion({ cotizacion, items }) {
    const { data: cotId, error } = await supabase.rpc('fn_registrar_cotizacion', {
      p_cotizacion: {
        cliente_id:  cotizacion.cliente_id  ?? null,
        usuario_id:  cotizacion.usuario_id  ?? null,
        fecha:       cotizacion.fecha       ?? null,
        notas:       cotizacion.notas       ?? null,
      },
      p_items: items.map((it) => ({
        equipo_id:       it.equipo_id,
        cantidad:        it.cantidad,
        precio_unitario: it.precio_unitario,
      })),
    })
    if (error) throw new Error(error.message)
    return await cotizacionService.getCotizacionById(cotId)
  },

  async actualizarEstado(id, estado) {
    const ALLOWED = ['borrador', 'enviada', 'aceptada', 'rechazada']
    if (!ALLOWED.includes(estado)) {
      throw new Error(`Estado inválido. Use ${ALLOWED.join(', ')} o convierta a venta.`)
    }
    const { data, error } = await supabase
      .from('cotizaciones')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(COT_SELECT)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async actualizarNotas(id, notas) {
    const { data, error } = await supabase
      .from('cotizaciones')
      .update({ notas: notas || null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(COT_SELECT)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // Convierte a venta vía RPC. Descuenta stock + escribe kardex en la misma tx.
  // Retorna el id de la venta creada.
  async convertirAVenta(cotizacionId, almacenId) {
    if (!almacenId) throw new Error('Almacén requerido para convertir a venta')
    const { data: ventaId, error } = await supabase.rpc('fn_convertir_cotizacion_a_venta', {
      p_cotizacion_id: cotizacionId,
      p_almacen_id: almacenId,
    })
    if (error) throw new Error(error.message)
    return ventaId
  },

  async eliminarCotizacion(id) {
    const { error } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
