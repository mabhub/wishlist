import {
  Album as AlbumIcon,
  DirectionsBike as DirectionsBikeIcon,
  Home as HomeIcon,
  Devices as DevicesIcon,
  Build as BuildIcon,
  MenuBook as MenuBookIcon,
  Sensors as SensorsIcon,
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
  BD: {
    icon: <MenuBookIcon />,
    color: 'error',
    sx: { pl: 0.5 },
  },
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
  'High-tech': {
    icon: <DevicesIcon />,
    color: 'secondary',
    sx: { pl: 0.5 },
  },
  Bricolage: {
    icon: <BuildIcon />,
    color: 'success',
    sx: { pl: 0.5 },
  },
  Domotique: {
    icon: <SensorsIcon />,
    color: 'warning',
    sx: { pl: 0.5 },
  },
};
