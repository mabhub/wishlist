import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  BASEROW_CONFIG,
  buildBaserowUrl,
  getBaserowFetchOptions,
} from '../config/baserow';

/**
 * Transforme les données Baserow vers le format attendu par l'application.
 *
 * @param {Array} baserowItems - Items retournés par l'API Baserow
 * @returns {Object} Données formatées avec items et categories
 */
const transformBaserowData = baserowItems => {
  const items = baserowItems.map(item => ({
    title: item.title || '',
    brand: item.brand || '',
    description: item.description || '',
    picture: item.picture || '',
    link: item.link || '',
    weight: item.weight ? parseFloat(item.weight) : 999,
    categories: item.categories ? item.categories.split(',').map(c => c.trim()) : [],
    qty: 1,
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
 * @returns {Object} Résultat de la query avec data, isLoading, error
 * @returns {Array} data.items - Items de la wishlist
 * @returns {Array} data.categories - Liste des catégories uniques
 * @returns {boolean} isLoading - État de chargement
 * @returns {Error|null} error - Erreur éventuelle
 */
const useWishlist = () => {
  const { listId } = useParams();
  const activeListId = listId || BASEROW_CONFIG.defaultListId;

  return useQuery({
    queryKey: ['wishlist', activeListId],
    queryFn: async () => {
      const url = buildBaserowUrl(BASEROW_CONFIG.tableId, {
        list: activeListId,
      });

      const response = await fetch(url, getBaserowFetchOptions());

      if (!response.ok) {
        throw new Error(`Failed to load wishlist data: ${response.statusText}`);
      }

      const data = await response.json();
      return transformBaserowData(data.results || []);
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
};

export default useWishlist;
