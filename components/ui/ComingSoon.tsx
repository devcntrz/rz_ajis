/**
 * components/ui/ComingSoon.tsx — placeholder for a production menu whose page has
 * not been built yet.
 *
 * It reads its own metadata from navConfig, so the PRD phase, endpoint and main
 * table are stated once and stay correct as the config changes. That makes the
 * placeholder useful rather than decorative: whoever opens the menu learns which
 * phase it belongs to and what it will be built on.
 */
import { Construction } from 'lucide-react';
import { findItem } from '@/components/layout/navConfig';

const T = {
  primary: '#BF4E02', primaryPale: '#FBF0E8', primarySoft: '#F0C4A0',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3', white: '#FFFFFF',
  blue: '#1A5FA8', bluePale: '#E5EEF8',
  gold: '#B87800', goldPale: '#FDF4DC',
  green: '#1A7A45', greenPale: '#E5F5ED',
};

const PHASE_STYLE: Record<number, { label: string; bg: string; fg: string }> = {
  1: { label: 'Fase 1 · Profiling', bg: T.bluePale, fg: T.blue },
  2: { label: 'Fase 2 · Keuangan', bg: T.goldPale, fg: T.gold },
  3: { label: 'Fase 3 · Laporan', bg: T.greenPale, fg: T.green },
};

export function ComingSoon({ href }: { href: string }) {
  const item = findItem(href);
  const phase = item?.phase ? PHASE_STYLE[item.phase] : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{
        maxWidth: 480, width: '100%', textAlign: 'center',
        background: T.white, border: `1px solid ${T.grayLt}`,
        borderRadius: 16, padding: '32px 24px',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: T.primaryPale, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Construction size={26} color={T.primary} strokeWidth={2} />
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: T.charcoal, margin: 0 }}>
          {item?.label ?? 'Halaman'}
        </h1>

        <p style={{ fontSize: 14, color: T.gray, margin: '8px 0 0', lineHeight: 1.55 }}>
          Halaman ini belum tersedia. Menu sudah disiapkan, tabel Postgres-nya sudah
          ter-migrate — implementasinya menyusul.
        </p>

        {phase && (
          <div style={{
            display: 'inline-block', marginTop: 16,
            padding: '5px 12px', borderRadius: 999,
            background: phase.bg, color: phase.fg,
            fontSize: 12, fontWeight: 700,
          }}>
            {phase.label}
          </div>
        )}

        {(item?.endpoint || item?.table) && (
          <dl style={{
            marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.grayLt}`,
            textAlign: 'left', display: 'grid', gap: 10, fontSize: 12.5,
          }}>
            {item.endpoint && (
              <div>
                <dt style={{ color: T.gray, fontWeight: 600, marginBottom: 2 }}>Endpoint</dt>
                <dd style={{ margin: 0, color: T.charcoal, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {item.endpoint}
                </dd>
              </div>
            )}
            {item.table && (
              <div>
                <dt style={{ color: T.gray, fontWeight: 600, marginBottom: 2 }}>Tabel utama</dt>
                <dd style={{ margin: 0, color: T.charcoal, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {item.table}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
