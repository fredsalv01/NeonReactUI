import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useAuth } from '../../../hooks/useAuth'
import { StatCard, useToast } from '../../ui'
import { SkeletonStat, SkeletonBlock } from '../../ui/Skeleton'
import { reportService } from '../../../lib/services/reportService'
import { ROLE_LANDING } from '../../../lib/constants/permissions'
import { humanizeError } from '../../../lib/utils/errors'

// ponytail: guía condensada por rol. Solo enlaces a rutas que ROLE_LANDING
// dice que el usuario puede visitar; si querés algo más fino, filtrá por
// ROUTE_ROLES aquí. Ceiling: N roles hardcoded en el switch.
const QUICK_LINKS = {
  Administrador: [
    { to: '/dashboard/inventory',    label: 'Gestiona el inventario y stock' },
    { to: '/dashboard/sales',        label: 'Registra ventas y consulta historial' },
    { to: '/dashboard/reports',      label: 'Revisa reportes y proyecciones' },
    { to: '/dashboard/users',        label: 'Administra usuarios y roles' },
  ],
  Almacén: [
    { to: '/dashboard/inventory',    label: 'Actualiza el stock de equipos' },
    { to: '/dashboard/compras',      label: 'Registra compras a proveedores' },
    { to: '/dashboard/almacenes',    label: 'Gestiona los almacenes' },
    { to: '/dashboard/reports',      label: 'Genera reportes de kardex' },
  ],
  Ventas: [
    { to: '/dashboard/sales',        label: 'Registra nuevas ventas' },
    { to: '/dashboard/cotizaciones', label: 'Crea cotizaciones para clientes' },
    { to: '/dashboard/clientes',     label: 'Gestiona la cartera de clientes' },
    { to: '/dashboard/reports',      label: 'Consulta reportes de ventas' },
  ],
  Técnico: [
    { to: '/dashboard/inventory',    label: 'Consulta el inventario de equipos' },
    { to: '/dashboard/scan',         label: 'Escanea el QR de un equipo' },
    { to: '/dashboard/almacenes',    label: 'Ubica equipos por almacén' },
  ],
}

export const Dashboard = () => {
  const { profile } = useAuth()
  const { toast } = useToast()
  const role = profile?.roles?.nombre
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    reportService.getDashboardStats()
      .then((data) => { if (!cancelled) setStats(data) })
      .catch((err) => {
        if (cancelled) return
        toast.error(humanizeError(err, 'No se pudieron cargar las estadísticas'))
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const links = QUICK_LINKS[role] || []
  const landing = ROLE_LANDING[role] || '/dashboard/inventory'
  const monthlySales = stats?.monthlySales || []
  const hasSalesTrend = monthlySales.some((m) => (m.monto ?? 0) > 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
          ¡Bienvenido, {profile?.nombre}!
        </h1>
        <p className="text-gs-soft">
          Rol: <span className="font-semibold text-gs-accent">{role || 'N/D'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <StatCard label="Total Equipos"    value={stats?.totalEquipos ?? 0}                         icon="box"   color="#00C9A7" />
            <StatCard label="Total Ventas"     value={(stats?.totalVentas ?? 0).toLocaleString('es-PE')} icon="chart" color="#0EA5E9" />
            <StatCard label="En Stock"         value={(stats?.totalStock ?? 0).toLocaleString('es-PE')} icon="inbox" color="#22C55E" />
            <StatCard label="Usuarios Activos" value={stats?.totalUsuarios ?? 0}                        icon="users" color="#A855F7" />
          </>
        )}
      </div>

      <div className="mt-6 bg-gs-surface border border-gs-border rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gs-text">Tendencia de ventas</h2>
            <p className="text-xs text-gs-muted">Últimos 6 meses</p>
          </div>
        </div>
        {isLoading ? (
          <SkeletonBlock className="h-52 w-full" />
        ) : hasSalesTrend ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySales} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="gsDashboardArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00C9A7" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#00C9A7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="mes" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(v) => [`S/ ${Number(v).toLocaleString('es-PE')}`, 'Monto']}
              />
              <Area type="monotone" dataKey="monto" stroke="#00C9A7" strokeWidth={2} fill="url(#gsDashboardArea)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex flex-col items-center justify-center text-gs-muted text-sm">
            <p className="mb-1">Aún no hay ventas registradas.</p>
            <Link to="/dashboard/sales" className="text-gs-accent hover:underline">Registrar una venta →</Link>
          </div>
        )}
      </div>

      {links.length > 0 && (
        <div className="mt-6">
          <div className="bg-gs-surface rounded-xl p-4 md:p-6 border border-gs-border">
            <h2 className="text-lg font-semibold text-gs-text mb-4">
              Accesos rápidos
            </h2>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-gs-soft hover:text-gs-accent transition-colors inline-flex items-center gap-2"
                  >
                    <span className="text-gs-accent">→</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {landing !== '/dashboard' && (
              <p className="text-xs text-gs-muted mt-4">
                Tu inicio por defecto es{' '}
                <Link to={landing} className="text-gs-accent hover:underline">
                  {landing.replace('/dashboard/', '')}
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
