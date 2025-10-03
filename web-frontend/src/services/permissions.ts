import { apiService } from './api';

export interface Module {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  [role: string]: {
    [module: string]: boolean;
  };
}

export const permissionsService = {
  // Get all permissions for all roles
  async getAllPermissions(): Promise<RolePermissions> {
    const response = await apiService.get<{ data: RolePermissions }>('/permissions');
    return response.data;
  },

  // Get all available modules
  async getModules(): Promise<Module[]> {
    const response = await apiService.get<{ data: Module[] }>('/permissions/modules');
    return response.data;
  },

  // Update permissions for a role
  async updatePermissions(role: string, permissions: { [module: string]: boolean }): Promise<void> {
    console.log('permissionsService.updatePermissions - role:', role);
    console.log('permissionsService.updatePermissions - permissions:', permissions);
    const response = await apiService.put('/permissions', {
      role,
      permissions
    });
    console.log('permissionsService.updatePermissions - response:', response);
  },

  // Check if current user has access to a module
  async checkAccess(module: string): Promise<boolean> {
    const response = await apiService.get<{ hasAccess: boolean }>(`/permissions/check/${module}`);
    return response.hasAccess;
  }
};
