import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CategoryChip from './CategoryChip';

const blankImage =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect x="0" y="0" width="200" height="200" fill="white" /></svg>';

/**
 * Composant affichant un item de wishlist en mode vignette (card). Exporté dans
 * `wishlist/ui` : il ne connaît ni Baserow ni la façon de réserver, l'appelant fournit
 * le contenu de l'onglet de réservation par `renderReservation`.
 *
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre de l'item
 * @param {string} [props.link] - Lien URL de l'item
 * @param {string} [props.brand] - Marque de l'item
 * @param {string} [props.picture] - URL de l'image
 * @param {string[]} [props.categories=[]] - Catégories associées
 * @param {number} [props.qty=1] - Quantité souhaitée
 * @param {string} [props.description] - Description complète du produit
 * @param {string} [props.createdOn] - Date de création ISO 8601
 * @param {string} [props.lastModifiedOn] - Date de dernière modification ISO 8601
 * @param {string} [props.price] - Prix déjà formaté par l'appelant, affiché tel quel
 * @param {boolean} [props.isReserved=false] - Si true, l'élément est réservé
 * @param {boolean} [props.isLoadingReservations=false] - Chargement des réservations en
 *   cours : l'onglet de réservation affiche un indicateur
 * @param {Function} [props.renderReservation] - `({ showPreview }) => ReactNode` : contenu
 *   de l'onglet de réservation ; sans lui, ni onglet ni pastille de réservation.
 *   `showPreview` ramène la carte à l'aperçu
 * @param {Object} [props.sx] - Styles appliqués au conteneur de la carte
 * @returns {JSX.Element} Item de wishlist en mode card
 */
const WishlistItemCard = ({
  title,
  link,
  brand,
  picture,
  categories = [],
  qty = 1,
  description,
  createdOn,
  lastModifiedOn,
  price,
  isReserved = false,
  isLoadingReservations = false,
  renderReservation,
  sx = {},
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const hasReservation = Boolean(renderReservation);

  // Index des onglets : l'onglet Détails n'existe que si une description est
  // fournie, ce qui décale l'onglet de réservation d'un cran.
  const PREVIEW_TAB = 0;
  const detailsTab = description ? 1 : -1;
  const reservationTab = description ? 2 : 1;

  // Revenir à l'aperçu quand l'onglet de réservation disparaît. Fait pendant le rendu
  // et non dans un effet : React relance aussitôt le rendu, et `Tabs` ne reçoit
  // jamais l'index d'un onglet de réservation qui n'existe plus.
  if (!hasReservation && activeTab >= reservationTab) {
    setActiveTab(PREVIEW_TAB);
  }

  const handleTabChange = React.useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const showReservationTab = React.useCallback(() => {
    setActiveTab(reservationTab);
  }, [reservationTab]);

  const showPreviewTab = React.useCallback(() => {
    setActiveTab(PREVIEW_TAB);
  }, []);

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
        {(description || hasReservation) && (
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
            {detailsTab > 0 && <Tab label="Détails" />}
            {hasReservation && isLoadingReservations && (
              <Tab label={<CircularProgress size={16} />} />
            )}
            {hasReservation && !isLoadingReservations && (
              <Tab label={isReserved ? 'Réservé' : 'Offrir'} />
            )}
          </Tabs>
        )}

        {/* Zone 1: Image (visible sur onglets 0 et 1) */}
        <Collapse in={activeTab === PREVIEW_TAB}>
          <Box sx={{ position: 'relative' }}>
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

            {hasReservation && isReserved && (
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
                <Chip
                  label="Déjà réservé"
                  color="secondary"
                  onClick={showReservationTab}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            )}

            {hasReservation && !isReserved && (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  display: 'flex',
                  fontSize: '1rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s',
                  '& *': {
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.75)',
                    '& *': {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Chip
                  label="Réserver"
                  color="primary"
                  onClick={showReservationTab}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            )}
          </Box>
        </Collapse>

        <CardContent
          sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
        >
          {/* Zone 2: Titre (toujours visible) */}
          <CardActionArea
            component="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              p: 0,
              borderRadius: 0,
              textAlign: 'left',
              display: 'block',
            }}
          >
            {brand && (
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {brand}
              </Typography>
            )}

            <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }} gutterBottom>
              {qty > 1 && (
                <Chip size="small" color="secondary" label={`${qty}×`} sx={{ mr: 0.5, mb: 0.5 }} />
              )}
              {title}{' '}
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                {categories.map(category => (
                  <CategoryChip variant="dot" label={category} key={category} sx={{ mr: 0.25 }} />
                ))}
              </Box>
            </Typography>

            {price && (
              <Typography variant="subtitle2" color="text.secondary">
                {price}
              </Typography>
            )}
          </CardActionArea>

          {/* Zone 3: Description + Dates (visible sur onglet 1) */}
          <Collapse in={activeTab === detailsTab}>
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

            {(createdOn || lastModifiedOn) && (
              <Stack sx={{ mt: 2, pt: 2, opacity: 0.4 }} direction="row">
                {createdOn && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', lineHeight: 1, letterSpacing: -0.05 }}
                  >
                    Créé le
                    <br />
                    {new Date(createdOn).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                )}
                {lastModifiedOn && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      ml: 'auto',
                      lineHeight: 1,
                      letterSpacing: -0.05,
                    }}
                  >
                    Modifié le
                    <br />
                    {new Date(lastModifiedOn).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                )}
              </Stack>
            )}
          </Collapse>

          {/* Zone 4: Réservation, fournie par l'appelant (dernier onglet) */}
          <Collapse in={activeTab === reservationTab && hasReservation}>
            {renderReservation?.({ showPreview: showPreviewTab })}
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

WishlistItemCard.displayName = 'WishlistItemCard';

export default React.memo(WishlistItemCard);
