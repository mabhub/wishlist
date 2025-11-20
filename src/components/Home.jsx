import React from 'react';
import { Alert, CircularProgress, Container, Divider } from '@mui/material';

import WishlistItem from './WishlistItem';
import CategoryChip from './CategoryChip';
import useWishlist from '../hooks/useWishlist';

/**
 * Bascule la présence d'une valeur dans un tableau.
 *
 * @param {Array} [array=[]] - Tableau source
 * @param {string} [str] - Valeur à basculer
 * @returns {Array} Nouveau tableau avec la valeur ajoutée ou retirée
 */
const toggle = (array = [], str = undefined) => {
  const arr = array.slice();
  if (typeof str !== 'string') {
    return arr;
  }

  const index = arr.indexOf(str);

  if (index === -1) {
    arr.push(str);
  } else {
    arr.splice(index, 1);
  }

  return arr;
};

/**
 * Page d'accueil affichant la wishlist complète avec filtrage par catégories.
 *
 * @returns {JSX.Element} Page Home avec liste filtrée
 */
const Home = () => {
  const [disabledCategories, setDisabledCategories] = React.useState([]);
  const { data, isLoading, error } = useWishlist();

  const items = data?.items || [];
  const allCategories = data?.categories || [];

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
    () => items.sort(({ weight: a }, { weight: b }) => a - b),
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
      <CategoryChip label="Tout" onClick={handleChipClick()} />

      {allCategories.map(category => (
        <CategoryChip
          key={category}
          label={category}
          onClick={handleChipClick(category)}
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
