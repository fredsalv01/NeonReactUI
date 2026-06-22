import { supabase } from '../supabase'

const COMPRA_SELECT = `
  id, fecha, total, notas, created_at, updated_at,
  proveedor_id, almacen_id, usuario_id,
  proveedores:proveedor_id(id, nombre, ruc),
  almacenes:almacen_id(id, nombre),
  perfiles:usuario_id(id, nombre, email)
`

const ITEM_SELECT = `
  id, compra_id, equipo_id, cantidad, precio_unitario, subtotal, created_at,
  equipos:equipo_id(id, nombre, tipo)
`

export const fetchCompras = async ({
  page = 1,
  pageSize = 10,
  proveedorId = null,
  almacenId = null,
  startDate = null,
  endDate = null,
} = {}) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('compras')
    .select(COMPRA_SELECT, { count: 'exact' })
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (proveedorId) query = query.eq('proveedor_id', proveedorId)
  if (almacenId)   query = query.eq('almacen_id', almacenId)
  if (startDate)   query = query.gte('fecha', startDate)
  if (endDate)     query = query.lte('fecha', endDate)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data || [], total: count ?? (data?.length ?? 0) }
}

export const fetchCompraById = async (id) => {
  const { data, error } = await supabase
    .from('compras')
    .select(COMPRA_SELECT)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const fetchCompraItems = async (compraId) => {
  const { data, error } = await supabase
    .from('compra_items')
    .select(ITEM_SELECT)
    .eq('compra_id', compraId)
    .order('created_at')
  if (error) throw new Error(error.message)
  return data || []
}

// Crea la compra cabecera + sus items.
// El trigger en BD recalcula compras.total y actualiza stock + kardex automáticamente.
export const crearCompra = async ({ proveedor_id, almacen_id, fecha, notas, items }) => {
  if (!almacen_id) throw new Error('Almacén requerido')
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('La compra debe tener al menos un item')
  }

  // Validar items antes de tocar la BD
  for (const item of items) {
    if (!item.equipo_id) throw new Error('Cada item necesita un equipo')
    if (!Number.isFinite(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
      throw new Error('Cada item necesita una cantidad > 0')
    }
    if (!Number.isFinite(Number(item.precio_unitario)) || Number(item.precio_unitario) < 0) {
      throw new Error('Cada item necesita un precio unitario >= 0')
    }
  }

  // 1) Insertar cabecera (usuario_id se setea con la sesión activa)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: compra, error: errCompra } = await supabase
    .from('compras')
    .insert([{
      proveedor_id: proveedor_id || null,
      almacen_id,
      fecha: fecha || new Date().toISOString().slice(0, 10),
      notas: notas?.trim() || null,
      usuario_id: user?.id || null,
    }])
    .select(COMPRA_SELECT)
    .single()

  if (errCompra) throw new Error(errCompra.message)

  // 2) Insertar items (un solo round-trip; el trigger se dispara por fila)
  const itemsPayload = items.map((it) => ({
    compra_id: compra.id,
    equipo_id: it.equipo_id,
    cantidad: Number(it.cantidad),
    precio_unitario: Number(it.precio_unitario),
  }))

  const { error: errItems } = await supabase
    .from('compra_items')
    .insert(itemsPayload)

  if (errItems) {
    // Si falla la inserción de items, hacer cleanup del header para no dejar compras vacías
    await supabase.from('compras').delete().eq('id', compra.id)
    throw new Error(errItems.message)
  }

  // 3) Releer la compra para obtener el total recalculado por el trigger
  return await fetchCompraById(compra.id)
}

export const compraService = {
  fetchCompras,
  fetchCompraById,
  fetchCompraItems,
  crearCompra,
}
