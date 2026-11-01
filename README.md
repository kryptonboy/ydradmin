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
- Le bloc « Liens externes » (`links`, 1 à 50 liens avec titre, adresse, type libre et description) remplace les médias externes : il est utilisable dans tous les contenus en blocs. Les animés, mangas et personnages n'ont pas de contenu en blocs et donc pas de liens.
- Modération des commentaires : `/content/actuality_comment` (ressource `actuality_comments`, administrateurs uniquement). Pas de création ; on peut modifier le texte, masquer/ré-afficher (`hidden`) et supprimer. L'auteur n'est qu'un pseudo (le compte utilisateur n'est pas exposé). Supprimer une actualité qui a des commentaires renvoie un 409 : supprimer les commentaires d'abord.
- Smileys : `/content/smiley`. Un code unique de 10 caractères maximum (ex. `:)`) et une image facultative, utilisable par un seul smiley (422 sinon). Supprimer un smiley ne supprime pas le fichier.

## Animés et mangas

- Pages sous `/anime_manga` : animés (et leur page « Structure » : saisons, arcs, liens arc/saison), mangas, épisodes, chapitres, personnages, genres, signes astrologiques. Le contrat est décrit dans `../newkryproject/docs/anime-manga.md`.
- Épisodes et chapitres réutilisent l'éditeur de blocs des actualités (`useBlockContent`) et ont un état brouillon (`visible: false`). Leurs personnages se gèrent avec `AppearanceEditor` (`/api/episode_characters`, `/api/chapter_characters`) ; la liste des cartes avec compteur vient de `GET /api/{ressource}/{id}/cards` (hors OpenAPI, typée à la main dans `types/models/Appearance.ts`).
- Films (`/anime_manga/movie`, `../newkryproject/docs/movies.md`) : même modèle que les épisodes (blocs, brouillon, personnages et cartes via `AppearanceEditor kind="movie"`), avec en plus jaquette et image du titre, personnage principal et position.
- Personnages principaux : un manga a une page `/anime_manga/manga/:id` (personnages avec position et statut de principal) et un arc a un panneau « Personnages » dans la structure de son animé. Ces listes ne sont pas dans le détail du manga ou de l'arc : `LinkedCharacters` les lit par filtre (`/api/manga_characters?manga=<id>`, `/api/arc_characters?arc=<id>`).
- Fiches (animés, mangas, personnages) : le contenu en blocs (liens externes compris) se modifie depuis la fiche (`/anime_manga/anime/:id`, `/anime_manga/manga/:id`, `/anime_manga/character/:id`) avec `ContentEditor`, qui n'envoie que `blocks` (les autres champs restent dans la modale). Pas de brouillon sur ces trois fiches. Le détail (avec `blocks` et `media`) a un schéma distinct de la liste (`ApiAnimeDetail`...).
- Les relations sont lues sous la forme `{ @id, id }` seulement : les libellés (nom de l'animé, arc, saison...) sont reconstruits côté admin à partir de listes chargées.

## Catalogue

- Chaque page du catalogue (`/card_management`) a une modale de création/modification et un bouton de suppression (`useRemoveAction`) : si l'élément est encore référencé, l'API répond 409 et son message est affiché tel quel.
- Formats de jeu et restrictions (nombre d'exemplaires d'un groupe de cartes dans un format : 0, 1 ou 2) : `/card_management/game_format` et `/card_management/restriction`. Le lien extensions ↔ formats se règle depuis la modale de l'extension (`gameFormats`, la liste remplace l'existant) ; la liste des formats affiche leurs extensions.
- Rulings (`/card_management/ruling`, `../newkryproject/docs/rulings.md`) : le lien avec les cartes appartient à la carte abstraite ; il se règle depuis le ruling (sélecteur de cartes) ou depuis la modale de la carte abstraite. Dans les deux cas la liste envoyée remplace l'existant (`[]` détache tout).
- Les icônes (types et sous-types de carte, extensions, attributs de monstre, signes) sont lues avec leur `contentUrl` : `MediaThumb` affiche l'icône actuelle dans les modales.

## Jeux vidéo

- Pages sous `/video_game` : jeux (liste filtrable, création/édition) et supports. Le contrat est décrit dans `../newkryproject/docs/video-games.md`.
- Un jeu a un résumé court en texte brut, un état brouillon (`visible`) et son contenu (présentation et test) en blocs, avec le même éditeur que les actualités. Ses personnages se gèrent avec `CharacterLinks` (`/api/video_game_characters`) ; la fiche d'un personnage liste ses jeux (`GET /api/video_games?character=<id>`).
- Les relations sont lues avec un libellé (`{ @id, id, name }`, `seasonNumber`, `title`...) : types `NamedRef`, `SeasonRef`... dans `types/models/Ref.ts`.

## Sécurité

- Le JWT est conservé dans `localStorage` (clé `token`) : il est lisible par tout script de la page en cas de faille XSS. Ne jamais utiliser `v-html` avec du contenu venant de l'API (le BBCode des cartes doit être converti puis assaini avant affichage).
- Un 401 de l'API déconnecte l'utilisateur ; un 403 (droits insuffisants) ne le déconnecte pas.
- En production, `VITE_API_URL` doit pointer vers une URL HTTPS.
- `npm audit --omit=dev` ne remonte aucune vulnérabilité ; les alertes restantes concernent des outils de développement (vitest, eslint, etc.).

## Backend

L'API (Symfony / API Platform) se trouve dans `../newkryproject`.
