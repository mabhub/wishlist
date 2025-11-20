import React from 'react';
import { Chip } from '@mui/material';
import {
  Album as AlbumIcon,
  DirectionsBike as DirectionsBikeIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

/**
 * Configuration des propriétés visuelles par catégorie.
 * @type {Object.<string, {icon: JSX.Element, color: string, sx?: Object}>}
 */
const categoryProps = {
  Vinyle: {
    icon: <AlbumIcon />,
    color: 'primary',
  },
  Vélo: {
    icon: <DirectionsBikeIcon />,
    color: 'warning',
    sx: { pl: 0.5 },
  },
  Maison: {
    icon: <HomeIcon />,
    color: 'info',
    sx: { pl: 0.5 },
  },
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
 * Chip Material-UI personnalisé avec icônes et couleurs par catégorie.
 * Supporte toutes les props standard de MUI Chip.
 *
 * @param {Object} props - Props du Chip
 * @param {string} props.label - Label à afficher
 * @param {Object} [props.sx] - Styles Material-UI personnalisés
 * @param {React.Ref} ref - Ref forwarded
 * @returns {JSX.Element} Chip stylisé
 */
const CategoryChip = React.forwardRef((props, ref) => {
  const customProps = React.useMemo(() => getCategoryProps(props), [props]);

  return (
    <Chip ref={ref} {...customProps} />
  );
});

CategoryChip.displayName = 'CategoryChip';

export default React.memo(CategoryChip);
