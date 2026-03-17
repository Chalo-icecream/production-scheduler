import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api/* to the Vercel dev server when running `npm run dev`.
    // Requires `vercel dev` (port 3000) also running for API calls to work locally.
    // On Vercel deployments, /api/* is served directly by the runtime — no proxy needed.
    proxy: {
      '/api': {
        target:       'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
