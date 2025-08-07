import React from 'react';
import { usePermissions } from './usePermissions';

// Hook for conditional rendering
export const useConditionalRender = () => {
  const permissions = usePermissions();

  const renderIf = (
    condition: boolean,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return condition ? component : (fallback || null);
  };

  const renderIfPermission = (
    resource: string,
    action: string,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(
      permissions.hasPermission(resource, action),
      component,
      fallback
    );
  };

  const renderIfRole = (
    allowedRoles: string[],
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(
      permissions.userRole ? allowedRoles.includes(permissions.userRole) : false,
      component,
      fallback
    );
  };

  const renderIfAdmin = (
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIfRole(['admin'], component, fallback);
  };

  const renderIfManager = (
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIfRole(['admin', 'manager'], component, fallback);
  };

  return {
    renderIf,
    renderIfPermission,
    renderIfRole,
    renderIfAdmin,
    renderIfManager,
    ...permissions,
  };
};