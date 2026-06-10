import { supabase } from '../supabase'

const EQUIPO_FIELDS_BASE = 'id, nombre, tipo, imagen_url, precio_venta'
const EQUIPO_FIELDS_DETAIL = 'id, nombre, tipo, imagen_url, precio_venta, serie, estado'

// ─────────────────────────────────────────────────────────────────────────
// MAPEO DE NOMBRES BD ↔ UI
// ─────────────────────────────────────────────────────────────────────────
// La tabla `ventas` en Supabase usa nombres distintos a los que asumen los
// componentes existentes. Este service traduce en ambos sentidos para que
// la UI no tenga que cambiar nada.
//
//   BD               UI / Componente
//   precio_venta  →  precio_unitario
//   total         →  monto_total
//   vendido_por   →  usuario_id
//   notas         →  descripcion
//
// equipo_id en `ventas` es un string tipo "EQ-002" que coincide con
// `equipos.id` (también código). El lookup se hace por igualdad de id.
// ─────────────────────────────────────────────────────────────────────────

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
    total: ventaData.monto_total ?? ventaData.total,
    notas: ventaData.descripcion ?? ventaData.notas ?? null,
    vendido_por: ventaData.usuario_id ?? ventaData.vendido_por,
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
  if (ventaData.monto_total !== undefined) obj.total = ventaData.monto_total
  if (ventaData.total !== undefined) obj.total = ventaData.total
  if (ventaData.descripcion !== undefined) obj.notas = ventaData.descripcion
  if (ventaData.notas !== undefined) obj.notas = ventaData.notas
  if (ventaData.cliente !== undefined) obj.cliente = ventaData.cliente
  if (ventaData.cliente_tipo_doc !== undefined) obj.cliente_tipo_doc = ventaData.cliente_tipo_doc
  if (ventaData.cliente_nro_doc !== undefined) obj.cliente_nro_doc = ventaData.cliente_nro_doc
  if (ventaData.cliente_telefono !== undefined) obj.cliente_telefono = ventaData.cliente_telefono
  if (ventaData.cliente_email !== undefined) obj.cliente_email = ventaData.cliente_email
  return obj
}

// Resuelve equipos y perfiles en paralelo, con Promise.allSettled
// para que un id inexistente no tumbe las demás filas.
async function enrichVentas(ventas, equipoFields = EQUIPO_FIELDS_BASE) {
  if (!Array.isArray(ventas) || ventas.length === 0) return ventas || []

  const [equiposResults, perfilesResults] = await Promise.all([
    Promise.allSettled(
      ventas.map(async (venta) => {
        if (!venta?.equipo_id) return null
        const { data } = await supabase
          .from('equipos')
          .select(equipoFields)
          .eq('id', venta.equipo_id)
          .single()
        return data || null
      })
    ),
    Promise.allSettled(
      ventas.map(async (venta) => {
        if (!venta?.vendido_por) return null
        const { data } = await supabase
          .from('perfiles')
          .select('id, nombre, email')
          .eq('id', venta.vendido_por)
          .single()
        return data || null
      })
    ),
  ])

  return ventas.map((venta, index) =>
    mapVentaRowToUI({
      ...venta,
      equipos:
        equiposResults[index].status === 'fulfilled'
          ? equiposResults[index].value
          : null,
      perfiles:
        perfilesResults[index].status === 'fulfilled'
          ? perfilesResults[index].value
          : null,
    })
  )
}

export const ventaService = {
  async getVentas() {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return await enrichVentas(data || [])
  },

  async getVentaById(id) {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    const [enriched] = await enrichVentas(data ? [data] : [], EQUIPO_FIELDS_DETAIL)
    return enriched || null
  },

  async addVenta(ventaData) {
    const { data, error } = await supabase
      .from('ventas')
      .insert([mapUIDataToInsert(ventaData)])
      .select('*')

    if (error) throw error
    const enriched = await enrichVentas(data || [])
    return enriched?.[0] || null
  },

  async updateVenta(id, ventaData) {
    const { data, error } = await supabase
      .from('ventas')
      .update(mapUIDataToUpdate(ventaData))
      .eq('id', id)
      .select('*')

    if (error) throw error
    const enriched = await enrichVentas(data || [])
    return enriched?.[0] || null
  },

  async deleteVenta(id) {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // NOTA: la tabla `ventas` no tiene columna `active`. Este método queda
  // como no-op para no romper a salesStore.updateVentaStatus hasta que se
  // defina la estrategia de status.
  async updateVentaStatus(_id, _active) {
    return
  },

  async getVentasFiltered(filters = {}) {
    let query = supabase.from('ventas').select('*')

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
    return await enrichVentas(data || [])
  },

  async getVentasTotals() {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, cantidad')

    if (error) throw error
    // monto_total = alias hacia la UI
    return (data || []).map((row) => ({ ...row, monto_total: row.total }))
  },
}
