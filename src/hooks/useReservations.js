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
    onSuccess: () => {
      // Invalider le cache pour recharger les réservations
      queryClient.invalidateQueries({ queryKey: ['reservations', activeListId] });
    },
  });

  return {
    reservations: query.data || {},
    isLoading: query.isLoading,
    error: query.error,
    addReservation: addReservationMutation.mutate,
    isAddingReservation: addReservationMutation.isPending,
  };
};

export default useReservations;
