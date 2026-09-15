/**
 * GET /api/anakjuara/anak/[id] — Child detail
 * PATCH /api/anakjuara/anak/[id] — Edit child record (all editable ajis_anak fields)
 * Returns full child record including parent data
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { STATUS_ANAK_JUARA } from '@/lib/enums';

const DETAIL_SQL = `SELECT a.id_anak, a.nik, a.nama_lengkap, a.nama_panggilan,
              a.agama, a.jns_kel, a.tempat_lahir, a.tgl_lahir,
              a.anak_ke, a.dari_saudara, a.alamat,
              a.jenjang_pendidikan, a.kelas, a.nama_sekolah, a.alamat_sekolah,
              a.jurusan, a.semester, a.nama_pt, a.alamat_pt,
              a.nilai, a.pelajaran_favorit, a.jarak_rumah, a.alat_transportasi,
              a.no_kartu_keluarga,
              a.asnaf, a.status_ortu, a.status_tersantuni,
              a.status_survey, a.status_kelayakan, a.status_anak_juara, a.status_pinjam, a.status_mentor,
              a.id_wilayah_pembinaan, a.kantor_id, a.nama_wilayah, a.nama_kantor,
              a.tgl_terdaftar, a.tgl_pengajuan, a.foto, a.hobi, a.prestasi,
              a.aktif, a.tinggal_bersama, a.nama_tinggal, a.ket_tinggal,
              a.penghasilan_tinggal, a.pekerjaan_tinggal, a.tidak_serumah_ortu,
              a.nama_lengkap_ayah, a.pekerjaan_ayah, a.penghasilan_rata_rata_ayah,
              a.tanggal_kematian_ayah, a.penyebab_kematian_ayah,
              a.nama_lengkap_ibu, a.pekerjaan_ibu, a.penghasilan_rata_rata_ibu,
              a.tanggal_kematian_ibu, a.penyebab_kematian_ibu,
              a.nama_lengkap_wali, a.pekerjaan_wali, a.penghasilan_rata_rata_wali,
              a.telp_yang_bisa_dihubungi, a.atas_nama, a.hubungan_kerabat,
              a.no_rekening, a.nama_bank, a.pemilik_rekening,
              a.id_sdm, a.nama_mentor, a.alumni_juara, a.juara
       FROM   ajis_anak a
       WHERE  a.id_anak = ?
       LIMIT  1`;

/** Editable ajis_anak columns — excludes id_anak (PK), joined nama_wilayah/nama_kantor, and
 *  internal RFO-book/PostgreSQL-sync bookkeeping columns (oid_rz, nia_rfo_book, tgl_peminjaman,
 *  id_kantor_postgree, upload_gdrive, ...) which aren't part of the anak profile. */
export const EDITABLE_FIELDS = [
  'nik', 'nama_lengkap', 'nama_panggilan', 'agama', 'jns_kel', 'tempat_lahir', 'tgl_lahir',
  'anak_ke', 'dari_saudara', 'alamat',
  'jenjang_pendidikan', 'kelas', 'nama_sekolah', 'alamat_sekolah',
  'jurusan', 'semester', 'nama_pt', 'alamat_pt',
  'nilai', 'pelajaran_favorit', 'jarak_rumah', 'alat_transportasi', 'no_kartu_keluarga',
  'asnaf', 'status_ortu', 'status_tersantuni',
  'status_survey', 'status_kelayakan', 'status_anak_juara', 'status_pinjam', 'status_mentor',
  'id_wilayah_pembinaan', 'kantor_id',
  'tgl_terdaftar', 'tgl_pengajuan', 'foto', 'hobi', 'prestasi', 'aktif',
  'tinggal_bersama', 'nama_tinggal', 'ket_tinggal', 'penghasilan_tinggal', 'pekerjaan_tinggal', 'tidak_serumah_ortu',
  'nama_lengkap_ayah', 'pekerjaan_ayah', 'penghasilan_rata_rata_ayah', 'tanggal_kematian_ayah', 'penyebab_kematian_ayah',
  'nama_lengkap_ibu', 'pekerjaan_ibu', 'penghasilan_rata_rata_ibu', 'tanggal_kematian_ibu', 'penyebab_kematian_ibu',
  'nama_lengkap_wali', 'pekerjaan_wali', 'penghasilan_rata_rata_wali',
  'telp_yang_bisa_dihubungi', 'atas_nama', 'hubungan_kerabat',
  'no_rekening', 'nama_bank', 'pemilik_rekening',
  'id_sdm', 'nama_mentor', 'alumni_juara', 'juara',
] as const;

