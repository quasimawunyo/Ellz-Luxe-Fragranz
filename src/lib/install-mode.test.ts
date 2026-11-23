import { describe, expect, it } from "vitest";
import { installSurface, readInstallBrowser } from "@/lib/install-mode";

describe("readInstallBrowser", () => {
  it("treats an iPhone as iOS, not desktop Safari", () => {
    expect(
      readInstallBrowser({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toMatchObject({ ios: true, desktopSafari: false, inApp: false });
  });

  it("treats desktop Safari as the Dock path", () => {
    expect(
      readInstallBrowser({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 0,
      }),
    ).toMatchObject({ ios: false, desktopSafari: true, inApp: false });
  });

  it("does not treat desktop Chrome as a phone share sheet", () => {
    expect(
      readInstallBrowser({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        platform: "MacIntel",
        maxTouchPoints: 0,
      }),
    ).toMatchObject({ ios: false, desktopSafari: false, inApp: false });
  });

  it("notices an in-app browser", () => {
    expect(
      readInstallBrowser({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) WhatsApp/2.24",
        platform: "iPhone",
        maxTouchPoints: 5,
      }).inApp,
    ).toBe(true);
  });
});

describe("installSurface", () => {
  it("uses the browser install prompt whenever the browser offers one", () => {
    expect(installSurface({ canPrompt: true, ios: false, desktopSafari: false, inApp: false })).toBe("prompt");
    expect(installSurface({ canPrompt: true, ios: true, desktopSafari: false, inApp: false })).toBe("prompt");
  });

  it("opens the share sheet on iPhone when the browser cannot install itself", () => {
    expect(installSurface({ canPrompt: false, ios: true, desktopSafari: false, inApp: false })).toBe("ios-share");
  });

  it("stays quiet on a desktop browser that has no install prompt", () => {
    expect(installSurface({ canPrompt: false, ios: false, desktopSafari: false, inApp: false })).toBe("none");
  });

  it("tells desktop Safari to use Add to Dock", () => {
    expect(installSurface({ canPrompt: false, ios: false, desktopSafari: true, inApp: false })).toBe("desktop-safari");
  });

  it("does not pretend an in-app browser can add the shop", () => {
    expect(installSurface({ canPrompt: false, ios: true, desktopSafari: false, inApp: true })).toBe("in-app");
  });
});
