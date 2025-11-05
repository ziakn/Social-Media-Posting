import { usePermissions } from '@/hooks/usePermissions';

// Component wrapper - hides content if no permission
export function PermissionGuard({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true; // No permissions required
  }

  return hasAccess ? children : fallback;
}

// Button with permission check
export function PermissionButton({ 
  permission, 
  permissions = [],
  requireAll = false,
  onClick,
  children,
  ...props 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) return null;

  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
}

// Link with permission check
export function PermissionLink({ 
  permission, 
  permissions = [],
  requireAll = false,
  href,
  children,
  ...props 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) return null;

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}