import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Expense {
  id: number;
  userId: number;
  descripcion: string;
  categoria: string;
  monto: number;
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  responsable: string;
  fecha: string;
  notas?: string;
  receiptPath?: string;
  hasReceipt: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
      state.loading = false;
      state.error = null;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    deleteExpense: (state, action: PayloadAction<number>) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
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
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setLoading,
  setError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
