/**
 * lib/transaksi/rz-partner-client.ts — client for the RZ partner API used by the
 * Transaksi sync tools (legacy "Get Transid" / "Get Transid by tgl" / "Get Donatur").
 *
 * Legacy hardcoded both the base URL and the auth token directly in
 * `get_transaksi_api.php` / `get_donatur_api.php`. Both now come from env vars
 * (`RZ_PARTNER_API_URL`, `RZ_PARTNER_TRANSAKSI_TOKEN`, `RZ_PARTNER_DONATUR_TOKEN`).
 *
 * "Get Transid by tgl" is not a separate integration here — legacy hit a second,
 * direct ZAINS database connection for it, but `transaksiZ` already accepts a date
 * range, so both legacy buttons collapse onto `fetchTransaksiZ`.
 */

import { RuleError } from '@/lib/transaksi/rules';
import type { TransidCandidate, DonaturCandidate } from '@/types/transaksi';

const TIMEOUT_MS = 30_000;

function baseUrl(): string {
  const url = process.env.RZ_PARTNER_API_URL;
  if (!url) throw new RuleError('RZ_PARTNER_API_URL belum dikonfigurasi.');
  return url.replace(/\/+$/, '');
}

interface RzTransaksiZItem {
  id_transaksi?: string;
  detailid?: string | number;
  'metode bayar'?: string;
  metode_bayar?: string;
  id_donatur?: string;
  donatur?: string;
  id_program?: string | number;
  program?: string;
  transaksi?: string | number;
  tgl_donasi?: string;
  tgl_transaksi?: string;
  kantor_transaksi?: string;
  kantor_donatur?: string;
  id_via_bayar?: string | number;
  id_cara_bayar?: string | number;
  id_crm?: string;
  id_claim?: string;
  id_position_claim?: string;
  approved_transaksi?: string;
  atas_nama_qurban?: string;
  keterangan?: string;
  quantity?: string | number;
  id_kantor_transaksi?: string;
  id_kantor_donatur?: string;
  oid_transaksi?: string;
  oid_donatur?: string;
}

/** Legacy's `jenis_transaksi` enum; the API's payment-method text doesn't always match. */
const JENIS_TRANSAKSI = new Set(['cash', 'noncash', 'bank', 'pccash', 'pcnoncash']);
function normalizeJenisTransaksi(raw: string): string {
  const v = raw.trim().toLowerCase();
  return JENIS_TRANSAKSI.has(v) ? v : 'bank';
}

export interface FetchTransaksiZParams {
  page?: number;
  startDate?: string;
  endDate?: string;
  idTransaksi?: string;
}

