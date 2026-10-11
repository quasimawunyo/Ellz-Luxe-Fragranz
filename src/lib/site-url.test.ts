import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/site-url";

describe("resolveSiteUrl", () => {
  it("prefers a public production URL over localhost", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        VERCEL_PROJECT_PRODUCTION_URL: "ellz-luxe-fragranz.vercel.app",
      }),
    ).toBe("https://ellz-luxe-fragranz.vercel.app");
  });

  it("keeps an explicit non-local site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://ellz-luxe-fragranz.vercel.app/",
      }),
    ).toBe("https://ellz-luxe-fragranz.vercel.app");
  });
});
