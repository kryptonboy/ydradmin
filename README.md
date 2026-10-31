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

## Backend

L'API (Symfony / API Platform) se trouve dans `../newkryproject`.
