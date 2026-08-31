#!/usr/bin/env node
/**
 * scripts/dump-to-fixtures.mjs — one-shot converter: legacy MySQL dump → seed fixtures.
 *
 *   npm run db:fixtures
 *
 * Reads refs/sipc_ijf_sample.sql (5 sample rows per legacy table) and writes
 * db/seed/<postgres_table>.json, applying every PRD §6 conversion rule on the way.
 *
 * The output is COMMITTED AND REVIEWED. That is the entire point of splitting this
 * from seed.mjs: it turns ~65 invisible enum-mapping decisions into a text diff a
 * human can check in a PR, instead of burying them inside regex at seed time.
 *
 * ENCODING NOTE: this dump is pure ASCII — scripts/export-sample-db.mjs produced it
 * through mysql2, which already decoded latin1 into JS strings. That is a property
 * of THIS file, not evidence that transcoding is unnecessary. The real migration-day
 * ETL (PRD §13) still must transcode latin1 → UTF-8.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DUMP = path.resolve('refs/sipc_ijf_sample.sql');
const OUT_DIR = path.resolve('db/seed');

// ---------------------------------------------------------------------------
// Boolean encodings. Legacy used six different ones for the same concept (§6.2).
// ---------------------------------------------------------------------------
const YN = { y: true, n: false, '': null };            // enum('y','n')
const NY = { n: false, y: true, '': null };            // enum('n','y')
const ZO = { 0: false, 1: true, '': null };            // enum('0','1')
const ADA = { tidak: false, ada: true, '': null };     // enum('tidak','ada')
const INT01 = { 0: false, 1: true, '': null };         // int(1) used as a flag

/**
 * Columns that must NOT become boolean even though they look binary.
 * enum('y','t') and enum('t','n','y') carry a *pending* state; flattening 't' to
 * false silently destroys it and the loss only surfaces in reporting (§6.2).
 */
const THREE_STATE = new Set([
  'keaktifan_edukasi', 'status_approve', 'approve_funding', 'approval_ijf',
  'status_foto', 's_foto_pembinaan', 'status_ssh', 'status_raport_ceria',
  'status_raport_satu', 'status_raport_dua', 's_materi',
]);

const NULL_DATES = new Set(['0000-00-00', '0000-00-00 00:00:00', '', '1970-01-01']);

