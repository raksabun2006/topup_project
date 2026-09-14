import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [tailwindcss(), react()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
  oxc: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
