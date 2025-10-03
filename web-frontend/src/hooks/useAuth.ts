import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction, 
  clearError 
} from '@/store/slices/authSlice';
import { login as loginService, logout as logoutService, getMe } from '@/services/auth';

export const useAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      
      const response = await loginService({ email, password });
      
      if (response.success) {
        dispatch(loginSuccess({
          user: response.user,
          token: response.token
        }));
        return { success: true };
      } else {
        dispatch(loginFailure(response.error || 'Error al iniciar sesión'));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      dispatch(logoutAction());
    }
  };

  /**
   * Check if user is authenticated on app load
   */
  const checkAuth = async () => {
    try {
      console.log('useAuth.checkAuth - Starting auth check');
      const response = await getMe();
      console.log('useAuth.checkAuth - getMe response:', response);
      
      if (response.success) {
        const token = getToken();
        console.log('useAuth.checkAuth - token found:', !!token);
        if (token) {
          dispatch(loginSuccess({
            user: {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              role: response.data.role
            },
            token: token
          }));
          console.log('useAuth.checkAuth - User authenticated successfully');
        }
      }
    } catch (error) {
      console.log('useAuth.checkAuth - Auth check failed:', error);
      // Token is invalid or expired, clear auth state
      dispatch(logoutAction());
    }
  };

  /**
   * Clear error message
   */
  const clearAuthError = () => {
    dispatch(clearError());
  };

  /**
   * Get token from localStorage
   */
  const getToken = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('healthynola_token');
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user is manager or admin
   */
  const isManagerOrAdmin = (): boolean => {
    return hasAnyRole(['admin', 'manager']);
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearAuthError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isAdmin,
    isManagerOrAdmin,
    getToken
  };
};
