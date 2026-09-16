/**
 * GET  /api/anakjuara/peminjaman — Peminjaman Anak list (MySQL sipc_ijf.ajis_peminjaman_anak).
 * POST /api/anakjuara/peminjaman — create a loan (donor or ZISCO employee borrower).
 *
 * Transisi track (CLAUDE.md §2.1) — lib/db.ts, `?` placeholders. No schema
 * changes allowed on this table, so the donor/employee distinction is derived
 * at read time (LEFT JOIN ajis_peminjam: a match is 'donatur', no match is
 * 'karyawan') rather than stored in a new column.
 *
 * Legacy (ajis-rz-v1 PeminjamanDataCAJ_Create) only ever lent to a donor/RFO.
 * Lending to a ZISCO employee is new: the employee comes from
 * zains_rz.hcm_karyawan (lib/hcm.ts, read-only), which lives in a different
 * database entirely and has no FK here.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, withTransaction, txQueryOne, txExecute, txExecuteResult } from '@/lib/db';
import { getSession, getScopeCondition, type SessionData } from '@/lib/auth';
import { RuleError } from '@/lib/transaksi/rules';
import type { PeminjamanAnakCreateInput, PeminjamanAnakRow } from '@/types/peminjaman';

const LIST_COLUMNS = `
  p.id_peminjaman, p.id_peminjam,
  IF(d.id_peminjam IS NOT NULL, 'donatur', 'karyawan') AS tipe_peminjam,
  p.nama_peminjam, p.id_anak, p.nama_anak, p.jns_kel, p.jenjang_pendidikan,
  p.kantor_id, p.nama_kantor, p.id_wilayah_pembinaan, p.nama_wilayah,
  p.tgl_awal_peminjaman, p.tgl_selesai_peminjaman, p.tgl_expired,
  p.status_pinjam, p.status_terpasangkan, p.cancel, p.alasan_cancel`;

const FROM = `
  FROM ajis_peminjaman_anak p
  LEFT JOIN ajis_peminjam d ON d.id_peminjam = p.id_peminjam`;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = (sp.get('q') || '').trim();
    const status = sp.get('status') || ''; // 'aktif' | 'selesai' | 'cancel'
    const tipePeminjam = sp.get('tipe_peminjam') || ''; // 'donatur' | 'karyawan'
    const kantorId = session.idGroupUser === 1 ? (sp.get('kantor_id') || '') : '';
    const wilayah = sp.get('wilayah') || '';
    const tglFrom = sp.get('tgl_awal_from') || '';
    const tglTo = sp.get('tgl_awal_to') || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10) || 50));
    const offset = (page - 1) * limit;

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'p');
    const conditions: string[] = [scope];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push('(p.nama_anak LIKE ? OR p.id_anak LIKE ? OR p.nama_peminjam LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (status === 'aktif') conditions.push(`p.status_pinjam = 'y' AND p.cancel != 'y'`);
    if (status === 'selesai') conditions.push(`p.tgl_selesai_peminjaman IS NOT NULL AND p.cancel != 'y'`);
    if (status === 'cancel') conditions.push(`p.cancel = 'y'`);
    if (tipePeminjam === 'donatur') conditions.push('d.id_peminjam IS NOT NULL');
    if (tipePeminjam === 'karyawan') conditions.push('d.id_peminjam IS NULL');
    if (kantorId) { conditions.push('p.kantor_id = ?'); params.push(kantorId); }
    if (wilayah) { conditions.push('p.id_wilayah_pembinaan = ?'); params.push(wilayah); }
    if (tglFrom) { conditions.push('p.tgl_awal_peminjaman >= ?'); params.push(tglFrom); }
    if (tglTo) { conditions.push('p.tgl_awal_peminjaman <= ?'); params.push(tglTo); }

    const WHERE = `WHERE ${conditions.join(' AND ')}`;

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total ${FROM} ${WHERE}`,
      params,
    );
    const rows = await query<PeminjamanAnakRow>(
      `SELECT ${LIST_COLUMNS} ${FROM} ${WHERE}
       ORDER BY p.id_peminjaman DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({ data: rows, total: Number(countRow?.total ?? 0), page, limit });
  } catch (err) {
    console.error('[peminjaman list]', err);
    return NextResponse.json({ error: 'Gagal memuat data peminjaman.' }, { status: 500 });
  }
}

type AnakScopeRow = {
  id_anak: string; nama_lengkap: string; jns_kel: string | null; jenjang_pendidikan: string | null;
  kantor_id: string | null; nama_kantor: string | null;
  id_wilayah_pembinaan: string | null; nama_wilayah: string | null;
  status_pinjam: 'y' | 'n';
};

/** True when the session's role scope covers this anak row (§2.1a role scoping). */
function inScope(session: SessionData, row: { kantor_id: string | null; id_wilayah_pembinaan: string | null }): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<PeminjamanAnakCreateInput>;
    const idAnak = body.id_anak?.trim();
    const tipePeminjam = body.tipe_peminjam;
    const idPeminjam = body.id_peminjam?.trim();
    const namaPeminjam = body.nama_peminjam?.trim();
    const tglAwal = body.tgl_awal_peminjaman;
    const jmlHari = Number(body.jml_hari_peminjaman);

    if (!idAnak || !tipePeminjam || !idPeminjam || !namaPeminjam || !tglAwal || !Number.isFinite(jmlHari) || jmlHari <= 0) {
      return NextResponse.json({ error: 'Data peminjaman tidak lengkap.', code: 'VALIDATION' }, { status: 400 });
    }
    if (tipePeminjam !== 'donatur' && tipePeminjam !== 'karyawan') {
      return NextResponse.json({ error: 'tipe_peminjam tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    // ajis_peminjaman_anak.id_peminjam is varchar(16) — legacy schema, cannot be
    // widened (CLAUDE.md: no schema changes on the MySQL track).
    if (idPeminjam.length > 16) {
      return NextResponse.json({ error: 'ID peminjam terlalu panjang (maks 16 karakter).', code: 'VALIDATION' }, { status: 400 });
    }

    const result = await withTransaction(async conn => {
      const anak = await txQueryOne<AnakScopeRow>(
        conn,
        `SELECT id_anak, nama_lengkap, jns_kel, jenjang_pendidikan,
                kantor_id, nama_kantor, id_wilayah_pembinaan, nama_wilayah, status_pinjam
         FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
        [idAnak],
      );
      if (!anak) throw new RuleError('Anak tidak ditemukan.', 'ANAK_NOT_FOUND');
      if (!inScope(session, anak)) {
        throw new RuleError('Anda tidak memiliki akses ke data anak ini.', 'FORBIDDEN');
      }
      if (anak.status_pinjam === 'y') {
        throw new RuleError('Anak ini sedang dalam status dipinjam.', 'ALREADY_BORROWED');
      }

      const tglExpired = new Date(tglAwal);
      tglExpired.setDate(tglExpired.getDate() + jmlHari);
      const tglExpiredStr = tglExpired.toISOString().slice(0, 10);

      const inserted = await txExecuteResult(
        conn,
        `INSERT INTO ajis_peminjaman_anak
           (id_peminjam, nama_peminjam, id_anak, nama_anak, jns_kel, jenjang_pendidikan,
            kantor_id, nama_kantor, id_wilayah_pembinaan, nama_wilayah,
            tgl_awal_peminjaman, tgl_expired, status_pinjam, status_terpasangkan, cancel,
            user_insert, date_insert)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'y', 'n', 'n', ?, CURDATE())`,
        [
          idPeminjam, namaPeminjam, anak.id_anak, anak.nama_lengkap, anak.jns_kel, anak.jenjang_pendidikan,
          anak.kantor_id, anak.nama_kantor, anak.id_wilayah_pembinaan, anak.nama_wilayah,
          tglAwal, tglExpiredStr, session.username,
        ],
      );

      await txExecute(conn, `UPDATE ajis_anak SET status_pinjam = 'y' WHERE id_anak = ?`, [idAnak]);

      return { id_peminjaman: inserted.insertId };
    });

    return NextResponse.json({ message: 'Peminjaman anak tersimpan.', id_peminjaman: result.id_peminjaman }, { status: 201 });
  } catch (err) {
    if (err instanceof RuleError) {
      return NextResponse.json({ error: err.message, code: err.code ?? 'RULE' }, { status: 400 });
    }
    console.error('[peminjaman create]', err);
    return NextResponse.json({ error: 'Gagal membuat peminjaman.' }, { status: 500 });
  }
}

