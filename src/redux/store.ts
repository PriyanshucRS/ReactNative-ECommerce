import { configureStore } from '@reduxjs/toolkit';
import cartReducar from '../redux/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducar,
  },
});
