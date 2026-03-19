import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      state.items.push(action.payload);
    },
    removeCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
  },
});

export const selectedItems = (state: any) => state.cart.items;
export const { addToCart, removeCart } = cartSlice.actions;
export default cartSlice.reducer;
