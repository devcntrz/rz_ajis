DROP INDEX "ajis_opname_natural_idx";--> statement-breakpoint
ALTER TABLE "ajis_opname" ADD CONSTRAINT "ajis_opname_natural_uq" UNIQUE("tahun","id_pemasangan_baru");