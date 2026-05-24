/**
 * Atom: Badge
 * Indicador visual de estado para equipos.
 */

const VARIANT_MAP = {
  Disponible:    'badge badge-ok',
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
