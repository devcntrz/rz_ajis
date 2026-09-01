/**
 * db/schema/keuangan.ts — money movement (PRD §4 menus 11, 12, 15) plus the
 * replacement-request table.
 *
 * Conversions:
 *   · every double / int nominal column → numeric (§6.1, §2.1 rule 6)
 *   · ajis_input_donasi.transid was `text` — unindexable, so the join to
 *     transaksi.transid could never use an index. Now varchar(50) + index (§6.3)
 *   · ajis_penyaluran PK (id_row, id_penyaluran) → identity PK;
 *     natural key (id_penyaluran, id_pemasangan_baru, bulan, tahun) (§6.4)
 *   · transaksi PK (transid, detailid) → identity PK, that pair UNIQUE (§6.4)
 *   · enum('n','y') status_akhir / status_tersalurkan / status_pasang /
 *     deleted_* / review / cicilan / approved_* → boolean (§6.2)
 *   · ajis_view_ajuan.approve_funding enum('t','n','y') → varchar(1) + CHECK —
 *     three QC states, NOT a boolean (§6.2)
 *   · ajis_view_ajuan.status_eksekusi enum('','y','n') → nullable boolean (§6.2)
 *   · the legacy 8-column KEY tgl_penyaluran and 7-column KEY id_anak are dropped;
 *     §7.2 indexes replace them
 *
 * `ajis_view_ajuan` keeps its misleading name on purpose (§6.5): it is a real
 * table, but the name preserves the cross-reference to the legacy system.
 */
import { sql } from 'drizzle-orm';
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
import { TNY } from '../../lib/enums';
import { checkOneOfNullable, externalIds, kantorId, money, pk } from './_shared';
import { ajisPemasangan } from './pemasangan';

