import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'https://condominio-api-2aef.onrender.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('x-forwarded-prefix');
            proxyReq.removeHeader('x-forwarded-host');
            proxyReq.removeHeader('x-forwarded-for');
            proxyReq.removeHeader('x-forwarded-proto');
          });
        }
      }
    }
  }
})
