import { supabase } from '../lib/supabase';
import type { UserRole } from '../types/database';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RoleWithPermissions extends UserRole {
  permissions: Permission[];
}

class UserRoleService {
  // Predefined permissions for the system
  private readonly SYSTEM_PERMISSIONS: Permission[] = [
    // Invoice Management
    { id: 'invoice:create', name: 'Create Invoices', description: 'Create new invoices', category: 'Invoices' },
    { id: 'invoice:read', name: 'View Invoices', description: 'View invoice details', category: 'Invoices' },
    { id: 'invoice:update', name: 'Edit Invoices', description: 'Edit existing invoices', category: 'Invoices' },
    { id: 'invoice:delete', name: 'Delete Invoices', description: 'Delete invoices', category: 'Invoices' },
    { id: 'invoice:send', name: 'Send Invoices', description: 'Send invoices to clients', category: 'Invoices' },
    
    // Quote Management
    { id: 'quote:create', name: 'Create Quotes', description: 'Create new quotes', category: 'Quotes' },
    { id: 'quote:read', name: 'View Quotes', description: 'View quote details', category: 'Quotes' },
    { id: 'quote:update', name: 'Edit Quotes', description: 'Edit existing quotes', category: 'Quotes' },
    { id: 'quote:delete', name: 'Delete Quotes', description: 'Delete quotes', category: 'Quotes' },
    { id: 'quote:convert', name: 'Convert Quotes', description: 'Convert quotes to invoices', category: 'Quotes' },
    
    // Customer Management
    { id: 'customer:create', name: 'Create Customers', description: 'Add new customers', category: 'Customers' },
    { id: 'customer:read', name: 'View Customers', description: 'View customer details', category: 'Customers' },
    { id: 'customer:update', name: 'Edit Customers', description: 'Edit customer information', category: 'Customers' },
    { id: 'customer:delete', name: 'Delete Customers', description: 'Delete customers', category: 'Customers' },
    
    // Payment Management
    { id: 'payment:create', name: 'Record Payments', description: 'Record payment transactions', category: 'Payments' },
    { id: 'payment:read', name: 'View Payments', description: 'View payment history', category: 'Payments' },
    { id: 'payment:update', name: 'Edit Payments', description: 'Edit payment records', category: 'Payments' },
    { id: 'payment:delete', name: 'Delete Payments', description: 'Delete payment records', category: 'Payments' },
    
    // Recurring Invoices
    { id: 'recurring:create', name: 'Create Recurring Invoices', description: 'Set up recurring invoices', category: 'Recurring' },
    { id: 'recurring:read', name: 'View Recurring Invoices', description: 'View recurring invoice schedules', category: 'Recurring' },
    { id: 'recurring:update', name: 'Edit Recurring Invoices', description: 'Edit recurring invoice settings', category: 'Recurring' },
    { id: 'recurring:delete', name: 'Delete Recurring Invoices', description: 'Delete recurring invoice schedules', category: 'Recurring' },
    
    // Currency Management
    { id: 'currency:manage', name: 'Manage Currencies', description: 'Add, edit, and remove currencies', category: 'Settings' },
    { id: 'currency:rates', name: 'Update Exchange Rates', description: 'Update currency exchange rates', category: 'Settings' },
    
    // Reports and Analytics
    { id: 'reports:view', name: 'View Reports', description: 'Access reports and analytics', category: 'Reports' },
    { id: 'reports:export', name: 'Export Reports', description: 'Export reports to various formats', category: 'Reports' },
    
    // System Administration
    { id: 'admin:users', name: 'Manage Users', description: 'Add, edit, and remove users', category: 'Administration' },
    { id: 'admin:roles', name: 'Manage Roles', description: 'Create and edit user roles', category: 'Administration' },
    { id: 'admin:settings', name: 'System Settings', description: 'Configure system settings', category: 'Administration' },
    { id: 'admin:backup', name: 'Data Backup', description: 'Backup and restore data', category: 'Administration' },
  ];

