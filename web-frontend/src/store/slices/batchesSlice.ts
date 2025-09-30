import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BatchPackaging {
  id: number;
  batchId: number;
  productId?: number;
  productName?: string;
  tipoBolsa: '1kg' | '0.5kg' | '100g';
  cantidadBolsas: number;
  almacen: string;
  createdAt: string;
}

export interface Batch {
  id: number;
  codigoLote: string;
  recipeId: number;
  recipeName?: string;
  productName?: string;
  fechaProduccion?: string;
  cantidadProducida: number;
  unidad: string;
  costoTotalCalculado: number;
  estado: 'planificado' | 'en_proceso' | 'completado' | 'cancelado';
  notas?: string;
  packaging?: BatchPackaging[];
  createdAt: string;
  updatedAt: string;
}

interface BatchesState {
  batches: Batch[];
  loading: boolean;
  error: string | null;
}

const initialState: BatchesState = {
  batches: [],
  loading: false,
  error: null,
};

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    setBatches: (state, action: PayloadAction<Batch[]>) => {
      state.batches = action.payload;
      state.loading = false;
      state.error = null;
    },
    addBatch: (state, action: PayloadAction<Batch>) => {
      state.batches.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateBatch: (state, action: PayloadAction<Batch>) => {
      const index = state.batches.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.batches[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteBatch: (state, action: PayloadAction<number>) => {
      state.batches = state.batches.filter(b => b.id !== action.payload);
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
  setBatches, 
  addBatch, 
  updateBatch, 
  deleteBatch, 
  setLoading, 
  setError 
} = batchesSlice.actions;

export default batchesSlice.reducer;
