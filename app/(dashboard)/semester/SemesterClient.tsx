'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useSemesterAdmin } from '@/hooks/useSemesterAdmin';
import { SemesterTable } from '@/components/semester/SemesterTable';
import { SemesterForm } from '@/components/semester/SemesterForm';
import { SemesterTemplateUpload } from '@/components/semester/SemesterTemplateUpload';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import type { Semester } from '@/types/semester';

export function SemesterClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const { data, total, loading, mutate } = useSemesterAdmin({ page, limit });
  const [formRow, setFormRow] = useState<Semester | null | undefined>(undefined);
  const [templateRow, setTemplateRow] = useState<Semester | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleActivate = async (row: Semester) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/anakjuara/semester/${row.id}/onprogress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onprogress: 'y' }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal mengubah semester aktif.');
        return;
      }
      toast.success(`${row.semester} dijadikan semester aktif.`);
      mutate();
    } catch {
      toast.error('Gagal mengubah semester aktif.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: Semester) => {
    if (!confirm(`Hapus semester "${row.semester}"?`)) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/anakjuara/semester/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal menghapus semester.');
        return;
      }
      toast.success('Semester berhasil dihapus.');
      mutate();
    } catch {
      toast.error('Gagal menghapus semester.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Semester</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola periode semester dan template gambar PDF Lapsem.
          </p>
        </div>
        <Btn variant="primary" onClick={() => setFormRow(null)}>
          <Plus size={16} />
          Tambah Semester
        </Btn>
      </div>

      <div className="datagrid-desktop">
        <SemesterTable
          data={data}
          loading={loading}
          rowOffset={(page - 1) * limit}
          onEdit={setFormRow}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onTemplate={setTemplateRow}
          busyId={busyId}
        />
      </div>

      {total > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {formRow !== undefined && (
        <SemesterForm
          row={formRow}
          onClose={() => setFormRow(undefined)}
          onSuccess={() => {
            setFormRow(undefined);
            mutate();
          }}
        />
      )}

      {templateRow && (
        <SemesterTemplateUpload
          row={templateRow}
          onClose={() => setTemplateRow(null)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
