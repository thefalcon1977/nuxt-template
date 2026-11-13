# Nuxt Template

A Nuxt 4 starter for production Vue 3 apps with TypeScript, Yarn Classic, and a layered `app/` directory. ESLint, Prettier, Husky, lint-staged, Commitizen, and GitHub Actions CI are included. Feature layers are scaffolded so you can add screens without wiring tooling first.

## Stack

| Item            | Value                                                   |
| --------------- | ------------------------------------------------------- |
| Framework       | [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) |
| Language        | TypeScript                                              |
| Router          | Vue Router 5                                            |
| i18n            | [@nuxtjs/i18n](https://i18n.nuxtjs.org) (English only)  |
| Package manager | Yarn Classic 1.22.22                                    |
| Linting         | ESLint (`@nuxt/eslint`)                                 |
| Formatting      | Prettier                                                |
| Git hooks       | Husky + lint-staged                                     |
| Commits         | Commitizen (Conventional Commits)                       |
| CI              | GitHub Actions (lint, format, typecheck)                |

Pinia, an HTTP client, and a query library are not installed. Add one when a feature needs that layer.

## Prerequisites

- Node.js 22+
- [Corepack](https://nodejs.org/api/corepack.html) (ships with Node)

## Setup

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install
```

`postinstall` runs `nuxt prepare` and generates Nuxt types in `.nuxt/`.

Copy the env template and edit local values:

```bash
cp .env.example .env
```

| Variable              | Used for                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MODE`                | App mode (`runtimeConfig.public.mode`: `development` or `production`)                                                                                    |
| `API_BASE_URL`        | Public API base URL (`runtimeConfig.public.apiBaseUrl`)                                                                                                  |
| `THEME`               | Default theme (`light`, `dark`, or `custom`). A `theme` cookie overrides it after the visitor picks one                                                  |
| `LOCALE`              | Default i18n locale (`en`)                                                                                                                               |
| `ENCRYPT_STORAGE_KEY` | Encryption key (`runtimeConfig.public.encryptStorageKey`) for `StorageService` and encrypted `CookieService` names/values. Quote values that contain `#` |
| `VERSION`             | App version (`runtimeConfig.public.version`, default `1.0.0`). `GET /json/version` returns `{ "version": "1.0.0" }`                                      |

Read public values with `useRuntimeConfig().public` in app code. Restart `yarn dev` after changing `.env`.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `yarn dev`          | Dev server at http://localhost:3000  |
| `yarn build`        | Production build                     |
| `yarn generate`     | Static site generation               |
| `yarn preview`      | Preview the production build locally |
| `yarn lint`         | Run ESLint                           |
| `yarn lint:fix`     | Run ESLint with auto-fix             |
| `yarn format`       | Format with Prettier                 |
| `yarn format:check` | Check formatting without writing     |
| `yarn typecheck`    | Run Vue and Nuxt type checking       |
| `yarn commit`       | Commit with Commitizen               |

## Project structure

```
i18n/
└── locales/
    └── en.ts                    # English messages
services/
├── STORAGE/
│   ├── encryptClient.ts         # Shared encrypt-storage client from ENCRYPT_STORAGE_KEY
│   ├── localStorage.ts          # StorageService: encrypted local storage
│   └── cookie.ts                # CookieService: hashed names + encrypted values
└── REST_SERVICES/
    ├── routes/                  # URL constants
    ├── queries/                 # GET
    ├── mutations/               # POST / PUT / DELETE
    └── dto/                     # Request and response types
app/
├── app.vue                      # NuxtLayout + NuxtPage
├── app.config.ts                # App-level config
├── assets/
│   ├── styles/                  # SCSS layers (see below)
│   ├── font/                    # Self-hosted fonts
│   ├── icons/
│   └── img/
├── components/                  # Shared UI (empty until reused)
├── composables/useTheme.ts      # Theme cookie and document attribute
├── layouts/default.vue          # Shell with language and theme switches
├── middleware/                  # Route guards
├── pages/index.vue              # Home page
├── plugins/                     # App bootstrap
├── services/REST_SERVICES/      # Empty skeleton; use the root services/ tree
├── stores/                      # Global state only
├── types/
└── utils/theme.ts               # Theme names and cookie key
```

Empty folders stay in git with `.gitkeep`. Add the next composable under `app/composables/` when another feature needs shared reactive logic.

### Data flow

When a feature calls an API, keep this order:

```
pages / layouts / components
        ↓
   composables
        ↓
   services (HTTP → REST API, encrypted local storage)
```

- **Pages** orchestrate UI and call composables.
- **Services** own paths, HTTP calls, DTOs, and encrypted local storage.
- **`StorageService`** (`services/STORAGE/localStorage.ts`) keeps one encrypted object in the browser. Call `setItem`, `getItem`, and `removeItem`.
- **`CookieService`** (`services/STORAGE/cookie.ts`) is the only cookie API: `setItem`, `getItem`, `removeItem`, `getAll`, and `clear`. Cookie names are stored as `@nuxt:{name}` (for example `@nuxt:theme`) and values are encrypted with `ENCRYPT_STORAGE_KEY`. A theme cookie is written only after the visitor picks a theme in the header. Do not use `useCookie` or `document.cookie`.
- **Composables** own caching and mutations.
- **Stores** hold session-wide state only (auth, menus, loading).
- **Utils** stay pure and stateless.

### Styles

`app/assets/styles/app.scss` loads layers in this order:

**base → utils → layouts → components → pages → vendors**

| Layer         | Starter                                               |
| ------------- | ----------------------------------------------------- |
| `base/`       | Tokens, theme palettes, typography, containers, reset |
| `utils/`      | Mixins and helper classes                             |
| `layouts/`    | `.app-shell`                                          |
| `components/` | `.btn`                                                |
| `pages/`      | `.page-wrapper`                                       |
| `vendors/`    | Place for third-party overrides                       |

New partials use a `_` prefix and are registered from that layer's `index.scss`. Global styles load from `nuxt.config.ts` via `css: ['~/assets/styles/app.scss']`.

## Themes

The header theme control switches **Light**, **Dark**, and **Custom**. `THEME` in `.env` is the default and is applied as `data-theme` on `<html>`. Choosing a theme in the header stores that choice in the `theme` cookie, which then overrides the default.

| Theme    | Look                                 |
| -------- | ------------------------------------ |
| `light`  | Cool background, teal primary        |
| `dark`   | Dark background, bright teal primary |
| `custom` | Warm background, orange primary      |

Palettes live in `app/assets/styles/base/_themes.scss` as CSS variables (`--color-background`, `--color-text`, `--color-primary`). `useTheme()` in `app/composables/useTheme.ts` uses `THEME` until the visitor chooses a theme.

## Internationalization

Copy lives in `i18n/locales/`. English (`en.ts`) is the only locale. The default layout renders a language `<select>` and switches with `setLocale`.

| Setting           | Value                                       |
| ----------------- | ------------------------------------------- |
| Module            | `@nuxtjs/i18n`                              |
| Default locale    | `en`                                        |
| URL strategy      | `no_prefix` (the locale is not in the path) |
| Browser detection | Off                                         |

Pages use `$t('home.title')`. Add a language by creating `i18n/locales/{code}.ts` with the same keys and registering it in `nuxt.config.ts` (`code`, `language`, `name`, `dir`, `file`).

## Tooling

### Pre-commit

Husky runs `lint-staged` on commit:

- Prettier formats staged files
- ESLint fixes staged `.js`, `.ts`, and `.vue` files

### Commits

```bash
yarn commit
```

### CI

On every push, GitHub Actions runs:

1. `yarn lint`
2. `yarn format:check`
3. `yarn typecheck`

## Development

```bash
yarn dev
```

Open http://localhost:3000. The home page is `app/pages/index.vue`, inside `app/layouts/default.vue`. The header has a language control (English only) and a theme control (Light, Dark, Custom).

## Production

```bash
yarn build
yarn preview
```

See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for hosting options.

## License

MIT
