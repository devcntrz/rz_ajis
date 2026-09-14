/**
 * lib/pdf/cajCvTemplate.ts — tabular CV PDF for Calon Anak Juara.
 */
import { escapeHtml, type CajPdfModel } from '@/lib/pdf/cajPdfData';
import { cajPageCss } from '@/lib/pdf/cajPdfLayout';

function jkLabel(jns: string): string {
  const v = (jns || '').toLowerCase();
  if (v === 'l') return 'Laki-laki';
  if (v === 'p') return 'Perempuan';
  return jns || '';
}

function row(label: string, value: string): string {
  return `<tr>
    <td class="lbl">${label}</td>
    <td class="col">:</td>
    <td class="val">${escapeHtml(value)}</td>
  </tr>`;
}

export function renderCajCvHtml(d: CajPdfModel): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${cajPageCss(d.backgroundUrl)}</style>
</head>
<body>
<div class="page">
  <img class="foto" src="${d.fotoUrl}" alt="" />
  <div class="caption"><b>${escapeHtml(d.nama_panggilan)} , Islam</b></div>
  <div class="cv">
    <table>
      ${row('Nama Lengkap', d.nama_lengkap)}
      ${row('Tempat Tgl Lahir', `${d.tempat_lahir}, ${d.tgl_lahir}`)}
      ${row('Alamat', d.alamatlengkap)}
      ${row('Jenis Kelamin', jkLabel(d.jns_kel))}
      ${row('Agama', d.agama)}
      ${row('Anak ke', d.anak_ke)}
      ${row('dari', `${d.dari_saudara} saudara`)}
      ${row('Jenjang', d.jenjang_pendidikan)}
      ${row('Kelas', d.kelas)}
      ${row('Nama Sekolah', d.nama_sekolah)}
      ${row('Status', d.status_ortu)}
      ${row('Nama Ayah', d.nama_lengkap_ayah)}
      ${row('Nama Ibu', d.nama_lengkap_ibu)}
    </table>
  </div>
</div>
</body>
</html>`;
}