// ---------------------------------------------------------------------------
// Per-table conversion spec.
// ---------------------------------------------------------------------------
//   target      destination Postgres table
//   conflict    ON CONFLICT target used by seed.mjs (the natural key)
//   drop        legacy columns to discard entirely
//   rename      { legacy: new }
//   booleans    { column: encodingMap }
//   dates       columns where '0000-00-00' etc. become NULL
//   ints        columns coerced to integer (bulan/tahun were varchar in legacy)
//   money       columns emitted as decimal STRINGS, never JS numbers (§6.1)
//   externalIds legacy columns collapsed into one external_ids object (§6.1)
//   omit        columns present in the fixture source but assigned by the sequence
const TABLES = {
  ref_propinsi: {
    target: 'ref_propinsi', conflict: '(propid)',
    booleans: { aktif: YN },
  },
  ref_kabupaten: {
    target: 'ref_kabupaten', conflict: '(kabid)',
    booleans: { aktif: YN, kota: ZO },
    dates: ['updated'],
  },
  ref_kecamatan: {
    target: 'ref_kecamatan', conflict: '(camatid)',
    booleans: { aktif: YN }, dates: ['updated'],
  },
  ref_desa: {
    target: 'ref_desa', conflict: '(desaid)',
    booleans: { aktif: YN, kelurahan: YN },
  },
  pekerjaan: {
    target: 'ref_pekerjaan', conflict: '(kerjaid)',
    defaults: { aktif: true },
  },
  kantor: {
    target: 'kantor', conflict: '(oid)',
    booleans: { aktif: YN },
    externalIds: ['id_kantor', 'id_kantor_postgree'],
  },
  ajis_kantor: {
    target: 'ajis_kantor', conflict: '(oid)',
    drop: ['id'],
    externalIds: ['oid_rz', 'id_kantor_postgree'],
  },
  hcm_kantor: {
    target: 'map_kantor', conflict: '(id_kantor_zains)',
    rename: {
      id_kantor: 'id_kantor_zains', kantor: 'nama_kantor',
      id_kantorold: 'kantor_id',
    },
    booleans: { aktif: YN },
    ints: ['id_kantor_level'],
    drop: ['alamat', 'kota', 'kode_pos', 'telpon', 'fax', 'kantorid'],
  },
  ajis_group_user: {
    target: 'ajis_group_user', conflict: '(group_user)',
    booleans: { aktif: YN }, omit: ['id_group_user'],
  },
  ajis_user: {
    target: 'ajis_user', conflict: '(username)',
    // The MD5 password column is deliberately dropped — auth is SSO now (§3.3).
    drop: ['password'],
    rename: { id_kantor: 'kantor_id' },
    booleans: { aktif: YN },
    ints: ['id_group_user', 'id_wilayah_pembinaan'],
    dates: ['date_insert'],
    omit: ['id_user'],
  },
  ajis_semester: {
    target: 'ajis_semester', conflict: '(semesterid)',
    booleans: { onprogress: NY },
    dates: ['tgl_awal', 'tgl_akhir', 'tgl_awal_donasi', 'tgl_akhir_donasi',
            'tgl_awal_saldo', 'tgl_akhir_saldo'],
    omit: ['id'],
  },
  ajis_harga: {
    target: 'ajis_harga', conflict: '(id_harga)',
    booleans: { ceria: YN },
    money: ['harga_program', 'harga_penyaluran', 'beasiswa', 'transport'],
    ints: ['frekuensi'],
  },
  ajis_item_hafalan: { target: 'ajis_item_hafalan', conflict: '(id)', ints: ['jenis'] },
  ajis_item_penilaian: {
    target: 'ajis_item_penilaian', conflict: '(id)',
    booleans: { is_parent: YN },
  },
  setting_program: {
    target: 'setting_program', conflict: '(id_program)',
    booleans: { aktif: YN, dana_pengelola: YN },
    dates: ['tgl_digulirkan', 'tgl_inaktif', 'tgl_insert', 'tgl_change_status'],
    money: ['harga_program', 'harga_penyaluran', 'nominal_dp', 'nominal_dss',
            'persentase_dp', 'persentase_dss'],
    ints: ['id_program', 'pdanaid'],
    externalIds: ['id_program_postgree'],
    omit: ['id'],
  },
  ajis_wilayah_pembinaan: {
    target: 'ajis_wilayah_pembinaan', conflict: '(nama_wilayah)',
    booleans: { aktif: YN },
    dates: ['date_insert', 'date_update'],
    omit: ['id_wilayah_pembinaan'],
  },
  ajis_sdm_wilayah: {
    target: 'sdm_wilayah', conflict: '(id_sdm)',
    booleans: { aktif: YN },
    dates: ['tgl_bergabung', 'tgl_keluar', 'date_insert', 'date_update'],
  },
  ajis_jabatan_sdm: {
    target: 'sdm_penugasan', conflict: '(id_penugasan)',
    rename: { id_jabatan_sdm: 'id_penugasan' },
    ints: ['id_sdm', 'id_wilayah_pembinaan'],
    dates: ['date_insert', 'date_update'],
  },
  ajis_anak: {
    target: 'ajis_anak', conflict: '(id_anak)',
    booleans: {
      status_survey: YN, status_kelayakan: YN, status_pinjam: YN,
      status_mentor: YN, aktif: YN,
      alumni_juara: YN,          // enum('','y','n') — '' maps to null (§6.2 row 8)
      tidak_serumah_ortu: YN,
    },
    dates: ['tgl_lahir', 'tgl_terdaftar', 'tgl_pengajuan', 'tgl_peminjaman',
            'tgl_expired', 'tanggal_kematian_ayah', 'tanggal_kematian_ibu'],
    money: ['penghasilan_rata_rata_ayah', 'penghasilan_rata_rata_ibu',
            'penghasilan_rata_rata_wali', 'penghasilan_tinggal'],
    ints: ['anak_ke', 'dari_saudara', 'semester', 'id_wilayah_pembinaan', 'id_sdm'],
    externalIds: ['oid_rz', 'id_kantor_postgree', 'id_ijgs_anak', 'upload_gdrive'],
  },
  ajis_data_prestasi: {
    // `id` is kept, not omitted: it is the only unique thing about these rows, so
    // without it ON CONFLICT has no target and re-seeding would duplicate them.
    target: 'ajis_data_prestasi', conflict: '(id)',
    booleans: { show: INT01 }, dates: ['tgl'],
  },
  ajis_pemasangan: {
    target: 'ajis_pemasangan', conflict: '(id_pemasangan_baru)',
    booleans: { status_pasangan: YN, status_saldo: NY, status_mentor: YN },
    dates: ['tgl_pemasangan', 'tgl_pemberhentian_pemasangan', 'date_insert',
            'date_update', 'updated_saldo'],
    money: ['harga_program', 'harga_penyaluran', 'saldo_awal', 'saldo_akhir'],
    ints: ['tahun', 'id_program', 'id_wilayah_pembinaan', 'id_sdm'],
    externalIds: ['id_anak_postgree', 'id_program_postgree', 'id_donatur_postgree',
                  'id_peminjaman_postgree', 'id_pinjam_postgree',
                  'id_pemasangan_postgree', 'id_donatur_erpwh',
                  'id_zisco_resuser_erpwh', 'id_anak_erpwh', 'id_peminjaman_erpwh',
                  'id_kantor_erpwh', 'jcustid', 'id_pemasangan_new'],
  },
  ajis_pemasangan_log: {
    target: 'ajis_pemasangan_log', conflict: '(id_log)',
    booleans: { status_pasangan: YN, status_saldo: NY, status_mentor: NY },
    dates: ['tgl_pemasangan', 'tgl_pemberhentian_pemasangan', 'date_insert',
            'date_update', 'updated', 'deleted'],
    money: ['harga_program', 'harga_penyaluran', 'saldo_awal'],
    ints: ['id_program', 'id_wilayah_pembinaan', 'id_sdm'],
    drop: ['id_pemasangan'],
  },
  ajis_opname: {
    target: 'ajis_opname', conflict: '(tahun, id_pemasangan_baru)',
    rename: { id_kantor: 'kantor_id' },
    dates: ['date_opname_ganjil', 'date_opname_genap', 'updated'],
    money: ['saldo_awal_ganjil', 'saldo_akhir_ganjil', 'saldo_awal_genap',
            'saldo_akhir_genap'],
    ints: ['tahun', 'id_program'],
    externalIds: ['jcustid', 'id_pemasangan_new'],
  },
  ajis_input_donasi: {
    target: 'ajis_input_donasi', conflict: '(id_input_donasi)',
    money: ['pilihan_donasi', 'nominal_donasi'],
    ints: ['qty', 'bulan', 'tahun', 'detailid', 'id_program', 'id_wilayah_pembinaan'],
    dates: ['tgl_transaksi', 'date_insert', 'date_update'],
    externalIds: ['id_transaksi_postgree', 'id_pemasangan_postgree', 'id_anak_postgree',
                  'id_donatur_postgree', 'id_program_postgree', 'jcustid',
                  'id_pemasangan_new'],
    drop: ['id_pemasangan', 'periode'],
  },
  ajis_penyaluran: {
    target: 'ajis_penyaluran',
    conflict: '(id_penyaluran, id_pemasangan_baru, bulan, tahun)',
    rename: { id_kantor: 'kantor_id' },
    booleans: { status_akhir: NY, status_tersalurkan: NY },
    money: ['nominal_penyaluran', 'nominal_hpp', 'saldo_akhir_ganjil'],
    ints: ['bulan', 'tahun', 'detailid', 'id_program', 'id_sdm',
           'id_wilayah_pembinaan', 'id_input_donasi'],
    dates: ['tgl_penyaluran', 'date_insert', 'date_update'],
    externalIds: ['id_pemasangan_postgree', 'id_kantor_postgree',
                  'id_penyaluran_postgree', 'jcustid', 'id_pemasangan_new'],
    drop: ['id_row', 'id_pemasangan'],
  },
  transaksi: {
    target: 'transaksi', conflict: '(transid, detailid)',
    rename: { approved_transaksi: 'approved_trans', id_kantor_ijis: 'kantor_id_ijis' },
    booleans: {
      approved_claim: YN, approved_trans: YN, status_pasang: NY,
      approve_salur: YN, deleted_trans: NY, deleted_detail: NY,
      review: NY, cicilan: NY,
    },
    money: ['perkiraan_rp', 'harga_program', 'selisih_donasi', 'total_input_donasi'],
    ints: ['detailid', 'jml_mustahik', 'jml_anak_ijis', 'bulan_salur',
           'tahun_salur', 'id_program'],
    dates: ['tgl_donasi', 'tgl_transaksi', 'date_generate', 'date_approve_salur',
            'date_insert'],
    externalIds: ['id_donatur_postgree', 'id_program_postgree', 'id_kantor_postgree',
                  'id_kantor_zains', 'id_transaksi_postgree', 'id_donatur_erp_wh',
                  'id_program_erp_wh', 'jcustid'],
  },
  ajis_view_ajuan: {
    target: 'ajis_view_ajuan', conflict: '(id_ajuan)',
    rename: { id_kantor: 'kantor_id' },
    // status_eksekusi is enum('','y','n') → nullable boolean;
    // approve_funding is enum('t','n','y') → stays a character (three QC states)
    booleans: { status_eksekusi: YN },
    money: ['pindah_saldo'],
    ints: ['id_wilayah_pembinaan'],
    dates: ['tgl_ajuan', 'tgl_eksekusi', 'tgl_approve_funding'],
    drop: ['jcustid'],
    // id_ajuan kept for the same reason as ajis_data_prestasi.id above
  },
  ajis_pembinaan_baru: {
    target: 'ajis_pembinaan_baru', conflict: '(id_row)',
    booleans: { tampil: YN },
    ints: ['bulan', 'tahun', 'id_wilayah_pembinaan', 'pembiasaan_shalat_wajib',
           'pembiasaan_tilawah', 'pembiasaan_sedekah', 'membantu_ortu'],
    dates: ['tgl_pembinaan', 'date_insert', 'date_update'],
    externalIds: ['id_anak_postgree', 'id_pembinaan_postgree', 'id_kantor_postgree'],
  },
  ajis_hafalan: {
    target: 'ajis_hafalan', conflict: '(id_anak, semesterid, konten_uji)',
    dates: ['tgl_pengujian', 'tgl_insert'],
    ints: ['id_item_hafalan'],
    externalIds: ['id_anak_postgree'],
    // Legacy id_hafalan was nullable and not a key; the sequence assigns it now.
    omit: ['id_hafalan'],
  },
  ajis_dokumentasi_pembinaan: {
    target: 'ajis_dokumentasi_pembinaan',
    conflict: '(semesterid, kantor_id, id_wilayah_pembinaan)',
    ints: ['id_wilayah_pembinaan'],
    externalIds: ['id_kantor_postgree', 'id_ijgs_dokumentasi', 'upload_gdrive'],
  },
  ajis_penilaian: {
    target: 'ajis_penilaian', conflict: '(id_anak, semesterid, aspek)',
    booleans: { tampil: INT01 },
    ints: ['nilai_capaian', 'skor', 'id_item_penilaian', 'id_wilayah_pembinaan'],
    dates: ['tgl_insert'],
    externalIds: ['id_anak_postgree', 'id_kantor_postgree', 'id_penilaian_postgree',
                  'id_item_postgree', 'id_kategori_postgree'],
  },
  ajis_survey: {
    target: 'ajis_survey', conflict: '(id_survey)',
    booleans: { bantuan_rutin_dari_lembaga_lain: ADA },
    money: ['biaya_pendidikan_spp_perbulan', 'jml_bantuan_rutin_dari_lembaga_lain'],
    ints: ['jml_tanggungan_kepala_keluarga'],
    dates: ['tgl_survey', 'tgl_pengajuan', 'date_insert', 'date_update'],
    externalIds: ['id_anak_odoo'],
  },
  ajis_peminjam: {
    target: 'ajis_peminjam', conflict: '(id_peminjam)',
    dates: ['date_insert', 'date_update'],
    externalIds: ['id_user_erpwh'],
    omit: ['id'],
  },
  ajis_peminjaman_anak: {
    target: 'ajis_peminjaman_anak', conflict: '(id_peminjaman)',
    booleans: { status_pinjam: YN, status_terpasangkan: YN, cancel: YN },
    dates: ['tgl_awal_peminjaman', 'tgl_selesai_peminjaman', 'tgl_expired', 'date_insert'],
  },
  manual_laporan: {
    target: 'manual_laporan', conflict: '(laporanid)',
    booleans: {
      aktif: YN, s_perkembangan_siswa: YN, status_terbuat: INT01,
      status_terkirim_fundraising: INT01, status_terkirim_donatur: INT01,
    },
    money: ['dana_saldo_awal', 'dana_penerimaan', 'dana_penyaluran'],
    ints: ['pm_anak_ke', 'pm_saudara', 'pm_mhs_semester', 'pembinaan_jml_anak',
           'programid', 'tahun', 'formatid', 'id_wilayah_pembinaan',
           'wajib_materi', 'jml_materi', 'jml_materi_tampil', 'jml_prestasi',
           'wajib_materi_bulan', 'jml_materi_tampil_bulan', 's_raport'],
    dates: ['pm_tgl_lahir', 'tgl_update_keuangan', 'tgl_status_terbuat',
            'tgl_status_terkirim_fundraising', 'tgl_status_terkirim_donatur',
            'tgl_insert'],
    externalIds: ['id_anak_postgree', 'id_kantor_postgree', 'id_pemasangan_postgree',
                  'id_donatur_postgree', 'id_program_postgree',
                  'id_pemasangan_mutakhir', 'id_ijgs_foto_lapsem', 'upload_gdrive'],
    drop: ['id_pemasangan'],
    defaults: { versi_struktur: 'baru' },
  },
  manual_laporan_pembinaan: {
    target: 'manual_laporan_pembinaan', conflict: '(laporanid, detailid)',
    booleans: { aktif: YN }, ints: ['detailid'],
    dates: ['tanggal', 'date_insert'], omit: ['id'],
  },
  manual_laporan_prestasi: {
    target: 'manual_laporan_prestasi', conflict: '(id_prestasi)',
    booleans: { aktif: YN },
    ints: ['id_wilayah_pembinaan'],
    dates: ['waktu_awal', 'waktu_akhir', 'date_insert'],
  },
  materi: {
    target: 'materi', conflict: '(id_materi)',
    ints: ['id_wilayah_pembinaan'], dates: ['tanggal'],
  },
};

