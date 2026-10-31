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

## Sécurité

- Le JWT est conservé dans `localStorage` (clé `token`) : il est lisible par tout script de la page en cas de faille XSS. Ne jamais utiliser `v-html` avec du contenu venant de l'API (le BBCode des cartes doit être converti puis assaini avant affichage).
- Un 401 de l'API déconnecte l'utilisateur ; un 403 (droits insuffisants) ne le déconnecte pas.
- En production, `VITE_API_URL` doit pointer vers une URL HTTPS.
- `npm audit --omit=dev` ne remonte aucune vulnérabilité ; les alertes restantes concernent des outils de développement (vitest, eslint, etc.).

## Backend

L'API (Symfony / API Platform) se trouve dans `../newkryproject`.
