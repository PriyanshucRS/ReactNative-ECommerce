import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import authApi from '../services/authApi';
import productsApi from '../services/productsApi';
import cartApi from '../services/cartApi';
import wishlistApi from '../services/wishlistApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'addProduct', 'wishlist'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      productsApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const persistor = persistStore(store);

export { store, persistor };
