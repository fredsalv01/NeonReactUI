/**
 * Molecule: DatePicker
 * Single-date and date-range calendar picker.
 * Pure JS Date — no external library.
 *
 * Single:  value = Date | null,             onChange = (Date | null) => void
 * Range:   value = { from: Date, to: Date }, onChange = ({ from, to }) => void
 */

import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

// ── Constants ────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ── Helpers ──────────────────────────────────────────────────────
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d }

const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate()

const isToday = (d) => sameDay(d, today())

const inRange = (d, from, to) => {
  if (!from || !to) return false
  const t = d.getTime()
  const [lo, hi] = from <= to ? [from.getTime(), to.getTime()] : [to.getTime(), from.getTime()]
  return t > lo && t < hi
}

function buildCells(year, month) {
  const offset   = (new Date(year, month, 1).getDay() + 6) % 7  // Mon = 0
  const daysThis = new Date(year, month + 1, 0).getDate()
  const daysPrev = new Date(year, month, 0).getDate()
  const cells    = []

  // Trailing days from previous month
  for (let i = offset - 1; i >= 0; i--)
    cells.push(new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, daysPrev - i))

  // Current month
  for (let d = 1; d <= daysThis; d++)
    cells.push(new Date(year, month, d))

  // Leading days from next month
  let nd = 1
  while (cells.length < 42)
    cells.push(new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, nd++))

  return cells
}

