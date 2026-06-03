/**
 * Atom: Modal
 * Responsive portal modal with neon accent, focus trap, Escape-to-close.
 * Variants: default | danger | success | info
 * Sizes: sm | md | lg
 */

import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-[540px]',
  lg: 'max-w-2xl',
}

const VARIANTS = {
  default: { color: '#00C9A7', icon: null },
  success: { color: '#00C9A7', icon: 'check' },
  danger:  { color: '#EF4444', icon: 'alert' },
  info:    { color: '#0EA5E9', icon: 'bell' },
  warn:    { color: '#F59E0B', icon: 'alert' },
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   subtitle?: string,
 *   icon?: string,
 *   variant?: 'default'|'success'|'danger'|'info'|'warn',
 *   size?: 'sm'|'md'|'lg',
 *   footer?: React.ReactNode,
 *   children?: React.ReactNode,
 * }} props
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  variant = 'default',
  size = 'md',
  footer,
  children,
}) => {
  const boxRef = useRef(null)
  const v = VARIANTS[variant] ?? VARIANTS.default
  const resolvedIcon = icon ?? v.icon

  useEffect(() => {
    if (!open) return

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={boxRef}
        className={[
          'relative w-full flex flex-col outline-none',
          'bg-gs-card border border-gs-border rounded-2xl overflow-hidden',
          'max-h-[calc(100vh-2rem)] animate-slide-up',
          SIZES[size] ?? SIZES.md,
        ].join(' ')}
        style={{
          boxShadow: `0 0 0 1px ${v.color}18, 0 30px 60px -12px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Neon top stripe */}
        <div
          className="h-[2px] w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${v.color} 50%, transparent 100%)`,
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 shrink-0">
          {resolvedIcon && (
            <span
              className="p-2 rounded-xl shrink-0 mt-0.5"
              style={{
                background: `${v.color}12`,
                border: `1px solid ${v.color}28`,
              }}
            >
              <Icon name={resolvedIcon} size={17} color={v.color} />
            </span>
          )}

          <div className="flex-1 min-w-0">
            {title && (
              <h2
                id="modal-title"
                className="text-[15px] font-bold text-gs-text leading-snug font-['Syne']"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[12px] text-gs-soft font-['DM_Mono'] mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
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
        {children && (
          <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1
                          text-[13px] text-gs-soft leading-relaxed font-['Syne']">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <>
            <div className="h-px bg-gs-border mx-5 sm:mx-6 shrink-0" />
            <div className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3 shrink-0 flex-wrap">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
