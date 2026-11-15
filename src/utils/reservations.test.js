import { describe, it, expect } from 'vitest';
import { encodeComment } from './encoding';
import { buildReservationsMap, hasReservationFor } from './reservations';

const WISH_A = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const WISH_B = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

describe('buildReservationsMap', () => {
  it("indexe les réservations par UUID d'item et décode les commentaires", () => {
    const rows = [
      { id: 1, wish: WISH_A, comment: encodeComment('Tata Jeanne', WISH_A) },
      { id: 2, wish: WISH_B, comment: '' },
    ];

    expect(buildReservationsMap(rows)).toEqual({
      [WISH_A]: { id: 1, comment: 'Tata Jeanne' },
      [WISH_B]: { id: 2, comment: '' },
    });
  });

  // Régression : avec deux réservations concurrentes, l'affichage dépendait de
  // l'ordre renvoyé par l'API et pouvait changer d'un rafraîchissement à l'autre.
  it('garde la réservation la plus ancienne quand un item en a plusieurs', () => {
    const rows = [
      { id: 9, wish: WISH_A, comment: encodeComment('Deuxième', WISH_A) },
      { id: 4, wish: WISH_A, comment: encodeComment('Première', WISH_A) },
    ];

    expect(buildReservationsMap(rows)).toEqual({
      [WISH_A]: { id: 4, comment: 'Première' },
    });
  });

  it("donne le même résultat quel que soit l'ordre des rows", () => {
    const rows = [
      { id: 4, wish: WISH_A },
      { id: 9, wish: WISH_A },
      { id: 5, wish: WISH_B },
    ];

    expect(buildReservationsMap(rows.toReversed())).toEqual(buildReservationsMap(rows));
  });

  it('ignore les rows sans item rattaché', () => {
    const rows = [{ id: 1, wish: '' }, { id: 2, wish: null }, { id: 3 }];

    expect(buildReservationsMap(rows)).toEqual({});
  });

  it('ne modifie pas le tableau reçu', () => {
    const rows = [
      { id: 9, wish: WISH_A },
      { id: 4, wish: WISH_A },
    ];

    buildReservationsMap(rows);

    expect(rows.map(({ id }) => id)).toEqual([9, 4]);
  });
});

describe('hasReservationFor', () => {
  it("détecte une réservation de l'item demandé", () => {
    expect(hasReservationFor([{ wish: WISH_A }], WISH_A)).toBe(true);
  });

  it('renvoie false sans réservation', () => {
    expect(hasReservationFor([], WISH_A)).toBe(false);
  });

  // Baserow ignore sans erreur un filtre sur un champ inconnu et renvoie alors
  // toute la table : la présence de rows ne suffit pas à conclure.
  it("ne conclut pas sur la seule présence de rows d'autres items", () => {
    expect(hasReservationFor([{ wish: WISH_B }], WISH_A)).toBe(false);
  });
});
