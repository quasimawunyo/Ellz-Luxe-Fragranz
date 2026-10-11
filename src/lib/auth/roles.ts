export const USER_ROLES = ["customer", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isAdminRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdminRole(role: string | null | undefined) {
  return role === "super_admin";
}

export function canAccessAdmin(role: string | null | undefined) {
  return isAdminRole(role);
}

export function canAccessSuperAdmin(role: string | null | undefined) {
  return isSuperAdminRole(role);
}

export function roleLabel(role: UserRole) {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  return "Customer";
}

export function canAssignRole(params: {
  actorId: string;
  actorRole: string | null | undefined;
  targetId: string;
  currentRole: UserRole;
  nextRole: UserRole;
  superAdminCount: number;
}): { ok: true } | { ok: false; error: string } {
  if (!isSuperAdminRole(params.actorRole)) {
    return { ok: false, error: "Only a super admin can change roles." };
  }
  if (params.targetId === params.actorId && params.nextRole !== "super_admin") {
    return { ok: false, error: "You cannot remove your own super admin access." };
  }
  if (params.currentRole === "super_admin" && params.nextRole !== "super_admin" && params.superAdminCount <= 1) {
    return { ok: false, error: "Keep at least one super admin." };
  }
  return { ok: true };
}

export function canViewOrder(params: {
  orderUserId: string | null;
  orderGuestEmail: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
}) {
  if (isAdminRole(params.actorRole)) return true;
  if (params.actorUserId && params.orderUserId === params.actorUserId) {
    return true;
  }
  if (
    !params.orderUserId &&
    params.actorEmail &&
    params.actorEmail.toLowerCase() === params.orderGuestEmail.toLowerCase()
  ) {
    return false;
  }
  return false;
}
