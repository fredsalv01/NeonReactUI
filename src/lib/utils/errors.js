// ─────────────────────────────────────────────────────────────
// humanizeError: traduce errores crudos de Supabase / Postgres
// a mensajes accionables sin filtrar estructura interna (nombres
// de columna, constraints, esquemas).
//
// El error.message original siempre va a console.error para
// debugging — nunca al usuario.
// ─────────────────────────────────────────────────────────────

// Códigos de Postgres más comunes (https://www.postgresql.org/docs/current/errcodes-appendix.html)
const PG_CODES = {
  '23505': 'Ya existe un registro con esos datos',
  '23503': 'No se puede completar: hay datos relacionados',
  '23502': 'Faltan campos obligatorios',
  '23514': 'Los datos no cumplen las reglas del sistema',
  '42501': 'No tienes permiso para esta operación',
  '22P02': 'Formato de dato inválido',
  '40001': 'Operación cancelada por conflicto, intenta de nuevo',
  'PGRST301': 'Sesión expirada, inicia sesión otra vez',
}

// Mensajes típicos de Supabase Auth (en inglés desde su API)
const AUTH_HINTS = [
  { match: /invalid login credentials/i,            user: 'Correo o contraseña incorrectos' },
  { match: /email not confirmed/i,                  user: 'Confirma tu correo antes de iniciar sesión' },
  { match: /user already registered/i,              user: 'Este correo ya está registrado' },
  { match: /password should be at least/i,          user: 'La contraseña no cumple los requisitos mínimos' },
  { match: /rate limit/i,                           user: 'Demasiados intentos, espera unos minutos' },
  { match: /jwt expired|invalid jwt/i,              user: 'Sesión expirada, inicia sesión otra vez' },
  { match: /network|fetch failed|failed to fetch/i, user: 'No se pudo conectar con el servidor' },
]

export function humanizeError(err, fallback = 'Operación fallida') {
  if (!err) return fallback

  // Siempre loguea el original para debugging
  // eslint-disable-next-line no-console
  console.error('[humanizeError]', err)

  // Postgres devuelve { code, message, details, hint }
  if (err.code && PG_CODES[err.code]) return PG_CODES[err.code]

  const msg = err.message || err.error_description || String(err)
  for (const { match, user } of AUTH_HINTS) {
    if (match.test(msg)) return user
  }

  // ponytail: mensajes cortos sin signos típicos de stack los dejamos pasar
  // tal cual (validaciones de Zod, mensajes de servicios). Si es ruidoso o
  // contiene nombres de tabla/columna, devuelve el fallback genérico.
  if (msg.length < 120 && !/relation|column|constraint|"\w+"/i.test(msg)) {
    return msg
  }
  return fallback
}
