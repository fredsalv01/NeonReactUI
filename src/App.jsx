import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ToastProvider, QueryLoader, Spinner } from './components/ui'
import { useAuthStore } from './stores/authStore'
import { usePageTitle } from './hooks/usePageTitle'
import { ModalDebugPage } from './pages/ModalDebugPage'
import { NotFound } from './pages/NotFound'
import { PublicEquipoPage } from './pages/PublicEquipoPage'
import {
  ProtectedRoute,
  RoleProtectedRoute,
  Login,
  DashboardLayout,
  Dashboard,
  Inventory,
  EquipmentDetails,
  ScanQRPage,
  Sales,
  Reports,
  Settings,
  Users,
  Proveedores,
  Clientes,
  Almacenes,
  Compras,
  AuthCallback,
} from './components/dashboard'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isLoading = useAuthStore((state) => state.isLoading)
  usePageTitle() // Update page title and meta tags based on route

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <div className="text-gs-soft">
          <Spinner variant={"orbit"} size={40} color="#00C9A7" label="Cargando" />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/debug/modal" element={<ModalDebugPage />} />

      {/* Vista pública del QR — sin auth, mobile-first */}
      <Route path="/p/equipo/:id" element={<PublicEquipoPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/equipment/:equipoId"
        element={
          <RoleProtectedRoute allowedRoles={['Almacén', 'Administrador', 'Técnico']}>
            <DashboardLayout>
              <EquipmentDetails />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/scan"
        element={
          <RoleProtectedRoute allowedRoles={['Almacén', 'Administrador', 'Técnico']}>
            <DashboardLayout>
              <ScanQRPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/sales"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Sales />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/users"
        element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/proveedores"
        element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Almacén']}>
            <DashboardLayout>
              <Proveedores />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/clientes"
        element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Ventas']}>
            <DashboardLayout>
              <Clientes />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/almacenes"
        element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Almacén']}>
            <DashboardLayout>
              <Almacenes />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/compras"
        element={
          <RoleProtectedRoute allowedRoles={['Administrador', 'Almacén']}>
            <DashboardLayout>
              <Compras />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <QueryLoader />
        <Router basename={import.meta.env.BASE_URL}>
          <AppContent />
        </Router>
        <SpeedInsights />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
