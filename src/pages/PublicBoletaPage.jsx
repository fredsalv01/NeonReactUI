import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui'
import { BoletaPdf } from '../components/dashboard/pdf/BoletaPdf'

// Vista pública del QR de la boleta — sin login.
const A4_PX = 794 // 210mm a 96dpi
const fitScale = () => Math.min(1, (window.innerWidth - 24) / A4_PX)

export const PublicBoletaPage = () => {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | notfound | error
  const [scale, setScale] = useState(fitScale)

  useEffect(() => {
    const onResize = () => setScale(fitScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    // ponytail: RPC con columnas fijas (fn_boleta_publica); la llave es el token uuid, no el id
    supabase.rpc('fn_boleta_publica', { p_token: token }).then(({ data: res, error }) => {
      if (cancelled) return
      if (error) {
        setStatus(error.code === '22P02' ? 'notfound' : 'error') // 22P02: token con formato inválido
        return
      }
      setData(res)
      setStatus(res ? 'ok' : 'notfound')
    })
    return () => { cancelled = true }
  }, [token])

  return (
    <div className="min-h-screen bg-gs-bg py-4 flex flex-col items-center">
      {status === 'loading' && (
        <div className="mt-24"><Spinner variant="orbit" size={40} color="#00C9A7" label="Cargando comprobante" /></div>
      )}

      {status === 'notfound' && (
        <div className="text-center mt-24 px-6">
          <div className="text-5xl mb-3">🧾</div>
          <p className="text-gs-soft text-lg">Comprobante no encontrado</p>
          <p className="text-gs-muted text-xs mt-2">Verifique que el código QR esté completo.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-24 mx-4 text-gs-danger bg-gs-danger/10 border border-gs-danger/25 rounded-xl p-4 text-sm">
          No se pudo cargar el comprobante. Intente de nuevo.
        </div>
      )}

      {status === 'ok' && (
        // zoom (no transform) para que el alto escalado también ocupe menos en el layout
        <div style={{ zoom: scale }} className="shadow-2xl">
          <BoletaPdf venta={data.venta} config={data.config} />
        </div>
      )}
    </div>
  )
}
