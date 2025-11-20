import React from 'react';
import { Chip } from '@mui/material';
import { categoryProps } from '../constants/categories';

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
