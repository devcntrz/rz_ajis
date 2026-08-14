/**
 * GET /api/anakjuara/ajuan-ganti-anak/[id]/detail
 * Eksekusi context: pairing profile + opname + Jan–Des finance pivot.
 * Computed in lib/keuangan so the modal and the Anak Juara grid always agree,
 * and without touching the nested ajis_view_anak_juara.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import {
  BULAN_KEYS,
  BULAN_LABEL,
  buildKeuangan,
  normalizeBulan,
  type OpnameAgg,
} from '@/lib/keuangan';

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
  harga_program: number;
};

type DonasiMonth = { bulan: string; tahun: string; total: number };

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
           p.nia_rfo, p.nama_rfo, p.status_pasangan, p.harga_program
         FROM ajis_pemasangan p
         WHERE p.id_pemasangan_baru = ?
         LIMIT 1`,
        [ajuan.id_pemasangan_baru],
      );
    }

    const year = pairing?.tahun || String(new Date().getFullYear());

    /*
     * Aggregates are keyed on id_pemasangan_baru ALONE, matching the legacy view chain
     * (ajis_view_donasi / ajis_view_penyaluran group by id_pemasangan_baru with no year
     * predicate, and ajis_opname is joined on that column only). Adding `tahun = ?` here
     * would silently produce different figures from the old app.
     */
    const opname = ajuan.id_pemasangan_baru
      ? await queryOne<OpnameAgg>(
          `SELECT id_pemasangan_baru,
                  saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
                  date_opname_ganjil, user_opname_ganjil, date_opname_genap, user_opname_genap
           FROM ajis_opname
           WHERE id_pemasangan_baru = ?
           LIMIT 1`,
          [ajuan.id_pemasangan_baru],
        )
      : null;

    const [donasiMonths, penyaluranMonths] = ajuan.id_pemasangan_baru
      ? await Promise.all([
          query<DonasiMonth>(
            `SELECT bulan, tahun, SUM(IFNULL(nominal_donasi, 0)) AS total
             FROM ajis_input_donasi
             WHERE id_pemasangan_baru = ? AND jenis = 'trans'
             GROUP BY bulan, tahun`,
            [ajuan.id_pemasangan_baru],
          ),
          query<DonasiMonth>(
            `SELECT bulan, tahun, SUM(IFNULL(nominal_penyaluran, 0)) AS total
             FROM ajis_penyaluran
             WHERE id_pemasangan_baru = ?
             GROUP BY bulan, tahun`,
            [ajuan.id_pemasangan_baru],
          ),
        ])
      : [[], []];

    const pivotOf = (rows: DonasiMonth[]) => {
      const p: Record<string, number> = {};
      for (const k of BULAN_KEYS) p[k] = 0;
      for (const r of rows) {
        const key = normalizeBulan(String(r.bulan));
        if (key) p[key] += Number(r.total) || 0;
      }
      return p;
    };

    const donasi = pivotOf(donasiMonths);
    const penyaluran = pivotOf(penyaluranMonths);
    const hargaProgram = Number(pairing?.harga_program ?? 0);
    const keuangan = buildKeuangan(donasi, penyaluran, opname, hargaProgram);

    return NextResponse.json({
      data: {
        ajuan,
        pairing,
        opname: opname ?? {
          saldo_awal_ganjil: 0,
          saldo_akhir_ganjil: 0,
          saldo_awal_genap: 0,
          saldo_akhir_genap: 0,
          date_opname_ganjil: null,
          user_opname_ganjil: null,
          date_opname_genap: null,
          user_opname_genap: null,
        },
        keuangan: {
          tahun: year,
          harga_program: hargaProgram,
          months: BULAN_KEYS.map(k => ({
            bulan: k,
            label: BULAN_LABEL[k],
            total: donasi[k] || 0,
          })),
          ...keuangan,
        },
      },
    });
  } catch (err) {
    console.error('[ajuan detail]', err);
    return NextResponse.json({ error: 'Gagal memuat detail eksekusi.' }, { status: 500 });
  }
}
