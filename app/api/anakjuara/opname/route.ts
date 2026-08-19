/**
 * GET  /api/anakjuara/opname?id_pemasangan_baru=… — modal context: pairing identity
 *      plus the Jan–Des pivot for the current year and the year before it.
 * POST /api/anakjuara/opname — correct the four semester balances of one ajis_opname row.
 *
 * This is the only place in the app that edits ajis_opname on purpose; the eksekusi
 * route touches it only as a side effect of replacing a child.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txQueryOne, txExecute } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import {
  buildKeuangan,
  pivotByPairing,
  type BulanAgg,
  type OpnameAgg,
  type KeuanganPivot,
} from '@/lib/keuangan';

interface PairingRow {
  id_pemasangan_baru: string;
  tahun:              string;
  id_anak:            string;
  nama_anak:          string;
  id_donatur:         string;
  nama_donatur:       string;
  program_donasi:     string;
  id_program:         number;
  kantor_id:          string;
  harga_program:      number;
}

interface OpnameRow extends OpnameAgg {
  tahun:      number;
  keterangan: string | null;
}

export interface OpnameYear {
  tahun:              string;
  id_pemasangan_baru: string;
  keuangan:           KeuanganPivot;
  opname: {
    saldo_awal_ganjil:  number;
    saldo_akhir_ganjil: number;
    saldo_awal_genap:   number;
    saldo_akhir_genap:  number;
    keterangan:         string;
  } | null;
}

/** The pairing the request targets, or null when out of scope / missing. */
async function loadPairing(
  idPemasangan: string,
  scopeSql: string,
  scopeParams: unknown[],
): Promise<PairingRow | null> {
  return queryOne<PairingRow>(
    `SELECT p.id_pemasangan_baru, p.tahun, p.id_anak, p.nama_anak,
            p.id_donatur, p.nama_donatur, p.program_donasi, p.id_program,
            p.kantor_id, p.harga_program
     FROM ajis_pemasangan p
     WHERE p.id_pemasangan_baru = ? AND ${scopeSql}
     LIMIT 1`,
    [idPemasangan, ...scopeParams],
  );
}

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

    const idPemasangan = req.nextUrl.searchParams.get('id_pemasangan_baru') || '';
    if (!idPemasangan) {
      return NextResponse.json({ error: 'id_pemasangan_baru wajib diisi.' }, { status: 400 });
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'kantor_id', 'p');
    const pairing = await loadPairing(idPemasangan, scopeSql, scopeParams);
    if (!pairing) {
      return NextResponse.json({ error: 'Pemasangan tidak ditemukan.' }, { status: 404 });
    }

    /*
     * Sibling pairing for the previous year. Looked up by id_anak + id_donatur rather
     * than by rebuilding the id as id_anak+id_donatur+tahun: older records do not all
     * follow that pattern, so composing the string would silently miss them.
     */
    const thisYear = Number(pairing.tahun) || new Date().getFullYear();
    const siblings = await query<{ id_pemasangan_baru: string; tahun: string; harga_program: number }>(
      `SELECT p.id_pemasangan_baru, p.tahun, p.harga_program
       FROM ajis_pemasangan p
       WHERE p.id_anak = ? AND p.id_donatur = ? AND p.tahun IN (?, ?)
       ORDER BY p.tahun DESC`,
      [pairing.id_anak, pairing.id_donatur, String(thisYear), String(thisYear - 1)],
    );

    const ids = siblings.map(s => s.id_pemasangan_baru);
    if (ids.length === 0) {
      ids.push(pairing.id_pemasangan_baru);
      siblings.push({
        id_pemasangan_baru: pairing.id_pemasangan_baru,
        tahun: pairing.tahun,
        harga_program: pairing.harga_program,
      });
    }
    const ph = ids.map(() => '?').join(',');

    // Same three aggregates as the Anak Juara grid, keyed on id_pemasangan_baru only
    // so the figures match the legacy views exactly.
    const [donasiRows, penyaluranRows, opnameRows] = await Promise.all([
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_donasi, 0)) AS total
         FROM ajis_input_donasi
         WHERE id_pemasangan_baru IN (${ph}) AND jenis = 'trans'
         GROUP BY id_pemasangan_baru, bulan`,
        ids,
      ),
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_penyaluran, 0)) AS total
         FROM ajis_penyaluran
         WHERE id_pemasangan_baru IN (${ph})
         GROUP BY id_pemasangan_baru, bulan`,
        ids,
      ),
      query<OpnameRow>(
        `SELECT id_pemasangan_baru, tahun, keterangan,
                saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
                date_opname_ganjil, user_opname_ganjil, date_opname_genap, user_opname_genap
         FROM ajis_opname
         WHERE id_pemasangan_baru IN (${ph})`,
        ids,
      ),
    ]);

    const donasi = pivotByPairing(donasiRows);
    const penyaluran = pivotByPairing(penyaluranRows);
    const opnameByPairing = new Map(opnameRows.map(o => [String(o.id_pemasangan_baru), o]));

    const years: OpnameYear[] = siblings.map(s => {
      const o = opnameByPairing.get(s.id_pemasangan_baru);
      return {
        tahun: s.tahun,
        id_pemasangan_baru: s.id_pemasangan_baru,
        keuangan: buildKeuangan(
          donasi[s.id_pemasangan_baru],
          penyaluran[s.id_pemasangan_baru],
          o,
          Number(s.harga_program) || 0,
        ),
        // The raw row matters: SemesterBlock.saldo_akhir is computed
        // (saldo_awal + donasi − penyaluran), not the stored saldo_akhir_*.
        // This modal exists to show and reconcile that difference.
        opname: o
          ? {
              saldo_awal_ganjil:  Number(o.saldo_awal_ganjil) || 0,
              saldo_akhir_ganjil: Number(o.saldo_akhir_ganjil) || 0,
              saldo_awal_genap:   Number(o.saldo_awal_genap) || 0,
              saldo_akhir_genap:  Number(o.saldo_akhir_genap) || 0,
              keterangan:         o.keterangan ?? '',
            }
          : null,
      };
    });

    return NextResponse.json({
      data: {
        pairing: {
          id_pemasangan_baru: pairing.id_pemasangan_baru,
          tahun:              pairing.tahun,
          id_anak:            pairing.id_anak,
          nama_anak:          pairing.nama_anak,
          id_donatur:         pairing.id_donatur,
          nama_donatur:       pairing.nama_donatur,
          program_donasi:     pairing.program_donasi,
        },
        years,
      },
    });
  } catch (err) {
    console.error('[opname get]', err);
    return NextResponse.json({ error: 'Gagal memuat data opname.' }, { status: 500 });
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

    const body = await req.json() as {
      id_pemasangan_baru?:  string;
      saldo_awal_ganjil?:   number | string;
      saldo_akhir_ganjil?:  number | string;
      saldo_awal_genap?:    number | string;
      saldo_akhir_genap?:   number | string;
      keterangan?:          string;
    };

    const idPemasangan = (body.id_pemasangan_baru || '').trim();
    if (!idPemasangan) {
      return NextResponse.json({ error: 'id_pemasangan_baru wajib diisi.' }, { status: 400 });
    }

    // int(11) columns — reject anything that is not a finite number rather than
    // letting MySQL coerce it to 0 and silently wipe a balance.
    const saldoFields = [
      'saldo_awal_ganjil', 'saldo_akhir_ganjil',
      'saldo_awal_genap', 'saldo_akhir_genap',
    ] as const;
    const saldo: Record<string, number> = {};
    for (const f of saldoFields) {
      const n = Number(body[f] ?? 0);
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: `Nilai ${f} tidak valid.` }, { status: 400 });
      }
      saldo[f] = Math.round(n);
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'kantor_id', 'p');
    const pairing = await loadPairing(idPemasangan, scopeSql, scopeParams);
    if (!pairing) {
      return NextResponse.json({ error: 'Pemasangan tidak ditemukan.' }, { status: 404 });
    }

    const keterangan = (body.keterangan || '').trim();

    /*
     * Identify the row by (id_pemasangan_baru, tahun), NOT by the table's primary key.
     * The PK includes id_program, and ajis_opname stores it inconsistently — 11k+ rows
     * hold an empty string where ajis_pemasangan has the numeric id. An
     * INSERT ... ON DUPLICATE KEY UPDATE keyed on the PK therefore misses those rows
     * and silently inserts a duplicate instead of correcting the balance.
     *
     * Existence is checked explicitly rather than relying on UPDATE's affectedRows:
     * MySQL reports 0 changed rows when the values happen to be identical, which would
     * be indistinguishable from "row missing" and would again create a duplicate.
     */
    await withTransaction(async conn => {
      const existing = await txQueryOne<{ id_pemasangan_baru: string }>(
        conn,
        `SELECT id_pemasangan_baru FROM ajis_opname
         WHERE id_pemasangan_baru = ? AND tahun = ?
         LIMIT 1`,
        [pairing.id_pemasangan_baru, pairing.tahun],
      );

      if (existing) {
        /*
         * date_opname_* / user_opname_* are deliberately untouched: they stamp the
         * tutup-opname process, not a balance correction.
         */
        await txExecute(
          conn,
          `UPDATE ajis_opname
           SET saldo_awal_ganjil  = ?,
               saldo_akhir_ganjil = ?,
               saldo_awal_genap   = ?,
               saldo_akhir_genap  = ?,
               keterangan         = ?,
               user_update        = ?,
               updated            = NOW()
           WHERE id_pemasangan_baru = ? AND tahun = ?`,
          [
            saldo.saldo_awal_ganjil,
            saldo.saldo_akhir_ganjil,
            saldo.saldo_awal_genap,
            saldo.saldo_akhir_genap,
            keterangan,
            session.username,
            pairing.id_pemasangan_baru,
            pairing.tahun,
          ],
        );
        return;
      }

      await txExecute(
        conn,
        `INSERT INTO ajis_opname (
           tahun, id_anak, id_donatur, program_donasi, id_program, id_pemasangan_baru,
           id_kantor, saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
           keterangan, user_input, user_update, updated,
           tupo_jan_jun, date_opname_ganjil, user_opname_ganjil,
           tupo_jul_des, date_opname_genap, user_opname_genap,
           jcustid, id_pemasangan_new
         ) VALUES (
           ?, ?, ?, ?, ?, ?,
           ?, ?, ?, ?, ?,
           ?, ?, ?, NOW(),
           '', '0000-00-00 00:00:00', '',
           '', '0000-00-00 00:00:00', '',
           0, ''
         )`,
        [
          pairing.tahun,
          pairing.id_anak,
          pairing.id_donatur,
          pairing.program_donasi,
          String(pairing.id_program),
          pairing.id_pemasangan_baru,
          pairing.kantor_id,
          saldo.saldo_awal_ganjil,
          saldo.saldo_akhir_ganjil,
          saldo.saldo_awal_genap,
          saldo.saldo_akhir_genap,
          keterangan,
          session.username,
          session.username,
        ],
      );
    });

    return NextResponse.json({
      data: { ok: true, tahun: pairing.tahun, id_pemasangan_baru: pairing.id_pemasangan_baru },
      message: 'Opname berhasil diperbarui.',
    });
  } catch (err) {
    console.error('[opname post]', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Gagal menyimpan opname: ${detail}` },
      { status: 500 },
    );
  }
}
