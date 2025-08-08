import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    hmr: {
      port: 24678
    },
    proxy: {
      '/api/textract': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/textract/, '/api/textract')
      },
      '/api': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true
      }
    }
  }
});
