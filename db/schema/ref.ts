/**
 * db/schema/ref.ts — administrative reference tables (PRD §4 menu 10) plus the two
 * lookups reconstructed from legacy PHP (§6.6).
 *
 * Conversions applied here:
 *   · enum('y','n') aktif           → boolean
 *   · enum('0','1') ref_kabupaten.kota → boolean
 *   · float(10,6) lat/lng           → numeric(10,6)
 *   · camatid char(7) vs char(10)   → varchar(10) everywhere (§6.3)
 *   · ajis_propinsi                 → dropped, duplicate of ref_propinsi (§6.5)
 *   · pekerjaan                     → ref_pekerjaan (§6.6)
 *   · ajis_fungsi_struktur          → ref_fungsi_struktur (§6.6)
 *   · UNIQUE KEY kid / pid          → dropped, redundant left-prefix of the PK (§7.1)
 *
 * Every table has a surrogate `id` identity PK; the legacy code (`propid`, `kabid`,
 * `camatid`, `desaid`, `kerjaid`) is kept as NOT NULL UNIQUE and remains the FK
 * target, so the hierarchy still joins on the codes the rest of the world uses.
 */
import { boolean, date, index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { coord, audit, pk } from './_shared';

export const refPropinsi = pgTable('ref_propinsi', {
  id: pk(),
  propid: varchar('propid', { length: 4 }).notNull().unique(),
  propinsi: varchar('propinsi', { length: 50 }).notNull(),
  ibukota: varchar('ibukota', { length: 50 }),
  aktif: boolean('aktif').notNull().default(true),
});

export const refKabupaten = pgTable(
  'ref_kabupaten',
  {
    id: pk(),
    kabid: varchar('kabid', { length: 4 }).notNull().unique(),
    propid: varchar('propid', { length: 4 })
      .notNull()
      .references(() => refPropinsi.propid),
    kabupaten: varchar('kabupaten', { length: 50 }).notNull(),
    // enum('0','1') → boolean: true = kota, false = kabupaten
    kota: boolean('kota').notNull().default(false),
    ibukota: varchar('ibukota', { length: 50 }),
    oid: varchar('oid', { length: 10 }),
    aktif: boolean('aktif').notNull().default(true),
    lat: coord('lat'),
    lng: coord('lng'),
    updated: timestamp('updated', { withTimezone: true }),
  },
  (t) => [index('ref_kabupaten_propid_idx').on(t.propid)],
);

export const refKecamatan = pgTable(
  'ref_kecamatan',
  {
    id: pk(),
    camatid: varchar('camatid', { length: 10 }).notNull().unique(),
    namaKecamatan: varchar('nama_kecamatan', { length: 50 }).notNull(),
    kodepos: varchar('kodepos', { length: 10 }),
    kabid: varchar('kabid', { length: 4 })
      .notNull()
      .references(() => refKabupaten.kabid),
    aktif: boolean('aktif').notNull().default(true),
    updated: date('updated'),
  },
  (t) => [index('ref_kecamatan_kabid_idx').on(t.kabid)],
);

export const refDesa = pgTable(
  'ref_desa',
  {
    id: pk(),
    desaid: varchar('desaid', { length: 10 }).notNull().unique(),
    namaDesa: varchar('nama_desa', { length: 50 }).notNull(),
    // enum('y','n') → boolean: true = kelurahan, false = desa
    kelurahan: boolean('kelurahan').notNull().default(false),
    // char(7) in legacy vs char(10) on ref_kecamatan — widened so the FK works (§6.3)
    camatid: varchar('camatid', { length: 10 })
      .notNull()
      .references(() => refKecamatan.camatid),
    aktif: boolean('aktif').notNull().default(true),
    propid: varchar('propid', { length: 4 }),
    kabid: varchar('kabid', { length: 4 }),
    nomorIndukDesa: varchar('nomor_induk_desa', { length: 50 }),
  },
  (t) => [index('ref_desa_camatid_idx').on(t.camatid)],
);

/** Reconstructed from modules/ajis/class/ClassPekerjaan.php (§6.6). */
export const refPekerjaan = pgTable('ref_pekerjaan', {
  id: pk(),
  kerjaid: varchar('kerjaid', { length: 3 }).notNull().unique(),
  pekerjaan: varchar('pekerjaan', { length: 100 }).notNull(),
  aktif: boolean('aktif').notNull().default(true),
});

/**
 * Was ajis_fungsi_struktur; excluded from the dump's INSERTs, reconstructed from
 * AjisClassIfa.php (§6.6).
 *
 * `id_fungsi_struktur` was `int(16) NOT NULL AUTO_INCREMENT` in the legacy DDL
 * (refs/sipc_ijf_sample.sql:179) — a surrogate auto-increment, so it is the identity
 * PK here. There is no separate natural key to preserve: `nama_fungsi_struktur` was
 * already UNIQUE and stays that way.
 */
export const refFungsiStruktur = pgTable('ref_fungsi_struktur', {
  idFungsiStruktur: pk('id_fungsi_struktur'),
  kodeFungsi: varchar('kode_fungsi', { length: 5 }).notNull(),
  namaFungsiStruktur: varchar('nama_fungsi_struktur', { length: 30 }).notNull().unique(),
  // legacy varchar(10) holding 'y'/'n' (§6.2 row 5)
  aktif: boolean('aktif').notNull().default(true),
  ...audit(),
});
