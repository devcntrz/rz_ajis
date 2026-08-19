/**
 * lib/transaksi/scope.ts — role scoping for the Transaksi module.
 *
 * `getKantorScope` in lib/auth.ts cannot serve this module: `transaksi` has no single
 * kantor column. It caches the set of IJIS offices a donor's children belong to as a
 * comma-separated string in `id_kantor_ijis`, so a branch user's rows are matched with
 * FIND_IN_SET rather than equality.
 *
 * Branch scoping also carries two extra predicates that are part of the permission, not
 * of the tab filter: a branch may only ever see rows that are both reviewed and approved
 * for salur. Legacy applied those inside the same `if (id_group_user == 2)` branch, and
 * separating them would silently widen what a branch can read.
 */

import type { SessionData } from '@/lib/auth';

export interface ScopeFragment {
  sql:    string;
  params: unknown[];
  /** True for a branch user — the UI must not offer a kantor picker that widens scope. */
  isBranch: boolean;
}

/**
 * FIND_IN_SET cannot use an index, so this predicate is deliberately placed last in the
 * WHERE: MySQL evaluates it as a residual filter after the date range and the
 * review/approve/cicilan equality predicates have already cut the row set down.
 */
export function getTransaksiScope(
  session: SessionData,
  alias = 'a',
): ScopeFragment {
  const p = alias ? `${alias}.` : '';

  if (session.idGroupUser === 1) {
    return { sql: '1=1', params: [], isBranch: false };
  }

  if (session.idGroupUser === 2) {
    // A branch with no kantor on its session must see nothing, not everything.
    if (!session.idKantor) {
      return { sql: '1=0', params: [], isBranch: true };
    }
    return {
      sql: `${p}review = 'y' AND ${p}approve_salur = 'y' AND FIND_IN_SET(?, ${p}id_kantor_ijis)`,
      params: [session.idKantor],
      isBranch: true,
    };
  }

  // Korwil and everyone else have no business in the cashflow module.
  return { sql: '1=0', params: [], isBranch: false };
}

/**
 * Scope for `ajis_input_donasi` rows (entry grid, single-row delete), which do carry a
 * real `kantor_id`. Used to stop a branch from touching another branch's split rows.
 */
export function getInputDonasiScope(
  session: SessionData,
  alias = 'a',
): ScopeFragment {
  const p = alias ? `${alias}.` : '';

  if (session.idGroupUser === 1) {
    return { sql: '1=1', params: [], isBranch: false };
  }
  if (session.idGroupUser === 2 && session.idKantor) {
    return { sql: `${p}kantor_id = ?`, params: [session.idKantor], isBranch: true };
  }
  return { sql: '1=0', params: [], isBranch: session.idGroupUser === 2 };
}
