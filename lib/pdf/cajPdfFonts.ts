/**
 * Embed the same Gotham faces the legacy mPDF CAJ PDFs use
 * (`lib/fonts/GothamBook.ttf` + `Gotham.ttf` as bold).
 */
import { readFileSync } from 'fs';
import { join } from 'path';

function dataUri(filename: string): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'fonts', filename));
  return `data:font/ttf;base64,${buf.toString('base64')}`;
}

let cachedCss: string | null = null;

export function cajGothamFaceCss(): string {
  if (cachedCss) return cachedCss;
  const book = dataUri('GothamBook.ttf');
  const bold = dataUri('Gotham.ttf');
  cachedCss = `
@font-face {
  font-family: 'GothamBook';
  font-weight: 400;
  font-style: normal;
  src: url('${book}') format('truetype');
}
@font-face {
  font-family: 'GothamBook';
  font-weight: 700;
  font-style: normal;
  src: url('${bold}') format('truetype');
}
body, td, th {
  font-family: 'GothamBook', sans-serif;
  font-size: 0.9em;
  color: #393939;
}
`;
  return cachedCss;
}
