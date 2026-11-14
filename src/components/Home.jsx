import React from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';

import WishlistItemCard from './WishlistItemCard';
import CategoryChip from './CategoryChip';
import useWishlist from '../hooks/useWishlist';
import useListInfo from '../hooks/useListInfo';
import useReservations from '../hooks/useReservations';
import useActiveListId from '../hooks/useActiveListId';
import { toggle } from '../utils/array';
import { ALREADY_RESERVED } from '../utils/reservations';

const noop = () => {};

/**
 * Message affiché quand l'écriture d'une réservation échoue, par action.
 * L'action optimiste a déjà été annulée à l'écran : le message dit ce qui
 * n'a pas été pris en compte.
 */
const RESERVATION_ERROR_MESSAGES = {
  add: 'La réservation n\'a pas pu être enregistrée. Réessayez dans un instant.',
  update: 'La modification n\'a pas pu être enregistrée. Réessayez dans un instant.',
  cancel: 'L\'annulation n\'a pas pu être enregistrée. Réessayez dans un instant.',
};

/**
 * Message affiché quand quelqu'un a réservé le même cadeau juste avant.
 * Ce n'est pas une panne : la liste se met à jour et montre le cadeau réservé.
 */
const ALREADY_RESERVED_MESSAGE = 'Ce cadeau vient d\'être réservé par quelqu\'un d\'autre.';

/**
 * Page d'accueil affichant la wishlist complète avec filtrage par catégories.
 *
 * @returns {JSX.Element} Page Home avec liste filtrée
 */
const Home = () => {
  const activeListId = useActiveListId();
  const [disabledCategories, setDisabledCategories] = React.useState([]);
  const [giftMode, setGiftMode] = React.useState(false); // Mode offrir
  const [hideReserved, setHideReserved] = React.useState(false); // Masquer les produits réservés
  const { data, isLoading, error } = useWishlist();
  const { data: listInfo, isLoading: isLoadingList } = useListInfo();

  const items = React.useMemo(() => data?.items || [], [data?.items]);
  const allCategories = React.useMemo(() => data?.categories || [], [data?.categories]);

  // Les réservations sont rattachées aux items, pas à la liste : il faut fournir
  // les UUID de la liste courante pour écarter celles des autres listes.
  const listItemUuids = React.useMemo(() => items.map(({ uuid }) => uuid), [items]);

  const {
    reservations,
    isLoading: isLoadingReservations,
    addReservation,
    updateReservation,
    cancelReservation,
    mutationError,
    clearMutationError,
  } = useReservations(giftMode, listItemUuids);

  // L'ouverture est découplée de l'erreur : celle-ci n'est effacée qu'après
  // la transition de sortie, sinon l'alerte se viderait pendant le fondu.
  const [isErrorOpen, setIsErrorOpen] = React.useState(false);

  React.useEffect(() => {
    if (mutationError) setIsErrorOpen(true);
  }, [mutationError]);

  const isAlreadyReserved = mutationError?.error?.code === ALREADY_RESERVED;
  const errorMessage = isAlreadyReserved
    ? ALREADY_RESERVED_MESSAGE
    : RESERVATION_ERROR_MESSAGES[mutationError?.action];

  const handleCloseError = React.useCallback((event, reason) => {
    // Un clic ailleurs dans la page ne doit pas faire disparaître l'alerte
    // avant qu'elle ait pu être lue.
    if (reason === 'clickaway') return;
    setIsErrorOpen(false);
  }, []);

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

  const toggleGiftMode = React.useCallback(() => {
    setGiftMode(prev => !prev);
  }, []);

  const toggleHideReserved = React.useCallback(() => {
    setHideReserved(prev => !prev);
  }, []);

  // Désactiver automatiquement le mode offrir après un délai d'inactivité
  React.useEffect(() => {
    if (!giftMode) return noop;

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

  // Un item sans catégorie ne peut pas être ciblé par un chip : il suit l'état
  // global du filtre, donc il n'est masqué que si toutes les catégories le sont.
  const allFiltersDisabled = React.useMemo(
    () => allCategories.length > 0 && disabledCategories.length === allCategories.length,
    [allCategories, disabledCategories],
  );

  const filteredItem = React.useMemo(
    () => sortedItems.filter(
      ({ categories = [], uuid }) => {
        // Filtrer par catégorie
        const isHiddenByCategory = categories.length
          ? categories.every(category => disabledCategories.includes(category))
          : allFiltersDisabled;
        if (isHiddenByCategory) {
          return false;
        }

        // Filtrer les produits réservés si le mode est actif
        if (giftMode && hideReserved && reservations[uuid]) {
          return false;
        }

        return true;
      },
    ),
    [disabledCategories, sortedItems, giftMode, hideReserved, reservations, allFiltersDisabled],
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

        <Box sx={{ position: 'relative' }}>
          <Tooltip title={giftMode ? 'Masquer les réservations' : 'Mode offrir'}>
            <IconButton
              onClick={toggleGiftMode}
              aria-label="Activer le mode offrir"
              color={giftMode ? 'primary' : 'default'}
              sx={{ fontSize: '5rem' }}
            >
              🎁
              <Chip
                label="Offrir"
                size="small"
                color={giftMode ? 'primary' : 'default'}
                sx={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: giftMode ? 'primary.main' : 'rgba(0, 0, 0, 0.5)',
                  color: giftMode ? 'primary.contrastText' : '#fff',
                  position: 'absolute',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {giftMode && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={(
              <Switch
                checked={hideReserved}
                onChange={toggleHideReserved}
                color="primary"
              />
            )}
            label="Masquer les produits déjà réservés"
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {filteredItem.map(item => (
          <Grid key={item.uuid} xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <WishlistItemCard
              {...item}
              giftMode={giftMode}
              isLoadingReservations={isLoadingReservations}
              isReserved={giftMode && reservations[item.uuid]}
              reservation={giftMode ? reservations[item.uuid] : null}
              onReserve={addReservation}
              onUpdateReservation={updateReservation}
              onCancelReservation={cancelReservation}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={isErrorOpen}
        autoHideDuration={8000}
        onClose={handleCloseError}
        TransitionProps={{ onExited: clearMutationError }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity={isAlreadyReserved ? 'warning' : 'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

Home.displayName = 'Home';

export default Home;
