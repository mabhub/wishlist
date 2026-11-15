import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { decodeComment, encodeComment } from '../utils/encoding';
import { ALREADY_RESERVED } from '../utils/reservations';
import useReservations from './useReservations';

const WISH_A = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const WISH_B = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const WISH_OTHER = 'c3d4e5f6-a7b8-9012-cdef-123456789012'; // item d'une autre liste
const LIST_ITEMS = [WISH_A, WISH_B];

/**
 * Faux serveur Baserow en mémoire, limité à la table des réservations.
 *
 * Chaque requête est classée par nature : `list` (lecture de toute la table),
 * `check` (lecture filtrée sur un item), `POST`, `PATCH` ou `DELETE`. Une
 * nature peut être retenue (`hold`) pour observer l'état optimiste avant la
 * réponse, ou mise en échec (`fail`).
 *
 * @param {Array<{id: number, wish: string, comment: string}>} initialRows - Rows de départ
 * @returns {Object} `fetch` à substituer au global, et de quoi piloter le serveur
 */
const createFakeBaserow = initialRows => {
  const rows = initialRows.map(row => ({ ...row }));
  const requests = [];
  const held = new Map();
  const failing = new Set();
  let nextId = 1000;

  const respond = (status, body) => ({
    ok: status < 400,
    status,
    statusText: status < 400 ? 'OK' : 'Internal Server Error',
    json: async () => body,
  });

  const fetch = async (input, { method = 'GET', body } = {}) => {
    const url = new URL(input);
    const [, rowId] = url.pathname.match(/\/table\/test-reservations\/(?:(\d+)\/)?$/);
    const wish = url.searchParams.get('filter__wish__equal');
    const kind = method === 'GET' ? (wish && 'check') || 'list' : method;
    const payload = body && JSON.parse(body);

    requests.push({ kind, rowId: rowId && Number(rowId), body: payload });
    await held.get(kind);

    if (failing.has(kind)) return respond(500, {});

    const index = rows.findIndex(row => row.id === Number(rowId));

    switch (kind) {
      case 'POST':
        nextId += 1;
        rows.push({ id: nextId, ...payload });

        return respond(200, rows.at(-1));
      case 'PATCH':
        Object.assign(rows[index], payload);

        return respond(200, rows[index]);
      case 'DELETE':
        rows.splice(index, 1);

        return respond(204, null);
      default:
        return respond(200, {
          results: rows.filter(row => !wish || row.wish === wish).map(row => ({ ...row })),
          next: null,
        });
    }
  };

  return {
    fetch,
    rows,
    requests,
    /** Retient les requêtes d'une nature ; renvoie la fonction qui les libère. */
    hold: kind => {
      let release;
      held.set(
        kind,
        new Promise(resolve => {
          release = resolve;
        }),
      );

      return release;
    },
    fail: kind => failing.add(kind),
    sent: kind => requests.filter(request => request.kind === kind),
  };
};

