/**
 * db/schema/user.ts — authentication and access.
 *
 * Conversions:
 *   · ajis_user.password (MD5) is DROPPED (§3.3) — login is Google SSO matched on email
 *   · email added as UNIQUE, the SSO match key
 *   · username text → varchar(50)
 *   · id_wilayah_pembinaan varchar(50) → bigint (§6.3)
 *   · id_kantor varchar(10) → kantor_id varchar(10), one spelling (§6.3)
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { kantorId, wilayahId } from './_shared';

export const ajisGroupUser = pgTable('ajis_group_user', {
  idGroupUser: bigserial('id_group_user', { mode: 'number' }).primaryKey(),
  // 'superadmin' | 'spmd' | 'mentor_wilayah' (§3.1)
  groupUser: varchar('group_user', { length: 20 }).notNull().unique(),
  keterangan: varchar('keterangan', { length: 100 }),
  aktif: boolean('aktif').notNull().default(true),
});

export const ajisUser = pgTable(
  'ajis_user',
  {
    idUser: bigserial('id_user', { mode: 'number' }).primaryKey(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    // The SSO match key (§3.3). No auto-provisioning: no row, no access.
    email: varchar('email', { length: 100 }).unique(),
    nik: varchar('nik', { length: 13 }),
    kantorId: kantorId(),
    namaKantor: varchar('nama_kantor', { length: 30 }),
    idWilayahPembinaan: wilayahId(),
    namaWilayah: varchar('nama_wilayah', { length: 50 }),
    idGroupUser: bigint('id_group_user', { mode: 'number' }).references(
      () => ajisGroupUser.idGroupUser,
    ),
    aktif: boolean('aktif').notNull().default(true),
    userInsert: varchar('user_insert', { length: 50 }),
    dateInsert: timestamp('date_insert', { withTimezone: true }),
  },
  (t) => [
    index('ajis_user_scope_idx').on(t.kantorId, t.idWilayahPembinaan),
    index('ajis_user_aktif_idx').on(t.email).where(sql`aktif`),
  ],
);

export const ajisUserAkses = pgTable(
  'ajis_user_akses',
  {
    userid: bigint('userid', { mode: 'number' })
      .notNull()
      .references(() => ajisUser.idUser, { onDelete: 'cascade' }),
    levelid: integer('levelid').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userid, t.levelid] }),
    index('ajis_user_akses_levelid_idx').on(t.levelid),
  ],
);
