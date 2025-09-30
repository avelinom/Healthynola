import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: 'Regular' | 'Mayorista' | 'Consignación';
  notes: string | null;
  active: boolean;
}

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<number>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    toggleCustomerStatus: (state, action: PayloadAction<number>) => {
      const customer = state.customers.find(c => c.id === action.payload);
      if (customer) {
        customer.active = !customer.active;
      }
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
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
  addCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  setCustomers,
  setLoading,
  setError
} = customersSlice.actions;

export default customersSlice.reducer;
