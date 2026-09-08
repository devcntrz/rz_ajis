/**
 * lib/pdf/lapsemTemplate.ts — renders the Lapsem PDF HTML.
 *
 * Restyled to closely match `refs/ManualLaporanPembinaanBaru.php`'s mPDF template
 * (the `semesterid >= 20` branch — the only era this app supports, per the
 * decision recorded in lib/manualLaporan/pdf.ts). Same page order, same accent
 * color (#f60) and table styling, same full-bleed background-image-per-section
 * layout at the legacy's pixel dimensions (793px wide).
 *
 * Page order: cover → profil (+ kotak pembinaan/suara anak juara) → keuangan
 * (+ foto pembinaan) → bawah (judul raport) → tabel raport (Cerdas, Mandiri,
 * Prestasi) + tanda tangan → dokumentasi pembinaan.
 *
 * Cover uses `cover_siswa` when `programid === '5'` (Sekolah Juara), else
 * `cover` — same branch as legacy. `kotak_profil_siswa`/`kotak_pembinaan_siswa`
 * vs `..._ceria`, and `bawah_siswa` vs `bawah`, follow the same programid branch.
 *
 * Image URLs are resolved through `legacyAssetUrl()`: DB columns still holding a
 * bare legacy filename are pointed at ajis.indonesiajuara.org as-is; columns
 * already migrated to a Vercel Blob URL are used unchanged.
 */
import type { ManualLaporanAspekRow, ManualLaporanData } from '@/types/laporan-semester';
import { fmtRp, fmtTgl } from '@/lib/utils';
import { legacyAssetUrl } from '@/lib/pdf/legacyAssetUrl';

