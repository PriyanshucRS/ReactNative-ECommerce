import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    addProductStart: state => {
      state.loading = true;
      state.addProductStatus = 'loading';
      state.error = null;
    },
    addProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.addProductStatus = 'succeeded';
    },

    addProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.addProductStatus = 'failed';
      state.error = action.payload;
    },
    fetchProductsStart: state => {
      state.loading = true;
      state.fetchStatus = 'loading';
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.fetchStatus = 'succeeded';
      state.products = action.payload;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.fetchStatus = 'failed';
      state.error = action.payload;
    },
    resetAddProductState: state => {
      state.fetchStatus = 'idle';
      state.error = null;
    },
  },
});

export const {
  addProductStart,
  addProductSuccess,
  addProductFailure,
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  resetAddProductState,
} = addProductSlice.actions;
export default addProductSlice.reducer;
