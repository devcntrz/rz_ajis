/**
 * Gotham faces used by the legacy CAJ PDFs.
 * Bytes are inlined so Vercel lambdas do not depend on `public/` on disk.
 */
import { GOTHAM_BOLD_B64, GOTHAM_BOOK_B64 } from '@/lib/pdf/cajFontData';

let cachedCss: string | null = null;

export function cajGothamFaceCss(): string {
  if (cachedCss) return cachedCss;
  cachedCss = `
@font-face {
  font-family: 'GothamBook';
  font-weight: 400;
  font-style: normal;
  src: url('data:font/ttf;base64,${GOTHAM_BOOK_B64}') format('truetype');
}
@font-face {
  font-family: 'GothamBook';
  font-weight: 700;
  font-style: normal;
  src: url('data:font/ttf;base64,${GOTHAM_BOLD_B64}') format('truetype');
}
body, td, th {
  font-family: 'GothamBook', sans-serif;
  font-size: 0.9em;
  color: #393939;
}
`;
  return cachedCss;
}
