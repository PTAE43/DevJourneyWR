import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // endpoint เดิมของโปรเจ็กต์
      '/api': {
        target: 'https://server-six-nu-81.vercel.app',
        changeOrigin: true,
        secure: true,
      },
      // endpoint ใหม่สำหรับ notifications
      '/apinoti': {
        target: 'https://server-six-nu-81.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});