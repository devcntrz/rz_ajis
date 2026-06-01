/**
 * POST /api/anakjuara/penilaian/sync
 * Syncs evaluation records for a child or all children in wilayah for a given semester.
 * Calculates scores from ajis_pembinaan_baru and ajis_hafalan,
 * and saves into ajis_penilaian.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';
import { scoreToNilai } from '@/lib/utils';
import { ASPEK_CERDAS_ITEMS, ASPEK_MANDIRI_ITEMS } from '@/types/penilaian';

async function syncChild(idAnak: string, semesterId: string, username: string) {
  // Get child info
  const child = await queryOne<{
    id_anak: string; nama_lengkap: string; kantor_id: string;
    nama_kantor: string; nama_wilayah: string; id_wilayah_pembinaan: number;
  }>(
    `SELECT id_anak, nama_lengkap, kantor_id, nama_kantor, nama_wilayah, id_wilayah_pembinaan
     FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
    [idAnak],
  );
  if (!child) return;

  // 1. Calculate Attendance & Mandiri Aspects from ajis_pembinaan_baru
  const pbStats = await queryOne<{
    total_sesi: number;
    hadir: number;
    shalat: number;
    tilawah: number;
    sedekah: number;
    bantu_ortu: number;
  }>(
    `SELECT COUNT(*) AS total_sesi,
            SUM(CASE WHEN kehadiran = 'y' THEN 1 ELSE 0 END) AS hadir,
            SUM(CASE WHEN kehadiran = 'y' AND pembiasaan_shalat_wajib = 1 THEN 1 ELSE 0 END) AS shalat,
            SUM(CASE WHEN kehadiran = 'y' AND pembiasaan_tilawah = 1 THEN 1 ELSE 0 END) AS tilawah,
            SUM(CASE WHEN kehadiran = 'y' AND pembiasaan_sedekah = 1 THEN 1 ELSE 0 END) AS sedekah,
            SUM(CASE WHEN kehadiran = 'y' AND membantu_ortu = 1 THEN 1 ELSE 0 END) AS bantu_ortu
     FROM ajis_pembinaan_baru
     WHERE id_anak = ? AND semesterid = ?`,
    [idAnak, semesterId],
  );

  const totalSesi = pbStats?.total_sesi ?? 0;
  const hadir = pbStats?.hadir ?? 0;

  const pctHadir = totalSesi > 0 ? Math.round((hadir / totalSesi) * 100) : 0;
  const pctShalat = hadir > 0 ? Math.round(((pbStats?.shalat ?? 0) / hadir) * 100) : 0;
  const pctTilawah = hadir > 0 ? Math.round(((pbStats?.tilawah ?? 0) / hadir) * 100) : 0;
  const pctSedekah = hadir > 0 ? Math.round(((pbStats?.sedekah ?? 0) / hadir) * 100) : 0;
  const pctBantu = hadir > 0 ? Math.round(((pbStats?.bantu_ortu ?? 0) / hadir) * 100) : 0;

  // 2. Calculate Hafalan Aspect counts from ajis_hafalan
  const hafalanStats = await query<{ jenis: string; cnt: number }>(
    `SELECT jenis, COUNT(*) AS cnt
     FROM ajis_hafalan
     WHERE id_anak = ? AND semesterid = ?
     GROUP BY jenis`,
    [idAnak, semesterId],
  );

  const hMap: Record<string, number> = {};
  hafalanStats.forEach(h => { hMap[h.jenis] = h.cnt; });

  // Map aspects to values
  const mandiriScores: Record<string, number> = {
    'Kehadiran Pembinaan':    pctHadir,
    'Pembiasaan Shalat Wajib': pctShalat,
    'Pembiasaan Tilawah':     pctTilawah,
    'Pembiasaan Sedekah':     pctSedekah,
    'Membantu Orangtua':      pctBantu,
  };

  const cerdasCounts: Record<string, number> = {
    'Hafalan Alquran':       hMap['2'] ?? 0,
    'Hafalan Bacaan Shalat': hMap['3'] ?? 0,
    'Hafalan Doa Pilihan':   hMap['4'] ?? 0,
  };

  // 3. Upsert into ajis_penilaian
  // We'll write the 5 mandiri aspects
  for (const item of ASPEK_MANDIRI_ITEMS) {
    const score = mandiriScores[item.aspek] ?? 0;
    const grade = scoreToNilai(score);
    await query(
      `REPLACE INTO ajis_penilaian
         (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
          id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
          kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
          keterangan, via_input, id_item_penilaian)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idAnak, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
        child.id_wilayah_pembinaan, semesterId, item.aspek, '100%',
        `${score}%`, score, '', score, grade,
        '', 'system', item.id,
      ],
    );
  }

  // We'll write the 4 cerdas aspects (Kemampuan Membaca Alquran is manual/baseline, we initialize it)
  for (const item of ASPEK_CERDAS_ITEMS) {
    const count = cerdasCounts[item.aspek] ?? 0;
    // For cerdas, we can set target and baseline text. If already exists, we preserve it, or insert fresh.
    const existing = await queryOne<{ target: string; kondisi_awal: string; hasil_akhir: string; nilai_capaian: number }>(
      `SELECT target, kondisi_awal, hasil_akhir, nilai_capaian
       FROM ajis_penilaian
       WHERE id_anak = ? AND semesterid = ? AND aspek = ? LIMIT 1`,
      [idAnak, semesterId, item.aspek],
    );

    const target = existing?.target || item.target;
    const kondisiAwal = existing?.kondisi_awal || (count > 0 ? `${count} Item` : 'Belum Mulai');
    const nilaiCapaian = existing?.nilai_capaian ?? (count > 0 ? 75 : 0);
    const grade = existing?.hasil_akhir || scoreToNilai(nilaiCapaian);

    await query(
      `REPLACE INTO ajis_penilaian
         (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
          id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
          kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
          keterangan, via_input, id_item_penilaian)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idAnak, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
        child.id_wilayah_pembinaan, semesterId, item.aspek, target,
        kondisiAwal, nilaiCapaian, '', nilaiCapaian, grade,
        '', 'system', item.id,
      ],
    );
  }

  // 4. Ensure Catatan and Suara Anak rows exist
  const extraAspeks = ['Catatan Pembinaan', 'Suara Anak Juara'];
  for (const aspek of extraAspeks) {
    const existing = await queryOne<{ target: string }>(
      `SELECT target FROM ajis_penilaian
       WHERE id_anak = ? AND semesterid = ? AND aspek = ? LIMIT 1`,
      [idAnak, semesterId, aspek],
    );
    if (!existing) {
      await query(
        `INSERT IGNORE INTO ajis_penilaian
           (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
            id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
            kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
            keterangan, via_input, id_item_penilaian)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, '', '', 0, '', 0, '', '', 'system', 0)`,
        [
          idAnak, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
          child.id_wilayah_pembinaan, semesterId, aspek,
        ],
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id_anak, semesterid } = await req.json() as { id_anak: string; semesterid: string };
    if (!semesterid) return NextResponse.json({ error: 'Semester wajib diisi.' }, { status: 400 });

    if (id_anak && id_anak !== 'all') {
      // Sync single child
      await syncChild(id_anak, semesterid, session.username);
      return NextResponse.json({ ok: true, message: 'Sinkronisasi berhasil.' });
    } else {
      // Mass sync for all children in user's scope
      const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');

      // Fetch children who do NOT have any evaluation for this semester
      const children = await query<{ id_anak: string }>(
        `SELECT a.id_anak FROM ajis_anak a
         LEFT JOIN ajis_penilaian p ON p.id_anak = a.id_anak AND p.semesterid = ?
         WHERE ${scope} AND a.aktif='y' AND p.id_anak IS NULL`,
        [semesterid, ...scopeParams],
      );

      for (const c of children) {
        await syncChild(c.id_anak, semesterid, session.username);
      }

      return NextResponse.json({
        ok: true,
        message: `Mass sinkronisasi selesai. Berhasil menyinkronkan ${children.length} anak.`,
      });
    }
  } catch (err) {
    console.error('[penilaian sync]', err);
    return NextResponse.json({ error: 'Gagal melakukan sinkronisasi.' }, { status: 500 });
  }
}
