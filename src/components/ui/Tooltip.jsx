/**
 * Atom: Tooltip
 * Hover/focus tooltip rendered via createPortal.
 * Placement: 'top' | 'bottom' | 'left' | 'right'
 */

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

// ── Position calculators ────────────────────────────────────────
const GAP = 8

const getCoords = (placement, trigger, tooltip) => {
  const { top: tT, left: tL, right: tR, bottom: tB, width: tW, height: tH } = trigger
  const { width: ttW, height: ttH } = tooltip

  const coords = {
    top:    { top: tT - ttH - GAP,          left: tL + tW / 2 - ttW / 2 },
    bottom: { top: tB + GAP,                 left: tL + tW / 2 - ttW / 2 },
    left:   { top: tT + tH / 2 - ttH / 2,   left: tL - ttW - GAP },
    right:  { top: tT + tH / 2 - ttH / 2,   left: tR + GAP },
  }

  const { top, left } = coords[placement] ?? coords.top

  // Clamp to viewport with 8px margin
  return {
    top:  Math.max(8, Math.min(top,  window.innerHeight - ttH - 8)),
    left: Math.max(8, Math.min(left, window.innerWidth  - ttW - 8)),
  }
}

// Arrow: rotated square — border on the two "outer" sides per placement
const ARROW = {
  top:    { bottom: -4, left: '50%', marginLeft: -4, borderRight: '1px solid', borderBottom: '1px solid' },
  bottom: { top: -4,    left: '50%', marginLeft: -4, borderLeft:  '1px solid', borderTop:    '1px solid' },
  left:   { right: -4,  top:  '50%', marginTop:  -4, borderTop:   '1px solid', borderRight:  '1px solid' },
  right:  { left: -4,   top:  '50%', marginTop:  -4, borderBottom:'1px solid', borderLeft:   '1px solid' },
}

// ── Component ───────────────────────────────────────────────────
/**
 * @param {{
 *   content:    React.ReactNode,
 *   placement?: 'top'|'bottom'|'left'|'right',
 *   delay?:     number,
 *   disabled?:  boolean,
 *   children:   React.ReactNode,
 *   className?: string,
 * }} props
 */
const Tooltip = ({
  content,
  placement = 'top',
  delay     = 130,
  disabled  = false,
  children,
  className = '',
}) => {
  const [visible,    setVisible]    = useState(false)
  const [coords,     setCoords]     = useState({ top: 0, left: 0 })
  const [positioned, setPositioned] = useState(false)

  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timer      = useRef(null)

  const show = useCallback(() => {
    if (disabled || !content) return
    timer.current = setTimeout(() => setVisible(true), delay)
  }, [disabled, content, delay])

  const hide = useCallback(() => {
    clearTimeout(timer.current)
    setVisible(false)
    setPositioned(false)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  // Position after the tooltip has rendered in the DOM
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return
    const tr = triggerRef.current.getBoundingClientRect()
    const tt = tooltipRef.current.getBoundingClientRect()
    setCoords(getCoords(placement, tr, tt))
    setPositioned(true)
  }, [visible, placement])

  const arrowStyle = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: 'var(--gs-card)',
    transform: 'rotate(45deg)',
    borderColor: 'var(--gs-border)',
    ...ARROW[placement],
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={`inline-flex ${className}`}
      >
        {children}
      </span>

      {visible && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-[200] pointer-events-none"
          style={{
            top:     coords.top,
            left:    coords.left,
            opacity: positioned ? 1 : 0,
            transition: 'opacity 140ms ease',
          }}
        >
          <div
            className="relative px-2.5 py-1.5 rounded-lg
                       text-xs font-['Syne'] text-gs-text"
            style={{
              background: 'var(--gs-card)',
              border:     '1px solid var(--gs-border)',
              boxShadow:  '0 4px 16px rgba(0,0,0,0.45)',
              maxWidth:   240,
              whiteSpace: 'nowrap',
            }}
          >
            {content}
            <span style={arrowStyle} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Tooltip
