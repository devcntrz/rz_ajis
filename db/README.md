# db/ — Neon Postgres schema, migrations, seed

Target architecture: PRD §6 (schema conversion), §7 (indexing), §8 (view → matview map).

```
db/schema/*.ts     Drizzle schema — MIGRATION INPUT ONLY, never imported at runtime
db/migrations/     Generated + hand-written SQL + meta/_journal.json
db/seed/*.json     Reviewed fixtures, produced from refs/sipc_ijf_sample.sql
```

## Commands

```bash
npm run db:generate      # diff db/schema → a new migration
npm run db:custom        # empty, journal-registered migration for hand-written SQL
npm run db:migrate       # apply pending migrations (re-running is a no-op)
npm run db:migrate:dry   # list what would be applied
npm run db:fixtures      # regenerate db/seed/*.json from the legacy dump
npm run db:seed          # load fixtures (idempotent)
npm run db:reseed        # TRUNCATE then load — refuses non-dev databases
npm run db:fix-sequences # resync identity sequences to max(id)
npm run db:fix-sequences -- --check   # report drift, exit 1, change nothing
```

Two rules the tooling enforces rather than documents:

- **Never edit an applied migration.** `scripts/migrate.mjs` hashes each file against
  the `ajis_migrations` ledger and aborts on drift. Add a new migration instead.
- **Never `drizzle-kit push`.** It applies DDL behind the journal's back. There is
  deliberately no `db:push` script.

## Primary keys and sequences

Every table's PK is `bigint GENERATED ALWAYS AS IDENTITY`. There are **no `serial`
or `bigserial` columns anywhere**, including the `ajis_migrations` ledger.

**Natural/business keys are not primary keys.** They are `NOT NULL UNIQUE`, and
foreign keys reference them directly — Postgres allows an FK onto any UNIQUE column.
So `ajis_anak.id_anak` is still what eight other tables join on, `ajis_kantor.oid`
is still the office key, and `id_pemasangan_baru` is still the pairing key. The
practical consequence: **the migration-day ETL never has to translate ids.**

This uniformity goes beyond PRD §6.4, which names only 11 tables for
natural→surrogate conversion. Extending it to all 41 was a deliberate decision, not
drift — do not "correct" it back.

### Why `GENERATED ALWAYS` and not `bigserial`

1. The sequence belongs to the column rather than existing as a separate object, so
   it cannot be orphaned or left behind by a partial restore.
2. An INSERT carrying its own id is **rejected** unless it says
   `OVERRIDING SYSTEM VALUE`. A sequence can only fall behind if something supplies
   its own ids, so this makes every such place explicit and greppable — currently
   `scripts/seed.mjs`, and later the ETL.
3. It is the SQL-standard spelling; `serial` is a PostgreSQL legacy form.

### Restore runbook

`pg_dump`/`pg_restore` of a whole database already emits `setval` for every
sequence, so an ordinary restore needs nothing extra. The paths that **do** need
attention are the ones that load rows with ids of their own:

| After… | Run |
|---|---|
| `pg_restore` / `psql` of a dump | `npm run db:fix-sequences -- --check` |
| `COPY` / CSV import, the ETL (§13) | `npm run db:fix-sequences` |
| Neon branch restore or PITR | `npm run db:fix-sequences -- --check` |
| `npm run db:seed` | nothing — it resyncs itself |

`--check` exits 1 and names each table whose next id would collide, so it is safe to
wire into CI or a post-restore step. Both modes read the identity columns from
`pg_catalog`, never from a hand-kept list, so they stay correct as tables are added.

Verified end to end: truncating a table, reloading its rows with their original ids
and no `setval`, then running `--check` correctly reports
`ref_pekerjaan.id next=1 max=5 (5 ids would collide)`; after `db:fix-sequences` the
next ordinary INSERT gets id 6.

## Current state

Applied through `0006_mv_rekap_transaksi_bulanan`: 41 tables, 5 materialized views,
`pg_trgm` + `btree_gin`, 42 identity sequences, 35 foreign keys.

Migrations `0002`–`0006` are the matviews replacing the legacy nested-view chain
(§8): `mv_donasi_bulanan`, `mv_penyaluran_bulanan`, `mv_zisco_agregat`,
`mv_donatur_agregat`, `mv_rekap_transaksi_bulanan`. Each has a UNIQUE index so
`REFRESH ... CONCURRENTLY` works; nothing schedules the refresh yet (that is
QStash, PRD §10.6).

## Outstanding

### 1. Orphaned fixture rows are expected

With 5 sampled rows per table a child's parent is often not among the parent's 5
rows, so many child rows are reported skipped on FK violation. That is correct
behaviour — `scripts/seed.mjs` reports counts rather than synthesising placeholder
parents, which would create fake data that misleads UI work.

One genuinely corrupt source row exists: `ref_kecamatan` has `camatid = 'Kab Pale'`.

### 2. Mojibake in the source dump

`refs/sipc_ijf_sample.sql` contains `Qurâ€™an` — a UTF-8 right single quote read as
latin1 before the dump was written. Fixtures reproduce it verbatim and
`db:fixtures` warns about it. The migration-day ETL (§13) must transcode properly;
this dump is not evidence that transcoding is unnecessary.

### 3. Open schema questions (PRD)

- **`manual_laporan_lama`** (§6.6): DDL absent from the dump and referenced by no
  surviving code. `manual_laporan` carries `versi_struktur` so the merge is
  possible, but any columns unique to the old structure are not represented yet.
  Needs `SHOW CREATE TABLE` from the legacy server.
- **`ajis_pembinaan_baru` partitioning**: ±4.48M rows and growing. The PRD does not
  address partitioning, and this is the one table where retrofitting
  `PARTITION BY RANGE (tahun)` after go-live is genuinely painful.
