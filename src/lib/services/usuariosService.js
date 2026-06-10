import { supabase } from '../supabase'

// ─────────────────────────────────────────────────────────────────────────
// SQL ADICIONAL REQUERIDO EN SUPABASE
// ─────────────────────────────────────────────────────────────────────────
// `fn_crear_usuario` ya está creado (lo compartió el usuario).
//
// Para cambiar contraseña desde el cliente, agregar esta RPC en Supabase
// → SQL Editor (sigue el mismo patrón SECURITY DEFINER):
//
//   CREATE OR REPLACE FUNCTION public.fn_cambiar_password(
//     p_user_id uuid,
//     p_password text
//   )
//   RETURNS void
//   LANGUAGE plpgsql
//   SECURITY DEFINER
//   SET search_path = public
//   AS $$
//   BEGIN
//     UPDATE auth.users
//        SET encrypted_password = crypt(p_password, gen_salt('bf')),
//            updated_at = now()
//      WHERE id = p_user_id;
//   END;
//   $$;
//
//   GRANT EXECUTE ON FUNCTION public.fn_cambiar_password TO authenticated;
//
// IMPORTANTE: restringir con RLS o checking dentro de la función para
// que solo Administradores puedan llamarla. Ejemplo:
//
//   IF NOT EXISTS (
//     SELECT 1 FROM public.perfiles p
//      JOIN public.roles r ON r.id = p.rol_id
//     WHERE p.id = auth.uid() AND r.nombre = 'Administrador'
//   ) THEN
//     RAISE EXCEPTION 'No autorizado';
//   END IF;
// ─────────────────────────────────────────────────────────────────────────

// Lista todos los roles disponibles
export const fetchRoles = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('id, nombre, descripcion')
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// Lista usuarios con paginación / búsqueda / filtro por rol / estado.
// Devuelve { data: [...], total: N } para usar con paginación.
export const fetchUsuarios = async ({
  page = 1,
  pageSize = 10,
  search = '',
  rolId = null,
  status = 'all', // 'all' | 'active' | 'inactive'
} = {}) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('perfiles')
    .select('id, nombre, email, rol_id, active, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(`nombre.ilike.${term},email.ilike.${term}`)
  }
  if (rolId) query = query.eq('rol_id', rolId)
  if (status === 'active') query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  const enriched = await attachRoles(data || [])
  return { data: enriched, total: count ?? enriched.length }
}

// Trae un único usuario con su rol embebido
export const fetchUsuarioById = async (id) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, email, rol_id, active, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  const [enriched] = await attachRoles(data ? [data] : [])
  return enriched || null
}

// Crea usuario via RPC (no afecta sesión del admin que está creando)
export const crearUsuario = async ({ nombre, email, password, rol_id }) => {
  const { data, error } = await supabase.rpc('fn_crear_usuario', {
    p_email:    email,
    p_password: password,
    p_nombre:   nombre,
    p_rol_id:   rol_id,
  })
  if (error) throw new Error(error.message)
  return await fetchUsuarioById(data.id)
}

// Actualiza datos de perfil (nombre, rol). Email no se cambia desde aquí
// porque está atado a auth.users (requeriría otra RPC).
export const actualizarUsuario = async ({ id, nombre, rol_id }) => {
  const updates = { updated_at: new Date().toISOString() }
  if (nombre !== undefined) updates.nombre = nombre
  if (rol_id !== undefined) updates.rol_id = rol_id

  const { error } = await supabase
    .from('perfiles')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  return await fetchUsuarioById(id)
}

// Cambio de contraseña via RPC (ver SQL al inicio del archivo)
export const cambiarPassword = async ({ id, password }) => {
  const { error } = await supabase.rpc('fn_cambiar_password', {
    p_user_id:  id,
    p_password: password,
  })
  if (error) throw new Error(error.message)
}

export const desactivarUsuario = async (id) => {
  const { error } = await supabase
    .from('perfiles')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export const reactivarUsuario = async (id) => {
  const { error } = await supabase
    .from('perfiles')
    .update({ active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────────────────────────────────
// Helper: enriquece filas de perfiles con info del rol.
// Hace lookup en batch (un único query con .in()) en vez de N+1.
// ─────────────────────────────────────────────────────────────────────────
async function attachRoles(perfiles) {
  if (!Array.isArray(perfiles) || perfiles.length === 0) return perfiles || []

  const rolIds = [...new Set(perfiles.map((p) => p?.rol_id).filter(Boolean))]
  if (rolIds.length === 0) {
    return perfiles.map((p) => ({ ...p, roles: null }))
  }

  const { data: roles, error } = await supabase
    .from('roles')
    .select('id, nombre, descripcion')
    .in('id', rolIds)

  // Si falla el lookup de roles, devolvemos perfiles sin roles en vez de tumbar todo
  if (error) {
    return perfiles.map((p) => ({ ...p, roles: null }))
  }

  const rolesMap = new Map(roles.map((r) => [r.id, r]))
  return perfiles.map((p) => ({ ...p, roles: rolesMap.get(p.rol_id) || null }))
}

// Re-exportamos como objeto para mantener consistencia con otros services
export const usuariosService = {
  fetchRoles,
  fetchUsuarios,
  fetchUsuarioById,
  crearUsuario,
  actualizarUsuario,
  cambiarPassword,
  desactivarUsuario,
  reactivarUsuario,
}
