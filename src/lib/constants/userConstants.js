// ─────────────────────────────────────────────────────────────────
// Roles del sistema (espejo de la tabla `roles` en Supabase)
// IDs deben coincidir con la BD para que rol_id funcione correctamente.
// ─────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMINISTRADOR: { id: 1, nombre: 'Administrador' },
  ALMACEN:       { id: 2, nombre: 'Almacén' },
  VENTAS:        { id: 3, nombre: 'Ventas' },
  TECNICO:       { id: 4, nombre: 'Técnico' },
}

export const ROLE_OPTIONS = Object.values(ROLES).map((r) => ({
  value: r.id,
  label: r.nombre,
}))

// Mapa de colores por nombre de rol (fallback gris para roles desconocidos)
export const ROLE_COLORS = {
  Administrador: { bg: 'rgba(239, 68, 68, 0.12)',  fg: '#ef4444', border: '#ef444433' },
  'Almacén':     { bg: 'rgba(14, 165, 233, 0.12)', fg: '#0ea5e9', border: '#0ea5e933' },
  Ventas:        { bg: 'rgba(0, 201, 167, 0.12)',  fg: '#00c9a7', border: '#00c9a733' },
  'Técnico':     { bg: 'rgba(245, 158, 11, 0.12)', fg: '#f59e0b', border: '#f59e0b33' },
}

export const DEFAULT_ROLE_COLOR = {
  bg: 'rgba(148, 163, 184, 0.12)',
  fg: '#94a3b8',
  border: '#94a3b833',
}

export const USUARIO_STATUS = {
  ALL:      'all',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
}

export const USUARIO_STATUS_OPTIONS = [
  { value: USUARIO_STATUS.ALL,      label: 'Todos' },
  { value: USUARIO_STATUS.ACTIVE,   label: 'Activos' },
  { value: USUARIO_STATUS.INACTIVE, label: 'Inactivos' },
]

// ─────────────────────────────────────────────────────────────────
// Validación de contraseña
// ─────────────────────────────────────────────────────────────────
export const PASSWORD_MIN_LENGTH = 8

export const passwordChecks = (password = '') => ({
  length:    password.length >= PASSWORD_MIN_LENGTH,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number:    /\d/.test(password),
  symbol:    /[^A-Za-z0-9]/.test(password),
})

// Devuelve { score: 0-4, label, color }
export const passwordStrength = (password = '') => {
  if (!password) return { score: 0, label: 'Sin definir', color: '#94a3b8' }
  const c = passwordChecks(password)
  const score = [c.length, c.lowercase, c.uppercase, c.number, c.symbol].filter(Boolean).length

  // Escala: 0/1 = muy débil, 2 = débil, 3 = media, 4 = fuerte, 5 = muy fuerte
  if (score <= 1) return { score: 1, label: 'Muy débil', color: '#ef4444' }
  if (score === 2) return { score: 2, label: 'Débil',     color: '#f97316' }
  if (score === 3) return { score: 3, label: 'Media',     color: '#f59e0b' }
  if (score === 4) return { score: 4, label: 'Fuerte',    color: '#10b981' }
  return                  { score: 5, label: 'Muy fuerte',color: '#00c9a7' }
}

// Genera password aleatorio de 16 caracteres con todos los grupos
export const generateSecurePassword = (length = 16) => {
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const numbers   = '23456789'
  const symbols   = '!@#$%&*?_-+'
  const all       = lowercase + uppercase + numbers + symbols

  // Garantiza al menos 1 de cada grupo
  const required = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  const remaining = Array.from(
    { length: Math.max(0, length - required.length) },
    () => all[Math.floor(Math.random() * all.length)]
  )

  // Shuffle Fisher-Yates
  const chars = [...required, ...remaining]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
