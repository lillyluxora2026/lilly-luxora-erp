export const ERP_FEATURES = {
  pos: false,
  suppliers: false,
  purchaseOrders: false,
  finance: false,
  preorders: false,
  users: false,
  inventory: true,
  coupons: true,
  banners: true,
  settings: true,
} as const;

const DISABLED_ADMIN_ROUTE_PREFIXES = [
  !ERP_FEATURES.pos ? '/admin/pos' : null,
  !ERP_FEATURES.suppliers ? '/admin/suppliers' : null,
  !ERP_FEATURES.purchaseOrders ? '/admin/purchase-orders' : null,
  !ERP_FEATURES.finance ? '/admin/finance' : null,
  !ERP_FEATURES.preorders ? '/admin/preorders' : null,
  !ERP_FEATURES.users ? '/admin/users' : null,
].filter((prefix): prefix is string => Boolean(prefix));

export function isAdminRouteEnabled(pathname: string): boolean {
  return !DISABLED_ADMIN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

