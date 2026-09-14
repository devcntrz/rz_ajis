import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Puppeteer/Chromium resolve their browser binary via __dirname/import.meta.url
  // at runtime — letting webpack bundle them mangles those paths and breaks
  // `spawn` (surfaces as a cryptic "Unknown system error -8"). Keep them external.
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],

  // @sparticuz/chromium ships a brotli-compressed binary in its `bin/` folder.
  // Next.js's file tracer follows only JS imports and misses binary assets, so
  // the `bin/` directory is absent from the Vercel lambda bundle at runtime
  // ("does not exist" error). Force-include it for every route that renders PDFs.
  // NOTE: in Next.js 16+, outputFileTracingIncludes is top-level (not experimental).
  outputFileTracingIncludes: {
    // Laporan Semester PDF routes
    "app/api/anakjuara/laporan-semester/[laporanid]/preview/route.ts": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    "app/api/anakjuara/laporan-semester/[laporanid]/approve/route.ts": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    // Calon Anak Juara PDF routes
    "app/api/anakjuara/calon-anak-juara/[id]/pdf-surat/route.ts": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    "app/api/anakjuara/calon-anak-juara/[id]/pdf-cv/route.ts": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
