import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setWarehouses,
  addWarehouse,
  updateWarehouse,
  removeWarehouse,
  setLoading,
  setError,
  clearError,
  Warehouse
} from '../store/slices/warehousesSlice';
import { useEffect, useCallback, useMemo } from 'react';

export const useWarehouses = () => {
  const dispatch = useDispatch();
  const warehouses = useSelector((state: RootState) => state.warehouses.warehouses);
  const loading = useSelector((state: RootState) => state.warehouses.loading);
  const error = useSelector((state: RootState) => state.warehouses.error);

  const fetchWarehouses = useCallback(async (includeInactive: boolean = false) => {
    try {
      dispatch(setLoading(true));
      const url = includeInactive 
        ? '/api/warehouses?includeInactive=true'
        : '/api/warehouses';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        dispatch(setWarehouses(data.data));
      } else {
        dispatch(setError(data.message || 'Error al cargar almacenes'));
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Error al cargar almacenes'));
    }
  }, [dispatch]);

  const createWarehouse = useCallback(async (warehouseData: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(addWarehouse(data.data));
        dispatch(setLoading(false));
        return { success: true, data: data.data };
      } else {
        dispatch(setError(data.message || 'Error al crear almacén'));
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Error al crear almacén'));
      return { success: false, message: err.message };
    }
  }, [dispatch]);

  const updateWarehouseById = useCallback(async (id: number, warehouseData: Partial<Warehouse>) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(updateWarehouse(data.data));
        dispatch(setLoading(false));
        return { success: true, data: data.data };
      } else {
        dispatch(setError(data.message || 'Error al actualizar almacén'));
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Error al actualizar almacén'));
      return { success: false, message: err.message };
    }
  }, [dispatch]);

  const deleteWarehouse = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(removeWarehouse(id));
        dispatch(setLoading(false));
        return { success: true };
      } else {
        dispatch(setError(data.message || 'Error al eliminar almacén'));
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Error al eliminar almacén'));
      return { success: false, message: err.message };
    }
  }, [dispatch]);

  const clearWarehouseError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Auto-load warehouses on mount only if empty
  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeWarehouses = useMemo(() => 
    warehouses.filter(w => w.activo), 
    [warehouses]
  );

  return {
    warehouses,
    activeWarehouses,
    loading,
    error,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse: updateWarehouseById,
    deleteWarehouse,
    clearError: clearWarehouseError
  };
};

