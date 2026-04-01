import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string | undefined;
  _id?: string;
  title?: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartStart: state => {
      state.loading = true;
    },
    addToCartSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.items || state.items;
    },
    addToCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCartStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.items || action.payload || [];
    },
    fetchCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateQuantityStart: (
      state,
      _action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      state.loading = true;
    },
    updateQuantitySuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.items || state.items;
    },
    updateQuantityFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeFromCartStart: (
      state,
      action: PayloadAction<{ productId: string }>,
    ) => {
      state.loading = true;
    },
    removeFromCartSuccess: (
      state,
      action: PayloadAction<{ productId: string }>,
    ) => {
      state.loading = false;
      state.items = state.items.filter(
        item => item.productId !== action.payload.productId,
      );
    },
    removeFromCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    increment: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrement: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(i => i.id !== action.payload);
        }
      }
    },
    removeCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: state => {
      state.items = [];
    },
  },
});

export const selectedItems = (state: any) => state.cart.items;

export const {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateQuantityStart,
  updateQuantitySuccess,
  updateQuantityFailure,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
  increment,
  decrement,
  removeCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
