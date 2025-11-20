import React from 'react';
import { Box, ButtonBase, Chip, Paper, Typography } from '@mui/material';
import CategoryChip from './CategoryChip';

const blankImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect x="0" y="0" width="200" height="200" fill="white" /></svg>';

/**
 * Composant affichant un item de wishlist avec image, titre, description et catégories.
 *
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre de l'item
 * @param {string} [props.link] - Lien URL de l'item
 * @param {string} [props.description] - Description de l'item
 * @param {string} [props.brand] - Marque de l'item
 * @param {string} [props.picture] - URL de l'image
 * @param {string[]} [props.categories=[]] - Catégories associées
 * @param {number} [props.qty=1] - Quantité souhaitée
 * @returns {JSX.Element} Item de wishlist
 */
const WishlistItem = ({ title, link, description, brand, picture, categories = [], qty = 1 }) => (
  <Paper sx={{ mt: 2, px: 1, py: 1 }}>
    <ButtonBase
      href={link || '#'}
      sx={{
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <Box
        title={title}
        alt={title}
        component="img"
        src={picture || blankImage}
        sx={{
          border: 1,
          aspectRatio: '1 / 1',
          mr: { xs: 1, sm: 2 },
          maxWidth: { xs: 60, sm: 100, md: 140 },
          objectFit: 'cover',
        }}
      />
      <Box sx={{ py: 0 }}>
        {brand && (
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            {brand}
          </Typography>
        )}

        <Typography variant="h4" component="h2" sx={{ mt: brand ? -0.5 : 0 }}>
          {qty > 1 && <Chip size="small" color="secondary" label={`${qty}×`} sx={{ mr: 1 }} />}
          {title}

          {categories.map(category => (
            <CategoryChip
              sx={{ ml: 1 }}
              size="small"
              label={category}
              key={category}
            />
          ))}
        </Typography>

        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }} color="text.secondary">
          {description}
        </Typography>
      </Box>
    </ButtonBase>
  </Paper>
);

WishlistItem.displayName = 'WishlistItem';

export default React.memo(WishlistItem);
