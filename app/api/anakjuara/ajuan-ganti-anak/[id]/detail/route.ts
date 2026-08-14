/**
 * GET /api/anakjuara/ajuan-ganti-anak/[id]/detail
 * Fast eksekusi context: pairing profile + opname + monthly donasi pivot.
 * Avoids heavy ajis_view_anak_juara.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';

type PairingDetail = {
  id_pemasangan_baru: string;
  tahun: string;
  id_anak: string;
  nama_anak: string;
  jns_kel: string;
  jenjang_pendidikan: string;
  kelas: string;
  asnaf: string;
  status_ortu: string;
  id_donatur: string;
  nama_donatur: string;
  program_donasi: string;
  id_program: number;
  kantor_id: string;
  nama_kantor: string;
  id_wilayah_pembinaan: string;
  nama_wilayah: string;
  nia_rfo: string;
  nama_rfo: string;
  status_pasangan: string;
};

type OpnameRow = {
  saldo_awal_ganjil: number;
  saldo_akhir_ganjil: number;
  saldo_awal_genap: number;
  saldo_akhir_genap: number;
};

type DonasiMonth = { bulan: string; tahun: string; total: number };

const BULAN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
const BULAN_LABEL: Record<string, string> = {
  '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mei', '6': 'Jun',
  '7': 'Jul', '8': 'Agu', '9': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

function normalizeBulan(b: string): string {
  const n = Number(b);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return String(n);
  const map: Record<string, string> = {
    januari: '1', february: '2', februari: '2', maret: '3', march: '3',
    april: '4', mei: '5', may: '5', juni: '6', june: '6',
    juli: '7', july: '7', agustus: '8', august: '8',
    september: '9', oktober: '10', october: '10', november: '11', desember: '12', december: '12',
  };
  return map[String(b).toLowerCase().trim()] || '';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id } = await params;
    const idAjuan = Number(id);
    if (!idAjuan) {
      return NextResponse.json({ error: 'ID ajuan tidak valid.' }, { status: 400 });
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'id_kantor', 'a');
    const ajuan = await queryOne<{
      id_ajuan: number;
      id_pemasangan_baru: string | null;
      id_anak: string;
      nama_anak_asal: string;
      id_anak_pengganti: string;
      nama_anak_pengganti: string;
      id_donatur: string;
      nama_donatur: string;
      program_donasi: string;
      pindah_saldo: number;
      alasan_pergantian: string;
      id_kantor: string;
      nama_kantor: string;
      nama_wilayah: string;
      nia_rfo: string;
      nama_rfo: string;
      jns_kelamin: string;
    }>(
      `SELECT a.id_ajuan, a.id_pemasangan_baru, a.id_anak, a.nama_anak_asal,
              a.id_anak_pengganti, a.nama_anak_pengganti, a.id_donatur, a.nama_donatur,
              a.program_donasi, a.pindah_saldo, a.alasan_pergantian,
              a.id_kantor, a.nama_kantor, a.nama_wilayah, a.nia_rfo, a.nama_rfo, a.jns_kelamin
       FROM ajis_view_ajuan a
       WHERE a.id_ajuan = ? AND ${scopeSql}
       LIMIT 1`,
      [idAjuan, ...scopeParams],
    );

    if (!ajuan) {
      return NextResponse.json({ error: 'Ajuan tidak ditemukan.' }, { status: 404 });
    }

    let pairing: PairingDetail | null = null;
    if (ajuan.id_pemasangan_baru) {
      pairing = await queryOne<PairingDetail>(
        `SELECT
           p.id_pemasangan_baru, p.tahun, p.id_anak, p.nama_anak, p.jns_kel,
           p.jenjang_pendidikan, p.kelas, p.asnaf, p.status_ortu,
           p.id_donatur, p.nama_donatur, p.program_donasi, p.id_program,
           p.kantor_id, p.nama_kantor, p.id_wilayah_pembinaan, p.nama_wilayah,
           p.nia_rfo, p.nama_rfo, p.status_pasangan
         FROM ajis_pemasangan p
         WHERE p.id_pemasangan_baru = ?
         LIMIT 1`,
        [ajuan.id_pemasangan_baru],
      );
    }

    const year = pairing?.tahun || String(new Date().getFullYear());

    const opname = ajuan.id_pemasangan_baru
      ? await queryOne<OpnameRow>(
          `SELECT saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap
           FROM ajis_opname
           WHERE id_pemasangan_baru = ? AND tahun = ?
           LIMIT 1`,
          [ajuan.id_pemasangan_baru, year],
        )
      : null;

    const donasiMonths = ajuan.id_pemasangan_baru
      ? await query<DonasiMonth>(
          `SELECT bulan, tahun, SUM(IFNULL(nominal_donasi, 0)) AS total
           FROM ajis_input_donasi
           WHERE id_pemasangan_baru = ? AND tahun = ?
           GROUP BY bulan, tahun`,
          [ajuan.id_pemasangan_baru, year],
        )
      : [];

    const pivot: Record<string, number> = {};
    for (const k of BULAN_KEYS) pivot[k] = 0;
    for (const row of donasiMonths) {
      const key = normalizeBulan(String(row.bulan));
      if (key) pivot[key] = Number(row.total) || 0;
    }

    return NextResponse.json({
      data: {
        ajuan,
        pairing,
        opname: opname ?? {
          saldo_awal_ganjil: 0,
          saldo_akhir_ganjil: 0,
          saldo_awal_genap: 0,
          saldo_akhir_genap: 0,
        },
        keuangan: {
          tahun: year,
          months: BULAN_KEYS.map(k => ({
            bulan: k,
            label: BULAN_LABEL[k],
            total: pivot[k] || 0,
          })),
        },
      },
    });
  } catch (err) {
    console.error('[ajuan detail]', err);
    return NextResponse.json({ error: 'Gagal memuat detail eksekusi.' }, { status: 500 });
  }
}
