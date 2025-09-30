import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { 
  setRecipes, 
  addRecipe, 
  updateRecipe as updateRecipeAction, 
  deleteRecipe as deleteRecipeAction, 
  setLoading, 
  setError,
  Recipe,
  RecipeIngredient
} from '@/store/slices/recipesSlice';

export const useRecipes = () => {
  const dispatch: AppDispatch = useDispatch();
  const { recipes, loading, error } = useSelector((state: RootState) => state.recipes);

  const fetchRecipes = async (activo?: boolean) => {
    dispatch(setLoading(true));
    try {
      const params = activo !== undefined ? `?activo=${activo}` : '';
      const response = await fetch(`/api/recipes${params}`);
      const data = await response.json();

      if (data.success) {
        dispatch(setRecipes(data.data));
      } else {
        dispatch(setError(data.message));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const fetchRecipe = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${id}`);
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

  const createRecipe = async (recipeData: Partial<Recipe>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(addRecipe(data.data));
        return data.data;
      } else {
        dispatch(setError(data.message));
        return null;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return null;
    }
  };

  const updateRecipe = async (id: number, recipeData: Partial<Recipe>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(updateRecipeAction(data.data));
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

  const deleteRecipe = async (id: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        dispatch(deleteRecipeAction(id));
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

  const addIngredient = async (recipeId: number, ingredientData: Partial<RecipeIngredient>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredientData),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh recipe to get updated ingredients
        await fetchRecipe(recipeId);
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateIngredient = async (recipeId: number, ingredientId: number, ingredientData: Partial<RecipeIngredient>) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredientData),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh recipe to get updated ingredients
        await fetchRecipe(recipeId);
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteIngredient = async (recipeId: number, ingredientId: number) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        // Refresh recipe to get updated ingredients
        await fetchRecipe(recipeId);
        return true;
      } else {
        dispatch(setError(data.message));
        return false;
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const calculateRecipeCost = async (id: number) => {
    try {
      const response = await fetch(`/api/recipes/${id}/cost`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        return null;
      }
    } catch (err: any) {
      return null;
    }
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    calculateRecipeCost,
  };
};
