/**
 * db/schema/kantor.ts — office tables.
 *
 * Both `kantor` and `ajis_kantor` are kept (§6.5): they carry different relations.
 *   · kantor.oid       ← manual_laporan.oid, materi.oid
 *   · ajis_kantor.oid  ← ajis_anak.kantor_id, ajis_pemasangan.kantor_id
 *
 * `map_kantor` is new (§5.5): bridges zains_rz hcm_kantor ids to AJIS office ids,
 * replacing the legacy practice of copying hcm_kantor into this database.
 */
import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { externalIds, kantorId } from './_shared';

export const kantor = pgTable('kantor', {
  oid: varchar('oid', { length: 10 }).primaryKey(),
  kantor: varchar('kantor', { length: 50 }),
  alamat: varchar('alamat', { length: 100 }),
  oidParent: varchar('oid_parent', { length: 10 }),
  level: integer('level'),
  aktif: boolean('aktif').notNull().default(true),
  idOffice: varchar('id_office', { length: 50 }),
  omid: varchar('omid', { length: 20 }),
  // absorbs id_kantor, id_kantor_postgree (§6.1)
  externalIds: externalIds(),
});

export const ajisKantor = pgTable('ajis_kantor', {
  // legacy PK was a surrogate `id`; `oid` is what every other table actually joins on,
  // so it becomes the primary key and the fat KEY(oid)/KEY(kantor) pair goes away.
  oid: varchar('oid', { length: 10 }).primaryKey(),
  kantor: varchar('kantor', { length: 30 }),
  alamat: varchar('alamat', { length: 50 }),
  noTelp: varchar('no_telp', { length: 15 }),
  oidParent: varchar('oid_parent', { length: 10 }),
  oidParentSecond: varchar('oid_parent_second', { length: 10 }),
  jenis: varchar('jenis', { length: 50 }),
  // absorbs oid_rz, id_kantor_postgree (§6.1)
  externalIds: externalIds(),
});

/** New in §5.5 — the only sanctioned place an AJIS query learns a zains office id. */
export const mapKantor = pgTable('map_kantor', {
  // hcm_kantor.id_kantor in zains_rz
  idKantorZains: varchar('id_kantor_zains', { length: 10 }).primaryKey(),
  kantorId: kantorId().notNull(),
  namaKantor: varchar('nama_kantor', { length: 100 }),
  idKantorParent: varchar('id_kantor_parent', { length: 10 }),
  idKantorLevel: integer('id_kantor_level'),
  coa: varchar('coa', { length: 15 }),
  coaOutlet: varchar('coa_outlet', { length: 15 }),
  aktif: boolean('aktif').notNull().default(true),
});
