#!/usr/bin/env node
/**
 * scripts/fix-sequences.mjs — keep identity sequences in step with stored data.
 *
 *   npm run db:fix-sequences              resync every identity sequence to max(id)
 *   npm run db:fix-sequences -- --check   report drift and exit 1; change nothing
 *
 * RUN THIS AFTER any load that supplies its own ids:
 *   · pg_restore / psql of a dump
 *   · COPY or CSV import (the migration-day ETL, PRD §13)
 *   · a Neon branch restore
 *   · npm run db:seed (which already calls the same logic itself)
 *
 * Background: every PK in this schema is `GENERATED ALWAYS AS IDENTITY`, so a row
 * can only carry a caller-supplied id via `OVERRIDING SYSTEM VALUE`. That makes
 * the risky paths explicit and greppable — but the sequence still has to be told
 * afterwards, which is what this does.
 *
 * `--check` is the one to wire into a post-restore step or CI: it fails loudly
 * rather than leaving a landmine for the next INSERT.
 */
import pg from 'pg';
import { inspectSequences, resyncSequences } from './lib/sequences.mjs';

const CHECK_ONLY = process.argv.includes('--check');

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const client = new pg.Client({ connectionString });
await client.connect();

let exitCode = 0;
try {
  const before = await inspectSequences(client);
  const drifted = before.filter((s) => s.drifted);

  if (CHECK_ONLY) {
    if (drifted.length === 0) {
      console.log(`✓ ${before.length} sequence(s) in sync`);
    } else {
      console.error(`✗ ${drifted.length} of ${before.length} sequence(s) behind their data:\n`);
      for (const s of drifted) {
        console.error(
          `  ${s.table}.${s.column}`.padEnd(46) +
            `next=${s.nextValue}  max=${s.maxId}  (${s.maxId - s.nextValue + 1} id(s) would collide)`,
        );
      }
      console.error('\nRun `npm run db:fix-sequences` to resync.');
      exitCode = 1;
    }
  } else {
    await client.query('BEGIN');
    const changed = await resyncSequences(client);
    await client.query('COMMIT');

    if (drifted.length) {
      console.log(`Resynced ${drifted.length} drifted sequence(s):`);
      for (const s of drifted) {
        const now = changed.find((c) => c.table === s.table && c.column === s.column);
        console.log(`  ${`${s.table}.${s.column}`.padEnd(44)} ${s.nextValue} → ${now.value + 1}`);
      }
    }
    console.log(`✓ ${changed.length} sequence(s) in sync`);
  }
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(err.message);
  exitCode = 1;
} finally {
  await client.end();
}

process.exit(exitCode);
