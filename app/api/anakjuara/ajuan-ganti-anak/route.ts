/**
 * GET  /api/anakjuara/ajuan-ganti-anak — list ajuan (filters + pagination)
 * POST /api/anakjuara/ajuan-ganti-anak — create ajuan + book nia_rfo on child
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txExecute } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import { getDonaturSnapshot } from '@/lib/donatur';
import type { AjuanGantiAnak, CreateAjuanPayload, TipeGanti } from '@/types/ajuan';

const AJUAN_SELECT = `
  id_ajuan, tgl_ajuan, id_pemasangan_baru,
  id_kantor, nama_kantor, id_wilayah_pembinaan, nama_wilayah,
  id_donatur, oid_donatur, kantor_donatur, nama_donatur, jenis_kelamin_donatur,
  program_donasi, nia_rfo, nama_rfo,
  id_anak, nama_anak_asal, jns_kelamin, alasan_pergantian,
  id_anak_pengganti, nama_anak_pengganti, keterangan, tipe_ganti, pindah_saldo,
  approve_funding, status_eksekusi, tgl_eksekusi, tgl_approve_funding,
  jcustid, jenis_donatur, hp, alasan_reject`;

export async function GET(req: NextRequest) {
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

    const sp = req.nextUrl.searchParams;
    const bulan = sp.get('bulan') || '';
    const tahun = sp.get('tahun') || '';
    const approve = sp.get('approve_funding') || '';
    const eksekusi = sp.get('status_eksekusi') || '';
    const q = sp.get('q') || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'id_kantor',
      'a',
    );

    const conditions: string[] = [scopeSql];
    const params: unknown[] = [...scopeParams];

    const kantorParam = sp.get('kantor_id') || '';
    if (!forcedKantor && kantorParam) {
      conditions.push('a.id_kantor = ?');
      params.push(kantorParam);
    }
    if (bulan) {
      conditions.push('MONTH(a.tgl_ajuan) = ?');
      params.push(Number(bulan));
    }
    if (tahun) {
      conditions.push('YEAR(a.tgl_ajuan) = ?');
      params.push(Number(tahun));
    }
    if (approve === 't' || approve === 'y' || approve === 'n') {
      conditions.push('a.approve_funding = ?');
      params.push(approve);
    }
    if (eksekusi === 'y' || eksekusi === 'n') {
      if (eksekusi === 'n') {
        conditions.push(`(a.status_eksekusi = 'n' OR a.status_eksekusi = '' OR a.status_eksekusi IS NULL)`);
      } else {
        conditions.push('a.status_eksekusi = ?');
        params.push(eksekusi);
      }
    }
    if (q) {
      conditions.push(`(
        a.id_anak_pengganti LIKE ? OR a.id_anak LIKE ? OR
        a.nama_anak_pengganti LIKE ? OR a.nama_anak_asal LIKE ? OR
        a.id_donatur LIKE ? OR a.nama_donatur LIKE ? OR
        a.nia_rfo LIKE ? OR a.nama_rfo LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like);
    }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_view_ajuan a WHERE ${WHERE}`,
      params,
    );

    const rows = await query<AjuanGantiAnak>(
      `SELECT ${AJUAN_SELECT}
       FROM ajis_view_ajuan a
       WHERE ${WHERE}
       ORDER BY a.tgl_ajuan DESC, a.id_ajuan DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows,
      total: countRow?.total ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('[ajuan list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar ajuan.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as CreateAjuanPayload;

    if (!body.id_pemasangan_baru || !body.id_anak_asal || !body.id_anak_pengganti) {
      return NextResponse.json(
        { error: 'id_pemasangan_baru, id_anak_asal, dan id_anak_pengganti wajib diisi.' },
        { status: 400 },
      );
    }
    if (!body.alasan_pergantian?.trim()) {
      return NextResponse.json({ error: 'Alasan pergantian wajib diisi.' }, { status: 400 });
    }
    if (body.tipe_ganti !== 'anak_existing' && body.tipe_ganti !== 'pemasangan_baru') {
      return NextResponse.json({ error: 'tipe_ganti tidak valid.' }, { status: 400 });
    }

    // Verify source pairing exists and is in scope
    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'kantor_id',
      'p',
    );
    const pairing = await queryOne<{
      id_pemasangan_baru: string;
      kantor_id: string;
      nama_kantor: string;
      id_wilayah_pembinaan: string;
      nama_wilayah: string;
      id_donatur: string;
      nama_donatur: string;
      program_donasi: string;
      nia_rfo: string;
      nama_rfo: string;
      id_anak: string;
      nama_anak: string;
      jns_kel: string;
      jcustid: number;
      status_pasangan: string;
    }>(
      `SELECT p.id_pemasangan_baru, p.kantor_id, p.nama_kantor, p.id_wilayah_pembinaan,
              p.nama_wilayah, p.id_donatur, p.nama_donatur, p.program_donasi,
              p.nia_rfo, p.nama_rfo, p.id_anak, p.nama_anak, p.jns_kel, p.jcustid,
              p.status_pasangan
       FROM ajis_pemasangan p
       WHERE p.id_pemasangan_baru = ? AND ${scopeSql}
       LIMIT 1`,
      [body.id_pemasangan_baru, ...scopeParams],
    );

    if (!pairing) {
      return NextResponse.json({ error: 'Pemasangan tidak ditemukan atau di luar akses.' }, { status: 404 });
    }

    const idKantor = forcedKantor ?? pairing.kantor_id;
    if (forcedKantor && body.id_kantor && body.id_kantor !== forcedKantor) {
      return NextResponse.json({ error: 'Kantor tidak sesuai sesi cabang.' }, { status: 403 });
    }

    // Validate replacement child by tipe
    const tip: TipeGanti = body.tipe_ganti;
    const year = String(new Date().getFullYear());
    if (tip === 'anak_existing') {
      const existing = await queryOne<{ id_anak: string }>(
        session.idGroupUser === 2
          ? `SELECT id_anak FROM ajis_pemasangan
             WHERE id_anak = ? AND status_pasangan = 'n' AND tahun = ? AND kantor_id = ?
             LIMIT 1`
          : `SELECT id_anak FROM ajis_pemasangan
             WHERE id_anak = ? AND status_pasangan = 'n' AND tahun = ?
             LIMIT 1`,
        session.idGroupUser === 2
          ? [body.id_anak_pengganti, year, session.idKantor]
          : [body.id_anak_pengganti, year],
      );
      if (!existing) {
        return NextResponse.json(
          { error: 'Anak pengganti (existing) tidak valid untuk tahun ini.' },
          { status: 400 },
        );
      }
    } else {
      const calon = await queryOne<{ id_anak: string }>(
        session.idGroupUser === 2
          ? `SELECT id_anak FROM ajis_anak
             WHERE id_anak = ? AND status_anak_juara = 'caj' AND aktif = 'y' AND kantor_id = ?
             LIMIT 1`
          : `SELECT id_anak FROM ajis_anak
             WHERE id_anak = ? AND status_anak_juara = 'caj' AND aktif = 'y'
             LIMIT 1`,
        session.idGroupUser === 2
          ? [body.id_anak_pengganti, session.idKantor]
          : [body.id_anak_pengganti],
      );
      if (!calon) {
        return NextResponse.json(
          { error: 'Anak pengganti (calon AJ) tidak valid.' },
          { status: 400 },
        );
      }
    }

    /*
     * Donor details live in `donatur`, not in `ajis_pemasangan`, so the selected
     * Anak Juara row cannot carry them. Read them here rather than accepting them
     * from the client: these columns end up on the ajuan record and must not be
     * forgeable from the browser.
     */
    const donatur = await getDonaturSnapshot(pairing.id_donatur);
    const oidDonatur = donatur.oid_donatur;
    const kantorDonatur = donatur.kantor_donatur;
    const jenisKelDonatur = donatur.jenis_kelamin;
    const jcustid = String(donatur.jcustid || pairing.jcustid || '');
    const jenisDonatur = donatur.jenis_donatur;
    const hp = donatur.hp;
    const pindahSaldo = Number(body.pindah_saldo ?? 0) || 0;
    const keterangan = body.keterangan ?? '';

    await withTransaction(async conn => {
      await txExecute(
        conn,
        `INSERT INTO ajis_view_ajuan (
          id_pemasangan_baru, tgl_ajuan, nama_kantor, id_wilayah_pembinaan, nama_wilayah,
          id_donatur, oid_donatur, kantor_donatur, id_kantor, nama_donatur, program_donasi,
          nia_rfo, nama_rfo, id_anak, nama_anak_asal, alasan_pergantian,
          id_anak_pengganti, nama_anak_pengganti, keterangan, tipe_ganti, pindah_saldo,
          approve_funding, jcustid, jenis_donatur, hp, status_eksekusi, jenis_kelamin_donatur,
          jns_kelamin, tgl_approve_funding, alasan_reject
        ) VALUES (
          ?, NOW(), ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          't', ?, ?, ?, 'n', ?,
          ?, '0000-00-00 00:00:00', ''
        )`,
        [
          pairing.id_pemasangan_baru,
          pairing.nama_kantor || body.nama_kantor,
          pairing.id_wilayah_pembinaan || body.id_wilayah_pembinaan,
          pairing.nama_wilayah || body.nama_wilayah,
          pairing.id_donatur,
          oidDonatur,
          kantorDonatur,
          idKantor,
          pairing.nama_donatur,
          pairing.program_donasi,
          pairing.nia_rfo,
          pairing.nama_rfo,
          pairing.id_anak,
          pairing.nama_anak,
          body.alasan_pergantian.trim(),
          body.id_anak_pengganti,
          body.nama_anak_pengganti,
          keterangan,
          tip,
          pindahSaldo,
          jcustid,
          jenisDonatur,
          hp,
          jenisKelDonatur,
          pairing.jns_kel || body.jns_kelamin || '',
        ],
      );

      await txExecute(
        conn,
        `UPDATE ajis_anak
         SET nia_rfo_book = ?, nama_rfo_book = ?
         WHERE id_anak = ?`,
        [pairing.nia_rfo, pairing.nama_rfo, body.id_anak_pengganti],
      );
    });

    return NextResponse.json({
      data: { ok: true },
      message: 'Data berhasil disave. Cek menu List Ajuan Pergantian untuk update dari funding.',
    }, { status: 201 });
  } catch (err) {
    console.error('[ajuan create]', err);
    return NextResponse.json({ error: 'Gagal menyimpan ajuan.' }, { status: 500 });
  }
}
