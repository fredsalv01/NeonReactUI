import { useSearchParams } from 'react-router-dom'
import Button from './Button'
import Icon from './Icon'

/**
 * Molecule: ClearFiltersButton
 * Resetea los filtros de la página y la query de la URL, para poder
 * volver a buscar sin recargar. Deshabilitado si no hay nada que limpiar.
 *
 * @param {{ onClear: () => void, active: boolean, className?: string }} props
 */
const ClearFiltersButton = ({ onClear, active, className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleClick = () => {
    onClear()
    if (searchParams.toString()) setSearchParams({}, { replace: true })
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={!active}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      <Icon name="x" size={14} />
      Limpiar filtros
    </Button>
  )
}

export default ClearFiltersButton
