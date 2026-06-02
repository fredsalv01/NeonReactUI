/**
 * Molecule: NumberInput
 * Quantity field with increment / decrement controls.
 * Hold the button to auto-repeat. Supports min, max, step, prefix, suffix.
 */

import { useRef } from 'react'
import Icon from './Icon'

/**
 * @param {{
 *   value:      number,
 *   onChange:   (val: number) => void,
 *   min?:       number,
 *   max?:       number,
 *   step?:      number,
 *   label?:     string,
 *   prefix?:    string,
 *   suffix?:    string,
 *   disabled?:  boolean,
 *   error?:     string,
 *   className?: string,
 * }} props
 */
const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step      = 1,
  label,
  prefix,
  suffix,
  disabled  = false,
  error,
  className = '',
}) => {
  const holdTimer    = useRef(null)
  const holdInterval = useRef(null)

  const clamp = (n) => {
    if (isNaN(n)) return min ?? 0
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
  }

  const increment = () => onChange(clamp(Number((value ?? 0)) + step))
  const decrement = () => onChange(clamp(Number((value ?? 0)) - step))

  const startHold = (fn) => {
    fn()
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(fn, 80)
    }, 380)
  }

  const stopHold = () => {
    clearTimeout(holdTimer.current)
    clearInterval(holdInterval.current)
  }

  const handleChange = (e) => {
    const raw = e.target.value
    if (raw === '' || raw === '-') return   // allow partial typing
    const n = parseFloat(raw)
    if (!isNaN(n)) onChange(n)
  }

  const handleBlur = (e) => {
    const n = parseFloat(e.target.value)
    onChange(clamp(isNaN(n) ? (min ?? 0) : n))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp')   { e.preventDefault(); increment() }
    if (e.key === 'ArrowDown') { e.preventDefault(); decrement() }
  }

  const atMin = min !== undefined && Number(value) <= min
  const atMax = max !== undefined && Number(value) >= max

  const btnClass = (at) => [
    'flex items-center justify-center w-9 shrink-0 h-full transition-colors duration-150',
    'text-gs-soft cursor-pointer outline-none select-none',
    at || disabled
      ? 'opacity-30 cursor-not-allowed'
      : 'hover:text-gs-accent hover:bg-white/5',
  ].join(' ')

  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] text-gs-soft font-['DM_Mono']
                          uppercase tracking-[0.8px] mb-1.5">
          {label}
        </label>
      )}

      <div
        className={[
          'flex items-center overflow-hidden rounded-lg border',
          'transition-all duration-200',
          error    ? 'border-gs-danger ring-2 ring-gs-danger/20' : 'border-gs-border',
          disabled ? 'opacity-50' : 'focus-within:border-gs-accent focus-within:ring-2 focus-within:ring-gs-accent/20',
        ].join(' ')}
        style={{ background: 'var(--gs-bg)', height: 42 }}
      >
        {/* Prefix */}
        {prefix && (
          <span className="pl-3 pr-1 text-xs text-gs-muted font-['DM_Mono'] shrink-0 select-none">
            {prefix}
          </span>
        )}

        {/* Decrement */}
        <button
          type="button"
          disabled={disabled || atMin}
          onMouseDown={() => !disabled && !atMin && startHold(decrement)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => !disabled && !atMin && startHold(decrement)}
          onTouchEnd={stopHold}
          className={btnClass(atMin)}
          aria-label="Decrement"
        >
          <Icon name="minus" size={14} />
        </button>

        {/* Value input */}
        <input
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className="flex-1 min-w-0 text-center text-sm font-['DM_Mono'] font-semibold
                     text-gs-text bg-transparent border-none outline-none ring-0
                     p-0 m-0 w-auto focus:ring-0 focus:border-none
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
          style={{ cursor: disabled ? 'not-allowed' : 'text' }}
          aria-label={label}
        />

        {/* Increment */}
        <button
          type="button"
          disabled={disabled || atMax}
          onMouseDown={() => !disabled && !atMax && startHold(increment)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => !disabled && !atMax && startHold(increment)}
          onTouchEnd={stopHold}
          className={btnClass(atMax)}
          aria-label="Increment"
        >
          <Icon name="plus" size={14} />
        </button>

        {/* Suffix */}
        {suffix && (
          <span className="pr-3 pl-1 text-xs text-gs-muted font-['DM_Mono'] shrink-0 select-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] text-gs-danger font-['DM_Mono'] flex items-center gap-1">
          <Icon name="alert" size={11} color="var(--gs-danger)" />
          {error}
        </p>
      )}
    </div>
  )
}

export default NumberInput
