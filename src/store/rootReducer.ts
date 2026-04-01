import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import addProductReducer from './slices/addProductSlice';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  addProduct: addProductReducer,
});

export default rootReducer;
