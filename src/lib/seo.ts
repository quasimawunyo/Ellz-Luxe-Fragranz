import type { Metadata } from "next";

const SHARE_IMAGE = "/images/story.jpg";

export function pageMetadata(input: {
  title?: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const image = input.image ?? SHARE_IMAGE;
  const metadata: Metadata = {
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title ?? "EllzLuxe Fragranz",
      description: input.description,
      url: input.path,
      images: [{ url: image, alt: "Perfume bottles at EllzLuxe Fragranz" }],
    },
  };
  if (input.title) metadata.title = input.title;
  if (input.index === false) metadata.robots = { index: false, follow: true };
  return metadata;
}
