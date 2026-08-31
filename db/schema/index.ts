/**
 * db/schema/index.ts — barrel consumed by drizzle-kit only.
 *
 * MIGRATION INPUT. Never import this (or anything under db/schema/) from app/ or
 * lib/ — route handlers use raw SQL through lib/pg.ts (PRD §2.1 rule 1).
 */
export * from './ref';
export * from './kantor';
export * from './setting';
export * from './user';
export * from './sdm';
export * from './anak';
export * from './pemasangan';
export * from './keuangan';
export * from './pembinaan';
export * from './penilaian';
export * from './survey';
export * from './laporan';
