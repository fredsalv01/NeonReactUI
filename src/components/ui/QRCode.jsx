/**
 * Molecule: QRCode
 * Genera un QR real y escaneable usando la librería `qrcode`.
 * Dibuja en canvas y superpone el logo GeoStock al centro.
 */
import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

const GS_ACCENT = '#00C9A7'

const QRCode = ({ data, size = 200, canvasRef: externalRef }) => {
  const internalRef = useRef(null)
  const ref = externalRef ?? internalRef

  useEffect(() => {
    if (!ref.current || !data) return

    const canvas = ref.current
    canvas.width  = size
    canvas.height = size

    // 1. Generar QR real con qrcode lib — error correction H para que
    //    el logo central (30% del área) no rompa la legibilidad
    QRCodeLib.toCanvas(canvas, data, {
      width:           size,
      margin:          2,
      errorCorrectionLevel: 'H',
      color: {
        dark:  '#0D0F14',   // módulos oscuros
        light: '#FFFFFF',   // fondo
      },
    }, (err) => {
      if (err) { console.error('[QRCode]', err); return }

      // 2. Superponer logo GeoStock al centro
      const ctx   = canvas.getContext('2d')
      const logo  = Math.round(size * 0.18)   // 18% del tamaño total
      const lx    = Math.round((size - logo) / 2)
      const ly    = Math.round((size - logo) / 2)
      const pad   = 5
      const r     = 6

      // Fondo blanco detrás del logo (para no cortar módulos)
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(lx - pad, ly - pad, logo + pad * 2, logo + pad * 2, r + 2)
      ctx.fill()

      // Degradado del logo
      const grad = ctx.createLinearGradient(lx, ly, lx + logo, ly + logo)
      grad.addColorStop(0, GS_ACCENT)
      grad.addColorStop(1, '#0EA5E9')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(lx, ly, logo, logo, r)
      ctx.fill()

      // Ícono brújula simplificado (punto central)
      ctx.fillStyle = '#0D0F14'
      ctx.beginPath()
      ctx.arc(lx + logo / 2, ly + logo / 2, logo * 0.18, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [data, size, ref])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ borderRadius: 8, display: 'block' }}
    />
  )
}

export default QRCode
