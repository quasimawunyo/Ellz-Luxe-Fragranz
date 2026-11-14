import { describe, expect, it } from "vitest";
import { periodChange, previousCompare, salesPreset } from "@/lib/admin/summary-format";

describe("sales summary labels", () => {
  it("defaults the range to the last 7 days", () => {
    expect(salesPreset(undefined)).toBe("7d");
    expect(salesPreset("today")).toBe("today");
    expect(salesPreset("year")).toBe("7d");
  });

  it("compares a period with the one before it", () => {
    expect(periodChange(15000, 10000)).toEqual({ direction: "up", percent: 50 });
    expect(periodChange(5000, 10000)).toEqual({ direction: "down", percent: 50 });
    expect(periodChange(0, 0)).toEqual({ direction: "flat", percent: 0 });
    expect(periodChange(64000, 0)).toEqual({ direction: "new", percent: null });
  });

  it("says when the previous Accra stretch has nothing to compare", () => {
    expect(previousCompare("7d", 0, 0)).toBe("No previous last 7 Accra days to compare");
    expect(previousCompare("7d", 64000, 0)).toBe("No previous last 7 Accra days to compare");
  });
});
