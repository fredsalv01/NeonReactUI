/**
 * Atom: Toast
 * Notificaciones flotantes para feedback de operaciones.
 * Uso: importar useToast() desde context/ToastContext
 */

import { useEffect } from 'react'
import Icon from './Icon'

const STYLES = {
  success: { bg: '#00C9A715', border: '#00C9A740', icon: 'check',  color: '#00C9A7' },
  error:   { bg: '#EF444415', border: '#EF444440', icon: 'alert',  color: '#EF4444' },
  loading: { bg: '#0EA5E915', border: '#0EA5E940', icon: null,     color: '#0EA5E9' },
  info:    { bg: '#94A3B815', border: '#94A3B840', icon: 'bell',   color: '#94A3B8' },
}

export const Toast = ({ id, type = 'info', message, onRemove }) => {
  const s = STYLES[type] ?? STYLES.info

  useEffect(() => {
    if (type === 'loading') return   // los loading no se auto-cierran
    const t = setTimeout(() => onRemove(id), type === 'error' ? 4500 : 3000)
    return () => clearTimeout(t)
  }, [id, type, onRemove])

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
                 shadow-lg animate-fade-in backdrop-blur-sm min-w-[260px] max-w-[340px]"
      style={{ background: s.bg, borderColor: s.border }}
    >
      {type === 'loading'
        ? <span style={{
            width: 15, height: 15, flexShrink: 0,
            border: `2px solid ${s.color}30`,
            borderTopColor: s.color,
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin .65s linear infinite',
          }} />
        : <Icon name={s.icon} size={15} color={s.color} />
      }
      <span className="text-gs-text text-[13px] font-medium leading-tight">{message}</span>
      {type !== 'loading' && (
        <button onClick={() => onRemove(id)}
          className="ml-auto text-gs-muted hover:text-gs-text transition-colors shrink-0">
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
  )
}

export default Toast
