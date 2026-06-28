import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_CONFIG = {
  '/': {
    title: 'Dashboard - GeoStock',
    description: 'Dashboard overview of your inventory management system.',
  },
  '/dashboard': {
    title: 'Dashboard - GeoStock',
    description: 'Dashboard overview of your inventory management system.',
  },
  '/dashboard/inventory': {
    title: 'Inventory - GeoStock',
    description: 'Manage and track your equipment inventory.',
  },
  '/dashboard/sales': {
    title: 'Sales - GeoStock',
    description: 'Track and manage your sales transactions.',
  },
  '/dashboard/cotizaciones': {
    title: 'Quotations - GeoStock',
    description: 'Create, follow up and convert quotations into sales.',
  },
  '/dashboard/compras': {
    title: 'Purchases - GeoStock',
    description: 'Register stock-in purchases from suppliers.',
  },
  '/dashboard/clientes': {
    title: 'Customers - GeoStock',
    description: 'Manage your customer directory.',
  },
  '/dashboard/proveedores': {
    title: 'Suppliers - GeoStock',
    description: 'Manage your supplier directory.',
  },
  '/dashboard/almacenes': {
    title: 'Warehouses - GeoStock',
    description: 'Manage warehouses and their stock distribution.',
  },
  '/dashboard/scan': {
    title: 'QR Scanner - GeoStock',
    description: 'Scan QR codes to look up equipment in the field.',
  },
  '/dashboard/reports': {
    title: 'Reports - GeoStock',
    description: 'View detailed reports and analytics.',
  },
  '/dashboard/users': {
    title: 'Users - GeoStock',
    description: 'Manage system users, roles and account access.',
  },
  '/dashboard/settings': {
    title: 'Settings - GeoStock',
    description: 'Configure your account and system settings.',
  },
  '/login': {
    title: 'Login - GeoStock',
    description: 'Sign in to your GeoStock account.',
  },
  '/auth/callback': {
    title: 'Authenticating - GeoStock',
    description: 'Processing your authentication...',
  },
  '/404': {
    title: 'Page Not Found - GeoStock',
    description: 'The page you are looking for does not exist.',
  },
}

// Matchers para rutas con parámetros dinámicos (no podemos indexar por path exacto)
const PREFIX_CONFIG = [
  {
    prefix: '/dashboard/equipment/',
    config: {
      title: 'Equipment Details - GeoStock',
      description: 'Detailed view of a single equipment unit.',
    },
  },
  {
    prefix: '/p/equipo/',
    config: {
      title: 'Public Equipment View - GeoStock',
      description: 'Public mobile view of an equipment unit.',
    },
  },
]

const resolveConfig = (pathname) =>
  PAGE_CONFIG[pathname] ||
  PREFIX_CONFIG.find((p) => pathname.startsWith(p.prefix))?.config ||
  PAGE_CONFIG['/404']

export const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    // Get page config for current route (exact match → prefix → 404 fallback)
    const pageConfig = resolveConfig(location.pathname)

    // Update document title
    document.title = pageConfig.title

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    metaDescription.content = pageConfig.description

    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = pageConfig.title

    // Update Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.content = pageConfig.description

    // Update Open Graph URL
    let ogUrl = document.querySelector('meta[property="og:url"]')
    if (!ogUrl) {
      ogUrl = document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      document.head.appendChild(ogUrl)
    }
    ogUrl.content = `https://geostock.vercel.app${location.pathname}`

    // Update Twitter title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.name = 'twitter:title'
      document.head.appendChild(twitterTitle)
    }
    twitterTitle.content = pageConfig.title

    // Update Twitter description
    let twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta')
      twitterDescription.name = 'twitter:description'
      document.head.appendChild(twitterDescription)
    }
    twitterDescription.content = pageConfig.description
  }, [location.pathname])
}
