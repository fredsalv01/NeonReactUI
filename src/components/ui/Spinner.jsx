/**
 * Atom: Spinner
 * Five animated loading variants, all skinned to the neon design system.
 *
 * variant: 'ring' | 'dots' | 'bars' | 'orbit' | 'pulse'
 * size:     pixel diameter (base unit for all variants)
 * color:    any CSS color — hex or var(--token)
 * thickness: stroke width for ring / orbit / pulse
 * label:    optional text shown below the spinner
 */

// ── Variant renderers ────────────────────────────────────────────

/** Conic-gradient arc with neon glow. */
function Ring({ size, color, thickness }) {
  const glow = thickness + 2
  return (
    <span
      style={{
        '--c': color,
        display: 'block',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background:
          'conic-gradient(transparent 0deg, var(--c) 280deg, transparent 360deg)',
        WebkitMask: `radial-gradient(farthest-side,
          transparent calc(100% - ${thickness}px - 0.5px),
          #fff         calc(100% - ${thickness}px))`,
        mask: `radial-gradient(farthest-side,
          transparent calc(100% - ${thickness}px - 0.5px),
          #fff         calc(100% - ${thickness}px))`,
        animation: 'spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        filter: `drop-shadow(0 0 ${glow}px color-mix(in srgb, var(--c) 65%, transparent))`,
      }}
    />
  )
}

/** Three dots with staggered vertical bounce. */
function Dots({ size, color }) {
  const dot = Math.max(size * 0.28, 4)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(size * 0.18, 3),
        flexShrink: 0,
      }}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            '--c': color,
            display: 'block',
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: 'var(--c)',
            boxShadow: `0 0 ${dot * 0.9}px color-mix(in srgb, var(--c) 65%, transparent)`,
            animationName: 'dotsB',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  )
}

/** Four vertical bars with a wave scale animation. */
function Bars({ size, color }) {
  const w = Math.max(Math.round(size * 0.16), 3)
  const h = Math.round(size * 0.72)
  const r = Math.max(Math.round(size * 0.06), 2)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(size * 0.1, 2),
        height: size,
        flexShrink: 0,
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          style={{
            '--c': color,
            display: 'block',
            width: w,
            height: h,
            borderRadius: r,
            background: 'var(--c)',
            boxShadow: `0 0 ${w * 1.5}px color-mix(in srgb, var(--c) 55%, transparent)`,
            animationName: 'barsW',
            animationDuration: '1.1s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            animationDelay: `${i * 0.13}s`,
          }}
        />
      ))}
    </span>
  )
}

/** A glowing dot orbiting a dim ring. */
function Orbit({ size, color, thickness }) {
  const dotD    = Math.max(size * 0.24, 4)
  const dotR    = dotD / 2
  // position dot on the track midline
  const dotTop  = thickness / 2 - dotR
  const dotLeft = size / 2 - dotR
  return (
    <span
      style={{
        position: 'relative',
        display: 'block',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {/* Dim track ring */}
      <span
        style={{
          '--c': color,
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${thickness}px solid color-mix(in srgb, var(--c) 14%, transparent)`,
        }}
      />
      {/* Rotating arm */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          animation: 'spin 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      >
        {/* Glowing dot at top of arm */}
        <span
          style={{
            '--c': color,
            position: 'absolute',
            display: 'block',
            width: dotD,
            height: dotD,
            borderRadius: '50%',
            top: dotTop,
            left: dotLeft,
            background: 'var(--c)',
            boxShadow: `0 0 ${dotD * 1.2}px var(--c),
                        0 0 ${dotD * 2.4}px color-mix(in srgb, var(--c) 40%, transparent)`,
          }}
        />
      </span>
    </span>
  )
}

/** Concentric rings expanding outward from a glowing center dot. */
function Pulse({ size, color, thickness }) {
  const dotD = Math.max(size * 0.28, 5)
  return (
    <span
      style={{
        position: 'relative',
        display: 'block',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {[0, 1].map(i => (
        <span
          key={i}
          style={{
            '--c': color,
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${thickness}px solid color-mix(in srgb, var(--c) 55%, transparent)`,
            animationName: 'ringE',
            animationDuration: '1.4s',
            animationTimingFunction: 'ease-out',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            animationDelay: `${i * 0.56}s`,
          }}
        />
      ))}
      {/* Center dot */}
      <span
        style={{
          '--c': color,
          position: 'absolute',
          display: 'block',
          width: dotD,
          height: dotD,
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--c)',
          boxShadow: `0 0 ${dotD}px color-mix(in srgb, var(--c) 70%, transparent)`,
        }}
      />
    </span>
  )
}

// ── Map ──────────────────────────────────────────────────────────
const VARIANTS = { ring: Ring, dots: Dots, bars: Bars, orbit: Orbit, pulse: Pulse }

// ── Main export ──────────────────────────────────────────────────
/**
 * @param {{
 *   variant?:   'ring'|'dots'|'bars'|'orbit'|'pulse',
 *   size?:      number,
 *   color?:     string,
 *   thickness?: number,
 *   label?:     string,
 *   className?: string,
 * }} props
 */
const Spinner = ({
  variant   = 'ring',
  size      = 20,
  color     = '#00C9A7',
  thickness = 2,
  label,
  className = '',
}) => {
  const Comp = VARIANTS[variant] ?? VARIANTS.ring
  return (
    <span
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <Comp size={size} color={color} thickness={thickness} />
      {label && (
        <span className="text-[11px] font-['DM_Mono'] text-gs-soft leading-none">
          {label}
        </span>
      )}
    </span>
  )
}

export default Spinner
