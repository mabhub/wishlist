import { useQuery } from '@tanstack/react-query';
import { BASEROW_CONFIG, fetchAllBaserowRows } from '../config/baserow';
import useActiveListId from './useActiveListId';

/**
 * Transforme les données Baserow vers le format attendu par l'application.
 *
 * @param {Array} baserowItems - Items retournés par l'API Baserow
 * @returns {Object} Données formatées avec items et categories
 */
const transformBaserowData = baserowItems => {
  const items = baserowItems.map(item => ({
    uuid: item.uuid || '',
    title: item.title || '',
    brand: item.brand || '',
    description: item.description || '',
    picture: item.picture || '',
    link: item.link || '',
    weight: item.weight ? parseFloat(item.weight) : 999,
    categories: item.categories ? item.categories.split(',').map(c => c.trim()) : [],
    qty: 1,
    createdOn: item.created || '',
    lastModifiedOn: item.modified || '',
  }));

  // Extraire les catégories uniques
  const categories = Array.from(
    items.reduce((acc, item) => {
      if (item.categories?.length) {
        item.categories.forEach(cat => acc.add(cat));
      }
      return acc;
    }, new Set()),
  );

  return {
    items,
    categories,
  };
};

/**
 * Hook pour charger les données de la wishlist depuis Baserow.
 *
 * @returns {Object} Résultat de la query avec data, isPending, error
 * @returns {Array} data.items - Items de la wishlist
 * @returns {Array} data.categories - Liste des catégories uniques
 * @returns {boolean} isPending - Aucune donnée encore reçue
 * @returns {Error|null} error - Erreur éventuelle
 */
const useWishlist = () => {
  const activeListId = useActiveListId();

  return useQuery({
    queryKey: ['wishlist', activeListId],
    queryFn: async () => transformBaserowData(
      await fetchAllBaserowRows(
        BASEROW_CONFIG.tableId,
        { list: activeListId },
        'wishlist data',
      ),
    ),
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
};

export default useWishlist;
