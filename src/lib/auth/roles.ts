export type UserRole = "customer" | "admin";

export function isAdminRole(role: string | null | undefined) {
  return role === "admin";
}

export function canAccessAdmin(role: string | null | undefined) {
  return isAdminRole(role);
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
