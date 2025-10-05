import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export const useSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      
      if (data.success) {
        setSales(data.data);
      } else {
        setError(data.message || 'Error al cargar ventas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    fetchSales
  };
};



