/**
 * db/schema/survey.ts — home survey (PRD §4 menu 2) and CAJ data lending (menu 4).
 *
 * Conversions:
 *   · ajis_survey PK (id_survey, id_anak) → id_survey bigserial (§6.4)
 *   · enum('tidak','ada') bantuan_rutin_dari_lembaga_lain → boolean (§6.2 row 4)
 *   · enum('yatim','piatu','dhuafa') asnaf_anak → varchar + CHECK
 *   · enum('y','n') status_pinjam / status_terpasangkan / cancel → boolean (§6.2)
 *   · double biaya_pendidikan / jml_bantuan → numeric (§6.1)
 *   · KEY nama_lengkap(1) was a one-character prefix index, effectively useless →
 *     GIN trigram (§7.1)
 *   · ajis_peminjam PK (id, id_peminjam) → bigserial, id_peminjam UNIQUE
 *   · ajis_batas_expired_peminjaman → an app_setting row (§6.5)
 */
import { sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  date,
  index,
  pgTable,
  smallint,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { audit, checkOneOfNullable, externalIds, kantorId, money } from './_shared';
import { ajisAnak } from './anak';

export const ajisSurvey = pgTable(
  'ajis_survey',
  {
    idSurvey: bigserial('id_survey', { mode: 'number' }).primaryKey(),
    tglSurvey: date('tgl_survey'),
    petugasSurvey: varchar('petugas_survey', { length: 30 }),
    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    namaLengkap: varchar('nama_lengkap', { length: 150 }),
    namaLengkapAyah: varchar('nama_lengkap_ayah', { length: 50 }),
    namaLengkapIbu: varchar('nama_lengkap_ibu', { length: 50 }),
    namaLengkapWali: varchar('nama_lengkap_wali', { length: 50 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: varchar('id_wilayah_pembinaan', { length: 16 }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    asnaf: varchar('asnaf', { length: 50 }),
    alamat: text('alamat'),
    namaPropinsi: varchar('nama_propinsi', { length: 30 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 30 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 30 }),
    namaDesa: varchar('nama_desa', { length: 30 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    tglPengajuan: date('tgl_pengajuan'),
    statusAnak: varchar('status_anak', { length: 10 }),
    hasilKesimpulanSurvey: varchar('hasil_kesimpulan_survey', { length: 100 }),

    // household assets and conditions
    kepemilikanTanah: varchar('kepemilikan_tanah', { length: 100 }),
    kepemilikanRumah: varchar('kepemilikan_rumah', { length: 100 }),
    kondisiDindingRumah: varchar('kondisi_dinding_rumah', { length: 100 }),
    kondisiLantaiRumah: varchar('kondisi_lantai_rumah', { length: 100 }),
    kepemilikanKendaraan: varchar('kepemilikan_kendaraan', { length: 100 }),
    kepemilikanBarangElektronik: varchar('kepemilikan_barang_elektronik', { length: 100 }),
    kepemilikanTabungan: varchar('kepemilikan_tabungan', { length: 100 }),
    pekerjaanKepalaKeluarga: varchar('pekerjaan_kepala_keluarga', { length: 100 }),
    rataRataPenghasilanPerbulan: varchar('rata_rata_penghasilan_perbulan', { length: 100 }),
    makan2x: varchar('makan_2x', { length: 100 }),
    namaKepalaKeluarga: varchar('nama_kepala_keluarga', { length: 100 }),
    pendidikanTerakhirKepalaKeluarga: varchar('pendidikan_terakhir_kepala_keluarga', {
      length: 100,
    }),
    jmlTanggunganKepalaKeluarga: smallint('jml_tanggungan_kepala_keluarga'),
    sumberAirBersih: varchar('sumber_air_bersih', { length: 100 }),
    jambanDanSaluranLimbah: varchar('jamban_dan_saluran_limbah', { length: 100 }),
    tempatPembuanganSampah: varchar('tempat_pembuangan_sampah', { length: 100 }),
    terdapatPerokok: varchar('terdapat_perokok', { length: 100 }),
    terdapatKonsumenMiras: varchar('terdapat_konsumen_miras', { length: 100 }),
    terdapatPersediaanObatP3k: varchar('terdapat_persediaan_obat_p3k', { length: 100 }),
    makanBuahDanSayurTiapHari: varchar('makan_buah_dan_sayur_tiap_hari', { length: 100 }),
    shalat5Waktu: varchar('shalat_5_waktu', { length: 100 }),
    membacaAlquran: varchar('membaca_alquran', { length: 100 }),
    majelisTaklim: varchar('majelis_taklim', { length: 100 }),
    membacaKoran: varchar('membaca_koran', { length: 100 }),
    aktifSebagaiPengurusOrganisasi: varchar('aktif_sebagai_pengurus_organisasi', {
      length: 100,
    }),

    asnafAnak: varchar('asnaf_anak', { length: 10 }),
    biayaPendidikanSppPerbulan: money('biaya_pendidikan_spp_perbulan'),
    // enum('tidak','ada') → boolean (§6.2 row 4)
    bantuanRutinDariLembagaLain: boolean('bantuan_rutin_dari_lembaga_lain'),
    jmlBantuanRutinDariLembagaLain: money('jml_bantuan_rutin_dari_lembaga_lain'),
    resumeDeskriptif: text('resume_deskriptif'),

    ...audit(),
    externalIds: externalIds(),
  },
  (t) => [
    index('ajis_survey_anak_idx').on(t.idAnak),
    index('ajis_survey_scope_idx').on(t.kantorId, t.idWilayahPembinaan, t.tglSurvey.desc()),
    // replaces KEY nama_lengkap(1) — a single-character prefix that indexed nothing
    index('ajis_survey_nama_trgm_idx').using('gin', t.namaLengkap.op('gin_trgm_ops')),
    checkOneOfNullable('ajis_survey_asnaf_anak_check', 'asnaf_anak', [
      'yatim',
      'piatu',
      'dhuafa',
    ]),
  ],
);

export const ajisPeminjam = pgTable(
  'ajis_peminjam',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    idPeminjam: varchar('id_peminjam', { length: 50 }).notNull().unique(),
    namaLengkap: varchar('nama_lengkap', { length: 100 }),
    jabatan: varchar('jabatan', { length: 25 }),
    kantor: varchar('kantor', { length: 25 }),
    hp: varchar('hp', { length: 15 }),
    telp: varchar('telp', { length: 15 }),
    email: varchar('email', { length: 100 }),
    ...audit(),
    externalIds: externalIds(),
  },
  (t) => [index('ajis_peminjam_nama_idx').on(t.namaLengkap)],
);

export const ajisPeminjamanAnak = pgTable(
  'ajis_peminjaman_anak',
  {
    idPeminjaman: bigserial('id_peminjaman', { mode: 'number' }).primaryKey(),
    idPeminjam: varchar('id_peminjam', { length: 50 }).references(() => ajisPeminjam.idPeminjam),
    namaPeminjam: varchar('nama_peminjam', { length: 100 }),
    idAnak: varchar('id_anak', { length: 25 }).references(() => ajisAnak.idAnak),
    namaAnak: varchar('nama_anak', { length: 150 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    alamat: text('alamat'),
    namaPropinsi: varchar('nama_propinsi', { length: 30 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 30 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 30 }),
    namaDesa: varchar('nama_desa', { length: 30 }),
    foto: text('foto'),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: varchar('id_wilayah_pembinaan', { length: 16 }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    tglAwalPeminjaman: date('tgl_awal_peminjaman'),
    tglSelesaiPeminjaman: date('tgl_selesai_peminjaman'),
    tglExpired: date('tgl_expired'),
    statusPinjam: boolean('status_pinjam').notNull().default(false),
    statusTerpasangkan: boolean('status_terpasangkan').notNull().default(false),
    cancel: boolean('cancel').notNull().default(false),
    alasanCancel: text('alasan_cancel'),
    userInsert: varchar('user_insert', { length: 30 }),
    dateInsert: date('date_insert'),
  },
  (t) => [
    // §7.2 — the live loans, a small slice of ±39k rows
    index('ajis_peminjaman_aktif_idx')
      .on(t.kantorId, t.idWilayahPembinaan)
      .where(sql`status_pinjam AND NOT cancel`),
    index('ajis_peminjaman_peminjam_idx').on(t.idPeminjam, t.tglAwalPeminjaman.desc()),
    index('ajis_peminjaman_expired_idx')
      .on(t.tglExpired)
      .where(sql`status_pinjam AND NOT cancel`),
    index('ajis_peminjaman_anak_idx').on(t.idAnak),
  ],
);
