import { supabase } from '../supabase'

// ─────────────────────────────────────────────────────────────────────────
// NOTAS SOBRE LA TABLA `ventas`
// ─────────────────────────────────────────────────────────────────────────
// - NO existe columna `active` (la tabla no soporta soft delete actualmente)
// - El total se llama `total`, no `monto_total`
// - El precio unitario se llama `precio_venta`, no `precio_unitario`
// - El vendedor se llama `vendido_por`, no `usuario_id`
// - Embedded resources `equipos:equipo_id(...)` fallan con PRO FEATURE ONLY,
//   por eso resolvemos equipos con un batch query separado.
//
// `equipos` SÍ tiene columna `active`, esa parte se mantiene.
// ─────────────────────────────────────────────────────────────────────────

// Devuelve { id → { id, nombre, tipo, imagen_url } } para los equipo_ids dados
async function fetchEquiposMap(equipoIds, fields = 'id, nombre, tipo, imagen_url') {
  const ids = [...new Set(equipoIds.filter(Boolean))]
  if (ids.length === 0) return new Map()

  const { data, error } = await supabase
    .from('equipos')
    .select(fields)
    .in('id', ids)

  if (error) return new Map()
  return new Map((data || []).map((e) => [e.id, e]))
}

// `total` viene como string desde numeric; parsear seguro
const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const reportService = {
  // Ventas en un rango de fechas (para gráfico de líneas)
  async getSalesByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, cantidad, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []).map((v) => ({
      ...v,
      monto_total: toNumber(v.total), // alias compat
    }))
  },

  // Top N productos más vendidos
  async getTopSellingProducts(limit = 5) {
    const { data, error } = await supabase
      .from('ventas')
      .select('equipo_id, cantidad')
      .order('created_at', { ascending: false })

    if (error) throw error

    const ventas = data || []
    const equiposMap = await fetchEquiposMap(ventas.map((v) => v.equipo_id))

    const grouped = {}
    ventas.forEach((venta) => {
      if (!venta.equipo_id) return
      if (!grouped[venta.equipo_id]) {
        const eq = equiposMap.get(venta.equipo_id) || {}
        grouped[venta.equipo_id] = {
          equipo_id:      venta.equipo_id,
          nombre:         eq.nombre,
          tipo:           eq.tipo,
          imagen_url:     eq.imagen_url,
          total_cantidad: 0,
          total_ventas:   0,
        }
      }
      grouped[venta.equipo_id].total_cantidad += venta.cantidad || 0
      grouped[venta.equipo_id].total_ventas += 1
    })

    return Object.values(grouped)
      .sort((a, b) => b.total_cantidad - a.total_cantidad)
      .slice(0, limit)
  },

  // Top N productos con bajo stock (equipos sí tiene `active`)
  async getLowStockProducts(threshold = 10, limit = 5) {
    const { data, error } = await supabase
      .from('v_equipos_con_stock')
      .select('id, nombre, tipo, stock_total, imagen_url, precio_venta')
      .eq('active', true)
      .lte('stock_total', threshold)
      .order('stock_total', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // Estadísticas generales para los StatCards
  async getSalesStatistics() {
    const { data: salesData, error: salesError } = await supabase
      .from('ventas')
      .select('total, cantidad, created_at')

    if (salesError) throw salesError

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('v_equipos_con_stock')
      .select('stock_total, precio_venta')
      .eq('active', true)

    if (inventoryError) throw inventoryError

    const totalVentas       = salesData?.length || 0
    const totalMontoVentas  = (salesData || []).reduce((sum, v) => sum + toNumber(v.total), 0)
    const totalCantidad     = (salesData || []).reduce((sum, v) => sum + (v.cantidad || 0), 0)
    const promedioVenta     = totalVentas > 0 ? totalMontoVentas / totalVentas : 0

    const totalInventarioValue = (inventoryData || []).reduce(
      (sum, e) => sum + ((e.stock_total || 0) * toNumber(e.precio_venta)),
      0
    )
    const totalStock = (inventoryData || []).reduce((sum, e) => sum + (e.stock_total || 0), 0)

    return {
      totalVentas,
      totalMontoVentas,
      totalCantidad,
      promedioVenta,
      totalInventarioValue,
      totalStock,
    }
  },

  // Breakdown por categoría (pie/donut)
  async getCategoriesBreakdown() {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, equipo_id')

    if (error) throw error

    const ventas = data || []
    const equiposMap = await fetchEquiposMap(ventas.map((v) => v.equipo_id), 'id, tipo')

    const grouped = {}
    ventas.forEach((venta) => {
      const eq = equiposMap.get(venta.equipo_id)
      const categoria = eq?.tipo || 'Sin categoría'
      if (!grouped[categoria]) grouped[categoria] = 0
      grouped[categoria] += toNumber(venta.total)
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  },

  // Breakdown de estados de inventario
  async getInventoryStatusBreakdown() {
    const { data, error } = await supabase
      .from('equipos')
      .select('estado, stock')
      .eq('active', true)

    if (error) throw error

    const grouped = {}
    ;(data || []).forEach((equipo) => {
      const estado = equipo.estado || 'Sin especificar'
      grouped[estado] = (grouped[estado] || 0) + 1
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  },

  // Datos mensuales para gráfico de área
  async getMonthlySalesData(months = 12) {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, cantidad, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error

    const monthlyData = {}
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleString('es-MX', { month: 'short', year: 'numeric' })
      monthlyData[monthKey] = { ventas: 0, monto: 0, mes: monthKey }
    }

    ;(data || []).forEach((venta) => {
      const date = new Date(venta.created_at)
      const monthKey = date.toLocaleString('es-MX', { month: 'short', year: 'numeric' })
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].ventas += 1
        monthlyData[monthKey].monto += toNumber(venta.total)
      }
    })

    return Object.values(monthlyData)
  },
}
