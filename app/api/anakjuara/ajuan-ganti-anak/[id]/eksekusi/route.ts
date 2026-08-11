/**
 * POST /api/anakjuara/ajuan-ganti-anak/[id]/eksekusi
 * Full child-replacement transaction (PRD §8.5).
 * Requires approve_funding='y' and status_eksekusi != 'y'.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  queryOne,
  withTransaction,
  txExecute,
  txQueryOne,
} from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import type { EksekusiPayload } from '@/types/ajuan';

export async function POST(
  req: NextRequest,
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

    const body = (await req.json()) as EksekusiPayload;
    const keteranganStop = (body.keterangan_pemberhentian || '').trim();
    if (!keteranganStop) {
      return NextResponse.json(
        { error: 'Keterangan pemberhentian wajib diisi.' },
        { status: 400 },
      );
    }

    const saldoAkhirGanti = Number(body.saldo_akhir_ganti ?? 0) || 0;
    const saldoAwalGanjil = Number(body.saldo_awal_ganjil ?? 0) || 0;
    const saldoAkhirGanjil = Number(body.saldo_akhir_ganjil ?? 0) || 0;
    const saldoAwalGenap = Number(body.saldo_awal_genap ?? 0) || 0;
    const saldoAkhirGenap = Number(body.saldo_akhir_genap ?? 0) || 0;
    const donasiIds = Array.isArray(body.id_input_donasi)
      ? body.id_input_donasi.map(Number).filter(n => Number.isFinite(n) && n > 0)
      : [];

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'id_kantor', 'a');
    const ajuan = await queryOne<{
      id_ajuan: number;
      id_pemasangan_baru: string | null;
      id_donatur: string;
      id_anak: string;
      id_anak_pengganti: string;
      nama_anak_pengganti: string;
      program_donasi: string;
      approve_funding: string;
      status_eksekusi: string;
      id_kantor: string;
    }>(
      `SELECT a.id_ajuan, a.id_pemasangan_baru, a.id_donatur, a.id_anak,
              a.id_anak_pengganti, a.nama_anak_pengganti, a.program_donasi,
              a.approve_funding, a.status_eksekusi, a.id_kantor
       FROM ajis_view_ajuan a
       WHERE a.id_ajuan = ? AND ${scopeSql}
       LIMIT 1`,
      [idAjuan, ...scopeParams],
    );

    if (!ajuan) {
      return NextResponse.json({ error: 'Ajuan tidak ditemukan.' }, { status: 404 });
    }
    if (ajuan.approve_funding !== 'y') {
      return NextResponse.json(
        { error: 'Ajuan belum disetujui funding (approve_funding harus y).' },
        { status: 400 },
      );
    }
    if (ajuan.status_eksekusi === 'y') {
      return NextResponse.json({ error: 'Ajuan sudah dieksekusi.' }, { status: 400 });
    }
    if (!ajuan.id_pemasangan_baru || !ajuan.id_anak_pengganti) {
      return NextResponse.json(
        { error: 'Data pemasangan / anak pengganti tidak lengkap.' },
        { status: 400 },
      );
    }

    const oldPairing = await queryOne<{
      id_pemasangan_baru: string;
      id_program: number;
      program_donasi: string;
      id_donatur: string;
      id_anak: string;
    }>(
      `SELECT id_pemasangan_baru, id_program, program_donasi, id_donatur, id_anak
       FROM ajis_pemasangan
       WHERE id_pemasangan_baru = ?
       LIMIT 1`,
      [ajuan.id_pemasangan_baru],
    );

    if (!oldPairing) {
      return NextResponse.json({ error: 'Pemasangan lama tidak ditemukan.' }, { status: 404 });
    }

    const year = String(new Date().getFullYear());
    const newIdPemasangan = `${ajuan.id_anak_pengganti}${ajuan.id_donatur}${year}`;
    const month = new Date().getMonth() + 1;
    const semesterGanjil = month <= 6;
    const username = session.username;

    await withTransaction(async conn => {
      // 1) Stop old pairing
      await txExecute(
        conn,
        `UPDATE ajis_pemasangan
         SET status_pasangan = 'n',
             tgl_pemberhentian_pemasangan = NOW(),
             keterangan_pemberhentian = ?,
             via_stop = 'desktop',
             user_stop = ?
         WHERE id_pemasangan_baru = ?`,
        [keteranganStop, username, ajuan.id_pemasangan_baru],
      );

      // 2) Activate new child
      await txExecute(
        conn,
        `UPDATE ajis_anak SET status_anak_juara = 'aj' WHERE id_anak = ?`,
        [ajuan.id_anak_pengganti],
      );

      // 3) Create new pairing
      await txExecute(
        conn,
        `INSERT INTO ajis_pemasangan (
           tgl_pemasangan, id_donatur, id_anak, program_donasi, id_program,
           status_pasangan, user_insert, date_insert, id_pemasangan_baru, tahun,
           tunda_penyaluran, via_input,
           tgl_pemberhentian_pemasangan, id_wilayah_pembinaan, kantor_id,
           harga_program, harga_penyaluran, keterangan_pemberhentian,
           saldo_awal, status_saldo, program_sebelumnya, user_update, date_update,
           jns_kel, nama_anak, kelas, nama_donatur, nama_wilayah, nama_kantor,
           jenjang_pendidikan, asnaf, status_ortu, status_aj, id_sdm, nik,
           status_mentor, no_rekening, cek, nia_rfo, nama_rfo, id_naik_jenjang,
           history, user_stop, via_stop, jcustid, id_pemasangan_new, pinjam
         ) VALUES (
           NOW(), ?, ?, ?, ?,
           'y', ?, NOW(), ?, ?,
           '', 'desktop',
           '0000-00-00', '', '',
           0, 0, '',
           0, 'n', '', '', NOW(),
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', 0, '', ''
         )`,
        [
          ajuan.id_donatur,
          ajuan.id_anak_pengganti,
          oldPairing.program_donasi || ajuan.program_donasi,
          oldPairing.id_program,
          username,
          newIdPemasangan,
          year,
        ],
      );

      // 4) Sync biodata from ajis_anak
      await txExecute(
        conn,
        `UPDATE ajis_pemasangan a
         LEFT JOIN ajis_anak b ON a.id_anak = b.id_anak
         SET
           a.id_wilayah_pembinaan = IFNULL(b.id_wilayah_pembinaan, a.id_wilayah_pembinaan),
           a.kantor_id = IFNULL(b.kantor_id, a.kantor_id),
           a.nama_kantor = IFNULL(b.nama_kantor, a.nama_kantor),
           a.nama_wilayah = IFNULL(b.nama_wilayah, a.nama_wilayah),
           a.nama_anak = IFNULL(b.nama_lengkap, a.nama_anak),
           a.jns_kel = IFNULL(b.jns_kel, a.jns_kel),
           a.jenjang_pendidikan = IFNULL(b.jenjang_pendidikan, a.jenjang_pendidikan),
           a.asnaf = IFNULL(b.asnaf, a.asnaf),
           a.nik = IFNULL(b.nik, a.nik),
           a.status_ortu = IFNULL(b.status_ortu, a.status_ortu),
           a.no_rekening = IFNULL(b.no_rekening, a.no_rekening),
           a.kelas = IFNULL(b.kelas, a.kelas)
         WHERE a.id_pemasangan_baru = ?`,
        [newIdPemasangan],
      );

      // 5) Sync harga program
      await txExecute(
        conn,
        `UPDATE ajis_pemasangan a
         INNER JOIN setting_program b ON a.program_donasi = b.nama_program
         SET a.harga_program = b.harga_program,
             a.harga_penyaluran = b.harga_penyaluran
         WHERE a.id_pemasangan_baru = ?`,
        [newIdPemasangan],
      );

      // 6) Sync funding from donatur
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

      // 7) Refresh transaksi aggregates for donor
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
        [ajuan.id_donatur, ajuan.id_donatur],
      );

      // 8) Move selected donations
      if (donasiIds.length > 0) {
        const placeholders = donasiIds.map(() => '?').join(',');
        await txExecute(
          conn,
          `UPDATE ajis_input_donasi
           SET id_anak = ?,
               program_donasi = ?,
               id_program = ?
           WHERE id_input_donasi IN (${placeholders})`,
          [
            ajuan.id_anak_pengganti,
            oldPairing.program_donasi || ajuan.program_donasi,
            String(oldPairing.id_program),
            ...donasiIds,
          ],
        );
        await txExecute(
          conn,
          `UPDATE ajis_input_donasi
           SET id_pemasangan_baru = CONCAT(id_anak, id_donatur, tahun)
           WHERE id_input_donasi IN (${placeholders})`,
          donasiIds,
        );
      }

      // 9) Opname for new pairing — prefer direct insert from new pemasangan row
      const newPair = await txQueryOne<{
        id_anak: string;
        id_donatur: string;
        program_donasi: string;
        id_program: number;
        kantor_id: string;
        id_pemasangan_baru: string;
      }>(
        conn,
        `SELECT id_anak, id_donatur, program_donasi, id_program, kantor_id, id_pemasangan_baru
         FROM ajis_pemasangan
         WHERE id_pemasangan_baru = ?
         LIMIT 1`,
        [newIdPemasangan],
      );

      if (newPair) {
        const existingOpname = await txQueryOne<{ id_pemasangan_baru: string }>(
          conn,
          `SELECT id_pemasangan_baru FROM ajis_opname
           WHERE id_pemasangan_baru = ? AND tahun = ?
           LIMIT 1`,
          [newIdPemasangan, year],
        );

        if (existingOpname) {
          const col = semesterGanjil ? 'saldo_awal_ganjil' : 'saldo_awal_genap';
          await txExecute(
            conn,
            `UPDATE ajis_opname
             SET ${col} = ${col} + ?,
                 updated = NOW()
             WHERE id_pemasangan_baru = ? AND tahun = ?`,
            [saldoAkhirGanti, newIdPemasangan, year],
          );
        } else {
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
               ?, 0, ?, 0,
               '', '0000-00-00 00:00:00', '',
               '', '0000-00-00 00:00:00', '',
               ?, '', '', 0, ''
             )`,
            [
              year,
              newPair.id_anak,
              newPair.id_donatur,
              newPair.program_donasi,
              newPair.kantor_id,
              String(newPair.id_program),
              newPair.id_pemasangan_baru,
              semesterGanjil ? saldoAkhirGanti : 0,
              semesterGanjil ? 0 : saldoAkhirGanti,
              username,
            ],
          );
        }
      }

      // 10) Adjust old child opname
      await txExecute(
        conn,
        `UPDATE ajis_opname
         SET saldo_awal_ganjil = ?,
             saldo_akhir_ganjil = ?,
             saldo_awal_genap = ?,
             saldo_akhir_genap = ?,
             updated = NOW()
         WHERE id_pemasangan_baru = ?`,
        [
          saldoAwalGanjil,
          saldoAkhirGanjil,
          saldoAwalGenap,
          saldoAkhirGenap,
          ajuan.id_pemasangan_baru,
        ],
      );

      // 11) Mark ajuan executed
      await txExecute(
        conn,
        `UPDATE ajis_view_ajuan
         SET tgl_eksekusi = NOW(),
             status_eksekusi = 'y'
         WHERE id_ajuan = ?`,
        [idAjuan],
      );
    });

    return NextResponse.json({
      data: {
        ok: true,
        id_pemasangan_baru: newIdPemasangan,
      },
      message: 'Eksekusi pergantian anak berhasil.',
    });
  } catch (err) {
    console.error('[ajuan eksekusi]', err);
    return NextResponse.json({ error: 'Gagal mengeksekusi pergantian anak.' }, { status: 500 });
  }
}
