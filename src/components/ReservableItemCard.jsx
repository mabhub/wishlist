import React from 'react';

import WishlistItemCard from './WishlistItemCard';
import ReservationPanel from './ReservationPanel';

/**
 * Carte d'un item de wishlist reliée aux réservations Baserow : en mode offrir, elle
 * fournit à `WishlistItemCard` le panneau de réservation. Propre à wishlist (non
 * exportée dans `wishlist/ui`).
 *
 * Mémoïsée : la fonction `renderReservation` n'est recréée que si l'item, sa
 * réservation ou les callbacks changent, ce qui préserve le `React.memo` de la carte
 * lors des rafraîchissements périodiques des réservations.
 *
 * @param {Object} props - Props du composant
 * @param {Object} props.item - Item au format de `useWishlist` (dont `uuid` et `title`)
 * @param {boolean} [props.giftMode=false] - Mode offrir activé
 * @param {boolean} [props.isLoadingReservations=false] - Chargement des réservations en cours
 * @param {{ id: (number|string), comment: string }} [props.reservation] - Réservation de
 *   l'item, ignorée hors mode offrir
 * @param {Function} [props.onReserve] - Reçoit `{ wishId, comment }`
 * @param {Function} [props.onUpdateReservation] - Reçoit `{ reservationId, wishId, comment }`
 * @param {Function} [props.onCancelReservation] - Reçoit l'ID de la réservation
 * @returns {JSX.Element} Carte de l'item
 */
const ReservableItemCard = ({
  item,
  giftMode = false,
  isLoadingReservations = false,
  reservation,
  onReserve,
  onUpdateReservation,
  onCancelReservation,
}) => {
  const activeReservation = giftMode ? (reservation ?? null) : null;

  const renderReservation = React.useCallback(
    ({ showPreview }) => (
      <ReservationPanel
        uuid={item.uuid}
        title={item.title}
        reservation={activeReservation}
        onReserve={onReserve}
        onUpdateReservation={onUpdateReservation}
        onCancelReservation={onCancelReservation}
        onDone={showPreview}
      />
    ),
    [item.uuid, item.title, activeReservation, onReserve, onUpdateReservation, onCancelReservation],
  );

  return (
    <WishlistItemCard
      {...item}
      isReserved={Boolean(activeReservation)}
      isLoadingReservations={isLoadingReservations}
      renderReservation={giftMode ? renderReservation : undefined}
    />
  );
};

ReservableItemCard.displayName = 'ReservableItemCard';

export default React.memo(ReservableItemCard);
