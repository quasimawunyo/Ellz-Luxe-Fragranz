import type {
  CatalogCategory,
  CatalogCollection,
  CatalogProduct,
  FaqItem,
  StoreSettings,
} from "@/lib/catalog/types";

export const DEMO_CATEGORIES: CatalogCategory[] = [
  { id: "cat-eau-de-parfum", slug: "eau-de-parfum", name: "Eau de Parfum" },
  { id: "cat-discovery", slug: "discovery-and-gifts", name: "Discovery and gifts" },
];

export const DEMO_COLLECTIONS: CatalogCollection[] = [
  {
    id: "col-women",
    slug: "womens-fragrances",
    name: "Women's fragrances",
    description: "Compositions with floral, citrus, and luminous warmth.",
    imageUrl: "/images/products/yara.jpg",
  },
  {
    id: "col-men",
    slug: "mens-fragrances",
    name: "Men's fragrances",
    description: "Wood, amber, and resin with a quiet, tailored presence.",
    imageUrl: "/images/products/club-de-nuit.jpg",
  },
  {
    id: "col-unisex",
    slug: "unisex-fragrances",
    name: "Unisex fragrances",
    description: "Shared scents composed without a gendered brief.",
    imageUrl: "/images/products/extremely-unique.jpg",
  },
  {
    id: "col-oud",
    slug: "oud-and-oriental",
    name: "Oud and oriental",
    description: "Resinous, spiced compositions with depth and smoke.",
    imageUrl: "/images/products/oud-noir.jpg",
  },
  {
    id: "col-fresh",
    slug: "fresh-and-citrus",
    name: "Fresh and citrus",
    description: "Bright openings of citrus peel, air, and clean musk.",
    imageUrl: "/images/products/island-sun.jpg",
  },
  {
    id: "col-floral",
    slug: "floral",
    name: "Floral",
    description: "Petal, green stem, and white-flower accords.",
    imageUrl: "/images/products/kaly-vardy.jpg",
  },
  {
    id: "col-woody",
    slug: "woody-and-amber",
    name: "Woody and amber",
    description: "Cedar, amber, and softly smoked woods.",
    imageUrl: "/images/products/night-club.jpg",
  },
  {
    id: "col-gifts",
    slug: "gift-and-discovery-sets",
    name: "Gift and discovery sets",
    description: "Smaller formats for sampling and gifting.",
    imageUrl: "/images/products/aventos-blue.jpg",
  },
];

function notes(top: string, heart: string, base: string) {
  return {
    top: top.split(",").map((n) => n.trim()),
    heart: heart.split(",").map((n) => n.trim()),
    base: base.split(",").map((n) => n.trim()),
  };
}

function img(id: string, url: string, alt: string): CatalogProduct["images"] {
  return [{ id, url, alt, position: 0 }];
}

function juice(input: {
  id: string;
  slug: string;
  name: string;
  brand: string;
  collectionIds: string[];
  featured?: boolean;
  newArrival?: boolean;
  createdAt: string;
  description: string;
  notes?: CatalogProduct["notes"];
  image: [string, string, string];
  variants: CatalogProduct["variants"];
}): CatalogProduct {
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: input.collectionIds,
    featured: input.featured ?? false,
    newArrival: input.newArrival ?? false,
    status: "published",
    isDemonstration: false,
    createdAt: input.createdAt,
    description: input.description,
    notes: input.notes ?? { top: [], heart: [], base: [] },
    images: img(...input.image),
    variants: input.variants,
  };
}

