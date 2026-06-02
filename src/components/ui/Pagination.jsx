/**
 * Molecule: Pagination
 * Control de paginación reutilizable.
 */

/**
 * @param {{
 *   page: number,
 *   totalPages: number,
 *   total: number,
 *   onPageChange: (p: number) => void,
 * }} props
 */
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="card flex items-center justify-between px-4 sm:px-5 py-3 gap-3 flex-wrap">
      {/* Result count — abbreviated on mobile */}
      <span className="text-xs text-gs-muted font-mono whitespace-nowrap">
        <span className="hidden sm:inline">Página </span>
        <strong className="text-gs-text">{page}</strong>
        <span className="text-gs-muted"> / {totalPages}</span>
        <span className="hidden sm:inline">
          {' '}· {total} resultado{total !== 1 ? 's' : ''}
        </span>
      </span>

      <div className="flex gap-1 sm:gap-1.5 items-center">
        <button
          className="pgbtn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← <span className="hidden sm:inline">Ant.</span>
        </button>

        {/* Numbered buttons — desktop only */}
        <div className="hidden sm:flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`pgbtn ${page === n ? 'pgbtn-active' : ''}`}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Current page pill — mobile only */}
        <span className="sm:hidden px-3 py-1 rounded-md text-xs font-semibold
                         bg-gs-accent text-gs-bg border border-gs-accent select-none">
          {page}
        </span>

        <button
          className="pgbtn"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Sig. </span>→
        </button>
      </div>
    </div>
  )
}

export default Pagination
