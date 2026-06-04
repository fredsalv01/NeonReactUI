import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-nivo': ['@nivo/core', '@nivo/bar', '@nivo/line', '@nivo/pie'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['zod', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
