import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'salesperson';
  warehouse: string;
  active: boolean;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [
    {
      id: 1,
      name: 'Administrador Principal',
      email: 'admin@healthynola.com',
      role: 'admin',
      warehouse: 'Principal',
      active: true,
      phone: '+57 300 000 0001',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-09-29T10:00:00Z'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria.garcia@healthynola.com',
      role: 'manager',
      warehouse: 'Principal',
      active: true,
      phone: '+57 300 000 0002',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-09-29T09:30:00Z'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@healthynola.com',
      role: 'salesperson',
      warehouse: 'MMM',
      active: true,
      phone: '+57 300 000 0003',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-09-29T08:45:00Z'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@healthynola.com',
      role: 'salesperson',
      warehouse: 'DVP',
      active: true,
      phone: '+57 300 000 0004',
      createdAt: '2024-02-15T00:00:00Z',
      lastLogin: '2024-09-29T11:15:00Z'
    },
    {
      id: 5,
      name: 'Luis Fernández',
      email: 'luis.fernandez@healthynola.com',
      role: 'cashier',
      warehouse: 'Principal',
      active: true,
      phone: '+57 300 000 0005',
      createdAt: '2024-03-01T00:00:00Z',
      lastLogin: '2024-09-29T07:20:00Z'
    },
    {
      id: 6,
      name: 'Patricia López',
      email: 'patricia.lopez@healthynola.com',
      role: 'salesperson',
      warehouse: 'Principal',
      active: true,
      phone: '+57 300 000 0006',
      createdAt: '2024-03-15T00:00:00Z',
      lastLogin: '2024-09-28T16:30:00Z'
    },
    {
      id: 7,
      name: 'Roberto Silva',
      email: 'roberto.silva@healthynola.com',
      role: 'salesperson',
      warehouse: 'MMM',
      active: false,
      phone: '+57 300 000 0007',
      createdAt: '2024-04-01T00:00:00Z',
      lastLogin: '2024-09-20T14:10:00Z'
    }
  ],
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<Omit<User, 'id' | 'createdAt'>>) => {
      const maxId = state.users.length > 0 ? Math.max(...state.users.map(u => u.id)) : 0;
      const newUser: User = {
        id: maxId + 1,
        createdAt: new Date().toISOString(),
        ...action.payload
      };
      state.users.push(newUser);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    toggleUserStatus: (state, action: PayloadAction<number>) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        user.active = !user.active;
      }
    },
    updateLastLogin: (state, action: PayloadAction<{ userId: number; timestamp: string }>) => {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (user) {
        user.lastLogin = action.payload.timestamp;
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
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
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateLastLogin,
  setUsers,
  setLoading,
  setError
} = usersSlice.actions;

export default usersSlice.reducer;
