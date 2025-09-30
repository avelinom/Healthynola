import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  rawMaterialId: number;
  rawMaterialName: string;
  cantidad: number;
  unidad: string;
  costoCalculado: number;
  costoPorUnidad: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: number;
  nombre: string;
  descripcion?: string;
  productId?: number;
  productName?: string;
  rendimiento: number;
  unidadRendimiento: string;
  notas?: string;
  activo: boolean;
  ingredients?: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

interface RecipesState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  recipes: [],
  loading: false,
  error: null,
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recipes[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteRecipe: (state, action: PayloadAction<number>) => {
      state.recipes = state.recipes.filter(r => r.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setRecipes, 
  addRecipe, 
  updateRecipe, 
  deleteRecipe, 
  setLoading, 
  setError 
} = recipesSlice.actions;

export default recipesSlice.reducer;
