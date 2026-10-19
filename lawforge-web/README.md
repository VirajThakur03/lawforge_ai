# ⚖️ LAWFORGE AI — Web Client

This directory contains the production React 19 + Vite web application and client-side legal engine for **LAWFORGE AI**.

> **Note:** For complete project architecture, security specifications, test suites, and documentation, refer to the [Root README](../README.md).

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run full functional test suite (166 tests)
node test_all.mjs

# Run cryptographic & security audit (33 tests)
node test_security.mjs

# Build production PWA bundle
npm run build
```

## Key Technologies
- **Framework**: React 19, Vite, TailwindCSS
- **State & Transitions**: Zustand, Framer Motion
- **PWA & Offline Runtime**: Workbox, `vite-plugin-pwa`
- **Client Security**: Web Crypto API (AES-256-GCM, SHA-256, PBKDF2)
- **Document Generation**: jsPDF, html2canvas, QRCode
