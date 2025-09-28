import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  },
  build: {
    target: 'es2015'
  }
})