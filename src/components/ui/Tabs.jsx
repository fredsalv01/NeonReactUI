/**
 * Molecule: Tabs
 * Tab list with a smooth sliding neon underline indicator + content slot.
 *
 * Tab shape: { value: string, label: string, icon?: string, badge?: number | string }
 */

import { useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon'

/**
 * @param {{
 *   tabs:       { value: string, label: string, icon?: string, badge?: number|string }[],
 *   value:      string,
 *   onChange:   (val: string) => void,
 *   children?:  React.ReactNode,
 *   className?: string,
 * }} props
 */
const Tabs = ({
  tabs,
  value,
  onChange,
  children,
  className = '',
}) => {
  const tabRefs  = useRef({})
  const trackRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  // Recompute indicator position whenever the active tab or tab list changes
  useLayoutEffect(() => {
    const el     = tabRefs.current[value]
    const track  = trackRef.current
    if (!el || !track) return

    const eR = el.getBoundingClientRect()
    const tR = track.getBoundingClientRect()

    setIndicator({ left: eR.left - tR.left, width: eR.width, ready: true })
  }, [value, tabs])

  return (
    <div className={className}>
      {/* ── Tab list ───────────────────────────────────────── */}
      <div
        ref={trackRef}
        role="tablist"
        className="relative flex border-b border-gs-border overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Sliding accent underline */}
        <span
          className="absolute bottom-0 h-[2px] rounded-full"
          style={{
            left:       indicator.left,
            width:      indicator.width,
            background: 'var(--gs-accent)',
            boxShadow:  '0 0 8px color-mix(in srgb, var(--gs-accent) 50%, transparent)',
            opacity:    indicator.ready ? 1 : 0,
            transition: indicator.ready
              ? 'left 220ms cubic-bezier(0.4, 0, 0.2, 1), width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 120ms'
              : 'none',
          }}
        />

        {tabs.map(tab => {
          const isActive = tab.value === value
          return (
            <button
              key={tab.value}
              ref={el => { tabRefs.current[tab.value] = el }}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={[
                'relative flex items-center gap-2 px-4 py-3 -mb-px',
                'text-sm font-semibold whitespace-nowrap font-["Syne"]',
                'transition-colors duration-200 cursor-pointer outline-none',
                'focus-visible:ring-2 focus-visible:ring-gs-accent/30 rounded-t-lg',
                isActive ? 'text-gs-accent' : 'text-gs-soft hover:text-gs-text',
              ].join(' ')}
            >
              {tab.icon && (
                <Icon
                  name={tab.icon}
                  size={14}
                  color={isActive ? 'var(--gs-accent)' : 'currentColor'}
                />
              )}

              {tab.label}

              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={[
                    'text-[10px] font-bold leading-none px-1.5 py-0.5',
                    'rounded-full font-["DM_Mono"]',
                    isActive
                      ? 'bg-gs-accent/15 text-gs-accent'
                      : 'bg-gs-surface text-gs-muted',
                  ].join(' ')}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {children && (
        <div className="pt-5">
          {children}
        </div>
      )}
    </div>
  )
}

export default Tabs
