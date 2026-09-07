'use client';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';

interface Props {
  message: string;
  onRetry: () => void;
}

/** Shown instead of an eternal loading skeleton when a fetch actually failed/timed out. */
export function ErrorRetry({ message, onRetry }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '32px 20px', textAlign: 'center', background: '#FDEAEA',
      border: '1.5px solid #B0202040', borderRadius: 14, color: '#B02020',
    }}>
      <AlertTriangle size={22} />
      <p style={{ fontSize: 13, maxWidth: 480, margin: 0 }}>{message}</p>
      <Btn variant="danger" size="sm" onClick={onRetry}>
        <RotateCw size={13} /> Coba Lagi
      </Btn>
    </div>
  );
}
