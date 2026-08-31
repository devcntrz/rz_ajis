/**
 * db/schema/pembinaan.ts — coaching sessions (PRD §4 menu 9), Quran memorisation,
 * and session photo documentation.
 *
 * ajis_pembinaan_baru is the largest table in the system (±4.48M rows, MyISAM in
 * legacy — table-level locks and non-transactional). Its four legacy indexes served
 * almost none of the real predicates; §7.2 replaces them.
 *
 * Conversions:
 *   · ajis_hafalan PK (id_anak, konten_uji) → id_hafalan identity PK with natural key
 *     (id_anak, semesterid, konten_uji). This is a BUG FIX (§6.4): the legacy key
 *     omitted semesterid, so a child could never be re-tested on the same content
 *     in a later semester.
 *   · enum('y','n') tampil → boolean (§6.2)
 *   · varchar bulan/tahun → smallint
 *   · id_wilayah_pembinaan varchar(16) → bigint (§6.3)
 *   · semesterid varchar(2)/(4) → varchar(10) + FK (§6.3)
 */
import {
  bigint,
  boolean,
  date,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { externalIds, kantorId, pk } from './_shared';
import { ajisAnak } from './anak';
import { ajisSemester, ajisItemHafalan } from './setting';

export const ajisPembinaanBaru = pgTable(
  'ajis_pembinaan_baru',
  {
    idRow: pk('id_row'),
    // groups the rows of one session; one row per attending child
    idPembinaan: varchar('id_pembinaan', { length: 100 }).notNull(),
    tglPembinaan: date('tgl_pembinaan'),
    semesterid: varchar('semesterid', { length: 10 }).references(() => ajisSemester.semesterid),
    bulan: smallint('bulan'),
    tahun: smallint('tahun'),

    jenisPembinaan: varchar('jenis_pembinaan', { length: 100 }),
    p3a: varchar('p3a', { length: 100 }),
    judulMateri: text('judul_materi'),
    pemateri: varchar('pemateri', { length: 150 }),
    pemateriPersonal: varchar('pemateri_personal', { length: 150 }),

    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    namaLengkap: varchar('nama_lengkap', { length: 150 }),
    nik: varchar('nik', { length: 50 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    asnaf: varchar('asnaf', { length: 50 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    statusOrtu: varchar('status_ortu', { length: 50 }),
    namaLengkapAyah: varchar('nama_lengkap_ayah', { length: 50 }),
    namaLengkapIbu: varchar('nama_lengkap_ibu', { length: 50 }),
    namaLengkapWali: varchar('nama_lengkap_wali', { length: 50 }),

    kehadiran: varchar('kehadiran', { length: 15 }),
    ortuHadir: varchar('ortu_hadir', { length: 50 }),
    keterangan: varchar('keterangan', { length: 100 }),

    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),

    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    programDonasi: varchar('program_donasi', { length: 50 }),

    // achievement / habit scoring
    capaianTilawah: varchar('capaian_tilawah', { length: 50 }),
    capaianTahfidz: varchar('capaian_tahfidz', { length: 50 }),
    capaianTahfidzHal: varchar('capaian_tahfidz_hal', { length: 50 }),
    pembiasaanShalatWajib: smallint('pembiasaan_shalat_wajib'),
    pembiasaanTilawah: smallint('pembiasaan_tilawah'),
    pembiasaanSedekah: smallint('pembiasaan_sedekah'),
    membantuOrtu: smallint('membantu_ortu'),

    tampil: boolean('tampil').notNull().default(true),
    viaInput: varchar('via_input', { length: 50 }),
    userInsert: varchar('user_insert', { length: 100 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }).defaultNow(),
    userUpdate: varchar('user_update', { length: 100 }),
    dateUpdate: timestamp('date_update', { withTimezone: true }),
    externalIds: externalIds(),
  },
  (t) => [
    // §7.2 — "this child's coaching history, newest first"
    index('ajis_pembinaan_anak_tgl_idx').on(t.idAnak, t.tglPembinaan.desc()),
    index('ajis_pembinaan_scope_idx').on(t.kantorId, t.idWilayahPembinaan, t.tahun, t.bulan),
    index('ajis_pembinaan_semester_idx').on(t.semesterid, t.idAnak),
    index('ajis_pembinaan_sesi_idx').on(t.idPembinaan),
    // ±4.48M append-only rows — BRIN costs kilobytes where a btree costs ~100MB
    index('ajis_pembinaan_tgl_brin').using('brin', t.tglPembinaan),
  ],
);

export const ajisHafalan = pgTable(
  'ajis_hafalan',
  {
    idHafalan: pk('id_hafalan'),
    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    semesterid: varchar('semesterid', { length: 10 })
      .notNull()
      .references(() => ajisSemester.semesterid),
    jenis: varchar('jenis', { length: 50 }),
    kontenUji: varchar('konten_uji', { length: 100 }).notNull(),
    idItemHafalan: bigint('id_item_hafalan', { mode: 'number' }).references(
      () => ajisItemHafalan.id,
    ),
    tglPengujian: date('tgl_pengujian'),
    tglInsert: timestamp('tgl_insert', { withTimezone: true }),
    keterangan: text('keterangan'),
    externalIds: externalIds(),
  },
  (t) => [
    // The bug fix: semesterid is part of the natural key now (§6.4). Without it a
    // child could not be re-tested on the same content in a later semester.
    unique('ajis_hafalan_natural_uq').on(t.idAnak, t.semesterid, t.kontenUji),
    index('ajis_hafalan_anak_semester_idx').on(t.idAnak, t.semesterid),
  ],
);

export const ajisDokumentasiPembinaan = pgTable(
  'ajis_dokumentasi_pembinaan',
  {
    id: pk(),
    semesterid: varchar('semesterid', { length: 10 })
      .notNull()
      .references(() => ajisSemester.semesterid),
    kantorId: kantorId().notNull(),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }).notNull(),
    image: text('image'),
    nama: varchar('nama', { length: 50 }),
    externalIds: externalIds(),
  },
  (t) => [
    // natural key of the legacy 3-column PK (§6.4)
    unique('ajis_dokumentasi_natural_uq').on(t.semesterid, t.kantorId, t.idWilayahPembinaan),
  ],
);
