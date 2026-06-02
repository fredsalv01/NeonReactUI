/**
 * Organism: Drawer / Sheet
 * Slide-in panel from right or left. Portal-rendered with backdrop,
 * focus trap, and Escape-to-close. Smooth enter/exit CSS transition.
 *
 * Side:  'right' | 'left'
 * Sizes: 'sm' (320) | 'md' (440) | 'lg' (580) | 'full'
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

const WIDTHS = { sm: 320, md: 440, lg: 580, full: '100%' }

/**
 * @param {{
 *   open:       boolean,
 *   onClose:    () => void,
 *   title?:     string,
 *   subtitle?:  string,
 *   side?:      'right'|'left',
 *   size?:      'sm'|'md'|'lg'|'full',
 *   footer?:    React.ReactNode,
 *   children?:  React.ReactNode,
 * }} props
 */
const Drawer = ({
  open,
  onClose,
  title,
  subtitle,
  side     = 'right',
  size     = 'md',
  footer,
  children,
}) => {
  // mounted: DOM element exists. visible: CSS transition target.
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Double RAF ensures the element is painted before the transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  // Escape key
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!mounted) return
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [mounted, handleKey])

  if (!mounted) return null

  const width        = WIDTHS[size] ?? WIDTHS.md
  const translateOut = side === 'right' ? 'translateX(100%)' : 'translateX(-100%)'
  const borderSide   = side === 'right' ? 'borderLeft' : 'borderRight'

  return createPortal(
    <div className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          opacity:    visible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute top-0 bottom-0 flex flex-col outline-none"
        style={{
          [side]:      0,
          width,
          maxWidth:    '100vw',
          background:  'var(--gs-card)',
          [borderSide]: '1px solid var(--gs-border)',
          boxShadow:   side === 'right'
            ? '-8px 0 40px rgba(0,0,0,0.5)'
            : '8px 0 40px rgba(0,0,0,0.5)',
          transform:   visible ? 'translateX(0)' : translateOut,
          transition:  'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Neon top accent stripe */}
        <div
          className="h-[2px] w-full shrink-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--gs-accent) 50%, transparent 100%)',
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 shrink-0">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-[15px] font-bold text-gs-text font-['Syne'] leading-snug">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[12px] text-gs-soft font-['DM_Mono'] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="shrink-0 p-1.5 rounded-lg text-gs-muted
                       hover:text-gs-text hover:bg-white/5
                       transition-all duration-150 cursor-pointer"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gs-border mx-5 sm:mx-6 shrink-0" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 text-sm text-gs-soft">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <>
            <div className="h-px bg-gs-border mx-5 sm:mx-6 shrink-0" />
            <div className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3 flex-wrap shrink-0">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Drawer
