import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError 
} from '@/store/slices/categoriesSlice';
import { Category } from '@/store/slices/categoriesSlice';

export const useCategories = () => {
  const dispatch: AppDispatch = useDispatch();
  const { categories, loading, error } = useSelector((state: RootState) => state.categories);

  // Load categories on mount - ALWAYS fetch fresh data from API
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const create = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await dispatch(createCategory(categoryData));
    return result;
  };

  const update = async (id: number, categoryData: Partial<Category>) => {
    const result = await dispatch(updateCategory({ id, ...categoryData }));
    return result;
  };

  const remove = async (id: number) => {
    const result = await dispatch(deleteCategory(id));
    return result;
  };

  const clear = () => {
    dispatch(clearError());
  };

  // Get active categories only
  const activeCategories = categories.filter(cat => cat.activo);

  // Get category by ID
  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  // Get category by name
  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.nombre === name);
  };

  return {
    // State
    categories,
    activeCategories,
    loading,
    error,
    
    // Actions
    create,
    update,
    remove,
    clear,
    
    // Utilities
    getCategoryById,
    getCategoryByName
  };
};
