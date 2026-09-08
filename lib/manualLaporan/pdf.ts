/**
 * lib/manualLaporan/pdf.ts — data assembler for the Lapsem PDF.
 *
 * Ported from the PDF-assembly methods living in
 * `modules/ajis/class/LaporanPembinaanBaruClass.php` (there is no separate
 * `ManualLaporanPembinaanBaruClass.php` — that split does not exist in the
 * legacy codebase, confirmed by research):
 *  - DetailAnakJuara()        → assembleProfil()      + assembleKeuangan()
 *  - PembinaanAnakJuara()     → assemblePembinaan()
 *  - RaportAnakJuaraCerdas/Mandiri/Kompetitif() → assembleRaport()
 *  - getTotalSkorMandiri()    → embedded in assembleRaport()
 *  - RaportAnakJuaraPrestasi()→ assemblePrestasi() (table `ajis_data_prestasi`)
 *  - getSuaraAnakJuara()/getCatatanPembinaan() → assembleSuaraDanCatatan()
 *
 * Era-based branching (`semesterid < 16`, static scanned raport images with no
 * data tables) is NOT ported — per the plan, only the current "digital raport"
 * format (semester >= 17) is supported; historical PDFs stop rendering with
 * data tables if opened for very old semesters. This should be confirmed with
 * the product owner before old semesters are exposed in the UI (called out in
 * the plan itself as needing confirmation, not assumed here).
 *
 * All reads go through lib/db.ts (MySQL, `?` placeholders) — CLAUDE.md §2.1.
 */
import { query, queryOne } from '@/lib/db';
import { SEMESTER_TEMPLATE_FIELDS } from '@/types/semester';
import type { Semester } from '@/types/semester';
import type {
  ManualLaporanAspekRow, ManualLaporanData, ManualLaporanKeuangan,
  ManualLaporanPembinaanRow, ManualLaporanPrestasiRow, ManualLaporanProfil,
} from '@/types/laporan-semester';

function programName(programid: string | null): string {
  switch (programid) {
    case '1': return 'Beasiswa Anak Juara SD-SMA';
    case '3': return 'Beasiswa Anak Juara Mahasiswa';
    case '5': return 'Beasiswa Sekolah Juara SD - SMK';
    default: return '';
  }
}

/** `kota` ported from DetailAnakJuara()'s REPLACE-chain: strip the office-type prefix. */
function kotaFromNamaKantor(namaKantor: string | null): string {
  return (namaKantor ?? '')
    .replace(/^IJIS\s*Cabang\s*/i, '')
    .replace(/^IJIS\s*/i, '')
    .replace(/^SD\s*Juara\s*/i, '')
    .replace(/^SMP\s*Juara\s*/i, '')
    .replace(/^SMA\s*Juara\s*/i, '')
    .trim();
}

