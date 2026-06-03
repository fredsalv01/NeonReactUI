# Getting Started Checklist

## Pre-Flight Checks ✅

- [x] Dependencies installed (zustand, react-router-dom, @supabase/supabase-js, react-icons)
- [x] Dashboard directory structure created
- [x] Authentication system implemented
- [x] UI components integrated
- [x] Routing configured
- [x] State management set up

## Step-by-Step Setup

### 1️⃣ Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public** key → `VITE_SUPABASE_ANON_KEY`

### 2️⃣ Create .env.local File

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ Configure Microsoft OAuth (Azure)

#### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Find and click on **Azure**
3. Enable the provider
4. Fill in Azure AD credentials:
   - Client ID
   - Client Secret
   - Directory ID (Tenant ID)

#### Get Azure Credentials:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **App registrations**
3. Create new app or use existing one
4. Copy **Application (client) ID** → Client ID
5. Create a client secret → Client Secret
6. Find **Directory (tenant) ID** → Directory ID

#### Add Redirect URI:

In Supabase Azure settings, add:
- **Local**: `http://localhost:5173/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

Also add to Azure app "Authentication" section:
- `http://localhost:5173/auth/callback`

### 4️⃣ Verify Database Tables

Ensure these tables exist in your Supabase project:

**auth.users** (Supabase built-in)
```
- id (UUID, PK)
- email
- encrypted_password
- email_confirmed_at
- ...
```

**public.perfiles** (Your table)
```
- id (UUID, FK to auth.users)
- nombre (text)
- email (text)
- rol_id (integer, FK to roles)
- active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

**public.roles** (Your table)
```
- id (integer, PK)
- nombre (text)
- descripcion (text)
- created_at (timestamp)
```

### 5️⃣ Test Email/Password Login

1. Create a test user in Supabase:
   - Go to **Authentication** → **Users**
   - Click **Add user**
   - Email: `test@example.com`
   - Password: `TestPassword123`

2. Create corresponding profile:
   ```sql
   INSERT INTO public.perfiles (id, nombre, email, rol_id, active)
   VALUES (
     '<user_uuid>',
     'Test User',
     'test@example.com',
     1,  -- Admin role ID
     true
   );
   ```

### 6️⃣ Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:5173**

You should see the login page.

### 7️⃣ Test Login

**Email Login:**
- Email: `test@example.com`
- Password: `TestPassword123`
- Click "Sign in with Email"
- Should redirect to dashboard

**Microsoft OAuth:**
- Click "Microsoft" button
- Log in with your Microsoft account
- Should redirect to dashboard

## Expected Behavior

### ✅ Login Page
- Email and password form visible
- Microsoft button visible
- Form validation on submit
- Error messages for invalid input
- Toast notifications for success/error

### ✅ Dashboard
- Sidebar navigation visible
- Welcome message with user name
- User role displayed
- Navigation items highlight current page
- Logout button in sidebar
- Mobile hamburger menu

### ✅ Protected Routes
- Can't access `/dashboard` without login
- Redirects to `/login` if not authenticated
- Session persists on page refresh

### ✅ Logout
- Click logout button
- Session cleared
- Redirected to login page

## Troubleshooting

### "Missing Supabase credentials" Error

**Solution:**
1. Check `.env.local` exists
2. Verify VITE_SUPABASE_URL format: `https://xxx.supabase.co`
3. Check VITE_SUPABASE_ANON_KEY is not empty
4. Restart dev server: `npm run dev`

### Login Shows "Invalid email or password"

**Solution:**
1. Verify test user exists in auth.users
2. Check password is correct
3. Email must match exactly (case-sensitive)
4. User profile must exist in perfiles table

### Microsoft OAuth Fails

**Solution:**
1. Verify Azure credentials in Supabase
2. Check redirect URI matches:
   - Supabase settings
   - Azure app settings
   - Current URL (http://localhost:5173)
3. Ensure provider is "Enabled" in Supabase

### Profile Data Not Loading

**Solution:**
1. Check perfiles table has matching user ID
2. Verify roles table has the role
3. Check SQL query: 
   ```sql
   SELECT * FROM perfiles WHERE id = '<user_id>';
   ```
4. Verify junction with roles:
   ```sql
   SELECT p.*, r.nombre FROM perfiles p
   LEFT JOIN roles r ON p.rol_id = r.id
   WHERE p.id = '<user_id>';
   ```

### Sidebar Not Showing

**Solution:**
1. Make sure you're logged in (check localStorage for `sb-xxx-auth-token`)
2. Check browser console for errors
3. Verify `useAuth()` is returning user data

### Can't Navigate to Dashboard

**Solution:**
1. Login first with valid credentials
2. Check that profile was fetched (inspect `useAuth()` return)
3. Verify ProtectedRoute component is working

## Development Tips

### Use React Developer Tools

Install: [React DevTools Chrome Extension](https://chrome.google.com/webstore)

Debug auth state:
```javascript
// In browser console
localStorage.getItem('sb-xxx-auth-token')
```

### Check Zustand State

```javascript
import { useAuthStore } from './stores/authStore'

function Debug() {
  console.log('Auth state:', useAuthStore.getState())
}
```

### Enable Detailed Logging

Update `lib/supabase.js`:
```javascript
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true, // Enable debug mode
  }
})
```

### Test Role-Based UI

Change `rol_id` in database and refresh page to see different content.

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for dependencies
npm list
```

## Project Layout

```
Login Page
├── Email/Password Form
├── Microsoft OAuth Button
└── Error Alerts

Dashboard
├── Sidebar
│   ├── Navigation Menu
│   ├── User Profile
│   └── Logout Button
└── Main Content
    ├── Dashboard (Stats)
    ├── Inventory
    ├── Sales
    ├── Reports
    └── Settings
```

## File Locations

- **Login**: `src/components/dashboard/auth/Login.jsx`
- **Sidebar**: `src/components/dashboard/sidebar/Sidebar.jsx`
- **Routes**: `src/App.jsx`
- **Auth Store**: `src/stores/authStore.js`
- **Auth Hook**: `src/hooks/useAuth.js`
- **Supabase Client**: `src/lib/supabase.js`
- **Protected Routes**: `src/components/dashboard/core/ProtectedRoute.jsx`

## Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| VITE_SUPABASE_URL | https://xyz.supabase.co | ✅ |
| VITE_SUPABASE_ANON_KEY | eyJxxx... | ✅ |

## API Integration Ready

The system is ready for data fetching:

```javascript
import { useQuery } from '@tanstack/react-query'
import { supabase } from './lib/supabase'

const { data } = useQuery({
  queryKey: ['equipos'],
  queryFn: () => supabase.from('equipos').select('*')
})
```

## Next Steps After Setup

1. ✅ Verify login works
2. ✅ Test logout
3. ✅ Check dashboard loads
4. ✅ Try Microsoft OAuth
5. 📋 Add inventory table component
6. 📋 Add sales form
7. 📋 Add reports
8. 📋 Add settings form
9. 📋 Deploy to production

## Support

For issues:
1. Check browser console (F12)
2. Check network tab for API calls
3. Verify Supabase credentials
4. Read DASHBOARD_SETUP.md
5. Check AUTH_PATTERNS.md for examples

## Success Indicators ✨

- [x] App loads without errors
- [ ] Login page displays
- [ ] Email/password login works
- [ ] Microsoft OAuth option visible
- [ ] Dashboard displays after login
- [ ] Sidebar navigation works
- [ ] User name appears in profile
- [ ] Logout redirects to login
- [ ] Protected routes redirect to login when unauthorized

You're ready to go! 🚀

Questions? Check the documentation files in the project root.
