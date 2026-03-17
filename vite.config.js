import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Use relative base so assets are found within the 'blades-app' folder
  base: './', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Unified Blades Compendium",
        short_name: "Blades",
        description: "Digital TTRPG Rules & Characters",
        theme_color: "#09090b",
        icons: [
          {
            src: 'blades-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'blades-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: ['blades.gentryperry.com']
  }
})