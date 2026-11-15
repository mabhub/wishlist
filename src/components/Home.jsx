import React from 'react';
import {
  Alert,
  CircularProgress,
  Container,
  FormControlLabel,
  Snackbar,
  Switch,
} from '@mui/material';
import { Link } from 'react-router';

import WishlistView from './WishlistView';
import ReservableItemCard from './ReservableItemCard';
import GiftModeButton from './GiftModeButton';
import useWishlist from '../hooks/useWishlist';
import useListInfo from '../hooks/useListInfo';
import useReservations from '../hooks/useReservations';
import useActiveListId from '../hooks/useActiveListId';
import useCategoryFilter from '../hooks/useCategoryFilter';
import { ALREADY_RESERVED } from '../utils/reservations';

const noop = () => {};

/** Clé React d'un item : son UUID Baserow. */
const getItemKey = ({ uuid }) => uuid;

/**
 * Message affiché quand l'écriture d'une réservation échoue, par action.
 * L'action optimiste a déjà été annulée à l'écran : le message dit ce qui
 * n'a pas été pris en compte.
 */
const RESERVATION_ERROR_MESSAGES = {
  add: "La réservation n'a pas pu être enregistrée. Réessayez dans un instant.",
  update: "La modification n'a pas pu être enregistrée. Réessayez dans un instant.",
  cancel: "L'annulation n'a pas pu être enregistrée. Réessayez dans un instant.",
};

/**
 * Message affiché quand quelqu'un a réservé le même cadeau juste avant.
 * Ce n'est pas une panne : la liste se met à jour et montre le cadeau réservé.
 */
const ALREADY_RESERVED_MESSAGE = "Ce cadeau vient d'être réservé par quelqu'un d'autre.";

/**
 * Page d'accueil : conteneur qui relie Baserow (items, liste, réservations) et le mode
 * offrir à la vue présentationnelle `WishlistView`.
 *
 * @returns {JSX.Element} Page Home avec liste filtrée
 */
const Home = () => {
  const activeListId = useActiveListId();
  const [giftMode, setGiftMode] = React.useState(false); // Mode offrir
  const [hideReserved, setHideReserved] = React.useState(false); // Masquer les produits réservés
  const { data, isPending: isLoading, error } = useWishlist();
  const { data: listInfo, isPending: isLoadingList } = useListInfo();

  const items = React.useMemo(() => data?.items || [], [data?.items]);
  const allCategories = React.useMemo(() => data?.categories || [], [data?.categories]);
  const { disabledCategories, onCategoryClick, isVisible } = useCategoryFilter(allCategories);

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
  // Chaque échec est un nouvel objet : l'alerte reste ouverte tant que l'erreur
  // courante n'est pas celle qu'on vient de fermer.
  const [dismissedError, setDismissedError] = React.useState(null);
  const isErrorOpen = mutationError !== null && mutationError !== dismissedError;

  const isAlreadyReserved = mutationError?.error?.code === ALREADY_RESERVED;
  const errorMessage = isAlreadyReserved
    ? ALREADY_RESERVED_MESSAGE
    : RESERVATION_ERROR_MESSAGES[mutationError?.action];

  const handleCloseError = React.useCallback(
    (event, reason) => {
      // Un clic ailleurs dans la page ne doit pas faire disparaître l'alerte
      // avant qu'elle ait pu être lue.
      if (reason === 'clickaway') return;
      setDismissedError(mutationError);
    },
    [mutationError],
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

  const filteredItems = React.useMemo(
    () =>
      sortedItems.filter(
        item =>
          // Filtrer par catégorie, puis les produits réservés si le mode est actif
          isVisible(item) && !(giftMode && hideReserved && reservations[item.uuid]),
      ),
    [sortedItems, isVisible, giftMode, hideReserved, reservations],
  );

  const renderItem = React.useCallback(
    item => (
      <ReservableItemCard
        item={item}
        giftMode={giftMode}
        isLoadingReservations={isLoadingReservations}
        reservation={reservations[item.uuid]}
        onReserve={addReservation}
        onUpdateReservation={updateReservation}
        onCancelReservation={cancelReservation}
      />
    ),
    [
      giftMode,
      isLoadingReservations,
      reservations,
      addReservation,
      updateReservation,
      cancelReservation,
    ],
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
        <Alert severity="error">Erreur lors du chargement de la wishlist : {error.message}</Alert>
      </Container>
    );
  }

  return (
    <>
      <WishlistView
        title={
          listInfo?.title && (
            <Link
              to={`/list/${activeListId}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {listInfo.title}
            </Link>
          )
        }
        subtitle={listInfo?.for && `Pour ${listInfo.for}`}
        categories={allCategories}
        disabledCategories={disabledCategories}
        onCategoryClick={onCategoryClick}
        actions={<GiftModeButton active={giftMode} onClick={toggleGiftMode} />}
        beforeGrid={
          giftMode && (
            <FormControlLabel
              control={
                <Switch checked={hideReserved} onChange={toggleHideReserved} color="primary" />
              }
              label="Masquer les produits déjà réservés"
            />
          )
        }
        items={filteredItems}
        getItemKey={getItemKey}
        renderItem={renderItem}
      />

      <Snackbar
        open={isErrorOpen}
        autoHideDuration={8000}
        onClose={handleCloseError}
        slotProps={{ transition: { onExited: clearMutationError } }}
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
    </>
  );
};

Home.displayName = 'Home';

export default Home;
