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
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
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
 * @param {string} [props.createdOn] - Date de création ISO 8601
 * @param {string} [props.lastModifiedOn] - Date de dernière modification ISO 8601
 * @param {boolean} [props.giftMode=false] - Mode offrir activé
 * @param {boolean} [props.isLoadingReservations=false] - Chargement des réservations en cours
 * @param {boolean} [props.isReserved=false] - Si true, l'élément est réservé
 * @param {Object} [props.reservation] - Informations de réservation (comment)
 * @param {Function} [props.onReserve] - Callback pour réserver un élément
 * @param {Function} [props.onUpdateReservation] - Callback pour modifier le commentaire
 * @param {Function} [props.onCancelReservation] - Callback pour annuler une réservation
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
  createdOn,
  lastModifiedOn,
  giftMode = false,
  isLoadingReservations = false,
  isReserved = false,
  reservation = null,
  onReserve,
  onUpdateReservation,
  onCancelReservation,
  sx = {},
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [reservationComment, setReservationComment] = React.useState('');
  const [isEditingReservation, setIsEditingReservation] = React.useState(false);
  const [editedComment, setEditedComment] = React.useState('');
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  // Index des onglets : l'onglet Détails n'existe que si une description est
  // fournie, ce qui décale l'onglet de réservation d'un cran.
  const PREVIEW_TAB = 0;
  const detailsTab = description ? 1 : -1;
  const reservationTab = description ? 2 : 1;

  // Réinitialiser l'onglet actif quand le mode offrir est désactivé
  React.useEffect(() => {
    if (!giftMode && activeTab >= reservationTab) {
      setActiveTab(PREVIEW_TAB);
    }
  }, [giftMode, activeTab, reservationTab]);

  const handleTabChange = React.useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const showReservationTab = React.useCallback(() => {
    setActiveTab(reservationTab);
  }, [reservationTab]);

  const showPreviewTab = React.useCallback(() => {
    setActiveTab(PREVIEW_TAB);
  }, []);

  const handleReservationConfirm = React.useCallback(() => {
    if (onReserve) {
      onReserve({ wishId: uuid, comment: reservationComment });
      setReservationComment('');
      setActiveTab(PREVIEW_TAB);
    }
  }, [onReserve, uuid, reservationComment]);

  const handleCancelReservation = React.useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const handleConfirmCancel = React.useCallback(() => {
    if (onCancelReservation && reservation?.id) {
      onCancelReservation(reservation.id);
      setActiveTab(PREVIEW_TAB);
    }
    setShowCancelDialog(false);
    setIsEditingReservation(false);
  }, [onCancelReservation, reservation]);

  const handleCloseCancelDialog = React.useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  const handleEditReservation = React.useCallback(() => {
    setEditedComment(reservation?.comment || '');
    setIsEditingReservation(true);
  }, [reservation]);

  const handleSaveEditedReservation = React.useCallback(() => {
    if (onUpdateReservation && reservation?.id) {
      onUpdateReservation({
        reservationId: reservation.id,
        wishId: uuid,
        comment: editedComment,
      });
      setIsEditingReservation(false);
    }
  }, [onUpdateReservation, reservation, uuid, editedComment]);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditingReservation(false);
    setEditedComment('');
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
            {detailsTab > 0 && <Tab label="Détails" />}
            {isLoadingReservations && <Tab label={<CircularProgress size={16} />} />}
            {giftMode && !isLoadingReservations && (<Tab label={isReserved ? 'Réservé' : 'Offrir'} />)}
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
                <Chip
                  label="Déjà réservé"
                  color="secondary"
                  onClick={showReservationTab}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            )}

            {giftMode && !isReserved && (
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

        <CardContent sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
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
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1, letterSpacing: -0.05 }}>
                    Créé le<br />
                    {new Date(createdOn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                )}
                {lastModifiedOn && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'right', ml: 'auto', lineHeight: 1, letterSpacing: -0.05 }}>
                    Modifié le<br />
                    {new Date(lastModifiedOn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                )}
              </Stack>
            )}
          </Collapse>

          {/* Zone 4: Informations de réservation (visible sur onglet 2/1 en mode offrir) */}
          <Collapse in={activeTab === reservationTab && giftMode}>
            {isReserved && (
              <>
                <Typography variant="h6" color="secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  🎁 Déjà réservé
                </Typography>

                {isEditingReservation ? (
                  <TextField
                    fullWidth
                    placeholder="De la part de ?"
                    helperText={(
                      <Box sx={{ lineHeight: 1.2 }}>
                        Facultatif mais utile en cas de doublon, d'erreur, d'oubli, etc.
                      </Box>
                    )}
                    value={editedComment}
                    onChange={e => setEditedComment(e.target.value)}
                    multiline
                    rows={1}
                    size="small"
                    sx={{ mt: 1.5, fontSize: '0.5rem' }}
                  />
                ) : (
                  reservation?.comment && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        De la part de :
                      </Typography>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          borderLeft: 3,
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography variant="body1">{reservation.comment}</Typography>
                      </Box>
                    </>
                  )
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {isEditingReservation ? (
                    <Stack spacing={1}>
                      <Button
                        onClick={handleSaveEditedReservation}
                        variant="contained"
                        color="secondary"
                        size="small"
                      >
                        Enregistrer
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Ne rien changer
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={1}>
                      <Button
                        onClick={handleEditReservation}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Rectifier
                      </Button>
                      <Button
                        onClick={handleCancelReservation}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Annuler la réservation
                      </Button>
                    </Stack>
                  )}
                </Box>
              </>
            )}

            {!isReserved && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'center', display: 'block', lineHeight: 1 }}>
                  🎁<br />
                  Vous êtes sur le point de réserver ce cadeau
                </Typography>

                <TextField
                  fullWidth
                  placeholder="De la part de ?"
                  helperText={(
                    <Box sx={{ lineHeight: 1.2 }}>
                      Facultatif mais utile en cas de doublon, d'erreur, d'oubli, etc.
                    </Box>
                  )}
                  value={reservationComment}
                  onChange={e => setReservationComment(e.target.value)}
                  multiline
                  rows={1}
                  size="small"
                  sx={{ mt: 1.5, fontSize: '0.5rem' }}

                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={showPreviewTab}
                    variant="outlined"
                    color="primary"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReservationConfirm}
                    variant="contained"
                    color="secondary"
                  >
                    Confirmer
                  </Button>
                </Box>
              </>
            )}
          </Collapse>
        </CardContent>
      </Card>

      {/* Dialog de confirmation d'annulation */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir annuler la réservation de<br />
            <strong>{title}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="secondary" variant="outlined">
            Non, garder
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" variant="contained" autoFocus>
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

WishlistItemCard.displayName = 'WishlistItemCard';

export default React.memo(WishlistItemCard);
