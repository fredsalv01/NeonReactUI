# Dashboard Setup Guide

## Overview

The dashboard has been built from scratch using your custom UI components and modern frontend best practices with React, React Router, Zustand, and TanStack Query.

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Your existing UI components
│   └── dashboard/
│       ├── auth/              # Authentication components
│       │   └── Login.jsx       # Login page with email & Microsoft OAuth
│       ├── sidebar/
│       │   └── Sidebar.jsx     # Navigation sidebar
│       ├── layouts/
│       │   ├── DashboardLayout.jsx   # Main dashboard layout
│       │   └── AuthLayout.jsx        # Auth pages layout
│       ├── pages/              # Dashboard pages
│       │   ├── Dashboard.jsx
│       │   ├── Inventory.jsx
│       │   ├── Sales.jsx
│       │   ├── Reports.jsx
│       │   ├── Settings.jsx
│       │   └── AuthCallback.jsx     # OAuth callback handler
│       ├── core/
│       │   └── ProtectedRoute.jsx   # Route protection
│       └── index.js            # Exports
├── hooks/
│   └── useAuth.js             # Custom auth hook
├── lib/
│   └── supabase.js            # Supabase client
├── stores/
│   └── authStore.js           # Zustand auth store
├── App.jsx                    # Router setup
└── main.jsx                   # Entry point
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase dashboard → Project Settings → API.

### 2. Supabase Configuration

#### Enable Microsoft OAuth (Azure)

1. Go to your Supabase dashboard
2. Navigate to Authentication → Providers
3. Enable Azure (Microsoft) provider
4. Add your Azure credentials from your Azure AD application

#### Update Redirect URI

Add your callback URL in Supabase:
- Production: `https://your-domain.com/auth/callback`
- Development: `http://localhost:5173/auth/callback`

### 3. Database Setup

Your existing tables are already configured:
- `auth.users` - Supabase auth users
- `public.perfiles` - User profiles with role information
- `public.roles` - User roles

The auth flow automatically:
1. Logs in via Supabase auth (email/password or Microsoft)
2. Fetches user profile from `perfiles` table
3. Joins with `roles` table to get role information
4. Exposes user data via `useAuth()` hook

## Usage

### Authentication Flow

#### Email/Password Login
```javascript
import { Login } from './components/dashboard'

// Login page automatically handles email/password authentication
// Validates email format and password length
// Shows error messages for failed attempts
```

#### Microsoft OAuth
```javascript
// Microsoft login is configured in Login component
// Uses Supabase signInWithOAuth() method
// Redirects to /auth/callback for session handling
```

### Protected Routes

```javascript
import { ProtectedRoute, Dashboard, DashboardLayout } from './components/dashboard'

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
```

### Using Auth Data

```javascript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, profile, userRole, isAuthenticated, logout } = useAuth()

  return (
    <div>
      <h1>Welcome, {profile?.nombre}</h1>
      <p>Role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## State Management

### Zustand Auth Store

The auth store manages:
- `user` - Current authenticated user from Supabase
- `profile` - User profile data from database
- `isLoading` - Loading state for auth operations
- `error` - Error messages

### Methods

- `initializeAuth()` - Initialize auth on app load
- `logout()` - Sign out user
- `setUser()` - Manually set user
- `setProfile()` - Manually set profile
- `clearError()` - Clear error messages

## Components

### Login Component

Features:
- Email and password form with validation
- Microsoft OAuth button
- Toast notifications for feedback
- Error alerts
- Responsive design (mobile & desktop)
- Loading states with spinner

### Sidebar Component

Features:
- Mobile-responsive drawer
- Active route highlighting
- User profile display
- Logout button
- Icon-based navigation

Navigation items:
- Dashboard
- Inventory
- Sales
- Reports
- Settings

### DashboardLayout

Features:
- Sidebar + main content area
- Mobile menu toggle
- Responsive layout
- Page content container with padding

## Responsive Design

All components are fully responsive:
- **Mobile**: Single column, collapsible sidebar
- **Tablet**: Adapts to medium screens
- **Desktop**: Full sidebar, optimized spacing

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Forms

### Login Form Validation

- Email: Required + valid format
- Password: Required + minimum 6 characters
- Real-time error clearing on input change
- Server-side error handling

## API Integration

### Fetching Profile with Role

```javascript
const { data, error } = await supabase
  .from('perfiles')
  .select('*, roles(nombre)')
  .eq('id', user.id)
  .single()
```

This query:
1. Fetches user profile
2. Joins with roles table
3. Returns role name in nested `roles.nombre` field

## Error Handling

- **Auth Errors**: Displayed in Alert component
- **Toast Notifications**: For success/error feedback
- **Form Validation**: Real-time error messages
- **Loading States**: Spinners during async operations

## Security

- ✅ Protected routes redirect to login
- ✅ Session persistence via Supabase
- ✅ No sensitive data in localStorage
- ✅ Secure password transmission via Supabase
- ✅ OAuth tokens handled by Supabase

## Development

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Customization

### Add New Dashboard Page

1. Create component in `src/components/dashboard/pages/`
2. Add route in `App.jsx`
3. Add navigation item in `Sidebar.jsx`

Example:
```javascript
// pages/Users.jsx
export const Users = () => {
  return <div>Users Page</div>
}

// In Sidebar.jsx
{ id: 'users', label: 'Users', icon: 'users', path: '/dashboard/users' }

// In App.jsx
<Route path="/dashboard/users" element={...} />
```

### Modify Sidebar Menu

Edit `MENU_ITEMS` in `src/components/dashboard/sidebar/Sidebar.jsx`

### Change Theme Colors

All components use Tailwind CSS classes with custom theme variables:
- `bg-gs-bg` - Background
- `bg-gs-surface` - Surface
- `text-gs-text` - Text color
- `text-gs-accent` - Accent color

## Troubleshooting

### "Missing Supabase credentials"

Ensure `.env.local` has:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Login not working

1. Check Supabase URL and key in `.env.local`
2. Verify user exists in `auth.users` table
3. Verify user profile exists in `perfiles` table
4. Check browser console for errors

### Microsoft OAuth redirect fails

1. Verify redirect URI in Supabase matches your domain
2. Check Azure AD app credentials
3. Ensure callback route `/auth/callback` exists in App.jsx

## Next Steps

1. **Fill in `.env.local`** with your Supabase credentials
2. **Test login** with email/password or Microsoft OAuth
3. **Customize dashboard pages** with your business logic
4. **Add data tables** using your DataTable component
5. **Integrate API calls** using TanStack Query

Happy coding! 🚀
