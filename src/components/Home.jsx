import React from 'react';
import { Alert, Box, CircularProgress, Container, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { ViewList as ViewListIcon, ViewModule as ViewModuleIcon, CardGiftcard as CardGiftcardIcon } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';

import WishlistItem from './WishlistItem';
import WishlistItemCard from './WishlistItemCard';
import CategoryChip from './CategoryChip';
import useWishlist from '../hooks/useWishlist';
import useListInfo from '../hooks/useListInfo';
import useReservations from '../hooks/useReservations';
import { BASEROW_CONFIG } from '../config/baserow';
import { toggle } from '../utils/array';

/**
 * Page d'accueil affichant la wishlist complète avec filtrage par catégories.
 *
 * @returns {JSX.Element} Page Home avec liste filtrée
 */
const Home = () => {
  const { listId } = useParams();
  const activeListId = listId || BASEROW_CONFIG.defaultListId;
  const [disabledCategories, setDisabledCategories] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('grid'); // 'list' ou 'grid'
  const [giftMode, setGiftMode] = React.useState(false); // Mode offrir
  const [flippedCard, setFlippedCard] = React.useState(null);
  const { data, isLoading, error } = useWishlist();
  const { data: listInfo, isLoading: isLoadingList } = useListInfo();
  const {
    reservations,
    isLoading: isLoadingReservations,
    addReservation,
  } = useReservations(giftMode);

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

  const toggleViewMode = React.useCallback(() => {
    setViewMode(prevMode => (prevMode === 'list' ? 'grid' : 'list'));
  }, []);

  const toggleGiftMode = React.useCallback(() => {
    setGiftMode(prev => !prev);
  }, []);

  // Désactiver automatiquement le mode offrir après 5 minutes d'inactivité
  React.useEffect(() => {
    if (!giftMode) return;

    const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setGiftMode(false);
      }, INACTIVITY_TIMEOUT);
    };

    // Événements d'activité à surveiller
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Démarrer le timer initial
    resetTimer();

    // Nettoyage
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [giftMode]);

  const sortedItems = React.useMemo(
    () => items.toSorted(({ weight: a = 999 }, { weight: b = 999 }) => a - b),
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

  if (isLoading || isLoadingList) {
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
      {listInfo && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {listInfo.title && (
            <Typography variant="h4" component="h1" gutterBottom>
              <Link
                to={`/list/${activeListId}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                {listInfo.title}
              </Link>
            </Typography>
          )}
          {listInfo.for && (
            <Typography variant="subtitle1" color="text.secondary">
              Pour {listInfo.for}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
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
        </Box>

        <Tooltip title={giftMode ? 'Masquer les réservations' : 'Mode offrir'}>
          <IconButton
            onClick={toggleGiftMode}
            aria-label="Activer le mode offrir"
            color={giftMode ? 'primary' : 'default'}
          >
            <CardGiftcardIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={viewMode === 'list' ? 'Affichage en grille' : 'Affichage en liste'}>
          <IconButton onClick={toggleViewMode} aria-label="Changer le mode d'affichage">
            {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 2 }} />

      {viewMode === 'list' ? (
        filteredItem.map(item => (
          <WishlistItem key={item.title} {...item} />
        ))
      ) : (
        <Grid container spacing={2}>
          {filteredItem.map(item => (
            <Grid key={item.title} xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <WishlistItemCard
                {...item}
                isFlipped={flippedCard === item.title}
                onFlip={setFlippedCard}
                giftMode={giftMode}
                isLoadingReservations={isLoadingReservations}
                isReserved={giftMode && reservations[item.uuid]}
                reservation={giftMode ? reservations[item.uuid] : null}
                onReserve={addReservation}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

Home.displayName = 'Home';

export default Home;
