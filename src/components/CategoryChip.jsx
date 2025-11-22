import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { categoryProps } from '../constants/categories';

/**
 * Map des couleurs MUI vers leurs valeurs hexadécimales.
 * Utilisé pour générer les disques colorés des catégories.
 */
const colorMap = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
};

/**
 * Fusionne les props customisées d'une catégorie avec les props passées.
 *
 * @param {Object} params - Paramètres
 * @param {string} params.label - Label de la catégorie
 * @param {Object} [params.sx={}] - Styles Material-UI
 * @param {Object} params.props - Autres props
 * @returns {Object} Props fusionnées pour le Chip
 */
const getCategoryProps = ({ label, sx = {}, ...props }) => {
  if (!categoryProps[label]) {
    return { ...props, label, sx };
  }

  const {
    sx: customSx,
    ...customProps
  } = categoryProps[label];

  return {
    ...props,
    label,
    sx: { ...customSx, ...sx },
    ...customProps,
  };
};

/**
 * Composant catégorie avec deux variantes :
 * - 'dot' : Disque coloré compact avec tooltip (pour les cards)
 * - 'chip' : Chip standard MUI avec icône (pour les filtres)
 *
 * @param {Object} props - Props du composant
 * @param {string} props.label - Label de la catégorie à afficher
 * @param {'dot'|'chip'} [props.variant='chip'] - Variante d'affichage
 * @param {string} [props.size='small'] - Taille (pour variant='chip')
 * @returns {JSX.Element} Catégorie stylisée
 */
const CategoryChip = ({ label, variant = 'chip', size: _size, ...props }) => {
  const categoryConfig = categoryProps[label];

  // Variant 'chip' (default)
  const customProps = React.useMemo(() => getCategoryProps({ label, ...props }), [label, props]);

  if (variant === 'dot') {
    const color = categoryConfig?.color || 'default';
    const bgColor = colorMap[color] || '#757575';

    return (
      <Tooltip title={label} arrow>
        <Box
          {...props}
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: bgColor,
            display: 'inline-block',
            cursor: 'default',
            flexShrink: 0,
            verticalAlign: 'middle',
            ...props.sx,
          }}
        />
      </Tooltip>
    );
  }

  return <Chip {...customProps} />;
};

CategoryChip.displayName = 'CategoryChip';

export default React.memo(CategoryChip);
