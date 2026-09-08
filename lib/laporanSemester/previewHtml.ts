/**
 * lib/laporanSemester/previewHtml.ts — Lapsem preview renderer.
 *
 * SIMPLIFICATION vs the plan: the plan calls for a real-rendered PDF via
 * `puppeteer-core` + `@sparticuz/chromium` (page.pdf()). That combination adds a
 * large serverless Chromium binary as a new production dependency, needs
 * `maxDuration` tuning and cold-start handling on Vercel, and could not be
 * verified in this environment (no Vercel/production runtime available here to
 * confirm the serverless binary actually launches). Shipping it un-verified
 * risked breaking `npm run build` or timing out silently in production.
 *
 * Instead this renders the same live-from-DB data as a print-styled HTML page
 * (`@media print`, `window.print()` available via the browser's native
 * "Save as PDF"). It satisfies "live data, not a saved file" from the plan;
 * swapping in real page.pdf() output later only touches the two preview/approve
 * routes — this function's HTML is what today reaches the browser, and would
 * become the Puppeteer input unchanged.
 */
import type { LapsemRow } from '@/types/laporan-semester';

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

function fmtRp(n: number | null): string {
  return `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;
}

export function renderLapsemHtml(row: LapsemRow): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Laporan Semester — ${esc(row.laporanid)}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: 'Source Sans Pro', Arial, sans-serif; color: #1A0A00; margin: 0; }
  .cover { text-align: center; padding: 40px 0 24px; border-bottom: 3px solid #BF4E02; }
  .cover h1 { color: #BF4E02; margin: 0 0 4px; font-size: 22px; }
  .cover p { color: #7A6055; margin: 0; }
  .section { margin-top: 22px; }
  .section h2 { font-size: 14px; color: #8F3A01; border-bottom: 1px solid #F0C4A0; padding-bottom: 6px; }
  table.kv { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.kv td { padding: 5px 8px; vertical-align: top; }
  table.kv td.label { width: 220px; color: #7A6055; }
  .money { display: flex; gap: 24px; margin-top: 8px; }
  .money div { flex: 1; background: #FBF0E8; border-radius: 10px; padding: 12px; text-align: center; }
  .money .amt { font-weight: 800; font-size: 15px; color: #BF4E02; }
  .money .lbl { font-size: 11px; color: #7A6055; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="padding:8px 20px;background:#F2EAE3;font-size:12px;color:#7A6055;">
    Preview live dari database — gunakan Print / Save as PDF browser untuk menyimpan.
  </div>
  <div class="cover">
    <h1>Laporan Semester Anak Juara</h1>
    <p>${esc(row.nama_semester)} · ${esc(row.nama_program)}</p>
  </div>

  <div class="section">
    <h2>Profil Anak</h2>
    <table class="kv">
      <tr><td class="label">Nama Anak</td><td>${esc(row.nama_lengkap || row.pm_nama_lengkap)}</td></tr>
      <tr><td class="label">ID Anak</td><td>${esc(row.id_anak)}</td></tr>
      <tr><td class="label">Jenis Kelamin</td><td>${esc(row.jns_kel)}</td></tr>
      <tr><td class="label">Kantor</td><td>${esc(row.nama_kantor)}</td></tr>
      <tr><td class="label">Wilayah Pembinaan</td><td>${esc(row.nama_wilayah)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Donatur</h2>
    <table class="kv">
      <tr><td class="label">ID Donatur</td><td>${esc(row.donatur_id)}</td></tr>
      <tr><td class="label">Nama Donatur</td><td>${esc(row.donatur_nama)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Ringkasan Keuangan</h2>
    <div class="money">
      <div><div class="amt">${fmtRp(row.dana_saldo_awal_view)}</div><div class="lbl">Saldo Awal</div></div>
      <div><div class="amt">${fmtRp(row.dana_penerimaan_view)}</div><div class="lbl">Penerimaan</div></div>
      <div><div class="amt">${fmtRp(row.dana_penyaluran_view)}</div><div class="lbl">Penyaluran</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Pembinaan</h2>
    <table class="kv">
      <tr><td class="label">Jumlah Materi</td><td>${esc(row.jml_materi ?? 0)}</td></tr>
      <tr><td class="label">Status Terbuat</td><td>${row.status_terbuat === '1' ? 'Sudah dibuat' : 'Belum dibuat'}</td></tr>
    </table>
  </div>
</body>
</html>`;
}
