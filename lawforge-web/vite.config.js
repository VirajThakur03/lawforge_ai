import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // ── Full Progressive Web App (Workbox-Powered) ──────────────────────
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Cache all static assets (JS, CSS, images, fonts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Gemini API — NetworkFirst so we always try live, fallback to cache
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Legal data bundle (OTA sync endpoint)
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'legal-data-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 8,
            },
          },
          {
            // Local legal data files (/data/*)
            urlPattern: /\/data\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-data-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'LAWFORGE AI Intelligence',
        short_name: 'LAWFORGE',
        description: 'Free global legal intelligence system — 186 jurisdictions, offline-ready, zero data collection.',
        theme_color: '#070e1e',
        background_color: '#070e1e',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['utilities', 'productivity', 'legal'],
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
        screenshots: [
          {
            src: '/favicon.svg',
            sizes: '1280x720',
            type: 'image/svg+xml',
            form_factor: 'wide',
            label: 'LAWFORGE AI Dashboard',
          },
        ],
      },
    }),
  ],

  // ── Code Splitting — break up the 2.1MB bundle ─────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // Motion & UI
          'framer-motion': ['framer-motion'],
          // Icon library
          'lucide-react': ['lucide-react'],
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // PDF tools
          'pdf-vendor': ['jspdf', 'html2canvas'],
          // AI/ML runtime (largest — keep isolated)
          'onnx-runtime': ['onnxruntime-web'],
          // QR & utils
          'utils-vendor': ['qrcode', 'clsx', 'tailwind-merge', 'zustand'],
        },
      },
    },
    // Raise warning threshold slightly for ML worker bundles (expected large)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (remove if size matters)
    sourcemap: false,
  },

  // ── Dev server security headers ────────────────────────────────────────
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})

