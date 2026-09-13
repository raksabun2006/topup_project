import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [tailwindcss(), react()],
  define: {
    global: 'window',
  },
  build: {
    sourcemap: false,
  },
  oxc: {
    drop: ['console', 'debugger'],
  },
})
