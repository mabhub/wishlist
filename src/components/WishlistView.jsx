import React from 'react';
import { Box, Container, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

import CategoryChip from './CategoryChip';

/**
 * Page de liste sans accès aux données : en-tête, filtre par catégories, emplacements
 * pour les actions de l'appelant, puis grille de cartes. Exportée dans `wishlist/ui`.
 *
 * Les items arrivent déjà triés et filtrés : la vue n'affiche que l'état du filtre
 * (voir `useCategoryFilter`) et délègue le rendu de chaque item à `renderItem`.
 *
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} [props.title] - Titre de la liste (rendu dans un `h1`)
 * @param {React.ReactNode} [props.subtitle] - Sous-titre sous le titre
 * @param {string[]} [props.categories=[]] - Catégories proposées dans le filtre
 * @param {string[]} [props.disabledCategories=[]] - Catégories désactivées
 * @param {Function} [props.onCategoryClick] - Reçoit la catégorie cliquée, ou rien pour « Tout »
 * @param {React.ReactNode} [props.actions] - Contenu placé à droite du filtre
 * @param {React.ReactNode} [props.beforeGrid] - Contenu placé entre le séparateur et la grille
 * @param {Object[]} [props.items=[]] - Items à afficher, dans l'ordre
 * @param {Function} props.getItemKey - `item => key` : clé React de chaque item
 * @param {Function} props.renderItem - `item => ReactNode` : carte de chaque item
 * @param {Object} [props.sx] - Styles du conteneur de page
 * @returns {JSX.Element} Page de liste
 */
const WishlistView = ({
  title,
  subtitle,
  categories = [],
  disabledCategories = [],
  onCategoryClick,
  actions,
  beforeGrid,
  items = [],
  getItemKey,
  renderItem,
  sx = {},
}) => (
  <Container sx={{ py: 4, ...sx }}>
    {(title || subtitle) && (
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {title && (
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    )}

    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <CategoryChip
          label="Tout"
          color="default"
          onClick={() => onCategoryClick?.()}
          aria-pressed={disabledCategories.length === 0}
        />

        {categories.map(category => (
          <CategoryChip
            key={category}
            label={category}
            onClick={() => onCategoryClick?.(category)}
            aria-pressed={!disabledCategories.includes(category)}
            sx={{
              opacity: disabledCategories.includes(category) ? 0.2 : 1,
              ml: 1,
            }}
          />
        ))}
      </Box>

      {actions}
    </Box>

    <Divider sx={{ my: 2 }} />

    {beforeGrid && <Box sx={{ mb: 2 }}>{beforeGrid}</Box>}

    <Grid container spacing={2}>
      {items.map(item => (
        <Grid key={getItemKey(item)} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          {renderItem(item)}
        </Grid>
      ))}
    </Grid>
  </Container>
);

WishlistView.displayName = 'WishlistView';

export default WishlistView;
