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
  items: [],
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
    },
    setInventory: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
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
  setError,
  setInventory
} = inventorySlice.actions;
export default inventorySlice.reducer;
