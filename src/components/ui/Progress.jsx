/**
 * Molecule: Progress
 * Three variants: 'bar' | 'circular' | 'steps'
 * Supports indeterminate (animated shimmer) mode.
 */

// ── Bar heights (px) ────────────────────────────────────────────
const BAR_H = { xs: 4, sm: 6, md: 8, lg: 12 }

// ── Bar variant ──────────────────────────────────────────────────
function BarProgress({ value, color, size, indeterminate, showValue, label }) {
  const h  = BAR_H[size] ?? BAR_H.md
  const pct = Math.min(100, Math.max(0, value ?? 0))

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[11px] font-['DM_Mono'] text-gs-soft uppercase tracking-wider">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="text-[11px] font-['DM_Mono'] font-bold" style={{ color }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className="w-full overflow-hidden rounded-full"
        style={{
          height:      h,
          background:  'var(--gs-surface)',
          border:      '1px solid var(--gs-border)',
        }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {indeterminate ? (
          // Shimmer sweep for indeterminate
          <div className="h-full w-full overflow-hidden relative">
            <div
              className="absolute h-full w-1/5 rounded-full animate-shimmer"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              }}
            />
          </div>
        ) : (
          // Determinate fill
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width:      `${pct}%`,
              background: `linear-gradient(90deg, color-mix(in srgb, ${color} 80%, #000), ${color})`,
              boxShadow:  `0 0 ${h * 1.5}px color-mix(in srgb, ${color} 45%, transparent)`,
            }}
          />
        )}
      </div>
    </div>
  )
}

// ── Circular variant ─────────────────────────────────────────────
const CIRC_SIZES = { sm: 48, md: 64, lg: 96 }
const STROKE     = { sm: 4,  md: 5,  lg: 7  }

function CircularProgress({ value, color, size, indeterminate, showValue }) {
  const d   = CIRC_SIZES[size] ?? CIRC_SIZES.md
  const sw  = STROKE[size]     ?? STROKE.md
  const r   = (d - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(100, Math.max(0, value ?? 0))
  const offset = circ * (1 - pct / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: d, height: d }}>
      <svg width={d} height={d} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={d / 2} cy={d / 2} r={r}
          fill="none"
          stroke="var(--gs-border)"
          strokeWidth={sw}
        />
        {/* Fill */}
        <circle
          cx={d / 2} cy={d / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={indeterminate ? 0 : offset}
          style={{
            transition:  indeterminate ? 'none' : 'stroke-dashoffset 500ms ease',
            filter:      `drop-shadow(0 0 4px color-mix(in srgb, ${color} 50%, transparent))`,
            ...(indeterminate && {
              animation: 'spin 1.2s linear infinite',
              strokeDashoffset: circ * 0.75,
            }),
          }}
        />
      </svg>
      {showValue && !indeterminate && (
        <span
          className="absolute text-xs font-bold font-['DM_Mono']"
          style={{ color }}
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}

// ── Steps variant ────────────────────────────────────────────────
function StepsProgress({ value, color, segments = 5, label }) {
  const pct   = Math.min(100, Math.max(0, value ?? 0))
  const filled = Math.round(pct / 100 * segments)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <span className="text-[11px] font-['DM_Mono'] text-gs-soft uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full transition-all duration-300"
            style={{
              background:  i < filled ? color : 'var(--gs-surface)',
              border:      `1px solid ${i < filled ? color : 'var(--gs-border)'}`,
              boxShadow:   i < filled
                ? `0 0 6px color-mix(in srgb, ${color} 35%, transparent)`
                : 'none',
              transitionDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────
/**
 * @param {{
 *   value?:        number,          // 0–100
 *   variant?:      'bar'|'circular'|'steps',
 *   size?:         'xs'|'sm'|'md'|'lg',
 *   color?:        string,
 *   label?:        string,
 *   showValue?:    boolean,
 *   indeterminate?: boolean,
 *   segments?:     number,          // for 'steps' variant
 *   className?:    string,
 * }} props
 */
const Progress = ({
  value         = 0,
  variant       = 'bar',
  size          = 'md',
  color         = 'var(--gs-accent)',
  label,
  showValue     = false,
  indeterminate = false,
  segments      = 5,
  className     = '',
}) => {
  const props = { value, color, size, indeterminate, showValue, label, segments }

  return (
    <div className={className}>
      {variant === 'circular' && <CircularProgress {...props} />}
      {variant === 'steps'    && <StepsProgress    {...props} />}
      {variant === 'bar'      && <BarProgress       {...props} />}
    </div>
  )
}

export default Progress
