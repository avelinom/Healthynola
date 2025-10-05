import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'salesperson';
  active: boolean;
  warehouse?: string;
  phone?: string;
  last_login?: string;
  created_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    warehouse?: string;
    phone?: string;
    active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createUser(data);
      
      if (response.success) {
        await fetchUsers(); // Reload users
        return { success: true, message: response.message, data: response.data };
      } else {
        setError('Error al crear usuario');
        return { success: false, message: 'Error al crear usuario' };
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMessage = err.message || 'Error al crear usuario';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: number, data: {
    name?: string;
    email?: string;
    role?: string;
    warehouse?: string;
    phone?: string;
    active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateUser(id, data);
      
      if (response.success) {
        await fetchUsers(); // Reload users
        return { success: true, message: response.message, data: response.data };
      } else {
        setError('Error al actualizar usuario');
        return { success: false, message: 'Error al actualizar usuario' };
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      const errorMessage = err.message || 'Error al actualizar usuario';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const changePassword = useCallback(async (
    userId: number,
    passwords: { currentPassword?: string; newPassword: string; confirmPassword: string }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.changePassword(userId, passwords);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError('Error al cambiar contraseña');
        return { success: false, message: 'Error al cambiar contraseña' };
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMessage = err.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.toggleUserStatus(id);
      
      if (response.success) {
        await fetchUsers(); // Reload users
        return { success: true, message: response.message, data: response.data };
      } else {
        setError('Error al cambiar estado del usuario');
        return { success: false, message: 'Error al cambiar estado del usuario' };
      }
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      const errorMessage = err.message || 'Error al cambiar estado del usuario';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deleteUser(id);
      
      if (response.success) {
        await fetchUsers(); // Reload users
        return { success: true, message: response.message };
      } else {
        setError('Error al eliminar usuario');
        return { success: false, message: 'Error al eliminar usuario' };
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const errorMessage = err.message || 'Error al eliminar usuario';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    changePassword,
    toggleUserStatus,
    deleteUser
  };
};



