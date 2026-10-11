import { describe, expect, it } from "vitest";
import { canAccessAdmin, canAccessSuperAdmin, canAssignRole, canViewOrder, isAdminRole } from "@/lib/auth/roles";

describe("authorization", () => {
  it("does not treat customers as admins", () => {
    expect(isAdminRole("customer")).toBe(false);
    expect(canAccessAdmin("customer")).toBe(false);
    expect(canAccessAdmin("admin")).toBe(true);
    expect(canAccessAdmin("super_admin")).toBe(true);
    expect(canAccessSuperAdmin("admin")).toBe(false);
    expect(canAccessSuperAdmin("super_admin")).toBe(true);
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

  it("lets a super admin view any order", () => {
    expect(
      canViewOrder({
        orderUserId: "user-1",
        orderGuestEmail: "a@example.com",
        actorUserId: "boss",
        actorEmail: "boss@example.com",
        actorRole: "super_admin",
      }),
    ).toBe(true);
  });

  it("blocks removing the last super admin", () => {
    expect(
      canAssignRole({
        actorId: "boss",
        actorRole: "super_admin",
        targetId: "boss",
        currentRole: "super_admin",
        nextRole: "admin",
        superAdminCount: 1,
      }),
    ).toEqual({ ok: false, error: "You cannot remove your own super admin access." });
    expect(
      canAssignRole({
        actorId: "boss",
        actorRole: "super_admin",
        targetId: "other",
        currentRole: "super_admin",
        nextRole: "admin",
        superAdminCount: 1,
      }),
    ).toEqual({ ok: false, error: "Keep at least one super admin." });
    expect(
      canAssignRole({
        actorId: "boss",
        actorRole: "super_admin",
        targetId: "staff",
        currentRole: "customer",
        nextRole: "admin",
        superAdminCount: 1,
      }).ok,
    ).toBe(true);
  });
});
