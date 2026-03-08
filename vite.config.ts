import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Kadu',
        short_name: 'Kadu',
        description: 'Scan attendance sheets directly from your phone, offline.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-small.png',
            sizes: '255x255',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-medium.png',
            sizes: '320x320',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-large.png',
            sizes: '790x790',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
