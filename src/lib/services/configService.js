import { supabase } from '../supabase'

// ponytail: cache a nivel de módulo. config cambia muy rara vez,
// no necesita React Query.
let cache = null
let pending = null

const loadFresh = async () => {
  const { data, error } = await supabase
    .from('config')
    .select('clave, valor, descripcion')
    .order('clave')
  if (error) throw new Error(error.message)
  const map = {}
  for (const row of data || []) map[row.clave] = row.valor ?? ''
  cache = { map, rows: data || [] }
  return cache
}

export const configService = {
  // Devuelve { map: {clave: valor}, rows: [{clave, valor, descripcion}] }
  async getAll(force = false) {
    if (cache && !force) return cache
    if (pending) return pending
    pending = loadFresh().finally(() => { pending = null })
    return pending
  },

  // updates: { clave1: valor1, clave2: valor2, ... }
  async setMany(updates) {
    const entries = Object.entries(updates)
    if (entries.length === 0) return cache
    const rows = entries.map(([clave, valor]) => ({
      clave,
      valor: valor === '' || valor == null ? null : String(valor),
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('config')
      .upsert(rows, { onConflict: 'clave' })
    if (error) throw new Error(error.message)
    cache = null
    return configService.getAll(true)
  },
}
