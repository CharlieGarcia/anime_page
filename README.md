# anime_page

A [Next.js](https://nextjs.org/) web app for browsing anime. It uses the [Kitsu JSON:API](https://kitsu.docs.apiary.io/#introduction/json:api) for listings, search filters, show details (including episodes), and related titles by category.

## Features

- **Home** — Trending anime (statically generated, refreshed hourly)
- **Browse** (`/search`) — Filter by season, year, status, categories, subtype, age rating; sort and paginate results
- **Details** (`/details/[id]`) — Synopsis, metadata, genres, and episodes with infinite scroll (generated on first visit, refreshed hourly)
- **Related** (`/related/[slug]`) — Anime sharing a category/genre slug, with infinite scroll
- **Theme** — Light/dark mode (toggle in the header; preference stored in `localStorage`, with system preference as default)

## Stack

- **Framework:** Next.js 16 (Pages Router), TypeScript
- **UI:** React 19, [MUI](https://mui.com/) (Emotion)
- **Data:** Native `fetch` + [TanStack Query](https://tanstack.com/query) against the Kitsu API. Responses are cached and treated as fresh for 3000 ms (`QUERY_CACHE_TTL_MS` in `src/helpers/queryClient.ts`); after that, the next use refetches in the background
- **Testing:** Vitest + React Testing Library (unit), Playwright (smoke test)
- **Tooling:** ESLint, Prettier, Husky + lint-staged (ESLint and Prettier on staged files before each commit)

## Prerequisites

- [Bun](https://bun.sh/) — the package manager and script runner. CI uses 1.4.2
- [Node.js](https://nodejs.org/) 20.9 or newer — Next.js itself runs on Node, including when started through `bun run`. CI uses Node 24

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

3. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   bun run dev
   ```

## Scripts

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `bun run dev`        | Start dev server (Next.js)    |
| `bun run build`      | Production build              |
| `bun run start`      | Run production server         |
| `bun run lint`       | Run ESLint                    |
| `bun run typecheck`  | Type-check with TypeScript    |
| `bun run test`       | Run unit tests (Vitest)       |
| `bun run test:watch` | Run unit tests in watch mode  |
| `bun run test:e2e`   | Run the Playwright smoke test |

The smoke test builds and starts the app itself and reads live data from the Kitsu API. Install its browser once with `bunx playwright install chromium`.

## Pre-commit hook

`bun install` sets up a Git pre-commit hook (Husky). It runs `eslint --fix` and Prettier on staged `.ts`/`.tsx` files and Prettier on other staged files, and blocks the commit if ESLint reports an error.

The hook runs `bunx`, so `bun` must be on the `PATH` of whatever runs Git. If a Git client reports `bunx: command not found`, add the path in `~/.config/husky/init.sh`, for example `export PATH="$HOME/.bun/bin:$PATH"`.

## Continuous integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and a production build on every pull request and on pushes to `master`.

## Project layout

| Path                         | Role                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `src/pages/`                 | Routes: `index` (home), `search`, `details/[id]`, `related/[slug]`                      |
| `src/pages/_app.tsx`         | App shell: MUI theme and colour schemes, TanStack Query provider, global styles         |
| `src/pages/_document.tsx`    | HTML document: server-side MUI styles and the script that applies the saved colour mode |
| `src/components/`            | Layout, header, footer, anime cards and grid, pagination, theme toggle                  |
| `src/components/search/`     | Search form and its inputs                                                              |
| `src/helpers/request.ts`     | `kitsuGet`, the `fetch` wrapper for the Kitsu API, and `KitsuRequestError`              |
| `src/helpers/queries.ts`     | TanStack Query options for every Kitsu request (trending, details, episodes, search...) |
| `src/helpers/queryClient.ts` | Creates the `QueryClient` and sets the 3000 ms cache time                               |
| `src/hooks/`                 | `useInfiniteScroll`, used by the details and related pages                              |
| `src/constants.ts`           | Search filter options, page size, revalidation times                                    |
| `src/types.ts`               | Types for Kitsu API responses and search fields                                         |
| `e2e/`                       | Playwright smoke test                                                                   |
| `public/`                    | Static assets                                                                           |

Imports use the `@/` alias for `src/` (for example `@/helpers/queries`). Unit tests sit next to the code they cover as `*.test.ts(x)`; keep them out of `src/pages/`, where every file becomes a route.

Remote images are allowed from `media.kitsu.io` (see `next.config.js`).

## License

Private project (`"private": true` in `package.json`).
