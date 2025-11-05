import { useState, useEffect } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        const data = await res.json();
            console.log(data)
        
        if (data.valid) {
          setUser(data.user);
          setPermissions(data.user.permissions || []);
        }
      } catch (error) {
        console.log('Auth verification failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions = []) => {
    if (!requiredPermissions.length) return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions = []) => {
    if (!requiredPermissions.length) return true;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    isAuthenticated: !!user
  };
}