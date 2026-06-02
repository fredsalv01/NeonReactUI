/**
 * Organism: Stepper
 * Multi-step form / wizard indicator.
 * Orientation: 'horizontal' (default) | 'vertical'
 * Step status is auto-derived from `current` or can be set explicitly per step.
 *
 * Step shape: { label, description?, status?: 'complete'|'active'|'upcoming'|'error' }
 */

import Icon from './Icon'

// ── Step indicator circle ────────────────────────────────────────
function StepCircle({ status, index, onClick, clickable }) {
  const styles = {
    complete: {
      bg:     'var(--gs-accent)',
      border: 'var(--gs-accent)',
      text:   'var(--gs-bg)',
      shadow: '0 0 12px color-mix(in srgb, var(--gs-accent) 40%, transparent)',
    },
    active: {
      bg:     'color-mix(in srgb, var(--gs-accent) 12%, var(--gs-surface))',
      border: 'var(--gs-accent)',
      text:   'var(--gs-accent)',
      shadow: '0 0 12px color-mix(in srgb, var(--gs-accent) 25%, transparent)',
    },
    upcoming: {
      bg:     'var(--gs-surface)',
      border: 'var(--gs-border)',
      text:   'var(--gs-muted)',
      shadow: 'none',
    },
    error: {
      bg:     'color-mix(in srgb, var(--gs-danger) 12%, var(--gs-surface))',
      border: 'var(--gs-danger)',
      text:   'var(--gs-danger)',
      shadow: '0 0 12px color-mix(in srgb, var(--gs-danger) 25%, transparent)',
    },
  }

  const s = styles[status] ?? styles.upcoming

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className="w-8 h-8 rounded-full border-2 flex items-center justify-center
                 shrink-0 transition-all duration-300 outline-none
                 focus-visible:ring-2 focus-visible:ring-gs-accent/40"
      style={{
        background:  s.bg,
        borderColor: s.border,
        boxShadow:   s.shadow,
        cursor:      clickable ? 'pointer' : 'default',
      }}
    >
      {status === 'complete' && <Icon name="check" size={13} color={s.text} />}
      {status === 'error'    && <Icon name="close" size={11} color={s.text} />}
      {(status === 'active' || status === 'upcoming') && (
        <span className="text-[11px] font-bold font-['DM_Mono']" style={{ color: s.text }}>
          {index + 1}
        </span>
      )}
    </button>
  )
}

// ── Connector line ───────────────────────────────────────────────
function Connector({ filled, vertical }) {
  if (vertical) {
    return (
      <div className="w-[2px] flex-1 mx-auto my-1 rounded-full transition-all duration-500"
        style={{
          background: filled
            ? 'linear-gradient(to bottom, var(--gs-accent), color-mix(in srgb, var(--gs-accent) 50%, transparent))'
            : 'var(--gs-border)',
          minHeight: 16,
        }}
      />
    )
  }
  return (
    <div className="flex-1 h-[2px] mx-1 rounded-full transition-all duration-500"
      style={{
        background: filled
          ? 'linear-gradient(to right, var(--gs-accent), color-mix(in srgb, var(--gs-accent) 50%, transparent))'
          : 'var(--gs-border)',
      }}
    />
  )
}

// ── Main component ───────────────────────────────────────────────
/**
 * @param {{
 *   steps:        { label: string, description?: string, status?: string }[],
 *   current:      number,
 *   onChange?:    (index: number) => void,
 *   orientation?: 'horizontal'|'vertical',
 *   children?:    React.ReactNode,
 *   className?:   string,
 * }} props
 */
const Stepper = ({
  steps,
  current,
  onChange,
  orientation = 'horizontal',
  children,
  className   = '',
}) => {
  const getStatus = (i) => {
    if (steps[i].status) return steps[i].status
    if (i < current)  return 'complete'
    if (i === current) return 'active'
    return 'upcoming'
  }

  const isVertical = orientation === 'vertical'

  // ── Horizontal ──────────────────────────────────────────────
  if (!isVertical) {
    return (
      <div className={className}>
        <div className="flex items-start">
          {steps.map((step, i) => {
            const status   = getStatus(i)
            const isLast   = i === steps.length - 1
            const filled   = i < current
            const clickable = !!onChange && status !== 'upcoming'

            return (
              <div key={i} className="flex items-start flex-1 min-w-0">
                {/* Circle + label column */}
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <StepCircle
                    status={status}
                    index={i}
                    onClick={() => onChange?.(i)}
                    clickable={clickable}
                  />
                  <div className="text-center px-1">
                    <p
                      className="text-xs font-semibold font-['Syne'] leading-tight"
                      style={{ color: status === 'active' ? 'var(--gs-accent)' : status === 'complete' ? 'var(--gs-text)' : 'var(--gs-muted)' }}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-[10px] font-['DM_Mono'] text-gs-muted mt-0.5 leading-tight">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="flex-1 pt-4 px-1 min-w-[16px]">
                    <Connector filled={filled} vertical={false} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    )
  }

  // ── Vertical ────────────────────────────────────────────────
  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Track column */}
      <div className="flex flex-col items-center">
        {steps.map((step, i) => {
          const status = getStatus(i)
          const isLast = i === steps.length - 1
          const filled = i < current

          return (
            <div key={i} className="flex flex-col items-center">
              <StepCircle
                status={status}
                index={i}
                onClick={() => onChange?.(i)}
                clickable={!!onChange && status !== 'upcoming'}
              />
              {!isLast && <Connector filled={filled} vertical />}
            </div>
          )
        })}
      </div>

      {/* Labels column */}
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const status = getStatus(i)
          const isLast = i === steps.length - 1

          return (
            <div
              key={i}
              className="flex flex-col justify-start"
              style={{ minHeight: isLast ? 32 : 56 }}
            >
              <p
                className="text-sm font-semibold font-['Syne'] leading-tight mt-1"
                style={{ color: status === 'active' ? 'var(--gs-accent)' : status === 'complete' ? 'var(--gs-text)' : 'var(--gs-muted)' }}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[11px] font-['DM_Mono'] text-gs-muted mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {children && <div className="mt-4 ml-12">{children}</div>}
    </div>
  )
}

export default Stepper
