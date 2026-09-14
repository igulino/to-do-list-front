import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const proxy = {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  }

  return { plugins: [react()], server: { proxy }, preview: { proxy } }
})
