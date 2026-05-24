const STAFF_ROLES = ['admin', 'moderator', 'tn_admin', 'operator'] as const;

export function normalizeRole(role: string): string {
  if (role === 'solo_traveler') return 'user';
  return role;
}

export function getPostLoginPath(roles?: string[], role?: string): string {
  const list = roles?.length ? roles : role ? [role] : [];
  const normalized = list.map(normalizeRole);
  if (normalized.some((r) => STAFF_ROLES.includes(r as (typeof STAFF_ROLES)[number]))) {
    return '/dashboard';
  }
  return '/user';
}

export function isStaffRole(roles?: string[], role?: string): boolean {
  return getPostLoginPath(roles, role) === '/dashboard';
}
