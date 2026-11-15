import { describe, expect, it } from 'vitest';
import { isVisibleInCategories } from './categories';

const ALL = ['Livre', 'Jeu', 'Musique'];

describe('isVisibleInCategories', () => {
  it('affiche tout quand aucune catégorie n’est désactivée', () => {
    expect(isVisibleInCategories(['Livre'], [], ALL)).toBe(true);
    expect(isVisibleInCategories([], [], ALL)).toBe(true);
  });

  it('garde un item tant qu’une de ses catégories reste active', () => {
    expect(isVisibleInCategories(['Livre', 'Jeu'], ['Livre'], ALL)).toBe(true);
  });

  it('masque un item dont toutes les catégories sont désactivées', () => {
    expect(isVisibleInCategories(['Livre', 'Jeu'], ['Livre', 'Jeu'], ALL)).toBe(false);
  });

  it('ne masque un item sans catégorie que si toutes le sont', () => {
    expect(isVisibleInCategories([], ['Livre', 'Jeu'], ALL)).toBe(true);
    expect(isVisibleInCategories([], ALL, ALL)).toBe(false);
    expect(isVisibleInCategories(undefined, ALL, ALL)).toBe(false);
  });

  it('affiche un item sans catégorie quand la liste n’en a aucune', () => {
    expect(isVisibleInCategories([], [], [])).toBe(true);
  });
});
