import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RestoPro POS',
        short_name: 'Restopro',
        description: 'POS Gestion Restaurant',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/images/RestoPro.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/RestoPro.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
