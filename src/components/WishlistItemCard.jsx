import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CategoryChip from './CategoryChip';

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
  giftMode = false,
  isLoadingReservations = false,
  isReserved = false,
  reservation = null,
  onReserve,
  sx = {},
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [reservationComment, setReservationComment] = React.useState('');

  // Réinitialiser l'onglet actif quand le mode offrir est désactivé
  React.useEffect(() => {
    if (!giftMode && activeTab > (description ? 1 : 0)) {
      setActiveTab(0);
    }
  }, [giftMode, activeTab, description]);

  const handleTabChange = React.useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleReservationConfirm = React.useCallback(() => {
    if (onReserve) {
      onReserve({ wishId: uuid, comment: reservationComment });
      setReservationComment('');
      setActiveTab(0); // Retour à l'onglet Aperçu
    }
  }, [onReserve, uuid, reservationComment]);

  return (
    <Box
      sx={{
        width: '100%',
        ...sx,
      }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: !isReserved ? 'primary.main' : 'secondary.main',
          transition: 'border-color 0.3s',
        }}
        elevation={5}
      >
        {(description || giftMode) && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor={!isReserved ? 'primary' : 'secondary'}
            textColor={!isReserved ? 'primary' : 'secondary'}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                minWidth: 6,
                py: 0.5,
                px: 0.2,
                fontSize: '0.75rem',
              },
            }}
          >
            <Tab label="Aperçu" />
            {description && <Tab label="Description" />}
            {isLoadingReservations && <Tab label={<CircularProgress size="small" />} />}
            {giftMode && !isLoadingReservations && (<Tab label={isReserved ? 'Réservé' : 'Offrir'} />)}
          </Tabs>
        )}

        {activeTab === 0 && (
          <CardActionArea
            href={link}
            target="_blank"
            rel="noopener noreferrer"
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

            {giftMode && isReserved && (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  position: 'absolute',
                  bgcolor: 'rgba(255, 255, 255, 0.75)',
                  opacity: 0.85,
                  left: 0,
                  top: 0,
                  display: 'flex',
                  fontSize: '1rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Chip label="Déjà offert" color="secondary" />
              </Box>
            )}

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
            </CardContent>
          </CardActionArea>
        )}

        {activeTab === 1 && description && (
          <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
            {brand && (
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                {brand}
              </Typography>
            )}
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
        )}

        {activeTab === (description ? 2 : 1) && giftMode && (
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {isReserved ? (
              <>
                {brand && (
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    {brand}
                  </Typography>
                )}
                <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }} gutterBottom>
                  {title}
                </Typography>
                <Typography variant="h6" color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎁 Déjà réservé
                </Typography>
                {reservation?.comment && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      borderLeft: 3,
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Message de réservation :
                    </Typography>
                    <Typography variant="body1">{reservation.comment}</Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎁 Réserver ce cadeau
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous êtes sur le point de réserver <strong>{title}</strong>.
                  Vous pouvez ajouter un commentaire ou indiquer de la part de qui c'est.
                </Typography>
                <TextField
                  fullWidth
                  label="Commentaire ou 'de la part de...'"
                  placeholder="Ex: De la part de Jean et Marie"
                  value={reservationComment}
                  onChange={e => setReservationComment(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mt: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setActiveTab(0)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReservationConfirm}
                    variant="contained"
                    color="primary"
                  >
                    Confirmer la réservation
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </Box>
  );
};

WishlistItemCard.displayName = 'WishlistItemCard';

export default React.memo(WishlistItemCard);
