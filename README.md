# Nuxt Template

A Nuxt 4 starter for production Vue 3 apps with TypeScript, Yarn Classic, and layered architecture. Includes ESLint, Prettier, Husky, lint-staged, Commitizen, and GitHub Actions CI. Structured around Nuxt 4's `app/` directory with conventions for pages, composables, services, stores, middleware, and layouts — ship features, not tooling.

## Stack

| Item            | Value                                                   |
| --------------- | ------------------------------------------------------- |
| Framework       | [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) |
| Language        | TypeScript                                              |
| Package manager | Yarn Classic 1.22.22                                    |
| Linting         | ESLint (`@nuxt/eslint`)                                 |
| Formatting      | Prettier                                                |
| Git hooks       | Husky + lint-staged                                     |
| Commits         | Commitizen (Conventional Commits)                       |
| CI              | GitHub Actions (lint, format, typecheck)                |

## Prerequisites

- Node.js 22+
- [Corepack](https://nodejs.org/api/corepack.html) enabled (ships with Node)

## Setup

Enable the pinned Yarn version, then install dependencies:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install
```

`postinstall` runs `nuxt prepare` automatically to generate Nuxt types in `.nuxt/`.

## Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `yarn dev`          | Start dev server at http://localhost:3000 |
| `yarn build`        | Production build                          |
| `yarn generate`     | Static site generation                    |
| `yarn preview`      | Preview production build locally          |
| `yarn lint`         | Run ESLint                                |
| `yarn lint:fix`     | Run ESLint with auto-fix                  |
| `yarn format`       | Format with Prettier                      |
| `yarn format:check` | Check formatting without writing          |
| `yarn typecheck`    | Run Vue + Nuxt type checking              |
| `yarn commit`       | Commit with Commitizen                    |

## Project structure

```
app/
├── app.vue           # Root shell
├── app.config.ts     # App-level UI config
├── assets/           # Styles, fonts, images (processed)
├── components/       # Reusable UI blocks
├── composables/      # Reactive logic + Vue Query wrappers
├── layouts/          # App shells (nav, sidebar, auth chrome)
├── middleware/       # Route guards (auth, guest)
├── pages/            # File-based routes
├── plugins/          # Bootstrap libs (axios, i18n, UI framework)
├── services/         # API paths, HTTP calls, DTOs, interceptors
├── stores/           # Pinia — global state (auth, menus, loading)
├── types/            # Shared TypeScript types
└── utils/            # Pure helpers (format, export, authState)
```

### Data flow

```
pages / layouts / components
        ↓
   composables (Vue Query)
        ↓
   services (axios → REST API)
```

- **Pages** orchestrate UI and fetch via **composables** — not axios directly.
- **Services** own HTTP and DTOs; **composables** own caching and mutations.
- **Stores** hold session-wide state only (auth, menus, loading).
- **Utils** are pure and stateless.

## Tooling

### Pre-commit hooks

Husky runs `lint-staged` on every commit:

- Prettier formats staged files
- ESLint auto-fixes staged `.js`, `.ts`, and `.vue` files

### Conventional commits

Use Commitizen for standardized commit messages:

```bash
yarn commit
```

### CI

On every push, GitHub Actions runs:

1. `yarn lint`
2. `yarn format:check`
3. `yarn typecheck`

## Development

Start the dev server:

```bash
yarn dev
```

Open http://localhost:3000 in your browser.

## Production

Build and preview locally:

```bash
yarn build
yarn preview
```

For deployment options, see the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment).

## License

MIT
