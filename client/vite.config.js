import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          supabase: ['@supabase/supabase-js'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
})