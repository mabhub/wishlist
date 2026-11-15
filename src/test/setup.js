import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Aucun test ne doit atteindre le réseau : un appel que le test n'a pas
// simulé échoue au lieu de partir vers Baserow.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async url => {
      throw new Error(`Appel réseau non simulé : ${url}`);
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
