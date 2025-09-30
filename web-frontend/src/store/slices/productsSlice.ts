import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  unidadMedida: string;
  stockMinimo: number;
  activo: boolean;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    toggleProductStatus: (state, action: PayloadAction<number>) => {
      const product = state.products.find(p => p.id === action.payload);
      if (product) {
        product.activo = !product.activo;
      }
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  setProducts,
  setLoading,
  setError
} = productsSlice.actions;

export default productsSlice.reducer;
