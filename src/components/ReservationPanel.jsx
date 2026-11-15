import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

/** Aide affichée sous le champ « De la part de ? ». */
const COMMENT_HELPER = (
  <Box sx={{ lineHeight: 1.2 }}>
    Facultatif mais utile en cas de doublon, d'erreur, d'oubli, etc.
  </Box>
);

/**
 * Contenu de l'onglet de réservation d'une carte : formulaire pour réserver un cadeau
 * libre, ou commentaire, rectification et annulation d'un cadeau déjà réservé.
 * Propre à wishlist (non exporté dans `wishlist/ui`).
 *
 * @param {Object} props - Props du composant
 * @param {string} props.uuid - UUID de l'item
 * @param {string} props.title - Titre de l'item, repris dans la confirmation d'annulation
 * @param {{ id: (number|string), comment: string }|null} [props.reservation] - Réservation
 *   de l'item, `null` si le cadeau est libre
 * @param {Function} [props.onReserve] - Reçoit `{ wishId, comment }`
 * @param {Function} [props.onUpdateReservation] - Reçoit `{ reservationId, wishId, comment }`
 * @param {Function} [props.onCancelReservation] - Reçoit l'ID de la réservation
 * @param {Function} props.onDone - Ramène la carte à l'aperçu
 * @returns {JSX.Element} Panneau de réservation
 */
const ReservationPanel = ({
  uuid,
  title,
  reservation = null,
  onReserve,
  onUpdateReservation,
  onCancelReservation,
  onDone,
}) => {
  const [reservationComment, setReservationComment] = React.useState('');
  const [isEditingReservation, setIsEditingReservation] = React.useState(false);
  const [editedComment, setEditedComment] = React.useState('');
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const handleReservationConfirm = React.useCallback(() => {
    if (onReserve) {
      onReserve({ wishId: uuid, comment: reservationComment });
      setReservationComment('');
      onDone();
    }
  }, [onReserve, uuid, reservationComment, onDone]);

  const handleCancelReservation = React.useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const handleConfirmCancel = React.useCallback(() => {
    if (onCancelReservation && reservation?.id) {
      onCancelReservation(reservation.id);
      onDone();
    }
    setShowCancelDialog(false);
    setIsEditingReservation(false);
  }, [onCancelReservation, reservation, onDone]);

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
    <>
      {reservation && (
        <>
          <Typography variant="h6" color="secondary" sx={{ textAlign: 'center', mt: 2 }}>
            🎁 Déjà réservé
          </Typography>

          {isEditingReservation ? (
            <TextField
              fullWidth
              placeholder="De la part de ?"
              helperText={COMMENT_HELPER}
              value={editedComment}
              onChange={e => setEditedComment(e.target.value)}
              multiline
              rows={1}
              size="small"
              sx={{ mt: 1.5, fontSize: '0.5rem' }}
            />
          ) : (
            reservation.comment && (
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

      {!reservation && (
        <>
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, textAlign: 'center', display: 'block', lineHeight: 1 }}
          >
            🎁<br />
            Vous êtes sur le point de réserver ce cadeau
          </Typography>

          <TextField
            fullWidth
            placeholder="De la part de ?"
            helperText={COMMENT_HELPER}
            value={reservationComment}
            onChange={e => setReservationComment(e.target.value)}
            multiline
            rows={1}
            size="small"
            sx={{ mt: 1.5, fontSize: '0.5rem' }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={onDone} variant="outlined" color="primary">
              Annuler
            </Button>
            <Button onClick={handleReservationConfirm} variant="contained" color="secondary">
              Confirmer
            </Button>
          </Box>
        </>
      )}

      {/* Dialog de confirmation d'annulation, monté dans les deux états pour garder
          son fondu de fermeture quand la réservation disparaît. */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir annuler la réservation de
            <br />
            <strong>{title}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="secondary" variant="outlined">
            Non, garder
          </Button>
          {/* Focus voulu : la modale vient d'être ouverte par l'utilisateur. */}
          {/* oxlint-disable-next-line jsx-a11y/no-autofocus */}
          <Button onClick={handleConfirmCancel} color="primary" variant="contained" autoFocus>
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ReservationPanel.displayName = 'ReservationPanel';

export default ReservationPanel;
