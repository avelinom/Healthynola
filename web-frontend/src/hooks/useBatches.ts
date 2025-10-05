import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { apiService } from '@/services/api';
import { 
  setBatches, 
  addBatch, 
  updateBatch as updateBatchAction, 
  deleteBatch as deleteBatchAction, 
  setLoading, 
  setError,
  Batch
} from '@/store/slices/batchesSlice';

export const useBatches = () => {
  const dispatch: AppDispatch = useDispatch();
  const { batches, loading, error } = useSelector((state: RootState) => state.batches);

  const fetchBatches = async (estado?: string) => {
    dispatch(setLoading(true));
    try {
      const params = estado ? `?estado=${estado}` : '';
      const response = await apiService.getBatches(params);

      if (response.success) {
        dispatch(setBatches(response.data));
      } else {
        dispatch(setError(response.message || 'Error al cargar lotes'));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const fetchBatch = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/batches/${id}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        dispatch(setError(data.message));
        return null;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createBatch = async (batchData: Partial<Batch>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(addBatch(data.data));
        return data.data;
      } else {
        dispatch(setError(data.message));
        alert(`Error: ${data.message}`);
        return null;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      alert(`Error: ${err.message}`);
      return null;
    }
  };

  const updateBatch = async (id: number, batchData: Partial<Batch>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(updateBatchAction(data.data));
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

  const deleteBatch = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/batches/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        dispatch(deleteBatchAction(id));
        return true;
      } else {
        dispatch(setError(data.message));
        alert(`Error: ${data.message}`);
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  const completeBatch = async (id: number, packagingData: any[]) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/batches/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packaging: packagingData }),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh batches to get updated status
        await fetchBatches();
        alert(data.message);
        return true;
      } else {
        dispatch(setError(data.message));
        alert(`Error: ${data.message}`);
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  return {
    batches,
    loading,
    error,
    fetchBatches,
    fetchBatch,
    createBatch,
    updateBatch,
    deleteBatch,
    completeBatch,
  };
};
