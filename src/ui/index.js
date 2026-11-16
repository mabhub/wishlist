/**
 * Point d'entrée de la bibliothèque `wishlist/ui` : composants d'interface sans accès
 * aux données. Rien de ce qui est exporté ici ne doit dépendre de Baserow.
 *
 * Les fichiers sont publiés en source (JSX) : le projet consommateur les transforme
 * lui-même. Installée depuis git, la bibliothèque partage React, MUI et Emotion avec
 * lui ; liée par `file:` (dépôt qui a ses propres `node_modules`), il faut les
 * dédupliquer (`resolve.dedupe` de Vite).
 */
export { theme } from './theme';
export { default as CategoryChip } from '../components/CategoryChip';
export { categoryProps } from '../constants/categories';
export { default as WishlistItemCard } from '../components/WishlistItemCard';
export { default as WishlistView } from '../components/WishlistView';
export { default as useCategoryFilter } from '../hooks/useCategoryFilter';