/** Dropped outright (§6.5) — the menus they backed are now aggregations. */
const DROPPED = {
  donatur: 'Menu Donatur is an aggregation of ajis_pemasangan; profiles come from corez_donatur',
  program: 'duplicate of setting_program; kredit_account absorbed there',
  ajis_propinsi: 'duplicate of ref_propinsi',
};

/** Not part of the ~40-table target. */
const OUT_OF_SCOPE = {
  ajis_hafalan_temp: 'staging table', ajis_penilaian_temp: 'staging table',
  ajis_penyaluran_temp: 'staging table', manual_laporan_temp: 'staging table',
  materi_temp: 'staging table', perkembangan_temp: 'staging table',
  transaksi_temp: 'staging table', donatur_rfo_temp: 'staging table',
  ajis_input_donasi_bb: 'backup copy', ajis_opname_bb: 'backup copy',
  ajis_opname_bbx: 'backup copy', ajis_pemasangan_bb: 'backup copy',
  donatur_20190326: 'dated backup copy',
  ajis_pembinaan_new: 'abandoned redesign', ajis_wilayah_pembinaan_new: 'abandoned redesign',
  transaksi_baru: 'abandoned redesign',
  wh_anak_juara: 'warehouse export, not a source of truth',
  manual_laporan_lama: 'DDL absent from the dump (§6.6) — merged into manual_laporan once obtained',
  corez_campaign: 'lives in zains_rz (§5.1)', corez_payment: 'lives in zains_rz (§5.1)',
  bank: 'lives in zains_rz', distribution: 'lives in zains_rz',
  setting_campaign: 'lives in zains_rz', setting_program_donol: 'superseded by setting_program',
  ajis_user_akses: 'access levels are re-derived from ajis_group_user (§3.1)',
  ajis_batas_expired_peminjaman: 'redirected to app_setting below',
  ajis_periode_penilaian: 'redirected to app_setting below',
  ajis_fungsi_struktur: 'reconstructed as ref_fungsi_struktur (§6.6) — not in the dump',
};

