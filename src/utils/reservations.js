import { decodeComment } from './encoding';

/**
 * Code porté par l'erreur levée quand un item est déjà réservé au moment
 * d'enregistrer une nouvelle réservation.
 */
export const ALREADY_RESERVED = 'already-reserved';

/**
 * Indexe les réservations Baserow par UUID d'item, commentaires décodés.
 *
 * Deux réservations concurrentes peuvent viser le même item. On garde la plus
 * ancienne (plus petit `id`) : l'affichage ne dépend plus de l'ordre renvoyé
 * par l'API, et c'est la première personne à avoir réservé qui reste affichée.
 *
 * @param {Array<{id: number, wish?: string, comment?: string}>} rows - Rows de la table
 * @returns {Object.<string, {id: number, comment: string}>} Réservations indexées par UUID d'item
 *
 * @example
 * buildReservationsMap([{ id: 7, wish: 'a' }, { id: 3, wish: 'a' }])
 * // { a: { id: 3, comment: '' } }
 */
export const buildReservationsMap = rows => {
  const reservationsMap = {};

  rows
    .filter(({ wish }) => wish)
    .toSorted((a, b) => a.id - b.id)
    .forEach(({ id, wish, comment }) => {
      if (!reservationsMap[wish]) {
        reservationsMap[wish] = {
          id,
          comment: comment ? decodeComment(comment, wish) : '',
        };
      }
    });

  return reservationsMap;
};

/**
 * Indique si des rows contiennent une réservation pour un item donné.
 *
 * La comparaison se fait sur le champ lui-même, pas seulement via le filtre de
 * la requête : Baserow ignore sans erreur un filtre sur un champ inconnu et
 * renverrait alors toutes les réservations.
 *
 * @param {Array<{wish?: string}>} rows - Rows de la table reservations
 * @param {string} wishId - UUID de l'item
 * @returns {boolean} true si l'item est déjà réservé
 */
export const hasReservationFor = (rows, wishId) => rows.some(({ wish }) => wish === wishId);
