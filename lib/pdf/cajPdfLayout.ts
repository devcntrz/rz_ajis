import { cajGothamFaceCss } from '@/lib/pdf/cajPdfFonts';

/** A4 at 96dpi — same canvas Chromium uses for page.pdf({ format: 'A4' }). */
export const CAJ_PAGE_W = 794;
export const CAJ_PAGE_H = 1123;

const CAPTION_TOP = 228;
const CAPTION_LEFT = 618;
const CAPTION_W = 100;
const CAPTION_GAP = 6;
/** Larger photo, right edge locked to caption right (718). Caption stays put. */
const FOTO_W = 130;
const FOTO_H = 162;
const FOTO_LEFT = CAPTION_LEFT + CAPTION_W - FOTO_W - 35;
const FOTO_TOP = CAPTION_TOP - CAPTION_GAP - FOTO_H;
const BODY_LEFT = 112;
const BODY_RIGHT = 112;
/** Inset from both page edges so copy clears the decorative side icons. */
const BODY_W = CAJ_PAGE_W - BODY_LEFT - BODY_RIGHT;

/**
 * Body sits in the white field under the title.
 * Photo + caption share one box so the caption cannot spill onto the title art.
 */
export function cajPageCss(backgroundUrl: string): string {
  return `
${cajGothamFaceCss()}
@page { size: A4; margin: 0; }
html, body {
  margin: 0;
  padding: 0;
  width: ${CAJ_PAGE_W}px;
  height: ${CAJ_PAGE_H}px;
}
.page {
  position: relative;
  width: ${CAJ_PAGE_W}px;
  height: ${CAJ_PAGE_H}px;
  overflow: hidden;
  background-color: #fff;
  background-image: url('${backgroundUrl}');
  background-repeat: no-repeat;
  background-position: top left;
  background-size: ${CAJ_PAGE_W}px ${CAJ_PAGE_H}px;
}
.foto {
  position: absolute;
  top: ${FOTO_TOP}px;
  left: ${FOTO_LEFT}px;
  width: ${FOTO_W}px;
  height: ${FOTO_H}px;
  object-fit: cover;
  object-position: top center;
}
.caption {
  position: absolute;
  top: ${CAPTION_TOP}px;
  left: ${CAPTION_LEFT}px;
  width: ${CAPTION_W}px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-align: center;
  font-size: 11px;
  line-height: 1.25;
  color: #393939;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.surat,
.cv {
  position: absolute;
  top: 328px;
  left: ${BODY_LEFT}px;
  width: ${BODY_W}px;
  max-height: 740px;
  overflow: hidden;
  color: #393939;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.surat {
  font-size: 14px;
  line-height: 1.62;
  text-align: justify;
}
.surat p { margin: 0 0 12px 0; padding: 0; text-align: justify; overflow-wrap: anywhere; }
.surat .sign { margin-top: 12px; }
.cv table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  table-layout: fixed;
}
.cv td {
  background: transparent;
  font-size: 14px;
  color: #393939;
  vertical-align: top;
  padding: 9px 6px 9px 0;
  line-height: 1.4;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.cv td.lbl { width: 152px; white-space: nowrap; }
.cv td.col { width: 16px; text-align: center; white-space: nowrap; }
.cv td.val { width: auto; text-align: left; }
b { font-weight: 700; }
`;
}
