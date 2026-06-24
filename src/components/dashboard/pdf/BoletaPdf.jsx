import { forwardRef } from 'react'

// Layout de impresión para una venta. Estilos inline para que html2pdf
// no dependa de Tailwind ni de variables CSS del shell oscuro.
const IGV_RATE = 0.08

const styles = {
  page: {
    width: '210mm',
    // ponytail: sin minHeight — el A4 fijo + scale de html2pdf empujaba 1px a página 2
    padding: '14mm 14mm',
    background: '#ffffff',
    color: '#111',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 12,
    lineHeight: 1.4,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #00C9A7',
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: { fontSize: 22, fontWeight: 800, color: '#00C9A7', letterSpacing: 1 },
  meta:  { textAlign: 'right', fontSize: 11, color: '#444' },
  metaStrong: { color: '#111', fontWeight: 700 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 10, color: '#555', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 6,
  },
  twoCol: { display: 'flex', gap: 24, marginBottom: 14 },
  col: { flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 4 },
  th: {
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#666',
    borderBottom: '1px solid #ccc',
    padding: '8px 6px',
  },
  td: { padding: '8px 6px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  right: { textAlign: 'right' },
  totalsBox: {
    marginLeft: 'auto', marginTop: 14, width: '40%',
    background: '#f6f8f7', padding: 12, borderRadius: 6,
  },
  totalsRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 },
  totalsGrand: { display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, borderTop: '1px solid #ccc', paddingTop: 6, marginTop: 6 },
  footer: { marginTop: 28, fontSize: 10, color: '#777', textAlign: 'center' },
}

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

const DEFAULT_CONFIG = {
  empresa_razon_social: 'Geotop Perú S.A.C.',
  empresa_ruc: '',
  empresa_direccion: 'Miraflores, Lima',
  empresa_telefono: '',
  empresa_email: '',
  boleta_pie: 'Documento generado por GeoStock — gracias por su compra.',
}

export const BoletaPdf = forwardRef(({ venta, config }, ref) => {
  if (!venta) return null
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) }
  const contactoLinea = [cfg.empresa_telefono, cfg.empresa_email].filter(Boolean).join(' · ')

  const items = (venta.venta_items && venta.venta_items.length > 0)
    ? venta.venta_items
    : [{
        id: 'legacy',
        equipos: venta.equipos,
        equipo_id: venta.equipo_id,
        cantidad: venta.cantidad,
        precio_unitario: venta.precio_unitario,
        subtotal: venta.monto_total ?? venta.total,
      }]

  const subtotal = Number(
    venta.monto_total ?? venta.total ?? items.reduce(
      (s, it) => s + Number(it.subtotal ?? (it.cantidad * it.precio_unitario) ?? 0), 0
    )
  )
  const igv = subtotal * IGV_RATE
  const totalFinal = subtotal + igv

  const cliente = venta.cliente || venta.clientes?.nombre || 'Cliente sin nombre'
  const docCliente = (venta.clientes?.tipo_doc && venta.clientes?.nro_doc)
    ? `${venta.clientes.tipo_doc} ${venta.clientes.nro_doc}`
    : (venta.cliente_tipo_doc && venta.cliente_nro_doc)
      ? `${venta.cliente_tipo_doc} ${venta.cliente_nro_doc}`
      : null
  const vendedor = venta.perfiles?.nombre || 'Sistema'

  return (
    <div ref={ref} style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.brand}>GEOSTOCK</div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
            {cfg.empresa_razon_social}
            {cfg.empresa_direccion ? ` — ${cfg.empresa_direccion}` : ''}
          </div>
          {cfg.empresa_ruc && (
            <div style={{ fontSize: 10, color: '#666' }}>RUC {cfg.empresa_ruc}</div>
          )}
          {contactoLinea && (
            <div style={{ fontSize: 10, color: '#666' }}>{contactoLinea}</div>
          )}
        </div>
        <div style={styles.meta}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>BOLETA DE VENTA</div>
          <div><span style={styles.metaStrong}>N° </span>{venta.id}</div>
          <div><span style={styles.metaStrong}>Fecha </span>
            {new Date(venta.created_at).toLocaleDateString('es-PE')}
          </div>
        </div>
      </div>

      {/* Cliente + vendedor */}
      <div style={styles.twoCol}>
        <div style={styles.col}>
          <div style={styles.sectionTitle}>Cliente</div>
          <div style={{ fontWeight: 700 }}>{cliente}</div>
          {docCliente && (
            <div style={{ fontSize: 11, color: '#555' }}>{docCliente}</div>
          )}
        </div>
        <div style={styles.col}>
          <div style={styles.sectionTitle}>Vendedor</div>
          <div style={{ fontWeight: 700 }}>{vendedor}</div>
        </div>
      </div>

      {/* Items */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Detalle</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Equipo</th>
              <th style={{ ...styles.th, ...styles.right, width: 70 }}>Cant.</th>
              <th style={{ ...styles.th, ...styles.right, width: 110 }}>P. Unit.</th>
              <th style={{ ...styles.th, ...styles.right, width: 110 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{it.equipos?.nombre || it.equipo_id || '—'}</div>
                  {it.equipos?.tipo && (
                    <div style={{ fontSize: 10, color: '#777' }}>{it.equipos.tipo}</div>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.right }}>{it.cantidad}</td>
                <td style={{ ...styles.td, ...styles.right }}>{fmt(it.precio_unitario)}</td>
                <td style={{ ...styles.td, ...styles.right, fontWeight: 600 }}>
                  {fmt(it.subtotal ?? (it.cantidad * it.precio_unitario))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.totalsBox}>
          <div style={styles.totalsRow}>
            <span>Items</span><span>{items.length}</span>
          </div>
          <div style={styles.totalsRow}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div style={styles.totalsRow}>
            <span>IGV (8%)</span><span>{fmt(igv)}</span>
          </div>
          <div style={styles.totalsGrand}>
            <span>TOTAL</span><span>{fmt(totalFinal)}</span>
          </div>
        </div>
      </div>

      {venta.descripcion && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Notas</div>
          <div>{venta.descripcion}</div>
        </div>
      )}

      <div style={styles.footer}>
        {cfg.boleta_pie}
      </div>
    </div>
  )
})

BoletaPdf.displayName = 'BoletaPdf'
