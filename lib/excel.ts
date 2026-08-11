/**
 * Excel (.xlsx) export helpers via exceljs.
 */
import ExcelJS from 'exceljs';

export interface ExcelColumn {
  key: string;
  header: string;
}

function cellValue(value: unknown): string | number {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.toISOString();
  // Keep IDs/dates as text so Excel does not mangle them
  return String(value);
}

export async function buildXlsxBuffer(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Array<Record<string, unknown>>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AJIS';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName.slice(0, 31) || 'Sheet1');
  sheet.columns = columns.map(c => ({
    header: c.header,
    key: c.key,
    width: Math.min(40, Math.max(12, c.header.length + 2)),
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.commit();

  for (const row of rows) {
    const values: Record<string, string | number> = {};
    for (const col of columns) {
      values[col.key] = cellValue(row[col.key]);
    }
    sheet.addRow(values);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function excelDownloadResponse(
  filename: string,
  sheetName: string,
  columns: ExcelColumn[],
  rows: Array<Record<string, unknown>>,
): Promise<Response> {
  const buffer = await buildXlsxBuffer(sheetName, columns, rows);
  const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Build query string from filter map (skip empty). */
export function filtersToQuery(filters: Record<string, string>): string {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  return qs.toString();
}
