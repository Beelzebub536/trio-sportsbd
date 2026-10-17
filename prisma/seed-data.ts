import type { Gender } from "@prisma/client";

/**
 * Seed data for trio-sportsbd.
 * Everything here is safe to re-run: the seed script upserts by a natural key.
 */

export type SeedCategory = {
  slug: string;
  name: string;
  /** slug of the parent category, or null for a top-level category */
  parentSlug: string | null;
  sortOrder: number;
  image: string;
};

export type SeedColor = { name: string; hex: string };

export type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  gender: Gender;
  brand: string;
  basePrice: number;
  salePrice: number | null;
  isFeatured: boolean;
  sizes: string[];
  colors: SeedColor[];
};

export type SeedBanner = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

// ---------------------------------------------------------------------------
// Shared palettes and size sets (kept small so the product list stays readable)
// ---------------------------------------------------------------------------
const NAVY: SeedColor = { name: "Navy", hex: "#0A1F44" };
const RED: SeedColor = { name: "Red", hex: "#C8102E" };
const WHITE: SeedColor = { name: "White", hex: "#FFFFFF" };
const GREEN: SeedColor = { name: "Green", hex: "#006A4E" };
const BLACK: SeedColor = { name: "Black", hex: "#000000" };
const SKY: SeedColor = { name: "Sky Blue", hex: "#7EC8E3" };
const YELLOW: SeedColor = { name: "Yellow", hex: "#FFD100" };
const GREY: SeedColor = { name: "Grey", hex: "#8D8D8D" };
const MAROON: SeedColor = { name: "Maroon", hex: "#6E1E2B" };

const APPAREL = ["S", "M", "L", "XL", "XXL"];
const APPAREL_SM = ["S", "M", "L", "XL"];
const KIDS_SIZES = ["XS", "S", "M", "L"];
const ONE_SIZE = ["One Size"];
const SOCK_SIZES = ["S", "M", "L"];

const placeholder = (text: string, w = 800, h = 1000) =>
  `https://placehold.co/${w}x${h}/png?text=${encodeURIComponent(text)}`;

// ---------------------------------------------------------------------------
// Categories: 3 top-level + 8 children
// ---------------------------------------------------------------------------
export const seedCategories: SeedCategory[] = [
  { slug: "jerseys", name: "Jerseys", parentSlug: null, sortOrder: 1, image: placeholder("Jerseys", 800, 600) },
  { slug: "trousers", name: "Trousers", parentSlug: null, sortOrder: 2, image: placeholder("Trousers", 800, 600) },
  { slug: "accessories", name: "Accessories", parentSlug: null, sortOrder: 3, image: placeholder("Accessories", 800, 600) },

  { slug: "football-jerseys", name: "Football Jerseys", parentSlug: "jerseys", sortOrder: 1, image: placeholder("Football Jerseys", 800, 600) },
  { slug: "cricket-jerseys", name: "Cricket Jerseys", parentSlug: "jerseys", sortOrder: 2, image: placeholder("Cricket Jerseys", 800, 600) },

  { slug: "track-pants", name: "Track Pants", parentSlug: "trousers", sortOrder: 1, image: placeholder("Track Pants", 800, 600) },
  { slug: "shorts", name: "Shorts", parentSlug: "trousers", sortOrder: 2, image: placeholder("Shorts", 800, 600) },

  { slug: "bags", name: "Bags", parentSlug: "accessories", sortOrder: 1, image: placeholder("Bags", 800, 600) },
  { slug: "socks", name: "Socks", parentSlug: "accessories", sortOrder: 2, image: placeholder("Socks", 800, 600) },
  { slug: "caps", name: "Caps", parentSlug: "accessories", sortOrder: 3, image: placeholder("Caps", 800, 600) },
  { slug: "gloves", name: "Gloves", parentSlug: "accessories", sortOrder: 4, image: placeholder("Gloves", 800, 600) },
];

