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
  //
  // IMPORTANT: keys here are matched against the *normalized app route*
  // (e.g. "/api/anakjuara/laporan-semester/[laporanid]/preview"), not the
  // source file path — Next strips the "app/" prefix and the trailing
  // "/route" segment before matching (see normalizeAppPath in
  // next/dist/build/collect-build-traces.js). A key like
  // "app/api/.../route.ts" never matches anything and silently does nothing.
  // Wildcards are used instead of literal "[param]" segments because the
  // matcher is picomatch with `contains: true`, which would otherwise parse
  // "[laporanid]" as a bracket character class rather than literal text.
  outputFileTracingIncludes: {
    // Laporan Semester PDF routes (preview + approve)
    "/api/anakjuara/laporan-semester/**": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    // Calon Anak Juara PDF routes (pdf-surat + pdf-cv)
    "/api/anakjuara/calon-anak-juara/**": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
