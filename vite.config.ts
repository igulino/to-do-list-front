import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const port = process.env.PORT ? Number(process.env.PORT) : undefined
  const host = process.env.RENDER_EXTERNAL_HOSTNAME
  const serverOptions = {
    host: '0.0.0.0',
    allowedHosts: host ? [host] : [],
    strictPort: port !== undefined,
  }
  const proxy = {
    '/api': {
      target: 'https://to-do-list-29f1.onrender.com',
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    server: { ...serverOptions, port: port ?? 5173, proxy },
    preview: { ...serverOptions, port: port ?? 4173, proxy },
  }
})
