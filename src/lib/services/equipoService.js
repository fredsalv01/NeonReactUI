import { supabase } from '../supabase'
import { kardexService } from './kardexService'

// Lectura: usa la vista v_equipos_con_stock que expone:
//   equipos.* + stock_total + stock_por_almacen (jsonb) + vendidos_total
const VIEW = 'v_equipos_con_stock'
const TABLE = 'equipos'

export const equipoService = {
  async getEquipos() {
    const { data, error } = await supabase
      .from(VIEW)
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getEquipoById(id) {
    const { data, error } = await supabase
      .from(VIEW)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea el equipo (sin stock como columna). Si equipoData.stock > 0,
  // dispara entrada inicial al almacén Principal vía fn_entrada_stock.
  async addEquipo(equipoData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        nombre: equipoData.nombre,
        tipo: equipoData.tipo,
        serie: equipoData.serie,
        precio_compra: equipoData.precio_compra,
        precio_venta: equipoData.precio_venta,
        imagen_url: equipoData.imagen_url,
        active: true,
      }])
      .select('id')

    if (error) throw error
    const created = data?.[0]
    if (!created) return null

    const stockInicial = Number(equipoData.stock || 0)
    if (stockInicial > 0) {
      try {
        await kardexService.entradaStock({
          equipo_id: created.id,
          cantidad: stockInicial,
          motivo: `Entrada inicial de ${equipoData.nombre}`,
        })
      } catch (err) {
        console.error('Error registrando entrada inicial de stock:', err)
      }
    }

    return await equipoService.getEquipoById(created.id)
  },

  async updateEquipo(id, equipoData) {
    const updateObj = { updated_at: new Date().toISOString() }
    if (equipoData.nombre !== undefined)        updateObj.nombre = equipoData.nombre
    if (equipoData.tipo !== undefined)          updateObj.tipo = equipoData.tipo
    if (equipoData.serie !== undefined)         updateObj.serie = equipoData.serie
    if (equipoData.precio_compra !== undefined) updateObj.precio_compra = equipoData.precio_compra
    if (equipoData.precio_venta !== undefined)  updateObj.precio_venta = equipoData.precio_venta
    if (equipoData.imagen_url !== undefined)    updateObj.imagen_url = equipoData.imagen_url

    const { error } = await supabase
      .from(TABLE)
      .update(updateObj)
      .eq('id', id)

    if (error) throw error
    return await equipoService.getEquipoById(id)
  },

  async deleteEquipo(id) {
    const { error } = await supabase
      .from(TABLE)
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async updateEquipoStatus(id, active) {
    const { error } = await supabase
      .from(TABLE)
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async checkSerieUnique(serie, excludeId = null) {
    let query = supabase
      .from(TABLE)
      .select('id')
      .eq('serie', serie)
      .eq('active', true)

    if (excludeId) query = query.neq('id', excludeId)

    const { data, error } = await query
    if (error) throw error
    return data.length === 0
  },
}
