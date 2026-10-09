import { describe, expect, it } from "vitest";
import { canAccessAdmin, canViewOrder, isAdminRole } from "@/lib/auth/roles";

describe("authorization", () => {
  it("does not treat customers as admins", () => {
    expect(isAdminRole("customer")).toBe(false);
    expect(canAccessAdmin("customer")).toBe(false);
    expect(canAccessAdmin("admin")).toBe(true);
  });

  it("lets customers view only their orders", () => {
    expect(
      canViewOrder({
        orderUserId: "user-1",
        orderGuestEmail: "a@example.com",
        actorUserId: "user-1",
        actorEmail: "a@example.com",
        actorRole: "customer",
      }),
    ).toBe(true);
    expect(
      canViewOrder({
        orderUserId: "user-1",
        orderGuestEmail: "a@example.com",
        actorUserId: "user-2",
        actorEmail: "b@example.com",
        actorRole: "customer",
      }),
    ).toBe(false);
  });

  it("does not expose guest orders by email match alone", () => {
    expect(
      canViewOrder({
        orderUserId: null,
        orderGuestEmail: "guest@example.com",
        actorUserId: "user-2",
        actorEmail: "guest@example.com",
        actorRole: "customer",
      }),
    ).toBe(false);
  });
});
