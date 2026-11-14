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
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['src/test/setup.js'],
    // Valeurs factices : les tests ne doivent jamais lire le token ni les ID
    // de tables de `.env.local`.
    env: {
      VITE_BASEROW_API_URL: 'https://baserow.test',
      VITE_BASEROW_DATABASE_ID: 'test-database',
      VITE_BASEROW_ITEMS_TABLE_ID: 'test-items',
      VITE_BASEROW_LISTS_TABLE_ID: 'test-lists',
      VITE_BASEROW_RESERVATIONS_TABLE_ID: 'test-reservations',
      VITE_BASEROW_TOKEN: 'test-token',
      VITE_BASEROW_DEFAULT_LIST_ID: 'test-list',
    },
  },
});
