import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import addProductReducer from '../slices/addProductSlice';
import authApi from '../services/authApi';
import productsApi from '../services/productsApi';
import cartApi from '../services/cartApi';
import wishlistApi from '../services/wishlistApi';
import notificationsApi from '../services/notificationsApi';
import wishlistReducer from '../slices/wishlistSlice';

const rootReducer = combineReducers({
  authApi: authApi.reducer,
  productsApi: productsApi.reducer,
  cartApi: cartApi.reducer,
  wishlistApi: wishlistApi.reducer,
  notificationsApi: notificationsApi.reducer,
  auth: authReducer,
  cart: cartReducer,
  addProduct: addProductReducer,
  wishlist: wishlistReducer,
});

export default rootReducer;