// ---------------------------------------------------------------------------
// Parser. Character-by-character, not regex: the dump contains quoted text with
// commas and parentheses, which regex splitting gets wrong.
// ---------------------------------------------------------------------------
function parseInserts(sqlText) {
  const out = new Map(); // table -> { columns, rows }
  const re = /INSERT INTO `(\w+)` \(([^)]+)\) VALUES\s*/g;
  let m;
  while ((m = re.exec(sqlText)) !== null) {
    const table = m[1];
    const columns = m[2].split(',').map((c) => c.trim().replace(/`/g, ''));
    const { rows, end } = scanValues(sqlText, re.lastIndex);
    re.lastIndex = end;
    const existing = out.get(table);
    if (existing) existing.rows.push(...rows);
    else out.set(table, { columns, rows });
  }
  return out;
}

function scanValues(s, start) {
  const rows = [];
  let i = start;
  while (i < s.length) {
    while (i < s.length && /[\s,]/.test(s[i])) i++;
    if (s[i] !== '(') break;
    i++;
    const row = [];
    let buf = '';
    let inStr = false;
    let isNull = true; // a bare NULL token has no quotes
    for (; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (ch === '\\') {
          const next = s[++i];
          buf += next === 'n' ? '\n' : next === 't' ? '\t' : next === 'r' ? '\r' : next;
        } else if (ch === "'") {
          if (s[i + 1] === "'") { buf += "'"; i++; }   // '' escape
          else inStr = false;
        } else buf += ch;
      } else if (ch === "'") {
        // Anything buffered before the opening quote is separator whitespace
        // (`VALUES (a, 'b')`), not part of the value.
        buf = '';
        inStr = true;
        isNull = false;
      } else if (ch === ',') {
        row.push(finish(buf, isNull)); buf = ''; isNull = true;
      } else if (ch === ')') {
        row.push(finish(buf, isNull)); i++; break;
      } else buf += ch;
    }
    rows.push(row);
    while (i < s.length && /\s/.test(s[i])) i++;
    if (s[i] === ';') { i++; break; }
  }
  return { rows, end: i };
}

function finish(buf, isNull) {
  if (!isNull) return buf;
  const t = buf.trim();
  return t === '' || t.toUpperCase() === 'NULL' ? null : t;
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------
function convertRow(legacyTable, spec, columns, values) {
  const raw = Object.fromEntries(columns.map((c, i) => [c, values[i] ?? null]));
  const row = {};
  const ext = {};
  const drop = new Set(spec.drop ?? []);
  const omit = new Set(spec.omit ?? []);
  const extCols = new Set(spec.externalIds ?? []);
  const dates = new Set(spec.dates ?? []);
  const money = new Set(spec.money ?? []);
  const ints = new Set(spec.ints ?? []);

  for (const [col, value] of Object.entries(raw)) {
    if (drop.has(col) || omit.has(col)) continue;

    if (extCols.has(col)) {
      if (value !== null && value !== '') ext[col] = value;
      continue;
    }

    const name = spec.rename?.[col] ?? col;

    if (spec.booleans?.[col] !== undefined) {
      if (THREE_STATE.has(col)) {
        throw new Error(
          `${legacyTable}.${col} is a three-state column (§6.2) and must not be ` +
            'mapped to boolean. Remove it from the spec\'s `booleans`.',
        );
      }
      const map = spec.booleans[col];
      const key = value === null ? '' : String(value).trim().toLowerCase();
      const mapped = map[key];
      row[name] = mapped === undefined ? null : mapped;
      continue;
    }

    if (value === null) { row[name] = null; continue; }

    if (dates.has(col)) {
      row[name] = NULL_DATES.has(value.trim()) ? null : value;
      continue;
    }
    if (money.has(col)) {
      // decimal STRING — a JS number would round-trip through a float (§6.1)
      const n = String(value).trim();
      row[name] = n === '' ? null : n;
      continue;
    }
    if (ints.has(col)) {
      const n = String(value).trim();
      row[name] = n === '' || Number.isNaN(Number(n)) ? null : Number(n);
      continue;
    }
    row[name] = value === '' ? null : value;
  }

  if (spec.externalIds) row.external_ids = Object.keys(ext).length ? ext : null;
  Object.assign(row, spec.defaults ?? {});

  // Omit null keys rather than emitting them. For a nullable column the result is
  // identical; for a NOT NULL column carrying a DEFAULT (every `aktif` flag, say)
  // it is the difference between taking the default and failing the constraint.
  for (const k of Object.keys(row)) if (row[k] === null) delete row[k];
  return row;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const text = await readFile(DUMP, 'utf8');

// The dump is very nearly pure ASCII, but not entirely: at least
// manual_laporan_prestasi carries "Qurâ€™an" — a UTF-8 right single quote that
// was read as latin1 somewhere upstream, i.e. mojibake already baked into the
// source file. It is harmless for a 5-row seed but is exactly the class of
// damage the migration-day ETL (PRD §13) must get right, so it is surfaced
// rather than silently copied.
const mojibake = text.match(/[ÃÂâ][-¿]{1,2}/g);
if (mojibake) {
  const sample = [...new Set(mojibake)].slice(0, 5).join(' ');
  console.warn(
    `! ${mojibake.length} likely mojibake sequence(s) in the dump (${sample}).\n` +
      '  Already damaged at the source — fixtures reproduce it verbatim.\n' +
      '  The real ETL must transcode latin1 → UTF-8 properly.',
  );
}

const parsed = parseInserts(text);
await mkdir(OUT_DIR, { recursive: true });

const written = [];
const skipped = [];
const unhandled = [];

for (const [legacyTable, { columns, rows }] of parsed) {
  if (DROPPED[legacyTable]) { skipped.push(['drop', legacyTable, DROPPED[legacyTable]]); continue; }
  if (OUT_OF_SCOPE[legacyTable]) {
    skipped.push(['skip', legacyTable, OUT_OF_SCOPE[legacyTable]]);
    continue;
  }
  const spec = TABLES[legacyTable];
  if (!spec) { unhandled.push(legacyTable); continue; }

  const converted = rows.map((r) => convertRow(legacyTable, spec, columns, r));
  const file = path.join(OUT_DIR, `${spec.target}.json`);
  await writeFile(
    file,
    `${JSON.stringify({ table: spec.target, source: legacyTable, conflict: spec.conflict, rows: converted }, null, 2)}\n`,
  );
  written.push([spec.target, converted.length, legacyTable]);
}

// The two config tables that become app_setting rows (§6.5).
const periode = parsed.get('ajis_periode_penilaian');
const batas = parsed.get('ajis_batas_expired_peminjaman');
const settings = [];
if (batas) {
  const col = batas.columns.indexOf('jml_hari');
  for (const r of batas.rows) {
    settings.push({
      key: 'peminjaman.batas_expired_hari',
      value: r[col],
      keterangan: 'was ajis_batas_expired_peminjaman (§6.5)',
    });
  }
}
if (periode) {
  const idx = (c) => periode.columns.indexOf(c);
  for (const r of periode.rows) {
    settings.push({
      key: `penilaian.periode.${r[idx('id_periode_penilaian')]}`,
      value: JSON.stringify({
        nama: r[idx('periode_penilaian')],
        tgl_awal: NULL_DATES.has(r[idx('tgl_awal')] ?? '') ? null : r[idx('tgl_awal')],
        tgl_akhir: NULL_DATES.has(r[idx('tgl_akhir')] ?? '') ? null : r[idx('tgl_akhir')],
        aktif: String(r[idx('aktif')] ?? '').toLowerCase() === 'y',
      }),
      keterangan: 'was ajis_periode_penilaian (§6.5)',
    });
  }
}
if (settings.length) {
  await writeFile(
    path.join(OUT_DIR, 'app_setting.json'),
    `${JSON.stringify({ table: 'app_setting', source: 'ajis_periode_penilaian + ajis_batas_expired_peminjaman', conflict: '(key)', rows: settings }, null, 2)}\n`,
  );
  written.push(['app_setting', settings.length, 'merged config tables']);
}

console.log('\nFixtures written:');
for (const [t, n, src] of written.sort()) {
  console.log(`  ${t.padEnd(28)} ${String(n).padStart(3)} rows   ← ${src}`);
}
console.log('\nNot converted:');
for (const [kind, t, why] of skipped.sort((a, b) => a[1].localeCompare(b[1]))) {
  console.log(`  [${kind}] ${t.padEnd(30)} ${why}`);
}

if (unhandled.length) {
  console.error(
    `\n✗ ${unhandled.length} dumped table(s) match no rule — add them to TABLES, ` +
      `DROPPED, or OUT_OF_SCOPE so nothing is lost silently:\n  ${unhandled.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(`\n✓ ${written.length} fixture files in db/seed/`);
