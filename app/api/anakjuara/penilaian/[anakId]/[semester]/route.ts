/**
 * GET, PUT, DELETE /api/anakjuara/penilaian/[anakId]/[semester]
 * Detail evaluation management for a single child.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { scoreToNilai } from '@/lib/utils';

type Params = { params: Promise<{ anakId: string; semester: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { anakId, semester } = await params;

    // Get child details
    const child = await queryOne<{ id_anak: string; nama_lengkap: string; nama_wilayah: string; nama_kantor: string }>(
      `SELECT id_anak, nama_lengkap, nama_wilayah, nama_kantor FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
      [anakId],
    );
    if (!child) return NextResponse.json({ error: 'Anak tidak ditemukan.' }, { status: 404 });

    // Fetch all evaluation rows for this child and semester
    const rows = await query<{
      aspek: string; target: string; kondisi_awal: string;
      nilai_capaian: number; perkembangan_capaian: string;
      skor: number; hasil_akhir: string; keterangan: string; id_item_penilaian: number;
    }>(
      `SELECT aspek, target, kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir, keterangan, id_item_penilaian
       FROM ajis_penilaian
       WHERE id_anak = ? AND semesterid = ?`,
      [anakId, semester],
    );

    if (!rows.length) {
      return NextResponse.json({
        data: {
          id_anak:      anakId,
          nama_anak:    child.nama_lengkap,
          nama_wilayah: child.nama_wilayah,
          nama_kantor:  child.nama_kantor,
          semesterid:   semester,
          has_data:     false,
          aspek_cerdas: [],
          aspek_mandiri:[],
          catatan:      '',
          suara_anak:   '',
        },
      });
    }

    const cerdas: unknown[] = [];
    const mandiri: unknown[] = [];
    let catatan = '';
    let suaraAnak = '';

    rows.forEach(r => {
      if (r.aspek === 'Catatan Pembinaan') {
        catatan = r.target || r.keterangan || '';
      } else if (r.aspek === 'Suara Anak Juara') {
        suaraAnak = r.target || r.keterangan || '';
      } else if (['Kemampuan Membaca Alquran', 'Hafalan Alquran', 'Hafalan Bacaan Shalat', 'Hafalan Doa Pilihan'].includes(r.aspek)) {
        cerdas.push(r);
      } else {
        mandiri.push(r);
      }
    });

    return NextResponse.json({
      data: {
        id_anak:      anakId,
        nama_anak:    child.nama_lengkap,
        nama_wilayah: child.nama_wilayah,
        nama_kantor:  child.nama_kantor,
        semesterid:   semester,
        has_data:     true,
        aspek_cerdas: cerdas,
        aspek_mandiri:mandiri,
        catatan,
        suara_anak:   suaraAnak,
      },
    });
  } catch (err) {
    console.error('[penilaian get detail]', err);
    return NextResponse.json({ error: 'Gagal memuat detail penilaian.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { anakId, semester } = await params;
    const body = await req.json() as {
      aspek_cerdas: Array<{ aspek: string; target: string; kondisi_awal: string; perkembangan_capaian: string; nilai_capaian: number; hasil_akhir: string; id_item_penilaian: number }>;
      aspek_mandiri: Array<{ aspek: string; target: string; kondisi_awal: string; perkembangan_capaian: string; nilai_capaian: number; hasil_akhir: string; id_item_penilaian: number }>;
      catatan: string;
      suara_anak: string;
    };

    // Get child details
    const child = await queryOne<{ nama_lengkap: string; nama_wilayah: string; nama_kantor: string; kantor_id: string; id_wilayah_pembinaan: string }>(
      `SELECT nama_lengkap, nama_wilayah, nama_kantor, kantor_id, id_wilayah_pembinaan FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
      [anakId],
    );
    if (!child) return NextResponse.json({ error: 'Anak tidak ditemukan.' }, { status: 404 });

    // Helper for upserting aspects
    const upsertAspect = async (
      aspek: string, target: string, kondisiAwal: string,
      nilaiCapaian: number, perkembangan: string, grade: string, idItem: number,
    ) => {
      await query(
        `REPLACE INTO ajis_penilaian
           (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
            id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
            kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
            keterangan, via_input, id_item_penilaian)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          anakId, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
          child.id_wilayah_pembinaan, semester, aspek, target,
          kondisiAwal, nilaiCapaian, perkembangan, nilaiCapaian, grade,
          '', 'web', idItem,
        ],
      );
    };

    // Update cerdas
    for (const c of body.aspek_cerdas) {
      const grade = c.hasil_akhir || scoreToNilai(c.nilai_capaian);
      await upsertAspect(c.aspek, c.target, c.kondisi_awal, c.nilai_capaian, c.perkembangan_capaian, grade, c.id_item_penilaian);
    }

    // Update mandiri
    for (const m of body.aspek_mandiri) {
      const grade = m.hasil_akhir || scoreToNilai(m.nilai_capaian);
      await upsertAspect(m.aspek, m.target, m.kondisi_awal, m.nilai_capaian, m.perkembangan_capaian, grade, m.id_item_penilaian);
    }

    // Update Catatan
    await query(
      `REPLACE INTO ajis_penilaian
         (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
          id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
          kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
          keterangan, via_input, id_item_penilaian)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, 'Catatan Pembinaan', ?, '', 0, '', 0, '', ?, 'web', 0)`,
      [
        anakId, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
        child.id_wilayah_pembinaan, semester, body.catatan, body.catatan,
      ],
    );

    // Update Suara Anak
    await query(
      `REPLACE INTO ajis_penilaian
         (id_anak, nama_anak, nama_kantor, nama_wilayah, kantor_id,
          id_wilayah_pembinaan, tgl_insert, semesterid, aspek, target,
          kondisi_awal, nilai_capaian, perkembangan_capaian, skor, hasil_akhir,
          keterangan, via_input, id_item_penilaian)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, 'Suara Anak Juara', ?, '', 0, '', 0, '', ?, 'web', 0)`,
      [
        anakId, child.nama_lengkap, child.nama_kantor, child.nama_wilayah, child.kantor_id,
        child.id_wilayah_pembinaan, semester, body.suara_anak, body.suara_anak,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[penilaian put]', err);
    return NextResponse.json({ error: 'Gagal menyimpan penilaian.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { anakId, semester } = await params;

    await query(
      `DELETE FROM ajis_penilaian WHERE id_anak = ? AND semesterid = ?`,
      [anakId, semester],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[penilaian delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus penilaian.' }, { status: 500 });
  }
}
