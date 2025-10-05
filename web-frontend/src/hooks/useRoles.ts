import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModulePermission {
  has_access: boolean;
  mobile_dashboard_visible: boolean;
}

export interface RolePermissions {
  [module: string]: ModulePermission;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        setError(response.error || 'Error al cargar roles');
      }
    } catch (err: any) {
      setError(err.message || 'Error de red al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at' | 'is_system' | 'active'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createRole(roleData);
      if (response.success) {
        fetchRoles(); // Refresh list
        return { success: true, message: response.message, data: response.data };
      } else {
        // Handle validation errors array or single error message
        const responseWithErrors = response as any;
        const errorMsg = responseWithErrors.errors 
          ? responseWithErrors.errors.map((e: any) => e.msg).join(', ')
          : (response.error || response.message || 'Error al crear rol');
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      setError(err.message || 'Error de red al crear rol');
      return { success: false, message: err.message || 'Error de red al crear rol' };
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: number, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at' | 'is_system' | 'name'>>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateRole(id, roleData);
      if (response.success) {
        fetchRoles(); // Refresh list
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.error || 'Error al actualizar rol');
        return { success: false, message: response.error || 'Error al actualizar rol' };
      }
    } catch (err: any) {
      setError(err.message || 'Error de red al actualizar rol');
      return { success: false, message: err.message || 'Error de red al actualizar rol' };
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.deleteRole(id);
      if (response.success) {
        fetchRoles(); // Refresh list
        return { success: true, message: response.message };
      } else {
        setError(response.error || 'Error al eliminar rol');
        return { success: false, message: response.error || 'Error al eliminar rol' };
      }
    } catch (err: any) {
      setError(err.message || 'Error de red al eliminar rol');
      return { success: false, message: err.message || 'Error de red al eliminar rol' };
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissions = async (roleId: number) => {
    try {
      const response = await apiService.getRolePermissions(roleId);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener permisos del rol' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red al obtener permisos del rol' };
    }
  };

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
  };
};

