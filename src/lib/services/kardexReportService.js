import { supabase } from '../supabase'

// ─────────────────────────────────────────────────────────────────
// Genera reportes gerenciales de movimientos de kardex:
//   - filtra por rango de fechas (inclusivo)
//   - diferencia compra / venta / ingreso / salida manual
//   - sube el archivo a storage.reportes/kardex/{uuid}_{fecha}.{ext}
//   - dispara descarga local y devuelve signed URL (1h)
//
// xlsx se importa dinámico para no inflar el bundle inicial.
// ─────────────────────────────────────────────────────────────────

const BUCKET = 'reportes'
const FOLDER = 'kardex'
const SIGN_TTL_SECONDS = 60 * 60 // 1h

const TIPO_LABEL = {
  compra:  'Compra (ingreso de stock)',
  venta:   'Venta (salida de stock)',
  entrada: 'Ingreso manual',
  salida:  'Salida manual',
}

export const kardexReportService = {
  /**
   * @param {{ from: string, to: string, format: 'xlsx' | 'csv' }} args
   * @returns {Promise<{ fileName, signedUrl, rowCount, path }>}
   */
  async generate({ from, to, format }) {
    if (!from || !to) throw new Error('Selecciona un rango de fechas')
    if (!['xlsx', 'csv'].includes(format)) throw new Error('Formato no soportado')

    const rows = await fetchRows(from, to)
    const sheetRows = rows.map(toSheetRow)

    const blob = format === 'xlsx'
      ? await toXlsxBlob(sheetRows)
      : toCsvBlob(sheetRows)

    const fileName = buildFileName(format)
    const path     = `${FOLDER}/${fileName}`

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    })
    if (upErr) throw upErr

    const { data: signed, error: sErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGN_TTL_SECONDS)
    if (sErr) throw sErr

    triggerBrowserDownload(blob, fileName)

    return { fileName, signedUrl: signed.signedUrl, path, rowCount: sheetRows.length }
  },
}

async function fetchRows(from, to) {
  const isoFrom = new Date(from + 'T00:00:00').toISOString()
  const isoTo   = new Date(to   + 'T23:59:59.999').toISOString()

  const { data, error } = await supabase
    .from('kardex')
    .select(`
      created_at, tipo, cantidad, motivo, referencia_tipo, referencia_id,
      equipos(id, nombre, tipo),
      almacenes:almacen_id(id, nombre),
      almacen_destino:almacen_destino_id(id, nombre),
      perfiles(nombre, email)
    `)
    .gte('created_at', isoFrom)
    .lte('created_at', isoTo)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

function toSheetRow(r) {
  const dt = new Date(r.created_at)
  const tipoSemantico =
    r.referencia_tipo === 'compra' ? 'Compra (ingreso de stock)' :
    r.referencia_tipo === 'venta'  ? 'Venta (salida de stock)' :
    TIPO_LABEL[r.tipo] || r.tipo

  const signo = r.tipo === 'entrada' ? '+' : r.tipo === 'salida' ? '-' : ''

  return {
    'Fecha':              dt.toLocaleDateString('es-PE'),
    'Hora':               dt.toLocaleTimeString('es-PE', { hour12: false }),
    'Tipo de movimiento': tipoSemantico,
    'Cantidad':           `${signo}${r.cantidad ?? 0}`,
    'Código equipo':      r.equipos?.id ?? '—',
    'Equipo':             r.equipos?.nombre ?? '—',
    'Categoría':          r.equipos?.tipo ?? '—',
    'Almacén':            r.almacenes?.nombre ?? '—',
    'Almacén destino':    r.almacen_destino?.nombre ?? '',
    'Motivo':             r.motivo ?? '',
    'Referencia':         r.referencia_id ?? '',
    'Usuario':            r.perfiles?.nombre ?? 'Sistema',
  }
}

async function toXlsxBlob(rows) {
  const XLSX = await import('xlsx')
  const sheet = XLSX.utils.json_to_sheet(rows)
  // Anchos auto para que abra cómodo en Excel
  const widths = Object.keys(rows[0] ?? {}).map((k) => ({
    wch: Math.min(40, Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length))) + 2,
  }))
  sheet['!cols'] = widths
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Kardex')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function toCsvBlob(rows) {
  if (rows.length === 0) {
    return new Blob(['﻿'], { type: 'text/csv;charset=utf-8' })
  }
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = String(v ?? '')
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(';')),
  ]
  // BOM UTF-8 para que Excel abra los acentos correctamente
  return new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
}

function buildFileName(ext) {
  const uuid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2))
  const n = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  const stamp = `${pad(n.getDate())}_${pad(n.getMonth() + 1)}_${n.getFullYear()}_${pad(n.getHours())}_${pad(n.getMinutes())}_${pad(n.getSeconds())}`
  return `${uuid}_${stamp}.${ext}`
}

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Liberar memoria al rato; algunos navegadores cancelan si se revoca al instante
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
