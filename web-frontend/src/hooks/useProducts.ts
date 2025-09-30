import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setProducts, setLoading, setError, addProduct, updateProduct, deleteProduct } from '@/store/slices/productsSlice';
import { apiService } from '@/services/api';

export const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.products);

  // Cargar productos desde la API
  const loadProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await apiService.getProducts();
      if (response.success) {
        dispatch(setProducts(response.data));
      } else {
        dispatch(setError('Error al cargar productos'));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch(setError('Error al cargar productos'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Crear producto
  const createProduct = async (productData: any) => {
    try {
      const response = await apiService.createProduct(productData);
      if (response.success) {
        dispatch(addProduct(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al crear producto' };
      }
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: 'Error al crear producto' };
    }
  };

  // Actualizar producto
  const updateProductById = async (id: number, productData: any) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      if (response.success) {
        dispatch(updateProduct(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Error al actualizar producto' };
      }
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: 'Error al actualizar producto' };
    }
  };

  // Eliminar producto
  const deleteProductById = async (id: number) => {
    try {
      const response = await apiService.deleteProduct(id);
      if (response.success) {
        dispatch(deleteProduct(id));
        return { success: true };
      } else {
        return { success: false, error: 'Error al eliminar producto' };
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: 'Error al eliminar producto' };
    }
  };

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct: updateProductById,
    deleteProduct: deleteProductById,
  };
};
