import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCustomers, setLoading, setError, addCustomer, updateCustomer, deleteCustomer } from '@/store/slices/customersSlice';
import { apiService } from '@/services/api';

export const useCustomers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, error } = useSelector((state: RootState) => state.customers);

  // Cargar clientes desde la API
  const loadCustomers = useCallback(async () => {
    try {
      console.log('[useCustomers] Loading customers...');
      dispatch(setLoading(true));
      const response = await apiService.getCustomers();
      console.log('[useCustomers] API response:', response);
      if (response.success) {
        console.log('[useCustomers] Setting customers:', response.data);
        dispatch(setCustomers(response.data));
      } else {
        console.error('[useCustomers] API returned error');
        dispatch(setError('Error al cargar clientes'));
      }
    } catch (error) {
      console.error('[useCustomers] Error loading customers:', error);
      dispatch(setError('Error al cargar clientes'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Crear cliente
  const createCustomer = async (customerData: any) => {
    try {
      const response = await apiService.createCustomer(customerData);
      if (response.success) {
        dispatch(addCustomer(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al crear cliente' };
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: 'Error al crear cliente' };
    }
  };

  // Actualizar cliente
  const updateCustomerById = async (id: number, customerData: any) => {
    try {
      const response = await apiService.updateCustomer(id, customerData);
      if (response.success) {
        dispatch(updateCustomer(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al actualizar cliente' };
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: 'Error al actualizar cliente' };
    }
  };

  // Eliminar cliente
  const deleteCustomerById = async (id: number) => {
    try {
      const response = await apiService.deleteCustomer(id);
      if (response.success) {
        dispatch(deleteCustomer(id));
        return { success: true };
      } else {
        return { success: false, error: 'Error al eliminar cliente' };
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: 'Error al eliminar cliente' };
    }
  };

  return {
    customers,
    loading,
    error,
    loadCustomers,
    createCustomer,
    updateCustomer: updateCustomerById,
    deleteCustomer: deleteCustomerById,
  };
};
