import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RawMaterial {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  costoPorUnidad: number;
  proveedor?: string;
  stockActual: number;
  stockMinimo: number;
  notas?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawMaterialsState {
  rawMaterials: RawMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: RawMaterialsState = {
  rawMaterials: [],
  loading: false,
  error: null,
};

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState,
  reducers: {
    setRawMaterials: (state, action: PayloadAction<RawMaterial[]>) => {
      state.rawMaterials = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRawMaterial: (state, action: PayloadAction<RawMaterial>) => {
      state.rawMaterials.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateRawMaterial: (state, action: PayloadAction<RawMaterial>) => {
      const index = state.rawMaterials.findIndex(rm => rm.id === action.payload.id);
      if (index !== -1) {
        state.rawMaterials[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteRawMaterial: (state, action: PayloadAction<number>) => {
      state.rawMaterials = state.rawMaterials.filter(rm => rm.id !== action.payload);
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
  setRawMaterials, 
  addRawMaterial, 
  updateRawMaterial, 
  deleteRawMaterial, 
  setLoading, 
  setError 
} = rawMaterialsSlice.actions;

export default rawMaterialsSlice.reducer;
