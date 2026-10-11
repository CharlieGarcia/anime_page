import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import * as schema from './schema';

// Any Postgres-backed Drizzle database with this schema. The app uses node-postgres;
// tests use an in-memory database.
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

// Kept on globalThis so dev-server reloads reuse one connection pool
const globalForDb = globalThis as typeof globalThis & { __db?: Database };

// Created on first use, so importing this module never needs DATABASE_URL (the build does not have one)
export function getDb(): Database {
  if (!globalForDb.__db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Copy it from .env-template to .env.local.'
      );
    }
    globalForDb.__db = drizzle(new Pool({ connectionString }), { schema });
  }
  return globalForDb.__db;
}
