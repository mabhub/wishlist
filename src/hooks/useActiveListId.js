import { useParams } from 'react-router';
import { BASEROW_CONFIG } from '../config/baserow';

/**
 * Résout l'identifiant de la liste courante.
 *
 * La liste vient du segment d'URL `/list/:listId`, avec repli sur la liste par
 * défaut configurée en variable d'environnement pour la route racine `/`.
 *
 * @returns {string} UUID de la liste active ('' si aucune liste résolue)
 */
const useActiveListId = () => {
  const { listId } = useParams();

  return listId || BASEROW_CONFIG.defaultListId;
};

export default useActiveListId;
