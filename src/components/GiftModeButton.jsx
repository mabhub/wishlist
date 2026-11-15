import React from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';

/**
 * Bouton 🎁 qui active ou désactive le mode offrir. Propre à wishlist (non exporté
 * dans `wishlist/ui`).
 *
 * @param {Object} props - Props du composant
 * @param {boolean} props.active - Mode offrir activé
 * @param {Function} props.onClick - Bascule le mode offrir
 * @returns {JSX.Element} Bouton du mode offrir
 */
const GiftModeButton = ({ active, onClick }) => (
  <Box sx={{ position: 'relative' }}>
    <Tooltip title={active ? 'Masquer les réservations' : 'Mode offrir'}>
      <IconButton
        onClick={onClick}
        aria-label="Activer le mode offrir"
        color={active ? 'primary' : 'default'}
        sx={{ fontSize: '5rem' }}
      >
        🎁
        <Chip
          label="Offrir"
          size="small"
          color={active ? 'primary' : 'default'}
          sx={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: active ? 'primary.main' : 'rgba(0, 0, 0, 0.5)',
            color: active ? 'primary.contrastText' : '#fff',
            position: 'absolute',
          }}
        />
      </IconButton>
    </Tooltip>
  </Box>
);

GiftModeButton.displayName = 'GiftModeButton';

export default GiftModeButton;
