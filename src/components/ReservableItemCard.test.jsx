import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import ReservableItemCard from './ReservableItemCard';

const ITEM = {
  uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Théière en fonte',
  link: 'https://example.org/theiere',
};
const DESCRIPTION = 'Une **belle** théière';
const RESERVATION = { id: 42, comment: 'Tata Jeanne' };

// Les zones d'une carte restent montées et sont repliées par des `<Collapse>` :
// les requêtes par rôle ne voient que la zone de l'onglet actif.
const tabNames = () => screen.getAllByRole('tab').map(tab => tab.textContent);
const selectedTab = () => screen.getByRole('tab', { selected: true }).textContent;
const openTab = name => fireEvent.click(screen.getByRole('tab', { name }));
const clickButton = name => fireEvent.click(screen.getByRole('button', { name }));
const commentField = () => screen.getByPlaceholderText('De la part de ?');

/** Carte reliée aux réservations ; `description` est rangée dans l'item. */
const Card = ({ description, ...props }) => (
  <ReservableItemCard item={{ ...ITEM, description }} {...props} />
);

describe('ReservableItemCard', () => {
  describe('onglets', () => {
    it.each([
      ['sans description', undefined, ['Aperçu', 'Offrir']],
      ['avec description', DESCRIPTION, ['Aperçu', 'Détails', 'Offrir']],
    ])(
      "ajoute l'onglet de réservation en dernier en mode offrir (%s)",
      (_, description, expected) => {
        render(<Card description={description} giftMode />);

        expect(tabNames()).toEqual(expected);
      },
    );

    it("nomme l'onglet « Réservé » quand le cadeau est pris", () => {
      render(<Card giftMode reservation={RESERVATION} />);

      expect(tabNames()).toEqual(['Aperçu', 'Réservé']);
    });

    it("montre un indicateur à la place de l'onglet de réservation pendant le chargement", () => {
      render(<Card giftMode isLoadingReservations />);

      const tabs = screen.getAllByRole('tab');

      expect(tabs).toHaveLength(2);
      expect(within(tabs[1]).getByRole('progressbar')).toBeTruthy();
      expect(screen.queryByRole('tab', { name: 'Offrir' })).toBeNull();
    });

    it("revient à l'aperçu quand le mode offrir se désactive", () => {
      const { rerender } = render(<Card description={DESCRIPTION} giftMode />);

      openTab('Offrir');
      rerender(<Card description={DESCRIPTION} giftMode={false} />);

      expect(tabNames()).toEqual(['Aperçu', 'Détails']);
      expect(selectedTab()).toBe('Aperçu');
    });

    it('ignore une réservation connue hors mode offrir', () => {
      const borderColor = container =>
        getComputedStyle(container.querySelector('.MuiCard-root')).borderColor;
      const free = render(<Card description={DESCRIPTION} />);
      const freeColor = borderColor(free.container);
      free.unmount();

      const { container } = render(<Card description={DESCRIPTION} reservation={RESERVATION} />);

      expect(tabNames()).toEqual(['Aperçu', 'Détails']);
      expect(screen.queryByRole('button', { name: 'Déjà réservé' })).toBeNull();
      expect(borderColor(container)).toBe(freeColor); // bordure d'un cadeau libre
    });
  });

  describe('réserver un cadeau libre', () => {
    // L'index de l'onglet de réservation dépend de la présence d'une description.
    it.each([
      ['sans description', undefined],
      ['avec description', DESCRIPTION],
    ])("n'ouvre le formulaire que sur l'onglet Offrir (%s)", (_, description) => {
      render(<Card description={description} giftMode />);

      expect(screen.queryByRole('button', { name: 'Confirmer' })).toBeNull();

      openTab('Offrir');

      expect(selectedTab()).toBe('Offrir');
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeTruthy();
    });

    it("ouvre le formulaire depuis la pastille « Réserver » de l'image", () => {
      render(<Card description={DESCRIPTION} giftMode />);

      clickButton('Réserver');

      expect(selectedTab()).toBe('Offrir');
    });

    it("transmet l'item et le commentaire saisi, puis revient à l'aperçu", () => {
      const onReserve = vi.fn();
      render(<Card giftMode onReserve={onReserve} />);

      openTab('Offrir');
      fireEvent.change(commentField(), { target: { value: 'Tata Jeanne' } });
      clickButton('Confirmer');

      expect(onReserve).toHaveBeenCalledExactlyOnceWith({
        wishId: ITEM.uuid,
        comment: 'Tata Jeanne',
      });
      expect(selectedTab()).toBe('Aperçu');
      expect(commentField().value).toBe('');
    });

    it('ne réserve rien quand on renonce', () => {
      const onReserve = vi.fn();
      render(<Card giftMode onReserve={onReserve} />);

      openTab('Offrir');
      clickButton('Annuler');

      expect(onReserve).not.toHaveBeenCalled();
      expect(selectedTab()).toBe('Aperçu');
    });
  });

  describe('cadeau déjà réservé', () => {
    const renderReserved = handlers => {
      render(<Card giftMode reservation={RESERVATION} {...handlers} />);
      openTab('Réservé');
    };

    it('ouvre la réservation et son commentaire depuis la pastille « Déjà réservé »', () => {
      render(<Card giftMode reservation={RESERVATION} />);

      clickButton('Déjà réservé');

      expect(selectedTab()).toBe('Réservé');
      expect(screen.getByText('Tata Jeanne')).toBeTruthy();
    });

    it('rectifie le commentaire à partir de sa valeur actuelle', () => {
      const onUpdateReservation = vi.fn();
      renderReserved({ onUpdateReservation });

      clickButton('Rectifier');

      expect(commentField().value).toBe('Tata Jeanne');

      fireEvent.change(commentField(), { target: { value: 'Tata Jeanne et Paul' } });
      clickButton('Enregistrer');

      expect(onUpdateReservation).toHaveBeenCalledExactlyOnceWith({
        reservationId: RESERVATION.id,
        wishId: ITEM.uuid,
        comment: 'Tata Jeanne et Paul',
      });
      expect(screen.getByRole('button', { name: 'Rectifier' })).toBeTruthy();
    });

    it('ne change rien quand on renonce à rectifier', () => {
      const onUpdateReservation = vi.fn();
      renderReserved({ onUpdateReservation });

      clickButton('Rectifier');
      fireEvent.change(commentField(), { target: { value: 'Autre chose' } });
      clickButton('Ne rien changer');

      expect(onUpdateReservation).not.toHaveBeenCalled();
      expect(screen.queryByPlaceholderText('De la part de ?')).toBeNull();
      expect(screen.getByText('Tata Jeanne')).toBeTruthy();
    });

    it("demande confirmation avant d'annuler la réservation", async () => {
      const onCancelReservation = vi.fn();
      renderReserved({ onCancelReservation });

      clickButton('Annuler la réservation');

      const dialog = screen.getByRole('dialog');

      expect(onCancelReservation).not.toHaveBeenCalled();
      expect(within(dialog).getByText(ITEM.title)).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Oui, annuler' }));

      expect(onCancelReservation).toHaveBeenCalledExactlyOnceWith(RESERVATION.id);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(selectedTab()).toBe('Aperçu');
    });

    it('garde la réservation quand on répond non', async () => {
      const onCancelReservation = vi.fn();
      renderReserved({ onCancelReservation });

      clickButton('Annuler la réservation');
      fireEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Non, garder' }),
      );

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(onCancelReservation).not.toHaveBeenCalled();
      expect(selectedTab()).toBe('Réservé');
    });
  });
});