const JNS_KEL_VALUES = ['l', 'p'];
const AKTIF_VALUES = ['y', 'n'];
const STATUS_TERSANTUNI_VALUES = ['su', 'b', 'se', 't'];
const YN_VALUES = ['y', 'n'];
const ALUMNI_JUARA_VALUES = ['', 'y', 'n'];

function inScope(session: Awaited<ReturnType<typeof getSession>>, row: { id_wilayah_pembinaan: number | null; kantor_id: string | null }): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return String(row.kantor_id ?? '') === String(session.idKantor);
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const anak = await queryOne<Record<string, unknown>>(DETAIL_SQL, [id]);

    if (!anak) return NextResponse.json({ error: 'Anak tidak ditemukan.' }, { status: 404 });

    return NextResponse.json({ data: anak });
  } catch (err) {
    console.error('[anak detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await queryOne<{ id_wilayah_pembinaan: number | null; kantor_id: string | null }>(
      'SELECT id_wilayah_pembinaan, kantor_id FROM ajis_anak WHERE id_anak = ? LIMIT 1',
      [id],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mengubah data anak ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Data tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada field yang diubah.', code: 'VALIDATION' }, { status: 400 });
    }

    const nextWilayah = Object.prototype.hasOwnProperty.call(updates, 'id_wilayah_pembinaan')
      ? updates.id_wilayah_pembinaan
      : existing.id_wilayah_pembinaan;
    const nextKantor = Object.prototype.hasOwnProperty.call(updates, 'kantor_id')
      ? updates.kantor_id
      : existing.kantor_id;
    if (!inScope(session, { id_wilayah_pembinaan: nextWilayah as number | null, kantor_id: nextKantor as string | null })) {
      return NextResponse.json({ error: 'Wilayah/kantor tujuan di luar akses Anda.', code: 'FORBIDDEN' }, { status: 403 });
    }

    if ('nama_lengkap' in updates && !String(updates.nama_lengkap ?? '').trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if ('jns_kel' in updates && !JNS_KEL_VALUES.includes(String(updates.jns_kel))) {
      return NextResponse.json({ error: 'Jenis kelamin tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    if ('tgl_lahir' in updates && !String(updates.tgl_lahir ?? '').trim()) {
      return NextResponse.json({ error: 'Tanggal lahir wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if ('aktif' in updates && !AKTIF_VALUES.includes(String(updates.aktif))) {
      return NextResponse.json({ error: 'Status aktif tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    if ('status_tersantuni' in updates && updates.status_tersantuni && !STATUS_TERSANTUNI_VALUES.includes(String(updates.status_tersantuni))) {
      return NextResponse.json({ error: 'Status tersantuni tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    for (const field of ['status_survey', 'status_kelayakan', 'status_pinjam', 'status_mentor'] as const) {
      if (field in updates && !YN_VALUES.includes(String(updates[field]))) {
        return NextResponse.json({ error: `Nilai field ${field} tidak valid.`, code: 'VALIDATION' }, { status: 400 });
      }
    }
    if ('status_anak_juara' in updates && updates.status_anak_juara && !STATUS_ANAK_JUARA.includes(updates.status_anak_juara as typeof STATUS_ANAK_JUARA[number])) {
      return NextResponse.json({ error: 'Status anak juara tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    if ('alumni_juara' in updates && !ALUMNI_JUARA_VALUES.includes(String(updates.alumni_juara ?? ''))) {
      return NextResponse.json({ error: 'Nilai alumni juara tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const fields = Object.keys(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);

    await execute(
      `UPDATE ajis_anak SET ${setClause} WHERE id_anak = ?`,
      [...values, id],
    );

    const updated = await queryOne<Record<string, unknown>>(DETAIL_SQL, [id]);

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('[anak update]', err);
    return NextResponse.json({ error: 'Gagal menyimpan data anak.' }, { status: 500 });
  }
}
