import { forwardRef, useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'
import { montoEnLetras } from '../../../lib/utils/montoEnLetras'

// Layout de impresión para una venta. Estilos inline para que html2pdf
// no dependa de Tailwind ni de variables CSS del shell oscuro.
// Se reusa en la vista pública /p/boleta/:token.

const C = {
  brand: '#00C9A7',
  dark: '#0B7A6A',   // teal oscuro: texto blanco legible encima
  soft: '#EEF8F6',
  text: '#111',
  muted: '#555',
}

// Mismo logo que public/favicon.svg, embebido para que html2canvas no dependa de la red
const LOGO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
  + '<rect width="32" height="32" rx="8" fill="#00C9A7"/>'
  + '<circle cx="16" cy="16" r="10" fill="none" stroke="#0D0F14" stroke-width="2"/>'
  + '<path d="M20.2 11.8l-2.8 8.4-8.4 2.8 2.8-8.4 8.4-2.8z" fill="#0D0F14"/>'
  + '</svg>'
)}`

const S = {
  page: {
    width: '210mm',
    // ponytail: sin minHeight de página — el A4 fijo + scale de html2pdf empujaba 1px a página 2.
    // El aire lo da el minHeight de la caja de items.
    padding: '10mm 12mm',
    background: '#ffffff',
    color: C.text,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.4,
    boxSizing: 'border-box',
  },
  box: { border: `1.5px solid ${C.dark}`, borderRadius: 8, boxSizing: 'border-box' },
  row: { display: 'flex', gap: 8, marginBottom: 8 },
  label: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 },
  small: { fontSize: 10, color: C.muted },
  th: {
    padding: '7px 8px', fontSize: 10, fontWeight: 700, textAlign: 'left',
    textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff',
  },
  td: { padding: '6px 8px', verticalAlign: 'top' },
  right: { textAlign: 'right' },
}

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

// `fecha` es DATE ('2026-11-21'): new Date() la leería como UTC y en Perú saldría el día anterior
const fechaEmision = (v) => {
  if (v.fecha) {
    const [y, m, d] = String(v.fecha).slice(0, 10).split('-')
    return `${d}/${m}/${y}`
  }
  return new Date(v.created_at).toLocaleDateString('es-PE')
}

const DEFAULT_CONFIG = {
  empresa_razon_social: 'Geotop Perú S.A.C.',
  empresa_ruc: '',
  empresa_direccion: 'Miraflores, Lima',
  empresa_telefono: '',
  empresa_email: '',
  lugar_emision: 'Lima, Perú',
  boleta_pie: 'Documento generado por GeoStock — gracias por su compra.',
  igv_pct: '8',
}

const Campo = ({ label, value }) => (
  <div style={{ display: 'flex', marginBottom: 3 }}>
    <span style={{ ...S.label, width: 118, flexShrink: 0 }}>{label}</span>
    <span style={{ width: 12, fontWeight: 700 }}>:</span>
    <span style={{ flex: 1 }}>{value || '—'}</span>
  </div>
)

const Fila = ({ label, value, strong }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', marginBottom: 3,
    ...(strong && { fontSize: 13, fontWeight: 800, color: C.dark, borderTop: `1px solid ${C.dark}`, paddingTop: 4, marginTop: 4 }),
  }}>
    <span style={S.label}>{label}</span>
    <span>{value}</span>
  </div>
)

export const boletaPublicUrl = (token) =>
  `${import.meta.env.VITE_APP_URL || window.location.origin}/p/boleta/${token}`

export const BoletaPdf = forwardRef(({ venta, config, documento = 'BOLETA DE VENTA' }, ref) => {
  // QR solo si la venta tiene token (las cotizaciones no). PNG en <img>: html2canvas lo captura fiable.
  const qrUrl = venta?.token ? boletaPublicUrl(venta.token) : null
  const [qr, setQr] = useState(null)
  useEffect(() => {
    if (!qrUrl) {
      setQr(null)
      return
    }
    let alive = true
    QRCodeLib.toDataURL(qrUrl, { margin: 1, width: 260, errorCorrectionLevel: 'M' })
      .then((url) => { if (alive) setQr(url) })
      .catch(() => {})
    return () => { alive = false }
  }, [qrUrl])

  if (!venta) return null
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) }
  const contacto = [cfg.empresa_telefono, cfg.empresa_email].filter(Boolean).join(' · ')
  // ponytail: clamp 0-100 — protege ante valores malos en config; ceiling: si necesitas exenciones por item, mueve IGV a venta_items
  const igvPct = Math.min(Math.max(Number(cfg.igv_pct) || 0, 0), 100)

  const items = venta.venta_items || []
  const subtotal = Number(
    venta.monto_total ?? venta.total ?? items.reduce(
      (s, it) => s + Number(it.subtotal ?? (it.cantidad * it.precio_unitario) ?? 0), 0
    )
  )
  const igv = subtotal * (igvPct / 100)
  const totalFinal = subtotal + igv

  const cliente = venta.cliente || venta.clientes?.nombre || 'Cliente sin nombre'
  const tipoDoc = venta.cliente_tipo_doc || venta.clientes?.tipo_doc
  const nroDoc = venta.cliente_nro_doc || venta.clientes?.nro_doc
  const direccion = venta.cliente_direccion || venta.clientes?.direccion
  const vendedor = venta.perfiles?.nombre || 'Sistema'

  return (
    <div ref={ref} style={S.page}>
      {/* Cabecera: logo · empresa · recuadro del comprobante */}
      <div style={{ ...S.row, alignItems: 'stretch', marginBottom: 10 }}>
        <img src={LOGO} alt="GeoStock" style={{ width: 74, height: 74, alignSelf: 'center' }} />
        <div style={{ flex: 1, textAlign: 'center', alignSelf: 'center', padding: '0 6px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.dark, letterSpacing: 1.5 }}>GEOSTOCK</div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{cfg.empresa_razon_social}</div>
          {cfg.empresa_direccion && <div style={S.small}>{cfg.empresa_direccion}</div>}
          {contacto && <div style={S.small}>{contacto}</div>}
        </div>
        <div style={{ ...S.box, width: 220, overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ padding: '8px 6px', fontSize: 14, fontWeight: 800 }}>
            RUC: {cfg.empresa_ruc || '—'}
          </div>
          <div style={{ background: C.dark, color: '#fff', padding: '6px', fontSize: 12, fontWeight: 800, letterSpacing: 0.6 }}>
            {documento}
          </div>
          <div style={{ padding: '8px 6px', fontSize: 15, fontWeight: 800 }}>
            N° {String(venta.id ?? '').padStart(6, '0')}
          </div>
        </div>
      </div>

      {/* Cliente · emisión */}
      <div style={S.row}>
        <div style={{ ...S.box, flex: 1.5, padding: '8px 10px' }}>
          <Campo label="Cliente" value={cliente} />
          <Campo label={tipoDoc || 'Documento'} value={nroDoc} />
          <Campo label="Dirección" value={direccion} />
        </div>
        <div style={{ ...S.box, flex: 1, padding: '8px 10px' }}>
          <Campo label="Fecha de emisión" value={fechaEmision(venta)} />
          <Campo label="Lugar de emisión" value={cfg.lugar_emision} />
          <Campo label="Moneda" value="SOLES" />
          <Campo label="Vendedor" value={vendedor} />
        </div>
      </div>

      {/* Detalle — el minHeight deja el aire de la hoja aunque haya pocos items */}
      <div style={{ ...S.box, overflow: 'hidden', minHeight: '124mm', marginBottom: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.dark }}>
              <th style={S.th}>Descripción</th>
              <th style={{ ...S.th, width: 110 }}>Tipo</th>
              <th style={{ ...S.th, ...S.right, width: 70 }}>Cantidad</th>
              <th style={{ ...S.th, ...S.right, width: 95 }}>Precio</th>
              <th style={{ ...S.th, ...S.right, width: 100 }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id ?? i} style={{ background: i % 2 ? '#fff' : C.soft }}>
                <td style={{ ...S.td, fontWeight: 600 }}>{it.equipos?.nombre || it.equipo_id || '—'}</td>
                <td style={{ ...S.td, color: C.muted }}>{it.equipos?.tipo || '—'}</td>
                <td style={{ ...S.td, ...S.right }}>{it.cantidad}</td>
                <td style={{ ...S.td, ...S.right }}>{fmt(it.precio_unitario)}</td>
                <td style={{ ...S.td, ...S.right, fontWeight: 600 }}>
                  {fmt(it.subtotal ?? (it.cantidad * it.precio_unitario))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Observaciones · totales */}
      <div style={{ ...S.box, ...S.row, padding: '8px 10px', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {venta.descripcion && (
            <>
              <div style={S.label}>Observaciones</div>
              <div style={{ marginTop: 2 }}>{venta.descripcion}</div>
            </>
          )}
        </div>
        <div style={{ width: 230 }}>
          <Fila label="Sub total" value={fmt(subtotal)} />
          <Fila label={`IGV (${igvPct}%)`} value={fmt(igv)} />
          <Fila label="Total" value={fmt(totalFinal)} strong />
        </div>
      </div>

      {/* Importe en letras */}
      <div style={{ ...S.box, ...S.row, padding: '8px 10px', gap: 14, alignItems: 'baseline' }}>
        <span style={{ ...S.label, whiteSpace: 'nowrap' }}>Importe en letras:</span>
        <span>SON: {montoEnLetras(totalFinal)}</span>
      </div>

      {/* QR · leyenda */}
      <div style={{ ...S.row, marginBottom: 6 }}>
        {qrUrl && (
          <div style={{ ...S.box, width: 132, height: 132, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {qr && <img src={qr} alt="QR del comprobante" style={{ width: 116, height: 116 }} />}
          </div>
        )}
        <div style={{
          ...S.box, flex: 1, minHeight: 132, padding: 12, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <div style={{ fontSize: 12 }}>
            Representación impresa de la <strong>{documento}</strong>.
          </div>
          {qrUrl && (
            <div style={{ fontSize: 12 }}>Escanee el código QR para consultar este comprobante en línea.</div>
          )}
          {cfg.boleta_pie && <div style={{ ...S.small, marginTop: 4 }}>{cfg.boleta_pie}</div>}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontWeight: 800, letterSpacing: 1.5, fontSize: 11 }}>
        *** GEOSTOCK ***
      </div>
    </div>
  )
})

BoletaPdf.displayName = 'BoletaPdf'
