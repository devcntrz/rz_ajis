/**
 * POST /api/anakjuara/ajuan-ganti-anak/[id]/eksekusi
 * Full child-replacement transaction (PRD §8.5).
 * Allowed while pending or approved; blocked only if already executed.
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
      nama_donatur: string | null;
      nia_rfo: string | null;
      nama_rfo: string | null;
    }>(
      `SELECT id_pemasangan_baru, id_program, program_donasi, id_donatur, id_anak,
              nama_donatur, nia_rfo, nama_rfo
       FROM ajis_pemasangan
       WHERE id_pemasangan_baru = ?
       LIMIT 1`,
      [ajuan.id_pemasangan_baru],
    );

    if (!oldPairing) {
      return NextResponse.json({ error: 'Pemasangan lama tidak ditemukan.' }, { status: 404 });
    }

    const penggantiBio = await queryOne<{
      id_wilayah_pembinaan: string | null;
      kantor_id: string | null;
      nama_kantor: string | null;
      nama_wilayah: string | null;
      nama_lengkap: string | null;
      jns_kel: string | null;
      jenjang_pendidikan: string | null;
      asnaf: string | null;
      nik: string | null;
      status_ortu: string | null;
      no_rekening: string | null;
      kelas: string | null;
    }>(
      `SELECT id_wilayah_pembinaan, kantor_id, nama_kantor, nama_wilayah, nama_lengkap,
              jns_kel, jenjang_pendidikan, asnaf, nik, status_ortu, no_rekening, kelas
       FROM ajis_anak
       WHERE id_anak = ?
       LIMIT 1`,
      [ajuan.id_anak_pengganti],
    );
    if (!penggantiBio || !penggantiBio.id_wilayah_pembinaan) {
      return NextResponse.json(
        { error: 'Data wilayah pembinaan anak pengganti tidak ditemukan.' },
        { status: 400 },
      );
    }

    // harga_program has no MySQL default under strict mode either — same class of
    // bug as id_wilayah_pembinaan above. Source it up front from setting_program
    // (step 5 below re-syncs it, but that runs after this INSERT, so it can't be
    // the thing that satisfies the NOT NULL constraint on the first write).
    const programHarga = await queryOne<{ harga_program: number; harga_penyaluran: number }>(
      `SELECT harga_program, harga_penyaluran FROM setting_program WHERE nama_program = ? LIMIT 1`,
      [oldPairing.program_donasi || ajuan.program_donasi],
    );

    const year = String(new Date().getFullYear());
    const newIdPemasangan = `${ajuan.id_anak_pengganti}${ajuan.id_donatur}${year}`;

    /*
     * The legacy app ran these steps without a transaction, so it could mark an ajuan
     * executed while the pairing it was supposed to create never appeared. Blocking on
     * status_eksekusi alone left those rows unrepairable from the UI. Block on the real
     * evidence instead: the new pairing existing. If it is missing, this is a repair of
     * a half-finished execution and must be allowed to run.
     */
    const alreadyDone = await queryOne<{ id_pemasangan_baru: string }>(
      `SELECT id_pemasangan_baru FROM ajis_pemasangan
       WHERE id_pemasangan_baru = ? LIMIT 1`,
      [newIdPemasangan],
    );
    if (ajuan.status_eksekusi === 'y' && alreadyDone) {
      return NextResponse.json(
        { error: 'Ajuan sudah dieksekusi dan pemasangan barunya sudah terbentuk.' },
        { status: 400 },
      );
    }
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

      // 3) Create new pairing (PRD §8.5 step 3).
      // Every column below is NOT NULL with no MySQL default under strict mode
      // (confirmed against information_schema.columns — ajis_pemasangan has 46
      // such columns in total). Building the column/placeholder/value lists from
      // one object instead of three hand-aligned parallel lists means a missed
      // column shows up immediately as a missing key, not as a silent off-by-one
      // between the SQL text and the params array.
      // ON DUPLICATE KEY reactivates an existing pairing instead of aborting the whole
      // transaction — tipe_ganti = 'anak_existing' points at a child that already has an
      // inactive pairing row for this year.
      const pairingFields: Record<string, unknown> = {
        id_donatur: ajuan.id_donatur,
        id_anak: ajuan.id_anak_pengganti,
        program_donasi: oldPairing.program_donasi || ajuan.program_donasi,
        id_program: oldPairing.id_program,
        user_insert: username,
        id_pemasangan_baru: newIdPemasangan,
        tahun: year,
        id_wilayah_pembinaan: penggantiBio.id_wilayah_pembinaan,
        kantor_id: penggantiBio.kantor_id,
        nama_kantor: penggantiBio.nama_kantor,
        nama_wilayah: penggantiBio.nama_wilayah,
        nama_anak: penggantiBio.nama_lengkap,
        jns_kel: penggantiBio.jns_kel,
        jenjang_pendidikan: penggantiBio.jenjang_pendidikan,
        asnaf: penggantiBio.asnaf,
        nik: penggantiBio.nik,
        status_ortu: penggantiBio.status_ortu,
        no_rekening: penggantiBio.no_rekening,
        kelas: penggantiBio.kelas,
        harga_program: programHarga?.harga_program ?? 0,
        harga_penyaluran: programHarga?.harga_penyaluran ?? 0,
        program_sebelumnya: oldPairing.program_donasi || ajuan.program_donasi || '',
        nama_donatur: oldPairing.nama_donatur || '',
        nia_rfo: oldPairing.nia_rfo || '',
        nama_rfo: oldPairing.nama_rfo || '',
        user_update: username,
        // Remaining NOT NULL columns this flow has no real value for.
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
    // Surface the DB reason: a rolled-back replacement is invisible otherwise, and the
    // generic message previously made a broken INSERT look like "nothing happened".
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Gagal mengeksekusi pergantian anak: ${detail}`, code: 'EKSEKUSI_FAILED' },
      { status: 500 },
    );
  }
}
