#!/usr/bin/env node
/**
 * scripts/seed.mjs — loads db/seed/*.json into Neon.
 *
 *   npm run db:seed        insert what is missing; running twice is a no-op
 *   npm run db:reseed      TRUNCATE first, then insert (dev databases only)
 *
 * Knows nothing about MySQL. Every conversion decision was made and reviewed in
 * db/seed/*.json by scripts/dump-to-fixtures.mjs.
 *
 * Two properties worth stating:
 *
 * 1. Idempotent. Each row is inserted with ON CONFLICT <natural key> DO NOTHING.
 *    Sequences are corrected at the end, because ON CONFLICT still burns a
 *    nextval — ten runs of a 5-row seed would otherwise leave a sequence at ~50.
 *    The correction is the same code fix-sequences.mjs runs; there is one
 *    implementation, in scripts/lib/sequences.mjs.
 *
 * 1a. Fixtures that carry a legacy id (ajis_pembinaan_baru.id_row = 4479886, and
 *    11 others) insert it verbatim with OVERRIDING SYSTEM VALUE — every PK is
 *    GENERATED ALWAYS, so Postgres would otherwise reject the value. Preserving the
 *    legacy id keeps sample rows traceable back to the dump, and exercises exactly
 *    the path the migration-day ETL will use.
 *
 * 2. Orphans are expected, not a failure. With only 5 sampled rows per table, a
 *    child row's parent frequently is not among the parent's 5 rows. Those rows
 *    are skipped and reported. Synthesising placeholder parents would produce
 *    fake data that misleads UI development, so we do not.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { identityColumns, resyncSequences } from './lib/sequences.mjs';

const SEED_DIR = path.resolve('db/seed');
const TRUNCATE = process.argv.includes('--truncate');

/**
 * FK dependency order. Deliberately explicit rather than deferring constraints —
 * the migration-day ETL (PRD §13) reuses this ordering, so it is worth having as
 * a tested artefact.
 */
const ORDER = [
  'ref_propinsi', 'ref_kabupaten', 'ref_kecamatan', 'ref_desa',
  'ref_pekerjaan', 'ref_fungsi_struktur',
  'kantor', 'ajis_kantor', 'map_kantor', 'app_setting',
  'ajis_wilayah_pembinaan', 'sdm_wilayah', 'sdm_penugasan',
  'ajis_semester', 'setting_program', 'ajis_harga',
  'ajis_item_penilaian', 'ajis_item_hafalan',
  'ajis_group_user', 'ajis_user',
  'ajis_anak', 'ajis_data_prestasi',
  'ajis_pemasangan', 'ajis_pemasangan_log', 'ajis_opname',
  'ajis_input_donasi', 'ajis_penyaluran', 'transaksi',
  'ajis_pembinaan_baru', 'ajis_dokumentasi_pembinaan', 'ajis_hafalan',
  'ajis_penilaian', 'ajis_survey',
  'ajis_peminjam', 'ajis_peminjaman_anak',
  'manual_laporan', 'manual_laporan_pembinaan', 'manual_laporan_prestasi', 'materi',
  'ajis_view_ajuan',
];

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

if (TRUNCATE) {
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('Refusing to truncate: VERCEL_ENV is production');
  }
  if (!/neon\.tech|localhost|127\.0\.0\.1/.test(connectionString)) {
    throw new Error('Refusing to truncate: connection string is not a recognised dev database');
  }
}

const files = (await readdir(SEED_DIR)).filter((f) => f.endsWith('.json'));
const fixtures = new Map();
for (const f of files) {
  const data = JSON.parse(await readFile(path.join(SEED_DIR, f), 'utf8'));
  fixtures.set(data.table, data);
}

const unordered = [...fixtures.keys()].filter((t) => !ORDER.includes(t));
if (unordered.length) {
  throw new Error(
    `Fixture(s) missing from the ORDER array — insert position is undefined: ${unordered.join(', ')}`,
  );
}

const client = new pg.Client({ connectionString });
await client.connect();

const inserted = [];
const orphans = [];
let failed = false;

try {
  await client.query('BEGIN');

  if (TRUNCATE) {
    const present = ORDER.filter((t) => fixtures.has(t));
    await client.query(
      `TRUNCATE ${present.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
    );
    console.log(`· truncated ${present.length} tables`);
  }

  // Which column of each table is GENERATED ALWAYS — read once, from the catalog.
  const identityByTable = new Map(
    (await identityColumns(client)).map((c) => [c.table, c.column]),
  );

  for (const table of ORDER) {
    const fixture = fixtures.get(table);
    if (!fixture) continue;

    let ok = 0;
    let skipped = 0;
    const reasons = new Map();
    const identityCol = identityByTable.get(table);

    for (const row of fixture.rows) {
      const cols = Object.keys(row);
      if (!cols.length) continue;
      // A GENERATED ALWAYS column rejects a supplied value unless we say otherwise.
      const overriding = identityCol && cols.includes(identityCol)
        ? 'OVERRIDING SYSTEM VALUE '
        : '';
      const sql =
        `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')}) ` +
        `${overriding}VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) ` +
        `ON CONFLICT ${fixture.conflict} DO NOTHING`;
      const params = cols.map((c) => {
        const v = row[c];
        // jsonb wants a JSON string, not a JS object, through the text protocol
        return v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
      });

      // Per-row savepoint: one orphan must not abort the whole file.
      await client.query('SAVEPOINT row');
      try {
        const res = await client.query(sql, params);
        await client.query('RELEASE SAVEPOINT row');
        ok += res.rowCount ?? 0;
      } catch (err) {
        await client.query('ROLLBACK TO SAVEPOINT row');
        skipped++;
        const key =
          err.code === '23503'
            ? `missing parent (${err.constraint ?? 'fk'})`
            : `${err.code}: ${err.message.split('\n')[0]}`;
        reasons.set(key, (reasons.get(key) ?? 0) + 1);
      }
    }

    inserted.push([table, ok, fixture.rows.length]);
    if (skipped) orphans.push([table, skipped, reasons]);
  }

  // Fixtures that carry legacy ids bypass the sequence entirely, and ON CONFLICT
  // DO NOTHING still burns a nextval on every re-run. Both leave sequences out of
  // step with the data, so resync before committing. Same code as db:fix-sequences.
  await resyncSequences(client);

  await client.query('COMMIT');
} catch (err) {
  failed = true;
  await client.query('ROLLBACK').catch(() => {});
  console.error(err.message);
} finally {
  await client.end();
}

if (!failed) {
  console.log('\nSeeded:');
  for (const [t, ok, total] of inserted) {
    const note = ok === 0 && total > 0 ? '  (already present)' : '';
    console.log(`  ${t.padEnd(28)} ${String(ok).padStart(3)}/${total}${note}`);
  }
  if (orphans.length) {
    console.log('\nSkipped rows (expected with a 5-row-per-table sample):');
    for (const [t, n, reasons] of orphans) {
      console.log(`  ${t.padEnd(28)} ${n} row(s)`);
      for (const [why, count] of reasons) console.log(`      ${count}× ${why}`);
    }
  }
  console.log('\n✓ seed complete');
}

process.exit(failed ? 1 : 0);
