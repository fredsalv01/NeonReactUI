/**
 * Atom: Button
 * Botón reutilizable con variantes: primary | ghost | danger
 * FIX: spread de ...rest para pasar data-testid y otros atributos HTML nativos
 */

const VARIANTS = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
}

/**
 * @param {{
 *   variant?: 'primary'|'ghost'|'danger',
 *   children: React.ReactNode,
 *   className?: string,
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   type?: string,
 * }} props
 */
const Button = ({
  variant = 'primary',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...rest  // ← permite data-testid, aria-*, etc.
}) => (
  <button
    type={type}
    className={`${VARIANTS[variant]} ${className}`}
    disabled={disabled}
    onClick={onClick}
    {...rest}
  >
    {children}
  </button>
)

export default Button
