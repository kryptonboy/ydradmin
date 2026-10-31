# ydradmin

Interface d'administration (Vue 3 + Vite + Pinia + Bootstrap) de l'API Yu-Gi-Oh! Destiny Reborn.

## Installation

```sh
npm install
cp .env.example .env   # puis renseigner VITE_API_URL
```

## Scripts

| Commande             | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Serveur de développement                     |
| `npm run build`      | Type-check puis build de production          |
| `npm run type-check` | Vérification des types (`vue-tsc`)           |
| `npm run lint`       | ESLint (avec correction automatique)         |
| `npm run format`     | Prettier                                     |
| `npm run test:unit`  | Tests unitaires (Vitest)                     |
| `npm run test:e2e`   | Tests e2e (Playwright)                       |

## Backend

L'API (Symfony / API Platform) se trouve dans `../newkryproject`.
