import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import WishlistItemCard from './WishlistItemCard';

const ITEM = {
  title: 'Théière en fonte',
  link: 'https://example.org/theiere',
};
const DESCRIPTION = 'Une **belle** théière';

// Contenu de réservation minimal, comme le fournirait un autre consommateur de la carte.
const renderLinkReservation = ({ showPreview }) => (
  <>
    <a href="https://example.org/reserver">Réserver ailleurs</a>
    <button type="button" onClick={showPreview}>
      Retour
    </button>
  </>
);

// Les zones d'une carte restent montées et sont repliées par des `<Collapse>` :
// les requêtes par rôle ne voient que la zone de l'onglet actif.
const tabNames = () => screen.getAllByRole('tab').map(tab => tab.textContent);
const selectedTab = () => screen.getByRole('tab', { selected: true }).textContent;
const openTab = name => fireEvent.click(screen.getByRole('tab', { name }));
const clickButton = name => fireEvent.click(screen.getByRole('button', { name }));

describe('WishlistItemCard', () => {
  describe('onglets', () => {
    it("n'affiche aucun onglet sans description hors mode offrir", () => {
      render(<WishlistItemCard {...ITEM} />);

      expect(screen.queryByRole('tablist')).toBeNull();
    });

    it("propose Aperçu et Détails quand l'item a une description", () => {
      render(<WishlistItemCard {...ITEM} description={DESCRIPTION} />);

      expect(tabNames()).toEqual(['Aperçu', 'Détails']);
      expect(selectedTab()).toBe('Aperçu');

      openTab('Détails');

      expect(selectedTab()).toBe('Détails');
      expect(screen.getByText('belle').tagName).toBe('STRONG'); // description en Markdown
    });

    it('date la création et la modification dans les détails, sans prop de style dans le DOM', () => {
      const { container } = render(
        <WishlistItemCard
          {...ITEM}
          description={DESCRIPTION}
          createdOn="2026-01-05T10:00:00Z"
          lastModifiedOn="2026-02-10T10:00:00Z"
        />,
      );

      openTab('Détails');

      expect(screen.getByText(/Créé le/).textContent).toContain('5 janvier 2026');
      expect(screen.getByText(/Modifié le/).textContent).toContain('10 février 2026');
      // Une prop système retirée par MUI finit en attribut HTML inerte.
      expect(container.querySelector('[display]')).toBeNull();
    });

    it("n'affiche ni onglet ni pastille de réservation sans renderReservation", () => {
      render(<WishlistItemCard {...ITEM} description={DESCRIPTION} isReserved />);

      expect(tabNames()).toEqual(['Aperçu', 'Détails']);
      expect(screen.queryByRole('button', { name: /réserv/i })).toBeNull();
    });
  });

  describe('prix', () => {
    it("remplace une image qui ne charge pas par un fond blanc, sans texte alternatif visible", () => {
      render(<WishlistItemCard {...ITEM} picture="https://example.org/absente.jpg" />);
      const image = screen.getByRole('img', { name: ITEM.title });

      expect(image.getAttribute('src')).toBe('https://example.org/absente.jpg');
      fireEvent.error(image);
      expect(image.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    });

    it("affiche le prix tel que fourni par l'appelant", () => {
      render(<WishlistItemCard {...ITEM} price="29,90 €" />);

      expect(screen.getByText('29,90 €')).toBeTruthy();
    });
  });

  describe('emplacement de réservation', () => {
    it("ajoute l'onglet et affiche le contenu fourni, qui peut revenir à l'aperçu", () => {
      render(
        <WishlistItemCard
          {...ITEM}
          description={DESCRIPTION}
          renderReservation={renderLinkReservation}
        />,
      );

      expect(tabNames()).toEqual(['Aperçu', 'Détails', 'Offrir']);

      clickButton('Réserver');

      expect(selectedTab()).toBe('Offrir');
      expect(screen.getByRole('link', { name: 'Réserver ailleurs' })).toBeTruthy();

      clickButton('Retour');

      expect(selectedTab()).toBe('Aperçu');
    });

    it('signale un cadeau réservé dans l’onglet et sur l’image', () => {
      render(<WishlistItemCard {...ITEM} isReserved renderReservation={renderLinkReservation} />);

      expect(tabNames()).toEqual(['Aperçu', 'Réservé']);
      expect(screen.getByRole('button', { name: 'Déjà réservé' })).toBeTruthy();
    });
  });
});
