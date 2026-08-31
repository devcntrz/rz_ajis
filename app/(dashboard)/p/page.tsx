/**
 * Landing page for the production (Neon Postgres) menu group.
 *
 * Reports what actually exists in the database rather than asserting readiness:
 * the migration ledger and the live table count are read on each request, so this
 * page is a genuine check that the runtime can reach Neon — not just that the
 * scripts could.
 */
import { query, queryOne } from '@/lib/pg';
import { NAV } from '@/components/layout/navConfig';

export const dynamic = 'force-dynamic';

const T = {
  primary: '#BF4E02', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3', white: '#FFFFFF',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', redPale: '#FDEAEA',
};

interface Counts {
  tables: string;
  matviews: string;
  migrations: string;
}

async function load() {
  try {
    const counts = await queryOne<Counts>(`
      SELECT
        (SELECT count(*) FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r')::text AS tables,
        (SELECT count(*) FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'm')::text AS matviews,
        (SELECT count(*) FROM ajis_migrations)::text AS migrations
    `);
    const latest = await query<{ tag: string; applied_at: Date }>(
      'SELECT tag, applied_at FROM ajis_migrations ORDER BY id DESC LIMIT 1',
    );
    return { counts, latest: latest[0] ?? null, error: null as string | null };
  } catch (err) {
    return { counts: null, latest: null, error: (err as Error).message };
  }
}

export default async function ProduksiBeranda() {
  const { counts, latest, error } = await load();
  const menus = NAV.produksi.items.filter((i) => i.phase);
  const byPhase = [1, 2, 3].map((p) => ({
    phase: p,
    count: menus.filter((m) => m.phase === p).length,
  }));

  return (
    <div style={{ padding: '24px 20px', maxWidth: 760 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: T.charcoal, margin: 0 }}>
        Produksi — Neon Postgres
      </h1>
      <p style={{ fontSize: 14, color: T.gray, margin: '6px 0 0', lineHeight: 1.55 }}>
        Skema hasil konversi PRD §6 sudah ter-migrate dan ter-seed. Halaman tiap menu
        menyusul per fase; sementara ini menu menampilkan kartu Coming Soon.
      </p>

      {error ? (
        <div style={{
          marginTop: 20, padding: '14px 16px', borderRadius: 12,
          background: T.redPale, color: T.red, fontSize: 13.5,
        }}>
          <strong>Koneksi Postgres gagal.</strong>
          <div style={{ marginTop: 4, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12 }}>
            {error}
          </div>
        </div>
      ) : (
        <>
          <div style={{
            marginTop: 20, display: 'grid', gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          }}>
            <Stat label="Tabel" value={counts?.tables ?? '—'} />
            <Stat label="Materialized view" value={counts?.matviews ?? '—'} />
            <Stat label="Migrasi diterapkan" value={counts?.migrations ?? '—'} />
          </div>

          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 10,
            background: T.greenPale, color: T.green, fontSize: 12.5, fontWeight: 600,
          }}>
            Migrasi terakhir: {latest?.tag ?? '—'}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 15, fontWeight: 800, color: T.charcoal, margin: '28px 0 10px' }}>
        22 menu per fase
      </h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {byPhase.map(({ phase, count }) => (
          <div key={phase} style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '10px 14px', border: `1px solid ${T.grayLt}`, borderRadius: 10,
            background: T.white, fontSize: 13.5, color: T.charcoal,
          }}>
            <span style={{ fontWeight: 700 }}>Fase {phase}</span>
            <span style={{ color: T.gray }}>
              {phase === 1 ? 'Profiling' : phase === 2 ? 'Keuangan' : 'Laporan'}
            </span>
            <span style={{ marginLeft: 'auto', color: T.gray }}>{count} menu</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '14px 16px', border: `1px solid ${T.grayLt}`,
      borderRadius: 12, background: T.white,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.primary, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: T.gray, marginTop: 3, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
