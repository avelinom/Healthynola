import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  setRawMaterials, 
  addRawMaterial, 
  updateRawMaterial as updateRawMaterialAction, 
  deleteRawMaterial as deleteRawMaterialAction, 
  setLoading, 
  setError,
  RawMaterial 
} from '@/store/slices/rawMaterialsSlice';

export const useRawMaterials = () => {
  const dispatch: AppDispatch = useDispatch();
  const { rawMaterials, loading, error } = useSelector((state: RootState) => state.rawMaterials);

  const fetchRawMaterials = async (activo?: boolean) => {
    dispatch(setLoading(true));
    try {
      const params = activo !== undefined ? `?activo=${activo}` : '';
      const response = await fetch(`/api/raw-materials${params}`);
      const data = await response.json();

      if (data.success) {
        dispatch(setRawMaterials(data.data));
      } else {
        dispatch(setError(data.message));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const createRawMaterial = async (rawMaterialData: Partial<RawMaterial>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawMaterialData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(addRawMaterial(data.data));
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    }
  };

  const updateRawMaterial = async (id: number, rawMaterialData: Partial<RawMaterial>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/raw-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawMaterialData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(updateRawMaterialAction(data.data));
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    }
  };

  const deleteRawMaterial = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/raw-materials/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        dispatch(deleteRawMaterialAction(id));
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    }
  };

  const updateStock = async (id: number, change: number, reason?: string) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/raw-materials/${id}/update-stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change, reason }),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(updateRawMaterialAction(data.data));
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    }
  };

  return {
    rawMaterials,
    loading,
    error,
    fetchRawMaterials,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    updateStock,
  };
};
