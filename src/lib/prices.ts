/**
 * Pure price maths for the bulk price manager. No Prisma, no React — so the
 * same rules can be reused by the editor, the CSV importer and the server
 * action. All money is whole taka (integers).
 */

export type PriceRow = {
  id: number;
  basePrice: number;
  salePrice: number | null;
};

export type PriceEdit = {
  basePrice: number;
  salePrice: number | null;
};

export type EditorProduct = PriceRow & {
  name: string;
  slug: string;
  categoryName: string;
  gender: string;
  brand: string | null;
  image: string | null;
  isActive: boolean;
  skus: string[];
};

export type PriceDiff = {
  id: number;
  name: string;
  slug: string;
  oldBase: number;
  newBase: number;
  oldSale: number | null;
  newSale: number | null;
  error?: string;
  warning?: string;
};

export type BulkOperationKind =
  | "setBase"
  | "increasePercent"
  | "decreasePercent"
  | "increaseAmount"
  | "decreaseAmount"
  | "salePercentOff"
  | "removeSale"
  | "roundTo";

export type BulkOperation = {
  kind: BulkOperationKind;
  value: number;
};

export const ROUND_STEPS = [5, 10, 50] as const;

/** Blocking problems only. Warnings are handled by the caller. */
export function validatePrices(
  basePrice: number,
  salePrice: number | null,
): string | null {
  if (!Number.isInteger(basePrice) || basePrice <= 0) {
    return "Base price must be a whole number above 0";
  }
  if (salePrice == null) return null;
  if (!Number.isInteger(salePrice) || salePrice <= 0) {
    return "Sale price must be a whole number above 0";
  }
  if (salePrice >= basePrice) {
    return "Sale price must be below the base price";
  }
  return null;
}

const roundToNearest = (value: number, step: number): number =>
  Math.max(step, Math.round(value / step) * step);

/**
 * Applies one bulk operation to a single row. When an operation pushes the
 * base price at or below the sale price, the sale price is cleared (and the
 * caller is told, so the preview can highlight it).
 */
export function applyOperation(
  row: PriceRow,
  operation: BulkOperation,
): PriceEdit & { warning?: string } {
  let base = row.basePrice;
  let sale = row.salePrice;
  let warning: string | undefined;
  const value = operation.value;

  switch (operation.kind) {
    case "setBase":
      base = Math.round(value);
      break;
    case "increasePercent":
      base = Math.round(base * (1 + value / 100));
      break;
    case "decreasePercent":
      base = Math.round(base * (1 - value / 100));
      break;
    case "increaseAmount":
      base = Math.round(base + value);
      break;
    case "decreaseAmount":
      base = Math.round(base - value);
      break;
    case "salePercentOff":
      sale = Math.round(base * (1 - value / 100));
      break;
    case "removeSale":
      sale = null;
      break;
    case "roundTo": {
      const step = ROUND_STEPS.includes(value as 5 | 10 | 50) ? value : 10;
      base = roundToNearest(base, step);
      if (sale != null) sale = roundToNearest(sale, step);
      break;
    }
  }

  if (sale != null && (sale >= base || sale <= 0)) {
    sale = null;
    warning = "Sale price removed (no longer below the base price)";
  }

  return { basePrice: base, salePrice: sale, warning };
}

/** Rows that differ from the saved values, with validation attached. */
export function buildDiff(
  products: EditorProduct[],
  edits: Record<number, PriceEdit>,
): PriceDiff[] {
  const diff: PriceDiff[] = [];

  for (const product of products) {
    const edit = edits[product.id];
    if (!edit) continue;
    if (
      edit.basePrice === product.basePrice &&
      edit.salePrice === product.salePrice
    ) {
      continue;
    }

    diff.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      oldBase: product.basePrice,
      newBase: edit.basePrice,
      oldSale: product.salePrice,
      newSale: edit.salePrice,
      error: validatePrices(edit.basePrice, edit.salePrice) ?? undefined,
    });
  }

  return diff;
}

/** Runs an operation over the current values of the selected rows. */
export function applyOperationToSelection(
  rows: PriceRow[],
  operation: BulkOperation,
): { pending: Record<number, PriceEdit>; warnings: number } {
  const pending: Record<number, PriceEdit> = {};
  let warnings = 0;

  for (const row of rows) {
    const next = applyOperation(row, operation);
    if (next.warning) warnings += 1;
    pending[row.id] = { basePrice: next.basePrice, salePrice: next.salePrice };
  }

  return { pending, warnings };
}

export const OPERATION_LABELS: Record<BulkOperationKind, string> = {
  setBase: "Set base price to ৳",
  increasePercent: "Increase base price by %",
  decreasePercent: "Decrease base price by %",
  increaseAmount: "Increase base price by ৳",
  decreaseAmount: "Decrease base price by ৳",
  salePercentOff: "Set sale price to X% off base",
  removeSale: "Remove sale price",
  roundTo: "Round prices to nearest",
};
