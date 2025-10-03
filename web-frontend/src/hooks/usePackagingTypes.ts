import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '@/store';
import {
  setPackagingTypes,
  addPackagingType as addPackagingTypeAction,
  updatePackagingType as updatePackagingTypeAction,
  deletePackagingType as deletePackagingTypeAction,
  setLoading,
  setError,
  PackagingType
} from '@/store/slices/packagingTypesSlice';

export const usePackagingTypes = () => {
  const dispatch = useDispatch();
  const { packagingTypes, loading, error } = useSelector((state: RootState) => state.packagingTypes);

  const fetchPackagingTypes = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/packaging-types');
      const data = await response.json();
      
      if (data.success) {
        dispatch(setPackagingTypes(data.data));
      } else {
        dispatch(setError(data.error || 'Error al cargar tipos de empaque'));
      }
    } catch (err) {
      dispatch(setError('Error de conexión'));
    }
  };

  const createPackagingType = async (packagingType: Omit<PackagingType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/packaging-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packagingType)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(addPackagingTypeAction(data.data));
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const updatePackagingType = async (id: number, updates: Partial<PackagingType>) => {
    try {
      const response = await fetch(`/api/packaging-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(updatePackagingTypeAction(data.data));
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const deletePackagingType = async (id: number) => {
    try {
      const response = await fetch(`/api/packaging-types/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(deletePackagingTypeAction(id));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  // Load packaging types on mount - ALWAYS fetch fresh data from API
  useEffect(() => {
    fetchPackagingTypes();
  }, []);

  const activePackagingTypes = packagingTypes.filter(pt => pt.activo);

  return {
    packagingTypes,
    activePackagingTypes,
    loading,
    error,
    fetchPackagingTypes,
    createPackagingType,
    updatePackagingType,
    deletePackagingType
  };
};