const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmt   = (d) => d ? `${SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : ''

// ── Trigger ──────────────────────────────────────────────────────
function Trigger({ text, placeholder, open, onOpen, onClear, clearable, hasValue, disabled, error }) {
  return (
    <div
      onClick={onOpen}
      className={[
        'relative flex items-center gap-2 min-h-[42px] w-full',
        'border rounded-lg px-3.5 cursor-pointer',
        'transition-all duration-200',
        open    ? 'border-gs-accent ring-2 ring-gs-accent/20' : 'border-gs-border hover:border-gs-accent/40',
        disabled? 'opacity-50 pointer-events-none' : '',
        error   ? 'border-gs-danger ring-2 ring-gs-danger/20' : '',
      ].join(' ')}
      style={{ background: 'var(--gs-bg)' }}
    >
      <Icon name="calendar" size={15} color="var(--gs-soft)" />
      <span className={`flex-1 text-sm font-['Syne'] ${hasValue ? 'text-gs-text' : 'text-gs-muted'}`}>
        {hasValue ? text : placeholder}
      </span>
      {clearable && hasValue && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); onClear() }}
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-gs-muted hover:text-gs-text transition-colors cursor-pointer"
          aria-label="Clear"
        >
          <Icon name="close" size={12} />
        </button>
      )}
      <span
        className="text-gs-muted pointer-events-none"
        style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2.5 4.5l4 4 4-4" />
        </svg>
      </span>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
/**
 * @param {{
 *   value?:       Date | { from?: Date, to?: Date } | null,
 *   onChange:     (val: Date | null | { from, to }) => void,
 *   mode?:        'single'|'range',
 *   placeholder?: string,
 *   label?:       string,
 *   minDate?:     Date,
 *   maxDate?:     Date,
 *   clearable?:   boolean,
 *   disabled?:    boolean,
 *   error?:       string,
 *   className?:   string,
 * }} props
 */
const DatePicker = ({
  value,
  onChange,
  mode        = 'single',
  placeholder,
  label,
  minDate,
  maxDate,
  clearable   = true,
  disabled    = false,
  error,
  className   = '',
}) => {
  const ref   = today()
  const [open,       setOpen]      = useState(false)
  const [viewYear,   setViewYear]  = useState(ref.getFullYear())
  const [viewMonth,  setViewMonth] = useState(ref.getMonth())
  const [hoverDate,  setHoverDate] = useState(null)
  const [selecting,  setSelecting] = useState('from') // range only
  const wrapRef = useRef(null)

  const single    = mode === 'single'
  const singleVal = single ? (value instanceof Date ? value : null) : null
  const rangeFrom = !single ? (value?.from ?? null) : null
  const rangeTo   = !single ? (value?.to   ?? null) : null

  const hasValue  = single ? !!singleVal : !!(rangeFrom || rangeTo)

  const displayText = () => {
    if (single) return fmt(singleVal)
    if (rangeFrom && rangeTo) return `${fmt(rangeFrom)}  →  ${fmt(rangeTo)}`
    if (rangeFrom) return `${fmt(rangeFrom)}  →  …`
    return ''
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const keyH    = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyH)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyH) }
  }, [open])

  const openPicker = () => {
    if (disabled) return
    const ref = singleVal || rangeFrom
    if (ref) { setViewYear(ref.getFullYear()); setViewMonth(ref.getMonth()) }
    setOpen(true)
  }

  const handleClear = () => {
    onChange(single ? null : { from: null, to: null })
    setSelecting('from')
  }

  const handleSelect = (date) => {
    if (single) {
      onChange(date)
      setOpen(false)
      return
    }
    // Range logic
    if (selecting === 'from' || !rangeFrom) {
      onChange({ from: date, to: null })
      setSelecting('to')
    } else {
      const from = date < rangeFrom ? date : rangeFrom
      const to   = date < rangeFrom ? rangeFrom : date
      onChange({ from, to })
      setOpen(false)
      setSelecting('from')
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const defaultPH = single ? 'Select date…' : 'Select date range…'

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <span
          className="block text-[11px] text-gs-soft font-['DM_Mono']
                     uppercase tracking-[0.8px] mb-1.5 cursor-default select-none"
          onClick={openPicker}
        >
          {label}
        </span>
      )}

      <Trigger
        text={displayText()}
        placeholder={placeholder ?? defaultPH}
        open={open}
        onOpen={openPicker}
        onClear={handleClear}
        clearable={clearable}
        hasValue={hasValue}
        disabled={disabled}
        error={error}
      />

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50"
        >
          <div
            onMouseLeave={() => setHoverDate(null)}
          >
            <CalendarWithHover
              year={viewYear}
              month={viewMonth}
              onPrev={prevMonth}
              onNext={nextMonth}
              onSelect={handleSelect}
              single={single}
              singleVal={singleVal}
              rangeFrom={rangeFrom}
              rangeTo={rangeTo}
              hoverDate={hoverDate}
              setHoverDate={setHoverDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[11px] text-gs-danger font-['DM_Mono'] flex items-center gap-1">
          <Icon name="alert" size={11} color="var(--gs-danger)" />
          {error}
        </p>
      )}
    </div>
  )
}

// Separate component to handle hover properly
function CalendarWithHover({ year, month, onPrev, onNext, onSelect, single, singleVal, rangeFrom, rangeTo, hoverDate, setHoverDate, minDate, maxDate }) {
  const cells = buildCells(year, month)

  const isDisabled = (d) =>
    (minDate && d < minDate) || (maxDate && d > maxDate)

  const previewEnd = rangeTo || hoverDate

  return (
    <div
      className="bg-gs-card border border-gs-border rounded-2xl p-4 animate-slide-up select-none"
      style={{
        width:     280,
        boxShadow: '0 0 0 1px var(--gs-border), 0 12px 36px rgba(0,0,0,0.5)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrev}
          className="p-1.5 rounded-lg text-gs-muted hover:text-gs-text hover:bg-white/5 transition-colors cursor-pointer">
          <Icon name="arrowL" size={15} />
        </button>
        <span className="text-sm font-bold text-gs-text font-['Syne']">
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext}
          className="p-1.5 rounded-lg text-gs-muted hover:text-gs-text hover:bg-white/5 transition-colors cursor-pointer">
          <Icon name="arrowR" size={15} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="h-7 flex items-center justify-center
                                   text-[10px] font-bold text-gs-muted font-['DM_Mono']">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const current   = date.getMonth() === month
          const todayD    = isToday(date)
          const selOrEnd  = (single && sameDay(date, singleVal)) || sameDay(date, rangeFrom) || sameDay(date, rangeTo)
          const isFrom    = !single && sameDay(date, rangeFrom)
          const isTo      = !single && sameDay(date, rangeTo)
          const preview   = !single && inRange(date, rangeFrom, previewEnd) && !selOrEnd
          const disabled  = isDisabled(date)

          return (
            <div
              key={i}
              className="relative flex items-center justify-center h-8"
              onMouseEnter={() => !single && rangeFrom && !rangeTo && setHoverDate(date)}
            >
              {/* Range bar */}
              {(preview || isFrom || isTo) && (
                <span
                  className="absolute inset-y-1 pointer-events-none"
                  style={{
                    background: 'color-mix(in srgb, var(--gs-accent) 12%, transparent)',
                    left:  isFrom ? '50%' : 0,
                    right: isTo   ? '50%' : 0,
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => !disabled && onSelect(date)}
                disabled={disabled}
                className={[
                  'relative z-10 w-7 h-7 rounded-full text-[12px] font-["DM_Mono"]',
                  'flex items-center justify-center transition-colors duration-100',
                  disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer',
                  selOrEnd
                    ? 'bg-gs-accent text-gs-bg font-bold'
                    : todayD
                    ? 'ring-1 ring-gs-accent text-gs-accent'
                    : preview
                    ? 'text-gs-text'
                    : current
                    ? 'text-gs-soft hover:bg-gs-surface hover:text-gs-text'
                    : 'text-gs-muted/40',
                ].join(' ')}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>

      {!single && rangeFrom && !rangeTo && (
        <p className="text-[10px] text-gs-muted font-['DM_Mono'] text-center mt-3">
          Select end date
        </p>
      )}
    </div>
  )
}

export default DatePicker
