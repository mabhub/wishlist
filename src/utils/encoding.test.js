import { describe, it, expect } from 'vitest';
import { encodeComment, decodeComment } from './encoding';

/** UUID fixe pour les cas déterministes. */
const UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/**
 * Génère un UUID v4 pseudo-aléatoire.
 *
 * @returns {string} UUID au format v4
 */
const randomUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = Math.floor(Math.random() * 16);
    // eslint-disable-next-line no-bitwise
    return (char === 'x' ? rand : (rand & 0x3) | 0x8).toString(16);
  });

/**
 * Encode un texte selon l'ancien format, basé sur un séparateur '|'.
 * Sert à vérifier que les données déjà stockées restent lisibles.
 *
 * @param {string} text - Texte à encoder
 * @param {string} wishId - Clé d'obfuscation
 * @returns {string} Texte encodé en base64, ancien format
 */
const encodeLegacy = (text, wishId) => {
  const xored = text
    .split('')
    .map((char, i) => {
      // eslint-disable-next-line no-bitwise
      const code = char.charCodeAt(0) ^ wishId.charCodeAt(i % wishId.length);
      return String.fromCharCode(code);
    })
    .join('');

  return btoa(unescape(encodeURIComponent(`${xored}|padding123`)));
};

describe('encodeComment / decodeComment', () => {
  it('restitue le texte après un aller-retour', () => {
    const text = 'De la part de Papa et Maman';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it('préserve les accents et les caractères non-ASCII', () => {
    const texts = ['Éloïse & Ségolène', 'Tonton Jean-Séb', 'de la part de Zoé', 'emoji 🎁 test'];

    texts.forEach(text => {
      expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
    });
  });

  it('préserve les espaces, sauts de ligne et ponctuation', () => {
    const text = 'Ligne 1\nLigne 2\tTabulé — ponctuation : «guillemets», 100%';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it('gère un texte long sans le tronquer', () => {
    const text = 'Offert par les collègues du bureau, '.repeat(20);

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });
});

describe('encodeComment', () => {
  it("retourne une chaîne vide si le texte ou l'UUID manque", () => {
    expect(encodeComment('', UUID)).toBe('');
    expect(encodeComment('Un commentaire', '')).toBe('');
    expect(encodeComment(undefined, UUID)).toBe('');
    expect(encodeComment('Un commentaire', undefined)).toBe('');
  });

  it('ne laisse pas le texte en clair dans la valeur stockée', () => {
    const text = 'De la part de Mamie Solange';
    const stored = encodeComment(text, UUID);

    expect(stored).not.toContain(text);
    expect(atob(stored)).not.toContain(text);
  });

  it('masque la longueur réelle du texte via le padding', () => {
    // Un texte d'un seul caractère ne doit pas produire une valeur minuscule
    expect(encodeComment('a', UUID).length).toBeGreaterThan(10);
  });

  it('produit des valeurs différentes pour un même texte', () => {
    const text = 'Benjamin';
    const encodages = new Set(Array.from({ length: 20 }, () => encodeComment(text, UUID)));

    // Le padding aléatoire empêche de reconnaître deux commentaires identiques
    expect(encodages.size).toBeGreaterThan(1);
  });

  it('produit des valeurs différentes selon la clé', () => {
    const text = 'Tonton Jean';

    expect(encodeComment(text, UUID)).not.toBe(encodeComment(text, randomUuid()));
  });
});

describe('decodeComment', () => {
  it("retourne une chaîne vide si l'entrée ou l'UUID manque", () => {
    expect(decodeComment('', UUID)).toBe('');
    expect(decodeComment('abc', '')).toBe('');
    expect(decodeComment(undefined, UUID)).toBe('');
  });

  it('retourne l’entrée telle quelle si elle est illisible', () => {
    // Ni base64 valide, ni format connu : on ne perd pas la donnée brute
    expect(decodeComment('!!!pas-du-base64!!!', UUID)).toBe('!!!pas-du-base64!!!');
  });

  it('ne restitue pas le texte avec une clé différente', () => {
    const text = 'De la part de Claire';
    const encoded = encodeComment(text, UUID);

    expect(decodeComment(encoded, randomUuid())).not.toBe(text);
  });

  it('relit les commentaires stockés dans l’ancien format', () => {
    const text = 'De la part de Papa et Maman';

    expect(decodeComment(encodeLegacy(text, UUID), UUID)).toBe(text);
  });
});

describe('régression : troncature par collision avec le séparateur', () => {
  // Le XOR produit fréquemment l'octet '|' (0x7C) à partir de caractères
  // ordinaires. L'ancien format découpait sur cet octet et perdait la suite.
  it("n'est pas tronqué quand le XOR produit un '|'", () => {
    // Position 1 de cet UUID : 'M' ^ '1' === '|'
    const text = 'xMSUITE A NE PAS PERDRE';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it("conserve un '|' présent dans le texte de l'utilisateur", () => {
    const text = 'Papa|Maman';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it("conserve un ':' présent dans le texte de l'utilisateur", () => {
    // ':' sert de séparateur au préfixe de longueur du nouveau format
    const text = 'De la part de : Benjamin';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it('conserve un texte commençant par des chiffres', () => {
    // Un préfixe numérique pourrait être confondu avec la longueur déclarée
    const text = '12:34 les cousins';

    expect(decodeComment(encodeComment(text, UUID), UUID)).toBe(text);
  });

  it('survit à un balayage de commentaires et de clés réalistes', () => {
    const comments = [
      'De la part de Papa et Maman',
      'Tonton Jean',
      'Mamie Solange',
      'Les cousins de Toulouse',
      'De la part de toute la famille',
      'Benjamin',
      'Claire et Nicolas',
      'Offert par les collègues de bureau',
    ];

    const failures = [];
    comments.forEach(text => {
      for (let i = 0; i < 200; i += 1) {
        const wishId = randomUuid();
        if (decodeComment(encodeComment(text, wishId), wishId) !== text) {
          failures.push({ text, wishId });
        }
      }
    });

    expect(failures).toEqual([]);
  });
});
