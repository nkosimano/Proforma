import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Shield, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

// Permission-based guard
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  fallback,
  showFallback = true,
}) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allowed = hasPermission(resource, action);

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showFallback) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-500">
              You don't have permission to {action} {resource}.
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Role-based guard
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  showFallback = true,
}) => {
  const { userRole, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allowed = userRole && allowedRoles.includes(userRole);

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showFallback) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Role Required
            </h3>
            <p className="text-gray-500">
              This feature requires one of the following roles: {allowedRoles.join(', ')}.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Your current role: {userRole || 'None'}
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Admin-only guard
export const AdminGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => {
  return <RoleGuard {...props} allowedRoles={['admin']} />;
};

// Manager and above guard
export const ManagerGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => {
  return <RoleGuard {...props} allowedRoles={['admin', 'manager']} />;
};

export default PermissionGuard;