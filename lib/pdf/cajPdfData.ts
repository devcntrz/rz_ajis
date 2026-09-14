/**
 * lib/pdf/cajPdfData.ts — load one CAJ child from MySQL for Surat / CV PDFs.
 */
import { queryOne, queryUnprepared } from '@/lib/db';
import { getScopeCondition, type SessionData } from '@/lib/auth';
import { fmtRp } from '@/lib/utils';

const LEGACY_BASE = 'https://ajis.indonesiajuara.org';

const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export interface CajPdfRow {
  id_anak: string;
  status_anak_juara: string;
  nama_lengkap: string;
  nama_panggilan: string;
  agama: string;
  jns_kel: string;
  tempat_lahir: string;
  tgl_lahir: string | Date | null;
  anak_ke: string | number | null;
  dari_saudara: string | number | null;
  alamat: string;
  nama_desa: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  nama_propinsi: string;
  jenjang_pendidikan: string;
  kelas: string;
  nama_sekolah: string;
  alamat_sekolah: string;
  jurusan: string;
  semester: string;
  nama_pt: string;
  alamat_pt: string;
  foto: string;
  nilai: string;
  pelajaran_favorit: string;
  jarak_rumah: string;
  alat_transportasi: string;
  hobi: string;
  prestasi: string;
  status_ortu: string;
  nama_kantor: string;
  kantor_id: string;
  id_wilayah_pembinaan: string | number;
  nama_lengkap_ayah: string;
  pekerjaan_ayah: string;
  penghasilan_rata_rata_ayah: number | string | null;
  tanggal_kematian_ayah: string | Date | null;
  nama_lengkap_ibu: string;
  pekerjaan_ibu: string;
  penghasilan_rata_rata_ibu: number | string | null;
  tanggal_kematian_ibu: string | Date | null;
  nama_lengkap_wali: string;
  pekerjaan_wali: string;
  penghasilan_rata_rata_wali: number | string | null;
  tinggal_bersama: string;
  ket_tinggal: string;
}

export interface CajPdfModel {
  id_anak: string;
  nama_lengkap: string;
  nama_panggilan: string;
  agama: string;
  jns_kel: string;
  tempat_lahir: string;
  tgl_lahir: string;
  anak_ke: string;
  dari_saudara: string;
  alamatlengkap: string;
  jenjang_pendidikan: string;
  kelas: string;
  nama_sekolah: string;
  alamat_sekolah: string;
  jurusan: string;
  semester: string;
  nama_pt: string;
  alamat_pt: string;
  fotoUrl: string;
  hasFoto: boolean;
  nilai: string;
  pelajaran_favorit: string;
  jarak_rumah: string;
  alat_transportasi: string;
  hobi: string;
  prestasi: string;
  status_ortu: string;
  backgroundUrl: string;
  nama_lengkap_ayah: string;
  pekerjaan_ayah: string;
  gaji_ayah: string;
  tahun_ayah: string;
  nama_lengkap_ibu: string;
  pekerjaan_ibu: string;
  gaji_ibu: string;
  tahun_ibu: string;
  nama_lengkap_wali: string;
  pekerjaan_wali: string;
  gaji_wali: string;
  tinggal_bersama: string;
  ket_tinggal: string;
}

export class CajPdfLookupError extends Error {
  constructor(
    public readonly status: 403 | 404,
    message: string,
  ) {
    super(message);
    this.name = 'CajPdfLookupError';
  }
}

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isFilled(value: string | null | undefined): boolean {
  const t = (value ?? '').trim();
  return t !== '' && t !== '-';
}

export function dateStringInd(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, '0')} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function yearsSince(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const years = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (years <= 0) return 'beberapa bulan';
  return `${years} tahun`;
}

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map(p => (p ?? '').trim()).filter(Boolean).join(' ');
}

function isFatalConn(err: unknown): boolean {
  const code = err && typeof err === 'object' && 'code' in err
    ? String((err as { code?: string }).code)
    : '';
  return code === 'ETIMEDOUT' || code === 'ECONNRESET' || code === 'PROTOCOL_CONNECTION_LOST';
}

