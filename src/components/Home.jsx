import React from 'react';
import { Alert, CircularProgress, Container, Divider } from '@mui/material';

import WishlistItem from './WishlistItem';
import CategoryChip from './CategoryChip';
import useWishlist from '../hooks/useWishlist';
import { toggle } from '../utils/array';

/**
 * Page d'accueil affichant la wishlist complète avec filtrage par catégories.
 *
 * @returns {JSX.Element} Page Home avec liste filtrée
 */
const Home = () => {
  const [disabledCategories, setDisabledCategories] = React.useState([]);
  const { data, isLoading, error } = useWishlist();

  const items = React.useMemo(() => data?.items || [], [data?.items]);
  const allCategories = React.useMemo(() => data?.categories || [], [data?.categories]);

  const handleChipClick = React.useCallback(
    (category = 'all') => () => {
      setDisabledCategories(
        prevDisabledCategories => {
          if (category === 'all') {
            return prevDisabledCategories.length ? [] : [...allCategories];
          }
          return toggle(prevDisabledCategories, category);
        },
      );
    },
    [allCategories],
  );

  const sortedItems = React.useMemo(
    () => items.toSorted(({ weight: a }, { weight: b }) => a - b),
    [items],
  );

  const filteredItem = React.useMemo(
    () => sortedItems.filter(
      ({ categories = [] }) => {
        if (!categories.length) {
          return true;
        }

        return !categories.every(category => disabledCategories.includes(category));
      },
    ),
    [disabledCategories, sortedItems],
  );

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Erreur lors du chargement de la wishlist : {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <CategoryChip
        label="Tout"
        onClick={handleChipClick()}
        aria-pressed={disabledCategories.length === 0}
      />

      {allCategories.map(category => (
        <CategoryChip
          key={category}
          label={category}
          onClick={handleChipClick(category)}
          aria-pressed={!disabledCategories.includes(category)}
          sx={{
            opacity: disabledCategories.includes(category) ? 0.2 : 1,
            ml: 1,
          }}
        />
      ))}

      <Divider sx={{ my: 2 }} />

      {filteredItem.map(item => (
        <WishlistItem key={item.title} {...item} />
      ))}
    </Container>
  );
};

Home.displayName = 'Home';

export default Home;
