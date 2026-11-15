import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Un chunk par famille de bibliothèques, dépendances internes comprises.
    rolldownOptions: {
      // mdast-util-to-hast laisse des `''` en tête de module pour VS Code :
      // Rolldown les prend pour des directives, sans conséquence sur le bundle.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.id?.includes('/node_modules/'))
          return;
        warn(warning);
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            {
              name: 'mui',
              test: /node_modules[\\/](@mui|@emotion|@popperjs|react-transition-group|stylis)/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Node >= 25 expose son propre localStorage (vide), qui masque celui de jsdom.
    execArgv: ['--no-experimental-webstorage'],
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
