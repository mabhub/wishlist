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
