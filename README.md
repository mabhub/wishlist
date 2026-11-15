# Wishlist

Liste de cadeaux à partager : on y publie ses envies, et les proches réservent ce qu'ils comptent offrir.

Application web sans serveur propre (React 18, Vite, MUI).
Les données sont lues et écrites dans [Baserow](https://baserow.io), directement depuis le navigateur.

## Démarrer

Prérequis : Node 18 et une base Baserow avec trois tables (listes, souhaits, réservations).

```bash
cp .env.example .env.local   # puis renseigner les variables VITE_BASEROW_*
npm install
npm run dev
```

## Commandes

| Commande         | Rôle                                          |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | serveur de développement                      |
| `npm run build`  | build de production dans `dist/`              |
| `npm test`       | tests unitaires (Vitest)                      |
| `npm run lint`   | analyse du code (oxlint)                      |
| `npm run format` | mise en forme (oxfmt), `format:check` vérifie |

## Jeton Baserow

Le jeton est embarqué dans le bundle : toute personne qui ouvre le site peut le lire.
Lui donner le strict nécessaire : lecture sur les listes et les souhaits, écriture sur les seules réservations.

## Licence

[MIT](LICENSE)