// ---------------------------------------------------------------------------
// 24 sample products
// ---------------------------------------------------------------------------
export const seedProducts: SeedProduct[] = [
  // Football jerseys (8)
  { slug: "dhaka-home-jersey-2425", name: "Dhaka Home Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 1450, salePrice: 1150, isFeatured: true, sizes: APPAREL, colors: [NAVY, RED, WHITE] },
  { slug: "dhaka-away-jersey-2425", name: "Dhaka Away Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 1450, salePrice: null, isFeatured: true, sizes: APPAREL, colors: [WHITE, NAVY] },
  { slug: "chattogram-home-jersey-2425", name: "Chattogram Home Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 1500, salePrice: null, isFeatured: true, sizes: APPAREL, colors: [RED, WHITE] },
  { slug: "sylhet-kings-home-jersey-2425", name: "Sylhet Kings Home Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 1400, salePrice: null, isFeatured: false, sizes: APPAREL, colors: [GREEN, WHITE] },
  { slug: "khulna-warriors-away-jersey-2425", name: "Khulna Warriors Away Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 1400, salePrice: 1120, isFeatured: false, sizes: APPAREL, colors: [SKY, NAVY] },
  { slug: "rajshahi-riders-home-jersey-2425", name: "Rajshahi Riders Home Jersey 24/25", categorySlug: "football-jerseys", gender: "UNISEX", brand: "Trio", basePrice: 1300, salePrice: null, isFeatured: false, sizes: APPAREL, colors: [MAROON, WHITE] },
  { slug: "dhaka-youth-jersey-2425", name: "Dhaka Youth Jersey 24/25", categorySlug: "football-jerseys", gender: "KIDS", brand: "Trio", basePrice: 900, salePrice: null, isFeatured: true, sizes: KIDS_SIZES, colors: [NAVY, SKY] },
  { slug: "dhaka-elite-player-jersey-2425", name: "Dhaka Elite Player Jersey 24/25", categorySlug: "football-jerseys", gender: "MEN", brand: "Trio", basePrice: 6500, salePrice: 5200, isFeatured: true, sizes: APPAREL, colors: [NAVY, YELLOW] },

  // Cricket jerseys (4)
  { slug: "bangladesh-cricket-home-jersey-2425", name: "Bangladesh Cricket Home Jersey 24/25", categorySlug: "cricket-jerseys", gender: "MEN", brand: "Trio", basePrice: 1650, salePrice: 1320, isFeatured: true, sizes: APPAREL, colors: [GREEN, RED, WHITE] },
  { slug: "bangladesh-cricket-away-jersey-2425", name: "Bangladesh Cricket Away Jersey 24/25", categorySlug: "cricket-jerseys", gender: "MEN", brand: "Trio", basePrice: 1650, salePrice: null, isFeatured: false, sizes: APPAREL, colors: [WHITE, GREEN] },
  { slug: "bangladesh-cricket-fan-jersey-2425", name: "Bangladesh Cricket Fan Jersey 24/25", categorySlug: "cricket-jerseys", gender: "UNISEX", brand: "Trio", basePrice: 1200, salePrice: 960, isFeatured: false, sizes: APPAREL, colors: [GREEN, WHITE] },
  { slug: "bangladesh-cricket-kids-jersey-2425", name: "Bangladesh Cricket Kids Jersey 24/25", categorySlug: "cricket-jerseys", gender: "KIDS", brand: "Trio", basePrice: 950, salePrice: null, isFeatured: true, sizes: KIDS_SIZES, colors: [GREEN, RED] },

  // Track pants (4)
  { slug: "dhaka-training-track-pants", name: "Dhaka Training Track Pants", categorySlug: "track-pants", gender: "MEN", brand: "Trio", basePrice: 1800, salePrice: null, isFeatured: true, sizes: APPAREL, colors: [BLACK, NAVY] },
  { slug: "performance-tapered-track-pants", name: "Performance Tapered Track Pants", categorySlug: "track-pants", gender: "MEN", brand: "Trio", basePrice: 2100, salePrice: 1680, isFeatured: false, sizes: APPAREL, colors: [BLACK, GREY] },
  { slug: "womens-fleece-track-pants", name: "Women's Fleece Track Pants", categorySlug: "track-pants", gender: "WOMEN", brand: "Trio", basePrice: 1900, salePrice: null, isFeatured: false, sizes: APPAREL, colors: [GREY, BLACK] },
  { slug: "kids-warmup-track-pants", name: "Kids Warm-Up Track Pants", categorySlug: "track-pants", gender: "KIDS", brand: "Trio", basePrice: 1200, salePrice: null, isFeatured: true, sizes: KIDS_SIZES, colors: [NAVY, BLACK] },

  // Shorts (3)
  { slug: "pro-training-shorts", name: "Pro Training Shorts", categorySlug: "shorts", gender: "MEN", brand: "Trio", basePrice: 850, salePrice: null, isFeatured: true, sizes: APPAREL_SM, colors: [BLACK, NAVY] },
  { slug: "bangladesh-cricket-supporters-shorts", name: "Bangladesh Cricket Supporters Shorts", categorySlug: "shorts", gender: "UNISEX", brand: "Trio", basePrice: 900, salePrice: 720, isFeatured: false, sizes: APPAREL_SM, colors: [GREEN, BLACK] },
  { slug: "womens-running-shorts", name: "Women's Running Shorts", categorySlug: "shorts", gender: "WOMEN", brand: "Trio", basePrice: 950, salePrice: null, isFeatured: false, sizes: APPAREL_SM, colors: [BLACK, MAROON] },

  // Bags (2)
  { slug: "team-kit-duffle-bag", name: "Team Kit Duffle Bag", categorySlug: "bags", gender: "UNISEX", brand: "Trio", basePrice: 2600, salePrice: null, isFeatured: true, sizes: ONE_SIZE, colors: [BLACK, NAVY] },
  { slug: "match-day-backpack", name: "Match Day Backpack", categorySlug: "bags", gender: "UNISEX", brand: "Trio", basePrice: 1900, salePrice: 1520, isFeatured: false, sizes: ONE_SIZE, colors: [NAVY, GREY] },

  // Socks (1)
  { slug: "performance-crew-socks-3-pack", name: "Performance Crew Socks 3-Pack", categorySlug: "socks", gender: "UNISEX", brand: "Trio", basePrice: 800, salePrice: null, isFeatured: true, sizes: SOCK_SIZES, colors: [WHITE, BLACK] },

  // Caps (1)
  { slug: "trio-sports-snapback-cap", name: "Trio Sports Snapback Cap", categorySlug: "caps", gender: "UNISEX", brand: "Trio", basePrice: 850, salePrice: null, isFeatured: false, sizes: ONE_SIZE, colors: [BLACK, GREEN] },

  // Gloves (1)
  { slug: "goalkeeper-pro-gloves", name: "Goalkeeper Pro Gloves", categorySlug: "gloves", gender: "MEN", brand: "Trio", basePrice: 3200, salePrice: 2560, isFeatured: true, sizes: APPAREL_SM, colors: [RED, BLACK] },
];

// ---------------------------------------------------------------------------
// Settings (keys match the orders-and-pricing skill)
// ---------------------------------------------------------------------------
export const seedSettings: Record<string, string | number> = {
  storeName: "Trio Sports BD",
  storeAddress: "Level 4, Bashundhara City, Panthapath, Dhaka 1215",
  supportHours: "Sat–Thu, 10:00am – 8:00pm",
  whatsappNumber: "8801700000000",
  bkashNumber: "01700000000",
  nagadNumber: "01700000000",
  advancePercent: 10,
  shippingInsideDhaka: 60,
  shippingOutsideDhaka: 120,
  freeShippingThreshold: 5000,
};

// ---------------------------------------------------------------------------
// Home page banners
// ---------------------------------------------------------------------------
export const seedBanners: SeedBanner[] = [
  {
    id: 1,
    title: "New Season, New Gear",
    subtitle: "Fresh jerseys and training kit are here",
    imageUrl: placeholder("New Season, New Gear", 1600, 600),
    linkUrl: "/shop",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    title: "Bangladesh Cricket 24/25",
    subtitle: "Wear your colours",
    imageUrl: placeholder("Bangladesh Cricket 24/25", 1600, 600),
    linkUrl: "/shop?category=cricket-jerseys",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    title: "Sale: Up To 30% Off",
    subtitle: "Limited time on selected styles",
    imageUrl: placeholder("Sale Up To 30% Off", 1600, 600),
    linkUrl: "/sale",
    sortOrder: 3,
    isActive: true,
  },
];
