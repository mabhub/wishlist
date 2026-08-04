import { useQuery } from '@tanstack/react-query';
import { BASEROW_CONFIG, fetchAllBaserowRows } from '../config/baserow';
import useActiveListId from './useActiveListId';

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
  const activeListId = useActiveListId();

  return useQuery({
    queryKey: ['listInfo', activeListId],
    queryFn: async () => {
      const rows = await fetchAllBaserowRows(
        BASEROW_CONFIG.listsTableId,
        { uuid: activeListId },
        'list info',
      );

      const [listData] = rows;

      if (!listData) {
        return null;
      }

      return {
        title: listData.title || '',
        for: listData.for || '',
      };
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
};

export default useListInfo;
