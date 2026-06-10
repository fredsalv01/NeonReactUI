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

export const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    // Get page config for current route
    const pageConfig = PAGE_CONFIG[location.pathname] || PAGE_CONFIG['/404']

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
