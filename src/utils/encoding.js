/**
 * Utilitaires pour encoder/décoder les commentaires de réservation.
 *
 * Objectif : éviter la lecture involontaire des commentaires côté stockage
 * (interface Baserow). Il s'agit d'obfuscation, pas de chiffrement — la clé
 * est l'UUID de l'item, qui est public.
 *
 * Format : XOR avec l'UUID comme clé, préfixé par la longueur utile, puis
 * padding aléatoire pour masquer la longueur réelle, le tout en base64.
 *
 *     base64( "<longueur>:<texte XORé><padding aléatoire>" )
 *
 * Le préfixe de longueur remplace un ancien séparateur "|" qui tronquait
 * silencieusement le texte : le XOR produit fréquemment cet octet à partir de
 * caractères ordinaires, ce qui coupait le commentaire au premier faux positif.
 * `decodeComment` reste capable de relire l'ancien format (voir plus bas).
 */

const LENGTH_SEPARATOR = ':';
const LEGACY_SEPARATOR = '|';

/**
 * Applique le XOR entre un texte et une clé répétée (opération symétrique).
 *
 * @param {string} text - Texte à transformer
 * @param {string} key - Clé de transformation (répétée si plus courte)
 * @returns {string} Texte transformé
 */
const xorWithKey = (text, key) => text
  .split('')
  .map((char, i) => {
    // eslint-disable-next-line no-bitwise
    const charCode = char.charCodeAt(0) ^ key.charCodeAt(i % key.length);
    return String.fromCharCode(charCode);
  })
  .join('');

/**
 * Génère un padding aléatoire de longueur variable.
 *
 * @returns {string} Padding alphanumérique
 */
const randomPadding = () => Math.random().toString(36).substring(2, 15);

/**
 * Encode un texte avec XOR (clé = wishId) et padding aléatoire.
 *
 * @param {string} text - Texte à encoder
 * @param {string} wishId - UUID de l'élément utilisé comme clé de chiffrement
 * @returns {string} Texte encodé en base64, ou '' si l'entrée est incomplète
 */
export const encodeComment = (text, wishId) => {
  if (!text || !wishId) return '';
  try {
    const xored = xorWithKey(text, wishId);
    const payload = `${xored.length}${LENGTH_SEPARATOR}${xored}${randomPadding()}`;

    return btoa(unescape(encodeURIComponent(payload)));
  } catch {
    return text;
  }
};

/**
 * Décode un texte encodé par `encodeComment`.
 *
 * Gère aussi l'ancien format basé sur un séparateur '|', pour rester capable de
 * relire les commentaires déjà stockés avant l'introduction du préfixe de
 * longueur. À supprimer une fois les données existantes migrées.
 *
 * @param {string} encodedText - Texte encodé en base64
 * @param {string} wishId - UUID de l'élément utilisé comme clé de déchiffrement
 * @returns {string} Texte décodé, ou l'entrée telle quelle si illisible
 */
export const decodeComment = (encodedText, wishId) => {
  if (!encodedText || !wishId) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(encodedText)));
    const separatorIndex = decoded.indexOf(LENGTH_SEPARATOR);
    const declaredLength = parseInt(decoded.slice(0, separatorIndex), 10);

    // Format actuel : préfixe de longueur numérique suivi du texte XORé
    if (separatorIndex > 0 && Number.isInteger(declaredLength)) {
      const start = separatorIndex + LENGTH_SEPARATOR.length;
      return xorWithKey(decoded.slice(start, start + declaredLength), wishId);
    }

    // Ancien format : tout ce qui précède le premier '|'
    return xorWithKey(decoded.split(LEGACY_SEPARATOR)[0], wishId);
  } catch {
    return encodedText;
  }
};
