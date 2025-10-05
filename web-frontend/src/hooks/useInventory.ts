import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setInventory, setLoading, setError } from '@/store/slices/inventorySlice';
import { apiService } from '@/services/api';

export const useInventory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: inventory, loading, error } = useSelector((state: RootState) => state.inventory);

  // Cargar inventario desde la API
  const loadInventory = useCallback(async () => {
    try {
      console.log('[useInventory] Loading inventory...');
      dispatch(setLoading(true));
      const response = await apiService.getInventory();
      console.log('[useInventory] API response:', response);
      if (response.success) {
        console.log('[useInventory] Setting inventory:', response.data);
        dispatch(setInventory(response.data));
      } else {
        console.error('[useInventory] API returned error');
        dispatch(setError('Error al cargar inventario'));
      }
    } catch (error) {
      console.error('[useInventory] Error loading inventory:', error);
      dispatch(setError('Error al cargar inventario'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Cargar inventario automáticamente al montar el componente
  useEffect(() => {
    if (inventory && inventory.length === 0 && !loading) {
      loadInventory();
    }
  }, [inventory, loading, loadInventory]);

  return {
    inventory,
    loading,
    error,
    loadInventory,
  };
};
