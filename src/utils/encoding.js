/**
 * Utilitaires pour encoder/décoder les commentaires de réservation.
 * Utilise XOR avec l'UUID comme clé + padding aléatoire pour masquer le contenu et la longueur.
 */

const SEPARATOR = '|';

/**
 * Encode un texte avec XOR (clé = wishId) et padding aléatoire.
 *
 * @param {string} text - Texte à encoder
 * @param {string} wishId - UUID de l'élément utilisé comme clé de chiffrement
 * @returns {string} Texte encodé en base64
 */
export const encodeComment = (text, wishId) => {
  if (!text || !wishId) return '';
  try {
    // XOR le texte avec l'UUID comme clé
    // eslint-disable-next-line no-bitwise
    const xored = text
      .split('')
      // eslint-disable-next-line no-bitwise
      .map((char, i) => {
        // eslint-disable-next-line no-bitwise
        const charCode = char.charCodeAt(0) ^ wishId.charCodeAt(i % wishId.length);
        return String.fromCharCode(charCode);
      })
      .join('');

    // Ajouter padding aléatoire de longueur variable
    const randomPadding = Math.random().toString(36).substring(2, 15);
    const withPadding = xored + SEPARATOR + randomPadding;

    return btoa(unescape(encodeURIComponent(withPadding)));
  } catch {
    return text;
  }
};

/**
 * Décode un texte avec XOR (clé = wishId) après suppression du padding.
 *
 * @param {string} encodedText - Texte encodé en base64
 * @param {string} wishId - UUID de l'élément utilisé comme clé de déchiffrement
 * @returns {string} Texte décodé
 */
export const decodeComment = (encodedText, wishId) => {
  if (!encodedText || !wishId) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(encodedText)));
    const [xored] = decoded.split(SEPARATOR);

    // Inverser le XOR avec l'UUID
    // eslint-disable-next-line no-bitwise
    return xored
      .split('')
      // eslint-disable-next-line no-bitwise
      .map((char, i) => {
        // eslint-disable-next-line no-bitwise
        const charCode = char.charCodeAt(0) ^ wishId.charCodeAt(i % wishId.length);
        return String.fromCharCode(charCode);
      })
      .join('');
  } catch {
    return encodedText;
  }
};
