/**
 * db/schema/laporan.ts — semester reports (PRD §4 menus 17, 19, 21, 22).
 *
 * Conversions:
 *   · manual_laporan_lama is MERGED here via versi_struktur = 'lama' (§6.5).
 *     OPEN ITEM (§6.6): that table's DDL is absent from the dump and referenced by
 *     no surviving code, so any columns unique to the old structure are not yet
 *     represented. Confirm with SHOW CREATE TABLE on the legacy server before the
 *     report migration; a follow-up migration adds whatever it turns up.
 *   · the nine enum('t','n','y') QC columns → varchar(1) + CHECK, NOT boolean —
 *     't' is "not yet reviewed", a third state (§6.2 row 7)
 *   · s_perkembangan_siswa enum('y','n') → boolean
 *   · status_terbuat int(1) / status_terkirim_* varchar(1) '0'/'1' → boolean
 *   · double(20,2) dana_* → numeric(20,2) (§6.1)
 *   · laporanid varchar(50) here vs varchar(12) on manual_laporan_pembinaan →
 *     varchar(50) + FK (§6.3)
 *   · manual_laporan_prestasi.id_prestasi int without AUTO_INCREMENT → bigserial (§6.4)
 *   · materi.id_materi likewise → bigserial; the menu is a read-only archive
 *   · redundant KEY laporanid dropped (§7.1)
 */
