/**
 * POST /api/anakjuara/calon-anak-juara/[id]/pasang — pasang Calon Anak Juara
 * langsung ke donatur (MySQL sipc_ijf, transisi track).
 *
 * [id] = id_anak. Body: { id_donatur, nama_program }.
 *
 * New pairing, not a replacement — same ajis_pemasangan / opname / harga /
 * funding-sync mechanics as app/api/anakjuara/ajuan-ganti-anak/[id]/eksekusi
 * (steps 3–6, 9 there), reused here because that flow is the only
 * already-reviewed, working INSERT into ajis_pemasangan in this codebase.
 * Skips ajuan-specific bookkeeping (old pairing stop, donation move, ajuan
 * mark-executed) since there is no ajuan behind this action.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, withTransaction, txExecute, txQueryOne } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import { RuleError } from '@/lib/transaksi/rules';

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
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
    const idAnak = decodeURIComponent(id);
    const body = (await req.json()) as { id_donatur?: string; nama_program?: string };
    const idDonatur = body.id_donatur?.trim();
    const namaProgram = body.nama_program?.trim();
    if (!idDonatur || !namaProgram) {
      return NextResponse.json({ error: 'Donatur dan program wajib dipilih.', code: 'VALIDATION' }, { status: 400 });
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'kantor_id', 'a');
    const anak = await queryOne<{
      id_anak: string; nama_lengkap: string; jns_kel: string | null; jenjang_pendidikan: string | null;
      asnaf: string | null; nik: string | null; status_ortu: string | null; no_rekening: string | null; kelas: string | null;
      kantor_id: string | null; nama_kantor: string | null; id_wilayah_pembinaan: string | null; nama_wilayah: string | null;
      status_anak_juara: string | null;
    }>(
      `SELECT a.id_anak, a.nama_lengkap, a.jns_kel, a.jenjang_pendidikan,
              a.asnaf, a.nik, a.status_ortu, a.no_rekening, a.kelas,
              a.kantor_id, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah, a.status_anak_juara
       FROM ajis_anak a
       WHERE a.id_anak = ? AND ${scopeSql}
       LIMIT 1`,
      [idAnak, ...scopeParams],
    );
    if (!anak) {
      return NextResponse.json({ error: 'Anak tidak ditemukan atau di luar akses Anda.' }, { status: 404 });
    }
    if (anak.status_anak_juara !== 'caj') {
      return NextResponse.json({ error: 'Anak ini bukan Calon Anak Juara.', code: 'RULE' }, { status: 400 });
    }
    if (!anak.id_wilayah_pembinaan) {
      return NextResponse.json({ error: 'Data wilayah pembinaan anak belum lengkap.', code: 'RULE' }, { status: 400 });
    }

    const donatur = await queryOne<{ did: string; nama_lengkap: string | null; nia_rfo: string | null; nama_rfo: string | null }>(
      `SELECT did, nama_lengkap, nia_rfo, nama_rfo FROM donatur WHERE did = ? LIMIT 1`,
      [idDonatur],
    );
    if (!donatur) {
      return NextResponse.json({ error: 'Donatur tidak ditemukan.', code: 'DONATUR_NOT_FOUND' }, { status: 404 });
    }

    const program = await queryOne<{ id_program: number; harga_program: number; harga_penyaluran: number }>(
      `SELECT id_program, harga_program, harga_penyaluran FROM setting_program WHERE nama_program = ? AND aktif = 'y' LIMIT 1`,
      [namaProgram],
    );
    if (!program) {
      return NextResponse.json({ error: 'Program tidak ditemukan atau tidak aktif.', code: 'PROGRAM_NOT_FOUND' }, { status: 404 });
    }

    const year = String(new Date().getFullYear());
    const newIdPemasangan = `${idAnak}${idDonatur}${year}`;
    const username = session.username;

    const already = await queryOne<{ id_pemasangan_baru: string }>(
      `SELECT id_pemasangan_baru FROM ajis_pemasangan WHERE id_pemasangan_baru = ? AND status_pasangan = 'y' LIMIT 1`,
      [newIdPemasangan],
    );
    if (already) {
      return NextResponse.json({ error: 'Anak ini sudah terpasang dengan donatur ini tahun ini.', code: 'ALREADY_PAIRED' }, { status: 400 });
    }

    await withTransaction(async conn => {
      const pairingFields: Record<string, unknown> = {
        id_donatur: idDonatur,
        id_anak: idAnak,
        program_donasi: namaProgram,
        id_program: program.id_program,
        user_insert: username,
        id_pemasangan_baru: newIdPemasangan,
        tahun: year,
        id_wilayah_pembinaan: anak.id_wilayah_pembinaan,
        kantor_id: anak.kantor_id,
        nama_kantor: anak.nama_kantor,
        nama_wilayah: anak.nama_wilayah,
        nama_anak: anak.nama_lengkap,
        jns_kel: anak.jns_kel,
        jenjang_pendidikan: anak.jenjang_pendidikan,
        asnaf: anak.asnaf,
        nik: anak.nik,
        status_ortu: anak.status_ortu,
        no_rekening: anak.no_rekening,
        kelas: anak.kelas,
        harga_program: program.harga_program ?? 0,
        harga_penyaluran: program.harga_penyaluran ?? 0,
        program_sebelumnya: '',
        nama_donatur: donatur.nama_lengkap || '',
        nia_rfo: donatur.nia_rfo || '',
        nama_rfo: donatur.nama_rfo || '',
        user_update: username,
        // Remaining NOT NULL columns this flow has no real value for — same
        // list as the ajuan-eksekusi route's pairing insert.
        keterangan_pemberhentian: '', saldo_awal: 0, status_saldo: 'n',
        status_aj: '', id_sdm: '', cek: '', id_naik_jenjang: '', history: '',
        user_stop: '', via_stop: '', jcustid: 0, id_pemasangan_new: '', pinjam: '',
        status_mentor: '',
      };
      const pairingCols = Object.keys(pairingFields);
      const pairingPlaceholders = pairingCols.map(() => '?');
      const pairingValues = pairingCols.map(c => pairingFields[c]);

      await txExecute(
        conn,
        `INSERT INTO ajis_pemasangan (
           tgl_pemasangan, date_insert, date_update, status_pasangan,
           tunda_penyaluran, via_input, ${pairingCols.join(', ')}
         ) VALUES (
           NOW(), NOW(), NOW(), 'y',
           '', 'desktop', ${pairingPlaceholders.join(', ')}
         )
         ON DUPLICATE KEY UPDATE
           status_pasangan  = 'y',
           tgl_pemasangan   = NOW(),
           program_donasi   = VALUES(program_donasi),
           harga_program    = VALUES(harga_program),
           harga_penyaluran = VALUES(harga_penyaluran),
           user_update      = VALUES(user_insert),
           date_update      = NOW()`,
        pairingValues,
      );

      await txExecute(
        conn,
        `UPDATE ajis_pemasangan a
         INNER JOIN setting_program b ON a.program_donasi = b.nama_program
         SET a.harga_program = b.harga_program,
             a.harga_penyaluran = b.harga_penyaluran
         WHERE a.id_pemasangan_baru = ?`,
        [newIdPemasangan],
      );

      await txExecute(
        conn,
        `UPDATE ajis_pemasangan a
         INNER JOIN donatur b ON a.id_donatur = b.did
         SET a.nia_rfo = b.nia_rfo,
             a.nama_rfo = b.nama_rfo,
             a.nama_donatur = b.nama_lengkap
         WHERE a.id_pemasangan_baru = ?`,
        [newIdPemasangan],
      );

      await txExecute(
        conn,
        `UPDATE transaksi t
         LEFT JOIN (
           SELECT id_donatur,
                  GROUP_CONCAT(DISTINCT nama_kantor SEPARATOR ',') AS nama_kantor,
                  GROUP_CONCAT(DISTINCT kantor_id SEPARATOR ',') AS id_kantor_ijis,
                  COUNT(id_anak) AS jml_anak
           FROM ajis_pemasangan
           WHERE status_pasangan = 'y' AND id_donatur = ?
           GROUP BY id_donatur
         ) m ON t.did = m.id_donatur
         SET t.kantor_ijis = IFNULL(m.nama_kantor, ''),
             t.id_kantor_ijis = IFNULL(m.id_kantor_ijis, ''),
             t.jml_anak_ijis = IFNULL(m.jml_anak, 0)
         WHERE t.did = ?`,
        [idDonatur, idDonatur],
      );

      const existingOpname = await txQueryOne<{ id_pemasangan_baru: string }>(
        conn,
        `SELECT id_pemasangan_baru FROM ajis_opname WHERE id_pemasangan_baru = ? AND tahun = ? LIMIT 1`,
        [newIdPemasangan, year],
      );
      if (!existingOpname) {
        await txExecute(
          conn,
          `INSERT INTO ajis_opname (
             tahun, id_anak, id_donatur, program_donasi, id_kantor, id_program,
             id_pemasangan_baru, updated,
             saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
             tupo_jan_jun, date_opname_ganjil, user_opname_ganjil,
             tupo_jul_des, date_opname_genap, user_opname_genap,
             user_input, keterangan, user_update, jcustid, id_pemasangan_new
           ) VALUES (
             ?, ?, ?, ?, ?, ?,
             ?, NOW(),
             0, 0, 0, 0,
             '', '0000-00-00 00:00:00', '',
             '', '0000-00-00 00:00:00', '',
             ?, '', '', 0, ''
           )`,
          [year, idAnak, idDonatur, namaProgram, anak.kantor_id, String(program.id_program), newIdPemasangan, username],
        );
      }

      await txExecute(
        conn,
        `UPDATE ajis_anak SET status_anak_juara = 'aj' WHERE id_anak = ?`,
        [idAnak],
      );
    });

    return NextResponse.json({
      data: { ok: true, id_pemasangan_baru: newIdPemasangan },
      message: 'Anak berhasil dipasangkan ke donatur.',
    }, { status: 201 });
  } catch (err) {
    if (err instanceof RuleError) {
      return NextResponse.json({ error: err.message, code: err.code ?? 'RULE' }, { status: 400 });
    }
    console.error('[calon-anak-juara pasang]', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gagal memasangkan anak ke donatur: ${detail}` }, { status: 500 });
  }
}
