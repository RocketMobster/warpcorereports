import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path will be set by GitHub Actions during deployment
  // For local development, use '/'
  base: process.env.NODE_ENV === 'production' ? '/warpcorereports/' : '/'
})