  // Predefined roles with their permissions
  private readonly PREDEFINED_ROLES = [
    {
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: this.SYSTEM_PERMISSIONS.map(p => p.id)
    },
    {
      name: 'Manager',
      description: 'Management access with most permissions except system administration',
      permissions: this.SYSTEM_PERMISSIONS
        .filter(p => !p.category.includes('Administration'))
        .map(p => p.id)
    },
    {
      name: 'Accountant',
      description: 'Financial operations access',
      permissions: [
        'invoice:create', 'invoice:read', 'invoice:update', 'invoice:send',
        'quote:create', 'quote:read', 'quote:update', 'quote:convert',
        'customer:read', 'customer:update',
        'payment:create', 'payment:read', 'payment:update',
        'recurring:create', 'recurring:read', 'recurring:update',
        'currency:manage', 'currency:rates',
        'reports:view', 'reports:export'
      ]
    },
    {
      name: 'Sales Representative',
      description: 'Sales-focused access for quotes and customer management',
      permissions: [
        'quote:create', 'quote:read', 'quote:update', 'quote:convert',
        'customer:create', 'customer:read', 'customer:update',
        'invoice:read',
        'reports:view'
      ]
    },
    {
      name: 'Viewer',
      description: 'Read-only access to most data',
      permissions: [
        'invoice:read', 'quote:read', 'customer:read', 'payment:read',
        'recurring:read', 'reports:view'
      ]
    }
  ];

  /**
   * Get all user roles for the current user's organization
   */
  async getUserRoles(): Promise<UserRole[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      return [];
    }
  }

  /**
   * Create a new user role
   */
  async createRole(name: string, description: string, permissions: string[]): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          name,
          description,
          permissions,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating role:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createRole:', error);
      return null;
    }
  }

  /**
   * Update an existing user role
   */
  async updateRole(roleId: string, updates: Partial<Pick<UserRole, 'name' | 'description' | 'permissions' | 'is_active'>>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_roles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating role:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateRole:', error);
      return false;
    }
  }

  /**
   * Delete a user role
   */
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting role:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRole:', error);
      return false;
    }
  }

  /**
   * Get all available permissions
   */
  getAvailablePermissions(): Permission[] {
    return this.SYSTEM_PERMISSIONS;
  }

  /**
   * Get permissions grouped by category
   */
  getPermissionsByCategory(): Record<string, Permission[]> {
    return this.SYSTEM_PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles();
      const activeRoles = roles.filter(role => role.is_active);
      
      return activeRoles.some(role => 
        role.permissions && role.permissions.includes(permission)
      );
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get all permissions for the current user
   */
  async getUserPermissions(): Promise<string[]> {
    try {
      const roles = await this.getUserRoles();
      const activeRoles = roles.filter(role => role.is_active);
      
      const permissions = new Set<string>();
      activeRoles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => permissions.add(permission));
        }
      });
      
      return Array.from(permissions);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Initialize default roles for new users
   */
  async initializeDefaultRoles(): Promise<boolean> {
    try {
      const existingRoles = await this.getUserRoles();
      
      if (existingRoles.length > 0) {
        return true; // Already initialized
      }

      // Create Administrator role by default for the first user
      const adminRole = this.PREDEFINED_ROLES[0];
      const result = await this.createRole(
        adminRole.name,
        adminRole.description,
        adminRole.permissions
      );

      return result !== null;
    } catch (error) {
      console.error('Error initializing default roles:', error);
      return false;
    }
  }

  /**
   * Get predefined role templates
   */
  getPredefinedRoles() {
    return this.PREDEFINED_ROLES;
  }

  /**
   * Create a role from a predefined template
   */
  async createRoleFromTemplate(templateName: string): Promise<UserRole | null> {
    const template = this.PREDEFINED_ROLES.find(role => role.name === templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.createRole(template.name, template.description, template.permissions);
  }

  /**
   * Get role with its permissions details
   */
  getRoleWithPermissions(role: UserRole): RoleWithPermissions {
    const permissions = (role.permissions || []).map(permissionId => 
      this.SYSTEM_PERMISSIONS.find(p => p.id === permissionId)
    ).filter(Boolean) as Permission[];

    return {
      ...role,
      permissions
    };
  }
}

export const userRoleService = new UserRoleService();
export default userRoleService;