// vite.config.js
import { defineConfig } from "file:///C:/V/LAWFORGE_AI/lawforge-web/node_modules/vite/dist/node/index.js";
import react from "file:///C:/V/LAWFORGE_AI/lawforge-web/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/V/LAWFORGE_AI/lawforge-web/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // ── Full Progressive Web App (Workbox-Powered) ──────────────────────
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // Cache all static assets (JS, CSS, images, fonts)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Gemini API — NetworkFirst so we always try live, fallback to cache
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "gemini-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Legal data bundle (OTA sync endpoint)
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "legal-data-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 8
            }
          },
          {
            // Local legal data files (/data/*)
            urlPattern: /\/data\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "local-data-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      },
      includeAssets: ["favicon.svg", "icons.svg"],
      manifest: {
        name: "LAWFORGE AI Intelligence",
        short_name: "LAWFORGE",
        description: "Free global legal intelligence system \u2014 186 jurisdictions, offline-ready, zero data collection.",
        theme_color: "#070e1e",
        background_color: "#070e1e",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        categories: ["utilities", "productivity", "legal"],
        icons: [
          { src: "/favicon.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/favicon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ],
        screenshots: [
          {
            src: "/favicon.svg",
            sizes: "1280x720",
            type: "image/svg+xml",
            form_factor: "wide",
            label: "LAWFORGE AI Dashboard"
          }
        ]
      }
    })
  ],
  // ── Code Splitting — break up the 2.1MB bundle ─────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom"],
          // Motion & UI
          "framer-motion": ["framer-motion"],
          // Icon library
          "lucide-react": ["lucide-react"],
          // i18n
          "i18n-vendor": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          // PDF tools
          "pdf-vendor": ["jspdf", "html2canvas"],
          // AI/ML runtime (largest — keep isolated)
          "onnx-runtime": ["onnxruntime-web"],
          // QR & utils
          "utils-vendor": ["qrcode", "clsx", "tailwind-merge", "zustand"]
        }
      }
    },
    // Raise warning threshold slightly for ML worker bundles (expected large)
    chunkSizeWarningLimit: 1e3,
    // Enable source maps for production debugging (remove if size matters)
    sourcemap: false
  },
  // ── Dev server security headers ────────────────────────────────────────
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxWXFxcXExBV0ZPUkdFX0FJXFxcXGxhd2ZvcmdlLXdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVlxcXFxMQVdGT1JHRV9BSVxcXFxsYXdmb3JnZS13ZWJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1YvTEFXRk9SR0VfQUkvbGF3Zm9yZ2Utd2ViL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBGdWxsIFByb2dyZXNzaXZlIFdlYiBBcHAgKFdvcmtib3gtUG93ZXJlZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluamVjdFJlZ2lzdGVyOiAnYXV0bycsXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIC8vIENhY2hlIGFsbCBzdGF0aWMgYXNzZXRzIChKUywgQ1NTLCBpbWFnZXMsIGZvbnRzKVxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZix3b2ZmMn0nXSxcbiAgICAgICAgLy8gUnVudGltZSBjYWNoaW5nIHN0cmF0ZWdpZXNcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvLyBHb29nbGUgRm9udHMgc3R5bGVzaGVldHNcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIEdvb2dsZSBGb250cyB3ZWJmb250c1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnc3RhdGljLWZvbnRzLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIEdlbWluaSBBUEkgXHUyMDE0IE5ldHdvcmtGaXJzdCBzbyB3ZSBhbHdheXMgdHJ5IGxpdmUsIGZhbGxiYWNrIHRvIGNhY2hlXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2dlbmVyYXRpdmVsYW5ndWFnZVxcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dlbWluaS1hcGktY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7IG1heEVudHJpZXM6IDUwLCBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgfSxcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiAxMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvLyBMZWdhbCBkYXRhIGJ1bmRsZSAoT1RBIHN5bmMgZW5kcG9pbnQpXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL3Jhd1xcLmdpdGh1YnVzZXJjb250ZW50XFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdsZWdhbC1kYXRhLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0IH0sXG4gICAgICAgICAgICAgIG5ldHdvcmtUaW1lb3V0U2Vjb25kczogOCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvLyBMb2NhbCBsZWdhbCBkYXRhIGZpbGVzICgvZGF0YS8qKVxuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcL2RhdGFcXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdsb2NhbC1kYXRhLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAyMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogNyB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5zdmcnLCAnaWNvbnMuc3ZnJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnTEFXRk9SR0UgQUkgSW50ZWxsaWdlbmNlJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0xBV0ZPUkdFJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGcmVlIGdsb2JhbCBsZWdhbCBpbnRlbGxpZ2VuY2Ugc3lzdGVtIFx1MjAxNCAxODYganVyaXNkaWN0aW9ucywgb2ZmbGluZS1yZWFkeSwgemVybyBkYXRhIGNvbGxlY3Rpb24uJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMDcwZTFlJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwNzBlMWUnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAnYW55JyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIGNhdGVnb3JpZXM6IFsndXRpbGl0aWVzJywgJ3Byb2R1Y3Rpdml0eScsICdsZWdhbCddLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHsgc3JjOiAnL2Zhdmljb24uc3ZnJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnIH0sXG4gICAgICAgICAgeyBzcmM6ICcvZmF2aWNvbi5zdmcnLCBzaXplczogJzUxMng1MTInLCB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHNjcmVlbnNob3RzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2Zhdmljb24uc3ZnJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTI4MHg3MjAnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgZm9ybV9mYWN0b3I6ICd3aWRlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnTEFXRk9SR0UgQUkgRGFzaGJvYXJkJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcblxuICAvLyBcdTI1MDBcdTI1MDAgQ29kZSBTcGxpdHRpbmcgXHUyMDE0IGJyZWFrIHVwIHRoZSAyLjFNQiBidW5kbGUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIFJlYWN0IGNvcmVcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAvLyBNb3Rpb24gJiBVSVxuICAgICAgICAgICdmcmFtZXItbW90aW9uJzogWydmcmFtZXItbW90aW9uJ10sXG4gICAgICAgICAgLy8gSWNvbiBsaWJyYXJ5XG4gICAgICAgICAgJ2x1Y2lkZS1yZWFjdCc6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgLy8gaTE4blxuICAgICAgICAgICdpMThuLXZlbmRvcic6IFsnaTE4bmV4dCcsICdyZWFjdC1pMThuZXh0JywgJ2kxOG5leHQtYnJvd3Nlci1sYW5ndWFnZWRldGVjdG9yJ10sXG4gICAgICAgICAgLy8gUERGIHRvb2xzXG4gICAgICAgICAgJ3BkZi12ZW5kb3InOiBbJ2pzcGRmJywgJ2h0bWwyY2FudmFzJ10sXG4gICAgICAgICAgLy8gQUkvTUwgcnVudGltZSAobGFyZ2VzdCBcdTIwMTQga2VlcCBpc29sYXRlZClcbiAgICAgICAgICAnb25ueC1ydW50aW1lJzogWydvbm54cnVudGltZS13ZWInXSxcbiAgICAgICAgICAvLyBRUiAmIHV0aWxzXG4gICAgICAgICAgJ3V0aWxzLXZlbmRvcic6IFsncXJjb2RlJywgJ2Nsc3gnLCAndGFpbHdpbmQtbWVyZ2UnLCAnenVzdGFuZCddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFJhaXNlIHdhcm5pbmcgdGhyZXNob2xkIHNsaWdodGx5IGZvciBNTCB3b3JrZXIgYnVuZGxlcyAoZXhwZWN0ZWQgbGFyZ2UpXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiBkZWJ1Z2dpbmcgKHJlbW92ZSBpZiBzaXplIG1hdHRlcnMpXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgfSxcblxuICAvLyBcdTI1MDBcdTI1MDAgRGV2IHNlcnZlciBzZWN1cml0eSBoZWFkZXJzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBzZXJ2ZXI6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnWC1Db250ZW50LVR5cGUtT3B0aW9ucyc6ICdub3NuaWZmJyxcbiAgICAgICdYLUZyYW1lLU9wdGlvbnMnOiAnREVOWScsXG4gICAgICAnUmVmZXJyZXItUG9saWN5JzogJ3N0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW4nLFxuICAgIH0sXG4gIH0sXG59KVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlSLFNBQVMsb0JBQW9CO0FBQzlTLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFHTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxnQkFBZ0I7QUFBQSxNQUNoQixTQUFTO0FBQUE7QUFBQSxRQUVQLGNBQWMsQ0FBQywyQ0FBMkM7QUFBQTtBQUFBLFFBRTFELGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQTtBQUFBLFlBRUUsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksSUFBSSxlQUFlLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxjQUNoRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBQSxZQUMxQztBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUE7QUFBQSxZQUVFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQUEsY0FDaEUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDMUM7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBO0FBQUEsWUFFRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZLEVBQUUsWUFBWSxJQUFJLGVBQWUsS0FBSyxLQUFLLEdBQUc7QUFBQSxjQUMxRCx1QkFBdUI7QUFBQSxZQUN6QjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUE7QUFBQSxZQUVFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssR0FBRztBQUFBLGNBQzFELHVCQUF1QjtBQUFBLFlBQ3pCO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQTtBQUFBLFlBRUUsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksSUFBSSxlQUFlLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFBQSxZQUNoRTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZSxDQUFDLGVBQWUsV0FBVztBQUFBLE1BQzFDLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLFlBQVksQ0FBQyxhQUFhLGdCQUFnQixPQUFPO0FBQUEsUUFDakQsT0FBTztBQUFBLFVBQ0wsRUFBRSxLQUFLLGdCQUFnQixPQUFPLFdBQVcsTUFBTSxnQkFBZ0I7QUFBQSxVQUMvRCxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLGlCQUFpQixTQUFTLGVBQWU7QUFBQSxRQUMxRjtBQUFBLFFBQ0EsYUFBYTtBQUFBLFVBQ1g7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLGFBQWE7QUFBQSxZQUNiLE9BQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQSxFQUdBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUE7QUFBQSxVQUVyQyxpQkFBaUIsQ0FBQyxlQUFlO0FBQUE7QUFBQSxVQUVqQyxnQkFBZ0IsQ0FBQyxjQUFjO0FBQUE7QUFBQSxVQUUvQixlQUFlLENBQUMsV0FBVyxpQkFBaUIsa0NBQWtDO0FBQUE7QUFBQSxVQUU5RSxjQUFjLENBQUMsU0FBUyxhQUFhO0FBQUE7QUFBQSxVQUVyQyxnQkFBZ0IsQ0FBQyxpQkFBaUI7QUFBQTtBQUFBLFVBRWxDLGdCQUFnQixDQUFDLFVBQVUsUUFBUSxrQkFBa0IsU0FBUztBQUFBLFFBQ2hFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsdUJBQXVCO0FBQUE7QUFBQSxJQUV2QixXQUFXO0FBQUEsRUFDYjtBQUFBO0FBQUEsRUFHQSxRQUFRO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCwwQkFBMEI7QUFBQSxNQUMxQixtQkFBbUI7QUFBQSxNQUNuQixtQkFBbUI7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