async function fetchCajRow(idAnak: string, scope: string, scopeParams: unknown[]): Promise<CajPdfRow | null> {
  const sql = `SELECT
       a.id_anak, a.status_anak_juara, a.nama_lengkap, a.nama_panggilan, a.agama,
       a.jns_kel, a.tempat_lahir, a.tgl_lahir, a.anak_ke, a.dari_saudara,
       a.alamat, a.nama_desa, a.nama_kecamatan, a.nama_kabupaten, a.nama_propinsi,
       a.jenjang_pendidikan, a.kelas, a.nama_sekolah, a.alamat_sekolah,
       a.jurusan, a.semester, a.nama_pt, a.alamat_pt, a.foto, a.nilai,
       a.pelajaran_favorit, a.jarak_rumah, a.alat_transportasi, a.hobi, a.prestasi,
       a.status_ortu, a.nama_kantor, a.kantor_id, a.id_wilayah_pembinaan,
       a.nama_lengkap_ayah, a.pekerjaan_ayah, a.penghasilan_rata_rata_ayah, a.tanggal_kematian_ayah,
       a.nama_lengkap_ibu, a.pekerjaan_ibu, a.penghasilan_rata_rata_ibu, a.tanggal_kematian_ibu,
       a.nama_lengkap_wali, a.pekerjaan_wali, a.penghasilan_rata_rata_wali,
       a.tinggal_bersama, a.ket_tinggal
     FROM ajis_anak a
     WHERE a.id_anak = ? AND ${scope}`;
  const params = [idAnak, ...scopeParams];
  try {
    return await queryOne<CajPdfRow>(sql, params);
  } catch (err) {
    if (!isFatalConn(err)) throw err;
    const rows = await queryUnprepared<CajPdfRow>(sql, params);
    return rows[0] ?? null;
  }
}

export async function loadCajPdfRow(session: SessionData, idAnak: string): Promise<CajPdfModel> {
  const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
  const row = await fetchCajRow(idAnak, scope, scopeParams);

  if (!row) {
    throw new CajPdfLookupError(404, 'Data anak tidak ditemukan.');
  }
  if (row.status_anak_juara !== 'caj') {
    throw new CajPdfLookupError(404, 'Anak ini bukan Calon Anak Juara.');
  }

  const isIj = (row.nama_kantor || '').includes('IJ');
  const bgFile = isIj ? 'profil_anak_juara.jpg' : 'profil_siswa_juara.jpg';
  const hasFoto = isFilled(row.foto);

  return {
    id_anak: row.id_anak,
    nama_lengkap: row.nama_lengkap || '',
    nama_panggilan: row.nama_panggilan || '',
    agama: row.agama || '',
    jns_kel: row.jns_kel || '',
    tempat_lahir: row.tempat_lahir || '',
    tgl_lahir: dateStringInd(row.tgl_lahir),
    anak_ke: String(row.anak_ke ?? ''),
    dari_saudara: String(row.dari_saudara ?? ''),
    alamatlengkap: joinAddress([
      row.alamat, row.nama_desa, row.nama_kecamatan, row.nama_kabupaten, row.nama_propinsi,
    ]),
    jenjang_pendidikan: row.jenjang_pendidikan || '',
    kelas: row.kelas || '',
    nama_sekolah: row.nama_sekolah || '',
    alamat_sekolah: row.alamat_sekolah || '',
    jurusan: row.jurusan || '',
    semester: row.semester || '',
    nama_pt: row.nama_pt || '',
    alamat_pt: row.alamat_pt || '',
    fotoUrl: hasFoto
      ? `${LEGACY_BASE}/upload/foto_ajis/${encodeURIComponent(row.foto)}`
      : `${LEGACY_BASE}/modules/ajis/gambar/anak.png`,
    hasFoto,
    nilai: row.nilai || '',
    pelajaran_favorit: row.pelajaran_favorit || '',
    jarak_rumah: row.jarak_rumah || '',
    alat_transportasi: row.alat_transportasi || '',
    hobi: row.hobi || '',
    prestasi: row.prestasi || '',
    status_ortu: row.status_ortu || '',
    backgroundUrl: `${LEGACY_BASE}/modules/ajis/gambar/${bgFile}`,
    nama_lengkap_ayah: row.nama_lengkap_ayah || '',
    pekerjaan_ayah: row.pekerjaan_ayah || '',
    gaji_ayah: fmtRp(row.penghasilan_rata_rata_ayah),
    tahun_ayah: yearsSince(row.tanggal_kematian_ayah),
    nama_lengkap_ibu: row.nama_lengkap_ibu || '',
    pekerjaan_ibu: row.pekerjaan_ibu || '',
    gaji_ibu: fmtRp(row.penghasilan_rata_rata_ibu),
    tahun_ibu: yearsSince(row.tanggal_kematian_ibu),
    nama_lengkap_wali: row.nama_lengkap_wali || '',
    pekerjaan_wali: row.pekerjaan_wali || '',
    gaji_wali: fmtRp(row.penghasilan_rata_rata_wali),
    tinggal_bersama: row.tinggal_bersama || '',
    ket_tinggal: row.ket_tinggal || '',
  };
}
