# anime_page

A [Next.js](https://nextjs.org/) web app for browsing anime. It uses the [Kitsu JSON:API](https://kitsu.docs.apiary.io/#introduction/json:api) for listings, search filters, show details (including episodes), and related titles by category.

## Features

- **Home** — Trending anime (statically generated, refreshed hourly)
- **Browse** (`/search`) — Filter by season, year, status, categories, subtype, age rating; sort and paginate results
- **Details** (`/details/[id]`) — Synopsis, metadata, genres, and episodes with infinite scroll (generated on first visit, refreshed hourly)
- **Related** (`/related/[slug]`) — Anime sharing a category/genre slug, with infinite scroll
- **Theme** — Light/dark mode (toggle in the header; preference stored in `localStorage`, with system preference as default)

## Stack

- **Framework:** Next.js 16 (Pages Router)
- **UI:** React 19, [MUI](https://mui.com/) (Emotion), Roboto via `@fontsource/roboto`
- **Data:** Native `fetch` + [TanStack Query](https://tanstack.com/query) against the Kitsu API
- **Tooling:** ESLint, Prettier, Husky + lint-staged (Prettier on staged files)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Optional: to point the app at a different Kitsu API base URL, copy `.env-template` to `.env.local` and change the value:

   ```bash
   NEXT_PUBLIC_API_ENDPOINT=https://kitsu.io/api/edge
   ```

   Without a `.env.local` the app uses `https://kitsu.io/api/edge`. Request URLs are built as `${NEXT_PUBLIC_API_ENDPOINT}` plus paths such as `/trending/anime` and `/anime`.

## Scripts

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `bun run dev`        | Start dev server (Next.js)    |
| `bun run build`      | Production build              |
| `bun run start`      | Run production server         |
| `bun run lint`       | Run ESLint                    |
| `bun run test`       | Run unit tests (Vitest)       |
| `bun run test:watch` | Run unit tests in watch mode  |
| `bun run test:e2e`   | Run the Playwright smoke test |

Open [http://localhost:3000](http://localhost:3000) when using `bun run dev`.

The smoke test builds and starts the app itself and reads live data from the Kitsu API. Install its browser once with `bunx playwright install chromium`.

## Project layout

| Path                 | Role                                                         |
| -------------------- | ------------------------------------------------------------ |
| `pages/`             | Routes (`index`, `search`, `details/[id]`, `related/[slug]`) |
| `components/`        | Layout, cards, search form, pagination, etc.                 |
| `helpers/request.js` | Axios wrapper for the Kitsu API                              |
| `constants.js`       | Season, status, sort, and filter enums for browse            |

Remote images are allowed from `media.kitsu.io` (see `next.config.js`).

## License

Private project (`"private": true` in `package.json`).
