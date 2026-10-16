export const PRIMARY_NAV = [
  { label: "MEN", href: "/men", categorySlug: null },
  { label: "WOMEN", href: "/women", categorySlug: null },
  { label: "KIDS", href: "/kids", categorySlug: null },
  { label: "JERSEYS", href: "/jerseys", categorySlug: "jerseys" },
  { label: "TROUSERS", href: "/trousers", categorySlug: "trousers" },
  { label: "ACCESSORIES", href: "/accessories", categorySlug: "accessories" },
  { label: "SALE", href: "/sale", categorySlug: null },
] as const;

export const FOOTER_LINKS: Array<{
  heading: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    heading: "Shop",
    links: [
      { label: "Men", href: "/men" },
      { label: "Women", href: "/women" },
      { label: "Kids", href: "/kids" },
      { label: "Jerseys", href: "/jerseys" },
      { label: "Trousers", href: "/trousers" },
      { label: "Accessories", href: "/accessories" },
      { label: "Sale", href: "/sale" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Track your order", href: "/track" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "Size guide", href: "/size-guide" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Data deletion", href: "/data-deletion" },
    ],
  },
];
