import { useState, useEffect, useMemo } from 'react';
import { Warehouse } from '../store/slices/warehousesSlice';

export const useWarehousesSimple = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = async (includeInactive: boolean = false) => {
    try {
      setLoading(true);
      const url = includeInactive 
        ? '/api/warehouses?includeInactive=true'
        : '/api/warehouses';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWarehouses(data.data);
      } else {
        setError(data.message || 'Error al cargar almacenes');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar almacenes');
    } finally {
      setLoading(false);
    }
  };

  const createWarehouse = async (warehouseData: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWarehouses(prev => [...prev, data.data]);
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Error al crear almacén');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear almacén');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouse = async (id: number, warehouseData: Partial<Warehouse>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWarehouses(prev => prev.map(w => w.id === id ? data.data : w));
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Error al actualizar almacén');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar almacén');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteWarehouse = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWarehouses(prev => prev.filter(w => w.id !== id));
        return { success: true };
      } else {
        setError(data.message || 'Error al eliminar almacén');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar almacén');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load warehouses on mount
  useEffect(() => {
    fetchWarehouses();
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
    updateWarehouse,
    deleteWarehouse,
    clearError
  };
};
