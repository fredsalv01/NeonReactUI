/**
 * Molecule: StatCard
 * Dashboard KPI card — redesigned with neon accent stripe, trend pill,
 * radial glow, and hover lift. Accepts any CSS color (hex or var(--token)).
 *
 * Props:
 *   label   — metric name (shown below the value)
 *   value   — primary number / string
 *   icon    — icon key from Icon component
 *   color   — accent color; hex or CSS var, default #00C9A7
 *   sub     — secondary text; auto-detects trend if starts with + or -
 *   trend   — explicit override: 'up' | 'down' (skips auto-detection)
 */

import Icon from './Icon'

function autoTrend(sub, trend) {
  if (trend) return trend
  if (typeof sub !== 'string') return null
  const t = sub.trimStart()
  if (t.startsWith('+')) return 'up'
  if (t.startsWith('-')) return 'down'
  return null
}

const StatCard = ({ label, value, icon, color = '#00C9A7', sub, trend }) => {
  const trendDir   = autoTrend(sub, trend)
  const trendColor = trendDir === 'up' ? '#00C9A7' : trendDir === 'down' ? '#EF4444' : color

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gs-card border border-gs-border
                 p-5 flex flex-col gap-4 animate-fade-in
                 transition-all duration-300 group
                 hover:-translate-y-0.5"
      style={{ '--c': color }}
    >
      {/* Neon top accent stripe */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--c) 50%, transparent 100%)',
        }}
      />

      {/* Icon + trend pill */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                     transition-transform duration-300 group-hover:scale-110"
          style={{
            background: 'color-mix(in srgb, var(--c) 12%, transparent)',
            border:     '1px solid color-mix(in srgb, var(--c) 25%, transparent)',
          }}
        >
          <Icon name={icon} size={18} color={color} />
        </div>

        {trendDir && (
          <span
            className="text-[10px] font-['DM_Mono'] font-semibold
                       px-2 py-0.5 rounded-full flex items-center gap-0.5
                       leading-none whitespace-nowrap"
            style={{
              color:      trendColor,
              background: `color-mix(in srgb, ${trendColor} 10%, transparent)`,
              border:     `1px solid color-mix(in srgb, ${trendColor} 22%, transparent)`,
            }}
          >
            {trendDir === 'up' ? '↑' : '↓'}&nbsp;{sub}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div>
        <p className="text-[2rem] font-extrabold text-gs-text leading-none tabular-nums tracking-tight">
          {value}
        </p>
        <p className="text-[11px] font-['DM_Mono'] text-gs-muted uppercase tracking-widest mt-1.5">
          {label}
        </p>

        {/* Sub text when no trend was detected */}
        {sub && !trendDir && (
          <p className="text-[11px] font-['DM_Mono'] mt-1" style={{ color }}>
            {sub}
          </p>
        )}
      </div>

      {/* Decorative radial glow — bottom-right corner */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--c) 18%, transparent) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

export default StatCard
