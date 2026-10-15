import { describe, expect, it } from "vitest";
import { readSignedJson, readSignedPayload, signJson, signPayload } from "@/lib/cookies/signed-payload";

describe("signed payloads", () => {
  const secret = "test-cookie-secret";

  it("round-trips a payload", () => {
    const raw = signPayload("order-id", secret);
    expect(readSignedPayload(raw, secret)).toBe("order-id");
  });

  it("rejects a forged JSON array of order ids", () => {
    const forged = JSON.stringify(["aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"]);
    expect(readSignedJson<string[]>(forged, secret)).toBeNull();
    expect(readSignedPayload(forged, secret)).toBeNull();
  });

  it("rejects a tampered mac", () => {
    const raw = signJson(["abc"], secret);
    expect(readSignedJson<string[]>(`${raw}x`, secret)).toBeNull();
  });

  it("rejects the wrong secret", () => {
    const raw = signJson(["abc"], secret);
    expect(readSignedJson<string[]>(raw, "other-secret")).toBeNull();
  });
});