export const ajisInputDonasi = pgTable(
  'ajis_input_donasi',
  {
    idInputDonasi: pk('id_input_donasi'),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 })
      .notNull()
      .references(() => ajisPemasangan.idPemasanganBaru),
    tglTransaksi: date('tgl_transaksi'),
    idAnak: varchar('id_anak', { length: 25 }),
    namaAnak: varchar('nama_anak', { length: 150 }),
    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    programDonasi: varchar('program_donasi', { length: 50 }),
    idProgram: bigint('id_program', { mode: 'number' }),
    qty: smallint('qty'),
    pilihanDonasi: money('pilihan_donasi'),
    nominalDonasi: money('nominal_donasi'),
    bulan: smallint('bulan'),
    tahun: smallint('tahun'),
    periode: varchar('periode', { length: 10 }),
    // was `text` in legacy — the reason the transaksi join never used an index
    transid: varchar('transid', { length: 50 }),
    detailid: smallint('detailid'),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    // enum('trans','saldo')
    jenis: varchar('jenis', { length: 5 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    asnaf: varchar('asnaf', { length: 50 }),
    nik: varchar('nik', { length: 50 }),
    viaInput: varchar('via_input', { length: 100 }),
    userInsert: varchar('user_insert', { length: 30 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
    userUpdate: varchar('user_update', { length: 30 }),
    dateUpdate: timestamp('date_update', { withTimezone: true }),
    externalIds: externalIds(),
  },
  (t) => [
    // §7.2 — feeds mv_donasi_bulanan
    index('ajis_input_donasi_pemasangan_idx').on(t.idPemasanganBaru, t.tahun, t.bulan),
    index('ajis_input_donasi_anak_idx').on(t.idAnak, t.tahun),
    index('ajis_input_donasi_kantor_idx').on(t.kantorId, t.tahun, t.bulan),
    index('ajis_input_donasi_transid_idx').on(t.transid, t.detailid),
    // ±524k rows, append-only by date — BRIN is a fraction of a btree's size
    index('ajis_input_donasi_tgl_brin').using('brin', t.tglTransaksi),
    checkOneOfNullable('ajis_input_donasi_jenis_check', 'jenis', ['trans', 'saldo']),
  ],
);

export const ajisPenyaluran = pgTable(
  'ajis_penyaluran',
  {
    id: pk(),
    idPenyaluran: varchar('id_penyaluran', { length: 50 }).notNull(),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 }).references(
      () => ajisPemasangan.idPemasanganBaru,
    ),
    tglPenyaluran: date('tgl_penyaluran'),
    idAnak: varchar('id_anak', { length: 25 }),
    namaAnak: varchar('nama_anak', { length: 150 }),
    nik: varchar('nik', { length: 50 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    kelas: varchar('kelas', { length: 50 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    asnaf: varchar('asnaf', { length: 50 }),
    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    idSdm: bigint('id_sdm', { mode: 'number' }),
    namaSdm: varchar('nama_sdm', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    programDonasi: varchar('program_donasi', { length: 50 }),
    idProgram: bigint('id_program', { mode: 'number' }),
    nominalPenyaluran: money('nominal_penyaluran'),
    nominalHpp: money('nominal_hpp'),
    saldoAkhirGanjil: money('saldo_akhir_ganjil'),
    bulan: smallint('bulan'),
    tahun: smallint('tahun'),
    periode: varchar('periode', { length: 10 }),
    transid: varchar('transid', { length: 50 }),
    detailid: smallint('detailid'),
    idInputDonasi: bigint('id_input_donasi', { mode: 'number' }),
    jenis: varchar('jenis', { length: 50 }),
    statusAkhir: boolean('status_akhir').notNull().default(false),
    statusTersalurkan: boolean('status_tersalurkan').notNull().default(false),
    // enum('massal','single')
    viaInput: varchar('via_input', { length: 10 }),
    // disbursement address snapshot
    alamat: text('alamat'),
    noRekening: varchar('no_rekening', { length: 50 }),
    pemilikRekening: varchar('pemilik_rekening', { length: 50 }),
    namaBank: varchar('nama_bank', { length: 50 }),
    tempatLahir: varchar('tempat_lahir', { length: 50 }),
    noKartuKeluarga: varchar('no_kartu_keluarga', { length: 50 }),
    desaid: varchar('desaid', { length: 10 }),
    namaDesa: varchar('nama_desa', { length: 100 }),
    namaKecamatan: varchar('nama_kecamatan', { length: 100 }),
    namaKabupaten: varchar('nama_kabupaten', { length: 100 }),
    namaPropinsi: varchar('nama_propinsi', { length: 100 }),
    userInsert: varchar('user_insert', { length: 30 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
    userUpdate: varchar('user_update', { length: 30 }),
    dateUpdate: timestamp('date_update', { withTimezone: true }),
    externalIds: externalIds(),
  },
  (t) => [
    // natural key of the legacy composite PK (§6.4)
    unique('ajis_penyaluran_natural_uq').on(
      t.idPenyaluran,
      t.idPemasanganBaru,
      t.bulan,
      t.tahun,
    ),
    index('ajis_penyaluran_pemasangan_idx').on(t.idPemasanganBaru, t.tahun, t.bulan),
    index('ajis_penyaluran_kantor_idx').on(t.kantorId, t.tglPenyaluran.desc()),
    // the work queue: what still needs disbursing
    index('ajis_penyaluran_pending_idx')
      .on(t.kantorId, t.tahun, t.bulan)
      .where(sql`NOT status_tersalurkan`),
    index('ajis_penyaluran_tgl_brin').using('brin', t.tglPenyaluran),
    checkOneOfNullable('ajis_penyaluran_via_input_check', 'via_input', ['massal', 'single']),
  ],
);

export const transaksi = pgTable(
  'transaksi',
  {
    id: pk(),
    transid: varchar('transid', { length: 50 }).notNull(),
    detailid: smallint('detailid').notNull(),
    // enum('cash','noncash','bank','pccash','pcnoncash')
    jenisTransaksi: varchar('jenis_transaksi', { length: 10 }),
    did: varchar('did', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    progid: varchar('progid', { length: 6 }),
    idProgram: bigint('id_program', { mode: 'number' }),
    namaProgram: varchar('nama_program', { length: 100 }),
    perkiraanRp: money('perkiraan_rp'),
    hargaProgram: money('harga_program'),
    tglDonasi: date('tgl_donasi'),
    tglTransaksi: date('tgl_transaksi'),
    oidTransaksi: varchar('oid_transaksi', { length: 10 }),
    oidDonatur: varchar('oid_donatur', { length: 10 }),
    kantorTransaksi: varchar('kantor_transaksi', { length: 100 }),
    kantorDonatur: varchar('kantor_donatur', { length: 100 }),
    kantorIjis: varchar('kantor_ijis', { length: 100 }),
    kantorIdIjis: kantorId('kantor_id_ijis'),
    jmlAnakIjis: smallint('jml_anak_ijis'),
    vbayarid: varchar('vbayarid', { length: 100 }),
    mbayarid: varchar('mbayarid', { length: 100 }),
    nikRfo: varchar('nik_rfo', { length: 15 }),
    namaRfo: varchar('nama_rfo', { length: 50 }),
    valid4: varchar('valid4', { length: 50 }),
    nikClaim: varchar('nik_claim', { length: 14 }),
    jidClaim: varchar('jid_claim', { length: 6 }),
    namaClaim: varchar('nama_claim', { length: 50 }),
    approvedClaim: boolean('approved_claim').notNull().default(false),
    approvedTrans: boolean('approved_trans').notNull().default(false),
    atasNama: text('atas_nama'),
    dateGenerate: timestamp('date_generate', { withTimezone: true }),
    keterangan: text('keterangan'),
    jmlMustahik: smallint('jml_mustahik'),
    bulanDisantuni: varchar('bulan_disantuni', { length: 50 }),
    statusPasang: boolean('status_pasang').notNull().default(false),
    approveSalur: boolean('approve_salur').notNull().default(false),
    ketApproveSalur: text('ket_approve_salur'),
    userApproveSalur: varchar('user_approve_salur', { length: 50 }),
    dateApproveSalur: timestamp('date_approve_salur', { withTimezone: true }),
    deletedTrans: boolean('deleted_trans').notNull().default(false),
    deletedDetail: boolean('deleted_detail').notNull().default(false),
    review: boolean('review').notNull().default(false),
    idReview: varchar('id_review', { length: 50 }),
    cicilan: boolean('cicilan').notNull().default(false),
    bulanSalur: smallint('bulan_salur'),
    tahunSalur: smallint('tahun_salur'),
    selisihDonasi: money('selisih_donasi'),
    totalInputDonasi: money('total_input_donasi'),
    userInsertCf: varchar('user_insert_cf', { length: 50 }),
    userUpdateCf: varchar('user_update_cf', { length: 50 }),
    userInsert: varchar('user_insert', { length: 50 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
    externalIds: externalIds(),
  },
  (t) => [
    // natural key of the legacy composite PK (§6.4)
    unique('transaksi_natural_uq').on(t.transid, t.detailid),
    index('transaksi_did_idx').on(t.did, t.tglTransaksi.desc()),
    // the live set: approved and not soft-deleted
    index('transaksi_live_idx')
      .on(t.oidTransaksi, t.tglTransaksi.desc())
      .where(sql`approved_trans AND NOT deleted_trans`),
    index('transaksi_oid_idx').on(t.oidTransaksi, t.oidDonatur),
    index('transaksi_tgl_brin').using('brin', t.tglTransaksi),
    checkOneOfNullable('transaksi_jenis_check', 'jenis_transaksi', [
      'cash',
      'noncash',
      'bank',
      'pccash',
      'pcnoncash',
    ]),
  ],
);

/** Child-replacement requests. A real table despite the `view` in its name (§6.5). */
export const ajisViewAjuan = pgTable(
  'ajis_view_ajuan',
  {
    idAjuan: pk('id_ajuan'),
    tglAjuan: date('tgl_ajuan'),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 200 }),
    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 200 }),
    oidDonatur: varchar('oid_donatur', { length: 10 }),
    kantorDonatur: varchar('kantor_donatur', { length: 50 }),
    jenisKelaminDonatur: varchar('jenis_kelamin_donatur', { length: 1 }),
    jenisDonatur: varchar('jenis_donatur', { length: 100 }),
    hp: varchar('hp', { length: 50 }),
    programDonasi: varchar('program_donasi', { length: 80 }),
    niaRfo: varchar('nia_rfo', { length: 30 }),
    namaRfo: varchar('nama_rfo', { length: 80 }),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 }),
    idAnak: varchar('id_anak', { length: 30 }),
    namaAnakAsal: varchar('nama_anak_asal', { length: 200 }),
    jnsKelamin: varchar('jns_kelamin', { length: 1 }),
    alasanPergantian: varchar('alasan_pergantian', { length: 200 }),
    idAnakPengganti: varchar('id_anak_pengganti', { length: 30 }),
    namaAnakPengganti: varchar('nama_anak_pengganti', { length: 200 }),
    keterangan: varchar('keterangan', { length: 200 }),
    tipeGanti: varchar('tipe_ganti', { length: 20 }),
    pindahSaldo: money('pindah_saldo'),
    // enum('t','n','y') — three QC states. 't' is pending, not false (§6.2).
    approveFunding: varchar('approve_funding', { length: 1 }),
    tglApproveFunding: timestamp('tgl_approve_funding', { withTimezone: true }),
    alasanReject: text('alasan_reject'),
    // enum('','y','n') — NULL means not yet executed (§6.2 row 8)
    statusEksekusi: boolean('status_eksekusi'),
    tglEksekusi: date('tgl_eksekusi'),
  },
  (t) => [
    // replaces ajis_view_antrian_approval_by_rfo (§8)
    index('ajis_view_ajuan_antrian_idx')
      .on(t.niaRfo, t.tglAjuan.desc())
      .where(sql`approve_funding = 't'`),
    index('ajis_view_ajuan_scope_idx').on(t.kantorId, t.tglAjuan.desc()),
    index('ajis_view_ajuan_anak_idx').on(t.idAnak),
    checkOneOfNullable('ajis_view_ajuan_approve_funding_check', 'approve_funding', TNY),
  ],
);
