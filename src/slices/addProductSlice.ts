import { createSlice } from '@reduxjs/toolkit';
import { productsApi } from '../services/api';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProductStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  addProductStatus: 'idle',
  fetchStatus: 'idle',
};

const addProductSlice = createSlice({
  name: 'addProduct',
  initialState,
  reducers: {
    resetAddProductState: state => {
      state.fetchStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        productsApi.endpoints.getProducts.matchFulfilled,
        (state, action) => {
          state.products = (action.payload as any) || [];
          state.loading = false;
          state.fetchStatus = 'succeeded';
        },
      )
      .addMatcher(
        productsApi.endpoints.addProduct.matchFulfilled,
        (state, action) => {
          state.products.push(action.payload as any);
          state.loading = false;
          state.addProductStatus = 'succeeded';
        },
      );
  },
});

export const { resetAddProductState } = addProductSlice.actions;
export default addProductSlice.reducer;
