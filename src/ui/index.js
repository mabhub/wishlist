/**
 * Point d'entrée de la bibliothèque `wishlist/ui` : composants d'interface sans accès
 * aux données. Rien de ce qui est exporté ici ne doit dépendre de Baserow.
 *
 * Les fichiers sont publiés en source (JSX) : le projet consommateur les transforme
 * lui-même et doit dédupliquer React, MUI et Emotion (`resolve.dedupe` de Vite).
 */
export { theme } from './theme';
export { default as CategoryChip } from '../components/CategoryChip';
export { categoryProps } from '../constants/categories';
