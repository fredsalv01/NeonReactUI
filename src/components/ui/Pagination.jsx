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
    <div className="card flex items-center justify-between px-5 py-3">
      <span className="text-xs text-gs-muted font-mono">
        Página <strong className="text-gs-text">{page}</strong> de{' '}
        <strong className="text-gs-text">{totalPages}</strong> · {total} resultado
        {total !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-1.5 items-center">
        <button
          className="pgbtn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Ant.
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`pgbtn ${page === n ? 'pgbtn-active' : ''}`}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}
        <button
          className="pgbtn"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sig. →
        </button>
      </div>
    </div>
  )
}

export default Pagination
