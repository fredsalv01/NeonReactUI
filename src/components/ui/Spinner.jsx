/**
 * Atom: Spinner
 * Indicador de carga circular con variantes de tamaño.
 */

/**
 * @param {{ size?: number, color?: string, thickness?: number }} props
 */
const Spinner = ({ size = 14, color = '#00C9A7', thickness = 2 }) => (
  <span
    style={{
      width:            size,
      height:           size,
      border:           `${thickness}px solid ${color}30`,
      borderTopColor:   color,
      borderRadius:     '50%',
      display:          'inline-block',
      flexShrink:       0,
      animation:        'spin .65s linear infinite',
    }}
  />
)

export default Spinner
