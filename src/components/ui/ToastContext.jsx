/**
 * Context: ToastContext
 * Sistema global de notificaciones toast.
 *
 * Uso:
 *   const { toast } = useToast()
 *   toast.success('Usuario creado correctamente')
 *   toast.error('Error al guardar')
 *   const id = toast.loading('Guardando...')
 *   toast.dismiss(id)
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Toast } from './Toast'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const add = useCallback((type, message) => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, type, message }])
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg)  => add('success', msg),
    error:   (msg)  => add('error',   msg),
    loading: (msg)  => add('loading', msg),
    info:    (msg)  => add('info',    msg),
    dismiss,
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — full-width strip on mobile, fixed corner on desktop */}
      <div className="fixed z-[100] pointer-events-none
                      bottom-3 left-3 right-3
                      sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto
                      flex flex-col gap-2 items-stretch sm:items-end">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onRemove={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
