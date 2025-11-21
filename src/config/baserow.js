/**
 * Configuration de l'API Baserow.
 * Les valeurs sont chargées depuis les variables d'environnement.
 */
export const BASEROW_CONFIG = {
  baseUrl: import.meta.env.VITE_BASEROW_API_URL || 'https://api.baserow.io',
  databaseId: import.meta.env.VITE_BASEROW_DATABASE_ID || '',
  tableId: import.meta.env.VITE_BASEROW_ITEMS_TABLE_ID || '', // Table des items
  listsTableId: import.meta.env.VITE_BASEROW_LISTS_TABLE_ID || '', // Table des listes
  token: import.meta.env.VITE_BASEROW_TOKEN || '',
  defaultListId: import.meta.env.VITE_BASEROW_DEFAULT_LIST_ID || '',
};

/**
 * Construit l'URL pour récupérer les rows d'une table Baserow.
 *
 * @param {string} tableId - ID de la table Baserow
 * @param {Object} filters - Filtres à appliquer (clé: nom du champ, valeur: valeur à filtrer)
 * @returns {string} URL complète avec filtres
 */
export const buildBaserowUrl = (tableId, filters = {}) => {
  const url = new URL(`${BASEROW_CONFIG.baseUrl}/api/database/rows/table/${tableId}/`);

  // Utiliser les noms de champs au lieu des IDs
  url.searchParams.append('user_field_names', 'true');

  Object.entries(filters).forEach(([field, value]) => {
    url.searchParams.append(`filter__${field}__equal`, value);
  });

  return url.toString();
};

/**
 * Options de fetch pour les requêtes Baserow.
 *
 * @returns {Object} Options avec headers d'authentification
 */
export const getBaserowFetchOptions = () => ({
  headers: {
    Authorization: `Token ${BASEROW_CONFIG.token}`,
    'Content-Type': 'application/json',
  },
});