function esc(s: string | number | null | undefined): string {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

/**
 * `cover`/`profil`/`kotak_*` assets are pre-sized to fill a 793×1120 page and
 * render correctly stretched. `keuangan` (and any other admin-uploaded asset that
 * isn't full-page-sized) is a smaller banner-style image with a transparent/dark
 * gradient fade below its visible content — `background-size:cover` would scale
 * that fade to fill the whole page height, painting most of the page black.
 * `100% auto` (scale to page width, keep natural aspect, anchor to top) avoids
 * that regardless of the asset's real size, and the explicit white
 * `background-color` is the fallback for whatever the image doesn't cover.
 */
function bg(url: string | null): string {
  return url
    ? `background-color:#fff;background-image:url('${esc(url)}');background-size:100% auto;background-position:top center;background-repeat:no-repeat;`
    : 'background:#f5f5f5;';
}

/** `No / Aspek / Target / Kondisi Awal / Perkembangan / Nilai` — Aspek Cerdas table. */
function tabelCerdas(rows: ManualLaporanAspekRow[]): string {
  if (rows.length === 0) return '';
  return `
    <table class="tabel_donasi">
      <thead><tr><th style="width:6%">No</th><th>Aspek Cerdas</th><th>Target</th><th>Kondisi Awal</th><th>Perkembangan</th><th>Nilai</th></tr></thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr>
            <td style="text-align:center">${i + 1}</td>
            <td>${esc(r.aspek)}</td>
            <td>${esc(r.target)}</td>
            <td>${esc(r.kondisi_awal)}</td>
            <td>${esc(r.perkembangan_capaian)}</td>
            <td>${esc(r.hasil_akhir)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

/** `No / Aspek / Target / Capaian / Skor` — Aspek Mandiri table + rata-rata skor row. */
function tabelMandiri(rows: ManualLaporanAspekRow[], rata: number, nilai: string): string {
  if (rows.length === 0) return '';
  return `
    <table class="tabel_donasi">
      <thead><tr><th style="width:6%">No</th><th>Aspek Mandiri</th><th>Target</th><th>Capaian</th><th>Skor</th></tr></thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr>
            <td style="text-align:center">${i + 1}</td>
            <td>${esc(r.aspek)}</td>
            <td style="text-align:center">${esc(r.target)}</td>
            <td style="text-align:center">${esc(r.nilai_capaian)}</td>
            <td style="text-align:center">${esc(r.skor)}</td>
          </tr>`).join('')}
        <tr>
          <td colspan="4" style="background:#ff884d;font-weight:700;text-align:center">Rata-rata Skor (Mandiri)</td>
          <td style="background:#ff884d;font-weight:700;text-align:center">${rata.toFixed(1)} (${esc(nilai)})</td>
        </tr>
      </tbody>
    </table>`;
}

function profilFields(data: ManualLaporanData): string {
  const { profil } = data;
  const isMahasiswa = profil.programid === '3';
  const isSekolah = profil.programid === '1' || profil.programid === '5';
  const rows: string[] = [
    `<tr><td class="k hl">Nama Lengkap</td><td class="c hl">:</td><td class="hl">${esc(profil.nama)}</td></tr>`,
    `<tr><td class="k">Tempat, Tanggal Lahir</td><td class="c">:</td><td>${esc(profil.tempat_lahir)}, ${esc(fmtTgl(profil.tgl_lahir))}</td></tr>`,
    `<tr><td class="k z">Anak Ke</td><td class="c z">:</td><td class="z">${esc(profil.anak_ke)} dari ${esc(profil.saudara)} bersaudara</td></tr>`,
  ];
  if (isMahasiswa) {
    rows.push(
      `<tr><td class="k">Nama Perguruan Tinggi</td><td class="c">:</td><td>${esc(profil.institusi)}</td></tr>`,
      `<tr><td class="k z">Program Studi / Semester</td><td class="c z">:</td><td class="z">${esc(profil.prodi)} / ${esc(profil.mhs_semester)}</td></tr>`,
      `<tr><td class="k z">Jurusan</td><td class="c z">:</td><td class="z">${esc(profil.jurusan)}</td></tr>`,
    );
  } else if (isSekolah) {
    rows.push(
      `<tr><td class="k">Nama Sekolah - Alamat</td><td class="c">:</td><td>${esc(profil.sekolah)}, ${esc(profil.alamat_sekolah)}</td></tr>`,
      `<tr><td class="k z">Kelas - Jenjang Sekolah</td><td class="c z">:</td><td class="z">${esc(profil.kelas)}, ${esc(profil.jenjang)}</td></tr>`,
    );
  }
  rows.push(
    `<tr><td class="k">Nama Orang Tua</td><td class="c">:</td><td>${esc(profil.nama_ortu)}</td></tr>`,
    `<tr><td class="k z">Pekerjaan Orang Tua</td><td class="c z">:</td><td class="z">${esc(profil.pekerjaan)}</td></tr>`,
  );
  return rows.join('');
}

export function renderLapsemHtml(data: ManualLaporanData): string {
  const { profil, keuangan, template } = data;
  const isSiswa = profil.programid === '5';

  const coverUrl = legacyAssetUrl(isSiswa ? template.cover_siswa : template.cover, 'template', isSiswa ? 'cover_siswa' : 'cover');
  const profilBgUrl = legacyAssetUrl(template.profil, 'template', 'profil');
  const kotakProfilUrl = legacyAssetUrl(
    isSiswa ? template.kotak_profil_siswa : template.kotak_profil_ceria,
    'template', isSiswa ? 'kotak_profil_siswa' : 'kotak_profil_ceria',
  );
  const kotakPembinaanUrl = legacyAssetUrl(
    isSiswa ? template.kotak_pembinaan_siswa : template.kotak_pembinaan_ceria,
    'template', isSiswa ? 'kotak_pembinaan_siswa' : 'kotak_pembinaan_ceria',
  );
  const keuanganUrl = legacyAssetUrl(template.keuangan, 'template', 'keuangan');
  const bawahUrl = legacyAssetUrl(isSiswa ? template.bawah_siswa : template.bawah, 'template', isSiswa ? 'bawah_siswa' : 'bawah');
  const fotoUrl = legacyAssetUrl(profil.foto, 'foto', 'foto');
  const fotoPembinaanUrl = legacyAssetUrl(profil.foto_pembinaan, 'foto', 'foto_pembinaan');
  const dokumentasiUrl = legacyAssetUrl(data.gambarDokumentasi, 'dokumentasi', 'dokumentasi');

  const goalText = isSiswa
    ? 'Goals Pembinaan Siswa Juara: mencetak generasi cerdas, mandiri, & kompetitif'
    : 'Goals Pembinaan Anak Juara: mencetak generasi cerdas, mandiri, & kompetitif';
  const jabatanTanda = isSiswa
    ? `<strong>Kepala Sekolah</strong>`
    : `Scholarship Management Cabang ${esc(profil.kota)}`;

  return `<!doctype html>
<html><head><meta charset="utf-8">
<title>Laporan Semester ${esc(profil.laporanid)}</title>
<style>
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; margin: 0; color: #404040; font-size: 12px; background:#fff; }
  h1 { font-size: 15px; font-weight: 700; color: #f60; margin: 0 0 6px; }
  /* display:flow-root establishes a new block formatting context so a child's
     margin-top never collapses with (and silently shifts) the page's own box —
     without it, e.g. .bawah-title's margin-top pushed the whole .bawah-page
     background down instead of just the text inside it. */
  .page { width: 793px; min-height: 1120px; position: relative; page-break-after: always; margin: 0 auto; padding: 20px 0; display: flow-root; }
  .page:last-child { page-break-after: auto; }
  .page.bleed { padding: 0; }

  .cover { ${bg(coverUrl)} }

  .profil-box { ${bg(profilBgUrl)} padding-top: 4px; }
  .kotak-profil { ${bg(kotakProfilUrl)} width: 694px; min-height: 410px; margin: 40px auto; position: relative; padding: 10px 0; }
  .avatar-wrap { display:flex; justify-content:flex-end; padding-right: 40px; }
  .avatar { height:168px; width:168px; object-fit:cover; border: 5px solid #f60;
    border-top-left-radius: 5em; border-top-right-radius: 5em; border-bottom-right-radius: 5em; border-bottom-left-radius: 5em; }
  .avatar-placeholder { height:168px; width:168px; background:#eee; border: 5px solid #f60; border-radius: 50%; }
  .profil-fields { width: 587px; margin: 6px auto 0; border-collapse: collapse; }
  .profil-fields td { padding: 8px 10px; vertical-align: middle; }
  .profil-fields td.k { width: 210px; }
  .profil-fields td.c { width: 14px; text-align: center; }
  .profil-fields td.z { background: #eee; }
  .profil-fields td.hl { background: #f60; color: #fff; font-weight: 700; }

  .kotak-pembinaan { ${bg(kotakPembinaanUrl)} width: 650px; min-height: 400px; margin: 20px auto 0; padding: 100px 60px 20px 70px; }
  .kotak-pembinaan .txt { text-align: justify; line-height: 1.5; }

  .keuangan-page { ${bg(keuanganUrl)} }
  .keuangan-table { width: 660px; margin: 90px auto 0; border-collapse: collapse; line-height: 1.3; }
  .keuangan-table td { padding: 8px 12px; font-size: 13px; }
  .keuangan-table tr.head td { text-align:center; background:#f60; color:#fff; font-size:14px; padding: 8px; }
  .keuangan-table tr.section td { background:#f60; color:#fff; font-weight:700; }
  .keuangan-table tr.total td { background:#eee; font-weight:700; }
  .keuangan-table tr.grand td { background:#f60; color:#fff; font-weight:700; }
  .keuangan-table td.right { text-align:right; }
  .foto-pembinaan-wrap { text-align:center; margin-top: 30px; }
  .foto-pembinaan-wrap img { width: 550px; max-height: 368px; object-fit: cover; }

  .bawah-page { ${bg(bawahUrl)} }
  .bawah-title { margin: 200px 0 0 110px; width: 560px; font-size: 14px; }
  .bawah-title .goal { text-align:center; margin-top: 24px; font-style: italic; }

  .raport-page { padding: 30px 40px; }
  table.tabel_donasi { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  table.tabel_donasi th, table.tabel_donasi td { padding: 8px 10px; border: 1px solid #ddd; }
  table.tabel_donasi th { background:#f60; color:#fff; text-align:left; font-weight:700; }
  table.tabel_donasi tbody tr:nth-child(odd) td { background:#fbfbfb; }
  table.tabel_donasi tbody tr:nth-child(even) td { background:#eee; }
  .signature { margin-top: 30px; text-align:right; line-height: 1.6; }
  .free-text { background:#FBF0E8; border-radius:8px; padding:14px; white-space:pre-wrap; margin-bottom: 16px; }

  .dokumentasi-page { ${bg(dokumentasiUrl)} }
</style>
</head>
<body>

  <div class="page bleed cover"></div>

  <div class="page bleed profil-box">
    <div class="kotak-profil">
      <div class="avatar-wrap">
        ${fotoUrl ? `<img class="avatar" src="${esc(fotoUrl)}" />` : `<div class="avatar-placeholder"></div>`}
      </div>
      <table class="profil-fields"><tbody>${profilFields(data)}</tbody></table>
    </div>

    <div class="kotak-pembinaan">
      <div class="txt">${esc(data.suaraAnakJuara) || 'Belum ada data.'}</div>
    </div>
  </div>

  <div class="page bleed keuangan-page">
    <table class="keuangan-table"><tbody>
      <tr class="head"><td colspan="2">
        <strong>LAPORAN SUMBER &amp; PENGGUNAAN DANA<br/>
        ${esc(profil.nama_program)}<br/>
        Bapak/Ibu : ${esc(profil.donatur_nama)}<br/>
        (Rupiah)</strong>
      </td></tr>
      <tr class="section"><td colspan="2">I. Penerimaan</td></tr>
      <tr><td>Saldo Beasiswa</td><td class="right">Rp. ${esc(fmtRp(keuangan.saldo_awal))}</td></tr>
      <tr><td>Penerimaan Beasiswa</td><td class="right">Rp. ${esc(fmtRp(keuangan.penerimaan))}</td></tr>
      <tr class="total"><td><strong>Total Penerimaan</strong></td><td class="right"><strong>Rp. ${esc(fmtRp(keuangan.jml_penerimaan))}</strong></td></tr>
      <tr class="section"><td colspan="2">II. Penyaluran</td></tr>
      <tr><td>Penyaluran Beasiswa</td><td class="right">Rp. ${esc(fmtRp(keuangan.penyaluran))}</td></tr>
      <tr class="total"><td><strong>Total Penyaluran</strong></td><td class="right"><strong>Rp. ${esc(fmtRp(keuangan.penyaluran))}</strong></td></tr>
      <tr class="grand"><td><strong>III. Saldo Akhir (I - II)</strong></td><td class="right"><strong>Rp. ${esc(fmtRp(keuangan.saldo_akhir))}</strong></td></tr>
    </tbody></table>
    ${fotoPembinaanUrl ? `<div class="foto-pembinaan-wrap"><img src="${esc(fotoPembinaanUrl)}" /></div>` : ''}
  </div>

  <div class="page bleed bawah-page">
    <div class="bawah-title">
      Periode ${esc(profil.nama_semester)}
      <div class="goal">&ldquo;${esc(goalText)}&rdquo;</div>
    </div>
  </div>

  <div class="page raport-page">
    ${tabelCerdas(data.aspekCerdas)}
    ${tabelMandiri(data.aspekMandiri, data.skorMandiriRata, data.skorMandiriNilai)}
    ${data.prestasi.length ? `
      <table class="tabel_donasi">
        <thead><tr><th style="width:6%">No</th><th>Prestasi</th></tr></thead>
        <tbody>${data.prestasi.map((p, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(p.prestasi)}</td></tr>`).join('')}</tbody>
      </table>` : ''}
    ${data.catatanPembinaan ? `<div class="free-text"><strong>Catatan Pembinaan</strong><br/>${esc(data.catatanPembinaan)}</div>` : ''}
    <div class="signature">
      ${esc(profil.kota)}, ${esc(profil.tgl_hari_ini)}<br/><br/>
      ${jabatanTanda}
    </div>
  </div>

  <div class="page bleed dokumentasi-page"></div>

</body></html>`;
}
