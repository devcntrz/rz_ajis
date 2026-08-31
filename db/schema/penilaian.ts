/**
 * db/schema/penilaian.ts — semester evaluation, one row per assessed item.
 *
 * Conversions:
 *   · PK (id_anak, semesterid, aspek) was >250 bytes wide and the table had NO
 *     secondary index at all → bigserial PK, that triple as UNIQUE, plus the
 *     three §7.2 indexes
 *   · tampil int → boolean
 *   · id_item_penilaian is a real integer FK now; ajis_view_penilaian used to
 *     pivot on the string literals '1'…'30' (§8)
 *   · the five *_postgree columns → external_ids (§6.1)
 */
import {
  bigint,
  bigserial,
  boolean,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { externalIds, kantorId } from './_shared';
import { ajisAnak } from './anak';
import { ajisItemPenilaian, ajisSemester } from './setting';

export const ajisPenilaian = pgTable(
  'ajis_penilaian',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    idAnak: varchar('id_anak', { length: 25 })
      .notNull()
      .references(() => ajisAnak.idAnak),
    namaAnak: varchar('nama_anak', { length: 150 }),
    semesterid: varchar('semesterid', { length: 10 })
      .notNull()
      .references(() => ajisSemester.semesterid),
    kategori: varchar('kategori', { length: 100 }),
    aspek: varchar('aspek', { length: 150 }).notNull(),
    idItemPenilaian: bigint('id_item_penilaian', { mode: 'number' }).references(
      () => ajisItemPenilaian.id,
    ),
    target: text('target'),
    kondisiAwal: text('kondisi_awal'),
    nilaiCapaian: smallint('nilai_capaian'),
    perkembanganCapaian: text('perkembangan_capaian'),
    skor: smallint('skor'),
    // 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor' — derived, see
    // scoreToNilai() in lib/utils.ts
    hasilAkhir: varchar('hasil_akhir', { length: 20 }),
    keterangan: text('keterangan'),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 100 }),
    idWilayahPembinaan: bigint('id_wilayah_pembinaan', { mode: 'number' }),
    namaWilayah: varchar('nama_wilayah', { length: 100 }),
    tampil: boolean('tampil').notNull().default(true),
    viaInput: varchar('via_input', { length: 20 }),
    tglInsert: timestamp('tgl_insert', { withTimezone: true }),
    externalIds: externalIds(),
  },
  (t) => [
    // natural key of the legacy composite PK (§6.4)
    unique('ajis_penilaian_natural_uq').on(t.idAnak, t.semesterid, t.aspek),
    // §7.2 — legacy had no secondary index whatsoever
    index('ajis_penilaian_anak_semester_idx').on(t.idAnak, t.semesterid),
    index('ajis_penilaian_semester_kantor_idx').on(t.semesterid, t.kantorId),
    index('ajis_penilaian_item_idx').on(t.idItemPenilaian, t.semesterid),
  ],
);
