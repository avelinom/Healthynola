import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';

// Import slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import productsSlice from './slices/productsSlice';
import customersSlice from './slices/customersSlice';
import usersSlice from './slices/usersSlice';
import activitySlice from './slices/activitySlice';
import inventorySlice from './slices/inventorySlice';
import transfersSlice from './slices/transfersSlice';
import salesSlice from './slices/salesSlice';
import expensesSlice from './slices/expensesSlice';
import rawMaterialsSlice from './slices/rawMaterialsSlice';
import recipesSlice from './slices/recipesSlice';
import batchesSlice from './slices/batchesSlice';
import categoriesSlice from './slices/categoriesSlice';
import packagingTypesSlice from './slices/packagingTypesSlice';
import warehousesSlice from './slices/warehousesSlice';
import consignmentsSlice from './slices/consignmentsSlice';

// Create a safe storage that works in both server and client
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const safeStorage = typeof window !== 'undefined' ? storage : createNoopStorage();

const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  products: productsSlice,
  customers: customersSlice,
  users: usersSlice,
  activity: activitySlice,
  inventory: inventorySlice,
  transfers: transfersSlice,
  sales: salesSlice,
  expenses: expensesSlice,
  rawMaterials: rawMaterialsSlice,
  recipes: recipesSlice,
  batches: batchesSlice,
  categories: categoriesSlice,
  packagingTypes: packagingTypesSlice,
  warehouses: warehousesSlice,
  consignments: consignmentsSlice,
});

const persistConfig = {
  key: 'root',
  storage: safeStorage,
  whitelist: ['auth', 'products', 'customers', 'users', 'activity', 'inventory', 'transfers', 'sales', 'expenses', 'rawMaterials', 'recipes', 'batches', 'categories', 'packagingTypes', 'warehouses', 'consignments'], // Persist state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
