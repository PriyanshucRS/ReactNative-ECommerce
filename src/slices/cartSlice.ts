import { createSlice } from '@reduxjs/toolkit';
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

const extractCartItems = (payload: any): CartItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.cart?.items)) return payload.cart.items;
  return [];
};

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addMatcher(cartApi.endpoints.getCart.matchFulfilled, (state, action) => {
        state.items = extractCartItems(action.payload);
        state.loading = false;
      })
      .addMatcher(
        cartApi.endpoints.addToCart.matchFulfilled,
        (state, action) => {
          state.items = extractCartItems(action.payload);
          state.loading = false;
        },
      )
      .addMatcher(
        cartApi.endpoints.updateCartQuantity.matchFulfilled,
        (state, action) => {
          state.items = extractCartItems(action.payload);
          state.loading = false;
        },
      )
      .addMatcher(
        cartApi.endpoints.removeFromCart.matchFulfilled,
        (state, action) => {
          state.items = extractCartItems(action.payload);
          state.loading = false;
        },
      );
  },
});

export const selectedItems = (state: any) => state.cart.items;
export default cartSlice.reducer;
