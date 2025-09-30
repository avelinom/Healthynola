import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Sale {
  id: string;
  customerId: number;
  customerName: string;
  products: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  salespersonId: number;
  salespersonName: string;
  warehouse: 'Principal' | 'MMM' | 'DVP';
  timestamp: string;
  notes?: string;
}

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [
    {
      id: '1',
      customerId: 1,
      customerName: 'María García',
      products: [
        {
          productId: 1,
          productName: 'Granola Natural 500g',
          quantity: 2,
          unitPrice: 15000,
          total: 30000
        }
      ],
      totalAmount: 30000,
      discount: 0,
      finalAmount: 30000,
      paymentMethod: 'cash',
      salespersonId: 1,
      salespersonName: 'Admin',
      warehouse: 'Principal',
      timestamp: new Date().toISOString(), // Hoy
      notes: 'Venta al por menor'
    },
    {
      id: '2',
      customerId: 2,
      customerName: 'Carlos López',
      products: [
        {
          productId: 2,
          productName: 'Granola con Chocolate 500g',
          quantity: 3,
          unitPrice: 18000,
          total: 54000
        },
        {
          productId: 3,
          productName: 'Granola con Frutas 500g',
          quantity: 1,
          unitPrice: 20000,
          total: 20000
        }
      ],
      totalAmount: 74000,
      discount: 5000,
      finalAmount: 69000,
      paymentMethod: 'card',
      salespersonId: 2,
      salespersonName: 'Ana Martínez',
      warehouse: 'Principal',
      timestamp: new Date().toISOString(), // Hoy
      notes: 'Cliente mayorista'
    },
    {
      id: '3',
      customerId: 3,
      customerName: 'Laura Rodríguez',
      products: [
        {
          productId: 1,
          productName: 'Granola Natural 500g',
          quantity: 1,
          unitPrice: 15000,
          total: 15000
        }
      ],
      totalAmount: 15000,
      discount: 0,
      finalAmount: 15000,
      paymentMethod: 'cash',
      salespersonId: 1,
      salespersonName: 'Admin',
      warehouse: 'DVP',
      timestamp: new Date().toISOString(), // Hoy
    },
    {
      id: '4',
      customerId: 4,
      customerName: 'Pedro Sánchez',
      products: [
        {
          productId: 4,
          productName: 'Mix de Frutos Secos 250g',
          quantity: 2,
          unitPrice: 12000,
          total: 24000
        }
      ],
      totalAmount: 24000,
      discount: 0,
      finalAmount: 24000,
      paymentMethod: 'transfer',
      salespersonId: 2,
      salespersonName: 'Ana Martínez',
      warehouse: 'MMM',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
    },
    {
      id: '5',
      customerId: 1,
      customerName: 'María García',
      products: [
        {
          productId: 2,
          productName: 'Granola con Chocolate 500g',
          quantity: 1,
          unitPrice: 18000,
          total: 18000
        }
      ],
      totalAmount: 18000,
      discount: 0,
      finalAmount: 18000,
      paymentMethod: 'cash',
      salespersonId: 1,
      salespersonName: 'Admin',
      warehouse: 'Principal',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    }
  ],
  loading: false,
  error: null
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSale: (state, action: PayloadAction<Omit<Sale, 'id' | 'timestamp'>>) => {
      const newSale: Sale = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.sales.unshift(newSale);
    },
    updateSale: (state, action: PayloadAction<Sale>) => {
      const index = state.sales.findIndex(sale => sale.id === action.payload.id);
      if (index !== -1) {
        state.sales[index] = action.payload;
      }
    },
    deleteSale: (state, action: PayloadAction<string>) => {
      state.sales = state.sales.filter(sale => sale.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { addSale, updateSale, deleteSale, setLoading, setError } = salesSlice.actions;
export default salesSlice.reducer;
