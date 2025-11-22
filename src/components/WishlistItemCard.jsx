import React from 'react';
import { Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import CategoryChip from './CategoryChip';
import ReservationDialog from './ReservationDialog';

const blankImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect x="0" y="0" width="200" height="200" fill="white" /></svg>';

/**
 * Composant affichant un item de wishlist en mode vignette (card).
 *
 * @param {Object} props - Props du composant
 * @param {string} props.uuid - UUID unique de l'item
 * @param {string} props.title - Titre de l'item
 * @param {string} [props.link] - Lien URL de l'item
 * @param {string} [props.brand] - Marque de l'item
 * @param {string} [props.picture] - URL de l'image
 * @param {string[]} [props.categories=[]] - Catégories associées
 * @param {number} [props.qty=1] - Quantité souhaitée
 * @param {string} [props.description] - Description complète du produit
 * @param {boolean} [props.isFlipped=false] - État de retournement de la carte
 * @param {Function} [props.onFlip] - Callback pour gérer le retournement
 * @param {boolean} [props.giftMode=false] - Mode offrir activé
 * @param {boolean} [props.isLoadingReservations=false] - Chargement des réservations en cours
 * @param {boolean} [props.isReserved=false] - Si true, l'élément est réservé
 * @param {Object} [props.reservation] - Informations de réservation (comment)
 * @param {Function} [props.onReserve] - Callback pour réserver un élément
 * @returns {JSX.Element} Item de wishlist en mode card
 */
const WishlistItemCard = ({
  uuid,
  title,
  link,
  brand,
  picture,
  categories = [],
  qty = 1,
  description,
  isFlipped = false,
  onFlip,
  giftMode = false,
  isLoadingReservations = false,
  isReserved = false,
  reservation = null,
  onReserve,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleCardClick = React.useCallback(() => {
    if (description && onFlip) {
      onFlip(isFlipped ? null : title);
    }
  }, [description, isFlipped, onFlip, title]);

  const handleLinkClick = React.useCallback(event => {
    event.stopPropagation();
  }, []);

  const handleReserveClick = React.useCallback(event => {
    event.stopPropagation();
    setDialogOpen(true);
  }, []);

  const handleDialogClose = React.useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleReserveConfirm = React.useCallback(comment => {
    if (onReserve) {
      onReserve({ wishId: uuid, comment });
    }
  }, [onReserve, uuid]);

  return (
    <Box
      sx={{
        width: '100%',
        perspective: '1000px',
        cursor: description ? 'pointer' : 'default',
      }}
      onClick={handleCardClick}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped && description ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Face avant */}
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backfaceVisibility: 'hidden',
            opacity: isReserved ? 0.75 : 1,
          }}
        >
          {link && (
            <Tooltip title="Ouvrir le lien externe">
              <IconButton
                onClick={handleLinkClick}
                aria-label="Ouvrir le lien du produit"
                href={link}
                color="secondary"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  boxShadow: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

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

            <Typography variant="h6" component="h2" gutterBottom sx={{ flexGrow: 1, lineHeight: 1.2 }}>
              {qty > 1 && <Chip size="small" color="secondary" label={`${qty}×`} sx={{ mr: 0.5, mb: 0.5 }} />}
              {title}{' '}
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                {categories.map(category => (
                  <CategoryChip
                    variant="dot"
                    label={category}
                    key={category}
                    sx={{ mr: 0.25 }}
                  />
                ))}
              </Box>
            </Typography>

            {giftMode && (
              <Box sx={{ mt: 2 }}>
                {isLoadingReservations && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {!isLoadingReservations && isReserved && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎁
                    <Typography variant="caption" color="primary">
                      Déjà réservé
                      {reservation?.comment && ` - ${reservation.comment}`}
                    </Typography>
                  </Box>
                )}

                {!isLoadingReservations && !isReserved && (
                  <Button
                    size="small"
                    fullWidth
                    startIcon="🎁"
                    onClick={handleReserveClick}
                  >
                    Réserver
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Face arrière */}
        {description && (
          <Card
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              overflow: 'auto',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                {brand}
              </Typography>
              <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }} gutterBottom>
                {title}
              </Typography>
              <Box
                sx={{
                  '& p': {
                    mt: 0,
                    mb: 1,
                    fontSize: '0.875rem',
                  },
                  '& p:last-child': {
                    mb: 0,
                  },
                }}
              >
                <ReactMarkdown>{description}</ReactMarkdown>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <ReservationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleReserveConfirm}
        itemTitle={title}
      />
    </Box>
  );
};

WishlistItemCard.displayName = 'WishlistItemCard';

export default React.memo(WishlistItemCard);
