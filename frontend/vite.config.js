import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('socket.io-client') || id.includes('engine.io-client')) {
            return 'realtime';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          return 'vendor';
        },
      },
    },
  },
})
