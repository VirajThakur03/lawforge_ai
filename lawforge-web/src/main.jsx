import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'



// Initialize Theme immediately to prevent theme flash
const savedTheme = typeof localStorage !== 'undefined' ? (localStorage.getItem('lf_theme') || 'dark') : 'dark';
const resolvedTheme = savedTheme === 'system'
  ? (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : savedTheme;
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', resolvedTheme);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register standard PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      () => { console.log('ServiceWorker registration successful'); },
      (err) => { console.warn('ServiceWorker registration failed: ', err); }
    );
  });
}
