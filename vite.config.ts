import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** PAGE=main or PAGE=km builds one page alone, in one bundle (for single-file copies). */
const PAGE = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.PAGE

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // two pages: the landing, and AI Knowledge Management (/knowledge-management/)
    rollupOptions: {
      input: PAGE === 'main' ? { main: 'index.html' } : PAGE === 'km' ? { km: 'knowledge-management/index.html' } : { main: 'index.html', km: 'knowledge-management/index.html' },
    },
  },
})
