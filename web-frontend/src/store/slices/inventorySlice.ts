import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
  notes?: string;
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [
    {
      id: 1,
      productId: 1,
      productName: 'Granola Natural 500g',
      warehouse: 'Principal',
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      lastUpdated: new Date().toISOString(),
      notes: 'Stock principal para ventas'
    },
    {
      id: 2,
      productId: 1,
      productName: 'Granola Natural 500g',
      warehouse: 'DVP',
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Stock bajo - necesita reposición'
    },
    {
      id: 3,
      productId: 2,
      productName: 'Granola con Chocolate 500g',
      warehouse: 'Principal',
      currentStock: 30,
      minStock: 15,
      maxStock: 80,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Stock estable'
    },
    {
      id: 4,
      productId: 2,
      productName: 'Granola con Chocolate 500g',
      warehouse: 'MMM',
      currentStock: 8,
      minStock: 15,
      maxStock: 40,
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Stock bajo'
    },
    {
      id: 5,
      productId: 3,
      productName: 'Granola con Frutas 500g',
      warehouse: 'Principal',
      currentStock: 20,
      minStock: 12,
      maxStock: 60,
      lastUpdated: new Date().toISOString(),
      notes: 'Stock normal'
    },
    {
      id: 6,
      productId: 4,
      productName: 'Mix de Frutos Secos 250g',
      warehouse: 'MMM',
      currentStock: 3,
      minStock: 15,
      maxStock: 30,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Stock crítico - urgente reposición'
    }
  ],
  loading: false,
  error: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addInventoryItem: (state, action: PayloadAction<Omit<InventoryItem, 'id' | 'lastUpdated'>>) => {
      const newItem: InventoryItem = {
        id: Date.now(),
        lastUpdated: new Date().toISOString(),
        ...action.payload
      };
      state.items.push(newItem);
    },
    updateInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    deleteInventoryItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateStock: (state, action: PayloadAction<{ productId: number; warehouse: string; change: number; notes?: string }>) => {
      const { productId, warehouse, change, notes } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.warehouse === warehouse
      );

      if (item) {
        item.currentStock += change;
        item.lastUpdated = new Date().toISOString();
        if (notes) {
          item.notes = notes;
        }
      } else if (change > 0) {
        // If item doesn't exist and stock is being added, create a new entry
        const maxId = state.items.length > 0 ? Math.max(...state.items.map(item => item.id)) : 0;
        state.items.push({
          id: maxId + 1,
          productId,
          productName: 'Unknown Product', // This should ideally be looked up from products slice
          warehouse,
          currentStock: change,
          minStock: 0, // Default or configurable
          maxStock: 1000, // Default or configurable
          lastUpdated: new Date().toISOString(),
          notes,
        });
      }
    },
    updateStockById: (state, action: PayloadAction<{ id: number; newStock: number; notes?: string }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.currentStock = action.payload.newStock;
        item.lastUpdated = new Date().toISOString();
        if (action.payload.notes) {
          item.notes = action.payload.notes;
        }
      }
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
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  updateStock, 
  updateStockById,
  setLoading, 
  setError 
} = inventorySlice.actions;
export default inventorySlice.reducer;
