import { useState, useEffect } from 'react';

interface Warehouse {
  id: number;
  nombre: string;
  codigo: string;
  direccion?: string;
  telefono?: string;
  responsable?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useWarehousesUltraSimple = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchWarehouses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/warehouses');
        const data = await response.json();
        
        if (isMounted) {
          if (data.success) {
            setWarehouses(data.data || []);
          } else {
            setError(data.message || 'Error al cargar almacenes');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error de red al cargar almacenes');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWarehouses();

    return () => {
      isMounted = false;
    };
  }, []); // Solo se ejecuta una vez

  const activeWarehouses = warehouses.filter(w => w.activo);

  return {
    warehouses,
    activeWarehouses,
    loading,
    error
  };
};
