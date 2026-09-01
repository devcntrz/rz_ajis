/**
 * components/layout/navConfig.ts — the single source of navigation truth.
 *
 * Sidebar and MobileNav both read from here; previously each kept its own copy of
 * the item array, which is how the two drifted apart.
 *
 * Two groups, selected by the switcher at the top of the sidebar:
 *
 *   transisi — the pages that exist today, still reading MySQL through lib/db.ts.
 *              Untouched; they keep working exactly as before.
 *   produksi — the 22 menus of PRD §4, targeting Neon Postgres through lib/pg.ts.
 *              Pages land here phase by phase; until then each shows Coming Soon
 *              with its PRD phase, endpoint and main table.
 *
 * Route note: PRD §4 gives `/anak-juara` and `/pembinaan` to the production menus,
 * but those paths are occupied by transition pages. The production group therefore
 * lives under a `/p` prefix until the transition pages are retired, at which point
 * the prefix is dropped here and the directories move — one edit, one place.
 */
import {
  Album,
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  Coins,
  FileBarChart,
  FileText,
  GraduationCap,
  HandCoins,
  Handshake,
  Home,
  Images,
  Landmark,
  MapPin,
  Repeat,
  RefreshCw,
  Send,
  Trophy,
  Users,
  UserSearch,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type NavGroup = 'transisi' | 'produksi';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  /** Sidebar label. */
  label: string;
  /** Bottom-nav label — must stay short enough not to wrap. */
  labelShort: string;
  /** Sidebar section heading; items sharing one are grouped under it. */
  section?: string;
  /** PRD §4 metadata, rendered by the Coming Soon card. */
  phase?: 1 | 2 | 3;
  endpoint?: string;
  table?: string;
  /** Roles allowed to see the item. Absent means everyone. */
  groups?: number[];
  /** True once a real page exists; false renders Coming Soon. */
  ready?: boolean;
}

export interface NavGroupDef {
  title: string;
  blurb: string;
  items: NavItem[];
}

/** The `/p` prefix that keeps production routes clear of the transition pages. */
export const PROD_PREFIX = '/p';

const transisi: NavItem[] = [
  { href: '/', icon: Home, label: 'Beranda', labelShort: 'Beranda', ready: true },
  { href: '/anak', icon: Users, label: 'Pengajuan Beasiswa', labelShort: 'Anak', ready: true },
  { href: '/anak-juara', icon: GraduationCap, label: 'Anak Juara', labelShort: 'AJ', groups: [1, 2], ready: true },
  { href: '/ajuan-pergantian', icon: RefreshCw, label: 'Ajuan Pergantian', labelShort: 'Ajuan', groups: [1, 2], ready: true },
  { href: '/transaksi', icon: Wallet, label: 'Transaksi', labelShort: 'Transaksi', groups: [1, 2], ready: true },
  { href: '/pembinaan', icon: ClipboardList, label: 'Pembinaan', labelShort: 'Pembinaan', ready: true },
  { href: '/penilaian', icon: Award, label: 'Penilaian', labelShort: 'Penilaian', ready: true },
];

