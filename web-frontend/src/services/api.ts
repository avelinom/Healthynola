const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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
}

export const apiService = new ApiService();
