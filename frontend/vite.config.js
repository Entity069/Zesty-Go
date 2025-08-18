import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BASE_URL,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: process.env.VITE_BASE_URL,
        changeOrigin: true,
        secure: false
      }
    },
  },
  
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  
  base: '/',
  
  preview: {
    port: 3000,
    host: true
  }
})