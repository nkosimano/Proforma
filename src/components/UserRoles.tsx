import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Settings } from 'lucide-react';
import { userRoleService, type RoleWithPermissions, type Permission } from '../services/userRoleService';
import type { UserRole } from '../types/database';
import { toast } from 'sonner';

interface UserRolesProps {
  className?: string;
}

const UserRoles: React.FC<UserRolesProps> = ({ className = '' }) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await userRoleService.getUserRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const success = await userRoleService.deleteRole(roleId);
      if (success) {
        toast.success('Role deleted successfully');
        loadRoles();
      } else {
        toast.error('Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleViewRole = (role: UserRole) => {
    const roleWithPermissions = userRoleService.getRoleWithPermissions(role);
    setSelectedRole(roleWithPermissions);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Roles &amp; Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => {
          const roleWithPermissions = userRoleService.getRoleWithPermissions(role);
          return (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    role.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">
                      {roleWithPermissions.permissions.length} permissions
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewRole(role)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View Details"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Role"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  role.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {role.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-500">
                  Updated {new Date(role.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-600 mb-4">Create your first user role to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Role
          </button>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {(showCreateModal || editingRole) && (
        <CreateEditRoleModal
          role={editingRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingRole(null);
            loadRoles();
          }}
        />
      )}

      {/* Role Details Modal */}
      {selectedRole && (
        <RoleDetailsModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
};

// Create/Edit Role Modal Component
interface CreateEditRoleModalProps {
  role?: UserRole | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEditRoleModal: React.FC<CreateEditRoleModalProps> = ({ role, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || [],
    is_active: role?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const availablePermissions = userRoleService.getPermissionsByCategory();
  const predefinedRoles = userRoleService.getPredefinedRoles();

  const handleTemplateSelect = (templateName: string) => {
    const template = predefinedRoles.find(r => r.name === templateName);
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        permissions: template.permissions,
        is_active: true
      });
      setSelectedTemplate(templateName);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setLoading(true);
      let success = false;

      if (role) {
        // Update existing role
        success = await userRoleService.updateRole(role.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          is_active: formData.is_active
        });
      } else {
        // Create new role
        const newRole = await userRoleService.createRole(
          formData.name,
          formData.description,
          formData.permissions
        );
        success = newRole !== null;
      }

      if (success) {
        toast.success(`Role ${role ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        toast.error(`Failed to ${role ? 'update' : 'create'} role`);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(`Failed to ${role ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Template Selection (only for new roles) */}
          {!role && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start from template (optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Custom role</option>
                {predefinedRoles.map(template => (
                  <option key={template.name} value={template.name}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions ({formData.permissions.length} selected)
            </label>
            <div className="space-y-4">
              {Object.entries(availablePermissions).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Details Modal Component
interface RoleDetailsModalProps {
  role: RoleWithPermissions;
  onClose: () => void;
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({ role, onClose }) => {
  const permissionsByCategory = role.permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{role.name}</h2>
              <p className="text-gray-600 mt-1">{role.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Permissions ({role.permissions.length})
            </h3>
            
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Shield className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoles;