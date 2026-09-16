'use client';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** In-app replacement for `window.confirm` — styled, not a native browser dialog. */
export function ConfirmDialog({
  title = 'Konfirmasi', message, confirmLabel = 'Lanjutkan', cancelLabel = 'Batal',
  danger, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: 13.5, color: '#1A0A00', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onCancel}>{cancelLabel}</Btn>
          <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}
