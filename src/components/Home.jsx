import React from 'react';
import { Container, Divider } from '@mui/material';

import WishlistItem from './WishlistItem';
// import { items } from '../data.json';
import CategoryChip from './CategoryChip';
import useData from '../useData';

// const allCategories = Array.from(items.reduce((acc, { categories = [] }) => {
//   categories.length && acc.add(...categories);
//   return acc;
// }, new Set()));

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

const Home = () => {
  const [disabledCategories, setDisabledCategories] = React.useState([]);
  const [items, allCategories] = useData();

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

export default Home;
