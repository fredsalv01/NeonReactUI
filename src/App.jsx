import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider, QueryLoader, Spinner } from './components/ui'
import { useAuthStore } from './stores/authStore'
import { ModalDebugPage } from './pages/ModalDebugPage'
import {
  ProtectedRoute,
  Login,
  DashboardLayout,
  Dashboard,
  Inventory,
  Sales,
  Reports,
  Settings,
  AuthCallback,
} from './components/dashboard'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isLoading = useAuthStore((state) => state.isLoading)

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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
