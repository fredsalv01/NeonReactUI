/**
 * Atom: Switch / Toggle
 * Accessible sliding toggle for binary settings.
 * Sizes: 'sm' | 'md' | 'lg'
 */

// Track dimensions (px)
const SIZES = {
  sm: { trackW: 30, trackH: 16, knobD: 10, off: 3 },
  md: { trackW: 42, trackH: 22, knobD: 16, off: 3 },
  lg: { trackW: 54, trackH: 28, knobD: 20, off: 4 },
}

/**
 * @param {{
 *   checked:      boolean,
 *   onChange:     (val: boolean) => void,
 *   label?:       string,
 *   description?: string,
 *   size?:        'sm'|'md'|'lg',
 *   color?:       string,
 *   disabled?:    boolean,
 *   className?:   string,
 * }} props
 */
const Switch = ({
  checked,
  onChange,
  label,
  description,
  size      = 'md',
  color     = 'var(--gs-accent)',
  disabled  = false,
  className = '',
}) => {
  const s      = SIZES[size] ?? SIZES.md
  const knobX  = checked ? s.trackW - s.knobD - s.off : s.off

  return (
    <label
      className={[
        'inline-flex items-start gap-3 select-none',
        !disabled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed',
        className,
      ].join(' ')}
    >
      {/* Track + knob */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative shrink-0 rounded-full outline-none
                   focus-visible:ring-2 focus-visible:ring-gs-accent/40
                   transition-all duration-200"
        style={{
          width:       s.trackW,
          height:      s.trackH,
          minWidth:    s.trackW,
          background:  checked
            ? `color-mix(in srgb, ${color} 75%, transparent)`
            : 'var(--gs-surface)',
          border:      `1px solid ${checked
            ? `color-mix(in srgb, ${color} 45%, transparent)`
            : 'var(--gs-border)'}`,
          boxShadow:   checked
            ? `0 0 10px color-mix(in srgb, ${color} 25%, transparent)`
            : 'none',
        }}
      >
        {/* Knob */}
        <span
          className="absolute top-1/2 rounded-full"
          style={{
            width:      s.knobD,
            height:     s.knobD,
            left:       knobX,
            transform:  'translateY(-50%)',
            background: checked ? '#fff' : 'var(--gs-muted)',
            boxShadow:  '0 1px 4px rgba(0,0,0,0.35)',
            transition: 'left 200ms cubic-bezier(0.4, 0, 0.2, 1), background 200ms',
          }}
        />
      </button>

      {/* Label + description */}
      {(label || description) && (
        <div className="leading-none">
          {label && (
            <p className="text-sm font-semibold text-gs-text font-['Syne'] leading-tight">
              {label}
            </p>
          )}
          {description && (
            <p className={`text-[11px] text-gs-muted font-['DM_Mono'] ${label ? 'mt-1' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  )
}

export default Switch
