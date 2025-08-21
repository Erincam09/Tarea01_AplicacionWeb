import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // Deja SIN rewrite
        configure: (proxy, options) => {
          // logs útiles por si algo falla
          proxy.on('error', (err, req) => {
            console.log('[proxy] ERROR', err.code, req.method, req.url, '->', options.target)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[proxy] RES', proxyRes.statusCode, req.method, req.url)
          })
        }
      }
    }
  }
})