/** GET /partner/transaksiZ — mirrors the field mapping in get_transaksi_api.php:80-125. */
export async function fetchTransaksiZ(
  params: FetchTransaksiZParams,
): Promise<{ data: TransidCandidate[]; total: number }> {
  const token = process.env.RZ_PARTNER_TRANSAKSI_TOKEN;
  if (!token) throw new RuleError('RZ_PARTNER_TRANSAKSI_TOKEN belum dikonfigurasi.');

  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 1));
  qs.set('startDate', params.startDate || '2021-01-01');
  qs.set('endDate', params.endDate || new Date().toISOString().slice(0, 10));
  if (params.idTransaksi) qs.set('id_transaksi', params.idTransaksi);

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/partner/transaksiZ?${qs.toString()}`, {
      method:  'GET',
      headers: { token },
      signal:  AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new RuleError('Gagal menghubungi API RZ Partner (transaksiZ).');
  }

  if (!res.ok) {
    throw new RuleError(`API RZ Partner mengembalikan status ${res.status}.`);
  }

  const json = await res.json();
  const rows: RzTransaksiZItem[] = Array.isArray(json) ? json : (json.rows ?? []);

  const data: TransidCandidate[] = rows.map(item => {
    // Legacy stripped a time component off tgl_transaksi before using it for both
    // tgl_transaksi and date_generate; the API can return either a bare date or a
    // full datetime.
    const tglTransaksi = (item.tgl_transaksi ?? '').split(' ')[0] ?? '';

    return {
      transid:            String(item.id_transaksi ?? ''),
      detailid:           Number(item.detailid ?? 1) || 1,
      jenis_transaksi:    normalizeJenisTransaksi(item['metode bayar'] ?? item.metode_bayar ?? ''),
      did:                String(item.id_donatur ?? ''),
      nama_donatur:       item.donatur ?? '',
      id_program:         Number(item.id_program ?? 0),
      nama_program:       item.program ?? '',
      perkiraan_rp:       Number(item.transaksi ?? 0),
      tgl_donasi:         item.tgl_donasi ?? tglTransaksi,
      tgl_transaksi:      tglTransaksi,
      // The live API doesn't actually send oid_transaksi/oid_donatur (only get_transaksi_api.php's
      // field list assumed it would); id_kantor_transaksi/id_kantor_donatur and the kantor names
      // are what it really returns, so the oid is resolved against the local `kantor` table at
      // commit time (see resolveKantorOid in lib/transaksi/sync.ts).
      oid_transaksi:      item.oid_transaksi ?? '',
      oid_donatur:        item.oid_donatur ?? '',
      id_kantor_transaksi: String(item.id_kantor_transaksi ?? ''),
      id_kantor_donatur:   String(item.id_kantor_donatur ?? ''),
      kantor_transaksi:   item.kantor_transaksi ?? '',
      kantor_donatur:     item.kantor_donatur ?? '',
      vbayarid:           String(item.id_via_bayar ?? ''),
      mbayarid:           String(item.id_cara_bayar ?? ''),
      nik_rfo:            item.id_crm ?? '',
      nik_claim:          item.id_claim ?? '',
      approved_claim:     item.approved_transaksi ?? '',
      approved_trans:     item.approved_transaksi ?? '',
      atas_nama:          item.atas_nama_qurban ?? '',
      keterangan:         item.keterangan ?? '',
      jml_mustahik:       String(item.quantity ?? ''),
    };
  });

  return { data, total: Array.isArray(json) ? json.length : Number(json.total ?? data.length) };
}

interface RzDonaturItem {
  id_donatur?: string;
  donatur?: string;
  panggilan?: string;
  tgl_lahir?: string;
  alamat?: string;
  id_jenis?: string | number;
  status?: string;
  tgl_reg?: string;
  aktif?: string;
  telpon?: string;
  hp?: string;
  email?: string;
  verified?: string;
  jk?: string;
  id_crm?: string;
  nama_funding?: string;
  updated?: string;
  npwp?: string;
}

export interface FetchDonaturParams {
  idDonatur?: string;
}

/** POST /partner/internal/donatur — mirrors the field mapping in get_donatur_api.php. */
export async function fetchDonatur(
  params: FetchDonaturParams,
): Promise<{ data: DonaturCandidate[]; total: number }> {
  const token = process.env.RZ_PARTNER_DONATUR_TOKEN;
  if (!token) throw new RuleError('RZ_PARTNER_DONATUR_TOKEN belum dikonfigurasi.');

  const body = new URLSearchParams();
  body.set('token', token);
  if (params.idDonatur) body.set('id_donatur', params.idDonatur);

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/partner/internal/donatur`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
      signal:  AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new RuleError('Gagal menghubungi API RZ Partner (donatur).');
  }

  if (!res.ok) {
    throw new RuleError(`API RZ Partner mengembalikan status ${res.status}.`);
  }

  const json = await res.json();
  const rows: RzDonaturItem[] = Array.isArray(json) ? json : (json.rows ?? []);

  const data: DonaturCandidate[] = rows.map(item => ({
    did:                 String(item.id_donatur ?? ''),
    nama_lengkap:        item.donatur ?? '',
    nama_publikasi:      item.panggilan || item.donatur || '',
    tgl_lahir:           item.tgl_lahir ?? '',
    alamat_lengkap:      item.alamat ?? '',
    alamat_silaturahmi:  item.alamat ?? '',
    jcustid:             String(item.id_jenis ?? ''),
    status:              item.status ?? '',
    tgl_registrasi:      item.tgl_reg ?? '',
    aktif:               item.aktif ?? '',
    telp:                item.telpon ?? '',
    hp:                  item.hp ?? '',
    email:               item.email ?? '',
    verifikasi1:         item.verified ?? '',
    jenis_kelamin:       item.jk ?? '',
    nia_rfo:             item.id_crm ?? '',
    nama_rfo:            item.nama_funding ?? '',
    tgl_update:          item.updated ?? '',
    npwp:                item.npwp ?? '',
  }));

  return { data, total: Array.isArray(json) ? json.length : Number(json.total ?? data.length) };
}
