/** Money helpers. All prices are whole taka (BDT integers). */

/** Format a whole-taka amount, e.g. `formatBDT(1250) -> "৳1,250"`. */
export const formatBDT = (amount: number): string => {
  const value = Math.round(Number.isFinite(amount) ? amount : 0);
  const sign = value < 0 ? "-" : "";
  return `${sign}৳${Math.abs(value).toLocaleString("en-IN")}`;
};

/** Effective selling price: the sale price when valid, otherwise the base price. */
export const effectivePrice = (
  basePrice: number,
  salePrice?: number | null,
): number => (salePrice != null && salePrice < basePrice ? salePrice : basePrice);

/** Display discount rounded down to a whole percentage (1450 → 1150 = 20%). */
export const discountPercent = (
  basePrice: number,
  salePrice?: number | null,
): number => {
  if (basePrice <= 0 || salePrice == null || salePrice >= basePrice) return 0;
  return Math.floor(((basePrice - salePrice) / basePrice) * 100);
};

export const calculateTotal = (
  items: Array<{ unitPrice: number; qty: number }>,
): number => items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

/** `01712345678` -> `0171-234-5678` (display only). */
export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return digits;
};

/** International-friendly phone for wa.me links: `01712345678` -> `8801712345678`. */
export const toWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
};
