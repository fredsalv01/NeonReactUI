import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Icon } from '../../ui'
import { FiLogOut, FiUser, FiChevronRight } from 'react-icons/fi'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart', path: '/dashboard' },
  { id: 'inventory', label: 'Inventory', icon: 'box', path: '/dashboard/inventory' },
  { id: 'sales', label: 'Sales', icon: 'shopping-cart', path: '/dashboard/sales' },
  { id: 'reports', label: 'Reports', icon: 'file', path: '/dashboard/reports' },
  { id: 'settings', label: 'Settings', icon: 'wifi', path: '/dashboard/settings' },
]

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, profile } = useAuth()

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
                <p className="text-xs text-gs-muted mt-1">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <p className="text-xs font-semibold text-gs-muted uppercase tracking-wider px-3 mb-4">
              Menu
            </p>
            {MENU_ITEMS.map((item) => {
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

        {/* User Profile & Logout */}
        <div className="border-t border-gs-border bg-gs-surface/95 backdrop-blur p-4 space-y-3 sticky bottom-0">
          {profile && (
            <div className="relative overflow-hidden bg-gradient-to-br from-gs-border/50 to-gs-border/25 rounded-xl p-4 border border-gs-border">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8"></div>

              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-md">
                  <FiUser size={20} className="text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gs-text truncate">
                    {profile.nombre?.split(' ')[0] || 'User'}
                  </p>
                  {profile.roles?.nombre && (
                    <span className="inline-block mt-1.5 px-2.5 py-1 bg-gradient-to-r from-gs-accent/30 to-gs-accent/20 text-gs-accent text-[11px] font-semibold rounded-full border border-gs-accent/20">
                      {profile.roles.nombre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                     text-gs-danger hover:text-white hover:bg-gs-danger/20 transition-all duration-200
                     group font-medium text-sm"
          >
            <FiLogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
