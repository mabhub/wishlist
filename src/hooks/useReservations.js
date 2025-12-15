import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  BASEROW_CONFIG,
  buildBaserowUrl,
  getBaserowFetchOptions,
} from '../config/baserow';
import { encodeComment, decodeComment } from '../utils/encoding';

/**
 * Hook pour gérer les réservations d'une liste.
 *
 * @param {boolean} enabled - Si true, charge les réservations
 * @returns {Object} Résultat avec data, isLoading, error, et fonction addReservation
 */
const useReservations = (enabled = false) => {
  const { listId } = useParams();
  const activeListId = listId || BASEROW_CONFIG.defaultListId;
  const queryClient = useQueryClient();

  // Query pour récupérer les réservations
  const query = useQuery({
    queryKey: ['reservations', activeListId],
    queryFn: async () => {
      const url = buildBaserowUrl(BASEROW_CONFIG.reservationsTableId, {
        list: activeListId,
      });

      const response = await fetch(url, getBaserowFetchOptions());

      if (!response.ok) {
        throw new Error(`Failed to load reservations: ${response.statusText}`);
      }

      const data = await response.json();

      // Transformer les données : décoder les commentaires et indexer par wish UUID
      const reservationsMap = {};
      (data.results || []).forEach(reservation => {
        if (reservation.wish) {
          reservationsMap[reservation.wish] = {
            id: reservation.id,
            comment: reservation.comment ? decodeComment(reservation.comment, reservation.wish) : '',
          };
        }
      });

      return reservationsMap;
    },
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
          list: activeListId,
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
      await queryClient.cancelQueries({ queryKey: ['reservations', activeListId] });

      // Sauvegarder l'état précédent pour rollback en cas d'erreur
      const previousReservations = queryClient.getQueryData(['reservations', activeListId]);

      // Optimistic update : ajouter immédiatement la réservation au cache
      queryClient.setQueryData(['reservations', activeListId], old => {
        return {
          ...old,
          [wishId]: {
            id: 'temp-' + wishId, // ID temporaire jusqu'à la réponse du serveur
            comment: comment || '',
          },
        };
      });

      return { previousReservations };
    },
    onError: (err, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations', activeListId], context.previousReservations);
      }
    },
    onSuccess: (data, { wishId }) => {
      // Mettre à jour avec l'ID réel du serveur
      queryClient.setQueryData(['reservations', activeListId], old => {
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
      queryClient.invalidateQueries({ queryKey: ['reservations', activeListId] });
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
      await queryClient.cancelQueries({ queryKey: ['reservations', activeListId] });

      // Sauvegarder l'état précédent pour rollback en cas d'erreur
      const previousReservations = queryClient.getQueryData(['reservations', activeListId]);

      // Optimistic update : retirer la réservation du cache
      queryClient.setQueryData(['reservations', activeListId], old => {
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
      // Rollback en cas d'erreur
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations', activeListId], context.previousReservations);
      }
    },
    onSettled: () => {
      // Rafraîchir les données après succès ou erreur
      queryClient.invalidateQueries({ queryKey: ['reservations', activeListId] });
    },
  });

  return {
    reservations: query.data || {},
    isLoading: query.isLoading,
    error: query.error,
    addReservation: addReservationMutation.mutate,
    isAddingReservation: addReservationMutation.isPending,
    cancelReservation: deleteReservationMutation.mutate,
    isCancelingReservation: deleteReservationMutation.isPending,
  };
};

export default useReservations;
