import { useState, useEffect } from 'react';
import { userRoleService, type Permission } from '../services/userRoleService';
import { supabase } from '../lib/supabase';

interface UsePermissionsReturn {
  permissions: Permission[];
  userRole: string | null;
  loading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canCreate: (resource: string) => boolean;
  canRead: (resource: string) => boolean;
  canUpdate: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  canManage: (resource: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  refreshPermissions: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadPermissions(user.id);
      } else {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        await loadPermissions(session.user.id);
      } else {
        setUserId(null);
        setPermissions([]);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPermissions = async (currentUserId: string) => {
    setLoading(true);
    try {
      const userRoleData = await userRoleService.getUserRole(currentUserId);
      
      if (userRoleData) {
        setUserRole(userRoleData.role);
        setPermissions(userRoleData.permissions as Permission[]);
      } else {
        // If no role found, assign default 'user' role
        const defaultRole = await userRoleService.setUserRole(currentUserId, 'user');
        if (defaultRole) {
          setUserRole(defaultRole.role);
          setPermissions(defaultRole.permissions as Permission[]);
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = async () => {
    if (userId) {
      await loadPermissions(userId);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    const permission = permissions.find(
      p => p.resource === resource && p.action === action
    );
    return permission?.allowed || false;
  };

  const canCreate = (resource: string): boolean => {
    return hasPermission(resource, 'create');
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(resource, 'read');
  };

  const canUpdate = (resource: string): boolean => {
    return hasPermission(resource, 'update');
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(resource, 'delete');
  };

  const canManage = (resource: string): boolean => {
    return hasPermission(resource, 'manage');
  };

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager' || isAdmin;

  return {
    permissions,
    userRole,
    loading,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    isAdmin,
    isManager,
    refreshPermissions,
  };
};

export default usePermissions;