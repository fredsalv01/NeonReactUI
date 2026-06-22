import { supabase } from '../supabase'

const COLUMNS = 'id, nombre, tipo_doc, nro_doc, razon_social, telefono, email, direccion, notas, active, created_at, updated_at'

export const fetchClientes = async ({
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
} = {}) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('clientes')
    .select(COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(
      `nombre.ilike.${term},nro_doc.ilike.${term},razon_social.ilike.${term},email.ilike.${term},telefono.ilike.${term}`
    )
  }
  if (status === 'active')   query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data || [], total: count ?? (data?.length ?? 0) }
}

export const fetchClienteById = async (id) => {
  const { data, error } = await supabase
    .from('clientes')
    .select(COLUMNS)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
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

export const crearCliente = async (payload) => {
  const clean = sanitize(payload)
  if (!clean.nombre) throw new Error('El nombre es requerido')

  const { data, error } = await supabase
    .from('clientes')
    .insert([clean])
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const actualizarCliente = async ({ id, ...rest }) => {
  if (!id) throw new Error('id requerido')
  const clean = sanitize(rest)

  const { data, error } = await supabase
    .from('clientes')
    .update(clean)
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const desactivarCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .update({ active: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export const reactivarCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .update({ active: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export const clienteService = {
  fetchClientes,
  fetchClienteById,
  crearCliente,
  actualizarCliente,
  desactivarCliente,
  reactivarCliente,
}
