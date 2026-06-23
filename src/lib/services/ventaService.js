import { supabase } from '../supabase'

const VENTA_SELECT_BASE = `
  *,
  equipos!inner(id, nombre, tipo, imagen_url, precio_venta),
  perfiles(id, nombre, email),
  venta_items(id, equipo_id, cantidad, precio_unitario, subtotal, equipos(id, nombre, tipo, imagen_url))
`

const VENTA_SELECT_DETAIL = `
  *,
  equipos!inner(id, nombre, tipo, imagen_url, precio_venta, serie, estado),
  perfiles(id, nombre, email),
  venta_items(id, equipo_id, cantidad, precio_unitario, subtotal, equipos(id, nombre, tipo, imagen_url))
`

// MAPEO BD ↔ UI:
//   precio_venta → precio_unitario | total → monto_total
//   vendido_por  → usuario_id      | notas → descripcion
function mapVentaRowToUI(venta) {
  if (!venta) return venta
  return {
    ...venta,
    precio_unitario: venta.precio_venta,
    monto_total: venta.total,
    usuario_id: venta.vendido_por,
    descripcion: venta.notas,
  }
}

function mapUIDataToInsert(ventaData) {
  return {
    equipo_id: ventaData.equipo_id,
    cantidad: ventaData.cantidad,
    precio_venta: ventaData.precio_unitario ?? ventaData.precio_venta,
    // ponytail: `total` is a generated column (cantidad * precio_venta), DB rejects writes
    notas: ventaData.descripcion ?? ventaData.notas ?? null,
    vendido_por: ventaData.usuario_id ?? ventaData.vendido_por,
    // FKs nuevas (modelo normalizado)
    ...(ventaData.cliente_id !== undefined && { cliente_id: ventaData.cliente_id }),
    ...(ventaData.almacen_id !== undefined && { almacen_id: ventaData.almacen_id }),
    // Columnas legacy denormalizadas — se conservan mientras existan en BD
    ...(ventaData.cliente !== undefined && { cliente: ventaData.cliente }),
    ...(ventaData.cliente_tipo_doc !== undefined && { cliente_tipo_doc: ventaData.cliente_tipo_doc }),
    ...(ventaData.cliente_nro_doc !== undefined && { cliente_nro_doc: ventaData.cliente_nro_doc }),
    ...(ventaData.cliente_telefono !== undefined && { cliente_telefono: ventaData.cliente_telefono }),
    ...(ventaData.cliente_email !== undefined && { cliente_email: ventaData.cliente_email }),
  }
}

function mapUIDataToUpdate(ventaData) {
  const obj = {}
  if (ventaData.cantidad !== undefined) obj.cantidad = ventaData.cantidad
  if (ventaData.precio_unitario !== undefined) obj.precio_venta = ventaData.precio_unitario
  if (ventaData.precio_venta !== undefined) obj.precio_venta = ventaData.precio_venta
  // ponytail: skip `total` — generated column in DB
  if (ventaData.descripcion !== undefined) obj.notas = ventaData.descripcion
  if (ventaData.notas !== undefined) obj.notas = ventaData.notas
  if (ventaData.cliente !== undefined) obj.cliente = ventaData.cliente
  if (ventaData.cliente_tipo_doc !== undefined) obj.cliente_tipo_doc = ventaData.cliente_tipo_doc
  if (ventaData.cliente_nro_doc !== undefined) obj.cliente_nro_doc = ventaData.cliente_nro_doc
  if (ventaData.cliente_telefono !== undefined) obj.cliente_telefono = ventaData.cliente_telefono
  if (ventaData.cliente_email !== undefined) obj.cliente_email = ventaData.cliente_email
  return obj
}

export const ventaService = {
  async getVentas() {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT_BASE)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapVentaRowToUI)
  },

  async getVentaById(id) {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT_DETAIL)
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? mapVentaRowToUI(data) : null
  },

  // Multi-producto: usa RPC fn_registrar_venta (1 tx: ventas + venta_items + kardex)
  // ventaPayload = { venta: {...master}, items: [{ equipo_id, cantidad, precio_unitario }, ...] }
  async addVenta({ venta, items }) {
    const { data: ventaId, error } = await supabase.rpc('fn_registrar_venta', {
      p_venta: {
        cliente_id:  venta.cliente_id  ?? null,
        almacen_id:  venta.almacen_id  ?? null,
        vendido_por: venta.usuario_id  ?? venta.vendido_por ?? null,
        fecha:       venta.fecha       ?? null,
        notas:       venta.descripcion ?? venta.notas ?? null,
      },
      p_items: items.map((it) => ({
        equipo_id:       it.equipo_id,
        cantidad:        it.cantidad,
        precio_unitario: it.precio_unitario ?? it.precio_venta,
      })),
    })
    if (error) throw error

    const { data: full, error: selErr } = await supabase
      .from('ventas')
      .select(VENTA_SELECT_BASE)
      .eq('id', ventaId)
      .single()
    if (selErr) throw selErr
    return full ? mapVentaRowToUI(full) : null
  },

  async updateVenta(id, ventaData) {
    const { data, error } = await supabase
      .from('ventas')
      .update(mapUIDataToUpdate(ventaData))
      .eq('id', id)
      .select(VENTA_SELECT_BASE)
      .single()

    if (error) throw error
    return data ? mapVentaRowToUI(data) : null
  },

  async deleteVenta(id) {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // NOTA: la tabla `ventas` no tiene columna `active`. No-op hasta definir estrategia de status.
  async updateVentaStatus(_id, _active) {
    return
  },

  async getVentasFiltered(filters = {}) {
    let query = supabase.from('ventas').select(VENTA_SELECT_BASE)

    if (filters.equipoId) {
      query = query.eq('equipo_id', filters.equipoId)
    }

    if (filters.usuarioId) {
      query = query.eq('vendido_por', filters.usuarioId)
    }

    if (filters.startDate && filters.endDate) {
      query = query
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapVentaRowToUI)
  },

  async getVentasTotals() {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, cantidad')

    if (error) throw error
    return (data || []).map((row) => ({ ...row, monto_total: row.total }))
  },
}
