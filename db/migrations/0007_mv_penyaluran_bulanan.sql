-- Replaces ajis_view_penyaluran and ajis_view_penyaluran_kantor (§8).
-- Same shape as mv_donasi_bulanan so the Anak Juara list can join both pivots
-- on (id_pemasangan_baru, tahun) without reshaping either.
CREATE MATERIALIZED VIEW mv_penyaluran_bulanan AS
SELECT
  p.id_pemasangan_baru,
  p.tahun,
  p.kantor_id,
  p.id_wilayah_pembinaan,
  p.id_anak,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  1), 0) AS jan,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  2), 0) AS feb,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  3), 0) AS mar,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  4), 0) AS apr,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  5), 0) AS mei,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  6), 0) AS jun,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  7), 0) AS jul,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  8), 0) AS ags,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan =  9), 0) AS sep,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan = 10), 0) AS okt,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan = 11), 0) AS nov,
  COALESCE(SUM(p.nominal_penyaluran) FILTER (WHERE p.bulan = 12), 0) AS des,
  COALESCE(SUM(p.nominal_penyaluran), 0) AS total,
  COALESCE(SUM(p.nominal_hpp), 0) AS total_hpp,
  COUNT(*) FILTER (WHERE NOT p.status_tersalurkan) AS jml_belum_salur
FROM ajis_penyaluran p
WHERE p.id_pemasangan_baru IS NOT NULL
GROUP BY p.id_pemasangan_baru, p.tahun, p.kantor_id,
         p.id_wilayah_pembinaan, p.id_anak
WITH NO DATA;
--> statement-breakpoint
CREATE UNIQUE INDEX mv_penyaluran_bulanan_pk
  ON mv_penyaluran_bulanan (id_pemasangan_baru, tahun);
--> statement-breakpoint
CREATE INDEX mv_penyaluran_bulanan_kantor_idx
  ON mv_penyaluran_bulanan (kantor_id, tahun);
--> statement-breakpoint
REFRESH MATERIALIZED VIEW mv_penyaluran_bulanan;
