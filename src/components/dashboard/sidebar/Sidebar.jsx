import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Icon, Button } from '../../ui'
import { FiLogOut, FiChevronRight } from 'react-icons/fi'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: 'chart', path: '/dashboard' },
  { id: 'inventory', label: 'Inventario', icon: 'box', path: '/dashboard/inventory' },
  { id: 'sales', label: 'Ventas', icon: 'cart', path: '/dashboard/sales' },
  { id: 'reports', label: 'Reportes', icon: 'file', path: '/dashboard/reports' },
  { id: 'users', label: 'Usuarios', icon: 'users', path: '/dashboard/users', allowedRoles: ['Administrador'] },
  { id: 'settings', label: 'Configuración', icon: 'settings', path: '/dashboard/settings' },
]

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, profile, userRole } = useAuth()

  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  )

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
          <div className="sticky top-0 p-6 border-b border-gs-border bg-gs-surface/95 backdrop-blur">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #00C9A7, #0EA5E9)' }}
              >
                <Icon name="compass" size={22} color="#0D0F14" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gs-text leading-none">GeoStock</h1>
                <p className="text-xs text-gs-muted mt-1">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <p className="text-xs font-semibold text-gs-muted uppercase tracking-wider px-3 mb-4">
              Menú
            </p>
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left group relative
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-gs-accent to-gs-accent/80 text-gs-bg shadow-md'
                        : 'text-gs-soft hover:text-gs-text hover:bg-gs-border/50'
                    }
                  `}
                >
                  <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={isActive ? 'currentColor' : 'currentColor'}
                    />
                  </div>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <FiChevronRight size={18} className="ml-auto" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Usuario + rol */}
        {profile && (
          <div className="px-5 py-4 border-t border-gs-border">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                              text-[13px] font-extrabold text-gs-accent"
                style={{ background: 'linear-gradient(135deg,#00C9A740,#0EA5E940)' }}>
                {profile.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  {profile.nombre?.split(' ')[0] || 'Usuario'}
                </p>
                {profile.roles?.nombre && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(0, 201, 167, 0.1)',
                      color: '#00C9A7',
                    }}>
                    {profile.roles.nombre}
                  </span>
                )}
              </div>
            </div>
            <Button variant="danger" onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 mt-2">
              <Icon name="logout" size={13} /> Cerrar sesión
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
