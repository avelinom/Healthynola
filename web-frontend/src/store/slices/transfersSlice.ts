import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transfer {
  id: number;
  productId: number;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  transferDate: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
}

interface TransfersState {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
}

const initialState: TransfersState = {
  transfers: [
    {
      id: 1,
      productId: 1,
      productName: 'Granola Natural 500g',
      fromWarehouse: 'Principal',
      toWarehouse: 'DVP',
      quantity: 10,
      transferDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Transferencia para ventas del fin de semana',
      status: 'completed',
      createdBy: 'Admin'
    },
    {
      id: 2,
      productId: 2,
      productName: 'Granola con Chocolate 500g',
      fromWarehouse: 'Principal',
      toWarehouse: 'MMM',
      quantity: 15,
      transferDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Reposición de stock en MMM',
      status: 'completed',
      createdBy: 'Admin'
    },
    {
      id: 3,
      productId: 4,
      productName: 'Mix de Frutos Secos 250g',
      fromWarehouse: 'Principal',
      toWarehouse: 'MMM',
      quantity: 20,
      transferDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Stock bajo en MMM, transferencia urgente',
      status: 'completed',
      createdBy: 'Admin'
    },
    {
      id: 4,
      productId: 3,
      productName: 'Granola con Frutas 500g',
      fromWarehouse: 'DVP',
      toWarehouse: 'Principal',
      quantity: 5,
      transferDate: new Date().toISOString(),
      notes: 'Devolución de stock no vendido',
      status: 'pending',
      createdBy: 'Admin'
    }
  ],
  loading: false,
  error: null
};

const transfersSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    addTransfer: (state, action: PayloadAction<Omit<Transfer, 'id' | 'transferDate'>>) => {
      const newTransfer: Transfer = {
        id: Date.now(),
        transferDate: new Date().toISOString(),
        ...action.payload
      };
      state.transfers.unshift(newTransfer); // Add to the beginning
    },
    updateTransfer: (state, action: PayloadAction<Transfer>) => {
      const index = state.transfers.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transfers[index] = action.payload;
      }
    },
    deleteTransfer: (state, action: PayloadAction<number>) => {
      state.transfers = state.transfers.filter(t => t.id !== action.payload);
    },
    updateTransferStatus: (state, action: PayloadAction<{ id: number; status: Transfer['status'] }>) => {
      const transfer = state.transfers.find(t => t.id === action.payload.id);
      if (transfer) {
        transfer.status = action.payload.status;
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
  addTransfer, 
  updateTransfer, 
  deleteTransfer, 
  updateTransferStatus, 
  setLoading, 
  setError 
} = transfersSlice.actions;
export default transfersSlice.reducer;
