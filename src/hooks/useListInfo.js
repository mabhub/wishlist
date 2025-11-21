import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  BASEROW_CONFIG,
  buildBaserowUrl,
  getBaserowFetchOptions,
} from '../config/baserow';

/**
 * Hook pour charger les informations d'une liste depuis Baserow.
 *
 * @returns {Object} Résultat de la query avec data, isLoading, error
 * @returns {Object|null} data - Informations de la liste
 * @returns {string} data.title - Titre de la liste
 * @returns {string} data.for - Destinataire de la liste
 * @returns {boolean} isLoading - État de chargement
 * @returns {Error|null} error - Erreur éventuelle
 */
const useListInfo = () => {
  const { listId } = useParams();
  const activeListId = listId || BASEROW_CONFIG.defaultListId;

  return useQuery({
    queryKey: ['listInfo', activeListId],
    queryFn: async () => {
      const url = buildBaserowUrl(BASEROW_CONFIG.listsTableId, {
        uuid: activeListId,
      });

      const response = await fetch(url, getBaserowFetchOptions());

      if (!response.ok) {
        throw new Error(`Failed to load list info: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const listData = data.results[0];
      return {
        title: listData.title || '',
        for: listData.for || '',
      };
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
};

export default useListInfo;
