# anime_page

A [Next.js](https://nextjs.org/) web app for browsing anime. It uses the [Kitsu JSON:API](https://kitsu.docs.apiary.io/#introduction/json:api) for listings, search filters, show details (including episodes), and related titles by category.

## Features

- **Home** — Trending anime (server-rendered)
- **Browse** (`/search`) — Filter by season, year, status, categories, subtype, age rating; sort and paginate results
- **Details** (`/details/[id]`) — Synopsis, metadata, genres, and episodes with infinite scroll
- **Related** (`/related/[slug]`) — Anime sharing a category/genre slug, with infinite scroll
- **Theme** — Light/dark mode (toggle in the header; preference stored in `localStorage`, with system preference as default)

## Stack

- **Framework:** Next.js 16 (Pages Router)
- **UI:** React 19, [MUI](https://mui.com/) (Emotion), Roboto via `@fontsource/roboto`
- **Data:** [axios](https://axios-http.com/) against the Kitsu API
- **Tooling:** ESLint, Prettier, Husky + lint-staged (Prettier on staged files)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root and set the Kitsu API base URL:

   ```bash
   NEXT_PUBLIC_API_ENDPOINT=https://kitsu.io/api/edge
   ```

   The app builds request URLs as `${NEXT_PUBLIC_API_ENDPOINT}` plus paths such as `/trending/anime` and `/anime`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Next.js) |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |
| `npm run lint` | Run ESLint               |

Open [http://localhost:3000](http://localhost:3000) when using `npm run dev`.

## Project layout

| Path            | Role |
| --------------- | ---- |
| `pages/`        | Routes (`index`, `search`, `details/[id]`, `related/[slug]`) |
| `components/`   | Layout, cards, search form, pagination, etc. |
| `helpers/request.js` | Axios wrapper for the Kitsu API |
| `context/theme.js` | Dark/light toggle context |
| `constants.js`  | Season, status, sort, and filter enums for browse |

Remote images are allowed from `media.kitsu.io` (see `next.config.js`).

## License

Private project (`"private": true` in `package.json`).
