-- Replaces ajis_view_rfo and ajis_view_donatur_beasiswa_by_rfo (§8).
--
-- The Zisco / Daftar Peminjam menu (§4 menu 14) no longer has a table of its own:
-- it is GROUP BY nia_rfo over ajis_pemasangan, with the RFO's profile read live
-- from zains_rz.hcm_karyawan. A consequence users must know (§4): an RFO who has
-- never been paired with a child does not appear here.
CREATE MATERIALIZED VIEW mv_zisco_agregat AS
SELECT
  pm.nia_rfo,
  pm.tahun,
  MAX(pm.nama_rfo)                                        AS nama_rfo,
  pm.kantor_id,
  COUNT(*)                                                AS jml_pemasangan,
  COUNT(*) FILTER (WHERE pm.status_pasangan)              AS jml_aktif,
  COUNT(DISTINCT pm.id_anak)                              AS jml_anak,
  COUNT(DISTINCT pm.id_donatur)                           AS jml_donatur,
  COALESCE(SUM(pm.harga_program) FILTER (WHERE pm.status_pasangan), 0) AS nilai_program_aktif,
  MAX(pm.tgl_pemasangan)                                  AS tgl_pemasangan_terakhir
FROM ajis_pemasangan pm
WHERE pm.nia_rfo IS NOT NULL AND pm.nia_rfo <> ''
GROUP BY pm.nia_rfo, pm.tahun, pm.kantor_id
WITH NO DATA;
--> statement-breakpoint
CREATE UNIQUE INDEX mv_zisco_agregat_pk
  ON mv_zisco_agregat (nia_rfo, tahun, kantor_id);
--> statement-breakpoint
CREATE INDEX mv_zisco_agregat_kantor_idx
  ON mv_zisco_agregat (kantor_id, tahun);
--> statement-breakpoint
REFRESH MATERIALIZED VIEW mv_zisco_agregat;
