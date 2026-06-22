import { supabase } from '../supabase'

const COLUMNS = 'id, nombre, direccion, responsable_id, active, created_at, updated_at'
const SELECT_WITH_RESPONSABLE = `${COLUMNS}, perfiles:responsable_id(id, nombre, email)`

export const fetchAlmacenes = async ({
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
} = {}) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('almacenes')
    .select(SELECT_WITH_RESPONSABLE, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(`nombre.ilike.${term},direccion.ilike.${term}`)
  }
  if (status === 'active')   query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data || [], total: count ?? (data?.length ?? 0) }
}

export const fetchAlmacenesActivos = async () => {
  const { data, error } = await supabase
    .from('almacenes')
    .select('id, nombre')
    .eq('active', true)
    .order('nombre')
  if (error) throw new Error(error.message)
  return data || []
}

export const fetchPerfilesActivos = async () => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, email')
    .eq('active', true)
    .order('nombre')
  if (error) throw new Error(error.message)
  return data || []
}

const sanitize = (payload) => {
  const out = {}
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string') {
      const trimmed = v.trim()
      out[k] = trimmed === '' ? null : trimmed
    } else {
      out[k] = v
    }
  }
  return out
}

export const crearAlmacen = async (payload) => {
  const clean = sanitize(payload)
  if (!clean.nombre) throw new Error('El nombre es requerido')

  const { data, error } = await supabase
    .from('almacenes')
    .insert([clean])
    .select(SELECT_WITH_RESPONSABLE)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const actualizarAlmacen = async ({ id, ...rest }) => {
  if (!id) throw new Error('id requerido')
  const clean = sanitize(rest)

  const { data, error } = await supabase
    .from('almacenes')
    .update(clean)
    .eq('id', id)
    .select(SELECT_WITH_RESPONSABLE)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const desactivarAlmacen = async (id) => {
  const { error } = await supabase
    .from('almacenes')
    .update({ active: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export const reactivarAlmacen = async (id) => {
  const { error } = await supabase
    .from('almacenes')
    .update({ active: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export const almacenService = {
  fetchAlmacenes,
  fetchAlmacenesActivos,
  fetchPerfilesActivos,
  crearAlmacen,
  actualizarAlmacen,
  desactivarAlmacen,
  reactivarAlmacen,
}
