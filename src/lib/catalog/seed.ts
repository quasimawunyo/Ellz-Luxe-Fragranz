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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
    concentration: "Eau de Parfum",
    categoryId: "cat-eau-de-parfum",
    collectionIds: ["col-men", "col-woody"],
    featured: true,
    status: "published",
    isDemonstration: true,
    createdAt: "2026-05-01T10:00:00.000Z",
    description:
      "A demonstration cedar composition with incense smoke and dry spices. Not affiliated with any third-party house.",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
    brand: "EllzLuxe Fragranz",
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
  announcement: "Demonstration catalog — prices shown in Ghana cedis. Policies are placeholders pending owner review.",
  contactEmail: "hello@example.com",
  contactPhone: "+233 00 000 0000",
  instagramUrl: "https://instagram.com/",
  currencyCode: "GHS",
  shippingNote:
    "Shipping and delivery terms are placeholders. The business owner must publish confirmed Ghana delivery options, timelines, and fees before launch.",
  returnsNote:
    "Returns and refunds are not yet defined. Do not treat this page as an operational policy until the owner approves the final text.",
  privacyNote:
    "This privacy page is a structural placeholder. Replace it with counsel-reviewed language before collecting customer data in production.",
  termsNote:
    "These terms are a structural placeholder and are not a binding commercial contract. The owner must review and publish approved terms before launch.",
  aboutStory:
    "EllzLuxe Fragranz is a Ghana-based fragrance house in formation: a boutique for scents that feel considered, personal, and quietly luxurious. This story will be replaced with owner-approved copy. No founding date, biography, or sourcing claim is stated here.",
  deliveryMethods: [
    {
      id: "accra",
      label: "Greater Accra delivery",
      amountMinor: 3000,
      description: "Placeholder rate for Accra addresses. Confirm with operations before launch.",
    },
    {
      id: "national",
      label: "Rest of Ghana",
      amountMinor: 5000,
      description: "Placeholder nationwide rate. Confirm carrier and timeline before launch.",
    },
    {
      id: "pickup",
      label: "Scheduled pickup",
      amountMinor: 0,
      description: "Placeholder pickup option. Location must be confirmed by the business.",
    },
  ],
};

export const DEMO_FAQS: FaqItem[] = [
  {
    id: "faq-order",
    question: "How do I place an order?",
    answer:
      "Add a fragrance to your cart, proceed to checkout, and complete delivery details. Payment is processed by Paystack when those credentials are configured. Until then, orders remain unpaid.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-delivery",
    question: "Where do you deliver?",
    answer:
      "The storefront is built for Ghana-first delivery, with region and locality fields at checkout. Exact service areas, fees, and timelines must be confirmed by the business before launch.",
    requiresOwnerReview: true,
  },
  {
    id: "faq-payment",
    question: "Which payment methods are accepted?",
    answer:
      "The intended processor is Paystack, which can support cards and Ghana mobile money when the business account is connected. The store never stores card numbers.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-select",
    question: "How should I choose a fragrance?",
    answer:
      "Use collections by family — citrus, floral, woody, oud — then read the listed notes. Discovery sets are useful when you want to sample before a full bottle. Notes in this catalog describe demonstration formulas.",
    requiresOwnerReview: false,
  },
  {
    id: "faq-returns",
    question: "What is the returns policy?",
    answer:
      "A returns policy has not been approved yet. The Returns page is a placeholder until the owner publishes final terms.",
    requiresOwnerReview: true,
  },
];
