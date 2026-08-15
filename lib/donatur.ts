/**
 * lib/donatur.ts — donor snapshot used when creating an Ajuan Ganti Anak.
 *
 * The `donatur` table has no `jenis_donatur` column; the legacy app derives it
 * inside the view `ajis_view_profile` from `jcustid`. Both the read-only display
 * endpoint and the POST handler go through here so they can never disagree.
 */
import { queryOne } from '@/lib/db';

export interface DonaturSnapshot {
  oid_donatur:    string;
  kantor_donatur: string;
  hp:             string;
  jenis_kelamin:  string;
  jcustid:        number;
  jenis_donatur:  string;
}

const EMPTY: DonaturSnapshot = {
  oid_donatur:    '',
  kantor_donatur: '',
  hp:             '',
  jenis_kelamin:  '',
  jcustid:        0,
  jenis_donatur:  '',
};

/** Mirrors the CASE on `jcustid` in the legacy view `ajis_view_profile`. */
export function jenisDonaturFromJcustid(jcustid: number | string | null | undefined): string {
  switch (String(jcustid ?? '')) {
    case '1': return 'Retail';
    case '2': return 'Corporate';
    case '3': return 'Community';
    default:  return 'unknown';
  }
}

/**
 * Donor details that live only in `donatur`, not in `ajis_pemasangan`.
 * Returns blanks when the donor row is missing so creating an ajuan never fails
 * just because the donor master is out of sync.
 */
export async function getDonaturSnapshot(idDonatur: string): Promise<DonaturSnapshot> {
  if (!idDonatur) return { ...EMPTY };

  const row = await queryOne<{
    oid_donatur:    string | null;
    kantor_donatur: string | null;
    hp:             string | null;
    telp:           string | null;
    jenis_kelamin:  string | null;
    jcustid:        number | null;
  }>(
    `SELECT oid_donatur, kantor_donatur, hp, telp, jenis_kelamin, jcustid
     FROM donatur
     WHERE did = ?
     LIMIT 1`,
    [idDonatur],
  );

  if (!row) return { ...EMPTY };

  return {
    oid_donatur:    row.oid_donatur ?? '',
    kantor_donatur: row.kantor_donatur ?? '',
    // Legacy forms show whichever number exists; hp is the primary.
    hp:             row.hp || row.telp || '',
    jenis_kelamin:  row.jenis_kelamin ?? '',
    jcustid:        Number(row.jcustid ?? 0),
    jenis_donatur:  jenisDonaturFromJcustid(row.jcustid),
  };
}
