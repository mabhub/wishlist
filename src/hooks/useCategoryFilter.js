import React from 'react';

import { toggle } from '../utils/array';
import { isVisibleInCategories } from '../utils/categories';

/**
 * État du filtre par catégories, à passer à `WishlistView`. Exporté dans `wishlist/ui`.
 *
 * `onCategoryClick(category)` bascule une catégorie ; sans argument (chip « Tout »),
 * il réactive tout si une catégorie est désactivée, sinon désactive tout.
 *
 * @param {string[]} [categories=[]] - Toutes les catégories proposées dans le filtre
 * @returns {{
 *   disabledCategories: string[],
 *   onCategoryClick: (category?: string) => void,
 *   isVisible: (item: { categories?: string[] }) => boolean,
 * }} État du filtre et prédicat à appliquer aux items
 */
const useCategoryFilter = (categories = []) => {
  const [disabledCategories, setDisabledCategories] = React.useState([]);

  const onCategoryClick = React.useCallback(
    category => {
      setDisabledCategories(prevDisabledCategories => {
        if (category === undefined) {
          return prevDisabledCategories.length ? [] : [...categories];
        }
        return toggle(prevDisabledCategories, category);
      });
    },
    [categories],
  );

  const isVisible = React.useCallback(
    ({ categories: itemCategories }) =>
      isVisibleInCategories(itemCategories, disabledCategories, categories),
    [disabledCategories, categories],
  );

  return { disabledCategories, onCategoryClick, isVisible };
};

export default useCategoryFilter;
