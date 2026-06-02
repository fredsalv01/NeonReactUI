/**
 * Molecule: Alert / Banner
 * Inline persistent contextual feedback — distinct from Toast.
 * Variants: 'info' | 'success' | 'warning' | 'danger'
 */

import { useState } from 'react'
import Icon from './Icon'

const VARIANTS = {
  info:    { color: '#0EA5E9', icon: 'bell',  bg: '#0EA5E910', border: '#0EA5E926' },
  success: { color: '#00C9A7', icon: 'check', bg: '#00C9A710', border: '#00C9A726' },
  warning: { color: '#F59E0B', icon: 'alert', bg: '#F59E0B10', border: '#F59E0B26' },
  danger:  { color: '#EF4444', icon: 'alert', bg: '#EF444410', border: '#EF444426' },
}

/**
 * @param {{
 *   variant?:   'info'|'success'|'warning'|'danger',
 *   title?:     string,
 *   children?:  React.ReactNode,
 *   onDismiss?: () => void,
 *   className?: string,
 * }} props
 */
const Alert = ({
  variant   = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const [gone, setGone] = useState(false)
  const v = VARIANTS[variant] ?? VARIANTS.info

  if (gone) return null

  const handleDismiss = () => {
    setGone(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border animate-fade-in ${className}`}
      style={{ background: v.bg, borderColor: v.border }}
    >
      {/* Icon */}
      <span className="shrink-0 mt-0.5">
        <Icon name={v.icon} size={15} color={v.color} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p
            className="text-[13px] font-bold font-['Syne'] leading-snug"
            style={{ color: v.color }}
          >
            {title}
          </p>
        )}
        {children && (
          <p className={`text-[13px] text-gs-soft font-['Syne'] leading-relaxed ${title ? 'mt-0.5' : ''}`}>
            {children}
          </p>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 mt-0.5 p-0.5 rounded text-gs-muted
                     hover:text-gs-text transition-colors cursor-pointer"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}

export default Alert
