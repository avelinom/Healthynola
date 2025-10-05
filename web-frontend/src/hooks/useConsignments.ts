import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  setConsignments, 
  setVisits, 
  addConsignment, 
  updateConsignment, 
  deleteConsignment,
  addVisit,
  updateVisit,
  deleteVisit,
  setLoading, 
  setError 
} from '@/store/slices/consignmentsSlice';
import { apiService } from '@/services/api';

export const useConsignments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { consignments, visits, loading, error } = useSelector((state: RootState) => state.consignments);

  // Cargar consignaciones desde la API
  const loadConsignments = useCallback(async () => {
    try {
      console.log('[useConsignments] Loading consignments...');
      dispatch(setLoading(true));
      const response = await apiService.getConsignments();
      console.log('[useConsignments] API response:', response);
      if (response.success) {
        console.log('[useConsignments] Setting consignments:', response.data);
        dispatch(setConsignments(response.data));
      } else {
        console.error('[useConsignments] API returned error');
        dispatch(setError('Error al cargar consignaciones'));
      }
    } catch (error) {
      console.error('[useConsignments] Error loading consignments:', error);
      dispatch(setError('Error al cargar consignaciones'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Cargar visitas desde la API
  const loadVisits = useCallback(async () => {
    try {
      console.log('[useConsignments] Loading visits...');
      dispatch(setLoading(true));
      const response = await apiService.getConsignmentVisits();
      console.log('[useConsignments] Visits API response:', response);
      if (response.success) {
        console.log('[useConsignments] Setting visits:', response.data);
        dispatch(setVisits(response.data));
      } else {
        console.error('[useConsignments] Visits API returned error');
        dispatch(setError('Error al cargar visitas'));
      }
    } catch (error) {
      console.error('[useConsignments] Error loading visits:', error);
      dispatch(setError('Error al cargar visitas'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Crear consignación
  const createConsignment = async (consignmentData: any) => {
    try {
      const response = await apiService.createConsignment(consignmentData);
      if (response.success) {
        dispatch(addConsignment(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Error al crear consignación' };
      }
    } catch (error) {
      console.error('Error creating consignment:', error);
      return { success: false, error: 'Error al crear consignación' };
    }
  };

  // Actualizar consignación
  const updateConsignmentById = async (id: number, consignmentData: any) => {
    try {
      const response = await apiService.updateConsignment(id, consignmentData);
      if (response.success) {
        dispatch(updateConsignment(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Error al actualizar consignación' };
      }
    } catch (error) {
      console.error('Error updating consignment:', error);
      return { success: false, error: 'Error al actualizar consignación' };
    }
  };

  // Actualizar visita
  const updateVisitById = async (id: number, visitData: any) => {
    try {
      const response = await apiService.updateVisit(id, visitData);
      if (response.success) {
        dispatch(updateVisit(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Error al actualizar visita' };
      }
    } catch (error) {
      console.error('Error updating visit:', error);
      return { success: false, error: 'Error al actualizar visita' };
    }
  };

  // Eliminar consignación
  const deleteConsignmentById = async (id: number) => {
    try {
      const response = await apiService.deleteConsignment(id);
      if (response.success) {
        dispatch(deleteConsignment(id));
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Error al eliminar consignación' };
      }
    } catch (error) {
      console.error('Error deleting consignment:', error);
      return { success: false, error: 'Error al eliminar consignación' };
    }
  };

  // Obtener estadísticas de visitas
  const getVisitStats = async (startDate?: string, endDate?: string) => {
    try {
      const response = await apiService.getConsignmentStats(startDate, endDate);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al obtener estadísticas' };
      }
    } catch (error) {
      console.error('Error getting visit stats:', error);
      return { success: false, error: 'Error al obtener estadísticas' };
    }
  };

  // Obtener consignaciones sin actualizar el estado (solo retornar datos)
  const getConsignments = async () => {
    try {
      const response = await apiService.getConsignments();
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al obtener consignaciones' };
      }
    } catch (error) {
      console.error('Error getting consignments:', error);
      return { success: false, error: 'Error al obtener consignaciones' };
    }
  };

  return {
    consignments,
    visits,
    loading,
    error,
    loadConsignments,
    loadVisits,
    createConsignment,
    updateConsignment: updateConsignmentById,
    updateVisit: updateVisitById,
    deleteConsignment: deleteConsignmentById,
    getVisitStats,
    getConsignments
  };
};
