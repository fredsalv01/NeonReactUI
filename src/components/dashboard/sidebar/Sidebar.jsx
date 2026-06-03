import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Icon } from '../../ui'
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi'

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
    flex flex-col
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
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6 border-b border-gs-border">
            <h1 className="text-xl font-bold text-gs-text">GeoStock</h1>
            <p className="text-xs text-gs-muted mt-1">
              {profile?.nombre || 'User'}
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {MENU_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition-colors duration-200 text-left
                    ${
                      isActive
                        ? 'bg-gs-accent text-gs-bg'
                        : 'text-gs-soft hover:bg-gs-border hover:text-gs-text'
                    }
                  `}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={isActive ? 'currentColor' : 'currentColor'}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 md:p-6 border-t border-gs-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                     text-gs-danger hover:bg-gs-danger/10 transition-colors"
          >
            <FiLogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
