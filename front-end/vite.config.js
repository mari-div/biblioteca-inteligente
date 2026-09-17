import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En desarrollo, todo lo que el frontend pida a /api se reenvía
      // a tu backend Spring Boot. Así evitas configurar CORS mientras programas.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Al compilar, el resultado queda listo para copiarse dentro de
    // src/main/resources/static de tu proyecto Spring Boot.
    outDir: 'dist',
  },
})
