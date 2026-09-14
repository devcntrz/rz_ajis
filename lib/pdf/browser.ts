/**
 * lib/pdf/browser.ts — launches a headless Chromium for server-side PDF rendering.
 *
 * On Vercel serverless, `@sparticuz/chromium` ships a Linux binary compatible with
 * the lambda runtime and `puppeteer-core` drives it (no bundled Chromium download,
 * which would blow past the function size limit). Locally we use full `puppeteer`
 * instead, which manages its own bundled, architecture-matched browser.
 *
 * Detecting "am I on Vercel" via `process.env.VERCEL` does NOT work here: per
 * CLAUDE.md, `.env.local` is a `vercel env pull` of production, so VERCEL/VERCEL_ENV
 * are set to production values even under local `next dev`/`next start`. Using that
 * branch locally tries to exec the Linux-only sparticuz binary on macOS, which fails
 * as "spawn Unknown system error -8" (an exec-format error, not a real spawn bug).
 * The reliable signal is the OS itself: Vercel/Lambda functions always run Linux.
 */
import type { Browser } from 'puppeteer-core';

/** True when running on Vercel's/Lambda's actual Linux serverless runtime. */
function isServerless(): boolean {
  return process.platform === 'linux';
}

export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
      import('puppeteer-core'),
      import('@sparticuz/chromium'),
    ]);
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  return browser as unknown as Browser;
}

/** Renders an HTML string to a PDF buffer (A4, no extra margins — CSS controls layout). */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
