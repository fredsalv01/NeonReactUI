/**
 * Atom: Skeleton
 * Placeholder animado para contenido cargando.
 */

/** Bloque genérico */
export const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} />
)

/** Fila de tabla skeleton */
export const SkeletonRow = ({ cols = 6 }) => (
  <tr className="border-b border-gs-border/40">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-3.5 py-3.5">
        <div className="skeleton h-3 rounded" style={{ width: `${55 + (i % 3) * 20}%` }} />
      </td>
    ))}
  </tr>
)

/** Card skeleton para usuarios */
export const SkeletonCard = () => (
  <div className="card px-4 md:px-5 py-3 md:py-3.5 flex items-center gap-3 md:gap-4">
    <div className="skeleton w-9 h-9 md:w-11 md:h-11 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3 rounded w-2/5" />
      <div className="skeleton h-2.5 rounded w-3/5" />
    </div>
    <div className="flex gap-1.5">
      <div className="skeleton w-8 h-7 rounded-lg" />
      <div className="skeleton w-8 h-7 rounded-lg" />
    </div>
  </div>
)

/** StatCard skeleton */
export const SkeletonStat = () => (
  <div className="card p-4 md:p-5 flex flex-col gap-2">
    <div className="skeleton h-2.5 w-1/2 rounded" />
    <div className="skeleton h-7 w-1/3 rounded" />
    <div className="skeleton h-2 w-3/4 rounded" />
  </div>
)

export default SkeletonBlock
