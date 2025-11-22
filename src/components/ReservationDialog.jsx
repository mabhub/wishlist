import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

/**
 * Dialogue de réservation d'un élément de wishlist.
 *
 * @param {Object} props - Props du composant
 * @param {boolean} props.open - Si true, le dialogue est ouvert
 * @param {Function} props.onClose - Callback appelée à la fermeture
 * @param {Function} props.onConfirm - Callback appelée à la confirmation (reçoit le commentaire)
 * @param {string} props.itemTitle - Titre de l'élément à réserver
 * @returns {JSX.Element} Dialogue de réservation
 */
const ReservationDialog = ({ open, onClose, onConfirm, itemTitle }) => {
  const [comment, setComment] = React.useState('');

  const handleConfirm = React.useCallback(() => {
    onConfirm(comment);
    setComment('');
    onClose();
  }, [comment, onConfirm, onClose]);

  const handleClose = React.useCallback(() => {
    setComment('');
    onClose();
  }, [onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>Réserver cet élément</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Vous êtes sur le point de réserver <strong>{itemTitle}</strong>.
          Vous pouvez ajouter un commentaire ou indiquer de la part de qui c'est.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="Commentaire ou 'de la part de...'"
          placeholder="Ex: De la part de Jean et Marie"
          value={comment}
          onChange={e => setComment(e.target.value)}
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ReservationDialog.displayName = 'ReservationDialog';

export default ReservationDialog;
