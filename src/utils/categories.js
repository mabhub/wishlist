import { categoryProps } from '../constants/categories';

/**
 * Indique si un item reste visible selon les catégories désactivées dans le filtre.
 *
 * Un item est masqué quand toutes ses catégories sont désactivées. Un item sans
 * catégorie ne peut pas être ciblé par un chip : il suit l'état global du filtre,
 * donc il n'est masqué que si toutes les catégories le sont.
 *
 * @param {string[]} [itemCategories=[]] - Catégories de l'item
 * @param {string[]} [disabledCategories=[]] - Catégories désactivées
 * @param {string[]} [allCategories=[]] - Toutes les catégories du filtre
 * @returns {boolean} `true` si l'item doit être affiché
 *
 * @example
 * isVisibleInCategories(['Livre', 'Jeu'], ['Livre'], ['Livre', 'Jeu']) // true
 * isVisibleInCategories([], ['Livre', 'Jeu'], ['Livre', 'Jeu']) // false
 */
export const isVisibleInCategories = (
  itemCategories = [],
  disabledCategories = [],
  allCategories = [],
) => {
  if (itemCategories.length) {
    return !itemCategories.every(category => disabledCategories.includes(category));
  }

  return !(allCategories.length > 0 && disabledCategories.length === allCategories.length);
};

/**
 * Couleurs du thème attribuées aux catégories sans configuration dans `categoryProps`.
 */
export const CATEGORY_COLORS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];

/**
 * Couleur du thème d'une catégorie : celle de `categoryProps` si elle y figure, sinon
 * une couleur de `CATEGORY_COLORS` tirée du nom, donc stable d'un affichage à l'autre.
 * Utile quand les catégories viennent d'une source libre (saisies par l'utilisateur ou
 * importées d'un autre site).
 *
 * @param {string} label - Nom de la catégorie
 * @returns {string} Nom d'une couleur de la palette du thème
 *
 * @example
 * categoryColor('Vinyle') // 'primary'
 */
export const categoryColor = label => {
  if (categoryProps[label]?.color) {
    return categoryProps[label].color;
  }

  const hash = [...label].reduce((acc, char) => (acc * 31 + char.codePointAt(0)) % 1_000_003, 0);
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};