export const DEMO_PRODUCTS: CatalogProduct[] = [
  juice({
    id: "prd-citrus-veil",
    slug: "silverado-21",
    name: "Silverado 21",
    brand: "Amaran",
    collectionIds: ["col-unisex", "col-woody"],
    featured: true,
    createdAt: "2026-01-12T10:00:00.000Z",
    description: "Amaran Silverado 21 eau de parfum, 100 ml. Photographed from the house bottle.",
    image: ["img-citrus", "/images/products/silverado-21.jpg", "Amaran Silverado 21 eau de parfum"],
    variants: [
      { id: "var-citrus-50", sku: "ELF-CV-50", label: "50 ml", sizeMl: 50, priceMinor: 42000, compareAtMinor: null, stock: 18 },
      { id: "var-citrus-100", sku: "ELF-CV-100", label: "100 ml", sizeMl: 100, priceMinor: 68000, compareAtMinor: null, stock: 9 },
    ],
  }),
  juice({
    id: "prd-night-oud",
    slug: "club-de-nuit-intense-man",
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    collectionIds: ["col-men", "col-woody"],
    featured: true,
    createdAt: "2026-02-03T10:00:00.000Z",
    description: "Armaf Club de Nuit Intense Man eau de parfum. Notes on the house image: apple, bergamot, blackcurrant, pineapple, and lemon; rose, birch, and jasmine; musk, ambergris, patchouli, and vanilla.",
    notes: notes("Apple, bergamot, blackcurrant, pineapple, lemon", "Rose, birch, jasmine", "Musk, ambergris, patchouli, vanilla"),
    image: ["img-oud", "/images/products/club-de-nuit.jpg", "Armaf Club de Nuit Intense Man"],
    variants: [
      { id: "var-oud-50", sku: "ELF-NO-50", label: "50 ml", sizeMl: 50, priceMinor: 78000, compareAtMinor: null, stock: 7 },
      { id: "var-oud-100", sku: "ELF-NO-100", label: "100 ml", sizeMl: 100, priceMinor: 118000, compareAtMinor: null, stock: 4 },
    ],
  }),
  juice({
    id: "prd-amber-atelier",
    slug: "aventos-blue-for-him",
    name: "Aventos Blue For Him",
    brand: "Fragrance World",
    collectionIds: ["col-men", "col-woody", "col-gifts"],
    featured: true,
    createdAt: "2026-02-18T10:00:00.000Z",
    description: "Fragrance World Aventos Blue For Him eau de parfum. Photographed from the house bottle and matching spray.",
    image: ["img-amber", "/images/products/aventos-blue.jpg", "Fragrance World Aventos Blue For Him"],
    variants: [
      { id: "var-amber-50", sku: "ELF-AA-50", label: "50 ml", sizeMl: 50, priceMinor: 54000, compareAtMinor: null, stock: 11 },
      { id: "var-amber-100", sku: "ELF-AA-100", label: "100 ml", sizeMl: 100, priceMinor: 86000, compareAtMinor: null, stock: 6 },
    ],
  }),
  juice({
    id: "prd-white-petal",
    slug: "yara",
    name: "Yara",
    brand: "Lattafa",
    collectionIds: ["col-women", "col-floral"],
    featured: true,
    newArrival: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    description: "Lattafa Yara eau de parfum. Photographed from the house bottle.",
    image: ["img-floral", "/images/products/yara.jpg", "Lattafa Yara eau de parfum"],
    variants: [
      { id: "var-petal-50", sku: "ELF-WP-50", label: "50 ml", sizeMl: 50, priceMinor: 48000, compareAtMinor: null, stock: 14 },
    ],
  }),
  juice({
    id: "prd-sea-linen",
    slug: "island-sun",
    name: "Island Sun",
    brand: "Khadlaj",
    collectionIds: ["col-unisex", "col-fresh"],
    newArrival: true,
    createdAt: "2026-03-09T10:00:00.000Z",
    description: "Khadlaj Island Sun. Photographed from the house bottle.",
    image: ["img-fresh", "/images/products/island-sun.jpg", "Khadlaj Island Sun"],
    variants: [
      { id: "var-sea-50", sku: "ELF-SL-50", label: "50 ml", sizeMl: 50, priceMinor: 46000, compareAtMinor: null, stock: 16 },
      { id: "var-sea-100", sku: "ELF-SL-100", label: "100 ml", sizeMl: 100, priceMinor: 72000, compareAtMinor: null, stock: 8 },
    ],
  }),
  juice({
    id: "prd-velvet-ember",
    slug: "pure-spirit",
    name: "Pure Spirit",
    brand: "L'affair",
    collectionIds: ["col-unisex", "col-woody"],
    createdAt: "2026-03-22T10:00:00.000Z",
    description: "L'affair Pure Spirit eau de parfum. Photographed from the house bottle.",
    image: ["img-woody", "/images/products/pure-spirit.jpg", "L'affair Pure Spirit eau de parfum"],
    variants: [
      { id: "var-ember-50", sku: "ELF-VE-50", label: "50 ml", sizeMl: 50, priceMinor: 52000, compareAtMinor: null, stock: 10 },
    ],
  }),
  juice({
    id: "prd-garden-quiet",
    slug: "fire-on-ice",
    name: "Fire on Ice",
    brand: "Lattafa",
    collectionIds: ["col-unisex", "col-fresh"],
    newArrival: true,
    createdAt: "2026-04-04T10:00:00.000Z",
    description: "Lattafa Fire on Ice eau de parfum. Photographed from the house bottle.",
    image: ["img-garden", "/images/products/fire-on-ice.jpg", "Lattafa Fire on Ice eau de parfum"],
    variants: [
      { id: "var-garden-50", sku: "ELF-GQ-50", label: "50 ml", sizeMl: 50, priceMinor: 44000, compareAtMinor: null, stock: 20 },
    ],
  }),
  juice({
    id: "prd-smoke-cedar",
    slug: "night-club",
    name: "Night Club",
    brand: "Fragrance World",
    collectionIds: ["col-men", "col-woody"],
    createdAt: "2026-04-16T10:00:00.000Z",
    description: "Fragrance World Night Club eau de parfum, 100 ml. Photographed from the house bottle.",
    image: ["img-cedar", "/images/products/night-club.jpg", "Fragrance World Night Club eau de parfum"],
    variants: [
      { id: "var-cedar-50", sku: "ELF-SC-50", label: "50 ml", sizeMl: 50, priceMinor: 58000, compareAtMinor: null, stock: 9 },
      { id: "var-cedar-100", sku: "ELF-SC-100", label: "100 ml", sizeMl: 100, priceMinor: 92000, compareAtMinor: null, stock: 5 },
    ],
  }),
  juice({
    id: "prd-gold-resin",
    slug: "oud-noir",
    name: "Oud Noir",
    brand: "Khadlaj",
    collectionIds: ["col-unisex", "col-oud"],
    createdAt: "2026-04-28T10:00:00.000Z",
    description: "Khadlaj Oud Noir eau de parfum. Photographed from the house bottle.",
    image: ["img-resin", "/images/products/oud-noir.jpg", "Khadlaj Oud Noir eau de parfum"],
    variants: [
      { id: "var-resin-50", sku: "ELF-GR-50", label: "50 ml", sizeMl: 50, priceMinor: 64000, compareAtMinor: null, stock: 8 },
    ],
  }),
  juice({
    id: "prd-linen-musk",
    slug: "proud-of-you",
    name: "Proud of You",
    brand: "Fragrance World",
    collectionIds: ["col-women", "col-floral"],
    createdAt: "2026-05-10T10:00:00.000Z",
    description: "Fragrance World Proud of You parfum. Photographed from the house bottle.",
    image: ["img-linen", "/images/products/proud-of-you.jpg", "Fragrance World Proud of You parfum"],
    variants: [
      { id: "var-linen-50", sku: "ELF-LM-50", label: "50 ml", sizeMl: 50, priceMinor: 40000, compareAtMinor: null, stock: 22 },
    ],
  }),
  juice({
    id: "prd-orchid-smoke",
    slug: "extremely-unique",
    name: "Extremely Unique",
    brand: "Fragrance World",
    collectionIds: ["col-unisex", "col-fresh"],
    featured: true,
    createdAt: "2026-05-21T10:00:00.000Z",
    description: "Fragrance World Extremely Unique eau de parfum, also shown as Oudyssia. Photographed from the house bottle.",
    image: ["img-orchid", "/images/products/extremely-unique.jpg", "Fragrance World Extremely Unique eau de parfum"],
    variants: [
      { id: "var-orchid-50", sku: "ELF-OS-50", label: "50 ml", sizeMl: 50, priceMinor: 56000, compareAtMinor: null, stock: 12 },
    ],
  }),
  juice({
    id: "prd-discovery-set",
    slug: "hawas-black",
    name: "Hawas Black",
    brand: "Rasasi",
    collectionIds: ["col-men", "col-woody"],
    featured: true,
    createdAt: "2026-07-01T10:00:00.000Z",
    description: "Rasasi Hawas Black for him eau de parfum, 100 ml. Photographed from the house bottle.",
    image: ["img-gift", "/images/products/hawas-black.jpg", "Rasasi Hawas Black for him"],
    variants: [
      { id: "var-set-8", sku: "ELF-DS-8", label: "100 ml", sizeMl: 100, priceMinor: 98000, compareAtMinor: null, stock: 10 },
    ],
  }),
  juice({
    id: "prd-kaly-vardy",
    slug: "kaly-vardy",
    name: "Kaly Vardy",
    brand: "Kaly",
    collectionIds: ["col-women", "col-floral"],
    createdAt: "2026-08-02T10:00:00.000Z",
    description: "Kaly Vardy eau de parfum, 50 ml. Photographed from the house bottle.",
    image: ["img-kaly", "/images/products/kaly-vardy.jpg", "Kaly Vardy eau de parfum"],
    variants: [
      { id: "var-kaly-50", sku: "ELF-KV-50", label: "50 ml", sizeMl: 50, priceMinor: 48000, compareAtMinor: null, stock: 12 },
    ],
  }),
  juice({
    id: "prd-intenso",
    slug: "intenso",
    name: "Intenso",
    brand: "Dolce & Gabbana",
    collectionIds: ["col-men", "col-woody"],
    createdAt: "2026-08-08T10:00:00.000Z",
    description: "Dolce & Gabbana Intenso pour homme eau de parfum. Photographed from the house bottle.",
    image: ["img-intenso", "/images/products/intenso.jpg", "Dolce & Gabbana Intenso pour homme"],
    variants: [
      { id: "var-intenso-125", sku: "ELF-DI-125", label: "125 ml", sizeMl: 125, priceMinor: 148000, compareAtMinor: null, stock: 4 },
    ],
  }),
  juice({
    id: "prd-sehr-al-oud",
    slug: "sehr-al-oud",
    name: "Sehr Al Oud",
    brand: "Jean Antoine",
    collectionIds: ["col-unisex", "col-oud"],
    createdAt: "2026-08-14T10:00:00.000Z",
    description: "Jean Antoine Sehr Al Oud. Photographed from the house bottle.",
    image: ["img-sehr", "/images/products/sehr-al-oud.jpg", "Jean Antoine Sehr Al Oud"],
    variants: [
      { id: "var-sehr-100", sku: "ELF-SAO-100", label: "100 ml", sizeMl: 100, priceMinor: 86000, compareAtMinor: null, stock: 6 },
    ],
  }),
  juice({
    id: "prd-badee-al-oud",
    slug: "badee-al-oud-sublime",
    name: "Bade'e Al Oud Sublime",
    brand: "Lattafa",
    collectionIds: ["col-unisex", "col-oud"],
    newArrival: true,
    createdAt: "2026-08-20T10:00:00.000Z",
    description: "Lattafa Bade'e Al Oud Sublime eau de parfum. Photographed from the house bottle.",
    image: ["img-badee", "/images/products/badee-al-oud.jpg", "Lattafa Bade'e Al Oud Sublime"],
    variants: [
      { id: "var-badee-100", sku: "ELF-BAO-100", label: "100 ml", sizeMl: 100, priceMinor: 72000, compareAtMinor: null, stock: 8 },
    ],
  }),
];

