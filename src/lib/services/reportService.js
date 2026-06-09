import { supabase } from '../supabase'

export const reportService = {
  // Obtener datos de ventas por fecha para gráfico
  async getSalesByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('ventas')
      .select('monto_total, cantidad, created_at')
      .eq('active', true)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Obtener top 5 productos más vendidos
  async getTopSellingProducts(limit = 5) {
    const { data, error } = await supabase
      .from('ventas')
      .select('equipo_id, cantidad, equipos(id, nombre, tipo, imagen_url)')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Agrupar por equipo y sumar cantidades
    const grouped = {}
    if (data) {
      data.forEach(venta => {
        if (venta.equipo_id) {
          if (!grouped[venta.equipo_id]) {
            grouped[venta.equipo_id] = {
              equipo_id: venta.equipo_id,
              nombre: venta.equipos?.nombre,
              tipo: venta.equipos?.tipo,
              imagen_url: venta.equipos?.imagen_url,
              total_cantidad: 0,
              total_ventas: 0,
            }
          }
          grouped[venta.equipo_id].total_cantidad += venta.cantidad || 0
          grouped[venta.equipo_id].total_ventas += 1
        }
      })
    }

    return Object.values(grouped).sort((a, b) => b.total_cantidad - a.total_cantidad).slice(0, limit)
  },

  // Obtener top 5 productos con bajo stock
  async getLowStockProducts(threshold = 10, limit = 5) {
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre, tipo, stock, imagen_url, precio_venta')
      .eq('active', true)
      .lte('stock', threshold)
      .order('stock', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // Obtener estadísticas generales de ventas
  async getSalesStatistics() {
    const { data: salesData, error: salesError } = await supabase
      .from('ventas')
      .select('monto_total, cantidad, created_at')
      .eq('active', true)

    if (salesError) throw salesError

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('equipos')
      .select('stock, precio_venta')
      .eq('active', true)

    if (inventoryError) throw inventoryError

    // Calcular estadísticas
    const totalVentas = salesData?.length || 0
    const totalMontoVentas = salesData?.reduce((sum, v) => sum + (v.monto_total || 0), 0) || 0
    const totalCantidad = salesData?.reduce((sum, v) => sum + (v.cantidad || 0), 0) || 0
    const promedioVenta = totalVentas > 0 ? (totalMontoVentas / totalVentas) : 0

    const totalInventarioValue = inventoryData?.reduce((sum, e) => sum + ((e.stock || 0) * (e.precio_venta || 0)), 0) || 0
    const totalStock = inventoryData?.reduce((sum, e) => sum + (e.stock || 0), 0) || 0

    return {
      totalVentas,
      totalMontoVentas,
      totalCantidad,
      promedioVenta,
      totalInventarioValue,
      totalStock,
    }
  },

  // Obtener datos para gráfico de categorías (pie/donut)
  async getCategoriesBreakdown() {
    const { data, error } = await supabase
      .from('ventas')
      .select('monto_total, equipos(tipo)')
      .eq('active', true)

    if (error) throw error

    // Agrupar por categoría
    const grouped = {}
    if (data) {
      data.forEach(venta => {
        const categoria = venta.equipos?.tipo || 'Sin categoría'
        if (!grouped[categoria]) {
          grouped[categoria] = 0
        }
        grouped[categoria] += venta.monto_total || 0
      })
    }

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  },

  // Obtener datos para gráfico de estados de inventario
  async getInventoryStatusBreakdown() {
    const { data, error } = await supabase
      .from('equipos')
      .select('estado, stock')
      .eq('active', true)

    if (error) throw error

    // Contar por estado
    const grouped = {}
    if (data) {
      data.forEach(equipo => {
        const estado = equipo.estado || 'Sin especificar'
        if (!grouped[estado]) {
          grouped[estado] = 0
        }
        grouped[estado] += 1
      })
    }

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  },

  // Obtener datos por mes para gráfico de área
  async getMonthlySalesData(months = 12) {
    const { data, error } = await supabase
      .from('ventas')
      .select('monto_total, cantidad, created_at')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Agrupar por mes
    const monthlyData = {}
    const now = new Date()

    // Inicializar últimos X meses
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleString('es-MX', { month: 'short', year: 'numeric' })
      monthlyData[monthKey] = { ventas: 0, monto: 0, mes: monthKey }
    }

    // Agregar datos
    if (data) {
      data.forEach(venta => {
        const date = new Date(venta.created_at)
        const monthKey = date.toLocaleString('es-MX', { month: 'short', year: 'numeric' })
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].ventas += 1
          monthlyData[monthKey].monto += venta.monto_total || 0
        }
      })
    }

    return Object.values(monthlyData)
  },
}