function tglHariIni(): string {
  return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface ManualLaporanRawRow {
  laporanid: string; id_anak: string; jns_kel: string;
  pm_nama_lengkap: string; pm_tempat_lahir: string; pm_tgl_lahir: string;
  pm_anak_ke: string; pm_saudara: string; pm_nama_orang_tua: string; pm_pekerjaan: string;
  pm_anak_nama_sekolah: string; pm_anak_alamat_sekolah: string; pm_anak_kelas: string;
  pm_anak_jenjang: string; pm_mhs_institusi: string; pm_mhs_prodi: string;
  pm_mhs_semester: string; pm_mhs_jurusan: string; foto: string | null;
  foto_pembinaan: string | null;
  programid: string; donatur_nama: string; donatur_alamat: string;
  oid: string; nama_kantor: string; id_wilayah_pembinaan: string; nama_wilayah: string;
  semesterid: string;
  dana_saldo_awal: number; dana_penerimaan: number; dana_penyaluran: number;
  pembinaan_perkembangan: string | null;
  suara_anak_juara: string | null;
  gambar_dokumentasi: string | null;
}

/**
 * `gambar_dokumentasi` is not a `manual_laporan` column — legacy's `DetailAnakJuara()`
 * LEFT JOINs `ajis_dokumentasi_pembinaan` on `oid = kantor_id AND semesterid = semesterid`
 * and takes its `image` column.
 */
async function fetchManualLaporanRow(laporanid: string): Promise<ManualLaporanRawRow | null> {
  return queryOne<ManualLaporanRawRow>(
    `SELECT l.laporanid, l.id_anak, l.jns_kel,
            l.pm_nama_lengkap, l.pm_tempat_lahir, l.pm_tgl_lahir, l.pm_anak_ke, l.pm_saudara,
            l.pm_nama_orang_tua, l.pm_pekerjaan, l.pm_anak_nama_sekolah, l.pm_anak_alamat_sekolah,
            l.pm_anak_kelas, l.pm_anak_jenjang, l.pm_mhs_institusi, l.pm_mhs_prodi, l.pm_mhs_semester,
            l.pm_mhs_jurusan, l.foto, l.foto_pembinaan, l.programid, l.donatur_nama, l.donatur_alamat,
            l.oid, l.nama_kantor, l.id_wilayah_pembinaan, l.nama_wilayah, l.semesterid,
            l.dana_saldo_awal, l.dana_penerimaan, l.dana_penyaluran,
            l.pembinaan_perkembangan, l.suara_anak_juara,
            p.image AS gambar_dokumentasi
     FROM manual_laporan l
     LEFT JOIN ajis_dokumentasi_pembinaan p ON l.oid = p.kantor_id AND l.semesterid = p.semesterid
     WHERE l.laporanid = ?
     LIMIT 1`,
    [laporanid],
  );
}

function assembleProfil(row: ManualLaporanRawRow, semesterLabel: string): ManualLaporanProfil {
  return {
    laporanid:      row.laporanid,
    id_anak:        row.id_anak,
    nama:           row.pm_nama_lengkap,
    jns_kel:        row.jns_kel,
    tempat_lahir:   row.pm_tempat_lahir,
    tgl_lahir:      row.pm_tgl_lahir,
    anak_ke:        row.pm_anak_ke,
    saudara:        row.pm_saudara,
    nama_ortu:      row.pm_nama_orang_tua,
    pekerjaan:      row.pm_pekerjaan,
    sekolah:        row.pm_anak_nama_sekolah,
    alamat_sekolah: row.pm_anak_alamat_sekolah,
    kelas:          row.pm_anak_kelas,
    jenjang:        row.pm_anak_jenjang,
    institusi:      row.pm_mhs_institusi,
    prodi:          row.pm_mhs_prodi,
    mhs_semester:   row.pm_mhs_semester,
    jurusan:        row.pm_mhs_jurusan,
    foto:           row.foto,
    foto_pembinaan: row.foto_pembinaan,
    programid:      row.programid,
    nama_program:   programName(row.programid),
    donatur_nama:   row.donatur_nama,
    donatur_alamat: row.donatur_alamat,
    kantor:         row.nama_kantor,
    wilayah:        row.nama_wilayah,
    kota:           kotaFromNamaKantor(row.nama_kantor),
    tgl_hari_ini:   tglHariIni(),
    nama_semester:  semesterLabel,
  };
}

function assembleKeuangan(row: ManualLaporanRawRow): ManualLaporanKeuangan {
  const saldo_awal = Number(row.dana_saldo_awal || 0);
  const penerimaan = Number(row.dana_penerimaan || 0);
  const penyaluran = Number(row.dana_penyaluran || 0);
  const jml_penerimaan = saldo_awal + penerimaan;
  return {
    saldo_awal, penerimaan, penyaluran, jml_penerimaan,
    saldo_akhir: jml_penerimaan - penyaluran,
  };
}

/**
 * Ported from PembinaanAnakJuara(): pembinaan sessions within the semester's
 * date range, filtered to `jenis_pembinaan='Pembinaan Reguler'` with a
 * non-empty `judul_materi`, joined by month to the matching penyaluran (if
 * any) — legacy joined on `MONTH(a.tgl_pembinaan)=MONTH(b.tgl_penyaluran)`.
 */
async function assemblePembinaan(
  idAnak: string, semester: Semester,
): Promise<ManualLaporanPembinaanRow[]> {
  return query<ManualLaporanPembinaanRow>(
    `SELECT a.tgl_pembinaan, a.judul_materi, MIN(b.tgl_penyaluran) AS tgl_penyaluran
     FROM ajis_pembinaan_baru a
     LEFT JOIN ajis_penyaluran b
       ON a.id_anak = b.id_anak AND MONTH(a.tgl_pembinaan) = MONTH(b.tgl_penyaluran)
     WHERE a.id_anak = ?
       AND a.jenis_pembinaan = 'Pembinaan Reguler'
       AND a.judul_materi IS NOT NULL AND a.judul_materi != ''
       AND a.tgl_pembinaan BETWEEN ? AND ?
     GROUP BY a.tgl_pembinaan, a.judul_materi
     ORDER BY a.tgl_pembinaan ASC`,
    [idAnak, semester.tgl_awal, semester.tgl_akhir],
  );
}

/** Ported from RaportAnakJuaraCerdas/Mandiri/Kompetitif() — one `kategori` slice of `ajis_penilaian`. */
async function assembleAspek(
  idAnak: string, semesterid: string, kategori: string,
): Promise<ManualLaporanAspekRow[]> {
  return query<ManualLaporanAspekRow>(
    `SELECT aspek, target, kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir
     FROM ajis_penilaian
     WHERE id_anak = ? AND semesterid = ? AND kategori = ?
     ORDER BY id_item_penilaian ASC`,
    [idAnak, semesterid, kategori],
  );
}

/** `kategori_skor` thresholds ported from getTotalSkorMandiri(): >=90 Excellent, 70-89 Good, else Average. */
function skorMandiriNilai(rata: number): string {
  if (rata >= 90) return 'Excellent';
  if (rata >= 70) return 'Good';
  return 'Average';
}

/** Ported from RaportAnakJuaraPrestasi() — separate table, not ajis_penilaian. */
async function assemblePrestasi(idAnak: string, semesterid: string): Promise<ManualLaporanPrestasiRow[]> {
  try {
    return await query<ManualLaporanPrestasiRow>(
      `SELECT prestasi, tahun FROM ajis_data_prestasi WHERE id_anak = ? AND semesterid = ? ORDER BY tahun DESC`,
      [idAnak, semesterid],
    );
  } catch {
    // Table may not exist / no rows structure match in some environments — prestasi
    // is an optional section in the PDF, never block the whole render on it.
    return [];
  }
}

/**
 * Ported from getSuaraAnakJuara()/getCatatanPembinaan(): era `semesterid<=20`
 * pulled these from `ajis_penilaian` rows keyed by `aspek`; era `>=21` moved
 * `suara_anak_juara` onto `manual_laporan` directly. Only the current
 * (`manual_laporan` column + `ajis_penilaian` catatan) path is ported, per the
 * "current format only" decision noted at the top of this file.
 */
async function assembleSuaraDanCatatan(
  idAnak: string, semesterid: string, suaraFromManualLaporan: string | null,
): Promise<{ suara: string; catatan: string }> {
  let suara = suaraFromManualLaporan ?? '';
  if (!suara) {
    const row = await queryOne<{ perkembangan_capaian: string }>(
      `SELECT perkembangan_capaian FROM ajis_penilaian WHERE id_anak = ? AND semesterid = ? AND aspek = 'Suara Anak Juara' LIMIT 1`,
      [idAnak, semesterid],
    );
    suara = row?.perkembangan_capaian ?? '';
  }
  const catatanRow = await queryOne<{ perkembangan_capaian: string }>(
    `SELECT perkembangan_capaian FROM ajis_penilaian WHERE id_anak = ? AND semesterid = ? AND aspek = 'Catatan Pembinaan' LIMIT 1`,
    [idAnak, semesterid],
  );
  return { suara, catatan: catatanRow?.perkembangan_capaian ?? '' };
}

function templateUrls(semester: Semester | null): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const field of SEMESTER_TEMPLATE_FIELDS) {
    out[field] = semester ? (semester[field] ?? null) : null;
  }
  return out;
}

