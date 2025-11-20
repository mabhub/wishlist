import {
  Album as AlbumIcon,
  DirectionsBike as DirectionsBikeIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

/**
 * Configuration des propriétés visuelles par catégorie.
 * Associe chaque catégorie à une icône, couleur et styles spécifiques.
 *
 * @type {Object.<string, {icon: JSX.Element, color: string, sx?: Object}>}
 *
 * @example
 * categoryProps['Vinyle'] // { icon: <AlbumIcon />, color: 'primary' }
 */
export const categoryProps = {
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
