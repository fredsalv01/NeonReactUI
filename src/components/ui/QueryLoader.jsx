/**
 * Atom: QueryLoader
 * PacmanLoader global que se activa automáticamente cuando
 * React Query tiene cualquier query o mutation en curso.
 *
 * Uso: montar una sola vez en App.jsx dentro del QueryClientProvider.
 */
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { PacmanLoader } from 'react-spinners'

const GS_ACCENT = '#00C9A7'

const QueryLoader = () => {
  const fetching  = useIsFetching()
  const mutating  = useIsMutating()
  const isActive  = fetching > 0 || mutating > 0

  if (!isActive) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-end
                 px-4 py-2 pointer-events-none"
      aria-live="polite"
      aria-label="Cargando..."
    >
      {/* Píldora con el loader */}
      {/* <div
        className="flex items-center gap-3 px-4 py-2 rounded-full border animate-fade-in"
        style={{
          background:   '#0D0F14ee',
          borderColor:  '#00C9A730',
          backdropFilter: 'blur(8px)',
          boxShadow:    '0 4px 24px #00C9A715',
        }}
      >
        <PacmanLoader
          color={GS_ACCENT}
          size={10}
          speedMultiplier={1.2}
        />
        <span
          className="text-[11px] font-mono pl-5"
          style={{ color: GS_ACCENT }}
        >
          {mutating > 0 ? 'Guardando...' : 'Cargando...'}
        </span>
      </div> */}
    </div>
  )
}

export default QueryLoader
