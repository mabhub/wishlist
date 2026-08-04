import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  test: {
    // btoa/atob sont fournis par les globales Node, pas besoin de jsdom
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
