import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '../services/api';

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
  productId?: string;
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
  extraReducers: builder => {
    builder
      .addMatcher(cartApi.endpoints.getCart.matchFulfilled, (state, action) => {
        state.items = (action.payload as any) || [];
        state.loading = false;
      })
      .addMatcher(
        cartApi.endpoints.addToCart.matchFulfilled,
        (state, action) => {
          state.items = [...state.items, action.payload as any];
          state.loading = false;
        },
      )
      .addMatcher(
        cartApi.endpoints.updateCartQuantity.matchFulfilled,
        (state, action) => {
          // Update quantity
          state.loading = false;
        },
      )
      .addMatcher(
        cartApi.endpoints.removeFromCart.matchFulfilled,
        (state, action) => {
          const productId = (action.meta.arg.originalArgs as any).productId;
          state.items = state.items.filter(item => item._id !== productId);
          state.loading = false;
        },
      );
  },
});

export const selectedItems = (state: any) => state.cart.items;

export const { increment, decrement, removeCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
