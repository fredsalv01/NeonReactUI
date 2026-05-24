import Icon from './Icon'

/**
 * Molecule: SearchBar
 * Barra de búsqueda con ícono integrado.
 */

/**
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   placeholder?: string,
 *   className?: string,
 * }} props
 */
const SearchBar = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => (
  <div className={`relative ${className}`}>
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-muted pointer-events-none">
      <Icon name="search" size={15} />
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-10"
    />
  </div>
)

export default SearchBar
