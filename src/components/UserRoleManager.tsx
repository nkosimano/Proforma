import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Eye, EyeOff, Save } from 'lucide-react';
import { userRoleService, type RoleWithPermissions } from '../services/userRoleService';
import type { UserRole } from '../types/database';

export default function UserRoleManager() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await userRoleService.getUserRoles();
      setRoles(data);
      
      // Initialize default roles if none exist
      if (data.length === 0) {
        await userRoleService.initializeDefaultRoles();
        const newData = await userRoleService.getUserRoles();
        setRoles(newData);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    setProcessing(roleId);
    try {
      const success = await userRoleService.updateRole(roleId, { is_active: !isActive });
      if (success) {
        await loadRoles();
      }
    } catch (error) {
      console.error('Error toggling role:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    setProcessing(roleId);
    try {
      const success = await userRoleService.deleteRole(roleId);
      if (success) {
        await loadRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleEditRole = (role: UserRole) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const getRoleWithPermissions = (role: UserRole): RoleWithPermissions => {
    return userRoleService.getRoleWithPermissions(role);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Roles & Permissions</h1>
              <p className="mt-2 text-gray-600">Manage user roles and their permissions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Role
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{roles.length}</h3>
                <p className="text-gray-600">Total Roles</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {roles.filter(r => r.is_active).length}
                </h3>
                <p className="text-gray-600">Active Roles</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {userRoleService.getAvailablePermissions().length}
                </h3>
                <p className="text-gray-600">Available Permissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Roles</h2>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles configured</h3>
              <p className="text-gray-600 mb-4">Create your first role to get started with user management.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Role
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {roles.map((role) => {
                const roleWithPermissions = getRoleWithPermissions(role);
                return (
                  <div key={role.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {role.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Permissions ({roleWithPermissions.permissions.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {roleWithPermissions.permissions.slice(0, 5).map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {permission.name}
                              </span>
                            ))}
                            {roleWithPermissions.permissions.length > 5 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{roleWithPermissions.permissions.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleRole(role.id, role.is_active)}
                          disabled={processing === role.id}
                          className={`p-2 rounded-lg transition-colors ${
                            role.is_active
                              ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                          }`}
                          title={role.is_active ? 'Deactivate Role' : 'Activate Role'}
                        >
                          {role.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          disabled={processing === role.id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Role Modal */}
        {showCreateModal && (
          <CreateRoleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadRoles();
            }}
          />
        )}

        {/* Edit Role Modal */}
        {showEditModal && selectedRole && (
          <EditRoleModal
            isOpen={showEditModal}
            role={selectedRole}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedRole(null);
              loadRoles();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Create Role Modal Component
interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const permissionsByCategory = userRoleService.getPermissionsByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await userRoleService.createRole(name.trim(), description.trim(), selectedPermissions);
      if (result) {
        onSuccess();
      } else {
        setError('Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Role</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              type="text"
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the role and its purpose"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions ({selectedPermissions.length} selected)
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-1 ml-4">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-2">
                          <span className="text-sm text-gray-900">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserRoleManager;

// Edit Role Modal Component
interface EditRoleModalProps {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onSuccess: () => void;
}

function EditRoleModal({ isOpen, role, onClose, onSuccess }: EditRoleModalProps) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const permissionsByCategory = userRoleService.getPermissionsByCategory();

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await userRoleService.updateRole(role.id, {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions
      });
      
      if (success) {
        onSuccess();
      } else {
        setError('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Role</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the role and its purpose"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions ({selectedPermissions.length} selected)
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-1 ml-4">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-2">
                          <span className="text-sm text-gray-900">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}