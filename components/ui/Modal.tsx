'use client';
import { X } from 'lucide-react';

interface ModalProps {
  title:    string;
  onClose:  () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ title, onClose, children, maxWidth = 680 }: ModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,10,0,.5)',
      zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth,
        maxHeight: '90vh', overflow: 'auto', border: '1.5px solid #F0C4A0',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #F2EAE3',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1A0A00' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#7A6055',
            display: 'flex', alignItems: 'center', padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