describe('useReservations', () => {
  let server;
  let queryClient;

  const renderReservations = (enabled = true) =>
    renderHook(() => useReservations(enabled, LIST_ITEMS), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    });

  /** Monte le hook et attend la fin du premier chargement. */
  const renderLoaded = async () => {
    const { result } = renderReservations();

    await waitFor(() => expect(result.current.reservations).toHaveProperty(WISH_A));

    return result;
  };

  beforeEach(() => {
    server = createFakeBaserow([
      { id: 1, wish: WISH_A, comment: encodeComment('Tata Jeanne', WISH_A) },
      { id: 2, wish: WISH_OTHER, comment: '' },
    ]);
    vi.stubGlobal('fetch', server.fetch);

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('lecture', () => {
    it('ne charge rien tant que le mode offrir est inactif', () => {
      const { result } = renderReservations(false);

      expect(result.current.reservations).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(server.requests).toEqual([]);
    });

    it('signale le premier chargement, puis rend les réservations de la liste courante', async () => {
      const { result } = renderReservations();

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // La réservation de WISH_OTHER, item d'une autre liste, est écartée
      expect(result.current.reservations).toEqual({
        [WISH_A]: { id: 1, comment: 'Tata Jeanne' },
      });
    });
  });

  describe('addReservation', () => {
    it("affiche la réservation avant la réponse, puis prend l'identifiant du serveur", async () => {
      const result = await renderLoaded();
      const release = server.hold('POST');

      act(() => result.current.addReservation({ wishId: WISH_B, comment: 'Tonton Paul' }));

      await waitFor(() => expect(server.sent('POST')).toHaveLength(1));
      expect(result.current.reservations[WISH_B]).toEqual({
        id: `temp-${WISH_B}`,
        comment: 'Tonton Paul',
      });

      release();

      await waitFor(() =>
        expect(result.current.reservations[WISH_B]).toEqual({
          id: 1001,
          comment: 'Tonton Paul',
        }),
      );
    });

    it("envoie l'item et le commentaire encodé", async () => {
      const result = await renderLoaded();

      act(() => result.current.addReservation({ wishId: WISH_B, comment: 'Tonton Paul' }));

      await waitFor(() => expect(server.sent('POST')).toHaveLength(1));

      const [{ body }] = server.sent('POST');

      expect(body.wish).toBe(WISH_B);
      expect(body.comment).not.toContain('Tonton Paul');
      expect(decodeComment(body.comment, WISH_B)).toBe('Tonton Paul');
    });

    // Le cache peut avoir 15 s de retard : quelqu'un d'autre a pu réserver entre-temps.
    it("refuse sans écrire quand le cadeau vient d'être pris par quelqu'un d'autre", async () => {
      const result = await renderLoaded();

      server.rows.push({ id: 3, wish: WISH_B, comment: encodeComment('Mamie', WISH_B) });
      act(() => result.current.addReservation({ wishId: WISH_B, comment: 'Tonton Paul' }));

      await waitFor(() => expect(result.current.mutationError).not.toBeNull());

      expect(result.current.mutationError.action).toBe('add');
      expect(result.current.mutationError.error.code).toBe(ALREADY_RESERVED);
      expect(server.sent('POST')).toEqual([]);

      // La réservation affichée devient celle de l'autre personne
      await waitFor(() =>
        expect(result.current.reservations[WISH_B]).toEqual({
          id: 3,
          comment: 'Mamie',
        }),
      );
    });

    it("retire la réservation et signale l'échec quand l'écriture échoue", async () => {
      const result = await renderLoaded();
      const release = server.hold('list'); // seul le retour arrière peut rétablir l'état

      server.fail('POST');
      act(() => result.current.addReservation({ wishId: WISH_B, comment: 'Tonton Paul' }));

      await waitFor(() => expect(result.current.mutationError?.action).toBe('add'));

      expect(result.current.mutationError.error.code).toBeUndefined();
      expect(result.current.reservations).toEqual({
        [WISH_A]: { id: 1, comment: 'Tata Jeanne' },
      });

      release();
    });

    it("efface l'échec signalé sur demande", async () => {
      const result = await renderLoaded();

      server.fail('POST');
      act(() => result.current.addReservation({ wishId: WISH_B, comment: '' }));
      await waitFor(() => expect(result.current.mutationError).not.toBeNull());

      act(() => result.current.clearMutationError());

      expect(result.current.mutationError).toBeNull();
    });
  });

  describe('updateReservation', () => {
    const rectification = { reservationId: 1, wishId: WISH_A, comment: 'Tata Jeanne et Paul' };

    it("affiche le nouveau commentaire avant la réponse et l'envoie encodé", async () => {
      const result = await renderLoaded();
      const release = server.hold('PATCH');

      act(() => result.current.updateReservation(rectification));

      await waitFor(() => expect(server.sent('PATCH')).toHaveLength(1));
      expect(result.current.reservations[WISH_A]).toEqual({
        id: 1,
        comment: 'Tata Jeanne et Paul',
      });

      const [{ rowId, body }] = server.sent('PATCH');

      expect(rowId).toBe(1);
      expect(decodeComment(body.comment, WISH_A)).toBe('Tata Jeanne et Paul');

      release();

      // Le commentaire tient après la relecture du serveur
      await waitFor(() => expect(server.sent('list')).toHaveLength(2));
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      expect(result.current.reservations[WISH_A]).toEqual({
        id: 1,
        comment: 'Tata Jeanne et Paul',
      });
    });

    it("rétablit l'ancien commentaire et signale l'échec quand l'écriture échoue", async () => {
      const result = await renderLoaded();
      const release = server.hold('list');

      server.fail('PATCH');
      act(() => result.current.updateReservation(rectification));

      await waitFor(() => expect(result.current.mutationError?.action).toBe('update'));

      expect(result.current.reservations[WISH_A]).toEqual({ id: 1, comment: 'Tata Jeanne' });

      release();
    });
  });

  describe('cancelReservation', () => {
    it('retire la réservation avant la réponse et la supprime sur le serveur', async () => {
      const result = await renderLoaded();
      const release = server.hold('DELETE');

      act(() => result.current.cancelReservation(1));

      await waitFor(() => expect(server.sent('DELETE')).toHaveLength(1));
      expect(result.current.reservations).toEqual({});
      expect(server.sent('DELETE')[0].rowId).toBe(1);

      release();

      await waitFor(() => expect(server.rows.map(({ id }) => id)).toEqual([2]));
    });

    it("rétablit la réservation et signale l'échec quand la suppression échoue", async () => {
      const result = await renderLoaded();
      const release = server.hold('list');

      server.fail('DELETE');
      act(() => result.current.cancelReservation(1));

      await waitFor(() => expect(result.current.mutationError?.action).toBe('cancel'));

      expect(result.current.reservations).toEqual({
        [WISH_A]: { id: 1, comment: 'Tata Jeanne' },
      });

      release();
    });
  });
});
