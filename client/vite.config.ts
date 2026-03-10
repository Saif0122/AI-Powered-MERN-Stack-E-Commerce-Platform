import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Local dev: forward all /api/v1/* requests to the local Express backend
      '/api/v1': {
        target: 'https://ai-powered-mern-stack-e-commerce-platform-production.up.railway.app',
        changeOrigin: true,
        // No rewrite needed — path is forwarded as-is to the backend
      },
    },
  },
})
