import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: PDF.js worker is copied to public/ by postinstall script
// Vite automatically serves files from public/ directory
export default defineConfig({
  plugins: [react()],
})
