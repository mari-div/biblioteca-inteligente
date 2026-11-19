import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Puerto del backend Spring Boot (server.port en application.properties).
// Cámbialo con la variable BACKEND_PORT (o SERVER_PORT en el backend) si tu puerto está ocupado.
const BACKEND_PORT = process.env.BACKEND_PORT || 8765

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En desarrollo, todo lo que el frontend pida a /api se reenvía
      // a tu backend Spring Boot. Así evitas configurar CORS mientras programas.
      '/api': {
        // Debe coincidir con el puerto del backend (ver BACKEND_PORT arriba).
        target: `http://localhost:${BACKEND_PORT}`,
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
