-- Backs the Donatur menu (§4 menu 13), which has NO table of its own — the legacy
-- `donatur` table was dropped (§6.5). Donor profiles come live from
-- zains_rz.corez_donatur; this view supplies the AJIS-side sponsorship totals.
--
-- Consequence users must know (§4): a donor never paired with a child does not
-- appear in the AJIS Donatur menu at all — that is zains_rz's concern.
CREATE MATERIALIZED VIEW mv_donatur_agregat AS
SELECT
  pm.id_donatur,
  pm.tahun,
  MAX(pm.nama_donatur)                                    AS nama_donatur,
  pm.kantor_id,
  COUNT(*)                                                AS jml_pemasangan,
  COUNT(*) FILTER (WHERE pm.status_pasangan)              AS jml_aktif,
  COUNT(DISTINCT pm.id_anak)                              AS jml_anak,
  COALESCE(SUM(pm.harga_program) FILTER (WHERE pm.status_pasangan), 0) AS nilai_program_aktif,
  COALESCE(SUM(pm.saldo_akhir), 0)                        AS total_saldo,
  MIN(pm.tgl_pemasangan)                                  AS tgl_pemasangan_pertama,
  MAX(pm.tgl_pemasangan)                                  AS tgl_pemasangan_terakhir
FROM ajis_pemasangan pm
WHERE pm.id_donatur IS NOT NULL AND pm.id_donatur <> ''
GROUP BY pm.id_donatur, pm.tahun, pm.kantor_id
WITH NO DATA;
--> statement-breakpoint
CREATE UNIQUE INDEX mv_donatur_agregat_pk
  ON mv_donatur_agregat (id_donatur, tahun, kantor_id);
--> statement-breakpoint
CREATE INDEX mv_donatur_agregat_kantor_idx
  ON mv_donatur_agregat (kantor_id, tahun);
--> statement-breakpoint
REFRESH MATERIALIZED VIEW mv_donatur_agregat;
