/**
 * lib/pdf/cajSuratTemplate.ts — narrative Surat PDF for Calon Anak Juara.
 */
import { escapeHtml, isFilled, type CajPdfModel } from '@/lib/pdf/cajPdfData';
import { cajPageCss } from '@/lib/pdf/cajPdfLayout';

function householdNarrative(d: CajPdfModel): string {
  const tinggal = d.tinggal_bersama;
  if (tinggal === 'Ayah dan Ibu') {
    return ` ayah saya yang bernama ${escapeHtml(d.nama_lengkap_ayah)} dan Ibu saya bernama ${escapeHtml(d.nama_lengkap_ibu)}. Pekerjaan ayah saya adalah ${escapeHtml(d.pekerjaan_ayah)} dengan penghasilan perbulan kurang lebih Rp${escapeHtml(d.gaji_ayah)}. Ayah saya bekerja keras menafkahi kami sekeluarga dan membiayai saya bersekolah. `;
  }
  if (tinggal === 'Ayah') {
    return `${escapeHtml(tinggal)} saya yang bernama ${escapeHtml(d.nama_lengkap_ayah)}. Pekerjaan ${escapeHtml(tinggal)} saya adalah ${escapeHtml(d.pekerjaan_ayah)} dengan penghasilan perbulan kurang lebih Rp${escapeHtml(d.gaji_ayah)}. ${escapeHtml(tinggal)} saya bekerja keras menafkahi kami sekeluarga dan membiayai saya bersekolah.`;
  }
  if (tinggal === 'Ibu') {
    return `${escapeHtml(tinggal)} saya yang bernama ${escapeHtml(d.nama_lengkap_ibu)}. Pekerjaan ${escapeHtml(tinggal)} saya adalah ${escapeHtml(d.pekerjaan_ibu)} dengan penghasilan perbulan kurang lebih Rp${escapeHtml(d.gaji_ibu)}. ${escapeHtml(tinggal)} saya bekerja keras menafkahi kami sekeluarga dan membiayai saya bersekolah.`;
  }
  return `${escapeHtml(tinggal)} saya yang bernama ${escapeHtml(d.nama_lengkap_wali)}. Pekerjaan ${escapeHtml(tinggal)} saya adalah ${escapeHtml(d.pekerjaan_wali)} dengan penghasilan perbulan kurang lebih Rp${escapeHtml(d.gaji_wali)}. ${escapeHtml(tinggal)} saya bekerja keras menafkahi kami sekeluarga dan membiayai saya bersekolah.`;
}

function orphanNarrative(d: CajPdfModel): string {
  if (d.status_ortu === 'Yatim Piatu') {
    return ` Ayah saya meninggal ${escapeHtml(d.tahun_ayah)} yang lalu. Sedangkan Ibu saya meninggal ${escapeHtml(d.tahun_ibu)} yang lalu. Mereka selalu menjadi panutan saya.`;
  }
  if (d.status_ortu === 'Yatim') {
    return ` Ayah saya meninggal ${escapeHtml(d.tahun_ayah)} yang lalu. Beliau selalu menjadi panutan saya.`;
  }
  if (d.status_ortu === 'Piatu') {
    return ` Ibu saya meninggal ${escapeHtml(d.tahun_ibu)} yang lalu. Beliau selalu menjadi panutan saya.`;
  }
  return '';
}

function educationParagraph(d: CajPdfModel): string {
  const isPt = isFilled(d.nama_pt);
  if (!isPt) {
    const alamat = isFilled(d.alamat_sekolah)
      ? ` yang beralamat di ${escapeHtml(d.alamat_sekolah)}`
      : '';
    return `Saat ini saya sedang menempuh pendidikan di ${escapeHtml(d.nama_sekolah)}${alamat} kelas ${escapeHtml(d.kelas)}. Alhamdulillah saya sangat senang belajar disana karena kawan-kawan saya baik dan lingkungannya pun menyenangkan. Nilai Rapot terakhir saya sejak bersekolah disana adalah ${escapeHtml(d.nilai)} dan pelajaran favorit saya adalah ${escapeHtml(d.pelajaran_favorit)}.`;
  }
  const alamat = isFilled(d.alamat_pt)
    ? ` yang beralamat di ${escapeHtml(d.alamat_pt)}`
    : '';
  return `Saat ini saya sedang menempuh pendidikan di ${escapeHtml(d.nama_pt)}${alamat} jurusan ${escapeHtml(d.jurusan)} semester ${escapeHtml(d.semester)}. Alhamdulillah saya sangat senang belajar disana karena kawan-kawan saya baik dan lingkungannya pun menyenangkan. Nilai IPK terakhir saya sejak berkuliah disana adalah ${escapeHtml(d.nilai)} dan mata kuliah favorit saya adalah ${escapeHtml(d.pelajaran_favorit)}.`;
}

export function renderCajSuratHtml(d: CajPdfModel): string {
  const isPt = isFilled(d.nama_pt);
  const prestasi = isFilled(d.prestasi)
    ? `Selama masa sekolah, saya juga berusaha untuk terus berkembang dan mencatat beberapa pencapaian pribadi, seperti ${escapeHtml(d.prestasi)} dan saya juga senang ${escapeHtml(d.hobi)}.`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${cajPageCss(d.backgroundUrl)}</style>
</head>
<body>
<div class="page">
  <img class="foto" src="${d.fotoUrl}" alt="" />
  <div class="surat">
    <p>Assalamualaikum Wr Wb</p>
    <p>Bapak/Ibu perkenalkan nama saya <b>${escapeHtml(d.nama_lengkap)}</b>, saya lahir di ${escapeHtml(d.tempat_lahir)} pada tanggal ${escapeHtml(d.tgl_lahir)}. Saat ini saya bertempat tinggal di ${escapeHtml(d.alamatlengkap)} bersama ${householdNarrative(d)}${orphanNarrative(d)} ${escapeHtml(d.ket_tinggal)} Saya adalah anak ke ${escapeHtml(d.anak_ke)} dari ${escapeHtml(d.dari_saudara)} bersaudara.</p>
    <p>${educationParagraph(d)}</p>
    <p>Jarak dari rumah saya ke ${isPt ? 'kampus' : 'sekolah'} sejauh ${escapeHtml(d.jarak_rumah)} dan saya menempuhnya setiap hari dengan ${escapeHtml(d.alat_transportasi)}. Saya mensyukuri hal tersebut sebagai bagian dari perjuangan saya dalam menuntut ilmu. ${prestasi}</p>
    <p>Terima kasih karena bersedia menjadi calon donatur saya, saya akan bersekolah dengan baik dan rajin sehingga bisa membuat orang tua saya dan Bapak/Ibu sebagai donatur saya bangga. Saya doakan semoga Bapak/Ibu mempunyai kehidupan yang indah, berkah dan penuh rahmat dari Allah SWT.</p>
    <p class="sign">Tertanda<br /><b>${escapeHtml(d.nama_lengkap)}</b></p>
  </div>
</div>
</body>
</html>`;
}
