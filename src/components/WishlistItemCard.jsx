import React from 'react';
import { Box, ButtonBase, Card, CardContent, CardMedia, Chip, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { InfoOutlined as InfoIcon, Close as CloseIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import CategoryChip from './CategoryChip';

const blankImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect x="0" y="0" width="200" height="200" fill="white" /></svg>';

/**
 * Composant affichant un item de wishlist en mode vignette (card).
 *
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre de l'item
 * @param {string} [props.link] - Lien URL de l'item
 * @param {string} [props.brand] - Marque de l'item
 * @param {string} [props.picture] - URL de l'image
 * @param {string[]} [props.categories=[]] - Catégories associées
 * @param {number} [props.qty=1] - Quantité souhaitée
 * @param {string} [props.description] - Description complète du produit (Markdown)
 * @returns {JSX.Element} Item de wishlist en mode card
 */
const WishlistItemCard = ({ title, link, brand, picture, categories = [], qty = 1, description }) => {
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleInfoClick = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setOpenDialog(false);
  }, []);

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {description && (
          <IconButton
            onClick={handleInfoClick}
            aria-label="Voir la description"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 2,
              },
              zIndex: 1,
            }}
          >
            <InfoIcon />
          </IconButton>
        )}
        <ButtonBase
          href={link || '#'}
          aria-label={`Voir les détails de ${title}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            textAlign: 'left',
          }}
        >
          <CardMedia
        component="img"
        image={picture || blankImage}
        alt={title}
        sx={{
          width: '100%',
          aspectRatio: '1',
          objectFit: 'cover',
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {brand && (
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {brand}
          </Typography>
        )}

        <Typography variant="h6" component="h2" gutterBottom sx={{ flexGrow: 1 }}>
          {qty > 1 && <Chip size="small" color="secondary" label={`${qty}×`} sx={{ mr: 0.5, mb: 0.5 }} />}
          {title}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {categories.map(category => (
            <CategoryChip
              size="small"
              label={category}
              key={category}
            />
          ))}
        </Box>
      </CardContent>
    </ButtonBase>
  </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            {brand && (
              <Typography variant="caption" color="text.secondary" display="block">
                {brand}
              </Typography>
            )}
            <Typography variant="h6" component="span">
              {title}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {description ? (
            <ReactMarkdown>{description}</ReactMarkdown>
          ) : (
            <Typography color="text.secondary">Aucune description disponible</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

WishlistItemCard.displayName = 'WishlistItemCard';

export default React.memo(WishlistItemCard);
