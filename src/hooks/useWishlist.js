import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour charger les données de la wishlist depuis le fichier JSON public.
 *
 * @returns {Object} Résultat de la query avec data, isLoading, error
 * @returns {Array} data.items - Items de la wishlist
 * @returns {Array} data.categories - Liste des catégories uniques
 * @returns {boolean} isLoading - État de chargement
 * @returns {Error|null} error - Erreur éventuelle
 */
const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await fetch('/data.json');
      if (!response.ok) {
        throw new Error('Failed to load wishlist data');
      }
      const data = await response.json();

      // Extraire les catégories uniques
      const categories = Array.from(
        data.items.reduce((acc, { categories = [] }) => {
          if (categories.length) {
            categories.forEach(cat => acc.add(cat));
          }
          return acc;
        }, new Set())
      );

      return {
        items: data.items,
        categories,
      };
    },
    staleTime: Infinity, // Données statiques, pas besoin de recharger
  });
};

export default useWishlist;
