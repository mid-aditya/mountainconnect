import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import offlineReducer from './slices/offlineSlice';
import emergencyReducer from './slices/emergencySlice';

// MMKV instance for faster persistent storage
export const storage = new MMKV({ id: 'mountainconnect-storage' });

// Custom MMKV storage adapter for redux-persist
const mmkvStorage = {
  setItem: (key: string, value: string): Promise<boolean> => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string): Promise<void> => {
    storage.delete(key);
    return Promise.resolve();
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  offline: offlineReducer,
  emergency: emergencyReducer,
});

const persistConfig = {
  key: 'root',
  storage: __DEV__ ? AsyncStorage : mmkvStorage, // Use MMKV in prod for speed
  whitelist: ['auth', 'offline', 'emergency'], // Persist all slices
  blacklist: [], // Nothing is blacklisted
  timeout: 10000,
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: [
          'auth.user',
          'offline.queue',
          'emergency.currentSOS',
          'emergency.lastKnownLocation',
        ],
      },
      immutableCheck: { warnAfter: 128 },
      thunk: true,
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store, null, () => {
  console.log('[Store] Rehydration complete');
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
