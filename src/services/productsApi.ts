import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/constants';

export interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface AddProductPayload {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async headers => {
      try {
        const {
          default: AsyncStorage,
        } = require('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.getItem('token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.log('Token retrieval error:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['Products'],
  endpoints: builder => ({
    getProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.LIST,
      providesTags: ['Products'],
    }),
    addProduct: builder.mutation<Product, AddProductPayload>({
      query: productData => ({
        url: API_ENDPOINTS.PRODUCTS.CREATE,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const { useGetProductsQuery, useAddProductMutation } = productsApi;
export default productsApi;
