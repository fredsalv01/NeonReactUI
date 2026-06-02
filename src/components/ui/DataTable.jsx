/**
 * Organism: DataTable
 * Sortable, selectable, fully responsive data table.
 *
 * Column shape:
 *   { key, label, sortable?, mono?, render?(value, row), className? }
 *
 * Props:
 *   columns, data, loading?, loadingRows?, selectable?,
 *   onRowClick?(row), actions?(row) => ReactNode, emptyMessage?
 */

import { useState, useMemo } from 'react'
import Icon from './Icon'
import { SkeletonRow } from './Skeleton'

// ── Helpers ──────────────────────────────────────────────────────
function nextDir(d) {
  return d === 'none' ? 'asc' : d === 'asc' ? 'desc' : 'none'
}

// ── Sub-components ───────────────────────────────────────────────
function SortIcon({ dir }) {
  const stroke = 'currentColor'
  if (dir === 'asc') return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
         stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8V2M2 5l3-3 3 3" />
    </svg>
  )
  if (dir === 'desc') return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
         stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2v6M2 5l3 3 3-3" />
    </svg>
  )
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
         stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
         className="opacity-25">
      <path d="M2 3.5l3-2.5 3 2.5M2 6.5l3 2.5 3-2.5" />
    </svg>
  )
}

function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={onChange}
      className={[
        'w-4 h-4 rounded border flex items-center justify-center',
        'transition-all duration-150 cursor-pointer shrink-0 outline-none',
        checked || indeterminate
          ? 'bg-gs-accent/15 border-gs-accent'
          : 'bg-transparent border-gs-border hover:border-gs-accent/50',
      ].join(' ')}
    >
      {indeterminate && !checked && (
        <span className="w-2 h-[2px] bg-gs-accent rounded-full" />
      )}
      {checked && <Icon name="check" size={9} color="#00C9A7" />}
    </button>
  )
}

function EmptyState({ message }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-gs-muted">
          <Icon name="search" size={30} color="#4A5568" />
          <p className="text-sm font-['Syne']">{message}</p>
        </div>
      </td>
    </tr>
  )
}

// ── Main component ───────────────────────────────────────────────
const DataTable = ({
  columns     = [],
  data        = [],
  loading     = false,
  loadingRows = 5,
  selectable  = false,
  onRowClick,
  actions,
  emptyMessage = 'No results found.',
}) => {
  const [selected, setSelected] = useState(new Set())
  const [sort, setSort]         = useState({ key: null, dir: 'none' })

  // Sorting
  const sorted = useMemo(() => {
    if (!sort.key || sort.dir === 'none') return data
    return [...data].sort((a, b) => {
      const va = a[sort.key] ?? ''
      const vb = b[sort.key] ?? ''
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [data, sort])

  // Selection
  const allSelected  = data.length > 0 && selected.size === data.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(data.map((_, i) => i)))

  const toggleRow = (i) => {
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    setSelected(next)
  }

  const handleSort = (col) => {
    if (!col.sortable) return
    setSort(prev => ({
      key: col.key,
      dir: prev.key === col.key ? nextDir(prev.dir) : 'asc',
    }))
  }

  const totalCols =
    (selectable ? 1 : 0) + columns.length + (actions ? 1 : 0)

  return (
    <div className="card overflow-hidden">
      {/* Selection banner */}
      {selected.size > 0 && (
        <div className="px-4 py-2 bg-gs-accent/5 border-b border-gs-accent/20
                        flex items-center gap-3">
          <span className="text-xs text-gs-accent font-['DM_Mono']">
            {selected.size} row{selected.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-[11px] text-gs-muted hover:text-gs-text underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Scroll wrapper — horizontal scroll on mobile with right-fade hint */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm" style={{ minWidth: 520 }}>

            {/* ── Head ─────────────────────────────────────────── */}
            <thead>
              <tr className="border-b border-gs-border">
                {selectable && (
                  <th className="w-10 px-4 py-3 text-left">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                    />
                  </th>
                )}

                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={[
                      'px-4 py-3 text-left text-[10px] font-bold text-gs-soft',
                      'uppercase tracking-widest font-["DM_Mono"] whitespace-nowrap',
                      col.sortable
                        ? 'cursor-pointer hover:text-gs-text select-none transition-colors'
                        : '',
                      col.className ?? '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <SortIcon
                          dir={sort.key === col.key ? sort.dir : 'none'}
                        />
                      )}
                    </div>
                  </th>
                ))}

                {actions && (
                  <th className="px-4 py-3 text-right text-[10px] font-bold
                                 text-gs-soft uppercase tracking-widest font-['DM_Mono']">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* ── Body ─────────────────────────────────────────── */}
            <tbody>
              {loading
                ? Array.from({ length: loadingRows }).map((_, i) => (
                    <SkeletonRow key={i} cols={totalCols} />
                  ))
                : sorted.length === 0
                  ? <EmptyState message={emptyMessage} />
                  : sorted.map((row, i) => (
                    <tr
                      key={i}
                      className={[
                        'trow border-b border-gs-border/40',
                        'transition-colors duration-100',
                        onRowClick ? 'cursor-pointer' : '',
                        selected.has(i) ? 'bg-gs-accent/[0.04]' : '',
                      ].join(' ')}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td
                          className="px-4 py-3.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected.has(i)}
                            onChange={() => toggleRow(i)}
                          />
                        </td>
                      )}

                      {columns.map(col => (
                        <td
                          key={col.key}
                          className={[
                            'px-4 py-3.5 text-gs-text',
                            col.mono
                              ? 'font-["DM_Mono"] text-xs text-gs-soft'
                              : 'text-[13px]',
                            col.className ?? '',
                          ].join(' ')}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : (row[col.key] ?? '—')}
                        </td>
                      ))}

                      {actions && (
                        <td
                          className="px-4 py-3.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {actions(row)}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Right-edge fade — visible only when content overflows (mobile hint) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8
                     bg-gradient-to-l from-gs-card to-transparent sm:hidden"
        />
      </div>
    </div>
  )
}

export default DataTable
