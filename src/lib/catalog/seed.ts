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
    imageUrl: "/images/products/floral.jpg",
  },
  {
    id: "col-men",
    slug: "mens-fragrances",
    name: "Men's fragrances",
    description: "Wood, amber, and resin with a quiet, tailored presence.",
    imageUrl: "/images/products/woody.jpg",
  },
  {
    id: "col-unisex",
    slug: "unisex-fragrances",
    name: "Unisex fragrances",
    description: "Shared scents composed without a gendered brief.",
    imageUrl: "/images/products/musk.jpg",
  },
  {
    id: "col-oud",
    slug: "oud-and-oriental",
    name: "Oud and oriental",
    description: "Resinous, spiced compositions with depth and smoke.",
    imageUrl: "/images/products/oud.jpg",
  },
  {
    id: "col-fresh",
    slug: "fresh-and-citrus",
    name: "Fresh and citrus",
    description: "Bright openings of citrus peel, air, and clean musk.",
    imageUrl: "/images/products/citrus.jpg",
  },
  {
    id: "col-floral",
    slug: "floral",
    name: "Floral",
    description: "Petal, green stem, and white-flower accords.",
    imageUrl: "/images/products/floral.jpg",
  },
  {
    id: "col-woody",
    slug: "woody-and-amber",
    name: "Woody and amber",
    description: "Cedar, amber, and softly smoked woods.",
    imageUrl: "/images/products/amber.jpg",
  },
  {
    id: "col-gifts",
    slug: "gift-and-discovery-sets",
    name: "Gift and discovery sets",
    description: "Smaller formats for sampling and gifting.",
    imageUrl: "/images/products/gift.jpg",
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

export const DEMO_PRODUCTS: CatalogProduct[] = [
  {
    id: "prd-citrus-veil",
    slug: "citrus-veil",
    name: "Citrus Veil",
    brand: "Amaran",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-women", "col-fresh"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-01-12T10:00:00.000Z",
    description:
      "A demonstration citrus composition: bitter orange peel, a cool green facet, and a dry musk finish. Written for the EllzLuxe Fragranz sample catalog; notes describe this demonstration formula only.",
    notes: notes("Bitter orange, bergamot, petitgrain", "Neroli, green tea", "White musk, pale woods"),
    images: img("img-citrus", "/images/products/citrus.jpg", "Citrus Veil demonstration bottle"),
    variants: [
      { id: "var-citrus-50", sku: "ELF-CV-50", label: "50 ml", sizeMl: 50, priceMinor: 42000, compareAtMinor: null, stock: 18 },
      { id: "var-citrus-100", sku: "ELF-CV-100", label: "100 ml", sizeMl: 100, priceMinor: 68000, compareAtMinor: 74000, stock: 9 },
    ],
  },
  {
    id: "prd-night-oud",
    slug: "night-oud",
    name: "Night Oud",
    brand: "Armaf",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-unisex", "col-oud"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-02-03T10:00:00.000Z",
    description:
      "A demonstration oud-leaning scent with incense, dried rose, and smoked woods. This is sample catalog copy, not a claim about origin, longevity, or designer affiliation.",
    notes: notes("Pink pepper, saffron", "Rose, incense", "Oud accord, patchouli, amber"),
    images: img("img-oud", "/images/products/oud.jpg", "Night Oud demonstration bottle"),
    variants: [
      { id: "var-oud-50", sku: "ELF-NO-50", label: "50 ml", sizeMl: 50, priceMinor: 78000, compareAtMinor: null, stock: 7 },
      { id: "var-oud-100", sku: "ELF-NO-100", label: "100 ml", sizeMl: 100, priceMinor: 118000, compareAtMinor: null, stock: 4 },
    ],
  },
  {
    id: "prd-amber-atelier",
    slug: "amber-atelier",
    name: "Amber Atelier",
    brand: "Fragrance World",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-men", "col-woody"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-02-20T10:00:00.000Z",
    description:
      "A demonstration amber-wood fragrance: labdanum, cedar, and a quiet vanilla warmth. Intended to show product presentation, not to describe a commercial juice currently bottled for sale.",
    notes: notes("Cardamom, bergamot", "Cistus, cedar", "Amber, vanilla, leather accord"),
    images: img("img-amber", "/images/products/amber.jpg", "Amber Atelier demonstration bottle"),
    variants: [
      { id: "var-amber-50", sku: "ELF-AA-50", label: "50 ml", sizeMl: 50, priceMinor: 56000, compareAtMinor: null, stock: 12 },
      { id: "var-amber-100", sku: "ELF-AA-100", label: "100 ml", sizeMl: 100, priceMinor: 89000, compareAtMinor: null, stock: 6 },
    ],
  },
  {
    id: "prd-white-petal",
    slug: "white-petal",
    name: "White Petal",
    brand: "Giorgio Armani",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-women", "col-floral"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-03-08T10:00:00.000Z",
    description:
      "A demonstration white-floral built around jasmine, tuberose, and a soapy musk. Catalog text is original to this demonstration set.",
    notes: notes("Pear, green leaf", "Jasmine, tuberose", "Sandalwood, musk"),
    images: img("img-floral", "/images/products/floral.jpg", "White Petal demonstration bottle"),
    variants: [
      { id: "var-petal-50", sku: "ELF-WP-50", label: "50 ml", sizeMl: 50, priceMinor: 48000, compareAtMinor: null, stock: 14 },
    ],
  },
  {
    id: "prd-sea-linen",
    slug: "sea-linen",
    name: "Sea Linen",
    brand: "Khadlaj",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-unisex", "col-fresh"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-03-22T10:00:00.000Z",
    description:
      "A demonstration marine-linen accord: salt air, crushed herbs, and clean cotton musk. No performance claims are made.",
    notes: notes("Lemon, sea accord", "Mate, rosemary", "Driftwood, musk"),
    images: img("img-fresh", "/images/products/fresh.jpg", "Sea Linen demonstration bottle"),
    variants: [
      { id: "var-sea-50", sku: "ELF-SL-50", label: "50 ml", sizeMl: 50, priceMinor: 39000, compareAtMinor: null, stock: 20 },
      { id: "var-sea-100", sku: "ELF-SL-100", label: "100 ml", sizeMl: 100, priceMinor: 62000, compareAtMinor: null, stock: 11 },
    ],
  },
  {
    id: "prd-velvet-ember",
    slug: "velvet-ember",
    name: "Velvet Ember",
    brand: "L'affair",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-men", "col-woody"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-04-02T10:00:00.000Z",
    description:
      "A demonstration smoky-wood scent with guaiac, vetiver, and a dry ember accord. Demonstration catalog only.",
    notes: notes("Black pepper, bergamot", "Guaiac, iris", "Vetiver, smoked woods"),
    images: img("img-woody", "/images/products/woody.jpg", "Velvet Ember demonstration bottle"),
    variants: [
      { id: "var-ember-50", sku: "ELF-VE-50", label: "50 ml", sizeMl: 50, priceMinor: 54000, compareAtMinor: null, stock: 10 },
    ],
  },
  {
    id: "prd-garden-quiet",
    slug: "garden-quiet",
    name: "Garden Quiet",
    brand: "Lattafa",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-women", "col-floral"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-04-18T10:00:00.000Z",
    description:
      "A demonstration green-floral: crushed stems, peony, and a cool earthy base. Copy describes the sample formula only.",
    notes: notes("Dewy greens, mandarin", "Peony, rose", "Moss, cedar"),
    images: img("img-garden", "/images/products/floral.jpg", "Garden Quiet demonstration bottle"),
    variants: [
      { id: "var-garden-50", sku: "ELF-GQ-50", label: "50 ml", sizeMl: 50, priceMinor: 45000, compareAtMinor: null, stock: 16 },
    ],
  },
  {
    id: "prd-smoke-cedar",
    slug: "smoke-cedar",
    name: "Smoke Cedar",
    brand: "Maison Alhambra",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-men", "col-woody"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-05-01T10:00:00.000Z",
    description:
      "A demonstration cedar composition with incense smoke and dry spices. Catalog text describes this demonstration formula only.",
    notes: notes("Elemi, nutmeg", "Cedar, incense", "Oakmoss accord, amber"),
    images: img("img-cedar", "/images/products/woody.jpg", "Smoke Cedar demonstration bottle"),
    variants: [
      { id: "var-cedar-50", sku: "ELF-SC-50", label: "50 ml", sizeMl: 50, priceMinor: 51000, compareAtMinor: null, stock: 8 },
      { id: "var-cedar-100", sku: "ELF-SC-100", label: "100 ml", sizeMl: 100, priceMinor: 82000, compareAtMinor: null, stock: 5 },
    ],
  },
  {
    id: "prd-gold-resin",
    slug: "gold-resin",
    name: "Gold Resin",
    brand: "Parfum De Mirage",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-unisex", "col-oud"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-05-19T10:00:00.000Z",
    description:
      "A demonstration resinous oriental with benzoin, myrrh, and a honeyed warmth. Sample catalog copy.",
    notes: notes("Orange, cinnamon", "Myrrh, rose", "Benzoin, tonka, labdanum"),
    images: img("img-resin", "/images/products/resin.jpg", "Gold Resin demonstration bottle"),
    variants: [
      { id: "var-resin-50", sku: "ELF-GR-50", label: "50 ml", sizeMl: 50, priceMinor: 72000, compareAtMinor: null, stock: 6 },
    ],
  },
  {
    id: "prd-linen-musk",
    slug: "linen-musk",
    name: "Linen Musk",
    brand: "Versace",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-unisex", "col-fresh"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-06-04T10:00:00.000Z",
    description:
      "A demonstration skin-musk with iris powder and airy aldehydes. Written for storefront demonstration.",
    notes: notes("Aldehydes, bergamot", "Iris, heliotrope", "White musk, sandalwood"),
    images: img("img-linen", "/images/products/linen.jpg", "Linen Musk demonstration bottle"),
    variants: [
      { id: "var-linen-50", sku: "ELF-LM-50", label: "50 ml", sizeMl: 50, priceMinor: 43000, compareAtMinor: null, stock: 22 },
    ],
  },
  {
    id: "prd-orchid-smoke",
    slug: "orchid-smoke",
    name: "Orchid Smoke",
    brand: "Lattafa",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-women", "col-floral", "col-oud"],
    featured: false,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-06-21T10:00:00.000Z",
    description:
      "A demonstration floral-oriental: orchid accord, incense, and a soft vanilla trail. Not a statement about sourcing or exclusivity.",
    notes: notes("Pink pepper, plum", "Orchid, incense", "Vanilla, benzoin"),
    images: img("img-orchid", "/images/products/orchid.jpg", "Orchid Smoke demonstration bottle"),
    variants: [
      { id: "var-orchid-50", sku: "ELF-OS-50", label: "50 ml", sizeMl: 50, priceMinor: 64000, compareAtMinor: null, stock: 9 },
    ],
  },
  {
    id: "prd-discovery-set",
    slug: "atelier-discovery-set",
    name: "Atelier Discovery Set",
    brand: "EllzLuxe Fragranz",
    concentration: null,
    categoryId: "cat-discovery",
    collectionIds: ["col-gifts"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-07-01T10:00:00.000Z",
    description:
      "A demonstration discovery set of 8 × 2 ml vials drawn from this sample catalog. Contents are illustrative until the business confirms a live assortment.",
    notes: notes("Citrus, florals", "Woods, resins", "Musks, amber"),
    images: img("img-gift", "/images/products/gift.jpg", "Atelier Discovery Set demonstration packaging"),
    variants: [
      { id: "var-set-8", sku: "ELF-DS-8", label: "8 × 2 ml", sizeMl: 16, priceMinor: 28000, compareAtMinor: null, stock: 30 },
    ],
  },
];

export const DEMO_SETTINGS: StoreSettings = {
  announcement: "Ells Luxe Annex · WhatsApp 0593634512 · Confirm the bottle before you pay",
  contactEmail: "ellzluxefragranz@gmail.com",
  contactPhone: "0593634512",
  location: "Ells Luxe Annex",
  instagramUrl: "https://www.instagram.com/ellzLuxe_fragranz.gh/",
  tiktokUrl: "https://www.tiktok.com/@ellzluxefragranz.gh",
  snapchatHandle: "ama_candy90",
  momoNumber: "0593634512",
  momoMerchantId: "949805",
  bankName: "Fidelity Bank",
  bankAccount: "2400454612819",
  currencyCode: "GHS",
  shippingNote:
    "We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your region and locality on WhatsApp 0593634512. It is not a fixed checkout price. Pickup is free.",
  returnsNote:
    "Message WhatsApp 0593634512 before returning anything. We replace or make right a bottle we sent in error or that arrived damaged. Opened fragrance is not refunded except for a packing or sending error on our side. Pickup and delivery disputes are handled from Ells Luxe Annex.",
  privacyNote:
    "EllzLuxe Fragranz at Ells Luxe Annex uses your name, email, phone, delivery area, and order contents to fulfill orders, answer messages, and send restock or email updates you asked for. Payment confirmation is by WhatsApp, or by Moolre when card checkout is on. We do not sell your details. Email ellzluxefragranz@gmail.com or WhatsApp 0593634512 to ask what we hold.",
  termsNote:
    "Prices are in Ghana cedis. An order is a request to buy. It is not paid until we confirm payment. Delivery, pickup, and fees are on the Shipping page. Testers are marked Tester. Ghana law applies. Questions: WhatsApp 0593634512 or ellzluxefragranz@gmail.com.",
  aboutStory:
    "EllzLuxe Fragranz is a Ghana-based fragrance boutique at Ells Luxe Annex. We carry houses including Lattafa, Armaf, Maison Alhambra, and others listed on the Brands page.",
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
      "Read the notes on each bottle. Collections group citrus, floral, woody, and oud. WhatsApp 0593634512 if you want help choosing at the annex.",
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
