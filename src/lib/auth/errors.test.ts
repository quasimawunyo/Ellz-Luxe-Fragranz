import { describe, expect, it } from "vitest";
import { publicAuthError } from "@/lib/auth/errors";

describe("publicAuthError", () => {
  it("explains a leaked password without repeating the vendor message", () => {
    expect(publicAuthError("Password is known to be leaked and exists in HaveIBeenPwned.")).toBe(
      "That password has appeared in a public leak. Choose a different one with at least 8 characters.",
    );
  });

  it("keeps ordinary auth errors", () => {
    expect(publicAuthError("Invalid login credentials")).toBe("Invalid login credentials");
  });
});
