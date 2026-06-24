import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { FiCamera, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { Button, useToast } from '../../ui'

const REGION_ID = 'gs-qr-region'

// Extrae el id de un texto escaneado. Acepta:
//  - URL absoluta: https://.../p/equipo/123
//  - Path: /p/equipo/123
//  - Solo el id numérico (fallback)
const parseEquipoId = (text) => {
  if (!text) return null
  const m = String(text).match(/\/p\/equipo\/([^/?#]+)/i)
  if (m) return decodeURIComponent(m[1])
  // ponytail: si el QR es solo el id (legacy / test), aceptarlo
  if (/^[a-zA-Z0-9-]+$/.test(text.trim())) return text.trim()
  return null
}

export const ScanQRPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(true)
  const [manualId, setManualId] = useState('')

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode(REGION_ID, { verbose: false })
    scannerRef.current = scanner

    const onSuccess = (decoded) => {
      const id = parseEquipoId(decoded)
      if (!id) {
        toast?.error?.('QR no reconocido')
        return
      }
      // Detener antes de navegar — evita seguir consumiendo cámara
      scanner.stop().catch(() => {}).finally(() => {
        navigate(`/dashboard/equipment/${encodeURIComponent(id)}`)
      })
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onSuccess,
        () => {}, // onError por frame: silenciar, son normales mientras enfoca
      )
      .then(() => { if (!cancelled) setStarting(false) })
      .catch((err) => {
        if (cancelled) return
        setStarting(false)
        setError(err?.message || 'No se pudo acceder a la cámara')
      })

    return () => {
      cancelled = true
      // ponytail: stop puede rechazar si no llegó a iniciar — swallow
      scanner.stop().catch(() => {}).finally(() => scanner.clear?.())
    }
  }, [navigate, toast])

  const onManualGo = (e) => {
    e?.preventDefault?.()
    const id = parseEquipoId(manualId)
    if (!id) {
      toast?.error?.('ID inválido')
      return
    }
    navigate(`/dashboard/equipment/${encodeURIComponent(id)}`)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)} className="!p-2">
          <FiArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gs-text flex items-center gap-2">
          <FiCamera /> Escanear QR
        </h1>
      </div>

      <p className="text-sm text-gs-soft">
        Apunta la cámara al código QR del equipo. La app abrirá los detalles automáticamente.
      </p>

      <div className="bg-gs-surface border border-gs-border rounded-xl overflow-hidden">
        <div
          id={REGION_ID}
          className="w-full aspect-square bg-black"
        />
        {starting && (
          <p className="text-center text-xs text-gs-soft py-3">
            Iniciando cámara…
          </p>
        )}
        {error && (
          <div className="p-4 flex gap-2 items-start text-sm text-gs-danger border-t border-gs-danger/30">
            <FiAlertCircle className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No se pudo abrir la cámara</p>
              <p className="text-xs text-gs-soft mt-1">{error}</p>
              <p className="text-xs text-gs-soft mt-1">
                Revisa permisos del navegador o ingresa el ID manualmente abajo.
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={onManualGo}
        className="bg-gs-surface border border-gs-border rounded-xl p-4 space-y-3"
      >
        <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px]">
          ¿Sin cámara? Ingresa el ID o URL del equipo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="EQ-001 o https://…/p/equipo/EQ-001"
            className="flex-1 bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent"
          />
          <Button type="submit" variant="primary" disabled={!manualId.trim()}>
            Ir
          </Button>
        </div>
      </form>
    </div>
  )
}
