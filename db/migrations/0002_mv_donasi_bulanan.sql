-- Replaces ajis_view_donasi and ajis_view_donasi_kantor (§8).
--
-- The legacy view pivoted Jan–Dec with twelve correlated subqueries and was
-- itself nested inside ajis_view_anak_juara, so every page load re-ran the whole
-- pivot. Here it is materialised once and refreshed on a schedule (§9.5, §10.6).
--
-- ajis_view_donasi_kantor is not a separate object: aggregate this by kantor_id.
CREATE MATERIALIZED VIEW mv_donasi_bulanan AS
SELECT
  d.id_pemasangan_baru,
  d.tahun,
  d.kantor_id,
  d.id_wilayah_pembinaan,
  d.id_anak,
  d.id_donatur,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  1), 0) AS jan,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  2), 0) AS feb,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  3), 0) AS mar,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  4), 0) AS apr,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  5), 0) AS mei,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  6), 0) AS jun,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  7), 0) AS jul,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  8), 0) AS ags,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan =  9), 0) AS sep,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan = 10), 0) AS okt,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan = 11), 0) AS nov,
  COALESCE(SUM(d.nominal_donasi) FILTER (WHERE d.bulan = 12), 0) AS des,
  COALESCE(SUM(d.nominal_donasi), 0) AS total,
  COUNT(*) AS jml_transaksi
FROM ajis_input_donasi d
GROUP BY d.id_pemasangan_baru, d.tahun, d.kantor_id,
         d.id_wilayah_pembinaan, d.id_anak, d.id_donatur
WITH NO DATA;
--> statement-breakpoint
-- REFRESH ... CONCURRENTLY requires a unique index. Without it the scheduled
-- refresh takes an ACCESS EXCLUSIVE lock and readers block.
CREATE UNIQUE INDEX mv_donasi_bulanan_pk
  ON mv_donasi_bulanan (id_pemasangan_baru, tahun);
--> statement-breakpoint
CREATE INDEX mv_donasi_bulanan_kantor_idx
  ON mv_donasi_bulanan (kantor_id, tahun);
--> statement-breakpoint
REFRESH MATERIALIZED VIEW mv_donasi_bulanan;
