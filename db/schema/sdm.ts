/**
 * db/schema/sdm.ts — regions and the people assigned to them.
 *
 * Conversions:
 *   · ajis_sdm_wilayah         → sdm_wilayah, biodata parent table (§6.5)
 *   · ajis_jabatan_sdm         → sdm_penugasan, the assignment record (§6.5)
 *   · id_sdm int vs varchar(50) on ajis_anak → bigint everywhere + FK (§6.3)
 *   · id_wilayah_pembinaan int(2)/varchar(16)/varchar(50) → bigint + FK (§6.3)
 *   · PK (id_wilayah_pembinaan, nama_wilayah) → identity PK, nama_wilayah UNIQUE (§6.4)
 *   · aktif varchar(10) holding y/n → boolean (§6.2 row 5)
 *   · keaktifan_edukasi / status_approve enum('y','t') → varchar(1) + CHECK,
 *     NOT boolean: 't' means pending (§6.2)
 *   · redundant KEY id_sdm dropped (§7.1)
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  index,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { STATUS_APPROVE, KEAKTIFAN_EDUKASI, JNS_KEL } from '../../lib/enums';
import { audit, checkOneOfNullable, fk, kantorId, pk } from './_shared';
import { ajisKantor } from './kantor';
import { refFungsiStruktur } from './ref';

export const ajisWilayahPembinaan = pgTable(
  'ajis_wilayah_pembinaan',
  {
    idWilayahPembinaan: pk('id_wilayah_pembinaan'),
    namaWilayah: varchar('nama_wilayah', { length: 100 }).notNull().unique(),
    alamatWilayah: text('alamat_wilayah'),
    kantorId: kantorId().references(() => ajisKantor.oid),
    namaKantor: varchar('nama_kantor', { length: 30 }),
    // enum('y','t') — 't' is pending approval, not false
    statusApprove: varchar('status_approve', { length: 1 }),
    propid: varchar('propid', { length: 4 }),
    namaPropinsi: varchar('nama_propinsi', { length: 30 }),
    kabid: varchar('kabid', { length: 4 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 30 }),
    camatid: varchar('camatid', { length: 10 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 30 }),
    desaid: varchar('desaid', { length: 10 }),
    namaDesa: varchar('nama_desa', { length: 30 }),
    aktif: boolean('aktif').notNull().default(true),
    ...audit(),
  },
  (t) => [
    index('ajis_wilayah_kantor_idx').on(t.kantorId).where(sql`aktif`),
    checkOneOfNullable('ajis_wilayah_status_approve_check', 'status_approve', STATUS_APPROVE),
  ],
);

/** Was ajis_sdm_wilayah — biodata only; assignments moved to sdm_penugasan. */
export const sdmWilayah = pgTable(
  'sdm_wilayah',
  {
    idSdm: pk('id_sdm'),
    nik: varchar('nik', { length: 50 }).unique(),
    namaLengkap: varchar('nama_lengkap', { length: 100 }),
    jenisKelamin: varchar('jenis_kelamin', { length: 1 }),
    alamat: varchar('alamat', { length: 100 }),
    propid: varchar('propid', { length: 4 }),
    namaPropinsi: varchar('nama_propinsi', { length: 40 }),
    kabid: varchar('kabid', { length: 4 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 40 }),
    camatid: varchar('camatid', { length: 10 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 40 }),
    desaid: varchar('desaid', { length: 10 }),
    namaDesa: varchar('nama_desa', { length: 40 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 5 }),
    tglBergabung: date('tgl_bergabung'),
    tglKeluar: date('tgl_keluar'),
    telp: varchar('telp', { length: 15 }),
    hp: varchar('hp', { length: 15 }),
    email: varchar('email', { length: 100 }),
    keterangan: varchar('keterangan', { length: 100 }),
    // enum('y','t') — pending-capable, kept as a character
    keaktifanEdukasi: varchar('keaktifan_edukasi', { length: 1 }),
    foto: varchar('foto', { length: 100 }),
    // legacy varchar(10) holding 'y'/'n'
    aktif: boolean('aktif').notNull().default(true),
    ...audit(),
  },
  (t) => [
    index('sdm_wilayah_nama_trgm_idx')
      .using('gin', t.namaLengkap.op('gin_trgm_ops')),
    checkOneOfNullable('sdm_wilayah_jenis_kelamin_check', 'jenis_kelamin', JNS_KEL),
    checkOneOfNullable('sdm_wilayah_keaktifan_check', 'keaktifan_edukasi', KEAKTIFAN_EDUKASI),
  ],
);

/** Was ajis_jabatan_sdm — one row per (person, region, role) assignment. */
export const sdmPenugasan = pgTable(
  'sdm_penugasan',
  {
    idPenugasan: pk('id_penugasan'),
    idSdm: bigint('id_sdm', { mode: 'number' })
      .notNull()
      .references(() => sdmWilayah.idSdm),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' })
      .notNull()
      .references(() => ajisWilayahPembinaan.idWilayahPembinaan),
    kantorId: kantorId().references(() => ajisKantor.oid),
    // bigint, matching ref_fungsi_struktur's identity PK — the legacy column was
    // int(16) AUTO_INCREMENT, not a code (§6.6)
    idFungsiStruktur: fk('id_fungsi_struktur').references(
      () => refFungsiStruktur.idFungsiStruktur,
    ),
    keaktifanEdukasi: varchar('keaktifan_edukasi', { length: 1 }),
    ...audit(),
  },
  (t) => [
    index('sdm_penugasan_sdm_idx').on(t.idSdm),
    index('sdm_penugasan_wilayah_idx').on(t.idWilayahPembinaan, t.kantorId),
    checkOneOfNullable('sdm_penugasan_keaktifan_check', 'keaktifan_edukasi', KEAKTIFAN_EDUKASI),
  ],
);
