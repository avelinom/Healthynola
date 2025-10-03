import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PackagingType {
  id: number;
  nombre: string;
  etiqueta: string;
  peso_kg: string;
  tipo_contenedor: string;
  unidad_medida: string;
  cantidad: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface PackagingTypesState {
  packagingTypes: PackagingType[];
  loading: boolean;
  error: string | null;
}

const initialState: PackagingTypesState = {
  packagingTypes: [],
  loading: false,
  error: null
};

const packagingTypesSlice = createSlice({
  name: 'packagingTypes',
  initialState,
  reducers: {
    setPackagingTypes: (state, action: PayloadAction<PackagingType[]>) => {
      state.packagingTypes = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPackagingType: (state, action: PayloadAction<PackagingType>) => {
      state.packagingTypes.push(action.payload);
    },
    updatePackagingType: (state, action: PayloadAction<PackagingType>) => {
      const index = state.packagingTypes.findIndex(pt => pt.id === action.payload.id);
      if (index !== -1) {
        state.packagingTypes[index] = action.payload;
      }
    },
    deletePackagingType: (state, action: PayloadAction<number>) => {
      state.packagingTypes = state.packagingTypes.filter(pt => pt.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setPackagingTypes,
  addPackagingType,
  updatePackagingType,
  deletePackagingType,
  setLoading,
  setError
} = packagingTypesSlice.actions;

export default packagingTypesSlice.reducer;

