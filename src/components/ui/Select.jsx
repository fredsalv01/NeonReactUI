/**
 * Molecule: Select
 * Autocomplete combobox — single or multi-select with full keyboard navigation.
 *
 * Option shape: { value: string, label: string, meta?: string }
 *
 * Props:
 *   options     — array of { value, label, meta? }
 *   value       — string (single) | string[] (multi) | null
 *   onChange    — (val) => void
 *   placeholder — input placeholder text
 *   label       — label above the trigger
 *   multi       — enable multi-select chips
 *   clearable   — show clear button when value is set
 *   disabled
 *   error       — inline error message
 *   className
 */

import { useState, useRef, useEffect, useId } from 'react'
import Icon from './Icon'

// ── Inline chevron (rotates on open) ────────────────────────────
function Chevron({ open }) {
  return (
    <svg
      width="13" height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: 'block',
        flexShrink: 0,
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M2.5 4.5l4 4 4-4" />
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────
const Select = ({
  options    = [],
  value,
  onChange,
  placeholder = 'Select…',
  label,
  multi      = false,
  clearable  = true,
  disabled   = false,
  error,
  className  = '',
}) => {
  const [open,      setOpen]      = useState(false)
  const [query,     setQuery]     = useState('')
  const [activeIdx, setActiveIdx] = useState(-1)

  const wrapRef  = useRef(null)
  const inputRef = useRef(null)
  const listRef  = useRef(null)
  const uid      = useId()

  // Normalise value
  const selected = multi
    ? (Array.isArray(value) ? value : [])
    : (value ?? null)

  const hasValue = multi
    ? selected.length > 0
    : selected !== null && selected !== undefined && selected !== ''

  // Filtered options: matches query, not already chosen (multi)
  const filtered = options.filter(opt => {
    const match = opt.label.toLowerCase().includes(query.toLowerCase())
    const free  = multi ? !selected.includes(opt.value) : true
    return match && free
  })

  const getLabel = (val) => options.find(o => o.value === val)?.label ?? String(val)

  // ── Outside-click close ──────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ── Actions ──────────────────────────────────────────────────
  const openDrop = () => {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setActiveIdx(-1)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const close = () => {
    setOpen(false)
    setQuery('')
    setActiveIdx(-1)
  }

  const pick = (val) => {
    if (multi) {
      onChange([...selected, val])
      setQuery('')
      setActiveIdx(-1)
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      onChange(val)
      close()
    }
  }

  const removeChip = (val, e) => {
    e.stopPropagation()
    e.preventDefault()
    onChange(selected.filter(v => v !== val))
  }

  const clearValue = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onChange(multi ? [] : null)
    setQuery('')
    requestAnimationFrame(() => openDrop())
  }

  // ── Keyboard ─────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) {
      if (['Enter', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault(); openDrop()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx(i => { const n = Math.min(i + 1, filtered.length - 1); scrollTo(n); return n })
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx(i => { const n = Math.max(i - 1, -1); scrollTo(n); return n })
        break
      case 'Enter':
        e.preventDefault()
        if (activeIdx >= 0 && filtered[activeIdx]) pick(filtered[activeIdx].value)
        break
      case 'Escape':
        e.preventDefault(); close()
        break
      case 'Tab':
        close()
        break
      case 'Backspace':
        if (multi && query === '' && selected.length > 0) {
          onChange(selected.slice(0, -1))
        }
        break
    }
  }

  const scrollTo = (idx) => {
    if (idx < 0 || !listRef.current) return
    listRef.current.children[idx]?.scrollIntoView({ block: 'nearest' })
  }

  // ── Render ───────────────────────────────────────────────────
  const triggerId = `${uid}-trigger`
  const listId    = `${uid}-list`

  return (
    <div ref={wrapRef} className={`relative ${className}`}>

      {/* Label */}
      {label && (
        <span
          id={`${uid}-label`}
          onClick={openDrop}
          className="block text-[11px] text-gs-soft font-['DM_Mono']
                     uppercase tracking-[0.8px] mb-1.5 cursor-default select-none"
        >
          {label}
        </span>
      )}

      {/* ── Trigger ─────────────────────────────────────────── */}
      <div
        id={triggerId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={listId}
        aria-labelledby={label ? `${uid}-label` : undefined}
        onClick={openDrop}
        className={[
          'relative flex items-center flex-wrap gap-1.5 min-h-[42px] w-full',
          'border rounded-lg px-3 py-2 cursor-pointer',
          'transition-all duration-200',
          open
            ? 'border-gs-accent ring-2 ring-gs-accent/20'
            : 'border-gs-border hover:border-gs-accent/40',
          disabled ? 'opacity-50 pointer-events-none' : '',
          error    ? 'border-gs-danger ring-2 ring-gs-danger/20' : '',
        ].filter(Boolean).join(' ')}
        style={{ background: 'var(--gs-bg)' }}
      >
        {/* Multi: selected chips */}
        {multi && selected.map(v => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                       text-[11px] font-['DM_Mono'] font-semibold leading-none
                       bg-gs-accent/10 text-gs-accent border border-gs-accent/25"
          >
            {getLabel(v)}
            <button
              type="button"
              onMouseDown={e => removeChip(v, e)}
              onClick={e => e.stopPropagation()}
              className="hover:text-white transition-colors cursor-pointer leading-none"
              tabIndex={-1}
              aria-label={`Remove ${getLabel(v)}`}
            >
              <Icon name="close" size={9} />
            </button>
          </span>
        ))}

        {/* ── Autocomplete input ───────────────────────────── */}
        <input
          ref={inputRef}
          // Closed: show selected label. Open: show live query.
          value={open ? query : (!multi && hasValue ? getLabel(selected) : '')}
          onChange={e => { if (open) setQuery(e.target.value) }}
          onKeyDown={handleKeyDown}
          onFocus={openDrop}
          onClick={e => open && e.stopPropagation()}
          placeholder={open || (!hasValue && !multi) ? placeholder : ''}
          readOnly={!open}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeIdx >= 0 ? `${uid}-opt-${activeIdx}` : undefined}
          // Override the global input CSS (border/bg come from the trigger wrapper)
          className="flex-1 w-auto min-w-[60px] m-0 p-0
                     bg-transparent border-none border-0 outline-none
                     ring-0 shadow-none rounded-none
                     focus:ring-0 focus:border-none focus:outline-none
                     text-sm text-gs-text placeholder:text-gs-muted
                     font-['Syne']"
          style={{ cursor: open ? 'text' : 'pointer' }}
        />

        {/* Right side: clear + chevron */}
        <div
          className="flex items-center gap-0.5 shrink-0 ml-auto pl-1"
          onMouseDown={e => e.preventDefault()}   // keep input focus
        >
          {clearable && hasValue && !open && (
            <button
              type="button"
              onMouseDown={clearValue}
              onClick={e => e.stopPropagation()}
              className="p-1 rounded text-gs-muted hover:text-gs-text
                         transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label="Clear"
            >
              <Icon name="close" size={12} />
            </button>
          )}
          <span className="p-1 text-gs-muted pointer-events-none">
            <Chevron open={open} />
          </span>
        </div>
      </div>

      {/* ── Dropdown ─────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 z-50
                     bg-gs-card border border-gs-border rounded-xl
                     overflow-hidden animate-slide-up"
          style={{ boxShadow: '0 0 0 1px var(--gs-border), 0 12px 36px rgba(0,0,0,0.45)' }}
        >
          {/* Search hint row when query matches nothing */}
          {filtered.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-3.5 text-xs text-gs-muted font-['DM_Mono']">
              <Icon name="search" size={13} color="var(--gs-muted)" />
              {query
                ? `No results for "${query}"`
                : multi
                  ? 'All options selected'
                  : 'No options available'
              }
            </div>
          )}

          {filtered.length > 0 && (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable={multi}
              className="max-h-52 overflow-y-auto py-1"
            >
              {filtered.map((opt, i) => {
                const isActive = activeIdx === i
                const isSel    = !multi && selected === opt.value

                return (
                  <li
                    key={opt.value}
                    id={`${uid}-opt-${i}`}
                    role="option"
                    aria-selected={isSel}
                    onMouseDown={() => pick(opt.value)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={[
                      'flex items-center gap-2 px-3.5 py-2.5 cursor-pointer text-sm',
                      'transition-colors duration-100',
                      isActive
                        ? 'bg-gs-surface text-gs-text'
                        : 'text-gs-soft hover:bg-gs-surface/60 hover:text-gs-text',
                      isSel ? 'text-gs-accent' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {/* Check slot */}
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {isSel && <Icon name="check" size={13} color="var(--gs-accent)" />}
                    </span>

                    <span className="flex-1 font-['Syne']">{opt.label}</span>

                    {opt.meta && (
                      <span className="text-[10px] font-['DM_Mono'] text-gs-muted
                                       shrink-0 px-1.5 py-0.5 rounded-md bg-gs-surface">
                        {opt.meta}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-[11px] text-gs-danger font-['DM_Mono'] flex items-center gap-1">
          <Icon name="alert" size={11} color="var(--gs-danger)" />
          {error}
        </p>
      )}
    </div>
  )
}

export default Select
