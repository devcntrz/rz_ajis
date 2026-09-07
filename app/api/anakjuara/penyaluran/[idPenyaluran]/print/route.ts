/**
 * GET /api/anakjuara/penyaluran/{id}/print — formulir cetak "Laporan Penyaluran Beasiswa
 * Anak Juara" per batch (legacy PrintLaporanPenyaluran.php). HTML sederhana yang
 * auto-trigger window.print(), dibuka lewat window.open() dari tombol Print Penyaluran.
 */
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchDetail } from '@/lib/penyaluran/queries';
import { fmtRp, fmtTgl } from '@/lib/utils';

function esc(s: string | number | null | undefined): string {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

export async function GET(_req: Request, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    const rows = await fetchBatchDetail(idPenyaluran, g.session);

    if (rows.length === 0) {
      return new Response('Batch tidak ditemukan atau kosong.', { status: 404 });
    }

    const total = rows.reduce((s, r) => s + Number(r.nominal_penyaluran || 0), 0);
    const wilayah = rows[0].nama_wilayah;
    const tgl = rows[0].tgl_penyaluran;

    const body = rows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(r.no_rekening)}</td>
        <td>${esc(r.nama_anak)}</td>
        <td>${esc(r.jns_kel)}</td>
        <td>${esc(r.jenjang_pendidikan)}</td>
        <td>${esc(r.kelas)}</td>
        <td style="text-align:right">${esc(fmtRp(r.nominal_penyaluran))}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`).join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8">
<title>Laporan Penyaluran ${esc(idPenyaluran)}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
  .header { text-align: center; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #333; padding: 4px 6px; font-size: 11px; }
  th { background: #eee; }
  tfoot td { font-weight: bold; }
  .sign { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign div { text-align: center; width: 30%; }
  .sign .line { margin-top: 60px; border-top: 1px solid #333; padding-top: 4px; }
</style>
</head>
<body onload="window.print()">
  <h1>FORMULIR LAPORAN PENYALURAN BEASISWA ANAK JUARA</h1>
  <div class="header">
    Wilayah Pembinaan: <strong>${esc(wilayah)}</strong> &nbsp;·&nbsp;
    Tgl Penyaluran: <strong>${esc(fmtTgl(tgl))}</strong> &nbsp;·&nbsp;
    ID Penyaluran: <strong>${esc(idPenyaluran)}</strong>
  </div>
  <table>
    <thead>
      <tr>
        <th>No</th><th>No Rekening</th><th>Nama AJ</th><th>L/P</th><th>Jenjang</th><th>Kelas</th>
        <th>Nominal Penyaluran</th><th>Realisasi Penyaluran</th><th>Nama Pengambil</th>
        <th>Hubungan dgn AJ</th><th>Tanda Tangan</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
    <tfoot>
      <tr><td colspan="6">Total</td><td style="text-align:right">${esc(fmtRp(total))}</td><td colspan="4"></td></tr>
    </tfoot>
  </table>
  <div class="sign">
    <div><div class="line">Yang Membuat</div></div>
    <div><div class="line">Yang Memeriksa</div></div>
    <div><div class="line">Yang Menyetujui</div></div>
  </div>
</body></html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (err) {
    return toErrorResponse('penyaluran print', err);
  }
}
