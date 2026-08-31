#!/usr/bin/env node
/**
 * scripts/migrate.mjs — applies db/migrations/*.sql in journal order, exactly once each.
 *
 *   npm run db:migrate         apply pending migrations
 *   npm run db:migrate:dry     list what would be applied, change nothing
 *
 * Idempotence here is file-level, not statement-level. Postgres has transactional
 * DDL, so a failure partway through a file rolls back completely and the file
 * re-applies cleanly next run. That is why the generated SQL does NOT need
 * `IF NOT EXISTS` bolted on — doing so would turn "this migration already ran"
 * into "this statement silently did nothing", hiding half-applied state.
 *
 * The db/migrations folder and meta/_journal.json stay in drizzle-kit's native
 * format so `db:generate` and `db:check` keep working. Only the *applying* is ours.
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import pg from 'pg';

const MIGRATIONS_DIR = path.resolve('db/migrations');
const JOURNAL = path.join(MIGRATIONS_DIR, 'meta/_journal.json');
const LOCK_KEY = 47110001; // arbitrary but stable; guards concurrent deploys
const DRY_RUN = process.argv.includes('--dry-run');

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error('DATABASE_URL_UNPOOLED is required for migrations');
}
// Advisory locks are session-scoped; under PgBouncer transaction pooling the lock
// and the DDL can land on different backends. Refuse the pooled host outright.
if (/-pooler\./.test(connectionString)) {
  throw new Error('Refusing to migrate through the Neon pooler — use DATABASE_URL_UNPOOLED');
}

const client = new pg.Client({ connectionString, statement_timeout: 0 });
await client.connect();

let failed = false;
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ajis_migrations (
      id          bigserial PRIMARY KEY,
      tag         text NOT NULL UNIQUE,
      hash        text NOT NULL,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )`);

  await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

  const journal = JSON.parse(await readFile(JOURNAL, 'utf8'));
  const { rows: applied } = await client.query('SELECT tag, hash FROM ajis_migrations');
  const appliedByTag = new Map(applied.map((r) => [r.tag, r.hash]));

  let pending = 0;

  for (const entry of [...journal.entries].sort((a, b) => a.idx - b.idx)) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, `${entry.tag}.sql`), 'utf8');
    const hash = createHash('sha256').update(sql).digest('hex');
    const prev = appliedByTag.get(entry.tag);

    if (prev !== undefined) {
      if (prev !== hash) {
        throw new Error(
          `Migration ${entry.tag} changed after it was applied (hash drift).\n` +
            'Never edit an applied migration — add a new one instead.',
        );
      }
      console.log(`· skip  ${entry.tag}`);
      continue;
    }

    // Escape hatch for CREATE INDEX CONCURRENTLY / VACUUM, which cannot run
    // inside a transaction block.
    const noTx = /^--\s*transaction:\s*off/m.test(sql);
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    pending++;
    console.log(
      `▸ apply ${entry.tag} (${statements.length} statement${statements.length === 1 ? '' : 's'}${noTx ? ', no transaction' : ''})`,
    );
    if (DRY_RUN) continue;

    if (!noTx) await client.query('BEGIN');
    try {
      for (const stmt of statements) await client.query(stmt);
      // Ledger row lands in the same transaction as the DDL — no window where
      // one applied and the other didn't.
      await client.query(
        'INSERT INTO ajis_migrations (tag, hash) VALUES ($1, $2) ON CONFLICT (tag) DO NOTHING',
        [entry.tag, hash],
      );
      if (!noTx) await client.query('COMMIT');
    } catch (err) {
      if (!noTx) await client.query('ROLLBACK').catch(() => {});
      throw new Error(`Migration ${entry.tag} failed: ${err.message}`, { cause: err });
    }
  }

  if (DRY_RUN) {
    console.log(`✓ dry run: ${pending} migration(s) pending`);
  } else {
    console.log(`✓ migrations up to date (${pending} applied this run)`);
  }
} catch (err) {
  failed = true;
  console.error(err.message);
} finally {
  await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
  await client.end();
}

if (failed) process.exit(1);
