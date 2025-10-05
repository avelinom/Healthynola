import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Consignment {
  id: number;
  sale_id: number;
  client_id: number;
  product_id: number;
  quantity: number;
  delivery_date: string;
  payment_status: 'pending' | 'paid' | 'credit';
  amount_paid: number;
  next_visit_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  client_phone: string;
  client_address?: string;
  product_name: string;
  responsible_user: string;
}

export interface ConsignmentVisit {
  id: number;
  consignment_id: number;
  visit_date: string;
  visit_type: 'delivery' | 'collection' | 'check';
  status: 'programada' | 'hecha' | 'por_hacer';
  notes?: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  product_name: string;
  responsible_user: string;
  quantity: number;
  payment_status: string;
}

interface ConsignmentsState {
  consignments: Consignment[];
  visits: ConsignmentVisit[];
  loading: boolean;
  error: string | null;
}

const initialState: ConsignmentsState = {
  consignments: [],
  visits: [],
  loading: false,
  error: null
};

const consignmentsSlice = createSlice({
  name: 'consignments',
  initialState,
  reducers: {
    setConsignments: (state, action: PayloadAction<Consignment[]>) => {
      state.consignments = action.payload;
      state.error = null; // Clear error on successful load
    },
    setVisits: (state, action: PayloadAction<ConsignmentVisit[]>) => {
      state.visits = action.payload;
      state.error = null; // Clear error on successful load
    },
    addConsignment: (state, action: PayloadAction<Consignment>) => {
      state.consignments.push(action.payload);
    },
    updateConsignment: (state, action: PayloadAction<Consignment>) => {
      const index = state.consignments.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.consignments[index] = action.payload;
      }
    },
    deleteConsignment: (state, action: PayloadAction<number>) => {
      state.consignments = state.consignments.filter(c => c.id !== action.payload);
    },
    addVisit: (state, action: PayloadAction<ConsignmentVisit>) => {
      state.visits.push(action.payload);
    },
    updateVisit: (state, action: PayloadAction<ConsignmentVisit>) => {
      const index = state.visits.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.visits[index] = action.payload;
      }
    },
    deleteVisit: (state, action: PayloadAction<number>) => {
      state.visits = state.visits.filter(v => v.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setConsignments,
  setVisits,
  addConsignment,
  updateConsignment,
  deleteConsignment,
  addVisit,
  updateVisit,
  deleteVisit,
  setLoading,
  setError,
  clearError
} = consignmentsSlice.actions;

export default consignmentsSlice.reducer;
