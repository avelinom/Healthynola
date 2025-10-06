// Detectar si estamos en móvil/red local/producción y ajustar la URL del API
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Producción: si está en vercel.app, usar backend de Render
    if (hostname.includes('vercel.app') || hostname.includes('healthynola')) {
      return 'https://healthynola-backend.onrender.com/api';
    }
    
    // Red local: si accedemos desde una IP de red local, usar esa IP para el backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001/api`;
    }
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('healthynola_token');
};

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    return this.request<{ success: boolean; data: any[] }>('/products');
  }

  async getProduct(id: number) {
    return this.request<{ success: boolean; data: any }>(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request<{ success: boolean; data: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: any) {
    return this.request<{ success: boolean; data: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number) {
    return this.request<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers API
  async getCustomers() {
    return this.request<{ success: boolean; data: any[] }>('/customers');
  }

  async getCustomer(id: number) {
    return this.request<{ success: boolean; data: any }>(`/customers/${id}`);
  }

  async createCustomer(customer: any) {
    return this.request<{ success: boolean; data: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: number, customer: any) {
    return this.request<{ success: boolean; data: any }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number) {
    return this.request<{ success: boolean }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory API
  async getInventory() {
    return this.request<{ success: boolean; data: any[] }>('/inventory');
  }

  // Consignments API
  async getConsignments() {
    return this.request<{ success: boolean; data: any[] }>('/consignments');
  }

  async getConsignmentVisits() {
    return this.request<{ success: boolean; data: any[] }>('/consignments/visits');
  }

  async createConsignment(data: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/consignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateConsignment(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/consignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateVisit(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/consignments/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteConsignment(id: number) {
    return this.request<{ success: boolean; message: string }>(`/consignments/${id}`, {
      method: 'DELETE'
    });
  }

  async getConsignmentStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/consignments/stats?${queryString}` : '/consignments/stats';
    
    return this.request<{ success: boolean; data: any }>(endpoint);
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Raw Materials API
  async getRawMaterials(params?: string) {
    const endpoint = params ? `/raw-materials${params}` : '/raw-materials';
    return this.request<{ success: boolean; data: any[]; message?: string }>(endpoint);
  }

  async createRawMaterial(data: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRawMaterial(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRawMaterial(id: number) {
    return this.request<{ success: boolean; message: string }>(`/raw-materials/${id}`, {
      method: 'DELETE'
    });
  }

  // Recipes API
  async getRecipes(params?: string) {
    const endpoint = params ? `/recipes${params}` : '/recipes';
    return this.request<{ success: boolean; data: any[]; message?: string }>(endpoint);
  }

  async createRecipe(data: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRecipe(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRecipe(id: number) {
    return this.request<{ success: boolean; message: string }>(`/recipes/${id}`, {
      method: 'DELETE'
    });
  }

  // Batches API
  async getBatches(params?: string) {
    const endpoint = params ? `/batches${params}` : '/batches';
    return this.request<{ success: boolean; data: any[]; message?: string }>(endpoint);
  }

  async createBatch(data: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/batches', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBatch(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteBatch(id: number) {
    return this.request<{ success: boolean; message: string }>(`/batches/${id}`, {
      method: 'DELETE'
    });
  }

  // Users API
  async getUsers() {
    return this.request<{ success: boolean; data: any[] }>('/users');
  }

  async createUser(data: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUser(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(id: number, data: { currentPassword?: string; newPassword: string; confirmPassword: string }) {
    return this.request<{ success: boolean; message: string }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async toggleUserStatus(id: number) {
    return this.request<{ success: boolean; data: any; message: string }>(`/users/${id}/toggle-status`, {
      method: 'PATCH'
    });
  }

  async deleteUser(id: number) {
    return this.request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Roles API
  async getRoles() {
    return this.request<{ success: boolean; data: any[]; error?: string }>('/roles');
  }

  async createRole(data: any) {
    return this.request<{ success: boolean; data: any; message: string; error?: string }>('/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRole(id: number, data: any) {
    return this.request<{ success: boolean; data: any; message: string; error?: string }>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRole(id: number) {
    return this.request<{ success: boolean; message: string; error?: string }>(`/roles/${id}`, {
      method: 'DELETE'
    });
  }

  async getRolePermissions(roleId: number) {
    return this.request<{ success: boolean; data: any[]; error?: string }>(`/roles/${roleId}/permissions`);
  }

  // Permissions API
  async getPermissions() {
    return this.request<{ success: boolean; data: any }>('/permissions');
  }

  async updatePermissions(role: string, permissions: any) {
    return this.request<{ success: boolean; message: string }>('/permissions', {
      method: 'PUT',
      body: JSON.stringify({ role, permissions })
    });
  }
}

export const apiService = new ApiService();
