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
  RoleProtectedRoute,
  Login,
  DashboardLayout,
  Dashboard,
  Inventory,
  EquipmentDetails,
  ScanQRPage,
  Sales,
  Cotizaciones,
  Reports,
  Settings,
  Users,
  Proveedores,
  Clientes,
  Almacenes,
  Compras,
  AuthCallback,
} from './components/dashboard'
import { ROUTE_ROLES, ROLE_LANDING } from './lib/constants/permissions'
import { useAuth } from './hooks/useAuth'
import './App.css'

const queryClient = new QueryClient()

// ponytail: root "/" redirige por rol. Si no auth, cae a /login vía ProtectedRoute
// del landing por defecto.
function RootRedirect() {
  const { isAuthenticated, isLoading, userRole } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner variant="orbit" size={40} color="#00C9A7" label="Cargando" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_LANDING[userRole] || '/dashboard/inventory'} replace />
}

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
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.dashboard}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/inventory"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.inventory}>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/equipment/:equipoId"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.equipment}>
            <DashboardLayout>
              <EquipmentDetails />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/scan"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.scan}>
            <DashboardLayout>
              <ScanQRPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/sales"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.sales}>
            <DashboardLayout>
              <Sales />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/cotizaciones"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.cotizaciones}>
            <DashboardLayout>
              <Cotizaciones />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/reports"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.reports}>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/users"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.users}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/proveedores"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.proveedores}>
            <DashboardLayout>
              <Proveedores />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/clientes"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.clientes}>
            <DashboardLayout>
              <Clientes />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/almacenes"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.almacenes}>
            <DashboardLayout>
              <Almacenes />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/compras"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.compras}>
            <DashboardLayout>
              <Compras />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <RoleProtectedRoute allowedRoles={ROUTE_ROLES.settings}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route path="/" element={<RootRedirect />} />
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
