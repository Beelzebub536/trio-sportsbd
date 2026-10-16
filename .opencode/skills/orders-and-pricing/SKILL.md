---
name: orders-and-pricing
description: Business rules for prices, cart, checkout, 10% advance payment, WhatsApp, order statuses and bulk price changes. Load for cart, checkout, orders and anything that touches prices.
---
# Orders and pricing rules

## Money
- BDT, integers only (whole taka). Never floats. `formatBDT(1250) -> "৳1,250"`.
- Price lives on `Product`: `basePrice` and optional `salePrice` (must be lower than basePrice). Effective price = `salePrice ?? basePrice`. Discount % = round((base - sale) / base * 100).

## Cart (client)
- Zustand store persisted in localStorage, key `trio-cart`. Items store only `{ variantId, qty }` plus display snapshot for speed. On cart/checkout page, re-fetch live price, stock and availability from the server and show a notice if anything changed.

## Checkout (guest allowed, login optional)
1. Customer fills: full name, phone (BD format `01XXXXXXXXX`, validate `^01[3-9]\d{8}$`), division, district, upazila/thana, address line, optional note. Logged-in users can pick a saved address.
2. Server action `placeOrder` (never trusts client numbers): loads variants + products from DB, checks stock, computes subtotal, shipping fee (from settings: inside Dhaka vs outside Dhaka), total.
3. Advance = `ceil(total * advancePercent / 100)` where `advancePercent` comes from settings (default 10). Shown clearly: "Pay ৳X now (10%), rest ৳Y on delivery".
4. Advance payment (until SSLCommerz exists): customer chooses bKash or Nagad, sees the store's number (from settings, placeholder for now), sends money, enters the TrxID (required, 6-20 alphanumeric) and the sender number.
5. In ONE `$transaction`: create Order + OrderItems (with name/size/color/price snapshots), decrement stock (fail the whole order if any stock would go below 0). Generate `orderNumber` like `TS-240615-4827` (unique).
6. Order success page: order summary, status, and a button "Confirm on WhatsApp" that opens `https://wa.me/<storeNumber>?text=<urlencoded pre-filled message with order number, items, total, advance, TrxID>`. Store number comes from settings.
7. Guests track an order at `/track` with order number + phone. Logged-in users see orders in /account/orders.
8. Rate-limit `placeOrder` (simple DB-based or in-memory per IP+phone: max 5 per hour) to stop spam.

## Statuses
- `Order.status`: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED, or CANCELLED / RETURNED.
- `Order.advanceStatus`: PENDING (awaiting admin check) -> VERIFIED or REJECTED.
- Admin verifies the TrxID against their bKash/Nagad app, then sets VERIFIED and moves the order to CONFIRMED. Cancelling an order restocks the items (in a transaction).
- COD balance: `total - advanceAmount` collected on delivery; admin marks "balance collected".

## Settings (table `Setting`, key/value JSON, editable in /admin/settings)
`whatsappNumber` (placeholder 8801XXXXXXXXX), `advancePercent` (10), `bkashNumber`, `nagadNumber` (placeholders), `shippingInsideDhaka` (60), `shippingOutsideDhaka` (120), `freeShippingThreshold` (5000), `storeName`, `storeAddress`, `supportHours`. Read via a cached helper `getSettings()`; revalidate its tag when changed.

## Bulk price changes (admin) - highlight feature
- Every price write creates `PriceChange` rows tied to a `PriceBatch` (`batchId`, label, who, when, summary).
- Operations: set exact price; increase/decrease by % or by fixed ৳; set sale price as X% off base; remove sale prices; round to nearest 5/10/50. Applies to: selected rows, whole category, brand, gender, or all products matching current filters.
- ALWAYS show a preview table (product, old price, new price, difference) before the admin presses Apply. Block prices <= 0 and sale >= base.
- Apply in one `$transaction`, then revalidate the storefront. A batch can be undone with one click (restores old values and marks batch reverted; refuse undo if a newer batch touched the same product, or offer to skip those).
- Also: inline price editing in the product table (click a price, type, Enter), CSV export and CSV import (columns: sku or slug, basePrice, salePrice) with the same preview step.
