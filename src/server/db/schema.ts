import { sql } from 'drizzle-orm';
import { TOP_ANIME_MAX } from '@/constants';
import {
  boolean,
  check,
  index,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  // The Clerk user id; Clerk owns credentials and sessions
  id: text('id').primaryKey(),
  // Null until the user picks one
  username: text('username').unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio').notNull().default(''),
  // Whether anyone can see this user's watch list on their public profile
  watchListPublic: boolean('watch_list_public').notNull().default(true),
  // Whether anyone can see this user's top 10 on their public profile
  topAnimePublic: boolean('top_anime_public').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});

// Stored as plain text (checked in watchList.ts) rather than a Postgres enum,
// so a status can be added later without ALTER TYPE
export const WATCH_LIST_STATUSES = ['planned', 'watched'] as const;
export type WatchListStatus = (typeof WATCH_LIST_STATUSES)[number];

// One anime on a user's watch list. The title, poster and subtype are a snapshot
// taken from Kitsu when it was added, so lists render without calling Kitsu.
export const watchListItems = pgTable(
  'watch_list_items',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The Kitsu anime id
    animeId: text('anime_id').notNull(),
    status: text('status')
      .$type<WatchListStatus>()
      .notNull()
      .default('planned'),
    title: text('title').notNull(),
    posterUrl: text('poster_url'),
    subtype: text('subtype'),
    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.animeId] }),
    index('watch_list_items_user_added_idx').on(table.userId, table.addedAt)
  ]
);

// One rank of a user's top 10. Ranks run from 1 with no gaps (topAnime.ts keeps
// them that way). The title, poster and subtype are a snapshot taken from Kitsu
// when the anime was added, so the list renders without calling Kitsu.
export const topAnime = pgTable(
  'top_anime',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rank: smallint('rank').notNull(),
    // The Kitsu anime id
    animeId: text('anime_id').notNull(),
    title: text('title').notNull(),
    posterUrl: text('poster_url'),
    subtype: text('subtype')
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.rank] }),
    unique('top_anime_user_anime_unique').on(table.userId, table.animeId),
    check(
      'top_anime_rank_range',
      sql`${table.rank} BETWEEN 1 AND ${sql.raw(String(TOP_ANIME_MAX))}`
    )
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WatchListItemRow = typeof watchListItems.$inferSelect;
export type TopAnimeRow = typeof topAnime.$inferSelect;
