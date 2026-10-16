/**
 * Minimal CSV reader/writer for the price importer. Deliberately dependency
 * free: the price sheet only ever has slug/sku plus two numbers.
 */

export type CsvPriceRow = {
  line: number;
  slug: string;
  sku: string;
  basePrice: string;
  salePrice: string;
};

export type CsvPriceExportRow = {
  slug: string;
  basePrice: number;
  salePrice: number | null;
};

const splitLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
};

const quote = (value: string): string =>
  value.includes(",") || value.includes('"')
    ? `"${value.replace(/"/g, '""')}"`
    : value;

export function toPriceCsv(rows: CsvPriceExportRow[]): string {
  const lines = ["slug,basePrice,salePrice"];
  for (const row of rows) {
    lines.push(
      [
        quote(row.slug),
        String(row.basePrice),
        row.salePrice == null ? "" : String(row.salePrice),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function parsePriceCsv(text: string): {
  rows: CsvPriceRow[];
  headerError?: string;
} {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], headerError: "The file is empty." };
  }

  const header = splitLine(lines[0]).map((cell) => cell.toLowerCase());
  const slugIndex = header.indexOf("slug");
  const skuIndex = header.indexOf("sku");
  const baseIndex = header.indexOf("baseprice");
  const saleIndex = header.indexOf("saleprice");

  if (slugIndex === -1 && skuIndex === -1) {
    return {
      rows: [],
      headerError: "Add a header row with a slug or sku column.",
    };
  }
  if (baseIndex === -1) {
    return {
      rows: [],
      headerError: "Add a header row with a basePrice column.",
    };
  }

  const rows: CsvPriceRow[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    const cells = splitLine(lines[index]);
    rows.push({
      line: index + 1,
      slug: slugIndex === -1 ? "" : cells[slugIndex] ?? "",
      sku: skuIndex === -1 ? "" : cells[skuIndex] ?? "",
      basePrice: cells[baseIndex] ?? "",
      salePrice: saleIndex === -1 ? "" : cells[saleIndex] ?? "",
    });
  }

  return { rows };
}
