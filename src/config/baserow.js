/**
 * Configuration de l'API Baserow.
 * Les valeurs sont chargées depuis les variables d'environnement.
 */
export const BASEROW_CONFIG = {
  baseUrl: import.meta.env.VITE_BASEROW_API_URL || 'https://api.baserow.io',
  databaseId: import.meta.env.VITE_BASEROW_DATABASE_ID || '',
  tableId: import.meta.env.VITE_BASEROW_ITEMS_TABLE_ID || '', // Table des items
  listsTableId: import.meta.env.VITE_BASEROW_LISTS_TABLE_ID || '', // Table des listes
  reservationsTableId: import.meta.env.VITE_BASEROW_RESERVATIONS_TABLE_ID || '', // Table des réservations
  token: import.meta.env.VITE_BASEROW_TOKEN || '',
  defaultListId: import.meta.env.VITE_BASEROW_DEFAULT_LIST_ID || '',
};

/**
 * Nombre de rows demandées par page.
 * Baserow pagine à 100 par défaut ; on demande davantage pour limiter le
 * nombre d'allers-retours, la pagination restant suivie via `next`.
 */
const PAGE_SIZE = 200;

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
  url.searchParams.append('size', String(PAGE_SIZE));

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

/**
 * Récupère toutes les rows d'une table en suivant la pagination Baserow.
 *
 * L'API pagine les résultats et expose l'URL de la page suivante dans `next`.
 * Sans ce parcours, seule la première page était lue et les données au-delà
 * étaient ignorées silencieusement.
 *
 * @param {string} tableId - ID de la table Baserow
 * @param {Object} [filters={}] - Filtres à appliquer
 * @param {string} [errorLabel='data'] - Libellé utilisé dans le message d'erreur
 * @returns {Promise<Array>} Toutes les rows, pages concaténées
 * @throws {Error} Si une requête échoue
 */
export const fetchAllBaserowRows = async (tableId, filters = {}, errorLabel = 'data') => {
  const rows = [];
  let nextUrl = buildBaserowUrl(tableId, filters);

  while (nextUrl) {
    // Séquentiel par nécessité : l'URL suivante n'est connue qu'après la réponse
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(nextUrl, getBaserowFetchOptions());

    if (!response.ok) {
      throw new Error(`Failed to load ${errorLabel}: ${response.statusText}`);
    }

    // eslint-disable-next-line no-await-in-loop
    const page = await response.json();
    rows.push(...(page.results || []));
    nextUrl = page.next || null;
  }

  return rows;
};
