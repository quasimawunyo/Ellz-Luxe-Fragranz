import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EllzLuxe Fragranz",
    short_name: "EllzLuxe",
    description: "Perfume boutique at Ells Luxe Annex, Pantang.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fcfbf8",
    theme_color: "#1c7a48",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
