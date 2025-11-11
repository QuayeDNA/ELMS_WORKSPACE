import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      // Suppress Chrome origin trial warnings
      'Permissions-Policy': 'interest-cohort=()',
    },
  },
  preview: {
    headers: {
      // Suppress Chrome origin trial warnings
      'Permissions-Policy': 'interest-cohort=()',
    },
  },
  build: {
    outDir: 'dist',
  }
})
