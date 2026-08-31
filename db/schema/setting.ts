/**
 * db/schema/setting.ts — configuration, program master, semester, evaluation items.
 *
 * Conversions:
 *   · ajis_batas_expired_peminjaman (1 column, no PK) → an app_setting row (§6.5)
 *   · ajis_periode_penilaian (3 rows)                 → app_setting rows (§6.5)
 *   · program                                         → dropped, duplicate of
 *     setting_program; its kredit_account is absorbed here (§6.5)
 *   · setting_program PK (id_program, progid)         → identity PK, id_program UNIQUE (§6.4)
 *   · ajis_semester.semesterid                        → varchar(10) UNIQUE (§6.3) —
 *     legacy left it non-unique despite it being the join key everywhere
 *   · all double money columns                        → numeric (§6.1)
 *   · '0000-00-00' defaults                           → NULL (§6.1)
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { checkOneOfNullable, externalIds, money, pk } from './_shared';

/**
 * Key/value configuration plus sync watermarks (§5.7). Absorbs the two legacy
 * single-purpose config tables.
 */
export const appSetting = pgTable('app_setting', {
  id: pk(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  keterangan: varchar('keterangan', { length: 200 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const settingProgram = pgTable(
  'setting_program',
  {
    id: pk(),
    // natural key — legacy PK was the (id_program, progid) pair (§6.4)
    idProgram: integer('id_program').notNull().unique(),
    progid: varchar('progid', { length: 6 }).notNull(),
    parentProgid: varchar('parent_progid', { length: 20 }),
    namaProgram: varchar('nama_program', { length: 50 }).notNull(),
    namaInggrisProgram: varchar('nama_inggris_program', { length: 50 }),
    namaAlias: varchar('nama_alias', { length: 30 }),
    jenisProgram: varchar('jenis_program', { length: 2 }).default('dn'),
    coaProgram: varchar('coa_program', { length: 20 }),
    // absorbed from the dropped `program` table (§6.5)
    kreditAccount: varchar('kredit_account', { length: 20 }),
    sifatProgram: varchar('sifat_program', { length: 2 }).default('tt'),
    keterangan: varchar('keterangan', { length: 50 }),
    tglDigulirkan: date('tgl_digulirkan'),
    aktif: boolean('aktif').notNull().default(true),
    tglInaktif: timestamp('tgl_inaktif', { withTimezone: true }),
    kprogid: char('kprogid', { length: 2 }),
    tglInsert: timestamp('tgl_insert', { withTimezone: true }),
    tglChangeStatus: timestamp('tgl_change_status', { withTimezone: true }),
    status: varchar('status', { length: 2 }).default('nm'),
    danaPengelola: boolean('dana_pengelola').notNull().default(false),
    pdanaid: integer('pdanaid'),
    idAnggaran: varchar('id_anggaran', { length: 50 }),
    hargaProgram: money('harga_program'),
    hargaPenyaluran: money('harga_penyaluran'),
    nominalDp: money('nominal_dp'),
    nominalDss: money('nominal_dss'),
    persentaseDp: money('persentase_dp'),
    persentaseDss: money('persentase_dss'),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    baru: varchar('baru', { length: 5 }),
    // absorbs id_program_postgree
    externalIds: externalIds(),
  },
  (t) => [
    index('setting_program_progid_idx').on(t.progid),
    checkOneOfNullable('setting_program_jenis_check', 'jenis_program', ['dn', 'ln']),
    checkOneOfNullable('setting_program_sifat_check', 'sifat_program', ['t', 'tt']),
    checkOneOfNullable('setting_program_status_check', 'status', ['m', 'nm']),
  ],
);

export const ajisHarga = pgTable(
  'ajis_harga',
  {
    idHarga: pk('id_harga'),
    programDonasi: text('program_donasi'),
    program: text('program'),
    hargaProgram: money('harga_program'),
    hargaPenyaluran: money('harga_penyaluran'),
    beasiswa: money('beasiswa'),
    transport: money('transport'),
    frekuensi: integer('frekuensi'),
    ceria: boolean('ceria'),
    progid: varchar('progid', { length: 50 }),
  },
  // legacy KEY (id_harga, progid) was a redundant left-prefix of the PK (§7.1)
  (t) => [index('ajis_harga_progid_idx').on(t.progid)],
);

export const ajisSemester = pgTable(
  'ajis_semester',
  {
    id: pk(),
    // §6.3: the join key everywhere, but legacy never made it unique
    semesterid: varchar('semesterid', { length: 10 }).notNull().unique(),
    semester: varchar('semester', { length: 100 }),
    tglAwal: date('tgl_awal'),
    tglAkhir: date('tgl_akhir'),
    // enum('n','y') → boolean (§6.2 row 2)
    onprogress: boolean('onprogress').notNull().default(false),
    tglAwalDonasi: date('tgl_awal_donasi'),
    tglAkhirDonasi: date('tgl_akhir_donasi'),
    tglAwalSaldo: date('tgl_awal_saldo'),
    tglAkhirSaldo: date('tgl_akhir_saldo'),
    jenis: varchar('jenis', { length: 50 }),
    tahun: varchar('tahun', { length: 4 }),
    lapsem: varchar('lapsem', { length: 1 }),
    // report template blobs
    cover: text('cover'),
    coverSiswa: text('cover_siswa'),
    kataPengantar: text('kata_pengantar'),
    kataPengantarSiswa: text('kata_pengantar_siswa'),
    profil: text('profil'),
    kotakProfilCeria: text('kotak_profil_ceria'),
    kotakPembinaanCeria: text('kotak_pembinaan_ceria'),
    kotakProfilSiswa: text('kotak_profil_siswa'),
    kotakPembinaanSiswa: text('kotak_pembinaan_siswa'),
    keuangan: text('keuangan'),
    surat: text('surat'),
    bawah: text('bawah'),
    bawahSiswa: text('bawah_siswa'),
  },
  (t) => [
    index('ajis_semester_tgl_idx').on(t.tglAwal, t.tglAkhir),
    // the one query that matters: "which semester is open right now"
    index('ajis_semester_onprogress_idx').on(t.semesterid).where(sql`onprogress`),
  ],
);

export const ajisItemHafalan = pgTable(
  'ajis_item_hafalan',
  {
    id: pk(),
    // 2 = Quran, 3 = Shalat, 4 = Doa
    jenis: integer('jenis').notNull(),
    konten: varchar('konten', { length: 100 }).notNull(),
  },
  (t) => [index('ajis_item_hafalan_jenis_idx').on(t.jenis)],
);

export const ajisItemPenilaian = pgTable('ajis_item_penilaian', {
  id: pk(),
  itemPenilaian: text('item_penilaian'),
  parentId: varchar('parent_id', { length: 100 }),
  // legacy varchar(1) holding 'y' — a plain flag
  isParent: boolean('is_parent').notNull().default(false),
  jenis: varchar('jenis', { length: 100 }),
  target: text('target'),
});
