import React from 'react';
import { Box, Chip, Tooltip, useTheme } from '@mui/material';
import { categoryProps } from '../constants/categories';
import { categoryColor } from '../utils/categories';

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
    // Une couleur passée par l'appelant (`default` pour « Tout ») l'emporte.
    return { color: categoryColor(label), ...props, label, sx };
  }

  const { sx: customSx, ...customProps } = categoryProps[label];

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
 * Les props restantes sont transmises au Chip ou au Box sous-jacent.
 *
 * @param {Object} props - Props du composant
 * @param {string} props.label - Label de la catégorie à afficher
 * @param {'dot'|'chip'} [props.variant='chip'] - Variante d'affichage
 * @returns {JSX.Element} Catégorie stylisée
 */
const CategoryChip = ({ label, variant = 'chip', ...props }) => {
  const theme = useTheme();

  if (variant === 'dot') {
    const { sx: dotSx, ...dotProps } = props;
    const color = categoryColor(label);
    // Lire la palette du thème plutôt que des hex figés : le thème du projet
    // redéfinit primary et secondary, des valeurs en dur les désaccorderaient.
    const bgColor = theme.palette[color].main;

    return (
      <Tooltip title={label} arrow>
        <Box
          {...dotProps}
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: bgColor,
            display: 'inline-block',
            cursor: 'default',
            flexShrink: 0,
            verticalAlign: 'middle',
            ...dotSx,
          }}
        />
      </Tooltip>
    );
  }

  return <Chip {...getCategoryProps({ label, ...props })} />;
};

CategoryChip.displayName = 'CategoryChip';

export default React.memo(CategoryChip);
