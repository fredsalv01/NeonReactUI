/**
 * Atom: Badge
 * Indicador visual de estado para equipos.
 */

const VARIANT_MAP = {
  // Stock-derived states (current)
  Disponible:    'badge badge-ok',
  'Stock Medio': 'badge badge-warn',
  'Stock Bajo':  'badge badge-err',
  'Sin Stock':   'badge badge-muted',
  // Legacy equipment states (still emitted by Add/Edit forms)
  'En uso':      'badge badge-warn',
  Mantenimiento: 'badge badge-err',
  Baja:          'badge badge-muted',
}

/**
 * @param {{ estado: string }} props
 */
const Badge = ({ estado }) => (
  <span className={VARIANT_MAP[estado] ?? 'badge badge-muted'}>
    ● {estado}
  </span>
)

export default Badge
