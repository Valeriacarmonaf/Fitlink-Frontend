import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { navigateFallback: '/' }, // navegación SPA
      manifest: {
        name: 'FitLink',
        short_name: 'FitLink',
        description: 'Conecta con personas para entrenar, correr o jugar en equipo.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        icons: [
          { src: '/vite.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/background.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      }
    })
  ],
  server: {
    host: true,      // o "0.0.0.0"
    port: 5173,
  },
  preview: {
    allowedHosts: [
      "ethyl-unflagrant-commutatively.ngrok-free.dev"
    ]
  }
})
