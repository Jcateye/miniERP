export function hasAllRequiredPermissions(
  grantedPermissions: readonly string[],
  requiredPermissions: readonly string[],
): boolean {
  const grantedSet = new Set(
    grantedPermissions.map((permission) => permission.trim()).filter(Boolean),
  );

  return requiredPermissions.every((requiredPermission) => {
    if (grantedSet.has(requiredPermission)) {
      return true;
    }

    const segments = requiredPermission.split(':');
    if (segments.length <= 1) {
      return false;
    }

    const wildcardPrefix = `${segments[0]}:*`;
    return grantedSet.has(wildcardPrefix);
  });
}
