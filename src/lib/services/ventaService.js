import { supabase } from '../supabase'

// Los productos viven en venta_items; la venta es solo la cabecera.
const VENTA_SELECT = `
  *,
  perfiles(id, nombre, email),
  venta_items(id, equipo_id, cantidad, precio_unitario, subtotal, equipos(id, nombre, tipo, imagen_url))
`

// MAPEO BD ↔ UI:
//   total       → monto_total | notas → descripcion
//   vendido_por → usuario_id
function mapVentaRowToUI(venta) {
  if (!venta) return venta
  return {
    ...venta,
    monto_total: venta.total,
    usuario_id: venta.vendido_por,
    descripcion: venta.notas,
  }
}

// Solo cabecera: los ítems no se editan (tocarían kardex/stock).
// `total` lo recalcula el trigger desde venta_items.
function mapUIDataToUpdate(ventaData) {
  const obj = {}
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
      .select(VENTA_SELECT)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapVentaRowToUI)
  },

  async getVentaById(id) {
    const { data, error } = await supabase
      .from('ventas')
      .select(VENTA_SELECT)
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
      .select(VENTA_SELECT)
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
      .select(VENTA_SELECT)
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
}
