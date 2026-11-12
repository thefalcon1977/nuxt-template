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
app/
├── app.vue                      # NuxtLayout + NuxtPage
├── app.config.ts                # App-level config
├── assets/
│   ├── styles/                  # SCSS layers (see below)
│   ├── font/                    # Self-hosted fonts
│   ├── icons/
│   └── img/
├── components/                  # Shared UI (empty until reused)
├── layouts/default.vue          # Shell with the language switch
├── middleware/                  # Route guards
├── pages/index.vue              # Home page
├── plugins/                     # App bootstrap
├── services/REST_SERVICES/
│   ├── routes/                  # URL constants
│   ├── queries/                 # GET
│   ├── mutations/               # POST / PUT / DELETE
│   └── dto/                     # Request and response types
├── stores/                      # Global state only
├── types/
└── utils/
```

Empty folders stay in git with `.gitkeep`. Create `app/composables/` when the first shared reactive function is needed.

### Data flow

When a feature calls an API, keep this order:

```
pages / layouts / components
        ↓
   composables
        ↓
   services (HTTP → REST API)
```

- **Pages** orchestrate UI and call composables.
- **Services** own paths, HTTP calls, and DTOs.
- **Composables** own caching and mutations.
- **Stores** hold session-wide state only (auth, menus, loading).
- **Utils** stay pure and stateless.

### Styles

`app/assets/styles/app.scss` loads layers in this order:

**base → utils → layouts → components → pages → vendors**

| Layer         | Starter                                               |
| ------------- | ----------------------------------------------------- |
| `base/`       | Tokens, typography, containers, reset, fade animation |
| `utils/`      | Mixins and helper classes                             |
| `layouts/`    | `.app-shell`                                          |
| `components/` | `.btn`                                                |
| `pages/`      | `.page-wrapper`                                       |
| `vendors/`    | Place for third-party overrides                       |

Styles are not loaded yet. Install Sass, then add the entry in `nuxt.config.ts`:

```bash
yarn add -D sass
```

```ts
export default defineNuxtConfig({
  css: ['~/assets/styles/app.scss'],
})
```

New partials use a `_` prefix and are registered from that layer's `index.scss`.

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

Open http://localhost:3000. The home page is `app/pages/index.vue`, inside `app/layouts/default.vue`. Use the language control in the header. Only English is available.

## Production

```bash
yarn build
yarn preview
```

See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for hosting options.

## License

MIT
