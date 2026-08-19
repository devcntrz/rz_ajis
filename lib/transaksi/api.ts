/**
 * lib/transaksi/api.ts — shared route plumbing for the Transaksi module.
 *
 * The auth preamble and error mapping are identical across all ten route handlers, so
 * they live here rather than being copy-pasted; a guard that is written once cannot be
 * accidentally omitted from one endpoint.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSession, requireGroup12, type SessionData } from '@/lib/auth';
import { RuleError } from '@/lib/transaksi/rules';
import { firstIssue } from '@/lib/transaksi/schema';

export type Guarded =
  | { ok: true; session: SessionData }
  | { ok: false; response: NextResponse };

/** Transaksi is a group 1 (admin) / group 2 (SpMD cabang) module, as in legacy. */
export async function guard(): Promise<Guarded> {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  try {
    requireGroup12(session);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 }),
    };
  }

  return { ok: true, session: session as SessionData };
}

/** Only group 1 may permanently destroy rows (legacy: admin page only). */
export function requireAdmin(session: SessionData): NextResponse | null {
  if (session.idGroupUser !== 1) {
    return NextResponse.json(
      { error: 'Hanya Super Admin yang dapat menghapus transaksi permanen.', code: 'FORBIDDEN' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Maps thrown errors onto responses. Rule violations and validation failures are the
 * user's to fix and carry their message through as a 400; anything else is ours and is
 * logged with a generic 500 so internals never reach the browser.
 */
export function toErrorResponse(context: string, err: unknown): NextResponse {
  if (err instanceof RuleError) {
    return NextResponse.json({ error: err.message, code: 'RULE' }, { status: 400 });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ error: firstIssue(err), code: 'VALIDATION' }, { status: 400 });
  }
  console.error(`[transaksi ${context}]`, err);
  return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
}

/** `detailid` is part of the primary key and always an integer in the route path. */
export function parseDetailId(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new RuleError('detailid tidak valid.');
  }
  return n;
}
