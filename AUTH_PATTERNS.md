# Authentication Patterns & Examples

## Quick Start Patterns

### 1. Check if User is Logged In

```javascript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Dashboard /> : <Login />
}
```

### 2. Get User Information

```javascript
import { useAuth } from './hooks/useAuth'

function UserProfile() {
  const { user, profile, userRole } = useAuth()

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {profile?.nombre}</p>
      <p>Role: {userRole}</p>
    </div>
  )
}
```

### 3. Access User Metadata

The `profile` object contains:
```javascript
{
  id: 'uuid',
  nombre: 'John Doe',
  email: 'john@example.com',
  rol_id: 1,
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  roles: {
    nombre: 'Admin' // From joined roles table
  }
}
```

### 4. Logout User

```javascript
import { useAuth } from './hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### 5. Show Loading State

```javascript
import { useAuth } from './hooks/useAuth'
import { Spinner } from './components/ui'

function MyPage() {
  const { isLoading, profile } = useAuth()

  if (isLoading) {
    return <Spinner />
  }

  return <div>Welcome, {profile?.nombre}!</div>
}
```

### 6. Handle Auth Errors

```javascript
import { useAuth } from './hooks/useAuth'
import { Alert } from './components/ui'

function AuthForm() {
  const { error, clearError } = useAuth()

  return (
    <div>
      {error && (
        <Alert variant="danger" onDismiss={clearError}>
          {error}
        </Alert>
      )}
      {/* Form content */}
    </div>
  )
}
```

## Advanced Patterns

### 7. Role-Based Access Control

```javascript
import { useAuth } from './hooks/useAuth'

function AdminPanel() {
  const { userRole, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  if (userRole !== 'Admin') {
    return <div>Access denied</div>
  }

  return <div>Admin content</div>
}
```

### 8. Conditional Navigation

```javascript
import { useAuth } from './hooks/useAuth'
import { useNavigate, useEffect } from 'react-router-dom'

function CheckPermissions() {
  const { userRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (userRole === 'Viewer') {
      navigate('/dashboard/reports')
    } else if (userRole === 'Admin') {
      navigate('/dashboard/settings')
    }
  }, [userRole, navigate])

  return null
}
```

### 9. Data Fetching with TanStack Query

```javascript
import { useQuery } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'

function InventoryList() {
  const { user } = useAuth()

  const { data: equipos, isLoading } = useQuery({
    queryKey: ['equipos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {equipos?.map((equipo) => (
        <div key={equipo.id}>{equipo.nombre}</div>
      ))}
    </div>
  )
}
```

### 10. Form Submission with Auth Context

```javascript
import { useAuth } from './hooks/useAuth'
import { useToast } from './components/ui'
import { supabase } from './lib/supabase'
import { useState } from 'react'

function CreateEquipo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [nombre, setNombre] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('equipos')
        .insert([{
          nombre,
          tipo: 'Equipment',
          serie: 'SN001',
          estado: 'Disponible',
          precio_compra: 100,
          precio_venta: 150,
          created_at: new Date().toISOString(),
        }])

      if (error) throw error

      toast.success('Equipo created!')
      setNombre('')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Equipment name"
      />
      <button type="submit">Create</button>
    </form>
  )
}
```

## State Management Patterns

### 11. Update Auth Store Directly

```javascript
import { useAuthStore } from './stores/authStore'

function MyComponent() {
  const { setUser, setProfile, clearError } = useAuthStore()

  const handleUpdate = (newUser, newProfile) => {
    setUser(newUser)
    setProfile(newProfile)
  }

  const handleClearError = () => {
    clearError()
  }

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### 12. Listen to Auth Changes

```javascript
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

function AuthMonitor() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    console.log('User changed:', user)
  }, [user])

  useEffect(() => {
    if (!isLoading) {
      console.log('Auth initialization complete')
    }
  }, [isLoading])

  return null
}
```

## Error Handling Patterns

### 13. Try-Catch with Toast

```javascript
import { useToast } from './components/ui'
import { supabase } from './lib/supabase'

function DataOperation() {
  const { toast } = useToast()
  const loadingId = toast.loading('Processing...')

  const handleOperation = async () => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')

      if (error) throw error

      toast.dismiss(loadingId)
      toast.success('Data loaded!')
      return data
    } catch (error) {
      toast.dismiss(loadingId)
      toast.error(`Error: ${error.message}`)
    }
  }

  return <button onClick={handleOperation}>Load Data</button>
}
```

### 14. Validation with Error State

```javascript
import { useState } from 'react'
import { Button, InputField } from './components/ui'

function ValidatedForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (value) => {
    setEmail(value)
    if (errors.email) {
      setErrors({ ...errors, email: '' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Submit form
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Email" error={errors.email}>
        <input
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          type="email"
        />
      </InputField>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Real-World Examples

### 15. Complete Page with Auth

```javascript
import { useAuth } from './hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useToast } from './components/ui'
import { Spinner, Button, DataTable } from './components/ui'

export function InventoryPage() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  const { data: equipos, isLoading, error } = useQuery({
    queryKey: ['equipos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('active', true)

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  if (error) {
    return (
      <div>
        <Alert variant="danger">
          Failed to load inventory
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Inventory</h1>
        {userRole === 'Admin' && (
          <Button>Add Equipment</Button>
        )}
      </div>

      <DataTable
        data={equipos || []}
        columns={['nombre', 'tipo', 'estado', 'precio_venta']}
      />
    </div>
  )
}
```

## Tips & Best Practices

- ✅ Always check `isLoading` before accessing auth data
- ✅ Use `useAuth()` hook instead of accessing store directly
- ✅ Wrap protected content in `ProtectedRoute` component
- ✅ Use TanStack Query for data fetching
- ✅ Handle errors with toast notifications
- ✅ Validate forms before submission
- ✅ Show loading states during async operations
- ✅ Clear errors when user interacts with forms
- ✅ Use role information for access control
- ✅ Logout on unauthorized errors (403, 401)

