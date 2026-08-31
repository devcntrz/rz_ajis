/**
 * db/schema/anak.ts — the child record (PRD §4 menus 1 & 3) and achievements.
 *
 * Conversions:
 *   · enum('l','p') jns_kel                → varchar(1) + CHECK
 *   · enum('y','n') status_survey / status_kelayakan / status_pinjam /
 *     status_mentor / aktif                → boolean (§6.2 row 1)
 *   · enum('','y','n') alumni_juara        → nullable boolean, '' = undetermined (§6.2 row 8)
 *   · tidak_serumah_ortu varchar(50) y/n   → boolean (§6.2 row 5)
 *   · enum('su','b','se','t') status_tersantuni → varchar(2) + CHECK
 *   · double penghasilan_*                 → numeric (§6.1)
 *   · '0000-00-00' tgl_peminjaman/tgl_expired → NULL (§6.1)
 *   · id_wilayah_pembinaan int(2)          → bigint + FK (§6.3)
 *   · kantor_id varchar(50)                → varchar(10) (§6.3)
 *   · id_sdm varchar(50)                   → bigint + FK (§6.3)
 *   · oid_rz / id_kantor_postgree / id_ijgs_anak / upload_gdrive → external_ids (§6.1)
 *   · redundant KEY id_anak dropped (§7.1); the 3-column composite is replaced by
 *     the scope index and partial CAJ index of §7.2
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { JNS_KEL, STATUS_ANAK_JUARA, STATUS_TERSANTUNI } from '../../lib/enums';
import { checkOneOfNullable, externalIds, kantorId, money } from './_shared';
import { ajisKantor } from './kantor';
import { ajisWilayahPembinaan, sdmWilayah } from './sdm';

export const ajisAnak = pgTable(
  'ajis_anak',
  {
    // Natural key retained — referenced by business key across the whole schema.
    idAnak: varchar('id_anak', { length: 25 }).primaryKey(),
    nik: varchar('nik', { length: 50 }).unique(),
    namaLengkap: varchar('nama_lengkap', { length: 150 }).notNull(),
    namaPanggilan: varchar('nama_panggilan', { length: 50 }),
    agama: varchar('agama', { length: 50 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    tempatLahir: varchar('tempat_lahir', { length: 30 }),
    tglLahir: date('tgl_lahir'),
    anakKe: integer('anak_ke'),
    dariSaudara: integer('dari_saudara'),

    // domicile
    alamat: varchar('alamat', { length: 100 }),
    propid: varchar('propid', { length: 4 }),
    namaPropinsi: varchar('nama_propinsi', { length: 30 }),
    kabid: varchar('kabid', { length: 4 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 30 }),
    camatid: varchar('camatid', { length: 10 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 30 }),
    desaid: varchar('desaid', { length: 10 }),
    namaDesa: varchar('nama_desa', { length: 30 }),

    // education
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    kelas: varchar('kelas', { length: 50 }),
    namaSekolah: text('nama_sekolah'),
    alamatSekolah: text('alamat_sekolah'),
    jurusan: varchar('jurusan', { length: 30 }),
    semester: integer('semester'),
    namaPt: text('nama_pt'),
    alamatPt: text('alamat_pt'),
    nilai: varchar('nilai', { length: 50 }),
    pelajaranFavorit: varchar('pelajaran_favorit', { length: 50 }),
    jarakRumah: varchar('jarak_rumah', { length: 50 }),
    alatTransportasi: varchar('alat_transportasi', { length: 50 }),
    hobi: text('hobi'),
    prestasi: text('prestasi'),

    // banking
    noRekening: varchar('no_rekening', { length: 25 }),
    pemilikRekening: varchar('pemilik_rekening', { length: 50 }),
    namaBank: varchar('nama_bank', { length: 50 }),

    foto: text('foto'),
    noKartuKeluarga: varchar('no_kartu_keluarga', { length: 25 }),
    asnaf: varchar('asnaf', { length: 50 }),
    statusOrtu: varchar('status_ortu', { length: 50 }),

    // status flags
    statusSurvey: boolean('status_survey').notNull().default(false),
    statusKelayakan: boolean('status_kelayakan').notNull().default(false),
    statusAnakJuara: varchar('status_anak_juara', { length: 3 }),
    statusTersantuni: varchar('status_tersantuni', { length: 2 }),
    statusPinjam: boolean('status_pinjam').notNull().default(false),
    statusMentor: boolean('status_mentor').notNull().default(false),
    aktif: boolean('aktif').notNull().default(true),
    // enum('','y','n') — NULL means not yet determined, distinct from false (§6.2)
    alumniJuara: boolean('alumni_juara'),
    juara: varchar('juara', { length: 10 }),
    approvalIjf: varchar('approval_ijf', { length: 50 }),
    viaInput: varchar('via_input', { length: 100 }),

    // scope
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }).references(
      () => ajisWilayahPembinaan.idWilayahPembinaan,
    ),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    kantorId: kantorId().references(() => ajisKantor.oid),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idSdm: bigint('id_sdm', { mode: 'number' }).references(() => sdmWilayah.idSdm),
    namaMentor: varchar('nama_mentor', { length: 100 }),

    tglTerdaftar: date('tgl_terdaftar'),
    tglPengajuan: date('tgl_pengajuan'),

    // father
    namaLengkapAyah: varchar('nama_lengkap_ayah', { length: 50 }),
    alamatAyah: varchar('alamat_ayah', { length: 100 }),
    propidAyah: varchar('propid_ayah', { length: 4 }),
    namaPropinsiAyah: varchar('nama_propinsi_ayah', { length: 30 }),
    kabidAyah: varchar('kabid_ayah', { length: 4 }),
    namaKabupatenAyah: varchar('nama_kabupaten_ayah', { length: 30 }),
    camatidAyah: varchar('camatid_ayah', { length: 10 }),
    namaKecamatanAyah: varchar('nama_kecamatan_ayah', { length: 30 }),
    desaidAyah: varchar('desaid_ayah', { length: 10 }),
    namaDesaAyah: varchar('nama_desa_ayah', { length: 30 }),
    pekerjaanAyah: text('pekerjaan_ayah'),
    penghasilanRataRataAyah: money('penghasilan_rata_rata_ayah'),
    tanggalKematianAyah: date('tanggal_kematian_ayah'),
    penyebabKematianAyah: varchar('penyebab_kematian_ayah', { length: 100 }),

    // mother
    namaLengkapIbu: varchar('nama_lengkap_ibu', { length: 50 }),
    alamatIbu: varchar('alamat_ibu', { length: 100 }),
    propidIbu: varchar('propid_ibu', { length: 4 }),
    namaPropinsiIbu: varchar('nama_propinsi_ibu', { length: 30 }),
    kabidIbu: varchar('kabid_ibu', { length: 4 }),
    namaKabupatenIbu: varchar('nama_kabupaten_ibu', { length: 30 }),
    camatidIbu: varchar('camatid_ibu', { length: 10 }),
    namaKecamatanIbu: varchar('nama_kecamatan_ibu', { length: 30 }),
    desaidIbu: varchar('desaid_ibu', { length: 10 }),
    namaDesaIbu: varchar('nama_desa_ibu', { length: 30 }),
    pekerjaanIbu: text('pekerjaan_ibu'),
    penghasilanRataRataIbu: money('penghasilan_rata_rata_ibu'),
    tanggalKematianIbu: date('tanggal_kematian_ibu'),
    penyebabKematianIbu: varchar('penyebab_kematian_ibu', { length: 100 }),

    // guardian
    namaLengkapWali: varchar('nama_lengkap_wali', { length: 50 }),
    alamatWali: varchar('alamat_wali', { length: 100 }),
    propidWali: varchar('propid_wali', { length: 4 }),
    namaPropinsiWali: varchar('nama_propinsi_wali', { length: 30 }),
    kabidWali: varchar('kabid_wali', { length: 4 }),
    namaKabupatenWali: varchar('nama_kabupaten_wali', { length: 30 }),
    camatidWali: varchar('camatid_wali', { length: 10 }),
    namaKecamatanWali: varchar('nama_kecamatan_wali', { length: 30 }),
    desaidWali: varchar('desaid_wali', { length: 10 }),
    namaDesaWali: varchar('nama_desa_wali', { length: 30 }),
    pekerjaanWali: text('pekerjaan_wali'),
    penghasilanRataRataWali: money('penghasilan_rata_rata_wali'),

    telpYangBisaDihubungi: varchar('telp_yang_bisa_dihubungi', { length: 15 }),
    atasNama: varchar('atas_nama', { length: 30 }),
    hubunganKerabat: varchar('hubungan_kerabat', { length: 15 }),

    // living arrangement
    tinggalBersama: text('tinggal_bersama'),
    namaTinggal: text('nama_tinggal'),
    ketTinggal: text('ket_tinggal'),
    penghasilanTinggal: money('penghasilan_tinggal'),
    pekerjaanTinggal: text('pekerjaan_tinggal'),
    tidakSerumahOrtu: boolean('tidak_serumah_ortu'),

    // RFO booking
    niaRfoBook: varchar('nia_rfo_book', { length: 50 }),
    namaRfoBook: varchar('nama_rfo_book', { length: 100 }),
    tglPeminjaman: date('tgl_peminjaman'),
    tglExpired: date('tgl_expired'),
    bookVia: varchar('book_via', { length: 50 }),
    userBook: varchar('user_book', { length: 50 }),

    externalIds: externalIds(),
  },
  (t) => [
    // §7.2: the mandatory scope predicate of every list query
    index('ajis_anak_scope_idx').on(t.kantorId, t.idWilayahPembinaan, t.statusAnakJuara),
    // replaces the ajis_calon_anak_juara views (§8)
    index('ajis_anak_caj_idx')
      .on(t.kantorId, t.idWilayahPembinaan)
      .where(sql`status_anak_juara = 'caj' AND aktif`),
    // replaces ajis_view_book_anak_by_rfo (§8) — legacy had no index at all
    index('ajis_anak_nia_rfo_book_idx').on(t.niaRfoBook),
    index('ajis_anak_sdm_idx').on(t.idSdm),
    // replaces LIKE '%…%' sequential scans and the useless KEY nama_lengkap(1)
    index('ajis_anak_nama_trgm_idx').using('gin', t.namaLengkap.op('gin_trgm_ops')),
    checkOneOfNullable('ajis_anak_jns_kel_check', 'jns_kel', JNS_KEL),
    checkOneOfNullable('ajis_anak_status_aj_check', 'status_anak_juara', STATUS_ANAK_JUARA),
    checkOneOfNullable('ajis_anak_status_tersantuni_check', 'status_tersantuni', STATUS_TERSANTUNI),
  ],
);

export const ajisDataPrestasi = pgTable(
  'ajis_data_prestasi',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    eventLomba: varchar('event_lomba', { length: 100 }),
    tgl: date('tgl'),
    lokasi: varchar('lokasi', { length: 50 }),
    skalaPrestasiTingkat: varchar('skala_prestasi_tingkat', { length: 30 }),
    capaianPrestasi: varchar('capaian_prestasi', { length: 50 }),
    jenisBidang: varchar('jenis_bidang', { length: 30 }),
    publikasiMedia: varchar('publikasi_media', { length: 50 }),
    semesterid: varchar('semesterid', { length: 10 }),
    laporanid: varchar('laporanid', { length: 50 }),
    bulan: varchar('bulan', { length: 2 }),
    tahun: varchar('tahun', { length: 4 }),
    show: boolean('show').notNull().default(true),
  },
  // §7.2: legacy had no id_anak index at all
  (t) => [index('ajis_data_prestasi_anak_idx').on(t.idAnak, t.tgl.desc())],
);
