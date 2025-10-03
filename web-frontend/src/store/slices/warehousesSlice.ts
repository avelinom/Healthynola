import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Warehouse {
  id: number;
  nombre: string;
  codigo: string;
  direccion?: string | null;
  telefono?: string | null;
  responsable?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WarehousesState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehousesState = {
  warehouses: [],
  loading: false,
  error: null
};

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {
    setWarehouses: (state, action: PayloadAction<Warehouse[]>) => {
      state.warehouses = action.payload;
      state.loading = false;
      state.error = null;
    },
    addWarehouse: (state, action: PayloadAction<Warehouse>) => {
      state.warehouses.push(action.payload);
    },
    updateWarehouse: (state, action: PayloadAction<Warehouse>) => {
      const index = state.warehouses.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.warehouses[index] = action.payload;
      }
    },
    removeWarehouse: (state, action: PayloadAction<number>) => {
      state.warehouses = state.warehouses.filter(w => w.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setWarehouses,
  addWarehouse,
  updateWarehouse,
  removeWarehouse,
  setLoading,
  setError,
  clearError
} = warehousesSlice.actions;

export default warehousesSlice.reducer;

