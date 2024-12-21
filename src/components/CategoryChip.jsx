import React from 'react';
import { Chip } from '@mui/material';
import {
  Album as AlbumIcon,
  DirectionsBike as DirectionsBikeIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

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

const CategoryChip = React.forwardRef((props, ref) => {
  const customProps = React.useMemo(() => getCategoryProps(props), [props]);

  return (
    <Chip ref={ref} {...customProps} />
  );
});

export default React.memo(CategoryChip);
