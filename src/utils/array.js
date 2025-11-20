/**
 * Bascule la présence d'une valeur dans un tableau.
 * Ajoute la valeur si elle n'existe pas, la retire si elle existe.
 *
 * @param {Array} [array=[]] - Tableau source
 * @param {string} [str] - Valeur à basculer
 * @returns {Array} Nouveau tableau avec la valeur ajoutée ou retirée
 *
 * @example
 * toggle(['a', 'b'], 'c') // ['a', 'b', 'c']
 * toggle(['a', 'b'], 'b') // ['a']
 * toggle(['a', 'b'], undefined) // ['a', 'b']
 */
export const toggle = (array = [], str = undefined) => {
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
