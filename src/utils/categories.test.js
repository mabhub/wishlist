import { describe, expect, it } from 'vitest';
import { CATEGORY_COLORS, categoryColor, isVisibleInCategories } from './categories';

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

describe('categoryColor', () => {
  it('garde la couleur d’une catégorie connue', () => {
    expect(categoryColor('Vinyle')).toBe('primary');
    expect(categoryColor('BD')).toBe('error');
  });

  it('donne toujours la même couleur du thème à une catégorie inconnue', () => {
    const color = categoryColor('Beauté / Hygiène');

    expect(CATEGORY_COLORS).toContain(color);
    expect(categoryColor('Beauté / Hygiène')).toBe(color);
  });

  it('répartit des catégories inconnues sur plusieurs couleurs', () => {
    const labels = ['Beauté / Hygiène', 'Loisirs créatifs', 'Couture / Tricot', 'Divers', 'Jeux'];

    expect(new Set(labels.map(categoryColor)).size).toBeGreaterThan(2);
  });
});
