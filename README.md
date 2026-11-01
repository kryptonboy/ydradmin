# ydradmin

Interface d'administration (Vue 3 + Vite + Pinia + Bootstrap) de l'API Yu-Gi-Oh! Destiny Reborn.

## Installation

```sh
npm install
cp .env.example .env   # puis renseigner VITE_API_URL
```

## Scripts

| Commande             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Serveur de développement                        |
| `npm run build`      | Type-check puis build de production             |
| `npm run type-check` | Vérification des types (`vue-tsc`)              |
| `npm run lint`       | ESLint (avec correction automatique)            |
| `npm run format`     | Prettier                                        |
| `npm run gen`        | Régénère les types depuis l'API (nécessite PHP) |
| `npm run test:unit`  | Tests unitaires (Vitest)                        |
| `npm run test:e2e`   | Tests e2e (Playwright)                          |

## Types générés depuis l'API

```sh
npm run gen   # exporte le schéma OpenAPI depuis ../../newkryproject puis régénère les types
```

- `openapi/openapi.json` et `src/types/openapi.d.ts` sont générés et commités.
- `src/types/api-types.ts` expose des alias lisibles (`CardInput`, `ApiCard`, ...). Les `*Form` sont ces types d'entrée.
- `src/types/conformance.ts` vérifie à la compilation que les modèles écrits à la main restent compatibles avec le schéma : après un `npm run gen`, un échec de `npm run type-check` signale une évolution de l'API.

## Conventions

- **Icônes** : seules les icônes enregistrées dans `src/icons.ts` sont embarquées (bundle allégé). Toute nouvelle icône FontAwesome doit y être ajoutée.
- **Routes** : chargées à la demande (`src/helpers/router.ts`). Une route inconnue affiche `NotFoundView`.
- **Stores / listes / modales** : `createResourceStore` (stores CRUD), `useListView` + `SortableHeader` (listes), `FormModal` + `useSubmit` (formulaires en modale).

## Contenu éditorial (actualités)

- Pages `/content/actuality` (liste), `/content/actuality/new` et `/content/actuality/:id` (édition), `/content/actuality_category`.
- Le contenu d'une actualité est une liste de blocs ; le format est décrit dans `../newkryproject/docs/content-blocks.md`. L'OpenAPI type `blocks` de façon générique : les types sont écrits à la main dans `src/types/content-blocks.ts` (à tenir à jour avec cette doc).
- L'éditeur est dans `src/components/content/` : `BlockEditor` (liste glisser-déposer récursive, `vue-draggable-plus`), `BlockItem` (un bloc) et `RichTextEditor` (TipTap pour les champs HTML).
- Les blocs reçoivent un `uid` côté éditeur (clé du glisser-déposer) retiré par `toApiBlocks`, qui omet aussi les champs vides : l'API refuse les champs inconnus.
- Les erreurs 422 (`blocks[2].children[0].content`) sont rattachées au bloc fautif.

## Animés et mangas

- Pages sous `/anime_manga` : animés (et leur page « Structure » : saisons, arcs, liens arc/saison), mangas, épisodes, chapitres, personnages, genres, signes astrologiques. Le contrat est décrit dans `../newkryproject/docs/anime-manga.md`.
- Épisodes et chapitres réutilisent l'éditeur de blocs des actualités (`useBlockContent`) et ont un état brouillon (`visible: false`). Leurs personnages se gèrent avec `AppearanceEditor` (`/api/episode_characters`, `/api/chapter_characters`) ; la liste des cartes avec compteur vient de `GET /api/{ressource}/{id}/cards` (hors OpenAPI, typée à la main dans `types/models/Appearance.ts`).
- Les relations sont lues sous la forme `{ @id, id }` seulement : les libellés (nom de l'animé, arc, saison...) sont reconstruits côté admin à partir de listes chargées.

## Sécurité

- Le JWT est conservé dans `localStorage` (clé `token`) : il est lisible par tout script de la page en cas de faille XSS. Ne jamais utiliser `v-html` avec du contenu venant de l'API (le BBCode des cartes doit être converti puis assaini avant affichage).
- Un 401 de l'API déconnecte l'utilisateur ; un 403 (droits insuffisants) ne le déconnecte pas.
- En production, `VITE_API_URL` doit pointer vers une URL HTTPS.
- `npm audit --omit=dev` ne remonte aucune vulnérabilité ; les alertes restantes concernent des outils de développement (vitest, eslint, etc.).

## Backend

L'API (Symfony / API Platform) se trouve dans `../newkryproject`.
