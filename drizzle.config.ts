/**
 * drizzle.config.ts — schema-to-migration generation ONLY.
 *
 * Drizzle is never imported at runtime (PRD §2.1 rule 1). Route handlers use raw
 * parameterized SQL via lib/pg.ts. The TS schema under db/schema/ exists solely so
 * `drizzle-kit generate` can diff it and emit SQL into db/migrations/.
 *
 * Never run `drizzle-kit push` — it applies DDL directly and desyncs the journal
 * from what scripts/migrate.mjs believes has been applied.
 */
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit spawns its own process, so `node --env-file` cannot reach it.
loadEnvFile('.env.local');

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema/index.ts',
  out: './db/migrations',
  // Legacy column names are already snake_case; declare columns in camelCase and
  // let drizzle derive the SQL name rather than writing every name twice.
  casing: 'snake_case',
  // Emits `--> statement-breakpoint`, which scripts/migrate.mjs splits on.
  breakpoints: true,
  strict: true,
  verbose: true,
  dbCredentials: {
    // DDL and introspection go direct, never through the Neon pooler.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
  migrations: {
    table: 'ajis_migrations',
    schema: 'public',
  },
});
