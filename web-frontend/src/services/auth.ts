// Authentication service for handling login, logout, and token management

const TOKEN_KEY = 'healthynola_token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier' | 'salesperson';
  };
  error?: string;
}

export interface MeResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier' | 'salesperson';
    lastLogin: string;
  };
  error?: string;
}

// Detectar la URL correcta del API según el hostname
const getApiUrl = () => {
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

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Save token to localStorage
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Error de red al iniciar sesión');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const token = getToken();
    
    if (token) {
      const API_URL = getApiUrl();
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always remove token, even if API call fails
    removeToken();
  }
};

/**
 * Get current user data
 */
export const getMe = async (): Promise<MeResponse> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener datos del usuario');
    }

    return data;
  } catch (error: any) {
    // If token is invalid, remove it
    if (error.message.includes('401') || error.message.includes('authorized')) {
      removeToken();
    }
    throw new Error(error.message || 'Error al verificar autenticación');
  }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save token to localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

