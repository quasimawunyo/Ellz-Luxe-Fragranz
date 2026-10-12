export type HouseBrand = {
  slug: string;
  name: string;
  logo: string;
};

export const HOUSE_BRANDS: HouseBrand[] = [
  { slug: "amaran", name: "Amaran", logo: "/images/brands/amaran.png?v=ivory2" },
  { slug: "armaf", name: "Armaf", logo: "/images/brands/armaf.png?v=ivory2" },
  { slug: "fragrance-world", name: "Fragrance World", logo: "/images/brands/fragrance-world.png?v=ivory2" },
  { slug: "giorgio-armani", name: "Giorgio Armani", logo: "/images/brands/giorgio-armani.png?v=ivory2" },
  { slug: "khadlaj", name: "Khadlaj", logo: "/images/brands/khadlaj.png?v=ivory2" },
  { slug: "laffair", name: "L'affair", logo: "/images/brands/laffair.png?v=ivory2" },
  { slug: "lattafa", name: "Lattafa", logo: "/images/brands/lattafa.png?v=ivory2" },
  { slug: "maison-alhambra", name: "Maison Alhambra", logo: "/images/brands/maison-alhambra.png?v=ivory2" },
  { slug: "parfum-de-mirage", name: "Parfum De Mirage", logo: "/images/brands/parfum-de-mirage.png?v=ivory2" },
  { slug: "versace", name: "Versace", logo: "/images/brands/versace.png?v=ivory2" },
];

export function getHouseBrand(slugOrName: string | undefined) {
  if (!slugOrName) return undefined;
  const needle = slugOrName.trim().toLowerCase();
  return HOUSE_BRANDS.find(
    (brand) => brand.slug === needle || brand.name.toLowerCase() === needle,
  );
}

export function brandMatches(productBrand: string, slugOrName: string) {
  const house = getHouseBrand(slugOrName);
  if (house) return productBrand.toLowerCase() === house.name.toLowerCase();
  return productBrand.toLowerCase() === slugOrName.trim().toLowerCase();
}
