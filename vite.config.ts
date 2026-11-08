import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // two pages: the landing, and AI Knowledge Management (/knowledge-management/)
    rollupOptions: {
      input: {
        main: 'index.html',
        km: 'knowledge-management/index.html',
      },
    },
  },
})