export const DEMO_SETTINGS: StoreSettings = {
  announcement: "EllzLuxe Fragranz · WhatsApp 0593634512",
  contactEmail: "ellzluxefragranz@gmail.com",
  contactPhone: "0593634512",
  location: "Ells Luxe Annex, Pantang",
  instagramUrl: "https://www.instagram.com/ellzLuxe_fragranz.gh/",
  tiktokUrl: "https://www.tiktok.com/@ellzluxefragranz.gh",
  snapchatHandle: "ama_candy90",
  momoNumber: "0593634512",
  momoMerchantId: "949805",
  bankName: "Fidelity Bank",
  bankAccount: "2400454612819",
  currencyCode: "GHS",
  shippingNote:
    "We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your region and locality on WhatsApp 0593634512. Pickup is free.",
  returnsNote:
    "Message WhatsApp 0593634512 before returning anything. We replace or make right a bottle we sent in error or that arrived damaged. Opened fragrance is not refunded except for a packing or sending error on our side. Pickup and delivery disputes are handled from Ells Luxe Annex.",
  privacyNote:
    "EllzLuxe Fragranz at Ells Luxe Annex uses your name, email, phone, delivery area, and order contents to fulfill orders, answer messages, and send restock or email updates you asked for. Payment confirmation is by WhatsApp, or by Moolre when card checkout is on. We do not sell your details. Email ellzluxefragranz@gmail.com or WhatsApp 0593634512 to ask what we hold.",
  termsNote:
    "Prices are in Ghana cedis. An order is a request to buy. It is not paid until we confirm payment. Delivery, pickup, and fees are on the Shipping page. Ghana law applies. Questions: WhatsApp 0593634512 or ellzluxefragranz@gmail.com.",
  aboutStory:
    "EllzLuxe Fragranz is a Ghana-based fragrance boutique at Ells Luxe Annex, Pantang. We carry houses including Lattafa, Armaf, Fragrance World, Khadlaj, and others listed on the Brands page.",
  deliveryMethods: [
    {
      id: "accra",
      label: "Greater Accra delivery",
      amountMinor: 0,
      description: "Fee depends on your locality in Greater Accra. Quoted on WhatsApp after you order.",
    },
    {
      id: "national",
      label: "Rest of Ghana",
      amountMinor: 0,
      description: "Fee depends on your town. Quoted on WhatsApp after you order.",
    },
    {
      id: "pickup",
      label: "Pickup at Ells Luxe Annex",
      amountMinor: 0,
      description: "Collect your order at Ells Luxe Annex. Message 0593634512 to schedule.",
    },
  ],
};

export const DEMO_FAQS: FaqItem[] = [
  {
    id: "faq-order",
    question: "How do I place an order?",
    answer:
      "Add a fragrance to your cart, proceed to checkout, and complete delivery details. Confirm payment on WhatsApp 0593634512.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-delivery",
    question: "Where do you deliver?",
    answer:
      "We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your location on WhatsApp 0593634512.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-payment",
    question: "Which payment methods are accepted?",
    answer:
      "Message the house on WhatsApp 0593634512 after you place an order to confirm how to pay.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-select",
    question: "How should I choose a fragrance?",
    answer:
      "Read the notes on each bottle. Collections group citrus, floral, woody, and oud. WhatsApp 0593634512 if you want help choosing a bottle.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-returns",
    question: "What is the returns policy?",
    answer:
      "Message WhatsApp 0593634512 before returning anything. Wrong or damaged bottles from us will be made right. Opened fragrance is not refunded except for a packing error on our side.",
    requiresOwnerReview: false,
  },
];
