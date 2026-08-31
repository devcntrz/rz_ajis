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
```

Two rules the tooling enforces rather than documents:

- **Never edit an applied migration.** `scripts/migrate.mjs` hashes each file against
  the `ajis_migrations` ledger and aborts on drift. Add a new migration instead.
- **Never `drizzle-kit push`.** It applies DDL behind the journal's back. There is
  deliberately no `db:push` script.

## Current state

Applied through `0011_opname_natural_key`: 40 tables, 5 materialized views,
`pg_trgm` + `btree_gin`.

Migrations `0006`–`0010` are the matviews replacing the legacy nested-view chain
(§8): `mv_donasi_bulanan`, `mv_penyaluran_bulanan`, `mv_zisco_agregat`,
`mv_donatur_agregat`, `mv_rekap_transaksi_bulanan`. Each has a UNIQUE index so
`REFRESH ... CONCURRENTLY` works; nothing schedules the refresh yet (that is
QStash, PRD §10.6).

## Outstanding

### 1. Stale seed rows (~58 rows, 12 tables)

The first seed run used a fixture parser that left a leading space on every value
after the first (`" Papua"` instead of `"Papua"`). The parser is fixed and
`db/seed/*.json` is correct, but the rows already in the database are not, and
`ON CONFLICT DO NOTHING` will not overwrite them.

Affected: `ref_propinsi`, `ref_pekerjaan`, `kantor`, `ajis_kantor`, `map_kantor`,
`ajis_group_user`, `ajis_user`, `ajis_harga`, `ajis_item_hafalan`, `ajis_peminjam`,
`materi`, `app_setting`.

To fix, delete those rows and re-run `npm run db:seed`. Deliberately not done yet:
`.env.local` is a `vercel env pull` of the **production** environment, so
`DATABASE_URL` points at the production Neon branch. Preferably create a Neon dev
branch first and point `DATABASE_URL_UNPOOLED` at it.

### 2. Orphaned fixture rows are expected

With 5 sampled rows per table a child's parent is often not among the parent's 5
rows, so many child rows are reported skipped on FK violation. That is correct
behaviour — `scripts/seed.mjs` reports counts rather than synthesising placeholder
parents, which would create fake data that misleads UI work.

One genuinely corrupt source row exists: `ref_kecamatan` has `camatid = 'Kab Pale'`.

### 3. Mojibake in the source dump

`refs/sipc_ijf_sample.sql` contains `Qurâ€™an` — a UTF-8 right single quote read as
latin1 before the dump was written. Fixtures reproduce it verbatim and
`db:fixtures` warns about it. The migration-day ETL (§13) must transcode properly;
this dump is not evidence that transcoding is unnecessary.

### 4. Open schema questions (PRD)

- **`manual_laporan_lama`** (§6.6): DDL absent from the dump and referenced by no
  surviving code. `manual_laporan` carries `versi_struktur` so the merge is
  possible, but any columns unique to the old structure are not represented yet.
  Needs `SHOW CREATE TABLE` from the legacy server.
- **`ajis_pembinaan_baru` partitioning**: ±4.48M rows and growing. The PRD does not
  address partitioning, and this is the one table where retrofitting
  `PARTITION BY RANGE (tahun)` after go-live is genuinely painful.
