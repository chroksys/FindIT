import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo(Dark).svg', 'logo(Light).svg'],
      manifest: {
        name: 'FindIt Events',
        short_name: 'FindIt',
        description: 'Discover and host unforgettable events in Uganda.',
        theme_color: '#19192d',
        background_color: '#19192d',
        display: 'standalone',
        icons: [
          {
            src: 'logo(Dark).svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
