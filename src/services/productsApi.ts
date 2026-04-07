import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

export interface Product {
  id?: string;
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

interface ProductsListResponse {
  success: boolean;
  products: Product[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface DeleteProductResponse {
  success: boolean;
  message: string;
}

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: builder => ({
    getProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.LIST,
      providesTags: ['Products'],
      transformResponse: (response: ProductsListResponse) =>
        response.products || [],
    }),

    getUserProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.USER,
      providesTags: ['Products'],
      transformResponse: (response: ProductsListResponse) =>
        response.products || [],
    }),

    addProduct: builder.mutation<Product, AddProductPayload>({
      query: productData => ({
        url: API_ENDPOINTS.PRODUCTS.CREATE,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
      transformResponse: (response: ProductResponse) =>
        response.product,
    }),
    deleteProduct: builder.mutation<DeleteProductResponse, string>({
      query: id => ({
        url: API_ENDPOINTS.PRODUCTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useDeleteProductMutation,
} = productsApi;
export default productsApi;
