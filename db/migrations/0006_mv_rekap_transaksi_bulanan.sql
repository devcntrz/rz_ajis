-- Backs Rekap Transaksi (§4 menu 16) and, with mv_zisco_agregat, replaces
-- ajis_view_rekap_zams (§8).
--
-- The reconciliation columns here also replace ajis_view_selisih_transaksi_donasi
-- and ajis_view_perbandingan_transaksi_donasi, which are FIXED rather than ported
-- (§8): the legacy views compared format(sum(...),0,'de_DE') against another
-- formatted string with <>, i.e. they compared thousand-separated text. Comparing
-- '1.000' to '1.0000' by string inequality reports differences that do not exist
-- and misses ones that do. Here both sides stay numeric.
CREATE MATERIALIZED VIEW mv_rekap_transaksi_bulanan AS
WITH trans AS (
  SELECT
    t.oid_transaksi                        AS kantor_id,
    EXTRACT(YEAR  FROM t.tgl_transaksi)::smallint AS tahun,
    EXTRACT(MONTH FROM t.tgl_transaksi)::smallint AS bulan,
    t.progid,
    COUNT(*)                               AS jml_transaksi,
    COALESCE(SUM(t.perkiraan_rp), 0)       AS total_transaksi
  FROM transaksi t
  WHERE t.approved_trans
    AND NOT t.deleted_trans
    AND NOT t.deleted_detail
    AND t.tgl_transaksi IS NOT NULL
  GROUP BY 1, 2, 3, 4
),
donasi AS (
  SELECT
    d.kantor_id,
    d.tahun,
    d.bulan,
    COUNT(*)                               AS jml_donasi,
    COALESCE(SUM(d.nominal_donasi), 0)     AS total_donasi
  FROM ajis_input_donasi d
  GROUP BY 1, 2, 3
)
SELECT
  COALESCE(t.kantor_id, d.kantor_id)       AS kantor_id,
  COALESCE(t.tahun, d.tahun)               AS tahun,
  COALESCE(t.bulan, d.bulan)               AS bulan,
  COALESCE(t.progid, '')                   AS progid,
  COALESCE(t.jml_transaksi, 0)             AS jml_transaksi,
  COALESCE(t.total_transaksi, 0)           AS total_transaksi,
  COALESCE(d.jml_donasi, 0)                AS jml_donasi,
  COALESCE(d.total_donasi, 0)              AS total_donasi,
  -- numeric, not formatted strings
  COALESCE(t.total_transaksi, 0) - COALESCE(d.total_donasi, 0) AS selisih
FROM trans t
FULL OUTER JOIN donasi d
  ON  t.kantor_id = d.kantor_id
  AND t.tahun     = d.tahun
  AND t.bulan     = d.bulan
WITH NO DATA;
--> statement-breakpoint
CREATE UNIQUE INDEX mv_rekap_transaksi_bulanan_pk
  ON mv_rekap_transaksi_bulanan (kantor_id, tahun, bulan, progid);
--> statement-breakpoint
-- the reconciliation work queue: only the rows that actually disagree
CREATE INDEX mv_rekap_transaksi_selisih_idx
  ON mv_rekap_transaksi_bulanan (kantor_id, tahun, bulan)
  WHERE selisih <> 0;
--> statement-breakpoint
REFRESH MATERIALIZED VIEW mv_rekap_transaksi_bulanan;
