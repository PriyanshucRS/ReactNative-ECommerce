import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import addProductReducer from '../slices/addProductSlice';
import authApi from '../services/authApi';
import productsApi from '../services/productsApi';
import cartApi from '../services/cartApi';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  authApi: authApi.reducer,
  productsApi: productsApi.reducer,
  cartApi: cartApi.reducer,
  auth: authReducer,
  cart: cartReducer,
  addProduct: addProductReducer,
});

export default rootReducer;
