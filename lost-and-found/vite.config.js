import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://umbc-lost-found-2-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  base: '/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src',
      'html5-qrcode': resolve(__dirname, 'node_modules/html5-qrcode'),
      'react-qr-code': resolve(__dirname, 'node_modules/react-qr-code'),
      'qrcode': resolve(__dirname, 'node_modules/qrcode'),
      'html2canvas': resolve(__dirname, 'node_modules/html2canvas'),
      'react-to-print': resolve(__dirname, 'node_modules/react-to-print')
    }
  },
  optimizeDeps: {
    include: ['@emailjs/browser']
  }
})