/** Assembles everything `lib/pdf/lapsemTemplate.ts` needs to render one Lapsem PDF. */
export async function assembleManualLaporanData(laporanid: string): Promise<ManualLaporanData> {
  const row = await fetchManualLaporanRow(laporanid);
  if (!row) {
    throw new Error(`Laporan ${laporanid} tidak ditemukan.`);
  }

  const semester = await queryOne<Semester>(
    `SELECT id, semesterid, semester, tgl_awal, tgl_akhir, onprogress,
            ${SEMESTER_TEMPLATE_FIELDS.join(', ')}
     FROM ajis_semester WHERE semesterid = ?`,
    [row.semesterid],
  );

  const [pembinaan, aspekCerdas, aspekMandiri, aspekKompetitif, prestasi, suaraDanCatatan] = await Promise.all([
    semester ? assemblePembinaan(row.id_anak, semester) : Promise.resolve([]),
    assembleAspek(row.id_anak, row.semesterid, 'Aspek Cerdas'),
    assembleAspek(row.id_anak, row.semesterid, 'Aspek Mandiri'),
    assembleAspek(row.id_anak, row.semesterid, 'Aspek Kompetitif'),
    assemblePrestasi(row.id_anak, row.semesterid),
    assembleSuaraDanCatatan(row.id_anak, row.semesterid, row.suara_anak_juara),
  ]);

  const mandiriSkors = aspekMandiri.map(a => Number(a.skor ?? 0)).filter(n => Number.isFinite(n));
  const skorMandiriTotal = mandiriSkors.reduce((s, n) => s + n, 0);
  const skorMandiriRata = mandiriSkors.length > 0 ? skorMandiriTotal / mandiriSkors.length : 0;

  return {
    profil: assembleProfil(row, semester?.semester ?? ''),
    keuangan: assembleKeuangan(row),
    pembinaan,
    pembinaanPerkembangan: row.pembinaan_perkembangan,
    aspekCerdas,
    aspekMandiri,
    aspekKompetitif,
    prestasi,
    skorMandiriTotal,
    skorMandiriRata,
    skorMandiriNilai: skorMandiriNilai(skorMandiriRata),
    suaraAnakJuara: suaraDanCatatan.suara,
    catatanPembinaan: suaraDanCatatan.catatan,
    gambarDokumentasi: row.gambar_dokumentasi,
    template: templateUrls(semester),
  };
}
