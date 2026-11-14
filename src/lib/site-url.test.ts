import { describe, expect, it } from "vitest";
import { canonicalRedirect, resolveSiteUrl } from "@/lib/site-url";

describe("resolveSiteUrl", () => {
  it("uses the real domain when Vercel would otherwise publish the vercel.app host", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        VERCEL_PROJECT_PRODUCTION_URL: "ellz-luxe-fragranz.vercel.app",
      }),
    ).toBe("https://ellzluxefragranz.com");
  });

  it("replaces an explicit vercel.app site URL with the real domain", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://ellz-luxe-fragranz.vercel.app/",
      }),
    ).toBe("https://ellzluxefragranz.com");
  });

  it("keeps the real domain when it is set explicitly", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://ellzluxefragranz.com/",
      }),
    ).toBe("https://ellzluxefragranz.com");
  });
});

describe("canonicalRedirect", () => {
  it("sends the Vercel host and www to the apex domain", () => {
    expect(canonicalRedirect("ellz-luxe-fragranz.vercel.app", "/shop?q=yara")).toBe(
      "https://ellzluxefragranz.com/shop?q=yara",
    );
    expect(canonicalRedirect("www.ellzluxefragranz.com", "/")).toBe("https://ellzluxefragranz.com/");
  });

  it("leaves the real domain and preview hosts alone", () => {
    expect(canonicalRedirect("ellzluxefragranz.com", "/shop")).toBeNull();
    expect(canonicalRedirect("ellz-luxe-fragranz-git-preview.vercel.app", "/shop")).toBeNull();
  });
});
