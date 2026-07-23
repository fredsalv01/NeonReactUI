import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query':    ['@tanstack/react-query'],
          'vendor-pdf':      ['html2pdf.js', 'jspdf', 'html2canvas'],
          'vendor-nivo':     ['@nivo/core', '@nivo/bar', '@nivo/line', '@nivo/pie'],
          'vendor-charts':   ['recharts'],
          'vendor-utils':    ['zod', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
