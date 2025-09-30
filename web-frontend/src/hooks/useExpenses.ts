import { useDispatch } from 'react-redux';
import {
  setExpenses,
  addExpense as addExpenseAction,
  updateExpense as updateExpenseAction,
  deleteExpense as deleteExpenseAction,
  setLoading,
  setError,
  Expense,
} from '../store/slices/expensesSlice';

export const useExpenses = () => {
  const dispatch = useDispatch();

  const fetchExpenses = async (filters?: { startDate?: string; endDate?: string; categoria?: string }) => {
    try {
      dispatch(setLoading(true));
      
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.categoria) params.append('categoria', filters.categoria);
      
      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        dispatch(setExpenses(data.data));
      } else {
        dispatch(setError(data.message || 'Error al cargar gastos'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar gastos'));
    }
  };

  const createExpense = async (expenseData: FormData) => {
    try {
      dispatch(setLoading(true));
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: expenseData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(addExpenseAction(data.data));
        return { success: true, data: data.data };
      } else {
        dispatch(setError(data.message || 'Error al crear gasto'));
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al crear gasto'));
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>) => {
    try {
      dispatch(setLoading(true));
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(updateExpenseAction(data.data));
        return { success: true, data: data.data };
      } else {
        dispatch(setError(data.message || 'Error al actualizar gasto'));
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al actualizar gasto'));
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      dispatch(setLoading(true));
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(deleteExpenseAction(id));
        return { success: true };
      } else {
        dispatch(setError(data.message || 'Error al eliminar gasto'));
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al eliminar gasto'));
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const uploadReceipt = async (id: number, file: File) => {
    try {
      dispatch(setLoading(true));
      
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await fetch(`/api/expenses/${id}/receipt`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(updateExpenseAction(data.data));
        return { success: true, data: data.data };
      } else {
        dispatch(setError(data.message || 'Error al subir recibo'));
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al subir recibo'));
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const downloadReceipt = (id: number) => {
    window.open(`/api/expenses/${id}/receipt`, '_blank');
  };

  return {
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt,
    downloadReceipt,
  };
};
