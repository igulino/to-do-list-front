import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const proxy = {
    '/api': {
      target: 'https://to-do-list-29f1.onrender.com',
      changeOrigin: true,
    },
  }

  return { plugins: [react()], server: { proxy }, preview: { proxy } }
})
