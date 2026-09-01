-- Extensions required by the §7 index plan.
-- Must precede every generated migration: GIN trigram indexes on nama_lengkap /
-- nama_anak / nama_donatur reference gin_trgm_ops, which does not exist until
-- pg_trgm is installed.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- Lets a GIN index mix a trigram column with plain btree columns in one index.
CREATE EXTENSION IF NOT EXISTS btree_gin;