import {
  bigint,
  bigserial,
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
import { TNY, VERSI_STRUKTUR } from '../../lib/enums';
import { checkOneOfNullable, externalIds, kantorId, money } from './_shared';
import { ajisSemester } from './setting';

export const manualLaporan = pgTable(
  'manual_laporan',
  {
    laporanid: varchar('laporanid', { length: 50 }).primaryKey(),
    // 'baru' | 'lama' — marks rows merged in from manual_laporan_lama (§6.5)
    versiStruktur: varchar('versi_struktur', { length: 5 }).notNull().default('baru'),

    donaturId: varchar('donatur_id', { length: 50 }),
    donaturNama: varchar('donatur_nama', { length: 150 }),
    donaturAlamat: text('donatur_alamat'),

    idAnak: varchar('id_anak', { length: 25 }),
    nik: varchar('nik', { length: 50 }),
    pmNamaLengkap: varchar('pm_nama_lengkap', { length: 150 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    pmTempatLahir: varchar('pm_tempat_lahir', { length: 100 }),
    pmTglLahir: date('pm_tgl_lahir'),
    pmAnakKe: smallint('pm_anak_ke'),
    pmSaudara: smallint('pm_saudara'),
    pmNamaOrangTua: varchar('pm_nama_orang_tua', { length: 150 }),
    pmPekerjaan: varchar('pm_pekerjaan', { length: 100 }),
    asnaf: varchar('asnaf', { length: 15 }),
    statusOrtu: varchar('status_ortu', { length: 50 }),

    pmAnakNamaSekolah: text('pm_anak_nama_sekolah'),
    pmAnakAlamatSekolah: text('pm_anak_alamat_sekolah'),
    pmAnakKelas: varchar('pm_anak_kelas', { length: 5 }),
    pmAnakJenjang: varchar('pm_anak_jenjang', { length: 5 }),
    pmMhsInstitusi: varchar('pm_mhs_institusi', { length: 100 }),
    pmMhsProdi: varchar('pm_mhs_prodi', { length: 100 }),
    pmMhsSemester: smallint('pm_mhs_semester'),
    pmMhsJurusan: varchar('pm_mhs_jurusan', { length: 100 }),

    pembinaanWilayah: varchar('pembinaan_wilayah', { length: 100 }),
    pembinaanAlamat: text('pembinaan_alamat'),
    pembinaanJmlAnak: smallint('pembinaan_jml_anak'),
    pembinaanJenjang: varchar('pembinaan_jenjang', { length: 5 }),
    pembinaanPerkembangan: text('pembinaan_perkembangan'),
    pembinaanPrestasi: text('pembinaan_prestasi'),
    catatanPembinaan: text('catatan_pembinaan'),
    suaraAnakJuara: text('suara_anak_juara'),

    danaSaldoAwal: money('dana_saldo_awal'),
    danaPenerimaan: money('dana_penerimaan'),
    danaPenyaluran: money('dana_penyaluran'),
    tglUpdateKeuangan: timestamp('tgl_update_keuangan', { withTimezone: true }),

    programid: smallint('programid'),
    semesterid: varchar('semesterid', { length: 10 }).references(() => ajisSemester.semesterid),
    namaSemester: varchar('nama_semester', { length: 100 }),
    jenis: varchar('jenis', { length: 10 }),
    jenisLaporan: varchar('jenis_laporan', { length: 50 }),
    tahun: smallint('tahun'),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 }),
    idNaikJenjang: varchar('id_naik_jenjang', { length: 100 }),
    formatid: smallint('formatid'),
    aktif: boolean('aktif').notNull().default(true),

    oid: varchar('oid', { length: 10 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),

    // Attachments, each with a three-state QC verdict. 't' = not yet reviewed.
    foto: text('foto'),
    statusFoto: varchar('status_foto', { length: 1 }),
    keteranganFoto: varchar('keterangan_foto', { length: 225 }),
    fotoPembinaan: text('foto_pembinaan'),
    sFotoPembinaan: varchar('s_foto_pembinaan', { length: 1 }),
    keteranganFotoPembinaan: varchar('keterangan_foto_pembinaan', { length: 225 }),
    suratSuaraHati: text('surat_suara_hati'),
    statusSsh: varchar('status_ssh', { length: 1 }),
    keteranganSsh: varchar('keterangan_ssh', { length: 225 }),
    raportCeria: text('raport_ceria'),
    statusRaportCeria: varchar('status_raport_ceria', { length: 1 }),
    keteranganRaportCeria: varchar('keterangan_raport_ceria', { length: 225 }),
    raportSatu: text('raport_satu'),
    statusRaportSatu: varchar('status_raport_satu', { length: 1 }),
    keteranganRaportSatu: varchar('keterangan_raport_satu', { length: 225 }),
    raportDua: text('raport_dua'),
    statusRaportDua: varchar('status_raport_dua', { length: 1 }),
    keteranganRaportDua: varchar('keterangan_raport_dua', { length: 225 }),
    sMateri: varchar('s_materi', { length: 1 }),
    keteranganMateri: text('keterangan_materi'),
    sPerkembanganSiswa: boolean('s_perkembangan_siswa'),
    keteranganPerkembanganSiswa: varchar('keterangan_perkembangan_siswa', { length: 225 }),
    sRaport: smallint('s_raport'),
    hasilQc: varchar('hasil_qc', { length: 25 }),
    keterangan: text('keterangan'),

    // workflow flags — legacy stored these as int(1) and varchar(1) '0'/'1'
    statusTerbuat: boolean('status_terbuat').notNull().default(false),
    tglStatusTerbuat: date('tgl_status_terbuat'),
    statusTerkirimFundraising: boolean('status_terkirim_fundraising').notNull().default(false),
    tglStatusTerkirimFundraising: date('tgl_status_terkirim_fundraising'),
    statusTerkirimDonatur: boolean('status_terkirim_donatur').notNull().default(false),
    tglStatusTerkirimDonatur: date('tgl_status_terkirim_donatur'),

    wajibMateri: smallint('wajib_materi'),
    jmlMateri: smallint('jml_materi'),
    jmlMateriTampil: smallint('jml_materi_tampil'),
    wajibMateriBulan: smallint('wajib_materi_bulan'),
    jmlMateriTampilBulan: smallint('jml_materi_tampil_bulan'),
    jmlPrestasi: smallint('jml_prestasi'),
    tglPenyaluran: text('tgl_penyaluran'),
    tglPembinaan: text('tgl_pembinaan'),
    tglPenyaluranBulan: text('tgl_penyaluran_bulan'),
    tglPembinaanBulan: text('tgl_pembinaan_bulan'),

    tglInsert: timestamp('tgl_insert', { withTimezone: true }),
    userInsert: varchar('user_insert', { length: 50 }),
    externalIds: externalIds(),
  },
  (t) => [
    index('manual_laporan_semester_idx').on(t.semesterid, t.kantorId),
    index('manual_laporan_scope_idx').on(t.idWilayahPembinaan, t.oid),
    index('manual_laporan_anak_idx').on(t.idAnak, t.semesterid),
    checkOneOfNullable('manual_laporan_versi_check', 'versi_struktur', VERSI_STRUKTUR),
    checkOneOfNullable('manual_laporan_status_foto_check', 'status_foto', TNY),
    checkOneOfNullable('manual_laporan_s_foto_pembinaan_check', 's_foto_pembinaan', TNY),
    checkOneOfNullable('manual_laporan_status_ssh_check', 'status_ssh', TNY),
    checkOneOfNullable('manual_laporan_status_raport_ceria_check', 'status_raport_ceria', TNY),
    checkOneOfNullable('manual_laporan_status_raport_satu_check', 'status_raport_satu', TNY),
    checkOneOfNullable('manual_laporan_status_raport_dua_check', 'status_raport_dua', TNY),
    checkOneOfNullable('manual_laporan_s_materi_check', 's_materi', TNY),
  ],
);

export const manualLaporanPembinaan = pgTable(
  'manual_laporan_pembinaan',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    // widened from varchar(12) to match manual_laporan.laporanid (§6.3)
    laporanid: varchar('laporanid', { length: 50 })
      .notNull()
      .references(() => manualLaporan.laporanid, { onDelete: 'cascade' }),
    detailid: smallint('detailid').notNull(),
    idAnak: varchar('id_anak', { length: 25 }),
    semesterid: varchar('semesterid', { length: 10 }),
    tanggal: date('tanggal'),
    materi: varchar('materi', { length: 200 }),
    aktif: boolean('aktif').notNull().default(true),
    dateInsert: date('date_insert'),
    userInsert: varchar('user_insert', { length: 50 }),
  },
  (t) => [
    unique('manual_laporan_pembinaan_natural_uq').on(t.laporanid, t.detailid),
    index('manual_laporan_pembinaan_anak_idx').on(t.idAnak, t.semesterid),
  ],
);

export const manualLaporanPrestasi = pgTable(
  'manual_laporan_prestasi',
  {
    // legacy int had no AUTO_INCREMENT — ids were generated in PHP (§6.4)
    idPrestasi: bigserial('id_prestasi', { mode: 'number' }).primaryKey(),
    idAnak: varchar('id_anak', { length: 25 }),
    namaAnak: varchar('nama_anak', { length: 150 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    kelas: varchar('kelas', { length: 50 }),
    event: text('event'),
    lokasi: text('lokasi'),
    bidangPrestasi: text('bidang_prestasi'),
    skala: text('skala'),
    prestasi: text('prestasi'),
    linkPublikasi: text('link_publikasi'),
    waktuAwal: date('waktu_awal'),
    waktuAkhir: date('waktu_akhir'),
    aktif: boolean('aktif').notNull().default(true),
    dateInsert: date('date_insert'),
    userInsert: varchar('user_insert', { length: 50 }),
  },
  (t) => [index('manual_laporan_prestasi_anak_idx').on(t.idAnak, t.waktuAwal.desc())],
);

/** Read-only archive (§4 menu 22) — no create or edit path in the new app. */
export const materi = pgTable(
  'materi',
  {
    idMateri: bigserial('id_materi', { mode: 'number' }).primaryKey(),
    detailid: varchar('detailid', { length: 50 }),
    materi: text('materi'),
    tanggal: date('tanggal'),
    jenjang: varchar('jenjang', { length: 10 }),
    semesterid: varchar('semesterid', { length: 10 }),
    oid: varchar('oid', { length: 10 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
  },
  (t) => [index('materi_semester_idx').on(t.semesterid, t.oid, t.idWilayahPembinaan)],
);
