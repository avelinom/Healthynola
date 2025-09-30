import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Activity {
  id: string;
  type: 'sale' | 'inventory' | 'customer' | 'product' | 'user';
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [
    {
      id: '1',
      type: 'sale',
      action: 'Venta registrada',
      details: 'Granola Natural 500g - $15,000',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      userId: '1',
      userName: 'Admin'
    },
    {
      id: '2',
      type: 'inventory',
      action: 'Inventario actualizado',
      details: 'Stock agregado: Granola con Chocolate',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
      userId: '1',
      userName: 'Admin'
    },
    {
      id: '3',
      type: 'customer',
      action: 'Cliente registrado',
      details: 'María García - Cliente Regular',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
      userId: '1',
      userName: 'Admin'
    }
  ],
  loading: false,
  error: null
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Omit<Activity, 'id' | 'timestamp'>>) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.activities.unshift(newActivity); // Agregar al inicio
      
      // Mantener solo las últimas 50 actividades
      if (state.activities.length > 50) {
        state.activities = state.activities.slice(0, 50);
      }
    },
    clearActivities: (state) => {
      state.activities = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { addActivity, clearActivities, setLoading, setError } = activitySlice.actions;
export default activitySlice.reducer;
