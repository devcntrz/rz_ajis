/**
 * GET /api/health/pg — proves the Next runtime (not just the CLI scripts) can
 * reach Neon through lib/pg.ts.
 */
import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/pg';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Health {
  database: string;
  server_version: string;
  migrations: string;
  latest_migration: string | null;
}

export async function GET() {
  // middleware.ts does not cover /api, so the check belongs here. The response
  // names the database and server version — not something to hand to anyone.
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const row = await queryOne<Health>(`
      SELECT
        current_database() AS database,
        current_setting('server_version') AS server_version,
        (SELECT count(*) FROM ajis_migrations)::text AS migrations,
        (SELECT tag FROM ajis_migrations ORDER BY id DESC LIMIT 1) AS latest_migration
    `);
    return NextResponse.json({ ok: true, ...row });
  } catch (err) {
    console.error('[health/pg]', err);
    return NextResponse.json(
      { error: (err as Error).message, code: 'PG_UNREACHABLE' },
      { status: 503 },
    );
  }
}
