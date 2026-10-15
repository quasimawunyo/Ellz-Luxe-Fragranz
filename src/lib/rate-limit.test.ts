import { describe, expect, it } from "vitest";
import { rateLimitMemory } from "@/lib/rate-limit-memory";

describe("rateLimitMemory", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimitMemory(key, 2, 60_000).ok).toBe(true);
    expect(rateLimitMemory(key, 2, 60_000).ok).toBe(true);
    expect(rateLimitMemory(key, 2, 60_000).ok).toBe(false);
  });
});
