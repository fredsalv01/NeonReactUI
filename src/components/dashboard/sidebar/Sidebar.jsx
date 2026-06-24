import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Icon, Button } from '../../ui'
import { FiChevronRight } from 'react-icons/fi'
import { reportService } from '../../../lib/services/reportService'

// ponytail: polling 60s. Ceiling: Supabase Realtime si Geotop necesita
// alerta sub-segundo (no es el caso — inventario cambia despacio).
const LOW_STOCK_POLL_MS = 60_000

const MENU_GROUPS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',  label: 'Panel',      icon: 'chart', path: '/dashboard' },
      { id: 'inventory',  label: 'Inventario', icon: 'box',   path: '/dashboard/inventory' },
      { id: 'reports',    label: 'Reportes',   icon: 'file',  path: '/dashboard/reports' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { id: 'compras', label: 'Compras',     icon: 'cart', path: '/dashboard/compras', allowedRoles: ['Administrador', 'Almacén'] },
      { id: 'cotizaciones', label: 'Cotizaciones', icon: 'file', path: '/dashboard/cotizaciones', allowedRoles: ['Administrador', 'Ventas'] },
      { id: 'sales',   label: 'Ventas',      icon: 'cart', path: '/dashboard/sales' },
      { id: 'scan',    label: 'Escanear QR', icon: 'qr',   path: '/dashboard/scan',    allowedRoles: ['Almacén', 'Administrador', 'Técnico'] },
    ],
  },
  {
    label: 'Maestros',
    items: [
      { id: 'almacenes',   label: 'Almacenes',   icon: 'box',   path: '/dashboard/almacenes',   allowedRoles: ['Administrador', 'Almacén'] },
      { id: 'proveedores', label: 'Proveedores', icon: 'users', path: '/dashboard/proveedores', allowedRoles: ['Administrador', 'Almacén'] },
      { id: 'clientes',    label: 'Clientes',    icon: 'users', path: '/dashboard/clientes',    allowedRoles: ['Administrador', 'Ventas'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'users',    label: 'Usuarios',      icon: 'users',    path: '/dashboard/users',    allowedRoles: ['Administrador'] },
      { id: 'settings', label: 'Configuración', icon: 'settings', path: '/dashboard/settings' },
    ],
  },
]

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, profile, userRole } = useAuth()
  const [lowStock, setLowStock] = useState(0)

  useEffect(() => {
    let alive = true
    const tick = () => reportService.countLowStock()
      .then(n => { if (alive) setLowStock(n) })
      .catch(() => {})
    tick()
    const id = setInterval(tick, LOW_STOCK_POLL_MS)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const visibleGroups = MENU_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
      ),
    }))
    .filter((group) => group.items.length > 0)

  const handleNavigate = (path) => {
    navigate(path)
    onClose?.()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebarClasses = `
    fixed md:static inset-y-0 left-0 z-40
    w-64 bg-gs-surface border-r border-gs-border
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    flex flex-col overflow-hidden
  `

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="sticky top-0 z-10 px-5 py-4 border-b border-gs-border bg-gs-surface/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #00C9A7, #0EA5E9)' }}
              >
                <Icon name="compass" size={20} color="#0D0F14" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gs-text leading-none">GeoStock</h1>
                <p className="text-[10px] text-gs-muted mt-1 font-['DM_Mono'] uppercase tracking-wider">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-4">
            {visibleGroups.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <p className="text-[10px] font-bold text-gs-muted uppercase tracking-[0.1em] px-2 mb-1.5 font-['DM_Mono']">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path
                  const showBadge = item.id === 'inventory' && lowStock > 0
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      title={showBadge ? `${lowStock} equipo(s) con stock bajo` : undefined}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                        transition-all duration-200 text-left group relative
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-gs-accent to-gs-accent/80 text-gs-bg shadow-md'
                            : 'text-gs-soft hover:text-gs-text hover:bg-gs-border/50'
                        }
                      `}
                    >
                      <div className={`transition-transform duration-200 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <Icon name={item.icon} size={17} color="currentColor" />
                      </div>
                      <span className="text-[13px] font-medium flex-1 truncate">{item.label}</span>
                      {showBadge && (
                        <span
                          className={`text-[10px] font-bold font-['DM_Mono'] px-1.5 py-0.5 rounded-md shrink-0 ${
                            isActive
                              ? 'bg-gs-bg/30 text-gs-bg'
                              : 'bg-gs-danger/20 text-gs-danger'
                          }`}
                        >
                          {lowStock}
                        </span>
                      )}
                      {isActive && <FiChevronRight size={15} className="ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Usuario + rol */}
        {profile && (
          <div className="px-4 py-3 border-t border-gs-border bg-gs-surface">
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[12px] font-extrabold text-gs-accent"
                style={{ background: 'linear-gradient(135deg,#00C9A740,#0EA5E940)' }}
              >
                {profile.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight truncate text-gs-text">
                  {profile.nombre?.split(' ')[0] || 'Usuario'}
                </p>
                {profile.roles?.nombre && (
                  <span
                    className="inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md mt-0.5"
                    style={{ background: 'rgba(0, 201, 167, 0.1)', color: '#00C9A7' }}
                  >
                    {profile.roles.nombre}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs py-1.5"
            >
              <Icon name="logout" size={12} /> Cerrar sesión
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
