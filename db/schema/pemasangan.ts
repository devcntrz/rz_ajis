/**
 * db/schema/pemasangan.ts — donor↔child sponsorship pairing (PRD §4 menu 5) and
 * the yearly balance stock-take.
 *
 * Conversions:
 *   · ajis_pemasangan 5-column PK → identity PK; id_pemasangan_baru becomes UNIQUE.
 *     Legacy had it only as a non-unique KEY even though every other table joins
 *     to it — the single most consequential fix in §6.4.
 *   · ajis_opname 5-column PK → identity PK, natural key (tahun, id_pemasangan_baru)
 *   · enum('y','n') status_pasangan, enum('n','y') status_saldo → boolean (§6.2)
 *   · year(4) tahun → smallint (§6.1)
 *   · int/double saldo & harga columns → numeric (§6.1)
 *   · the eight `*_postgree` / `*_erpwh` columns → external_ids (§6.1)
 *   · legacy 8-column KEY tahun on ajis_opname is dropped — it served almost no
 *     predicate (§7.1)
 *
 * There is deliberately NO FK on id_donatur or nia_rfo: those are zains_rz
 * snapshot fields, not internal relations (§6.1).
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
import { externalIds, kantorId, money, pk } from './_shared';
import { ajisAnak } from './anak';
import { ajisKantor } from './kantor';
import { ajisWilayahPembinaan, sdmWilayah } from './sdm';

export const ajisPemasangan = pgTable(
  'ajis_pemasangan',
  {
    id: pk(),
    // The natural key. UNIQUE here is what makes the seed's ON CONFLICT and every
    // downstream join sound.
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 }).notNull().unique(),
    tahun: smallint('tahun').notNull(),
    tglPemasangan: date('tgl_pemasangan'),
    tglPemberhentianPemasangan: date('tgl_pemberhentian_pemasangan'),

    // zains_rz snapshot — no FK by design
    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    niaRfo: varchar('nia_rfo', { length: 50 }),
    namaRfo: varchar('nama_rfo', { length: 150 }),

    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    namaAnak: varchar('nama_anak', { length: 150 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    kelas: varchar('kelas', { length: 50 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    asnaf: varchar('asnaf', { length: 50 }),
    statusOrtu: varchar('status_ortu', { length: 50 }),
    statusAj: varchar('status_aj', { length: 50 }),
    nik: varchar('nik', { length: 50 }),
    noRekening: varchar('no_rekening', { length: 50 }),

    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }).references(
      () => ajisWilayahPembinaan.idWilayahPembinaan,
    ),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    kantorId: kantorId().references(() => ajisKantor.oid),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idSdm: bigint('id_sdm', { mode: 'number' }).references(() => sdmWilayah.idSdm),
    namaMentor: varchar('nama_mentor', { length: 100 }),
    statusMentor: boolean('status_mentor').notNull().default(false),

    programDonasi: varchar('program_donasi', { length: 50 }),
    idProgram: bigint('id_program', { mode: 'number' }),
    programSebelumnya: varchar('program_sebelumnya', { length: 40 }),
    hargaProgram: money('harga_program'),
    hargaPenyaluran: money('harga_penyaluran'),

    statusPasangan: boolean('status_pasangan').notNull().default(false),
    keteranganPemberhentian: text('keterangan_pemberhentian'),
    saldoAwal: money('saldo_awal'),
    statusSaldo: boolean('status_saldo').notNull().default(false),
    saldoAkhir: money('saldo_akhir'),
    statusSaldoAkhir: varchar('status_saldo_akhir', { length: 10 }),
    updatedSaldo: timestamp('updated_saldo', { withTimezone: true }),

    cek: varchar('cek', { length: 100 }),
    tundaPenyaluran: varchar('tunda_penyaluran', { length: 50 }),
    idNaikJenjang: varchar('id_naik_jenjang', { length: 100 }),
    viaInput: varchar('via_input', { length: 50 }),
    history: varchar('history', { length: 1 }),
    userStop: varchar('user_stop', { length: 50 }),
    viaStop: varchar('via_stop', { length: 50 }),
    alasanAktif: varchar('alasan_aktif', { length: 50 }),
    pinjam: text('pinjam'),

    userInsert: varchar('user_insert', { length: 30 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
    userUpdate: varchar('user_update', { length: 30 }),
    dateUpdate: timestamp('date_update', { withTimezone: true }),

    externalIds: externalIds(),
  },
  (t) => [
    // §7.2 — the Anak Juara list predicate
    index('ajis_pemasangan_tahun_kantor_idx').on(t.tahun, t.kantorId, t.statusPasangan),
    index('ajis_pemasangan_aktif_idx')
      .on(t.kantorId, t.tahun)
      .where(sql`status_pasangan`),
    index('ajis_pemasangan_anak_idx').on(t.idAnak, t.tahun),
    index('ajis_pemasangan_donatur_idx').on(t.idDonatur, t.tahun),
    // legacy never indexed nia_rfo despite joining on it (§7.2)
    index('ajis_pemasangan_nia_rfo_idx').on(t.niaRfo, t.tahun),
    // keyset pagination cursor (§9.3)
    index('ajis_pemasangan_keyset_idx').on(t.namaAnak, t.id),
    index('ajis_pemasangan_nama_anak_trgm_idx').using('gin', t.namaAnak.op('gin_trgm_ops')),
    index('ajis_pemasangan_nama_donatur_trgm_idx').using('gin', t.namaDonatur.op('gin_trgm_ops')),
  ],
);

export const ajisPemasanganLog = pgTable(
  'ajis_pemasangan_log',
  {
    idLog: pk('id_log'),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 }).notNull(),
    tglPemasangan: date('tgl_pemasangan'),
    tglPemberhentianPemasangan: date('tgl_pemberhentian_pemasangan'),
    idDonatur: varchar('id_donatur', { length: 30 }),
    namaDonatur: varchar('nama_donatur', { length: 150 }),
    idAnak: varchar('id_anak', { length: 25 }),
    namaAnak: varchar('nama_anak', { length: 150 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    programDonasi: varchar('program_donasi', { length: 50 }),
    idProgram: bigint('id_program', { mode: 'number' }),
    hargaProgram: money('harga_program'),
    hargaPenyaluran: money('harga_penyaluran'),
    keteranganPemberhentian: text('keterangan_pemberhentian'),
    statusPasangan: boolean('status_pasangan'),
    saldoAwal: money('saldo_awal'),
    statusSaldo: boolean('status_saldo'),
    statusMentor: boolean('status_mentor'),
    programSebelumnya: varchar('program_sebelumnya', { length: 40 }),
    jnsKel: varchar('jns_kel', { length: 1 }),
    kelas: varchar('kelas', { length: 50 }),
    jenjangPendidikan: varchar('jenjang_pendidikan', { length: 10 }),
    asnaf: varchar('asnaf', { length: 50 }),
    statusOrtu: varchar('status_ortu', { length: 50 }),
    statusAj: varchar('status_aj', { length: 50 }),
    idSdm: bigint('id_sdm', { mode: 'number' }),
    namaMentor: varchar('nama_mentor', { length: 100 }),
    nik: varchar('nik', { length: 50 }),
    noRekening: varchar('no_rekening', { length: 50 }),
    cek: varchar('cek', { length: 100 }),
    niaRfo: varchar('nia_rfo', { length: 50 }),
    namaRfo: varchar('nama_rfo', { length: 150 }),
    userInsert: varchar('user_insert', { length: 30 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
    userUpdate: varchar('user_update', { length: 30 }),
    dateUpdate: timestamp('date_update', { withTimezone: true }),
    updated: timestamp('updated', { withTimezone: true }),
    deleted: timestamp('deleted', { withTimezone: true }),
  },
  (t) => [
    index('ajis_pemasangan_log_pemasangan_idx').on(t.idPemasanganBaru),
    index('ajis_pemasangan_log_anak_idx').on(t.idAnak),
  ],
);

export const ajisOpname = pgTable(
  'ajis_opname',
  {
    id: pk(),
    tahun: smallint('tahun').notNull(),
    idPemasanganBaru: varchar('id_pemasangan_baru', { length: 100 })
      .notNull()
      .references(() => ajisPemasangan.idPemasanganBaru),
    idAnak: varchar('id_anak', { length: 25 }),
    idDonatur: varchar('id_donatur', { length: 30 }),
    programDonasi: varchar('program_donasi', { length: 100 }),
    idProgram: bigint('id_program', { mode: 'number' }),

    saldoAwalGanjil: money('saldo_awal_ganjil'),
    tupoJanJun: varchar('tupo_jan_jun', { length: 100 }),
    dateOpnameGanjil: timestamp('date_opname_ganjil', { withTimezone: true }),
    userOpnameGanjil: varchar('user_opname_ganjil', { length: 100 }),
    saldoAkhirGanjil: money('saldo_akhir_ganjil'),

    saldoAwalGenap: money('saldo_awal_genap'),
    tupoJulDes: varchar('tupo_jul_des', { length: 100 }),
    dateOpnameGenap: timestamp('date_opname_genap', { withTimezone: true }),
    userOpnameGenap: varchar('user_opname_genap', { length: 100 }),
    saldoAkhirGenap: money('saldo_akhir_genap'),

    kantorId: kantorId(),
    keterangan: text('keterangan'),
    userInput: varchar('user_input', { length: 50 }),
    userUpdate: varchar('user_update', { length: 100 }),
    updated: timestamp('updated', { withTimezone: true }),

    externalIds: externalIds(),
  },
  (t) => [
    // Natural key of the legacy 5-column PK (§6.4). Must be a UNIQUE CONSTRAINT,
    // not merely an index: ON CONFLICT can only target a constraint, so a plain
    // index would make the seed's idempotence a fiction.
    unique('ajis_opname_natural_uq').on(t.tahun, t.idPemasanganBaru),
    index('ajis_opname_pemasangan_idx').on(t.idPemasanganBaru),
    // replaces ajis_view_saldo_anak_habis_by_rfo / _urgent_by_rfo (§8)
    index('ajis_opname_saldo_habis_idx')
      .on(t.tahun, t.kantorId)
      .where(sql`saldo_akhir_genap <= 0`),
  ],
);
