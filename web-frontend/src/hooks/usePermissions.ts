import { useState, useEffect } from 'react';
import { permissionsService, RolePermissions, Module } from '@/services/permissions';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load permissions and modules
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [permissionsData, modulesData] = await Promise.all([
        permissionsService.getAllPermissions(),
        permissionsService.getModules()
      ]);
      
      setPermissions(permissionsData);
      setModules(modulesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  // Update permissions for a role
  const updatePermissions = async (role: string, newPermissions: { [module: string]: boolean }) => {
    try {
      console.log('updatePermissions - role:', role);
      console.log('updatePermissions - newPermissions:', newPermissions);
      setLoading(true);
      setError(null);
      
      await permissionsService.updatePermissions(role, newPermissions);
      console.log('updatePermissions - Success!');
      
      // Update local state
      setPermissions(prev => ({
        ...prev,
        [role]: newPermissions
      }));
    } catch (err: any) {
      console.error('updatePermissions - Error:', err);
      setError(err.message || 'Error al actualizar permisos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has access to a module
  const hasAccess = async (module: string): Promise<boolean> => {
    try {
      return await permissionsService.checkAccess(module);
    } catch (err) {
      console.error('Error checking access:', err);
      return false;
    }
  };

  // Get permissions for a specific role
  const getRolePermissions = (role: string) => {
    return permissions[role] || {};
  };

  // Get all available roles
  const getRoles = () => {
    return Object.keys(permissions);
  };

  // Check if current user has access to a module (synchronous check)
  const hasAccessSync = (module: string): boolean => {
    if (!user) return false;
    const rolePermissions = getRolePermissions(user.role);
    return rolePermissions[module] || false;
  };

  useEffect(() => {
    console.log('usePermissions - user:', user);
    console.log('usePermissions - user role:', user?.role);
    if (user?.role === 'admin') {
      console.log('usePermissions - Loading data for admin user');
      loadData();
    } else {
      console.log('usePermissions - User is not admin, not loading data');
    }
  }, [user]);

  return {
    permissions,
    modules,
    loading,
    error,
    updatePermissions,
    hasAccess,
    hasAccessSync,
    getRolePermissions,
    getRoles,
    loadData
  };
};
