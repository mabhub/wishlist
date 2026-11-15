import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import WishlistView from './WishlistView';
import useCategoryFilter from '../hooks/useCategoryFilter';

const CATEGORIES = ['Livre', 'Jeu'];
const ITEMS = [
  { id: 'a', title: 'Roman', categories: ['Livre'] },
  { id: 'b', title: 'Puzzle', categories: ['Jeu'] },
  { id: 'c', title: 'Sans catégorie' },
];

/** Vue pilotée par `useCategoryFilter`, comme chez un appelant. */
const FilteredView = () => {
  const { disabledCategories, onCategoryClick, isVisible } = useCategoryFilter(CATEGORIES);

  return (
    <WishlistView
      title="Ma liste"
      subtitle="Pour Alice"
      categories={CATEGORIES}
      disabledCategories={disabledCategories}
      onCategoryClick={onCategoryClick}
      actions={<button type="button">Action</button>}
      items={ITEMS.filter(isVisible)}
      getItemKey={({ id }) => id}
      renderItem={({ title }) => <p>{title}</p>}
    />
  );
};

const titles = () => screen.queryAllByText(/Roman|Puzzle|Sans catégorie/).map(n => n.textContent);
const chip = name => screen.getByRole('button', { name });

describe('WishlistView', () => {
  it("affiche l'en-tête, les emplacements de l'appelant et chaque item", () => {
    render(<FilteredView />);

    expect(screen.getByRole('heading', { level: 1, name: 'Ma liste' })).toBeTruthy();
    expect(screen.getByText('Pour Alice')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy();
    expect(titles()).toEqual(['Roman', 'Puzzle', 'Sans catégorie']);
  });

  it('filtre par catégorie et indique les chips actifs', () => {
    render(<FilteredView />);

    fireEvent.click(chip('Livre'));

    expect(titles()).toEqual(['Puzzle', 'Sans catégorie']);
    expect(chip('Livre').getAttribute('aria-pressed')).toBe('false');
    expect(chip('Tout').getAttribute('aria-pressed')).toBe('false');
  });

  it('« Tout » désactive tout, puis réactive tout', () => {
    render(<FilteredView />);

    fireEvent.click(chip('Tout'));

    expect(titles()).toEqual([]);

    fireEvent.click(chip('Tout'));

    expect(titles()).toEqual(['Roman', 'Puzzle', 'Sans catégorie']);
  });
});
