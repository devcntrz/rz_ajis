import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Puppeteer/Chromium resolve their browser binary via __dirname/import.meta.url
  // at runtime — letting webpack bundle them mangles those paths and breaks
  // `spawn` (surfaces as a cryptic "Unknown system error -8"). Keep them external.
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
