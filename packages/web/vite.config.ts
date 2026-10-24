import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Only needed once the API serves user state. The catalog is bundled, so
    // content browsing works with the API down.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
