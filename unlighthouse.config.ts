import { defineConfig } from 'unlighthouse'
import { readFileSync } from 'node:fs'

// Credenciales fuera del control de versiones (ver unlighthouse.auth.json en .gitignore).
// Permite override por variables de entorno en CI.
let email = process.env.UNLIGHTHOUSE_EMAIL ?? ''
let password = process.env.UNLIGHTHOUSE_PASSWORD ?? ''

if (!email || !password) {
  try {
    const auth = JSON.parse(
      readFileSync(new URL('./unlighthouse.auth.json', import.meta.url), 'utf-8'),
    )
    email = email || auth.email
    password = password || auth.password
  } catch {
    throw new Error(
      'No se encontraron credenciales. Crea unlighthouse.auth.json o define UNLIGHTHOUSE_EMAIL / UNLIGHTHOUSE_PASSWORD.',
    )
  }
}

export default defineConfig({
  // Cambia a http://localhost:5173 para escanear el dev server local.
  site: process.env.UNLIGHTHOUSE_SITE ?? 'https://geostock.vercel.app',

  scanner: {
    // GeoStock es una SPA (React Router) sin sitemap real: descubrir rutas
    // siguiendo los enlaces internos una vez autenticados.
    crawler: true,
    samples: 1,
  },

  // Se ejecuta en cada página (Puppeteer) antes de escanear la ruta.
  // Inicia sesión con Supabase y espera a que el token quede en localStorage.
  hooks: {
    authenticate: async (page) => {
      const site = process.env.UNLIGHTHOUSE_SITE ?? 'https://geostock.vercel.app'

      await page.goto(`${site}/login`, { waitUntil: 'networkidle0' })

      await page.waitForSelector('input[name="email"]', { timeout: 15000 })
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', password)
      await page.click('button[type="submit"]')

      // No hay navegación de página completa (SPA). Supabase guarda la sesión
      // en localStorage con una clave del tipo sb-<project-ref>-auth-token.
      await page.waitForFunction(
        () =>
          Object.keys(window.localStorage).some(
            (k) => k.startsWith('sb-') && k.includes('auth-token'),
          ),
        { timeout: 20000 },
      )
    },
  },
})
