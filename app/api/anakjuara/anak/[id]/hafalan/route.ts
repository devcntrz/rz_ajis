/**
 * GET  /api/anakjuara/anak/[id]/hafalan — Get hafalan with completion status
 * PUT  /api/anakjuara/anak/[id]/hafalan — Toggle hafalan items
 *
 * Uses real ajis_hafalan table (not ajis_penilaian).
 * Checks: id_anak, konten_uji (= item konten), semesterid
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getHafalanItems } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const semester = req.nextUrl.searchParams.get('semester') || '25';

    // Get master items (cached)
    const masterItems = await getHafalanItems();

    // Get completed hafalan from ajis_hafalan table
    const completed = await query<{ konten_uji: string; jenis: string }>(
      `SELECT konten_uji, jenis FROM ajis_hafalan
       WHERE id_anak = ? AND semesterid = ?`,
      [id, semester],
    );

    const completedSet = new Set(completed.map(r => r.konten_uji));

    const items = masterItems.map(item => ({
      ...item,
      selesai: completedSet.has(item.konten),
    }));

    return NextResponse.json({ data: items });
  } catch (err) {
    console.error('[hafalan get]', err);
    return NextResponse.json({ error: 'Gagal memuat hafalan.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { semester, items } = await req.json() as {
      semester: string;
      items: Array<{ konten: string; jenis: number; selesai: boolean }>;
    };

    // Process each item: insert if selesai=true, delete if selesai=false
    for (const item of items) {
      if (item.selesai) {
        // Insert (ignore if exists) — using REPLACE or INSERT IGNORE
        await query(
          `INSERT IGNORE INTO ajis_hafalan (id_anak, jenis, konten_uji, tgl_pengujian, tgl_insert, keterangan, semesterid)
           VALUES (?, ?, ?, CURDATE(), NOW(), '', ?)`,
          [id, String(item.jenis), item.konten, semester],
        );
      } else {
        // Delete
        await query(
          `DELETE FROM ajis_hafalan WHERE id_anak = ? AND konten_uji = ? AND semesterid = ?`,
          [id, item.konten, semester],
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[hafalan put]', err);
    return NextResponse.json({ error: 'Gagal menyimpan hafalan.' }, { status: 500 });
  }
}
