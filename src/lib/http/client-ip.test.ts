import { describe, expect, it } from "vitest";
import { clientIp } from "@/lib/http/client-ip";

describe("clientIp", () => {
  it("uses the leftmost forwarded address and ignores extras", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("does not treat a spoofed full chain as a unique bucket", () => {
    const a = clientIp(new Headers({ "x-forwarded-for": "8.8.8.8, 9.9.9.9" }));
    const b = clientIp(new Headers({ "x-forwarded-for": "8.8.8.8, 1.1.1.1" }));
    expect(a).toBe("8.8.8.8");
    expect(b).toBe("8.8.8.8");
  });
});