/** The 22 menus of PRD §4, in the document's own order. */
const produksi: NavItem[] = [
  { href: `${PROD_PREFIX}`, icon: Home, label: 'Beranda', labelShort: 'Beranda', section: 'Umum', ready: true },

  { href: `${PROD_PREFIX}/profiling/pengajuan`, icon: Users, label: 'Pengajuan Beasiswa', labelShort: 'Pengajuan', section: 'Profiling', phase: 1, endpoint: 'GET/POST /api/anak', table: 'ajis_anak' },
  { href: `${PROD_PREFIX}/profiling/survey`, icon: UserSearch, label: 'Data Hasil Survey', labelShort: 'Survey', section: 'Profiling', phase: 1, endpoint: 'GET/POST /api/survey', table: 'ajis_survey' },
  { href: `${PROD_PREFIX}/profiling/caj`, icon: GraduationCap, label: 'Calon Anak Juara', labelShort: 'CAJ', section: 'Profiling', phase: 1, endpoint: 'GET /api/anak?status=caj', table: 'ajis_anak' },
  { href: `${PROD_PREFIX}/profiling/peminjaman`, icon: Handshake, label: 'Peminjaman Data CAJ', labelShort: 'Pinjam', section: 'Profiling', phase: 1, endpoint: 'GET/POST /api/peminjaman', table: 'ajis_peminjaman_anak' },

  { href: `${PROD_PREFIX}/anak-juara`, icon: Trophy, label: 'Anak Juara', labelShort: 'AJ', section: 'Anak Juara', phase: 2, endpoint: 'GET /api/anak-juara', table: 'ajis_pemasangan + pivot keuangan' },
  { href: `${PROD_PREFIX}/anak-juara/ajuan`, icon: Repeat, label: 'List Ajuan Pergantian', labelShort: 'Ajuan', section: 'Anak Juara', phase: 1, endpoint: 'GET/POST /api/ajuan', table: 'ajis_view_ajuan' },

  { href: `${PROD_PREFIX}/master/wilayah`, icon: MapPin, label: 'Data Wilayah', labelShort: 'Wilayah', section: 'Master', phase: 1, endpoint: 'GET/POST /api/wilayah', table: 'ajis_wilayah_pembinaan' },
  { href: `${PROD_PREFIX}/master/sdm`, icon: Users, label: 'SDM Wilayah', labelShort: 'SDM', section: 'Master', phase: 1, endpoint: 'GET/POST /api/sdm', table: 'sdm_wilayah, sdm_penugasan' },
  { href: `${PROD_PREFIX}/master/wilayah-admin`, icon: Building2, label: 'Setting Propinsi/Kab/Kec/Kel', labelShort: 'Ref', section: 'Master', phase: 1, endpoint: 'GET/POST /api/ref/{level}', table: 'ref_propinsi … ref_desa' },
  { href: `${PROD_PREFIX}/master/semester`, icon: Album, label: 'Semester', labelShort: 'Semester', section: 'Master', phase: 3, endpoint: 'GET/POST /api/semester', table: 'ajis_semester' },

  { href: `${PROD_PREFIX}/pembinaan`, icon: ClipboardList, label: 'Pembinaan Anak Juara', labelShort: 'Pembinaan', section: 'Pembinaan', phase: 3, endpoint: 'GET/POST /api/pembinaan', table: 'ajis_pembinaan_baru' },

  { href: `${PROD_PREFIX}/keuangan/penyaluran`, icon: Send, label: 'Penyaluran', labelShort: 'Salur', section: 'Keuangan', phase: 2, endpoint: 'GET/POST /api/penyaluran', table: 'ajis_penyaluran' },
  { href: `${PROD_PREFIX}/keuangan/donasi`, icon: HandCoins, label: 'Input Donasi', labelShort: 'Donasi', section: 'Keuangan', phase: 2, endpoint: 'GET/POST /api/donasi', table: 'ajis_input_donasi' },
  { href: `${PROD_PREFIX}/keuangan/donatur`, icon: Users, label: 'Donatur', labelShort: 'Donatur', section: 'Keuangan', phase: 2, endpoint: 'GET /api/donatur', table: 'mv_donatur_agregat (tanpa tabel donatur)' },
  { href: `${PROD_PREFIX}/keuangan/zisco`, icon: Landmark, label: 'Zisco / Daftar Peminjam', labelShort: 'Zisco', section: 'Keuangan', phase: 2, endpoint: 'GET /api/zisco', table: 'mv_zisco_agregat (tanpa tabel tersendiri)' },
  { href: `${PROD_PREFIX}/keuangan/transaksi`, icon: Wallet, label: 'Transaksi', labelShort: 'Transaksi', section: 'Keuangan', phase: 2, endpoint: 'GET /api/transaksi', table: 'transaksi' },
  { href: `${PROD_PREFIX}/keuangan/rekap`, icon: Coins, label: 'Rekap Transaksi', labelShort: 'Rekap', section: 'Keuangan', phase: 2, endpoint: 'GET /api/transaksi/rekap', table: 'mv_rekap_transaksi_bulanan' },

  { href: `${PROD_PREFIX}/laporan/pembinaan`, icon: FileBarChart, label: 'Laporan Pembinaan', labelShort: 'Lap. Bina', section: 'Laporan', phase: 3, endpoint: 'GET /api/laporan/pembinaan', table: 'manual_laporan_pembinaan' },
  { href: `${PROD_PREFIX}/laporan/raport`, icon: FileText, label: 'Raport Pembinaan', labelShort: 'Raport', section: 'Laporan', phase: 3, endpoint: 'GET /api/laporan/raport', table: 'manual_laporan' },
  { href: `${PROD_PREFIX}/laporan/dokumentasi`, icon: Images, label: 'Dokumentasi', labelShort: 'Dokum.', section: 'Laporan', phase: 3, endpoint: 'GET/POST /api/dokumentasi', table: 'ajis_dokumentasi_pembinaan' },
  { href: `${PROD_PREFIX}/laporan/prestasi`, icon: Trophy, label: 'Prestasi', labelShort: 'Prestasi', section: 'Laporan', phase: 3, endpoint: 'GET/POST /api/prestasi', table: 'ajis_data_prestasi, manual_laporan_prestasi' },
  { href: `${PROD_PREFIX}/laporan/materi`, icon: BookOpen, label: 'Materi', labelShort: 'Materi', section: 'Laporan', phase: 3, endpoint: 'GET /api/materi', table: 'materi (read-only, arsip)' },
];

export const NAV: Record<NavGroup, NavGroupDef> = {
  transisi: {
    title: 'Transisi',
    blurb: 'Halaman berjalan — MySQL',
    items: transisi,
  },
  produksi: {
    title: 'Produksi',
    blurb: '22 menu PRD — Neon Postgres',
    items: produksi,
  },
};

export const GROUPS: NavGroup[] = ['transisi', 'produksi'];

/** Which group a path belongs to, so a deep link never lands in the wrong group. */
export function groupForPath(pathname: string): NavGroup {
  return pathname === PROD_PREFIX || pathname.startsWith(`${PROD_PREFIX}/`)
    ? 'produksi'
    : 'transisi';
}

export function visibleItems(group: NavGroup, idGroupUser: number): NavItem[] {
  return NAV[group].items.filter((i) => !i.groups || i.groups.includes(idGroupUser));
}

/**
 * The href to highlight: the LONGEST item whose path prefixes the current one.
 *
 * Longest-match matters because some menu items nest under others — on
 * `/p/anak-juara/ajuan` a plain prefix test would light up both "Anak Juara" and
 * "List Ajuan Pergantian". It also keeps the parent highlighted on detail routes
 * such as `/anak/123`, which a pure exact-match test would not.
 */
export function activeHref(items: NavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const { href } of items) {
    const hit =
      href === '/' || href === PROD_PREFIX
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);
    if (hit && (best === null || href.length > best.length)) best = href;
  }
  return best;
}

/** Lookup used by the Coming Soon pages so their metadata is never duplicated. */
export function findItem(href: string): NavItem | undefined {
  return [...produksi, ...transisi].find((i) => i.href === href);
}
