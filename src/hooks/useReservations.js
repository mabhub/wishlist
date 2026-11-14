import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BASEROW_CONFIG,
  fetchAllBaserowRows,
  getBaserowFetchOptions,
} from '../config/baserow';
import { encodeComment, decodeComment } from '../utils/encoding';
import useActiveListId from './useActiveListId';

/**
 * Hook pour gérer les réservations d'une liste.
 *
 * La table des réservations ne porte pas de colonne `list` : le rattachement à
 * une liste passe uniquement par `wish`, l'UUID de l'item réservé. Les
 * réservations sont donc restreintes aux items de la liste courante côté client,
 * à la lecture (option `select`) — un filtre serveur sur `list` serait ignoré
 * silencieusement par Baserow, qui renverrait les réservations de toutes les listes.
 *
 * @param {boolean} enabled - Si true, charge les réservations
 * @param {string[]} [listItemUuids=[]] - UUID des items de la liste courante
 * @returns {Object} Réservations indexées par UUID d'item, états de chargement,
 *   mutations addReservation / updateReservation / cancelReservation, et
 *   dernier échec d'écriture (`mutationError` : `{ action, error }`, remis à
 *   zéro par `clearMutationError`)
 */
const useReservations = (enabled = false, listItemUuids = []) => {
  const activeListId = useActiveListId();
  const queryClient = useQueryClient();

  // Dernier échec d'écriture, pour que l'interface puisse le signaler : sans
  // lui, le rollback optimiste annulait l'action sans aucune explication.
  const [mutationError, setMutationError] = React.useState(null);
  const clearMutationError = React.useCallback(() => setMutationError(null), []);

  // Clé unique partagée par la query et les mutations : `setQueryData` et
  // `getQueryData` comparent la clé exactement, une clé divergente ferait
  // écrire les mises à jour optimistes dans une entrée que personne ne lit.
  const queryKey = React.useMemo(() => ['reservations', activeListId], [activeListId]);

  // Le cache contient toutes les réservations indexées par UUID d'item ; la
  // restriction aux items de la liste courante se fait à la lecture (`select`).
  const selectListReservations = React.useCallback(
    allReservations => {
      const listItems = new Set(listItemUuids);

      return Object.fromEntries(
        Object.entries(allReservations).filter(([wishId]) => listItems.has(wishId)),
      );
    },
    [listItemUuids],
  );

  // Query pour récupérer les réservations
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const rows = await fetchAllBaserowRows(
        BASEROW_CONFIG.reservationsTableId,
        {},
        'reservations',
      );

      // Transformer les données : décoder les commentaires et indexer par wish UUID
      const reservationsMap = {};
      rows.forEach(reservation => {
        if (reservation.wish) {
          reservationsMap[reservation.wish] = {
            id: reservation.id,
            comment: reservation.comment ? decodeComment(reservation.comment, reservation.wish) : '',
          };
        }
      });

      return reservationsMap;
    },
    select: selectListReservations,
    enabled,
    staleTime: 10 * 1000, // Cache 10 secondes (données très dynamiques)
    refetchInterval: enabled ? 15 * 1000 : false, // Rafraîchir toutes les 15 secondes en mode actif
  });

  // Mutation pour ajouter une réservation
  const addReservationMutation = useMutation({
    mutationFn: async ({ wishId, comment }) => {
      const url = `${BASEROW_CONFIG.baseUrl}/api/database/rows/table/${BASEROW_CONFIG.reservationsTableId}/?user_field_names=true`;

      const response = await fetch(url, {
        method: 'POST',
        ...getBaserowFetchOptions(),
        body: JSON.stringify({
          wish: wishId,
          comment: encodeComment(comment, wishId),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add reservation: ${response.statusText}`);
      }

      return response.json();
    },
    onMutate: async ({ wishId, comment }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey });

      // Sauvegarder l'état précédent pour rollback en cas d'erreur
      const previousReservations = queryClient.getQueryData(queryKey);

      // Optimistic update : ajouter immédiatement la réservation au cache
      queryClient.setQueryData(queryKey, old => ({
        ...old,
        [wishId]: {
          id: `temp-${wishId}`, // ID temporaire jusqu'à la réponse du serveur
          comment: comment || '',
        },
      }));

      return { previousReservations };
    },
    onError: (err, variables, context) => {
      setMutationError({ action: 'add', error: err });

      // Rollback en cas d'erreur
      if (context?.previousReservations) {
        queryClient.setQueryData(queryKey, context.previousReservations);
      }
    },
    onSuccess: (data, { wishId }) => {
      // Mettre à jour avec l'ID réel du serveur
      queryClient.setQueryData(queryKey, old => {
        if (!old || !old[wishId]) return old;

        return {
          ...old,
          [wishId]: {
            ...old[wishId],
            id: data.id, // Remplacer l'ID temporaire par l'ID réel
          },
        };
      });
    },
    onSettled: () => {
      // Rafraîchir les données après succès ou erreur
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mutation pour modifier le commentaire d'une réservation existante
  const updateReservationMutation = useMutation({
    mutationFn: async ({ reservationId, wishId, comment }) => {
      const url = `${BASEROW_CONFIG.baseUrl}/api/database/rows/table/${BASEROW_CONFIG.reservationsTableId}/${reservationId}/?user_field_names=true`;

      const response = await fetch(url, {
        method: 'PATCH',
        ...getBaserowFetchOptions(),
        body: JSON.stringify({
          comment: encodeComment(comment, wishId),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update reservation: ${response.statusText}`);
      }

      return response.json();
    },
    onMutate: async ({ wishId, comment }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousReservations = queryClient.getQueryData(queryKey);

      // Optimistic update : refléter immédiatement le nouveau commentaire
      queryClient.setQueryData(queryKey, old => {
        if (!old || !old[wishId]) return old;

        return {
          ...old,
          [wishId]: {
            ...old[wishId],
            comment: comment || '',
          },
        };
      });

      return { previousReservations };
    },
    onError: (err, variables, context) => {
      setMutationError({ action: 'update', error: err });

      if (context?.previousReservations) {
        queryClient.setQueryData(queryKey, context.previousReservations);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mutation pour supprimer une réservation
  const deleteReservationMutation = useMutation({
    mutationFn: async reservationId => {
      const url = `${BASEROW_CONFIG.baseUrl}/api/database/rows/table/${BASEROW_CONFIG.reservationsTableId}/${reservationId}/`;

      const response = await fetch(url, {
        method: 'DELETE',
        ...getBaserowFetchOptions(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete reservation: ${response.statusText}`);
      }

      return reservationId;
    },
    onMutate: async reservationId => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey });

      // Sauvegarder l'état précédent pour rollback en cas d'erreur
      const previousReservations = queryClient.getQueryData(queryKey);

      // Optimistic update : retirer la réservation du cache
      queryClient.setQueryData(queryKey, old => {
        if (!old) return old;

        // Trouver la clé (wishId) correspondant à ce reservationId
        const wishIdToRemove = Object.keys(old).find(wishId => old[wishId]?.id === reservationId);

        if (!wishIdToRemove) return old;

        // Créer une copie sans cette réservation
        const newReservations = { ...old };
        delete newReservations[wishIdToRemove];

        return newReservations;
      });

      return { previousReservations };
    },
    onError: (err, reservationId, context) => {
      setMutationError({ action: 'cancel', error: err });

      // Rollback en cas d'erreur
      if (context?.previousReservations) {
        queryClient.setQueryData(queryKey, context.previousReservations);
      }
    },
    onSettled: () => {
      // Rafraîchir les données après succès ou erreur
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    reservations: query.data || {},
    // `isLoading` vaut true en v4 pour une query désactivée sans données :
    // seul le premier chargement effectif doit afficher un indicateur.
    isLoading: query.isInitialLoading,
    error: query.error,
    addReservation: addReservationMutation.mutate,
    updateReservation: updateReservationMutation.mutate,
    cancelReservation: deleteReservationMutation.mutate,
    mutationError,
    clearMutationError,
  };
};

export default useReservations;
