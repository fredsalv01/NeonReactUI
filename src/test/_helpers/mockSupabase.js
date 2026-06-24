import { vi } from 'vitest'

// Cadena de query mockeable. Todas las llamadas de filtrado devuelven `this`
// para encadenarse. Al hacer `await query` o `.single()`/`.maybeSingle()`
// resuelve con el `result` configurado.
//
// Uso:
//   const q = makeQuery({ data: [{id:1}], error: null, count: 1 })
//   supabase.from.mockReturnValue(q)
//
// ponytail: añade más métodos cuando algún service los use; hoy cubre todo lo
// que los services tienen.
const CHAIN_METHODS = [
  'select', 'insert', 'update', 'upsert', 'delete',
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
  'in', 'or', 'ilike', 'like', 'match', 'is',
  'order', 'range', 'limit',
]

export const makeQuery = (result = { data: null, error: null, count: null }) => {
  const q = {}
  for (const m of CHAIN_METHODS) q[m] = vi.fn(() => q)
  q.single = vi.fn(() => Promise.resolve(result))
  q.maybeSingle = vi.fn(() => Promise.resolve(result))
  // Thenable: permite `await supabase.from(...).select(...).eq(...)` sin .single()
  q.then = (onF, onR) => Promise.resolve(result).then(onF, onR)
  return q
}

// Factory de cliente supabase mockeado completo.
// Pasar map { table → result } para configurar la respuesta por tabla.
//   const sb = mockClient({ equipos: { data: [], error: null } })
export const mockClient = (tableResults = {}) => {
  const queries = {}
  for (const [table, result] of Object.entries(tableResults)) {
    queries[table] = makeQuery(result)
  }
  return {
    from: vi.fn((table) => {
      if (!queries[table]) queries[table] = makeQuery()
      return queries[table]
    }),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: null } })) },
    _queries: queries,
  }
}
