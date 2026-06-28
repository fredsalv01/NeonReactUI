
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY     = Deno.env.get('ANTHROPIC_API_KEY')!
const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY')!
const REPORT_TO             = Deno.env.get('REPORT_TO') ?? 'f.morales@geotop.com'
const REPORT_FROM           = Deno.env.get('REPORT_FROM') ?? 'GeoStock <onboarding@resend.dev>'

const CRITICAL_DAYS = 30
const WARNING_DAYS  = 60
const WINDOW_DAYS   = 90

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Row = {
  id: string
  nombre: string
  sku: string | null
  tipo: string | null
  stock_actual: number
  vendido_90d: number
  promedio_mensual: number
  dias_restantes: number | null
  severidad: 'critico' | 'atencion' | 'saludable'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const rows = await loadInventoryRows(sb)

    const critico  = rows.filter(r => r.severidad === 'critico')
    const atencion = rows.filter(r => r.severidad === 'atencion')
    const saludable = rows.filter(r => r.severidad === 'saludable')

    const html = await renderEmail({ critico, atencion, saludable })
    const subject = `GeoStock — Reporte de reposición (${critico.length} críticos, ${atencion.length} en atención)`

    await sendEmail({ to: REPORT_TO, subject, html })

    return json({
      ok: true,
      sent_to: REPORT_TO,
      summary: { critico: critico.length, atencion: atencion.length, saludable: saludable.length },
    })
  } catch (err) {
    console.error('predict-stock failed:', err)
    return json({ ok: false, error: String(err?.message ?? err) }, 500)
  }
})

async function loadInventoryRows(sb: any): Promise<Row[]> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString()

  const [{ data: equipos, error: e1 }, { data: ventas, error: e2 }] = await Promise.all([
    sb.from('v_equipos_con_stock')
      .select('id, nombre, sku, tipo, stock_total')
      .eq('active', true),
    sb.from('ventas')
      .select('equipo_id, cantidad, created_at')
      .gte('created_at', since),
  ])
  if (e1) throw e1
  if (e2) throw e2

  const soldByEquipo = new Map<string, number>()
  for (const v of ventas ?? []) {
    if (!v.equipo_id) continue
    soldByEquipo.set(v.equipo_id, (soldByEquipo.get(v.equipo_id) ?? 0) + (v.cantidad ?? 0))
  }

  return (equipos ?? []).map((eq: any): Row => {
    const vendido = soldByEquipo.get(eq.id) ?? 0
    const promedio_mensual = +(vendido * (30 / WINDOW_DAYS)).toFixed(2)
    const diario = vendido / WINDOW_DAYS
    const dias = diario > 0 ? Math.floor((eq.stock_total ?? 0) / diario) : null
    const severidad: Row['severidad'] =
      dias !== null && dias < CRITICAL_DAYS ? 'critico'
      : dias !== null && dias < WARNING_DAYS ? 'atencion'
      : 'saludable'
    return {
      id: eq.id,
      nombre: eq.nombre,
      sku: eq.sku ?? null,
      tipo: eq.tipo ?? null,
      stock_actual: eq.stock_total ?? 0,
      vendido_90d: vendido,
      promedio_mensual,
      dias_restantes: dias,
      severidad,
    }
  })
}

async function renderEmail(buckets: { critico: Row[]; atencion: Row[]; saludable: Row[] }) {
  const ai = await tryClaude(buckets)
  if (ai) return wrapEmail(ai)
  return wrapEmail(fallbackBody(buckets))
}

async function tryClaude(buckets: { critico: Row[]; atencion: Row[]; saludable: Row[] }): Promise<string | null> {
  if (!ANTHROPIC_API_KEY) return null
  const payload = {
    critico:   buckets.critico.map(stripForPrompt),
    atencion:  buckets.atencion.map(stripForPrompt),
    saludable: { total: buckets.saludable.length },
  }
  const system = `Eres un asistente de gestión de inventarios para Geotop Perú, empresa de geodesia y topografía. Recibes datos de stock y ventas. Devuelves SOLO HTML (sin <html>, <head>, <body>; solo el contenido del cuerpo del email) en español claro, sin jerga técnica, para que un gerente de almacén lo lea rápido. Usa <h2>, <p>, <ul>, <li>, <strong>. Para cada equipo crítico recomienda una acción concreta tipo "Comprar al menos N unidades antes del DD de MES" basada en el promedio mensual. Para los de atención sugiere monitorear o pedir cotizaciones. Cierra con una nota breve y motivadora. No inventes datos que no estén en el JSON.`
  const today = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
  const user = `Fecha del reporte: ${today}\n\nDatos:\n${JSON.stringify(payload, null, 2)}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!r.ok) {
      console.error('Anthropic error:', r.status, await r.text())
      return null
    }
    const data = await r.json()
    const text = data?.content?.[0]?.text?.trim()
    return text || null
  } catch (err) {
    console.error('Claude call threw:', err)
    return null
  }
}

function stripForPrompt(r: Row) {
  return {
    nombre: r.nombre,
    sku: r.sku,
    tipo: r.tipo,
    stock_actual: r.stock_actual,
    vendido_ultimos_90d: r.vendido_90d,
    promedio_mensual: r.promedio_mensual,
    dias_restantes_estimados: r.dias_restantes,
  }
}

function fallbackBody({ critico, atencion, saludable }: { critico: Row[]; atencion: Row[]; saludable: Row[] }) {
  const rowList = (rs: Row[]) => rs.map(r =>
    `<li><strong>${escapeHtml(r.nombre)}</strong>${r.sku ? ` (${escapeHtml(r.sku)})` : ''} — stock: ${r.stock_actual}, vendido 90d: ${r.vendido_90d}, días estimados: ${r.dias_restantes ?? 'n/d'}</li>`
  ).join('')
  return `
    <h2>Reporte mensual de reposición</h2>
    <p>El servicio de IA no respondió, te enviamos el detalle directo.</p>
    <h3 style="color:#d33">Crítico (${critico.length})</h3>
    <ul>${critico.length ? rowList(critico) : '<li>Ninguno</li>'}</ul>
    <h3 style="color:#c80">Atención (${atencion.length})</h3>
    <ul>${atencion.length ? rowList(atencion) : '<li>Ninguno</li>'}</ul>
    <p>Saludables: ${saludable.length}</p>
  `
}

function wrapEmail(body: string) {
  return `<!doctype html><html><body style="font-family:system-ui,Segoe UI,Arial,sans-serif;color:#1a1a1a;max-width:640px;margin:0 auto;padding:24px;line-height:1.55">
    <div style="border-bottom:2px solid #00C9A7;padding-bottom:12px;margin-bottom:20px">
      <h1 style="margin:0;font-size:20px">GeoStock — Reposición de Inventario</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#666">Geotop Perú SAC · Reporte automático</p>
    </div>
    ${body}
    <hr style="border:0;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:11px;color:#888">Generado por GeoStock con asistencia de IA. Verifica los datos antes de generar órdenes de compra.</p>
  </body></html>`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: REPORT_FROM, to: [to], subject, html }),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`)
  return r.json()
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ponytail: heurística días_restantes en TS, Claude solo redacta arriba.
// Si falta ANTHROPIC_API_KEY o la API falla, mandamos fallback HTML con la
// tabla cruda. Upgrade path: pasar a Sonnet 4.6 si la prosa se queda corta.
